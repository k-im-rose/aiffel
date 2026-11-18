"""후보 B: LLM 의미 기반 관련성 판정.

투자 프로필(보유·관심 종목, 종목별 투자 논리, 거시경제 관심사)과 기사 제목·RSS 요약을 주고,
기사마다 관련 여부·연결 방식·근거를 정해진 JSON 형식으로 받는다.
"""
from __future__ import annotations

import json
from concurrent.futures import ThreadPoolExecutor

from app import focus, llm

SYSTEM = """당신은 개인 투자자의 뉴스 선별 보조입니다. 투자자가 등록한 종목과 투자 이유, 관심 산업, 거시경제 관심사를 기준으로
기사가 이 투자자에게 의미 있는지 판정합니다. 매수·매도 권유나 주가 예측은 하지 않습니다.

종목명이나 키워드가 들어 있다는 이유만으로 선택하지 않습니다. 투자 이유와 기업의 실제 사업, 산업 동향, 정책 변화,
관심 모멘텀을 함께 보고 아래 중 하나로 분류합니다.

relevance_type
- direct: 등록 기업의 실제 사업·실적·공시·계약·생산·경영 활동과 직접 연결되는 기사. 기사에 그 기업이 실제로 다뤄져야 합니다
  (종목 나열 표나 순매도 목록에 이름만 있는 것은 direct가 아닙니다).
- industry_policy: 직접 계약 관계는 없지만 등록 기업의 사업 환경(산업 수요, 설비투자, 규제, 정책)에 영향을 줄 수 있는 기사.
- theme: 투자자가 추적하는 관심 테마이지만 기업과 직접 사업 관계가 확인되지 않은 기사 (예: {theme_examples}). 테마가 비슷하다는 이유만으로 수혜 기업이라고 판단하지 않습니다.
- macro: 등록한 거시경제 관심사(금리·환율·물가·경제정책·글로벌 경제)의 의미 있는 변화. 특정 종목과 연결되지 않아도 됩니다.
  가계 대출 상품, 예적금 상품처럼 개인 금융 상품 소개는 macro가 아닙니다.
- irrelevant: 관련성이 낮은 기사. 단어만 겹치는 기사, 유명인 사생활, 광고성 기사, 종목 나열.
- uncertain: 제목·요약만으로는 판단 근거가 부족한 기사. 억지로 정하지 말고 needs_check에 무엇을 확인해야 하는지 적습니다.

importance (관련성과 별도로 평가): high / medium / low
- 투자 논리와의 관련 정도, 새로운 정보인지, 실적·사업·규제 영향 가능성, 중요한 거시 변화인지, 출처 확인 가능 여부를 봅니다.
- 보유 여부만으로 중요도를 정하지 않습니다.

규칙
- confirmed_facts에는 기사 제목이나 요약에 실제로 있는 사실만 짧게 적습니다. 없는 사실, 기업 간 관계를 만들지 않습니다.
- 요약이 없는 기사(제목만 있음)는 제목으로 확인되는 범위까지만 씁니다.
- AI의 추론(영향 가능성)은 reason에 쓰고, 사실과 섞지 않습니다.
- 같은 사건을 다룬 기사가 묶음 안에 있으면 duplicate_of에 먼저 나온 기사 id를, 없으면 빈 문자열을 넣습니다.
- include_in_podcast: relevance_type이 irrelevant가 아니고 importance가 low가 아니면 true를 기본으로 합니다."""

SCHEMA = {
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "article_id": {"type": "string"},
                    "relevance_type": {"type": "string", "enum": [
                        "direct", "industry_policy", "theme", "macro", "irrelevant", "uncertain"]},
                    "related_stocks": {"type": "array", "items": {"type": "string"}},
                    "importance": {"type": "string", "enum": ["high", "medium", "low"]},
                    "importance_reason": {"type": "string"},
                    "reason": {"type": "string"},
                    "confirmed_facts": {"type": "array", "items": {"type": "string"}},
                    "needs_check": {"type": "string"},
                    "duplicate_of": {"type": "string"},
                    "include_in_podcast": {"type": "boolean"},
                },
                "required": ["article_id", "relevance_type", "related_stocks", "importance",
                             "importance_reason", "reason", "confirmed_facts", "needs_check",
                             "duplicate_of", "include_in_podcast"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["results"],
    "additionalProperties": False,
}

FOREIGN_NOTE = ("\n\n영문 기사(해외 원문)도 같은 기준으로 판정합니다. reason, importance_reason, confirmed_facts, needs_check는 한국어로 쓰고, "
                "confirmed_facts는 원문 제목·요약에 있는 사실만 옮깁니다. 국내 독자에게 덜 알려진 해외 소식이라도 투자 논리·거시 관심사에 "
                "의미 있으면 선택합니다.")

DEFAULT_THEME_EXAMPLES = "관심 테마 뉴스와 그 테마로 묶여 거론되는 보유 기업"


def system_for(profile: dict) -> str:
    """판정 지시문. theme 예시는 프로필(prompt_theme_examples)에서 가져온다 — 실제 종목명을 코드에 두지 않기 위해.
    비공개 실제 프로필에는 1차 평가 때와 똑같은 예시 문구가 들어 있어 평가 조건이 바뀌지 않는다."""
    system = SYSTEM.replace("{theme_examples}", profile.get("prompt_theme_examples") or DEFAULT_THEME_EXAMPLES)
    return system + (focus.SELECT_RULE if focus.names(profile) else "")


RELEVANT_TYPES = {"direct", "industry_policy", "theme", "macro"}


def profile_text(profile: dict) -> str:
    lines = ["[거시경제 관심사] " + ", ".join(profile.get("macro_topics", [])),
             "[관심 산업] " + ", ".join(profile.get("interest_industries", []))]
    for s in profile.get("stocks", []):
        status = "보유" if s.get("status") == "held" else "관심(미보유)"
        lines.append(
            f"[종목] {s['name']} ({s.get('ticker', '-')}, {status}) | 업종: {s.get('sector', '-')} | "
            f"투자 이유: {s.get('thesis', '-')} | 관심 키워드: {', '.join(s.get('keywords', []))}"
            + (f" | 확인된 관계: {s['known_relations']}" if s.get("known_relations") else "")
            + (f" | 확인하고 싶은 위험: {', '.join(s['risks'])}" if s.get("risks") else "")  # 웹 프로필 칸 (없으면 이전과 같은 문장)
            + (f" | AI에게 특히 확인받고 싶은 것: {s['ask_ai']}" if s.get("ask_ai") else "")
            + (f" | {focus.FOCUS_MARK}" if s.get("focus") is True else ""))
    if focus.profile_line(profile):  # 집중 분석 종목이 없으면 이 줄도 없다 (기존 문장 그대로)
        lines.append(focus.profile_line(profile))
    return "\n".join(lines)


def article_text(a: dict) -> str:
    summary = a.get("summary") or "(요약 없음 — 제목만 제공)"
    return f"- id: {a['id']} | {a['source']} {a['category']}\n  제목: {a['title']}\n  요약: {summary}"


def classify(articles: list[dict], profile: dict, *, model: str = "haiku",
             backend: str | None = None, batch_size: int = 15, workers: int = 1,
             progress=None) -> tuple[list[dict], list[dict]]:
    """반환: (기사별 판정 목록, 호출 기록 목록). workers>1이면 묶음을 동시에 보낸다."""
    results, calls = {}, []
    batches = [articles[i:i + batch_size] for i in range(0, len(articles), batch_size)]

    def run(batch):
        prompt = ("# 투자자 프로필\n" + profile_text(profile) + "\n\n# 판정할 기사\n"
                  + "\n".join(article_text(a) for a in batch)
                  + f"\n\n위 기사 {len(batch)}건을 모두 판정하세요. article_id는 그대로 돌려주세요.")
        if any(a.get("lang") == "en" for a in batch):  # 해외 기사가 있을 때만 붙인다 (국내 평가 조건은 그대로)
            prompt += FOREIGN_NOTE
        return batch, llm.call(prompt, system=system_for(profile), schema=SCHEMA, model=model, backend=backend)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        for done, (batch, r) in enumerate(ex.map(run, batches), 1):
            calls.append({"model": r.model, "backend": r.backend, "seconds": round(r.seconds, 2),
                          "input_tokens": r.input_tokens, "output_tokens": r.output_tokens,
                          "cost_usd": r.cost_usd, "n_articles": len(batch)})
            for item in r.data["results"]:
                results[item["article_id"]] = item
            if progress:
                progress(done, len(batches))
    # 모델이 응답에서 빠뜨린 기사는 한 번 더 묻는다 (그래도 없으면 missing으로 남긴다)
    retry = [a for a in articles if a["id"] not in results]
    for i in range(0, len(retry), batch_size):
        batch, r = run(retry[i:i + batch_size])
        calls.append({"model": r.model, "backend": r.backend, "seconds": round(r.seconds, 2),
                      "input_tokens": r.input_tokens, "output_tokens": r.output_tokens,
                      "cost_usd": r.cost_usd, "n_articles": len(batch), "retry": True})
        for item in r.data["results"]:
            results[item["article_id"]] = item
    out = []
    for a in articles:
        item = results.get(a["id"])
        if item is None:  # 모델이 빠뜨린 기사는 누락으로 기록 (조용히 넘기지 않는다)
            item = {"article_id": a["id"], "relevance_type": "missing", "related_stocks": [],
                    "importance": "low", "importance_reason": "", "reason": "모델 응답에서 빠짐",
                    "confirmed_facts": [], "needs_check": "", "duplicate_of": "", "include_in_podcast": False}
        # 주 지표: uncertain도 '확인 필요' 칸으로 들어가므로 선택으로 센다
        item["selected"] = item["relevance_type"] in RELEVANT_TYPES | {"uncertain"}
        out.append(item)
    return out, calls


if __name__ == "__main__":
    print(json.dumps(SCHEMA, ensure_ascii=False, indent=1))
