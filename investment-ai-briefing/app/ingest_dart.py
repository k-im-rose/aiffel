"""OpenDART 공시 목록 수집 (등록 종목만).

DART_API_KEY가 없으면 호출하지 않고 '조회 불가'를 돌려준다. 대본에는 이 상태를 그대로 말하게 해서
공시가 없는 것처럼 보이지 않게 한다. 키 발급: https://opendart.fss.or.kr
"""
from __future__ import annotations

import io
import os
import zipfile
from datetime import datetime, timedelta
from xml.etree import ElementTree

import requests

API = "https://opendart.fss.or.kr/api"


def _corp_codes(key: str) -> dict[str, str]:
    r = requests.get(f"{API}/corpCode.xml", params={"crtfc_key": key}, timeout=30)
    r.raise_for_status()
    xml = zipfile.ZipFile(io.BytesIO(r.content)).read("CORPCODE.xml")
    return {e.findtext("stock_code").strip(): e.findtext("corp_code")
            for e in ElementTree.fromstring(xml).iter("list") if (e.findtext("stock_code") or "").strip()}


def fetch(profile: dict, days: int = 7) -> dict:
    key = os.environ.get("DART_API_KEY")
    if not key:
        return {"status": "조회 불가 (DART_API_KEY 없음)", "items": []}
    codes = _corp_codes(key)
    end = datetime.now(); start = end - timedelta(days=days)
    items = []
    for s in profile.get("stocks", []):
        corp = codes.get(s.get("ticker", ""))
        if not corp:
            continue  # 해외 종목 등 DART 대상이 아님
        r = requests.get(f"{API}/list.json", params={
            "crtfc_key": key, "corp_code": corp, "bgn_de": f"{start:%Y%m%d}", "end_de": f"{end:%Y%m%d}",
            "page_count": 20}, timeout=30)
        for d in r.json().get("list", []):
            items.append({"id": "d-" + d["rcept_no"], "source": "OpenDART", "category": "공시",
                          "published_at": d["rcept_dt"], "title": f"{d['corp_name']} {d['report_nm']}",
                          "summary": "", "url": f"https://dart.fss.or.kr/dsaf001/main.do?rcpNo={d['rcept_no']}",
                          "source_type": "disclosure"})
    return {"status": f"조회 완료 ({len(items)}건, 최근 {days}일)", "items": items}
