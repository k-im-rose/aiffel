"""뉴스 출처와 분석 결과의 연결 규칙 (한곳에 모은다).

원칙: 사실은 그 사실의 근거 기사가 속한 이야기에만 붙는다. 모델이 돌려준 번호·순서는 참고만 하고 믿지 않는다.
(2026-11-17 실패 사례: 원문 대조 대상이 아닌 이야기가 중간에 있으면 모델이 번호를 1부터 다시 매겨,
 '알테오젠' 이야기에 정상회담 사실이, '정상회담' 이야기에 코픽스 사실이 붙었다. docs/failure_cases_demo.md 6-1)

- attach(): 원문 대조 결과를 이야기에 붙인다.
- story_facts(): 웹 데이터 단계에서 이야기에 남길 원문 대조 사실을 고른다.
- check_plan(), check_briefing(): 저장된 결과에서 연결이 어긋난 곳을 찾는다 (승인 관문·점검 스크립트가 쓴다).
"""
from __future__ import annotations


def _src(result: dict) -> set[str]:
    return {i for f in result.get("confirmed_facts", []) for i in f.get("source_ids", [])}


def attach(plan: dict, results: list[dict], targets: list[dict] | None = None) -> dict:
    """원문 대조 결과를 이야기에 붙이고 기록을 돌려준다.

    1. 근거 기사가 있는 결과: 근거 기사가 '모두' 들어 있는 이야기에 붙인다.
       그런 이야기가 여럿이면(같은 기사가 두 이야기에 쓰임) 보고된 번호 → 대상 순서 순으로 고르고, 그래도 못 고르면 붙이지 않는다.
       근거 기사가 두 이야기에 걸쳐 있으면 어느 쪽에도 붙이지 않는다.
    2. 근거 기사가 없는 결과(확인된 사실 0개): 결과 수와 대상 이야기 수가 같을 때만 대상 순서로 붙인다.
       수가 다르면 순서를 믿을 수 없으므로 붙이지 않는다.
    3. 이미 다른 결과가 붙은 이야기에는 붙이지 않는다.
    붙이지 못한 결과는 버리고 기록한다. 틀린 이야기에 붙는 것보다 빠지는 편이 안전하다."""
    stories = sorted(plan["stories"], key=lambda s: s["priority"])
    for s in stories:
        s.pop("corroboration", None)
    order = [s["priority"] for s in (targets or [])]
    aligned = bool(order) and len(order) == len(results)
    log = {"matched": 0, "renumbered": [], "unmatched": []}
    for n, x in enumerate(results):
        reported = x.get("priority")
        positional = order[n] if aligned else None
        src = _src(x)
        if src:
            cands = [s for s in stories if src <= set(s["article_ids"])]
            if len(cands) > 1:
                cands = ([s for s in cands if s["priority"] == reported] or [s for s in cands if s["priority"] == positional])[:1]
            pick = cands[0] if cands else None
            why = "근거 기사가 한 이야기에 모두 들어 있지 않음" if not cands else ""
        elif aligned:
            pick = next((s for s in stories if s["priority"] == positional), None)
            why = "" if pick else "대상 순서의 이야기 없음"
        else:
            pick, why = None, "근거 기사가 없고 결과 수가 대상 수와 달라 순서를 믿을 수 없음"
        if pick and pick.get("corroboration"):
            pick, why = None, "이미 다른 결과가 붙은 이야기"
        if not pick:
            log["unmatched"].append({"reported": reported, "reason": why})
            continue
        if pick["priority"] != reported:
            log["renumbered"].append({"reported": reported, "actual": pick["priority"]})
        log["matched"] += 1
        pick["corroboration"] = {**x, "priority": pick["priority"]}
    return log


def story_facts(story: dict, corroboration: dict, drop_sources: set[str] = frozenset()) -> list[dict]:
    """이야기에 남길 원문 대조 사실: 근거 기사가 모두 이 이야기의 기사이고, 빼기로 한 기사만으로 된 사실이 아닌 것."""
    ids = set(story["article_ids"]) - set(drop_sources)
    return [f for f in (corroboration or {}).get("confirmed_facts", [])
            if f.get("source_ids") and set(f["source_ids"]) <= ids]


def check_plan(plan: dict) -> list[str]:
    out = []
    for s in plan["stories"]:
        c = s.get("corroboration")
        if not c:
            continue
        if c.get("priority") not in (None, s["priority"]):
            out.append(f"이야기 {s['priority']}: 대조 결과 번호 {c.get('priority')}")
        extra = _src(c) - set(s["article_ids"])
        if extra:
            out.append(f"이야기 {s['priority']}: 다른 이야기의 근거 기사 {sorted(extra)}")
    return out


def check_briefing(b: dict) -> list[str]:
    """웹 데이터에서 사실·추천의 근거 기사가 그 이야기(또는 그 추천)의 출처 목록에 있는지 본다."""
    out = []
    for s in b.get("stories", []):
        ids = {x["id"] for x in s.get("sources", [])}
        for f in s.get("facts", []):
            sid = set(f.get("source_ids") or [])
            if not sid:
                out.append(f"이야기 {s['priority']}: 출처 없는 사실")
            elif not sid <= ids:
                out.append(f"이야기 {s['priority']}: 이야기 출처에 없는 기사의 사실 {sorted(sid - ids)}")
    for c in b.get("ai_checks", []):
        if not c.get("sources"):
            out.append(f"AI 추천 {c.get('id')}: 출처 없음")
    return out
