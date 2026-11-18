"""편집 단계: 선별된 관련 기사 → 오늘 방송할 '이야기' 목록.

선별(관련 여부 판정)과 방송 편성은 다른 일이다. 관련 기사 155건을 모두 말할 수 없으므로
1) 규칙으로 후보를 줄이고 (pre_rank)
2) LLM 편집자가 같은 사건·연결된 뉴스를 한 이야기로 묶고, 근거가 약한 기사를 빼고, 이야기별 시간을 배분한다.
뺀 기사도 이유와 함께 남겨서 "중요한 뉴스를 놓치지 않았는가"를 나중에 확인할 수 있게 한다.
"""
from __future__ import annotations

import re

from app import focus as focus_mod, indicators, llm

INDICATOR_BONUS = 1.0  # 주요 거시지표 발표 결과 기사 (app/indicators.py가 표시)
IMP = {"high": 3, "medium": 2, "low": 1}
TYPE_BONUS = {"direct": 1.5, "industry_policy": 1.0, "macro": 1.0, "theme": 0.3, "uncertain": 0.0}
BUNDLE_RE = re.compile(r"^\[(밤 사이 해외뉴스|오늘의 증권가 콜|마켓라이브|개장시황|마감시황)")


def evidence(a: dict) -> str:
    """근거 수준: original(원문에서 사실을 확인) / full(요약이 제목 내용을 뒷받침) / bundle(여러 소식 묶음) / title_only"""
    if a.get("original_facts"):
        return "original"
    if not (a.get("summary") or "").strip():
        return "title_only"
    if BUNDLE_RE.search(a["title"]) or a["summary"].lstrip().startswith("..."):
        return "bundle"
    return "full"


EVIDENCE_SCORE = {"original": 1.0, "full": 1.0, "bundle": 0.0, "title_only": -0.5}


def personal_score(a: dict, cutoff=None, focus: set[str] | None = None) -> float:
    """개인화·시의성 가산: 보유·관심 종목과 연결 +0.5, 마감 전 24시간 안 발행 +0.3.
    국내·해외 순서가 아니라 이 값으로 동점을 가른다."""
    from datetime import datetime, timedelta
    s = 0.5 if a.get("related_stocks") else 0.0
    if focus and focus & set(a.get("related_stocks") or []):  # 집중 분석 종목과 실제로 연결된 기사만 작은 가점 (없으면 0)
        s += focus_mod.FOCUS_BONUS
    if cutoff and a.get("published_at"):
        if datetime.fromisoformat(a["published_at"]) >= cutoff - timedelta(hours=24):
            s += 0.3
    return s


def pre_rank(cands: list[dict], judged: list[dict], limit: int = 40, reserve_foreign: int = 15,
             cutoff=None, focus: set[str] | None = None) -> list[dict]:
    """규칙 점수 = 중요도 + 유형 가산 + 근거 수준 + 개인화·시의성. AI가 넣지 말라고 한 기사·중복은 제외.
    해외 원문 자리(reserve_foreign)는 안전장치로 유지한다: 개인화 점수를 넣은 뒤에도 해외가 밀리는지 run.json에 기록해 본다."""
    by = {a["id"]: a for a in cands}
    rows = []
    for j in judged:
        if j["relevance_type"] not in TYPE_BONUS or not j.get("include_in_podcast") or j.get("duplicate_of"):
            continue
        if j["article_id"] not in by:  # 수집 마감 밖 기사
            continue
        a = {**by[j["article_id"]], **{k: v for k, v in j.items() if k != "article_id"}}
        a["evidence"] = evidence(a)
        a["personal"] = personal_score(a, cutoff, focus)
        a["score"] = IMP[j["importance"]] + TYPE_BONUS[j["relevance_type"]] + EVIDENCE_SCORE[a["evidence"]] + a["personal"]
        if (a.get("indicator") or {}).get("status") == "released":
            a["score"] += INDICATOR_BONUS
        rows.append(a)
    rows.sort(key=lambda a: (-a["score"], -a["personal"], a.get("published_at") and -datetime_ts(a["published_at"]) or 0))
    top = rows[:limit]
    extra = [a for a in rows[limit:] if a.get("lang") == "en"][:reserve_foreign]
    for a in extra:
        a["via_foreign_reserve"] = True
    return top + extra


def datetime_ts(s: str) -> float:
    from datetime import datetime
    return datetime.fromisoformat(s).timestamp()


RECOVER_SYSTEM = """기사 원문에서 핵심 사실만 한국어로 2~4개 뽑습니다. 수치·날짜·주체를 원문 그대로 정확히 씁니다.
원문에 없는 내용, 해석, 전망은 쓰지 않습니다. 원문이 제목과 다른 내용(여러 소식 묶음)이면 제목 주제에 해당하는 사실만 뽑고, 없으면 빈 목록."""
RECOVER_SCHEMA = {"type": "object", "properties": {"items": {"type": "array", "items": {
    "type": "object", "properties": {"id": {"type": "string"}, "facts": {"type": "array", "items": {"type": "string"}}},
    "required": ["id", "facts"], "additionalProperties": False}}}, "required": ["items"], "additionalProperties": False}


def recover_evidence(cands: list[dict], judged: list[dict], *, model: str = "haiku") -> dict:
    """중요도 high인데 제목만 있거나 묶음 기사인 것: 원문을 읽어 핵심 사실을 확보한다 (원문은 저장하지 않음).
    11/17 실행에서 high 기사 3건이 빠진 이유 중 2건이 '제목만 있어 규칙 점수에서 잘림'이었다."""
    from app import corroborate, llm
    by = {a["id"]: a for a in cands}
    targets = [by[j["article_id"]] for j in judged if j["importance"] == "high" and j["article_id"] in by
               and j["relevance_type"] in TYPE_BONUS and evidence(by[j["article_id"]]) in ("title_only", "bundle")]
    if not targets:
        return {"targets": 0}
    texts = {a["id"]: corroborate.fetch_text(a["url"]) for a in targets}
    ok = [a for a in targets if texts[a["id"]][0] in ("ok", "partial")]
    log = {"targets": len(targets), "original_ok": len(ok), "recovered": 0,
           "status": {a["title"][:50]: texts[a["id"]][0] for a in targets}}
    if ok:
        prompt = "\n\n".join(f"### id: {a['id']}\n제목: {a['title']}\n원문: {texts[a['id']][1]}" for a in ok)
        r = llm.call(prompt, system=RECOVER_SYSTEM, schema=RECOVER_SCHEMA, model=model)
        for x in r.data["items"]:
            if x["id"] in by and x["facts"]:
                by[x["id"]]["original_facts"] = x["facts"]
                log["recovered"] += 1
        log["call"] = {"seconds": round(r.seconds, 1), "cost_usd": r.cost_usd}
    return log


SYSTEM = """당신은 개인 투자자를 위한 아침 오디오 브리핑의 편집자입니다. AI가 관련 있다고 고른 기사 후보를 받아 오늘 방송할 이야기를 정합니다.

편성 원칙
1. 중요한 것부터: 보유·관심 종목의 실적·공시·계약, 투자 논리에 영향을 주는 산업·정책 변화, 시장 전체를 움직이는 거시 변화(금리·환율·물가·주요 정책) 순으로 봅니다.
2. 같은 사건이나 서로 연결된 뉴스(예: 美 수출통제 기사 두 건, 메모리 수요 → 장비 투자)는 하나의 이야기로 묶습니다. 같은 내용을 두 번 소개하지 않습니다.
3. 근거가 충분한 기사를 우선합니다. evidence가 bundle(여러 소식 묶음)이거나 title_only인 기사는, 핵심 사실을 요약에서 확인할 수 없으면 빼거나 다른 이야기의 보조 근거로만 씁니다.
4. 시간 배분: 전체 기본 목표는 12~13분(720~780초), 허용 범위는 10~15분(600~900초)입니다. 중요한 이야기 2~4개에 시간을 더 쓰고(2~3분), 나머지는 45초~1분 30초.
   늘어난 시간은 새 기사를 억지로 넣거나 같은 내용을 되풀이하는 데 쓰지 않고, 투자 판단에 필요한 근거(기사에 있는 배경·수치·비교 기준)와 확인할 사항을 더 자세히 설명하는 데 씁니다.
   근거 있는 기사가 부족한 날은 10분 아래로 끝나도 됩니다. 억지로 채우지 않습니다. 합계가 780초를 크게 넘지 않게 조절합니다.
5. 분야 균형: 거시경제, 산업, 보유·관심 종목, 공시(수주 공시 기사 포함)를 가능한 한 각각 다룹니다. 해당 분야에 근거 있는 기사가 없으면 비워 둡니다.
6. 종목 직접 뉴스와 산업·정책 뉴스가 모두 있으면 종목 뉴스를 산업 흐름 안에서 연결해 설명할 수 있게 묶습니다.
7. key_facts에는 요약·제목에 실제로 있는 사실만 근거 기사 id와 함께 적습니다. 해석은 interpretation에 따로 적습니다.
8. 후보 중 방송하지 않는 기사는 모두 excluded에 이유와 함께 적습니다.
9. 국내 기사와 해외 원문(lang: en)이 같은 사건을 다루면 한 이야기로 묶습니다. 같은 사건을 두 번 소개하지 않습니다.
   해외 원문이 1차 보도이거나 더 구체적이면 그것을 핵심 근거로 씁니다. 국내에서 보도되지 않은 해외 소식도 중요하면 편성합니다.
10. 해외 기사가 늘어도 전체 15분을 넘기지 않습니다. 중요도가 낮은 해외 소식은 과감히 뺍니다.
11. 주요 거시경제 지표(미국: CPI·PCE·고용보고서·FOMC 금리 결정·GDP·소매판매 / 한국: CPI·한국은행 기준금리 결정·GDP·수출입 동향·고용동향·산업생산)의
    '발표 결과 기사 후보' 표시가 붙은 기사는 거시경제 이야기에서 우선 편성하고 상위 순서에 둡니다. 단, 요약·원문 사실에 실제 발표 수치나 결정이 있을 때만 '발표됨'으로 다룹니다.
    '발표 예정·전망' 표시 기사는 결과로 말하지 않으며, 일정 안내가 필요하면 follow_up에만 적습니다. key_facts에는 기사에 있는 수치와 이전 수치·예상치 비교만 쓰고, 기사에 없는 수치를 만들지 않습니다.
    interpretation에는 그 지표가 금리·환율·업황에 줄 수 있는 영향을 일반 원리 수준으로 짧게 적고, 보유·관심 종목과 연결할 근거가 기사에 없으면 related_holdings를 비웁니다."""

SCHEMA = {
    "type": "object",
    "properties": {
        "stories": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "headline": {"type": "string"},
                "section": {"type": "string", "enum": ["macro", "industry", "stocks", "disclosures"]},
                "article_ids": {"type": "array", "items": {"type": "string"}},
                "priority": {"type": "integer"},
                "target_seconds": {"type": "integer"},
                "why_selected": {"type": "string"},
                "related_holdings": {"type": "array", "items": {"type": "string"}},
                "key_facts": {"type": "array", "items": {
                    "type": "object",
                    "properties": {"fact": {"type": "string"}, "source_id": {"type": "string"}},
                    "required": ["fact", "source_id"], "additionalProperties": False}},
                "interpretation": {"type": "string"},
                "follow_up": {"type": "string"},
            },
            "required": ["headline", "section", "article_ids", "priority", "target_seconds", "why_selected",
                         "related_holdings", "key_facts", "interpretation", "follow_up"],
            "additionalProperties": False}},
        "excluded": {"type": "array", "items": {
            "type": "object",
            "properties": {"article_id": {"type": "string"},
                           "reason": {"type": "string", "enum": ["merged_or_duplicate", "weak_evidence",
                                                                 "lower_priority", "stale", "off_profile"]},
                           "note": {"type": "string"}},
            "required": ["article_id", "reason", "note"], "additionalProperties": False}},
        "editor_note": {"type": "string"},
    },
    "required": ["stories", "excluded", "editor_note"],
    "additionalProperties": False,
}


def candidate_text(a: dict) -> str:
    lang = " | 해외 원문(영어)" if a.get("lang") == "en" else ""
    orig = f"\n  원문에서 확인한 사실: {' / '.join(a['original_facts'])}" if a.get("original_facts") else ""
    return (f"- id: {a['id']} | {a['source']} | {(a.get('published_at') or '')[:16]} | evidence: {a['evidence']}{lang}{indicators.tag(a)}{orig}\n"
            f"  제목: {a['title']}\n  요약: {a.get('summary') or '(없음)'}\n"
            f"  AI 판정: {a['relevance_type']} / 중요도 {a['importance']} ({a.get('importance_reason', '')}) / "
            f"관련 종목: {', '.join(a.get('related_stocks', [])) or '-'}\n"
            f"  확인된 사실: {' / '.join(a.get('confirmed_facts', [])) or '-'}")


def plan(ranked: list[dict], profile_text: str, date_label: str, *, model: str = "sonnet") -> tuple[dict, dict]:
    prompt = (f"# 방송 날짜\n{date_label}\n\n# 투자자 프로필\n{profile_text}\n\n"
              f"# 후보 기사 {len(ranked)}건 (규칙 점수 순)\n" + "\n".join(candidate_text(a) for a in ranked)
              + "\n\n오늘 방송할 이야기를 편성하세요.")
    system = SYSTEM + (focus_mod.EDIT_RULE if focus_mod.has_focus_text(profile_text) else "")
    r = llm.call(prompt, system=system, schema=SCHEMA, model=model, effort="medium")
    return r.data, {"model": r.model, "seconds": round(r.seconds, 1), "input_tokens": r.input_tokens,
                    "output_tokens": r.output_tokens, "cost_usd": r.cost_usd}


def selection_report(ranked: list[dict], judged: list[dict], plan_data: dict, pool: set[str] | None = None,
                     titles: dict[str, str] | None = None) -> dict:
    """편성 품질 점검: 중요 기사 누락(사유별), 중복, 분야 비중, 근거 수준. pool = 수집 마감 안의 후보 id."""
    pool = pool if pool is not None else {j["article_id"] for j in judged}
    used = {i for s in plan_data["stories"] for i in s["article_ids"]}
    by = {a["id"]: a for a in ranked}
    high_all = [j["article_id"] for j in judged if j["importance"] == "high" and j["article_id"] in pool
                and j["relevance_type"] in TYPE_BONUS and j.get("include_in_podcast")]
    excluded = {e["article_id"]: e for e in plan_data["excluded"]}
    CAT = {"merged_or_duplicate": "다른 이야기와 중복", "weak_evidence": "출처·근거 부족", "lower_priority": "분량·우선순위",
           "stale": "시의성 낮음", "off_profile": "프로필과 무관", "not_in_top_candidates": "규칙 점수로 후보에서 잘림",
           "unlisted": "AI 편집 과정에서 누락 (이유 없음)"}
    high_dropped = []
    for i in high_all:
        if i in used:
            continue
        r = (excluded.get(i) or {}).get("reason") or ("not_in_top_candidates" if i not in by else "unlisted")
        high_dropped.append({"id": i, "title": by[i]["title"] if i in by else (titles or {}).get(i, ""), "reason": r, "category": CAT[r],
                             "note": (excluded.get(i) or {}).get("note", "")})
    sec_seconds = {}
    for s in plan_data["stories"]:
        sec_seconds[s["section"]] = sec_seconds.get(s["section"], 0) + s["target_seconds"]
    multi = [s["headline"] for s in plan_data["stories"] if len(s["article_ids"]) > 1]
    ev = {k: sum(1 for i in used if i in by and by[i]["evidence"] == k) for k in ("original", "full", "bundle", "title_only")}
    dup_ids = [i for i in used if sum(i in s["article_ids"] for s in plan_data["stories"]) > 1]
    lang = lambda i: (by.get(i) or {}).get("lang", "ko")
    foreign = {"candidates": sum(1 for a in ranked if a.get("lang") == "en"),
               "used": sum(1 for i in used if lang(i) == "en"),
               "stories_foreign_only": [s["headline"] for s in plan_data["stories"]
                                        if s["article_ids"] and all(lang(i) == "en" for i in s["article_ids"])],
               "stories_mixed": [s["headline"] for s in plan_data["stories"]
                                 if len({lang(i) for i in s["article_ids"]}) > 1],
               "excluded_as_duplicate": sum(1 for e in plan_data["excluded"] if e["reason"] == "merged_or_duplicate")}
    return {"candidates_ranked": len(ranked), "stories": len(plan_data["stories"]), "articles_used": len(used),
            "high_importance_total": len(high_all), "high_importance_used": len(high_all) - len(high_dropped),
            "high_importance_dropped": high_dropped, "seconds_by_section": sec_seconds,
            "total_target_seconds": sum(sec_seconds.values()), "merged_stories": multi,
            "evidence_of_used": ev, "article_in_multiple_stories": dup_ids, "foreign": foreign,
            "unaccounted": [a["id"] for a in ranked if a["id"] not in used and a["id"] not in excluded]}
