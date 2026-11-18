"""종목 검색 테스트 (외부 호출 없음, 가짜 목록 사용: python -m tests.test_symbols)."""
from pathlib import Path

from app import symbols, update_symbols

FIX = Path(__file__).parent / "fixtures" / "symbols"
DATA = symbols.load(FIX)


def find(q):
    return symbols.search(q, data=DATA)


def test_korean_name_and_code_keeps_leading_zero():
    r = find("삼성")
    assert [x["name"] for x in r[:2]] == ["삼성SDI", "삼성전자"] or {x["name"] for x in r[:2]} == {"삼성전자", "삼성SDI"}
    c = find("005930")
    assert c[0]["name"] == "삼성전자" and c[0]["code"] == "005930" and c[0]["country"] == "KR" and c[0]["market"] == "KOSPI"
    assert all(isinstance(x["code"], str) for x in r)


def test_name_ignores_spaces_and_case():
    assert find("에코프로 비엠")[0]["code"] == "247540"
    assert find("nvidia")[0]["code"] == "NVDA" and find("NVIDIA")[0]["code"] == "NVDA" and find("NvIdIa")[0]["code"] == "NVDA"
    assert find("tsla")[0]["name"] == "Tesla, Inc."


def test_korean_aliases_for_us_stocks():
    assert find("테슬라")[0]["code"] == "TSLA" and find("테슬라")[0]["country"] == "US"
    assert find("애플")[0]["code"] == "AAPL"
    assert find("엔비디아")[0]["code"] == "NVDA"
    assert {x["code"] for x in find("구글")} == {"GOOGL"}  # 가짜 목록에는 GOOGL만 있다


def test_country_is_listing_country_and_markets_are_shown():
    r = find("tesla")[0]
    assert (r["country"], r["country_label"], r["market"]) == ("US", "미국", "NASDAQ")
    k = find("한국전력")[0]
    assert (k["country"], k["market"]) == ("KR", "KOSPI")  # KEP(NYSE ADR)는 별개 결과
    assert {x["country"] for x in find("kepco korea electric") + find("korea electric")} == {"US"}


def test_same_name_in_different_markets_are_separate():
    r = find("example corp")
    assert sorted((x["code"], x["market"]) for x in r) == [("EXA", "NASDAQ"), ("EXB", "NYSE")]


def test_support_scope_is_not_overstated():
    assert find("삼성전자")[0]["support"] == "news_and_filings"
    assert find("apple")[0]["support"] == "news_only"  # 미국 종목: 공시(SEC) 연동 전


def test_no_match_and_empty_data():
    assert find("zzzzzz") == [] and find("") == []
    empty = symbols.load(FIX / "missing_dir")
    assert empty["records"] == [] and symbols.search("삼성", data=empty) == []


def test_parse_sec_filters_otc_and_dedupes():
    raw = {"fields": ["cik", "name", "ticker", "exchange"], "data": [
        [1, "Apple Inc.", "AAPL", "Nasdaq"], [2, "Some OTC", "OTCX", "OTC"], [3, "Apple Inc.", "aapl", "Nasdaq"], [4, "Ford", "F", "NYSE"]]}
    out = update_symbols.parse_sec(raw)
    assert [(x["code"], x["market"], x["country"]) for x in out] == [("AAPL", "NASDAQ", "US"), ("F", "NYSE", "US")]


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
