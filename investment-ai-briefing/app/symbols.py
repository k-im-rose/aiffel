"""종목 검색: 로컬 종목 목록(data/symbols/*.json)에서 기업명·종목 코드·티커·한글 별칭으로 찾는다.

외부 호출은 없다. 목록은 `python -m app.update_symbols`로 내려받아 만든다 (공식 출처, 이용 조건은 meta.json에 기록).
국가는 '상장 시장의 국가'(KR/US)이며 기업 본사 소재지가 아니다. 같은 이름이 다른 시장·국가에 있으면 각각 별개 결과로 나온다.
종목 코드는 문자열로만 다룬다 (국내 코드 앞자리 0 유지).
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIR = Path(os.environ.get("GNJ_SYMBOLS_DIR") or ROOT / "data" / "symbols")  # 테스트에서 가짜 목록으로 바꿀 수 있다
ALIASES = ROOT / "data" / "reference" / "us_ko_aliases.json"
COUNTRY_LABEL = {"KR": "한국", "US": "미국"}
_cache: dict = {}


def norm(s: str) -> str:
    """검색 비교용: 대소문자·공백·기호를 무시한다 (한글은 그대로)."""
    return re.sub(r"[\s\-\.\,\(\)·&'’/]+", "", str(s or "")).casefold()


def load(directory: Path | None = None, aliases: Path | None = None) -> dict:
    """{'records': [...], 'meta': {...}}. 파일이 없으면 records는 빈 목록 (검색 불가, 직접 입력은 가능)."""
    d, a = directory or DIR, aliases or ALIASES
    key = (str(d), str(a), tuple((p.name, p.stat().st_mtime) for p in sorted(d.glob("*.json"))) if d.exists() else ())
    if _cache.get("key") == key:
        return _cache["val"]
    recs, meta = [], {}
    ko = {}
    if a.exists():
        ko = {k: v for k, v in json.loads(a.read_text(encoding="utf-8")).items() if not k.startswith("_")}
    for country in ("kr", "us"):
        f = d / f"{country}.json"
        if f.exists():
            for r in json.loads(f.read_text(encoding="utf-8")):
                r = dict(r)
                r["aliases"] = ko.get(r["code"], []) if r["country"] == "US" else []
                r["_n"] = norm(r["name"]); r["_c"] = norm(r["code"]); r["_a"] = [norm(x) for x in r["aliases"]]
                recs.append(r)
    mf = d / "meta.json"
    if mf.exists():
        meta = json.loads(mf.read_text(encoding="utf-8"))
    val = {"records": recs, "meta": meta}
    _cache.update(key=key, val=val)
    return val


def _rank(r: dict, q: str) -> int | None:
    """낮을수록 먼저. 코드 정확 일치 < 코드 앞부분 < 이름 앞부분 < 별칭 앞부분 < 이름·별칭 포함."""
    if r["_c"] == q: return 0
    if r["_n"] == q or q in r["_a"]: return 1
    if r["_c"].startswith(q): return 2
    if r["_n"].startswith(q): return 3
    if any(x.startswith(q) for x in r["_a"]): return 4
    if q in r["_n"] or any(q in x for x in r["_a"]): return 5
    return None


def search(query: str, limit: int = 12, data: dict | None = None) -> list[dict]:
    q = norm(query)
    if len(q) < 1:
        return []
    out = []
    for r in (data or load())["records"]:
        k = _rank(r, q)
        if k is not None:
            out.append((k, 0 if r["country"] == "KR" else 1, len(r["_n"]), r))
    out.sort(key=lambda t: t[:3])
    return [public(r) for *_, r in out[:limit]]


def public(r: dict) -> dict:
    support = ("news_and_filings" if r["country"] == "KR" else "news_only")
    return {"name": r["name"], "code": r["code"], "market": r["market"], "country": r["country"],
            "country_label": COUNTRY_LABEL.get(r["country"], r["country"]),
            "alias": (r["aliases"][0] if r.get("aliases") else ""), "support": support}
