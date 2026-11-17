"""종목·테마별 기사 검색 (한국경제 사이트 검색).

왜 필요한가: 2026-11-17 매경·한경 RSS 439건에 등록한 코스닥 중소형주 4종목이
한 번도 나오지 않았다. 일반 RSS는 '오늘 많이 쓰인 기사'를 주므로 중소형주 투자자에게는
종목별 검색 수집이 따로 있어야 한다. 매일경제 검색은 자동 접근을 막아서(403) 한국경제만 쓴다.

저장 범위는 검색 결과 화면에 나오는 제목·발췌(약 200자)·날짜·링크다. 기사 본문은 가져오지 않는다.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
from datetime import datetime, timezone, timedelta
from html import unescape
from pathlib import Path

import requests

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent
SEARCH_URL = "https://search.hankyung.com/search/news"
UA = "Mozilla/5.0 (investment-ai-briefing personal research PoC)"

ITEM_RE = re.compile(
    r'<a href="(https://www\.hankyung\.com/article/[0-9A-Za-z]+)"[^>]*>\s*<em class="tit"[^>]*>(.*?)</em>\s*</a>'
    r'\s*<p class="txt">(.*?)</p>\s*<p class="info">(.*?)</p>', re.S)


def clean(text: str) -> str:
    # 검색어 강조 태그(<strong class="keyword">)는 공백 없이 지워야 단어가 쪼개지지 않는다
    text = re.sub(r"</?(strong|em|b)[^>]*>", "", text)
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", text))).strip()


def search(query: str, pages: int = 1) -> list[dict]:
    out = []
    for page in range(1, pages + 1):
        r = requests.get(SEARCH_URL, params={"query": query, "page": page},
                         headers={"User-Agent": UA}, timeout=15)
        r.raise_for_status()
        for link, title, txt, info in ITEM_RE.findall(r.text):
            link = link.rstrip("L") if re.search(r"\d+L$", link) else link
            date = re.search(r'date_time">([\d.]+ [\d:]+)', info)
            published = (datetime.strptime(date.group(1), "%Y.%m.%d %H:%M").replace(tzinfo=KST).isoformat()
                         if date else None)
            summary = clean(txt)
            out.append({
                "id": "s-" + hashlib.sha1(link.encode()).hexdigest()[:10],
                "source": "한국경제",
                "category": "검색:" + query,
                "published_at": published,
                "title": clean(title),
                "summary": summary[:220] + ("…" if len(summary) > 220 else ""),
                "url": link,
                "fetched_at": datetime.now(KST).isoformat(timespec="seconds"),
                "source_type": "news_search",
                "summary_available": bool(summary),
            })
        time.sleep(1.5)  # 사이트에 부담을 주지 않도록 천천히
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description="한국경제 검색으로 종목·테마 기사 수집")
    ap.add_argument("--profile", default="profiles/my_profile.json")
    ap.add_argument("--extra", nargs="*", default=[], help="추가 검색어")
    ap.add_argument("--pages", type=int, default=1)
    args = ap.parse_args()
    profile = json.loads((ROOT / args.profile).read_text(encoding="utf-8"))
    queries = [s["name"] for s in profile["stocks"]] + args.extra
    items, errors = {}, []
    for q in queries:
        try:
            found = search(q, args.pages)
        except requests.RequestException as e:
            errors.append(f"{q}: {e}")
            print(f"  {q}: 실패 ({e})")
            continue
        for it in found:
            items.setdefault(it["id"], it)
        print(f"  {q}: {len(found)}건")
    # 프로필별로 검색 결과를 나눠 저장한다 (가상 데모 프로필의 검색이 실제 프로필 결과와 섞이지 않게)
    out = ROOT / "data" / "raw" / (f"search_{profile.get('user_id', 'default')}_" + datetime.now(KST).strftime("%Y%m%d_%H%M") + ".json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"collected_at": datetime.now(KST).isoformat(timespec="seconds"),
                               "queries": queries, "errors": errors, "items": list(items.values())},
                              ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"총 {len(items)}건 → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
