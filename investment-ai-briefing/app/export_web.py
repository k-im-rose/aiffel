"""브리핑 결과 폴더 → 웹용 briefing.json (그내종 ②~⑥, ⑧-B 섹션 데이터).

원칙
- 핵심 뉴스와 AI 추천은 **검증을 거친 브리핑 데이터**(편성표, 원문 대조, 사실 검증 뒤 대본)에서만 만든다. 새로 기사를 찾지 않는다.
- 기사에서 확인된 사실(facts)과 AI 해석(interpretation, thesis_impact)을 다른 필드로 둔다.
- 경제 개념은 한국은행 『경제금융용어 800선』에 수록된 용어만 고른다. 정의는 짧게 인용하고 쪽수를 단다.
  수록되지 않은 내용을 한국은행 정의처럼 표시하지 않는다.
- AI 추천 점검 항목은 사용자 목록과 겹치지 않게 하고, 출처에 없는 날짜는 만들지 않는다. 사용자 목록에 자동으로 넣지 않는다.
- 사용자 데이터(프로필·메모·점검 목록)는 여기서 쓰지 않는다 (읽기만: 중복 추천 방지).

  python -m app.export_web outputs/20261117_asof0735 [--profile userdata/profile.json] [--userdata userdata]
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

from app import focus, glossary, links, llm

ROOT = Path(__file__).resolve().parent.parent
SEC = {"macro": "거시경제", "industry": "산업", "stocks": "보유·관심 종목", "disclosures": "공시"}

SYSTEM = """당신은 개인 투자자용 리서치 페이지의 편집자입니다. 이미 사실 검증을 마친 오늘의 브리핑 편성표를 받아,
페이지에 들어갈 보조 내용을 만듭니다. 새로운 사실을 만들지 않습니다. 매수·매도 권유, 목표가, 주가 예측을 하지 않습니다.
편성표의 '출처에서 확인되지 않은 내용'은 어떤 칸에도 사실처럼 쓰지 않습니다 (해석·추천의 전제로도 쓰지 않습니다).

0. headline (이야기별): 편성표 제목을 '출처에서 확인되지 않은 내용'을 빼고 다시 쓴 것 (문제가 없으면 그대로).
   interpretation (이야기별): 편집자 해석을 '출처에서 확인되지 않은 내용'을 빼고 다시 쓴 것. 사실과 섞지 말고 해석임이 드러나게.

1. thesis_impact (이야기별): 관련 보유·관심 종목마다, 오늘 소식이 그 종목의 '투자 이유'를
   strengthens(강화) / risk(위험 요인) / unclear(아직 판단하기 어려움) 중 무엇에 가까운지와 이유 한두 문장.
   이유는 해석이므로 "~일 수 있다"로 씁니다. 실적·사업 구조·정책 적용 대상이 확인되지 않았으면 unclear를 쓰고, 수혜 기업이라고 단정하지 않습니다.
   to_verify: 그 판단을 확정하려면 실제로 확인할 것 (예: 해당 제품의 매출 비중, 고객사 관계, 정책 적용 대상 여부, 다음 실적의 특정 수치) 1~2개.
   관련 종목이 없으면 빈 목록.
2. economy_impact (이야기별): 경제·산업에 미칠 수 있는 영향 한두 문장 (해석).
3. concept: 주어진 '800선 후보 용어' 중 오늘 뉴스를 이해하는 데 가장 도움이 되는 1개. 후보에 없는 용어는 고르지 않습니다.
   관련성이 약하면 null을 돌려줍니다.
   - plain: 한국은행 정의(주어진 원문)를 바탕으로 한 쉬운 설명 2문장 (정의에 없는 내용 추가 금지)
   - in_today_news: 오늘 어떤 뉴스에서 어떤 의미인지
   - for_investing: 투자 분석에서 어떻게 볼 수 있는지 (일반론, 특정 종목 권유 금지)
4. quiz: 1문항. 정의 암기가 아니라 현상 이해를 묻습니다 (예: "코픽스가 오르면 변동금리 대출에 어떤 영향이 있을 수 있나?").
   객관식 4지선다, 정답 번호(0부터), 해설.
5. ai_checks: 2~5개. 오늘 뉴스와 그 종목의 투자 이유에서 직접 나온, 구체적으로 확인할 일.
   - 일반적인 할 일("뉴스 확인하기", "실적 확인")은 쓰지 않습니다. 무엇을, 왜, 어떤 근거 기사에서 나왔는지가 드러나야 합니다.
   - when: 출처 기사에 날짜·일정이 명시된 경우에만 그 날짜. 없으면 "다음 관련 공시·발표 때"처럼 조건으로 쓰고, 날짜를 만들지 않습니다.
   - '이미 사용자 목록에 있는 항목'과 같은 내용은 추천하지 않습니다."""

SCHEMA = {
    "type": "object",
    "properties": {
        "stories": {"type": "array", "items": {"type": "object", "properties": {
            "priority": {"type": "integer"},
            "headline": {"type": "string"},
            "interpretation": {"type": "string"},
            "economy_impact": {"type": "string"},
            "thesis_impact": {"type": "array", "items": {"type": "object", "properties": {
                "stock": {"type": "string"}, "stance": {"type": "string", "enum": ["strengthens", "risk", "unclear"]},
                "reason": {"type": "string"}, "to_verify": {"type": "string"}},
                "required": ["stock", "stance", "reason", "to_verify"], "additionalProperties": False}},
        }, "required": ["priority", "headline", "interpretation", "economy_impact", "thesis_impact"], "additionalProperties": False}},
        "concept": {"anyOf": [{"type": "null"}, {"type": "object", "properties": {
            "term": {"type": "string"}, "plain": {"type": "string"}, "in_today_news": {"type": "string"},
            "for_investing": {"type": "string"}, "related_story": {"type": "integer"}},
            "required": ["term", "plain", "in_today_news", "for_investing", "related_story"], "additionalProperties": False}]},
        "quiz": {"anyOf": [{"type": "null"}, {"type": "object", "properties": {
            "question": {"type": "string"}, "choices": {"type": "array", "items": {"type": "string"}},
            "answer": {"type": "integer"}, "explanation": {"type": "string"}, "based_on": {"type": "string"}},
            "required": ["question", "choices", "answer", "explanation", "based_on"], "additionalProperties": False}]},
        "ai_checks": {"type": "array", "items": {"type": "object", "properties": {
            "target": {"type": "string"}, "task": {"type": "string"}, "reason": {"type": "string"},
            "source_ids": {"type": "array", "items": {"type": "string"}}, "when": {"type": "string"}},
            "required": ["target", "task", "reason", "source_ids", "when"], "additionalProperties": False}},
    },
    "required": ["stories", "concept", "quiz", "ai_checks"], "additionalProperties": False,
}


def _load(p: Path, default=None):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


def _src(a: dict) -> dict:
    return {"id": a["id"], "title": a["title"], "title_ko": a.get("title_ko"), "source": a["source"],
            "published_at": a.get("published_at"), "url": a["url"], "lang": a.get("lang", "ko")}


def _norm(s: str) -> str:
    return re.sub(r"[\W_]+", "", s).lower()


def _similar(a: str, b: str) -> bool:
    ta, tb = set(re.findall(r"[가-힣A-Za-z0-9]{2,}", a)), set(re.findall(r"[가-힣A-Za-z0-9]{2,}", b))
    return bool(ta and tb) and len(ta & tb) / min(len(ta), len(tb)) >= 0.6


def not_aired(out: Path, cands: dict, judged: dict, plan: dict, run: dict) -> dict:
    """④ 방송에 담지 못한 뉴스: 전체 나열 대신 네 갈래로 몇 건씩만."""
    used = {i for s in plan["stories"] for i in s["article_ids"]}
    ex = {e["article_id"]: e for e in plan.get("excluded", [])}

    def item(i, note):
        j = judged.get(i, {})
        return {**_src(cands[i]), "relevance_type": j.get("relevance_type"), "importance": j.get("importance"),
                "ai_reason": j.get("reason", ""), "note": note}
    relevant = [item(i, e["note"]) for i, e in ex.items() if i in cands and e["reason"] == "lower_priority"
                and judged.get(i, {}).get("relevance_type") in ("direct", "industry_policy", "macro")
                and judged.get(i, {}).get("importance") in ("high", "medium")][:5]
    weak = [item(d["id"], f"{d['category']}. {d.get('note', '')}".strip()) for d in run.get("high_importance", {}).get("dropped", [])
            if d["id"] in cands][:3]
    industry = [item(i, e["note"]) for i, e in ex.items() if i in cands and judged.get(i, {}).get("relevance_type") == "theme"
                and judged.get(i, {}).get("importance") in ("high", "medium")][:3]
    picked = _load(out / "exploration_picked.json", {"candidates": [], "none_reason": "탐색 후보 파일 없음"})
    ideas = [{**c, "sources": [_src(cands[i]) for i in c["article_ids"] if i in cands]} for c in picked["candidates"]]
    return {
        "relevant_but_cut": {"label": "투자 관련성이 높지만 분량 때문에 뺀 뉴스 (기사 사실)", "items": relevant},
        "important_but_weak": {"label": "중요하지만 아직 근거가 부족한 뉴스 (확인 필요)", "items": weak},
        "industry_watch": {"label": "따로 살펴볼 만한 산업 변화 (관심 테마 기사)", "items": industry},
        "idea_hypotheses": {"label": "새로운 투자 아이디어의 단서 (AI 탐색 가설, 확인된 투자 기회 아님)",
                            "items": ideas, "none_reason": picked.get("none_reason", "")},
    }


def annotate_evidence(data: dict, script: dict, cands: dict, run: dict) -> dict:
    """확인된 사실마다 근거 수준(기자 본문 / 공개된 일부 본문 / 원문 확인 불가·요약 기준)을 붙이고,
    검증 결과에 범위를 적는다. 모델 없이 결정적으로 계산하므로 이전 실행에도 다시 적용할 수 있다."""
    from app import fact_check
    from app.corroborate import fetch_text
    access = dict((run.get("corroborate") or {}).get("access") or {})

    def status(i):
        if i not in access:
            a = cands.get(i) or {}
            access[i] = fetch_text(a["url"])[0] if a.get("url") else "none"
        return access[i]

    def level(ids):
        sts = [status(i) for i in ids if i in cands]
        return "no_source" if not sts else "original" if "ok" in sts else "partial" if "partial" in sts else "summary_only"
    for s in data["stories"]:
        for f in s["facts"]:
            f["basis"] = level(f["source_ids"])
    fc = dict(data["checks"].get("fact_check") or {})
    if "evidence" not in fc:  # 새 검증 단계 이전 실행: 최종 대본으로 다시 계산
        for a in cands.values():
            if a["id"] in access:
                a["original_access"] = access[a["id"]]
        fc["evidence"] = fact_check.evidence_levels(script, cands)["counts"]
        fc["official_check"] = "not_done"
    fc["scope"] = fact_check.SCOPE_NOTE
    data["checks"]["fact_check"] = fc
    data["checks"]["evidence_labels"] = fact_check.EVIDENCE_LEVELS
    return data


def export(out: Path, *, profile_path: Path, userdata: Path | None = None, model: str = "sonnet") -> dict:
    run = _load(out / "run.json")
    plan = _load(out / "plan.json")
    script = _load(out / "script.json")
    cands = {a["id"]: a for a in _load(out / "candidates.json", [])}
    judged = {j["article_id"]: j for j in _load(out / "candidates_judged.json", [])}
    profile = _load(profile_path, {})
    if not (out / "exploration_picked.json").exists():  # 탐색 후보 파일이 없던 이전 실행
        from app import exploration
        exploration.build(out, list(cands.values()), list(judged.values()),
                          {i for s in plan["stories"] for i in s["article_ids"]})
    user_checks = _load((userdata or ROOT / "userdata") / "checks.json", [])

    # 800선 후보 용어: 대본·편성표에 실제로 나온 용어 (상위 8개)
    text = " ".join(l["text"] for l in script["lines"]) + " " + " ".join(
        s["headline"] + " " + " ".join(f["fact"] for f in s["key_facts"]) for s in plan["stories"])
    terms = glossary.find_in_text(text)[:8]
    # '확인된 사실'에는 출처(제목·실제로 읽히는 원문)에서 숫자·기업명이 확인되는 문장만 둔다
    from app import fact_check
    facts_file = ROOT / ("demo/company_facts.json" if profile.get("user_id") == "demo" else "private/company_facts.json")
    names = [n for c in _load(facts_file, {"companies": []})["companies"] for n in [c["name"], *c.get("aliases", [])]]
    names += [x["name"] for x in profile.get("stocks", []) if x["name"] not in names]

    def checked(text, ids):
        return not fact_check.missing_in_sources(text, [cands[i] for i in ids if i in cands], names)
    stories_in = []
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        c = s.get("corroboration") or {}
        stories_in.append(
            f"## [{s['priority']}] {s['headline']} | 관련 종목: {', '.join(s['related_holdings']) or '-'}\n"
            f"확인된 사실: " + " / ".join(f"{f['fact']} ({f['source_id']})" for f in s["key_facts"] if checked(f["fact"], [f["source_id"]])) + "\n"
            + (("원문 대조로 확인: " + " / ".join(f"{f['fact']} ({', '.join(f['source_ids'])})" for f in links.story_facts(s, c)
                                            if checked(f["fact"], f["source_ids"])) + "\n") if c else "")
            + (("출처에서 확인되지 않은 내용 (쓰지 말 것): " + " / ".join(f["fact"] for f in s["key_facts"] if not checked(f["fact"], [f["source_id"]])) + "\n")
               if any(not checked(f["fact"], [f["source_id"]]) for f in s["key_facts"]) else "")
            + f"편집자 해석: {s['interpretation']}\n더 볼 것: {s['follow_up']}\n"
            + "출처: " + "; ".join(f"{i} {cands[i]['title']} ({(cands[i].get('published_at') or '')[:10]})" for i in s["article_ids"] if i in cands))
    prof_lines = [f"- {x['name']} ({'보유' if x.get('status') == 'held' else '관심'}): 투자 이유 = {x.get('thesis', '')}"
                  + (f" / 확인하고 싶은 위험 = {', '.join(x['risks'])}" if x.get("risks") else "")
                  + (f" / AI에게 특히 확인받고 싶은 것 = {x['ask_ai']}" if x.get("ask_ai") else "")
                  + focus.tag(x) for x in profile.get("stocks", [])]
    prompt = ("# 투자 프로필\n" + "\n".join(prof_lines) + "\n\n# 오늘의 편성표 (사실 검증 완료)\n" + "\n\n".join(stories_in)
              + "\n\n# 800선 후보 용어 (한국은행 정의 원문)\n"
              + ("\n".join(f"- {t['term']} (책 {t['book_page']}쪽): {t['definition'][:700]}" for t in terms) or "(없음)")
              + "\n\n# 이미 사용자 목록에 있는 항목\n" + ("\n".join(f"- {c['text']}" for c in user_checks) or "(없음)"))
    system = SYSTEM + (focus.EXPORT_RULE if focus.names(profile) else "")
    r = llm.call(prompt, system=system, schema=SCHEMA, model=model, effort="medium")
    extra = r.data

    # 검증: 개념은 800선 후보 안에서만, 출처 id는 실재, 추천은 사용자 목록과 중복 제거, 날짜는 출처에 있는 것만
    concept = extra.get("concept")
    if concept:
        hit = next((t for t in terms if _norm(t["term"]) == _norm(concept["term"]) or _norm(t["base"]) == _norm(concept["term"])), None)
        concept = None if hit is None else {**concept, "term": hit["term"], "book_page": hit["book_page"],
                                            "bok_quote": glossary.short_quote(hit["definition"]), "source": glossary.SOURCE,
                                            "note": "인용은 한국은행 원문 첫 문장, 나머지 설명은 AI가 그 정의를 바탕으로 쓴 것"}
    quiz = extra.get("quiz")
    if quiz and not (0 <= quiz["answer"] < len(quiz["choices"])):
        quiz = None
    src_text = {i: (a["title"] + " " + (a.get("summary") or "")) for i, a in cands.items()}
    checks = []
    for n, c in enumerate(extra.get("ai_checks", [])):
        c["source_ids"] = [i for i in c["source_ids"] if i in cands]
        if not c["source_ids"] or any(_similar(c["task"], u["text"]) for u in user_checks):
            continue
        dates = re.findall(r"\d{1,2}월\s?\d{1,2}일|\d{4}-\d{2}-\d{2}|\d{1,2}일", c["when"])
        if dates and not any(d.replace(" ", "") in src_text[i].replace(" ", "") for d in dates for i in c["source_ids"]):
            c["when"] = "시점 미확인 (출처에 날짜 없음)"
        checks.append({"id": f"ai-{run['cutoff_at'][:10]}-{n}", **c, "sources": [_src(cands[i]) for i in c["source_ids"]]})

    # 숫자 점검: 개념·퀴즈·추천에 나온 숫자가 오늘 출처(제목·요약·원문 대조 사실)에 없으면 표시한다
    pool_text = " ".join(src_text.values()) + " " + json.dumps(plan, ensure_ascii=False)
    def unverified_numbers(obj) -> list[str]:
        nums = re.findall(r"\d+(?:[.,]\d+)?", json.dumps(obj, ensure_ascii=False))
        return sorted({n for n in nums if len(n.replace(",", "").replace(".", "")) >= 2 and n not in pool_text})
    number_check = {"concept": unverified_numbers({k: v for k, v in (concept or {}).items() if k in ("in_today_news", "for_investing")}),
                    "quiz": unverified_numbers(quiz or {}),
                    "ai_checks": unverified_numbers([{k: c[k] for k in ("task", "reason", "when")} for c in checks])}

    impacts = {x["priority"]: x for x in extra.get("stories", [])}
    stories = []
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        c = s.get("corroboration") or {}
        # 이 이야기에 넣은 근거가 모두 출처에서 확인되지 않은 기사는 이야기에서 뺀다 (엉뚱한 기사가 근거처럼 보이지 않게)
        kept_src = {f["source_id"] for f in s["key_facts"] if checked(f["fact"], [f["source_id"]])}
        bad_src = {f["source_id"] for f in s["key_facts"]} - kept_src
        s = {**s, "article_ids": [i for i in s["article_ids"] if i not in bad_src]}
        # 원문 대조 사실은 이 이야기의 기사에서 나온 것만 (다른 이야기의 대조 결과가 섞이지 않게, app/links.py)
        c = {**c, "confirmed_facts": links.story_facts(s, c)}
        stories.append({
            "priority": s["priority"], "headline": impacts.get(s["priority"], {}).get("headline") or s["headline"],
            "section": SEC.get(s["section"], s["section"]),
            "facts": [{"text": f["fact"], "source_ids": [f["source_id"]]} for f in s["key_facts"]
                      if f["source_id"] in s["article_ids"] and checked(f["fact"], [f["source_id"]])]
                     + [{"text": f["fact"], "source_ids": f["source_ids"], "from_original": True} for f in c.get("confirmed_facts", [])
                        if checked(f["fact"], f["source_ids"])],
            "facts_removed": [f["fact"] for f in s["key_facts"] if not checked(f["fact"], [f["source_id"]])],
            "same_event": c.get("same_event"), "unverified": c.get("unverified", []),
            "sources_removed": [cands[i]["title"] for i in bad_src if i in cands],
            "interpretation": impacts.get(s["priority"], {}).get("interpretation") or s["interpretation"],
            "economy_impact": impacts.get(s["priority"], {}).get("economy_impact", ""),
            "related_holdings": s["related_holdings"], "thesis_impact": impacts.get(s["priority"], {}).get("thesis_impact", []),
            "follow_up": s["follow_up"], "sources": [_src(cands[i]) for i in s["article_ids"] if i in cands]})

    audio = run.get("audio", {})
    data = {
        "schema_version": 1,
        "service": "그내종", "content_name": "오늘의 브리핑",
        "date": run["cutoff_at"][:10], "title": script["title"],
        "mode": run.get("mode"), "generated_at": run.get("generated_at") or run.get("started_at"),
        "cutoff_at": run["cutoff_at"], "profile_label": "가상 데모 프로필" if profile.get("user_id") == "demo" else "내 프로필",
        "is_demo": profile.get("user_id") == "demo",
        "audio": {"file": "briefing.mp3", "seconds": audio.get("approx_seconds"), "bytes": audio.get("bytes")},
        "checks": {"fact_check": run.get("fact_check", {}).get("final"), "corroborate": run.get("corroborate"),
                   "high_importance": {k: run.get("high_importance", {}).get(k) for k in ("total", "used")}},
        "stories": stories,
        "not_aired": not_aired(out, cands, judged, plan, run),
        "concept": concept, "quiz": quiz, "ai_checks": checks,
        "reports": [p.name for p in out.glob("*.md")],
        "number_check": number_check,
        **({"revision": run["revision"]} if run.get("revision") else {}),
        "export": {"model": r.model, "seconds": round(r.seconds, 1), "cost_usd": r.cost_usd,
                   "glossary_candidates": [t["term"] for t in terms], "at": datetime.now().isoformat(timespec="seconds")},
    }
    annotate_evidence(data, script, cands, run)
    (out / "briefing.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    return data


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir")
    ap.add_argument("--profile", default="userdata/profile.json")
    ap.add_argument("--userdata", default="userdata")
    a = ap.parse_args()
    d = export(ROOT / a.run_dir, profile_path=ROOT / a.profile, userdata=ROOT / a.userdata)
    print(json.dumps({"stories": len(d["stories"]), "concept": d["concept"] and d["concept"]["term"],
                      "quiz": bool(d["quiz"]), "ai_checks": len(d["ai_checks"]),
                      "glossary_candidates": d["export"]["glossary_candidates"]}, ensure_ascii=False))
