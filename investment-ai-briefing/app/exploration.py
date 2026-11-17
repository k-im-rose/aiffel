"""투자 아이디어 탐색 후보: 전부 보관하되, 사용자에게는 근거가 충분한 것만 0~5개 보여 준다.

11/17 첫 실행에서 방송 제외 테마·판단 보류 기사 73건을 그대로 보여 줬다 → 사용자가 다시 확인해야 할 양이 너무 많다는 피드백.
- exploration_all.json: 내부 목록 (방송에 넣지 않은 테마·판단 보류 기사 전부, 판정 근거 포함)
- exploration_candidates.md: 사용자용. 규칙으로 근거 있는 것만 추린 뒤 LLM이 0~5개를 고르고, 각 후보를 다섯 칸으로 정리
  (무엇이 일어났나 / 수요로 이어질 근거 / 정책·예산·시장·기업 근거 / 사실과 추론 / 더 조사할 것).
  근거가 부족하면 0개. 억지로 추천하지 않는다. '유망하다'고 말하지 않는다.
"""
from __future__ import annotations

import json
from pathlib import Path

from app import llm
from app.editor import evidence

SYSTEM = """당신은 개인 투자자의 '투자 아이디어 탐색 후보'를 고르는 담당입니다. 매일 방송에는 넣지 않은 기사들 중에서,
나중에 따로 조사해 볼 가치가 있는 후보를 0~5개만 고릅니다. 근거가 부족하면 0개를 돌려줍니다. 억지로 채우지 않습니다.

고르는 기준 (모두 만족해야 함)
1. 실제로 일어난 변화나 문제가 기사 요약에 사실로 나온다 (전망·의견만 있는 기사는 제외)
2. 그 변화가 새 산업·서비스 수요나 투자자 관심 산업의 변화로 이어질 근거가 요약에 있다
3. 정책·예산·시장 규모·계약·관련 기업 같은 구체적 근거가 하나 이상 있다
같은 주제의 기사는 하나로 묶습니다. "유망하다", "수혜" 같은 단정은 쓰지 않습니다. 매수·매도 권유를 하지 않습니다."""

SCHEMA = {
    "type": "object",
    "properties": {"candidates": {"type": "array", "maxItems": 5, "items": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "article_ids": {"type": "array", "items": {"type": "string"}},
            "what_happened": {"type": "string"},
            "demand_basis": {"type": "string"},
            "hard_evidence": {"type": "string"},
            "fact_vs_inference": {"type": "string"},
            "to_research": {"type": "string"},
        },
        "required": ["title", "article_ids", "what_happened", "demand_basis", "hard_evidence",
                     "fact_vs_inference", "to_research"],
        "additionalProperties": False}},
        "none_reason": {"type": "string"}},
    "required": ["candidates", "none_reason"], "additionalProperties": False,
}


def build(out: Path, cands: list[dict], judged: list[dict], used: set[str], *, model: str = "sonnet") -> dict:
    by = {a["id"]: a for a in cands}
    pool = [j for j in judged if j["relevance_type"] in ("theme", "uncertain") and j["article_id"] not in used
            and j["article_id"] in by]
    (out / "exploration_all.json").write_text(json.dumps(
        [{**{k: by[j["article_id"]].get(k) for k in ("id", "source", "published_at", "title", "url")},
          "relevance_type": j["relevance_type"], "importance": j["importance"], "reason": j["reason"],
          "confirmed_facts": j.get("confirmed_facts", [])} for j in pool], ensure_ascii=False, indent=1), encoding="utf-8")
    # 규칙 1차 거르기: 중요도 medium 이상, 요약이 제목을 뒷받침, 확인된 사실 2개 이상
    strong = [j for j in pool if j["importance"] in ("high", "medium") and evidence(by[j["article_id"]]) in ("full", "original")
              and len(j.get("confirmed_facts", [])) >= 2]
    log = {"internal_total": len(pool), "rule_passed": len(strong), "shown": 0}
    picked, none_reason = [], ""
    if strong:
        prompt = "\n".join(
            f"- id: {j['article_id']} | {by[j['article_id']]['source']} | {by[j['article_id']]['title']}\n"
            f"  요약: {by[j['article_id']].get('summary_ko') or by[j['article_id']].get('summary') or ''}\n"
            f"  확인된 사실: {' / '.join(j['confirmed_facts'])}" for j in strong)
        r = llm.call(prompt, system=SYSTEM, schema=SCHEMA, model=model, effort="medium")
        picked, none_reason = r.data["candidates"][:5], r.data["none_reason"]
        log["call"] = {"seconds": round(r.seconds, 1), "cost_usd": r.cost_usd}
    log["shown"] = len(picked)
    lines = ["# 투자 아이디어 탐색 후보", "",
             f"방송에 넣지 않은 테마·판단 보류 기사 {len(pool)}건은 내부 목록(`exploration_all.json`)에 보관했습니다. "
             f"그중 근거 기준을 통과한 {len(strong)}건에서 {len(picked)}개만 골랐습니다. 유망하다는 뜻이 아니라 따로 조사해 볼 후보입니다.", ""]
    if not picked:
        lines += ["오늘은 근거가 충분한 후보가 없습니다." + (f" ({none_reason})" if none_reason else "")]
    for n, c in enumerate(picked, 1):
        links = ", ".join(f"[{by[i]['source']}]({by[i]['url']})" for i in c["article_ids"] if i in by)
        lines += [f"## {n}. {c['title']}", "",
                  f"- **무슨 일이 있었나:** {c['what_happened']}",
                  f"- **수요로 이어질 근거:** {c['demand_basis']}",
                  f"- **정책·예산·시장·기업 근거:** {c['hard_evidence']}",
                  f"- **사실과 추론:** {c['fact_vs_inference']}",
                  f"- **더 조사할 것:** {c['to_research']}",
                  f"- 출처: {links}", ""]
    (out / "exploration_candidates.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (out / "exploration_picked.json").write_text(json.dumps({"candidates": picked, "none_reason": none_reason,
                                                             "internal_total": len(pool), "rule_passed": len(strong)},
                                                            ensure_ascii=False, indent=1), encoding="utf-8")
    return log
