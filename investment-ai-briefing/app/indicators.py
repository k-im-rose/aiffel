"""주요 거시경제 지표 발표 식별 (규칙 기반, 외부 API 없음).

수집한 뉴스 후보에서 미국·한국 주요 지표의 '발표 결과'를 다룬 기사를 먼저 찾아 편집·대본 단계에 표시한다.
- 공식 통계 API는 쓰지 않는다. 기사에 실제로 있는 수치만 쓰고, 기사에 없는 값은 만들지 않는다.
- 수집 마감 이후 발행된 기사는 후보에 들어오기 전에 걸러지므로 여기서는 다시 걸러 이중 확인만 한다.
- 발표 전 전망·일정 기사는 'upcoming'으로 따로 표시한다 (결과로 취급하지 않는다).
식별은 편집자(LLM)가 최종 판단하기 전의 1차 표시다: 같은 문장에 지표 이름과 결과 표현(수치 또는 결정)이 함께 있어야 released.
"""
from __future__ import annotations

import re
from datetime import datetime

# (키, 표시 이름, 나라, 지표 이름 패턴, 영향 설명용 힌트 — 대본에는 기사 근거가 있을 때만 쓴다)
INDICATORS = [
    ("us_cpi", "미국 소비자물가(CPI)", "US", r"소비자물가|\bCPI\b|consumer price"),
    ("us_pce", "미국 PCE 물가", "US", r"\bPCE\b|개인소비지출 ?(물가|가격)|personal consumption expenditures"),
    ("us_jobs", "미국 고용보고서", "US", r"고용 ?보고서|비농업 ?(부문 )?(고용|일자리)|신규 ?일자리|실업률|jobs report|nonfarm"),
    ("us_fomc", "미국 FOMC 금리 결정", "US", r"FOMC|연방공개시장위원회"),  # '12월 FOMC 인상 확률'처럼 전망은 released가 아님
    ("us_gdp", "미국 GDP", "US", r"GDP|국내총생산|gross domestic product"),
    ("us_retail", "미국 소매판매", "US", r"소매판매|retail sales"),
    ("kr_cpi", "한국 소비자물가(CPI)", "KR", r"소비자물가"),
    ("kr_rate", "한국은행 기준금리 결정", "KR", r"기준금리|금융통화위원회|금통위"),
    ("kr_gdp", "한국 GDP", "KR", r"GDP|국내총생산|경제성장률 ?\(?(속보|잠정)"),
    ("kr_trade", "한국 수출입 동향", "KR", r"수출입 ?동향|무역수지|수출액|수출 ?(증가|감소)|수입액"),
    ("kr_jobs", "한국 고용동향", "KR", r"고용동향|취업자|실업률"),
    ("kr_output", "한국 산업생산", "KR", r"산업활동동향|산업생산|광공업생산"),
]
NAME = {k: n for k, n, *_ in INDICATORS}

US_CTX = re.compile(r"미국|美|미 |연준|\bFed\b|월가|WSJ|뉴욕|노동부|상무부|FOMC|워싱턴|U\.S\.|\bUS\b|\bAmerican?\b|Wall Street")
OTHER_CTX = re.compile(r"중국|일본|유럽|유로존|영국|인도|China|Japan|Europe|euro ?zone|UK\b|India")
KR_CTX = re.compile(r"한국|국내|우리나라|통계청|국가데이터처|한국은행|한은|금통위|관세청|산업통상|기획재정부|코스피")
RESULT = re.compile(r"올랐|상승|오른|하락|내렸|떨어|증가|늘었|감소|줄었|동결|인상했|인하했|결정했|결정됐|나타났|기록|집계|발표했|발표됐|보였|전월 대비|전년 동기|전년 대비|전분기 대비|%")
FORWARD = re.compile(r"확률|예정|앞두|가능성|전망|예상|예측|관전|주목|될 것|할 것|보인다|기대|우려|\?")
HAS_NUM = re.compile(r"\d")
STRONG = re.compile(r"(전월|전년|전분기|전기|지난달|지난해).{0,8}대비|동기 대비|\d[\d.]*\s?%\s?(올|상승|하락|증가|감소|내)|기록했|집계")
DECISION = re.compile(r"동결|인상|인하|결정")


def _sentences(a: dict) -> list[str]:
    parts = [a.get("title", ""), a.get("summary") or "", a.get("summary_ko") or "", a.get("title_ko") or ""]
    parts += a.get("original_facts") or []
    parts += a.get("confirmed_facts") or []
    parts += a.get("verified_facts") or []  # 원문 대조로 확인된 사실
    out = []
    for p in parts:
        out += [s.strip() for s in re.split(r"(?<=[.다음임함])\s+|\n| / ", p) if s.strip()]
    return out


def _country_ok(country: str, text: str, a: dict) -> bool:
    us, kr = bool(US_CTX.search(text)), bool(KR_CTX.search(text))
    if OTHER_CTX.search(text) and not us and not kr:
        return False  # 중국·일본 등 다른 나라 지표
    return us and not kr if country == "US" else kr and not us if country == "KR" else False


def detect(cands: list[dict], cutoff: datetime | None = None) -> dict:
    """후보에 a['indicator'] = {key, name, status(released|upcoming), sentence}를 달고, 결과 요약을 돌려 준다.
    한 기사에 지표가 여럿이면 released를 우선하고 먼저 맞은 하나만 단다."""
    found: dict[str, list[dict]] = {}
    for a in cands:
        if cutoff and a.get("published_at") and datetime.fromisoformat(a["published_at"]) > cutoff:
            continue  # 마감 이후 발행: 당일 브리핑에 포함하지 않는다
        hit = None
        sents = _sentences(a)
        for key, name, country, pat, *_ in INDICATORS:
            rx = re.compile(pat, re.I)
            for s in sents:
                if not rx.search(s):
                    continue
                # 나라 단서는 그 문장 → 기사 제목+언론사 순으로 본다
                if not (_country_ok(country, s, a) or _country_ok(country, a.get("title", "") + a.get("source", ""), a)):
                    continue
                released = bool(RESULT.search(s)) and (bool(HAS_NUM.search(s)) or bool(DECISION.search(s))) and (bool(STRONG.search(s)) or not FORWARD.search(s))
                if not released and not FORWARD.search(s):
                    continue  # 결과도 예정도 아닌 단순 언급은 표시하지 않는다
                cand = {"key": key, "name": name, "status": "released" if released else "upcoming", "sentence": s[:160]}
                if hit is None or (cand["status"] == "released" and hit["status"] != "released"):
                    hit = cand
                if released:
                    break
            if hit and hit["status"] == "released":
                break
        if hit:
            a["indicator"] = hit
            found.setdefault(hit["key"], []).append(
                {"article_id": a["id"], "source": a.get("source"), "published_at": a.get("published_at"),
                 "title": a["title"], "status": hit["status"], "sentence": hit["sentence"]})
    released = {k: [x for x in v if x["status"] == "released"] for k, v in found.items()}
    return {"found": found,
            "released_keys": [k for k, v in released.items() if v],
            "upcoming_keys": [k for k, v in found.items() if not released.get(k)],
            "not_found": [n for k, n, *_ in INDICATORS if k not in found]}


def tag(a: dict) -> str:
    i = a.get("indicator")
    if not i:
        return ""
    state = "발표 결과 기사 후보" if i["status"] == "released" else "발표 예정·전망 기사 (결과로 말하지 않음)"
    return f" | 지표: {i['name']} ({state})"


def to_markdown(log: dict) -> str:
    out = ["# 주요 거시경제 지표 식별 결과", "",
           "수집 마감 이전 기사에서 규칙으로 1차 식별한 결과입니다. 공식 통계 API는 쓰지 않았고, 수치는 기사에 있는 것만 대본에 쓸 수 있습니다.", ""]
    if not log["found"]:
        out += ["식별된 지표 발표 기사가 없습니다.", ""]
    for k, items in log["found"].items():
        out += [f"## {NAME[k]}"]
        for x in items:
            out.append(f"- [{'결과' if x['status'] == 'released' else '예정·전망'}] {x['source']} {(x['published_at'] or '')[:16]} {x['title']} "
                       f"→ \"{x['sentence']}\"")
        out.append("")
    out += ["## 이번 후보에서 찾지 못한 지표", "", ", ".join(log["not_found"]) or "없음", ""]
    return "\n".join(out)
