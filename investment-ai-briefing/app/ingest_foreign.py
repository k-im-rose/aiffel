"""해외 경제뉴스 수집 (원문 영어): CNBC 공식 RSS + Spaceflight News API.

- 저장: 원문 제목(title), 언론사(source), 발행 시각(KST로 변환, published_at), URL, RSS/API가 주는 짧은 요약(summary).
  기사 본문은 가져오지 않는다. 한국어 번역·요약은 선별 뒤 방송에 쓸 기사에만 만든다 (app/translate.py).
- Spaceflight News API는 여러 우주 전문 매체의 기사를 모아 주는 무료 API(키 없음)다. 실제 언론사는 news_site로 보존한다.
- 수집 실패는 '기사 없음'과 구분해 errors에 남긴다. 소스별 건수와 걸린 시간도 남긴다 (해외 뉴스 추가 전후 비교용).

  python -m app.ingest_foreign [--days 2]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import feedparser
import requests

from app.ingest_rss import clean, parse_time

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent
UA = "investment-ai-briefing/0.1 (personal research PoC)"

CNBC = "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id={}"
CNBC_FEEDS = [  # (분야, 피드 id) — CNBC 공식 RSS 목록 기준
    ("Top News", 100003114), ("Economy", 20910258), ("Finance", 10000664),
    ("Technology", 19854910), ("Earnings", 15839135), ("Energy", 19836768),
]
SNAPI = "https://api.spaceflightnewsapi.net/v4/articles/"


def fid(url: str) -> str:
    return "f-" + hashlib.sha1(url.encode()).hexdigest()[:10]


def cnbc(days: int) -> tuple[list[dict], list[str]]:
    cutoff = datetime.now(KST) - timedelta(days=days)
    items, errors = [], []
    for cat, i in CNBC_FEEDS:
        try:
            r = requests.get(CNBC.format(i), headers={"User-Agent": UA}, timeout=15)
            r.raise_for_status()
            for e in feedparser.parse(r.content).entries:
                pub = parse_time(e)
                if not pub or datetime.fromisoformat(pub) < cutoff:
                    continue
                items.append({"id": fid(e.link), "source": "CNBC", "category": cat, "published_at": pub,
                              "title": clean(e.title), "summary": clean(e.get("description", "")),
                              "url": e.link, "lang": "en", "source_type": "news_foreign",
                              "fetched_at": datetime.now(KST).isoformat(timespec="seconds"),
                              "summary_available": bool(e.get("description"))})
        except Exception as ex:  # noqa: BLE001
            errors.append(f"CNBC {cat}: {ex}")
        time.sleep(0.5)
    return items, errors


def spaceflight(days: int) -> tuple[list[dict], list[str]]:
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        r = requests.get(SNAPI, params={"published_at_gte": since, "limit": 100, "ordering": "-published_at"},
                         headers={"User-Agent": UA}, timeout=20)
        r.raise_for_status()
    except Exception as ex:  # noqa: BLE001
        return [], [f"Spaceflight News API: {ex}"]
    items = []
    for a in r.json()["results"]:
        if a["news_site"] == "NASA" and a["title"].startswith("APOD"):
            continue  # 오늘의 천문 사진: 뉴스가 아님
        pub = datetime.fromisoformat(a["published_at"].replace("Z", "+00:00")).astimezone(KST).isoformat()
        items.append({"id": fid(a["url"]), "source": a["news_site"], "category": "Space",
                      "published_at": pub, "title": a["title"], "summary": clean(a.get("summary", ""))[:400],
                      "url": a["url"], "lang": "en", "source_type": "news_foreign",
                      "fetched_at": datetime.now(KST).isoformat(timespec="seconds"),
                      "via": "Spaceflight News API", "summary_available": bool(a.get("summary"))})
    return items, []


def collect(days: int) -> dict:
    t0 = time.perf_counter()
    seen, items, errors, stats = set(), [], [], {}
    for name, fn in (("CNBC", cnbc), ("Spaceflight News API", spaceflight)):
        s = time.perf_counter()
        got, err = fn(days)
        errors += err
        new = [x for x in got if x["url"] not in seen]
        seen.update(x["url"] for x in new)
        items += new
        stats[name] = {"items": len(new), "duplicates_within_source": len(got) - len(new),
                       "seconds": round(time.perf_counter() - s, 1)}
    return {"collected_at": datetime.now(KST).isoformat(timespec="seconds"), "days": days,
            "stats": stats, "seconds": round(time.perf_counter() - t0, 1), "errors": errors, "items": items}


def main() -> None:
    ap = argparse.ArgumentParser(description="해외 경제뉴스 수집 (CNBC RSS, Spaceflight News API)")
    ap.add_argument("--days", type=int, default=2)
    args = ap.parse_args()
    data = collect(args.days)
    out = ROOT / "data" / "raw" / f"foreign_{datetime.now(KST):%Y%m%d_%H%M}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(data["stats"], ensure_ascii=False), f"오류 {len(data['errors'])}건 → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
