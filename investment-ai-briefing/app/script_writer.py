"""편성된 이야기 → 두 진행자 대화형 브리핑 대본 (JSON).

v2 (2026-11-17): 사용자 청취 피드백 반영
- 인사·진행자 소개·AI 고지 반복 없이 바로 핵심으로. AI 생성 고지는 에피소드 설명과 텍스트 리포트에 둔다.
- "확인 필요" 설명은 방송에서 최소화하고 텍스트 리포트(checks_needed)로 보낸다.
- 이야기마다: 무슨 일 → 왜 → 경제·산업 영향 → 내 종목과의 관계 → 더 볼 것. 사실과 해석을 말투로 구분.
- 이야기 비중은 편집 단계의 target_seconds를 따른다. 최대 15분.
v1 대본과 결과는 outputs/sample_v1/에 그대로 남겨 두었다.
"""
from __future__ import annotations

import re

from app import llm

HOSTS = {"A": "진행자 A (설명)", "B": "진행자 B (질문)"}
CHARS_PER_SECOND = 6.8  # 실측: v1 Sonnet 대본 3,287자 → 481초 (edge-tts, 속도 +8%)

SYSTEM = """당신은 개인 투자자를 위한 아침 오디오 브리핑 대본 작가입니다. 두 진행자가 대화로 뉴스의 배경과 의미를 설명하는 한국어 대본을 씁니다.
- A: 내용을 설명하는 진행자
- B: 듣는 사람이 궁금해할 질문을 던지고 짧게 정리하는 진행자
진행자 이름이나 역할을 소개하지 않습니다. 서로 이름을 부르지 않습니다.

구성
1. 시작: 한두 문장. 날짜와 오늘 핵심 이야기 2~3개만 예고하고 바로 첫 이야기로 들어갑니다. 인사말, 방송 소개, AI 생성 안내는 하지 않습니다.
2. 본문: 편성표의 이야기를 priority 순서로, 분야(거시경제 → 산업 → 종목 → 공시) 흐름이 자연스럽게 이어지도록 말합니다.
   이야기마다 다음 흐름을 따르되, 해당 없는 단계는 건너뜁니다.
   무슨 일이 있었나(사실) → 왜 이런 일이 생겼나(기사에 있는 배경) → 경제·산업에 어떤 영향이 있을 수 있나(해석)
   → 보유·관심 종목과 어떤 관계인가 → 앞으로 무엇을 보면 되나.
   서로 관련된 이야기는 "앞에서 본 ~와 이어지는데"처럼 연결합니다.
3. 비중: 각 이야기의 target_seconds에 맞춰 분량을 조절합니다 (1초 ≈ 7자). 중요한 이야기는 길게, 나머지는 짧게.
4. 마무리 정리: 거시경제, 산업, 종목, 공시에서 다룬 핵심을 분야별로 한두 문장씩 빠짐없이 짚습니다. 기사를 다시 나열하지 않습니다.
5. 마지막 문장은 정확히 "오늘의 소식은 여기까지입니다." 로 끝냅니다. 다른 인사는 붙이지 않습니다.

사실과 해석
- 사실은 편성표 key_facts와 기사 요약에 있는 것만 말하고, 누가 발표·보도했는지(기업 공시, 정부 발표, 증권사 의견, 언론 보도)를 밝힙니다.
- 수치는 단위와 기준(기간, 전년 대비 등)이 기사에 있을 때만 함께 말합니다. 기사에 없는 수치·날짜·기업 관계·상장 여부를 만들지 않습니다.
- 듣는 사람은 화면을 보지 않습니다. 핵심 숫자는 이야기 하나에 두세 개까지만, 비교 기준과 함께 쉽게 말합니다 (예: "예상치 0.4%보다 낮은 0.3%"). 숫자를 길게 나열하지 않습니다.
- 해외 원문 기사는 "CNBC에 따르면"처럼 해외 언론사 이름을 밝히고, 번역 요약에 있는 내용만 말합니다.
- 해석과 전망은 "~로 이어질 수 있습니다", "~라는 해석이 나옵니다", "증권사는 ~로 봤습니다"처럼 말투로 구분합니다.
- 인과관계: "A 때문에 B"는 출처 기사가 그렇게 분석했을 때만, "기사는 ~때문이라고 분석했습니다"처럼 출처의 분석으로 말합니다.
  출처에 없는 원인을 덧붙이거나 여러 원인을 임의로 합치지 않습니다. 일반적인 경제 원리로 설명을 보탤 때는 해석(interpretation)으로만 말하고,
  경제적으로 앞뒤가 맞아야 합니다 (예: 안전자산 선호는 보통 국채금리를 낮추는 쪽으로 작용합니다).
- 사실 대사의 기업명·수치는 붙인 출처 기사에 실제로 있어야 합니다. 다른 기업이 주제인 기사에서 이 기업 수치를 가져와 말하지 않습니다.
- 투자 관점: 보유·관심 종목과 연결할 때 "긍정적/부정적"에서 끝내지 말고, 그 영향을 판단하려면 무엇을 확인해야 하는지 구체적으로 말합니다
  (예: 해당 사업의 매출 비중, 고객사·공급 관계, 정책의 적용 대상 여부, 다음 실적 발표의 특정 수치). 확인되지 않은 상태에서 "수혜 기업"이라고 단정하지 않습니다.
- 편성표에 '원문 대조 결과'가 있으면 그것을 가장 우선합니다. 같은 사건이면 매체별 측면을 하나의 사건으로 합쳐 설명하고,
  '확인 안 됨' 항목은 말하지 않습니다. 원문 대조가 없는 이야기는 요약 범위까지만 말하고 다른 기사와 세부사항을 억지로 연결하지 않습니다.
- 기업 기본 사실(상장 여부, 상장 시장, 종목코드)은 아래 '기업 기본 사실'만 따릅니다. 거기 없으면 말하지 않습니다.
- 확인되지 않은 사업 관계({relation_examples})는 사실처럼 말하지 않습니다. 필요한 경우에만 "직접 거래 관계는 확인되지 않았습니다"라고 한 번 말합니다.
- 매수·매도 권유, 목표가 제시, 주가 예측은 하지 않습니다.

청취 흐름
- "기사에 이런 내용이 없습니다", "본문을 확인해야 합니다" 같은 말을 반복하지 않습니다. 핵심 사실을 확인할 수 없는 내용은 말하지 않고, 꼭 필요하면 한 번만 짧게 "자세한 조건은 아직 알려지지 않았습니다" 정도로 처리합니다.
  확인할 거리는 checks_needed에 모읍니다(텍스트 리포트로 따로 제공됩니다).
- 전문 용어는 처음 나올 때 한 구절로 자연스럽게 풀어 줍니다 (예: "HBM, 그러니까 AI 칩 옆에 붙는 고성능 메모리"). 교과서식 정의 문장을 따로 만들지 않습니다.
- 대사 하나는 1~3문장. B의 질문은 짧고 구체적으로.

각 대사의 kind: fact(사실 전달, source_ids 필수) / interpretation(해석·연결·전망) / transition(전환·질문·정리).
fact 대사의 source_ids에는 근거 기사 id를 넣습니다."""

SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "lines": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "section": {"type": "string", "enum": ["opening", "macro", "industry", "stocks",
                                                       "disclosures", "wrapup"]},
                "speaker": {"type": "string", "enum": ["A", "B"]},
                "kind": {"type": "string", "enum": ["fact", "interpretation", "transition"]},
                "text": {"type": "string"},
                "source_ids": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["section", "speaker", "kind", "text", "source_ids"],
            "additionalProperties": False,
        }},
        "checks_needed": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "lines", "checks_needed"],
    "additionalProperties": False,
}


def facts_text(company_facts: dict) -> str:
    return "\n".join(f"- {c['name']}: {'상장' if c['listed'] else '비상장'}"
                     + (f" ({c['market']} {c['ticker']})" if c.get("ticker") else "")
                     + (" / " + " / ".join(c.get("facts", [])) if c.get("facts") else "")
                     for c in company_facts["companies"])


def plan_text(plan: dict, articles: dict[str, dict]) -> str:
    out = []
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        out.append(f"## [{s['priority']}] {s['headline']} | 분야 {s['section']} | 목표 {s['target_seconds']}초 | "
                   f"관련 보유·관심 종목: {', '.join(s['related_holdings']) or '-'}")
        out.append("확인된 사실: " + " / ".join(f"{f['fact']} ({f['source_id']})" for f in s["key_facts"]))
        out.append(f"편집자 해석(추론): {s['interpretation']}")
        out.append(f"더 볼 것: {s['follow_up']}")
        c = s.get("corroboration")
        if c:
            out.append(f"원문 대조 결과: 같은 사건 여부 = {c['same_event']} ({c['same_event_basis']})")
            out += [f"  - 원문 확인: {f['fact']} ({', '.join(f['source_ids'])})" for f in c["confirmed_facts"]]
            out += [f"  - 매체 간 충돌: {x}" for x in c["conflicts"]]
            out += [f"  - 확인 안 됨(말하지 않음): {x}" for x in c["unverified"]]
        for i in s["article_ids"]:
            a = articles.get(i)
            if a and a.get("lang") == "en":
                out.append(f"- 기사 {i} | 해외 원문 {a['source']} {(a.get('published_at') or '')[:10]} | {a.get('title_ko') or a['title']} (원문: {a['title']})\n"
                           f"  요약(번역): {a.get('summary_ko') or '(없음)'}\n  원문 요약: {a.get('summary') or '(없음)'}")
            elif a:
                out.append(f"- 기사 {i} | {a['source']} {(a.get('published_at') or '')[:10]} | {a['title']}\n  요약: {a.get('summary') or '(없음)'}")
        out.append("")
    return "\n".join(out)


def write(plan: dict, articles: dict[str, dict], date_label: str, company_facts: dict, *,
          disclosures_note: str = "", model: str = "sonnet", profile: dict | None = None) -> tuple[dict, dict]:
    prompt = (f"# 방송 날짜\n{date_label}\n\n# 기업 기본 사실 (공식 자료 기준)\n{facts_text(company_facts)}\n\n"
              f"# 공시 수집 상태\n{disclosures_note}\n\n# 오늘의 편성표\n{plan_text(plan, articles)}\n"
              "위 편성표만 근거로 대본을 쓰세요.")
    system = SYSTEM.replace("{relation_examples}", (profile or {}).get("prompt_relation_examples")
                            or "프로필에 '확인된 관계'로 적힌 테마 연결 등")
    r = llm.call(prompt, system=system, schema=SCHEMA, model=model, effort="medium")
    return r.data, {"model": r.model, "seconds": round(r.seconds, 2), "input_tokens": r.input_tokens,
                    "output_tokens": r.output_tokens, "cost_usd": r.cost_usd}


NUM_RE = re.compile(r"\d")
HEDGE_RE = re.compile(r"확인(이)? ?필요|본문을 (확인|봐야)|기사에(는)? (나오지 않|없|확인되지 않)|요약에(는)? (없|나오지)")


def validate(script: dict, ids: set[str]) -> dict:
    """형식 점검 (사실 정확성은 fact_check.py에서 따로 본다)."""
    lines = script["lines"]
    bad_ids = [(n, s) for n, ln in enumerate(lines) for s in ln["source_ids"] if s not in ids]
    fact_nosrc = [(n, ln["text"]) for n, ln in enumerate(lines) if ln["kind"] == "fact" and not ln["source_ids"]]
    num_nosrc = [(n, ln["text"]) for n, ln in enumerate(lines)
                 if NUM_RE.search(ln["text"]) and not ln["source_ids"] and ln["kind"] != "transition"
                 and ln["section"] not in ("opening", "wrapup")]
    banned = [(n, ln["text"]) for n, ln in enumerate(lines)
              if re.search(r"(매수|매도)(하세요|하시길|를 추천|추천)|사세요|파세요|목표가를 .*제시합니다", ln["text"])]
    hedges = [(n, ln["text"]) for n, ln in enumerate(lines) if HEDGE_RE.search(ln["text"])]
    chars = sum(len(ln["text"]) for ln in lines)
    return {"n_lines": len(lines), "chars": chars, "est_seconds": round(chars / CHARS_PER_SECOND),
            "articles_used": len({s for ln in lines for s in ln["source_ids"]} & ids),
            "invalid_source_ids": bad_ids, "fact_lines_without_source": fact_nosrc,
            "numbers_without_source": num_nosrc, "recommendation_phrases": banned,
            "hedge_phrases": hedges,
            "ends_correctly": bool(lines) and lines[-1]["text"].strip().endswith("오늘의 소식은 여기까지입니다.")}


SEC = {"opening": "시작", "macro": "거시경제", "industry": "산업", "stocks": "보유·관심 종목",
       "disclosures": "공시", "wrapup": "정리"}


def to_markdown(script: dict, articles: dict[str, dict], report: dict | None = None) -> str:
    order = {s: i + 1 for i, s in enumerate(dict.fromkeys(
        s for ln in script["lines"] for s in ln["source_ids"] if s in articles))}
    out, cur, elapsed = [f"# {script['title']}", "",
                         "AI가 기사를 고르고 대본을 쓴 뒤 AI 음성으로 읽은 개인용 브리핑입니다. "
                         "대사 끝 번호는 아래 출처 번호이며, *기울임*은 사실이 아닌 해석·전망입니다.", ""], None, 0.0
    for ln in script["lines"]:
        if ln["section"] != cur:
            cur = ln["section"]
            out += ["", f"## {SEC[cur]} ({int(elapsed // 60)}:{int(elapsed % 60):02d})", ""]
        refs = "".join(f"[{order[s]}]" for s in ln["source_ids"] if s in order)
        text = f"*{ln['text']}*" if ln["kind"] == "interpretation" else ln["text"]
        out += [f"**{ln['speaker']}**: {text} {refs}".rstrip(), ""]
        elapsed += len(ln["text"]) / CHARS_PER_SECOND
    if script.get("checks_needed"):  # 내부 기사 id는 출처 번호나 언론사 이름으로 바꿔 보여 준다
        def unid(t):
            return re.sub(r"\b[nsfd]-[0-9a-f]{10}\b",
                          lambda m: f"출처 {order[m.group(0)]}" if m.group(0) in order else
                          (f"{articles[m.group(0)]['source']} 기사" if m.group(0) in articles else "해당 기사"), t)
        out += ["## 더 확인할 것", ""] + [f"- {unid(c)}" for c in script["checks_needed"]] + [""]
    out += ["## 출처", ""]
    for s, k in order.items():
        a = articles[s]
        ko = f" / 번역: {a['title_ko']}" if a.get("title_ko") else ""
        out.append(f"{k}. [{a['title']}]({a['url']}){ko} — {a['source']}, {(a.get('published_at') or '')[:16].replace('T', ' ')}")
    if report:
        out += ["", "## 형식 점검 (자동)", "",
                f"- 대사 {report['n_lines']}개, {report['chars']}자, 예상 길이 약 {report['est_seconds'] // 60}분 {report['est_seconds'] % 60}초",
                f"- 출처 없는 사실 대사 {len(report['fact_lines_without_source'])}개, 없는 출처 id {len(report['invalid_source_ids'])}개",
                f"- '확인 필요'류 표현 {len(report['hedge_phrases'])}개, 매수·매도 권유 표현 {len(report['recommendation_phrases'])}개",
                f"- 마지막 문장 규칙 {'지킴' if report['ends_correctly'] else '안 지킴'}"]
    return "\n".join(out) + "\n"
