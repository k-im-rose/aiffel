"""전체 흐름 (v2): 프로필 → 수집 → AI 선별 → 편집(이야기 편성) → 대본 → 사실 검증·수정 → 두 목소리 MP3 → (선택) 비공개 팟캐스트 피드

  # 저장된 대본으로 MP3만 다시 만들기 (LLM 없이)
  python -m app.pipeline --mode sample

  # 실제 실행 (--collect: 새로 수집, --publish: 비공개 피드에 올리기)
  python -m app.pipeline --mode live --collect [--publish]

  # 이미 판정한 결과를 다시 써서 편집 단계부터 (모델·프롬프트 비교용)
  python -m app.pipeline --mode live --reuse-judged outputs/20261117 --tag v2

결과 폴더 outputs/<날짜>[_태그]/
  candidates.json, candidates_judged.json  수집·판정 전체
  plan.json, selection_report.md           편성 결과와 선정 기준 점검
  script_draft.json                        사실 검증 전 대본
  script.json, script.md                   최종 대본 (출처·해석 표시)
  factcheck.json, factcheck.md, run.json   사실 검증 기록, 실행 기록
  briefing.mp3
v1 결과(편집·사실 검증 단계 없음)는 outputs/sample_v1/에 보존.
"""
from __future__ import annotations

import argparse
import json
import shutil
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv

from app import corroborate, editor, exploration, fact_check, ingest_dart, relevance_llm, script_writer, translate, tts

ROOT = Path(__file__).resolve().parent.parent
KST = timezone(timedelta(hours=9))
SAMPLE_DIR = ROOT / "outputs" / "sample"
DEFAULT_FACTS = "private/company_facts.json"   # 실제 보유 종목이 들어 있어 비공개. 데모는 demo/company_facts.json


def default_profile() -> str:
    """웹에서 수정한 프로필(userdata/profile.json)이 있으면 그것을, 없으면 원래 프로필을 쓴다."""
    return "userdata/profile.json" if (ROOT / "userdata" / "profile.json").exists() else "profiles/my_profile.json"


def latest_search(user_id: str) -> Path:
    """프로필별 검색 결과. 예전 파일(search_YYYYMMDD_*.json)은 실제 프로필(minzi) 것으로 본다."""
    files = sorted((ROOT / "data" / "raw").glob(f"search_{user_id}_*.json"))
    if not files and user_id == "minzi":
        files = sorted((ROOT / "data" / "raw").glob("search_2*.json"))
    if not files:
        raise SystemExit(f"data/raw/search_{user_id}_*.json 이 없습니다. --collect 로 먼저 수집하세요.")
    return files[-1]
SEC = {"macro": "거시경제", "industry": "산업", "stocks": "보유·관심 종목", "disclosures": "공시"}


def latest(pattern: str) -> Path:
    files = sorted((ROOT / "data" / "raw").glob(pattern))
    if not files:
        raise SystemExit(f"data/raw/{pattern} 가 없습니다. --collect 로 먼저 수집하세요.")
    return files[-1]


def in_window(it: dict, cutoff: datetime, days: float) -> str:
    """'ok' / 'future'(마감 이후 발행) / 'old'(기간 밖) / 'no_time'(발행 시각 없음 → 마감 전 발행을 보장할 수 없어 제외).
    시각은 모두 시간대가 붙은 ISO 문자열이고, 비교는 datetime으로 한다 (문자열 비교 금지: UTC·KST가 섞이면 틀린다)."""
    if not it.get("published_at"):
        return "no_time"
    pub = datetime.fromisoformat(it["published_at"])
    if pub.tzinfo is None:
        return "no_time"
    if pub > cutoff:
        return "future"
    if pub < cutoff - timedelta(days=days):
        return "old"
    return "ok"


def load_candidates(cutoff: datetime, rss_days: float, search_days: float, foreign_days: float = 0,
                    check: dict | None = None, user_id: str = "minzi") -> list[dict]:
    """수집 마감 시각(cutoff) 이전에 발행된 기사만. RSS는 마감 전 rss_days일, 종목 검색은 search_days일, 해외 원문은 foreign_days일(0이면 제외).
    같은 링크는 한 번만. 해외 기사는 맨 뒤에 둬서 국내 기사 묶음의 판정 조건이 1차 평가 때와 같게 한다.
    check에 제외 사유별 건수와 마감 이후 기사 예시를 남긴다."""
    out, seen = [], set()
    check = check if check is not None else {}
    sources = [(latest_search(user_id), search_days), (latest("news_*.json"), rss_days)]
    if foreign_days:
        sources.append((latest("foreign_*.json"), foreign_days))
    for path, days in sources:
        for it in json.loads(path.read_text(encoding="utf-8"))["items"]:
            if it["url"] in seen:
                continue
            verdict = in_window(it, cutoff, days)
            check[verdict] = check.get(verdict, 0) + 1
            if verdict == "future":
                check.setdefault("future_examples", []).append(f"{it['published_at']} {it['title'][:40]}")
            if verdict != "ok":
                continue
            seen.add(it["url"])
            out.append({**it, "category": it.get("category", "")})
    check["future_examples"] = check.get("future_examples", [])[:5]
    check["raw_files"] = [p.name for p, _ in sources]
    return out


def assert_no_future(cands: list[dict], cutoff: datetime) -> dict:
    """마지막 안전장치: 후보에 마감 이후 기사가 하나라도 있으면 중단한다."""
    future = [c for c in cands if c.get("published_at") and datetime.fromisoformat(c["published_at"]) > cutoff]
    if future:
        raise SystemExit(f"수집 마감({cutoff.isoformat()}) 이후 기사 {len(future)}건이 후보에 있습니다: {future[0]['title'][:40]}")
    pubs = [datetime.fromisoformat(c["published_at"]) for c in cands if c.get("published_at")]
    return {"candidates": len(cands), "latest_published": max(pubs).isoformat() if pubs else None,
            "future_in_candidates": 0}


def selection_md(rep: dict, plan: dict, ranked: list[dict]) -> str:
    by = {a["id"]: a for a in ranked}
    ev = rep["evidence_of_used"]
    out = ["# 오늘의 편성과 선정 기준 점검", "",
           "## 선정 기준", "",
           "1. **규칙 점수로 후보 추리기:** 중요도(high 3, medium 2, low 1) + 유형 가산(직접 1.5, 산업·정책·거시 1.0, 테마 0.3) "
           "+ 근거 수준(요약이 제목을 뒷받침 +1, 여러 소식 묶음 0, 제목만 -0.5). AI가 팟캐스트 제외로 판정한 기사와 중복 기사는 뺀다.",
           "2. **편집자(LLM)가 이야기로 편성:** 같은 사건·연결된 뉴스는 한 이야기로 묶고, 근거가 약한 기사는 빼며, 중요한 이야기에 시간을 더 준다 (최대 15분).",
           "3. **분야 균형:** 거시·산업·종목·공시를 가능한 한 각각 다루되, 근거 있는 기사가 없는 분야는 비운다.", "",
           "## 점검 결과", "",
           f"- 후보 {rep['candidates_ranked']}건 → 이야기 {rep['stories']}개 (기사 {rep['articles_used']}건 사용, 여러 기사를 묶은 이야기 {len(rep['merged_stories'])}개)",
           f"- **중요도 high 기사 {rep['high_importance_total']}건 중 {rep['high_importance_used']}건 사용** (안 쓴 기사와 이유는 아래)",
           "- 분야별 목표 시간: " + ", ".join(f"{SEC.get(k, k)} {v}초" for k, v in rep["seconds_by_section"].items())
           + f" (합계 {rep['total_target_seconds']}초)",
           f"- 사용한 기사의 근거 수준: 원문 확인 {ev['original']} / 요약 충분 {ev['full']} / 묶음 기사 {ev['bundle']} / 제목만 {ev['title_only']}",
           f"- 두 이야기에 겹쳐 쓴 기사: {len(rep['article_in_multiple_stories'])}건",
           f"- 편집자가 처리 이유를 남기지 않은 후보: {len(rep['unaccounted'])}건",
           f"- 해외 원문: 후보 {rep['foreign']['candidates']}건 중 {rep['foreign']['used']}건 사용, "
           f"해외 원문만으로 된 이야기 {len(rep['foreign']['stories_foreign_only'])}개, 국내·해외를 묶은 이야기 {len(rep['foreign']['stories_mixed'])}개, "
           f"같은 사건이라 빠진 기사 {rep['foreign']['excluded_as_duplicate']}건", "",
           "## 편성표", "", "| 순서 | 이야기 | 분야 | 목표 | 관련 종목 | 기사 수 | 선정 이유 |", "|---|---|---|---|---|---|---|"]
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        out.append(f"| {s['priority']} | {s['headline']} | {SEC[s['section']]} | {s['target_seconds']}초 | "
                   f"{', '.join(s['related_holdings']) or '-'} | {len(s['article_ids'])} | {s['why_selected']} |")
    out += ["", "## 중요 뉴스 누락 관리: 중요도 high인데 쓰지 않은 기사", "",
            "| 기사 | 사유 분류 | 메모 |", "|---|---|---|"]
    out += [f"| {d['title'] or d['id']} | {d['category']} | {d['note']} |" for d in rep["high_importance_dropped"]] or ["| 없음 | | |"]
    out += ["", "## 제외한 후보와 이유", "", "| 기사 | 이유 | 메모 |", "|---|---|---|"]
    for e in plan["excluded"]:
        out.append(f"| {by.get(e['article_id'], {}).get('title', e['article_id'])} | {e['reason']} | {e['note']} |")
    out += ["", f"편집자 메모: {plan['editor_note']}"]
    return "\n".join(out) + "\n"


def judge(args, profile, cutoff, run) -> tuple[list[dict], list[dict]]:
    check: dict = {}
    run["time_check"] = check
    if args.reuse_judged:  # 테스트용: 이전 판정을 재사용하되, 후보는 이번 마감 시각으로 다시 거른다
        src = ROOT / args.reuse_judged
        judged = json.loads((src / "candidates_judged.json").read_text(encoding="utf-8"))
        cands = load_candidates(cutoff, args.rss_days, args.search_days, args.foreign_days, check, profile.get("user_id", "minzi"))
        done = {j["article_id"] for j in judged}
        new = [c for c in cands if c["id"] not in done]
        run["selection"] = {"reused_from": args.reuse_judged, "newly_judged": len(new)}
        if new:
            t0 = time.perf_counter()
            more, calls = relevance_llm.classify(new, profile, model=args.select_model,
                                                 batch_size=args.batch_size, workers=args.workers)
            judged += more
            run["selection"].update({"seconds": round(time.perf_counter() - t0, 1), "calls": len(calls),
                                     "cost_usd": round(sum(c["cost_usd"] or 0 for c in calls), 4)})
        print(f"[1-2/6] 판정 재사용: {args.reuse_judged} (후보 {len(cands)}건, 새로 판정 {len(new)}건)", flush=True)
        return cands, judged
    if args.collect:
        import subprocess, sys
        subprocess.run([sys.executable, "-m", "app.ingest_rss"], cwd=ROOT, check=True)
        subprocess.run([sys.executable, "-m", "app.ingest_search", "--profile", args.profile], cwd=ROOT, check=True)
        if args.foreign_days:
            subprocess.run([sys.executable, "-m", "app.ingest_foreign", "--days", str(args.foreign_days)], cwd=ROOT, check=True)
    cands = load_candidates(cutoff, args.rss_days, args.search_days, args.foreign_days, check, profile.get("user_id", "minzi"))
    n_en = sum(1 for c in cands if c.get("lang") == "en")
    print(f"[1/6] 후보 기사 {len(cands)}건 (국내 {len(cands) - n_en}, 해외 원문 {n_en})", flush=True)
    t0 = time.perf_counter()
    judged, calls = relevance_llm.classify(cands, profile, model=args.select_model,
                                           batch_size=args.batch_size, workers=args.workers)
    run["selection"] = {"model": args.select_model, "seconds": round(time.perf_counter() - t0, 1),
                        "calls": len(calls), "cost_usd": round(sum(c["cost_usd"] or 0 for c in calls), 4),
                        "counts": {t: sum(1 for j in judged if j["relevance_type"] == t) for t in
                                   ["direct", "industry_policy", "theme", "macro", "uncertain", "irrelevant", "missing"]}}
    print(f"[2/6] 관련 {sum(j['selected'] for j in judged)}건 ({run['selection']['seconds']}초)", flush=True)
    return cands, judged


def run_live(args) -> Path:
    load_dotenv(ROOT / ".env")
    now = datetime.now(KST)
    # 정규 브리핑: 마감 = 실행 시각 (매일 07:35 시작). 테스트: --as-of로 마감 시각을 정하거나, 판정 재사용 시 테스트로 표시
    cutoff = datetime.fromisoformat(args.as_of).astimezone(KST) if args.as_of else now
    if cutoff.tzinfo is None:
        raise SystemExit("--as-of에는 시간대를 붙이세요. 예: 2026-11-17T07:35+09:00")
    mode = "test" if (args.as_of or args.reuse_judged) else "regular"
    profile = json.loads((ROOT / args.profile).read_text(encoding="utf-8"))
    out = ROOT / args.out_root / (f"{cutoff:%Y%m%d}" + (f"_{args.tag}" if args.tag else ""))
    out.mkdir(parents=True, exist_ok=True)
    run = {"started_at": now.isoformat(timespec="seconds"), "generated_at": now.isoformat(timespec="seconds"),
           "cutoff_at": cutoff.isoformat(timespec="seconds"), "mode": mode, "profile": args.profile, "version": "v2"}

    cands, judged = judge(args, profile, cutoff, run)
    run["time_check"].update(assert_no_future(cands, cutoff))
    print(f"      수집 마감 {cutoff:%Y-%m-%d %H:%M} KST ({'정규' if mode == 'regular' else '테스트'}) — 마감 이후 기사 "
          f"{run['time_check'].get('future', 0)}건 제외, 후보 중 마감 이후 0건", flush=True)
    (out / "candidates.json").write_text(json.dumps(cands, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "candidates_judged.json").write_text(json.dumps(judged, ensure_ascii=False, indent=1), encoding="utf-8")

    # 공시: 키가 있으면 공시 목록을 후보에 더한다 (기사와 구분해 source_type=disclosure)
    dart = ingest_dart.fetch(profile)
    run["disclosures"] = dart["status"]
    for d in dart["items"]:
        cands.append(d)
        judged.append({"article_id": d["id"], "relevance_type": "direct", "importance": "high",
                       "importance_reason": "등록 종목 공시", "related_stocks": [], "reason": "등록 종목 공시",
                       "confirmed_facts": [d["title"]], "needs_check": "", "duplicate_of": "",
                       "include_in_podcast": True, "selected": True})

    date_label = f"{cutoff:%Y년 %m월 %d일}"
    rec = editor.recover_evidence(cands, judged)
    run["evidence_recovery"] = rec
    if rec["targets"]:
        print(f"      근거 보강: high인데 제목만·묶음인 기사 {rec['targets']}건 중 원문 확인 {rec.get('original_ok', 0)}, 사실 확보 {rec.get('recovered', 0)}", flush=True)
    ranked = editor.pre_rank(cands, judged, limit=args.candidates, cutoff=cutoff)
    run["foreign_reserve_used"] = sum(1 for a in ranked if a.get("via_foreign_reserve"))
    plan, call = editor.plan(ranked, relevance_llm.profile_text(profile), date_label, model=args.edit_model)
    rep = editor.selection_report(ranked, judged, plan, pool={c["id"] for c in cands},
                                 titles={c["id"]: c["title"] for c in cands})
    run["high_importance"] = {"total": rep["high_importance_total"], "used": rep["high_importance_used"],
                              "dropped": rep["high_importance_dropped"]}
    run["edit"] = {**call, "report": {k: v for k, v in rep.items() if k != "high_importance_dropped"}}
    (out / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "selection_report.md").write_text(selection_md(rep, plan, ranked), encoding="utf-8")
    print(f"[3/6] 편성: 이야기 {rep['stories']}개, 기사 {rep['articles_used']}건, 목표 {rep['total_target_seconds']}초 "
          f"({call['seconds']}초)", flush=True)

    # 방송에 쓰는 해외 원문만 한국어로 옮긴다 (원문 제목·언론사·시각·URL은 보존)
    used = {i for s in plan["stories"] for i in s["article_ids"]}
    tr, call = translate.translate([a for a in cands if a["id"] in used])
    for a in cands:
        if a["id"] in tr:
            a["title_ko"], a["summary_ko"] = tr[a["id"]]["title_ko"], tr[a["id"]]["summary_ko"]
    run["translate"] = call
    (out / "candidates.json").write_text(json.dumps(cands, ensure_ascii=False, indent=1), encoding="utf-8")
    ex_log = exploration.build(out, cands, judged, used)
    run["exploration"] = ex_log

    facts = json.loads((ROOT / args.facts).read_text(encoding="utf-8"))
    articles = {a["id"]: a for a in cands}

    # 중요 이야기 원문 대조 (여러 매체 묶음·high·상위 이야기). 원문은 저장하지 않는다
    if not args.no_corroborate:
        plan, cb_log = corroborate.run(plan, articles, {j["article_id"]: j for j in judged}, model=args.check_model)
        for x in cb_log["results"]:
            for f in x["confirmed_facts"]:
                for i in f["source_ids"]:
                    if i in articles:
                        articles[i].setdefault("verified_facts", []).append(f["fact"])
        run["corroborate"] = {k: v for k, v in cb_log.items() if k not in ("results", "access")}
        (out / "corroboration.md").write_text(corroborate.to_markdown(cb_log, plan, articles), encoding="utf-8")
        (out / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"      원문 대조: 이야기 {cb_log['stories_checked']}개, 원문 확인 {cb_log['original_ok']}/{cb_log['articles']}건 "
              f"({cb_log['call']['seconds']}초)", flush=True)
    script, call = script_writer.write(
        plan, articles, date_label, facts, model=args.script_model, profile=profile,
        disclosures_note=f"OpenDART 공시 목록: {dart['status']}. 조회하지 못한 날은 수주 공시 기사만 다루고, 조회 실패는 방송에서 말하지 않는다 (텍스트 리포트에 기록됨).")
    (out / "script_draft.json").write_text(json.dumps(script, ensure_ascii=False, indent=1), encoding="utf-8")
    run["script"] = call
    print(f"[4/6] 대본 초안 {len(script['lines'])}줄 ({call['seconds']}초)", flush=True)

    names = [n for c in facts["companies"] for n in [c["name"], *c.get("aliases", [])]]
    names += [x["name"] for x in profile.get("stocks", []) if x["name"] not in names]
    script, fc_log = fact_check.run(script, articles, facts, script_writer.facts_text(facts), model=args.check_model,
                                    entity_names=names)
    run["fact_check"] = {"final": fc_log["final"], "rounds": len(fc_log["rounds"]),
                         "seconds": round(sum(r["call"]["seconds"] for r in fc_log["rounds"]), 1)}
    (out / "factcheck.json").write_text(json.dumps(fc_log, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "factcheck.md").write_text(fact_check.to_markdown(fc_log), encoding="utf-8")
    report = script_writer.validate(script, set(articles))
    run["script"]["validation"] = report
    (out / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1), encoding="utf-8")
    md = script_writer.to_markdown(script, articles, report)
    head = (f"\n> {'정규 브리핑' if mode == 'regular' else '테스트 브리핑'} · 실제 생성 {now:%Y-%m-%d %H:%M} KST · "
            f"뉴스 수집 마감 {cutoff:%Y-%m-%d %H:%M} KST (이 시각 이후 발행 기사 제외)\n")
    md = md.replace("\n", "\n" + head, 1)
    (out / "script.md").write_text(md, encoding="utf-8")
    print(f"      출처-주장 일치: 수정 전 {len(fc_log['alignment']['issues_before'])}문장 → 수정 후 {fc_log['final']['alignment_issues']}문장", flush=True)
    print(f"[5/6] 사실 검증 {len(fc_log['rounds'])}회: 최종 중대 오류 {fc_log['final']['critical_issues']}건, "
          f"경미 {fc_log['final']['minor_issues']}건 / 예상 길이 {report['est_seconds'] // 60}분", flush=True)

    audio = tts.synthesize(script, out / "briefing.mp3")
    run["audio"] = audio
    run["finished_at"] = datetime.now(KST).isoformat(timespec="seconds")
    print(f"[6/6] MP3 {audio['bytes'] // 1024}KB, 약 {audio['approx_seconds'] // 60}분 {audio['approx_seconds'] % 60}초", flush=True)
    (out / "run.json").write_text(json.dumps(run, ensure_ascii=False, indent=1), encoding="utf-8")

    if args.export:
        from app import export_web
        prof_path = ROOT / args.profile
        ud = prof_path.parent if prof_path.parent.name == "userdata" else ROOT / "userdata"  # 중복 추천 방지용 (읽기만)
        export_web.export(out, profile_path=prof_path, userdata=ud)
        print("웹 데이터:", (out / "briefing.json").relative_to(ROOT))
        # 정규 실행(07:35)만, 승인 관문을 모두 통과하면 그날의 승인판으로 자동 등록한다. 테스트 실행은 기록으로만 남는다
        from app import release
        why = release.gate(out)
        if mode == "regular" and not why:
            release.approve(out.parent, out.name, by="auto", note="정규 실행, 승인 관문 통과")
            print("승인판으로 등록:", out.name)
        else:
            print("개발·평가 기록으로 보관 (승인판 아님):", "테스트 실행" if mode != "regular" else " / ".join(why))
    if args.publish:
        from app import podcast_feed
        print("피드 갱신:", podcast_feed.publish(out))
    return out


def run_sample() -> Path:
    """저장된 대본으로 MP3만 다시 만든다. LLM 없이 재현할 수 있게 하기 위한 모드."""
    script = json.loads((SAMPLE_DIR / "script.json").read_text(encoding="utf-8"))
    out = ROOT / "outputs" / "sample_rerun"
    out.mkdir(parents=True, exist_ok=True)
    shutil.copy(SAMPLE_DIR / "script.md", out / "script.md")
    audio = tts.synthesize(script, out / "briefing.mp3")
    print(f"MP3 {audio['bytes'] // 1024}KB → {out.relative_to(ROOT)}/briefing.mp3")
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description="개인화 투자 뉴스 → AI 팟캐스트")
    ap.add_argument("--mode", choices=["live", "sample"], default="live")
    ap.add_argument("--collect", action="store_true", help="실행 전에 RSS·검색을 새로 수집")
    ap.add_argument("--publish", action="store_true", help="비공개 팟캐스트 피드에 올린다 (.env 설정 필요)")
    ap.add_argument("--profile", default=None, help="기본: userdata/profile.json(웹에서 수정한 프로필) → 없으면 profiles/my_profile.json")
    ap.add_argument("--facts", default=DEFAULT_FACTS, help="기업 기본 사실표")
    ap.add_argument("--out-root", default="outputs", help="결과 폴더 (가상 데모는 demo/outputs)")
    ap.add_argument("--export", action="store_true", help="끝나면 웹용 briefing.json도 만든다")
    ap.add_argument("--select-model", default="haiku")
    ap.add_argument("--edit-model", default="sonnet")
    ap.add_argument("--script-model", default="sonnet")
    ap.add_argument("--check-model", default="sonnet")
    ap.add_argument("--rss-days", type=int, default=1)
    ap.add_argument("--search-days", type=int, default=7)
    ap.add_argument("--foreign-days", type=int, default=2, help="해외 원문 수집 기간 (0이면 해외 뉴스 제외)")
    ap.add_argument("--batch-size", type=int, default=25)
    ap.add_argument("--workers", type=int, default=5)
    ap.add_argument("--candidates", type=int, default=40, help="편집자에게 넘길 후보 수")
    ap.add_argument("--reuse-judged", default=None, help="이전 실행 폴더의 판정 결과를 다시 쓴다")
    ap.add_argument("--tag", default=None, help="결과 폴더 이름 뒤에 붙일 표시")
    ap.add_argument("--no-corroborate", action="store_true", help="원문 대조 단계 생략")
    ap.add_argument("--as-of", default=None, help="테스트: 수집 마감 시각 (예: 2026-11-17T07:35+09:00). 이 시각 이후 발행 기사는 제외")
    args = ap.parse_args()
    args.profile = args.profile or default_profile()
    out = run_sample() if args.mode == "sample" else run_live(args)
    print("완료:", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
