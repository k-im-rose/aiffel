"""중요 이야기 원문 대조: 여러 매체가 같은 사건을 다른 측면에서 보도할 때, 제목·요약만 비교하지 않고 원문을 읽어 맞춘다.

계기 (2026-11-17): 한 발사체 시험비행을 국내 기사는 "1단 회수 실패", 해외 전문 매체는 "2단 궤도 귀환·포획 성공"으로 보도했다.
요약만 본 대본은 "같은 비행인지 확정하기 어렵다"고 했지만, 원문을 읽으면 같은 비행의 1단·2단 이야기다.

대상: 우선순위 상위 이야기, 중요도 high 기사가 있는 이야기, 여러 매체를 묶은 이야기.
- 원문은 검증하는 순간에만 읽고 저장하지 않는다 (RSS 재사용 범위를 넘지 않기 위해). 리포트에는 확인한 사실 문장과 접근 성공 여부만 남긴다.
- 원문에 접근하지 못하면 그 기사는 요약 범위까지만 쓰고, 확인되지 않은 세부사항을 다른 기사와 억지로 연결하지 않는다.
- 공식 발표·공시 대조: 기업 기본 사실은 company_facts.json(공식 자료), 국내 공시는 OpenDART(키 있을 때).
  경제지표의 공식 발표(BLS·FRED 등) 대조는 아직 연결하지 않았다 (한계로 기록).
"""
from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor
from html import unescape

import requests

from app import llm

UA = "Mozilla/5.0 (Macintosh) investment-ai-briefing/0.1 (personal research PoC)"
MAX_CHARS = 6000
_CACHE: dict[str, tuple[str, str]] = {}

# 언론사가 페이지에 붙인 'AI 기사요약' 같은 자동 요약 블록. 기자가 쓴 본문이 아니므로 검증 근거에서 뺀다.
# (2026-11-17 실패 사례: 한국경제 'AI 기사요약' 문장을 원문으로 착각해 대본에 근거 없는 인과관계가 들어갔다)
AI_SUMMARY_BLOCK = re.compile(r'<div class="summary-news-area".*?</div>\s*</div>', re.S)
PAYWALL_MARK = ("view-limit-notice", "무료 열람 혜택", "구독하고 무제한")


def _strip(html: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S)))).strip()


def fetch_text(url: str) -> tuple[str, str]:
    """(상태, 기자가 쓴 본문 일부). 상태: ok / partial(유료 등으로 일부만 공개) / short / http_<code> / error
    원문은 검증 순간에만 쓰고 저장하지 않는다. 같은 실행 안에서는 메모리에만 캐시한다."""
    if url in _CACHE:
        return _CACHE[url]
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=15)
        if r.status_code != 200:
            return f"http_{r.status_code}", ""
        html = AI_SUMMARY_BLOCK.sub(" ", r.text)
        partial = any(m in html for m in PAYWALL_MARK)
        text = ""
        if "hankyung.com" in url:  # 한국경제: 기사 본문 영역만, 유료 안내 앞까지
            i = html.find('class="article-body"')
            i = i if i >= 0 else html.find('id="articletxt"')
            if i >= 0:
                end = min([j for j in (html.find(m, i) for m in PAYWALL_MARK + ("article-copyright", "기사 스크랩")) if j > i] or [i + 60000])
                text = _strip(html[i:end])
                text = re.sub(r"^[^가-힣A-Za-z]*(class=\S+|id=\S+)\s*", "", text)
        elif 'itemprop="articleBody"' in html:  # 매일경제 등: 표준 본문 표시. 주변의 AI 종목 카드·추천 영역은 쓰지 않는다
            i = html.find('itemprop="articleBody"')
            seg = html[i:i + 80000]
            cut = min([j for j in (seg.find(m) for m in ("무단전재", "Copyright", "ⓒ", "기사 공유", "<footer")) if j > 0] or [len(seg)])
            text = _strip(seg[:cut])
            text = re.sub(r'^itemprop="articleBody"\s*>?\s*', "", text)
        if len(text) < 300:
            import trafilatura
            text = trafilatura.extract(html, include_comments=False, include_tables=False) or ""
        text = re.sub(r"AI 기사요약.*?(니다\.)", " ", text)  # 혹시 남은 자동 요약 문장
        status = ("partial" if partial else "ok") if len(text) >= 300 else "short"
        _CACHE[url] = (status, text[:MAX_CHARS])
        return _CACHE[url]
    except Exception as ex:  # noqa: BLE001
        return "error", str(ex)[:80]


def targets(plan: dict, judged_by: dict, top_n: int = 4) -> list[dict]:
    out = []
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        high = any(judged_by.get(i, {}).get("importance") == "high" for i in s["article_ids"])
        if s["priority"] <= top_n or high or len(s["article_ids"]) > 1:
            out.append(s)
    return out


SYSTEM = """당신은 뉴스 사실 대조 담당입니다. 한 이야기로 묶인 여러 매체의 기사 원문(또는 원문을 못 읽은 경우 요약)을 비교합니다.
- same_event: 기사들이 같은 사건(같은 날짜·같은 대상)을 다루는지. 원문에 날짜·회차·대상이 명시돼 있으면 그것으로 판단합니다. 근거가 없으면 unclear.
- confirmed_facts: 원문에서 확인되는 핵심 사실(수치·날짜·대상 포함)을 한국어로, 각각 근거 기사 id와 함께. 매체마다 다른 측면을 보도했으면 합쳐서 정리합니다.
  (예: A는 1단 회수 실패, B는 같은 비행의 2단 포획 성공 → 두 사실을 모두 적고 같은 비행임을 밝힘)
- conflicts: 매체 간 실제로 어긋나는 내용(수치·사실이 다름). 측면이 다른 것은 충돌이 아닙니다.
- unverified: 원문에 접근하지 못했거나 원문에도 없는 세부사항. 다른 기사와 억지로 연결하지 않습니다.
원문 텍스트에 없는 내용을 만들지 않습니다. 원문을 길게 옮기지 말고 사실만 짧게 씁니다."""

SCHEMA = {
    "type": "object",
    "properties": {"stories": {"type": "array", "items": {
        "type": "object",
        "properties": {
            "priority": {"type": "integer"},
            "same_event": {"type": "string", "enum": ["yes", "no", "unclear", "single_source"]},
            "same_event_basis": {"type": "string"},
            "confirmed_facts": {"type": "array", "items": {
                "type": "object", "properties": {"fact": {"type": "string"},
                                                 "source_ids": {"type": "array", "items": {"type": "string"}}},
                "required": ["fact", "source_ids"], "additionalProperties": False}},
            "conflicts": {"type": "array", "items": {"type": "string"}},
            "unverified": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["priority", "same_event", "same_event_basis", "confirmed_facts", "conflicts", "unverified"],
        "additionalProperties": False}}},
    "required": ["stories"], "additionalProperties": False,
}


def run(plan: dict, articles: dict[str, dict], judged_by: dict, *, model: str = "sonnet") -> tuple[dict, dict]:
    stories = targets(plan, judged_by)
    ids = sorted({i for s in stories for i in s["article_ids"] if i in articles})
    with ThreadPoolExecutor(max_workers=6) as ex:
        fetched = dict(zip(ids, ex.map(lambda i: fetch_text(articles[i]["url"]), ids)))
    blocks = []
    for s in stories:
        blocks.append(f"## 이야기 {s['priority']}: {s['headline']}")
        for i in s["article_ids"]:
            a = articles.get(i)
            if not a:
                continue
            status, text = fetched.get(i, ("skip", ""))
            body = (text + (" (유료 기사: 공개된 부분만)" if status == "partial" else "")) if status in ("ok", "partial") else f"(원문 접근 실패: {status}) 요약: {a.get('summary') or '(없음)'}"
            blocks.append(f"### 기사 {i} | {a['source']} | {a.get('published_at', '')[:16]} | {a['title']}\n{body}")
    r = llm.call("\n\n".join(blocks), system=SYSTEM, schema=SCHEMA, model=model, effort="medium")
    access = {i: fetched[i][0] for i in ids}
    log = {"stories_checked": len(stories), "articles": len(ids),
           "original_ok": sum(1 for v in access.values() if v in ("ok", "partial")), "access": access,
           "results": r.data["stories"],
           "call": {"model": r.model, "seconds": round(r.seconds, 1), "input_tokens": r.input_tokens,
                    "output_tokens": r.output_tokens, "cost_usd": r.cost_usd}}
    # 대본·검증 단계가 쓰도록 이야기에 붙인다. 모델이 돌려준 이야기 번호는 믿지 않고 출처 기사로 맞춘다
    log["mapping"] = attach(plan, r.data["stories"], stories)
    for i in ids:
        articles[i]["original_access"] = access[i]
    return plan, log


def attach(plan: dict, results: list[dict], targets_: list[dict] | None = None) -> dict:
    """연결 규칙은 app/links.py 한곳에 둔다."""
    from app import links
    return links.attach(plan, results, targets_)


def to_markdown(log: dict, plan: dict, articles: dict[str, dict]) -> str:
    out = ["# 원문 대조 리포트", "",
           f"- 대조한 이야기 {log['stories_checked']}개, 기사 {log['articles']}건 중 원문 확인 {log['original_ok']}건",
           "- 원문은 검증하는 순간에만 읽고 저장하지 않았다. 아래는 확인한 사실만 정리한 것이다.", ""]
    # 모델이 돌려준 번호가 아니라, 근거 기사로 다시 붙인 결과(attach)를 기준으로 쓴다
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        x = s.get("corroboration")
        if not x:
            continue
        out += [f"## {s['priority']}. {s['headline']}", "",
                f"- 같은 사건인가: **{x['same_event']}** — {x['same_event_basis']}"]
        out += [f"- 확인: {f['fact']} ({', '.join(f['source_ids'])})" for f in x["confirmed_facts"]]
        out += [f"- 충돌: {c}" for c in x["conflicts"]]
        out += [f"- 확인 안 됨: {u}" for u in x["unverified"]]
        out.append("")
    out += ["## 원문 접근", ""]
    out += [f"- {articles[i]['source']} {articles[i]['title'][:50]} — {st}" for i, st in log["access"].items()]
    return "\n".join(out) + "\n"
