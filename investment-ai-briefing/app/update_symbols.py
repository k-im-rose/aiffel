"""종목 목록 내려받기 (월 1회 정도, 손으로 실행): python -m app.update_symbols [--kr] [--us]

- 한국: OpenDART 고유번호 목록(corpCode.xml)의 상장사 + 기업개황(corp_cls)으로 시장(코스피·코스닥·코넥스). DART_API_KEY 필요(.env).
- 미국: SEC company_tickers_exchange.json (키 없음). SEC는 자동 요청에 식별 가능한 User-Agent를 요구하므로
  .env의 SEC_USER_AGENT(예: '앱이름 연락처')를 쓴다. 없으면 일반 이름으로 시도한다.
결과는 data/symbols/{kr,us}.json과 meta.json(출처·갱신일·건수)에 저장한다. 이 폴더는 공개 저장소에 올리지 않는다
(원본 재배포 조건을 확인하기 전까지 로컬에서 내려받는 방식).
"""
from __future__ import annotations

import argparse
import io
import json
import os
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from xml.etree import ElementTree

import requests
from dotenv import load_dotenv

from app.symbols import DIR

DART = "https://opendart.fss.or.kr/api"
SEC_URL = "https://www.sec.gov/files/company_tickers_exchange.json"
KR_MARKET = {"Y": "KOSPI", "K": "KOSDAQ", "N": "KONEX"}
US_EXCHANGE = {"nasdaq": "NASDAQ", "nyse": "NYSE", "cboe": "Cboe", "nyse american": "NYSE American"}  # OTC는 제외


def _write(name: str, data) -> None:
    DIR.mkdir(parents=True, exist_ok=True)
    (DIR / name).write_text(json.dumps(data, ensure_ascii=False, indent=0), encoding="utf-8")


def _meta(key: str, info: dict) -> None:
    f = DIR / "meta.json"
    m = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    m[key] = info
    _write("meta.json", m)


def parse_sec(raw: dict) -> list[dict]:
    """SEC 원본 → 우리 형식. 종목 코드는 티커, 국가는 상장 시장의 국가(US)."""
    f = raw["fields"]; ix = {k: f.index(k) for k in ("name", "ticker", "exchange")}
    out, seen = [], set()
    for row in raw["data"]:
        ex = US_EXCHANGE.get(str(row[ix["exchange"]] or "").strip().lower())
        t = str(row[ix["ticker"]] or "").strip().upper()
        if not ex or not t or (t, ex) in seen:
            continue
        seen.add((t, ex))
        out.append({"name": str(row[ix["name"]]).strip(), "code": t, "market": ex, "country": "US"})
    return out


def update_us() -> int:
    ua = os.environ.get("SEC_USER_AGENT") or "geunaejong-symbol-updater (personal research tool)"
    r = requests.get(SEC_URL, headers={"User-Agent": ua, "Accept-Encoding": "gzip, deflate"}, timeout=60)
    if r.status_code == 403:
        raise SystemExit("SEC가 요청을 거절했습니다(403). SEC는 연락처가 담긴 User-Agent를 요구합니다. "
                         ".env에 SEC_USER_AGENT=\"앱이름 연락처\" 형식으로 넣은 뒤 다시 실행하세요.")
    r.raise_for_status()
    recs = parse_sec(r.json())
    _write("us.json", recs)
    _meta("us", {"source": "SEC company_tickers_exchange.json (sec.gov)", "updated_at": date.today().isoformat(), "count": len(recs),
                 "note": "Nasdaq·NYSE·Cboe·NYSE American 상장. 국가는 상장 시장 기준. 로컬에서 내려받아 사용(재배포 조건 미확인)."})
    return len(recs)


def update_kr(workers: int = 4) -> int:
    key = os.environ.get("DART_API_KEY")
    if not key:
        raise SystemExit("DART_API_KEY가 없습니다. .env에 넣은 뒤 다시 실행하세요.")
    z = zipfile.ZipFile(io.BytesIO(requests.get(f"{DART}/corpCode.xml", params={"crtfc_key": key}, timeout=60).content))
    root = ElementTree.fromstring(z.read(z.namelist()[0]))
    listed = [(e.findtext("corp_name").strip(), e.findtext("stock_code").strip(), e.findtext("corp_code"))
              for e in root.iter("list") if (e.findtext("stock_code") or "").strip()]
    cache_f = DIR / "kr_market_cache.json"
    cache = json.loads(cache_f.read_text(encoding="utf-8")) if cache_f.exists() else {}  # 중단 후 이어서 받는다

    def market(item):
        name, code, corp = item
        if code in cache:
            return code
        for _ in range(3):
            try:
                d = requests.get(f"{DART}/company.json", params={"crtfc_key": key, "corp_code": corp}, timeout=30).json()
                cache[code] = KR_MARKET.get(d.get("corp_cls", ""), "")
                return code
            except Exception:
                time.sleep(1)
        return code
    with ThreadPoolExecutor(workers) as ex:
        list(ex.map(market, listed))
    _write("kr_market_cache.json", cache)
    recs = [{"name": n, "code": c, "market": cache.get(c, ""), "country": "KR"} for n, c, _ in listed if cache.get(c)]
    _write("kr.json", recs)
    _meta("kr", {"source": "OpenDART 고유번호(corpCode.xml)·기업개황(company.json) (opendart.fss.or.kr)", "updated_at": date.today().isoformat(),
                 "count": len(recs), "note": "상장사만. 시장은 기업개황 corp_cls 기준. 로컬에서 내려받아 사용(재배포 조건 미확인)."})
    return len(recs)


if __name__ == "__main__":
    load_dotenv()
    ap = argparse.ArgumentParser()
    ap.add_argument("--kr", action="store_true"); ap.add_argument("--us", action="store_true")
    a = ap.parse_args()
    if a.us or not a.kr:
        print("미국", update_us(), "건")
    if a.kr or not a.us:
        print("한국", update_kr(), "건")
