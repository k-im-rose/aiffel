"""시간대 변환과 수집 마감 검사 (pytest 없이: python -m tests.test_time)."""
from datetime import datetime, timedelta, timezone

import feedparser

from app.ingest_rss import parse_time
from app.pipeline import KST, in_window

UTC = timezone.utc


def test_rss_gmt_to_kst():
    # CNBC RSS 형식: GMT → KST(+9)
    e = feedparser.parse("""<rss><channel><item><title>t</title>
      <pubDate>Mon, 16 Nov 2026 22:40:00 GMT</pubDate></item></channel></rss>""").entries[0]
    assert parse_time(e) == "2026-11-17T07:40:00+09:00"


def test_rss_kst_offset_kept():
    e = feedparser.parse("""<rss><channel><item><title>t</title>
      <pubDate>Tue, 17 Nov 2026 07:30:00 +0900</pubDate></item></channel></rss>""").entries[0]
    assert parse_time(e) == "2026-11-17T07:30:00+09:00"


def test_snapi_z_to_kst():
    # Spaceflight News API 형식: ...Z (UTC)
    s = datetime.fromisoformat("2026-11-16T22:36:00Z".replace("Z", "+00:00")).astimezone(KST).isoformat()
    assert s == "2026-11-17T07:36:00+09:00"


def test_cutoff_compares_instants_not_strings():
    cutoff = datetime(2026, 11, 17, 7, 35, tzinfo=KST)
    # 같은 순간을 UTC로 쓴 기사: 문자열로 비교하면 '이전'처럼 보이지만 실제로는 마감 1분 뒤
    after_utc = {"published_at": "2026-11-16T22:36:00+00:00"}
    before_utc = {"published_at": "2026-11-16T22:34:00+00:00"}
    assert in_window(after_utc, cutoff, 1) == "future"
    assert in_window(before_utc, cutoff, 1) == "ok"
    assert in_window({"published_at": "2026-11-17T07:35:00+09:00"}, cutoff, 1) == "ok"   # 마감 시각 정각은 포함
    assert in_window({"published_at": "2026-11-17T08:10:00+09:00"}, cutoff, 1) == "future"
    assert in_window({"published_at": "2026-11-16T07:00:00+09:00"}, cutoff, 1) == "old"
    assert in_window({"published_at": None}, cutoff, 1) == "no_time"
    assert in_window({"published_at": "2026-11-17T07:00:00"}, cutoff, 1) == "no_time"   # 시간대 없는 값은 받지 않는다


def test_past_as_of_has_no_future():
    """과거 시점(--as-of) 실행: 실제 저장된 원본 데이터로 후보를 만들고 마감 이후 기사가 없는지 본다."""
    from app.pipeline import ROOT, assert_no_future, load_candidates
    if not list((ROOT / "data" / "raw").glob("news_*.json")):
        return "건너뜀: data/raw에 수집 원본이 없음 (공개 저장소에는 원본을 올리지 않는다)"
    cutoff = datetime(2026, 11, 17, 7, 35, tzinfo=KST)
    check = {}
    cands = load_candidates(cutoff, 1, 7, 2, check)
    assert_no_future(cands, cutoff)
    assert all(datetime.fromisoformat(c["published_at"]) <= cutoff for c in cands)
    assert check.get("future", 0) > 0  # 오후에 수집한 원본이라 마감 이후 기사가 실제로 걸러져야 한다
    return check, len(cands)


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            r = fn()
            print("ok", name, r if r else "")
