"""방송에 쓰는 해외 원문 기사만 한국어로 옮긴다 (Haiku 1회 호출).

원문 제목·언론사·발행 시각·URL은 그대로 두고 title_ko, summary_ko를 더한다.
원문에 없는 내용을 더하지 않는다 (번역이지 해설이 아니다). 고유명사·수치·단위는 원문대로 옮긴다.
"""
from __future__ import annotations

from app import llm

SYSTEM = """영문 경제 기사 제목과 짧은 요약을 한국어로 옮깁니다.
- 원문에 없는 내용, 배경 설명, 평가를 더하지 않습니다.
- 수치·단위·날짜·기관명은 원문 그대로 정확히 옮깁니다 (예: 0.3%, 6.5%, Q3 → 3분기).
- 기업명은 한국에서 널리 쓰는 표기를 쓰고 처음 한 번 영문을 괄호로 붙입니다 (예: 엔비디아(Nvidia)).
- 요약이 비어 있으면 summary_ko도 빈 문자열로 둡니다."""

SCHEMA = {
    "type": "object",
    "properties": {"items": {"type": "array", "items": {
        "type": "object",
        "properties": {"id": {"type": "string"}, "title_ko": {"type": "string"}, "summary_ko": {"type": "string"}},
        "required": ["id", "title_ko", "summary_ko"], "additionalProperties": False}}},
    "required": ["items"], "additionalProperties": False,
}


def translate(articles: list[dict], *, model: str = "haiku") -> tuple[dict[str, dict], dict | None]:
    todo = [a for a in articles if a.get("lang") == "en" and not a.get("title_ko")]
    if not todo:
        return {}, None
    prompt = "\n".join(f"- id: {a['id']}\n  title: {a['title']}\n  summary: {a.get('summary') or ''}" for a in todo)
    r = llm.call(prompt, system=SYSTEM, schema=SCHEMA, model=model)
    out = {x["id"]: x for x in r.data["items"]}
    return out, {"model": r.model, "seconds": round(r.seconds, 1), "n": len(todo),
                 "input_tokens": r.input_tokens, "output_tokens": r.output_tokens, "cost_usd": r.cost_usd}
