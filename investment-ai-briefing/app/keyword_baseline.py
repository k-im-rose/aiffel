"""기준선 A: 단순 키워드 매칭 (Google 키워드 알림과 같은 방식의 대조군).

제목 + RSS 요약에 종목명·종목코드·종목 키워드·거시경제 관심어 중 하나라도
들어 있으면 '관련'으로 채택한다. Google 알림의 내부 알고리즘을 재현한 것은 아니다.
"""
from __future__ import annotations


def profile_terms(profile: dict) -> list[tuple[str, str]]:
    """(검색어, 연결 대상) 목록. 연결 대상은 종목명 또는 'macro'."""
    terms = []
    for s in profile.get("stocks", []):
        for t in [s.get("name"), s.get("ticker"), *s.get("aliases", []), *s.get("keywords", [])]:
            if t and t != "EXAMPLE":
                terms.append((t, s["name"]))
    for t in profile.get("macro_topics", []):
        terms.append((t, "macro"))
    return terms


def classify(articles: list[dict], profile: dict) -> list[dict]:
    terms = profile_terms(profile)
    out = []
    for a in articles:
        text = f"{a.get('title', '')} {a.get('summary', '')}"
        hits = [(t, target) for t, target in terms if t.lower() in text.lower()]
        out.append({
            "article_id": a["id"],
            "selected": bool(hits),
            "relevance": "relevant" if hits else "irrelevant",
            "matched_terms": sorted({t for t, _ in hits}),
            "matched_targets": sorted({target for _, target in hits}),
        })
    return out
