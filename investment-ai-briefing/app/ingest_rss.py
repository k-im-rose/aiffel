"""매일경제·한국경제 공식 RSS에서 기사 메타데이터(제목·요약·링크·시각)를 모은다.

기사 본문은 가져오지 않는다. RSS가 제공하는 범위(제목, 요약)만 저장한다.
수집 실패는 '기사 없음'과 구분해서 errors 목록에 남긴다.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

import feedparser
import requests

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent

FEEDS = [
    # (source, category, url)
    ("매일경제", "경제", "https://www.mk.co.kr/rss/30100041/"),
    ("매일경제", "증권", "https://www.mk.co.kr/rss/50200011/"),
    ("매일경제", "국제", "https://www.mk.co.kr/rss/30300018/"),
    ("매일경제", "기업·경영", "https://www.mk.co.kr/rss/50100032/"),
    ("한국경제", "경제", "https://www.hankyung.com/feed/economy"),
    ("한국경제", "증권", "https://www.hankyung.com/feed/finance"),
    ("한국경제", "국제", "https://www.hankyung.com/feed/international"),
    ("한국경제", "IT", "https://www.hankyung.com/feed/it"),
    ("한국경제", "정치", "https://www.hankyung.com/feed/politics"),
]

UA = "investment-ai-briefing/0.1 (personal research PoC)"


def clean(text: str) -> str:
    text = unescape(re.sub(r"<[^>]+>", " ", text or ""))
    return re.sub(r"\s+", " ", text).strip()


def norm_title(title: str) -> str:
    """중복 판정용 제목: 괄호 머리말·기호·공백 제거."""
    t = re.sub(r"^\s*[\[【(][^\]】)]{1,12}[\]】)]\s*", "", title)
    return re.sub(r"[\W_]+", "", t).lower()


def parse_time(entry) -> str | None:
    for key in ("published", "updated"):
        if entry.get(key):
            try:
                return parsedate_to_datetime(entry[key]).astimezone(KST).isoformat()
            except (TypeError, ValueError):
                pass
    return None


def fetch_feed(source: str, category: str, url: str) -> tuple[list[dict], str | None]:
    try:
        resp = requests.get(url, headers={"User-Agent": UA}, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        return [], f"{source}/{category}: {e}"
    parsed = feedparser.parse(resp.content)
    if parsed.bozo and not parsed.entries:
        return [], f"{source}/{category}: RSS 해석 실패 ({parsed.bozo_exception})"
    fetched_at = datetime.now(KST).isoformat(timespec="seconds")
    items = []
    for e in parsed.entries:
        link = (e.get("link") or "").strip()
        title = clean(e.get("title", ""))
        if not link or not title:
            continue
        summary = clean(e.get("summary", "") or e.get("description", ""))
        items.append({
            "id": "n-" + hashlib.sha1(link.encode()).hexdigest()[:10],
            "source": source,
            "category": category,
            "published_at": parse_time(e),
            "title": title,
            "summary": summary,
            "url": link,
            "fetched_at": fetched_at,
            "source_type": "news",
            "summary_available": bool(summary),
        })
    return items, None


def collect() -> dict:
    all_items, errors, per_feed = {}, [], []
    for source, category, url in FEEDS:
        items, err = fetch_feed(source, category, url)
        per_feed.append({"source": source, "category": category, "url": url,
                         "count": len(items), "error": err})
        if err:
            errors.append(err)
        for it in items:
            # 같은 링크가 여러 피드에 나오면 처음 것만 남기고 카테고리를 덧붙인다
            if it["id"] in all_items:
                all_items[it["id"]].setdefault("also_in", []).append(category)
            else:
                all_items[it["id"]] = it
    return {
        "collected_at": datetime.now(KST).isoformat(timespec="seconds"),
        "feeds": per_feed,
        "errors": errors,
        "items": list(all_items.values()),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="매경·한경 RSS 수집")
    ap.add_argument("--out", default=None, help="저장 경로 (기본: data/raw/news_<시각>.json)")
    args = ap.parse_args()
    result = collect()
    out = Path(args.out) if args.out else ROOT / "data" / "raw" / (
        "news_" + datetime.now(KST).strftime("%Y%m%d_%H%M") + ".json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    for f in result["feeds"]:
        status = f["error"] or f"{f['count']}건"
        print(f"  {f['source']:<5} {f['category']:<6} {status}")
    print(f"총 {len(result['items'])}건 (링크 기준 중복 제거) → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
