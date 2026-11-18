"""그내종 로컬 웹 서버 (표준 라이브러리만 사용).

  python -m app.web_server --data demo     # 가상 데모 프로필 (공개 시연용)
  python -m app.web_server --data real     # 내 프로필 (비공개, 이 컴퓨터에서만)

구조: 화면(web/*.html, web/*.js)은 이 서버의 JSON API만 부른다.
  /                 메인: 최신 보고서, 프로필 요약, 지난 브리핑, 아직 점검하지 않은 항목
  /report/<run_id>  날짜별 일일 투자 리서치 보고서 (기존 화면)
  /records          개발·평가 기록: 승인판이 아닌 실행(테스트·재검증·수정 전 판). 일반 목록과 분리
  /mypage           마이페이지: 프로필·메모·점검 목록·지난 브리핑·계정(자리만)
  /onboarding       최초 투자 프로필 설정 (프로필에 종목이 없으면 메인에서 이리로 보낸다)
  /login            로그인·회원가입 화면 시안. 인증은 구현하지 않았고 입력값을 어디에도 보내지 않는다
나중에 모바일용으로 배포할 때는 같은 화면과 API 모양을 유지하고, 저장소(JsonStore)와 인증만 바꾸면 되게 나눴다.

데이터 분리
- AI가 만든 브리핑(읽기 전용): <out_root>/<run_id>/briefing.json, briefing.mp3
- 사용자 데이터(읽기·쓰기): <userdata>/profile.json, memos.json, checks.json — 브리핑을 새로 만들어도 지워지지 않는다

접근 제한
- 기본은 127.0.0.1(이 컴퓨터)에서만 열린다. 인증이 없으므로 --host 0.0.0.0(같은 와이파이의 아이폰)은 집 안 테스트용으로만.
- 정적 파일은 아래 STATIC 목록에 있는 web/ 파일만. 브리핑 폴더도 briefing.json, briefing.mp3만 내보낸다.
  private/, evaluation/, profiles/, data/, 원본 후보 파일(candidates*.json) 등은 어떤 주소로도 나가지 않는다.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import tempfile
import threading
import uuid
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
KST = timezone(timedelta(hours=9))
RUN_ID = re.compile(r"^\d{8}(_[a-z0-9]+)?$")
ITEM_ID = re.compile(r"^[a-z0-9\-]{6,40}$")
HTML, JS, CSS = "text/html; charset=utf-8", "text/javascript; charset=utf-8", "text/css; charset=utf-8"
STATIC = {"/": ("web/index.html", HTML), "/mypage": ("web/mypage.html", HTML), "/archive": ("web/archive.html", HTML), "/onboarding": ("web/onboarding.html", HTML),
          "/login": ("web/login.html", HTML), "/records": ("web/records.html", HTML), "/styleguide": ("web/styleguide.html", HTML), "/style.css": ("web/style.css", CSS),
          **{f"/{n}.js": (f"web/{n}.js", JS) for n in ("common", "main", "report", "mypage", "profile", "onboarding", "records", "archive")}}
MAX_BODY = 200_000

MODES = {
    "demo": {"out_root": "demo/outputs", "userdata": "demo/userdata", "seed_profile": "demo/profile_demo.json"},
    "real": {"out_root": "outputs", "userdata": "userdata", "seed_profile": "profiles/my_profile.json"},
}


class JsonStore:
    """파일 하나에 JSON을 저장한다. 원자적 쓰기(임시 파일 → 교체)와 잠금. 배포 때는 이 클래스만 DB로 바꾼다."""

    def __init__(self, path: Path, default):
        self.path, self.default, self.lock = path, default, threading.Lock()

    def read(self):
        if not self.path.exists():
            return json.loads(json.dumps(self.default))
        return json.loads(self.path.read_text(encoding="utf-8"))

    def write(self, data) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=self.path.parent, suffix=".tmp")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        os.replace(tmp, self.path)


def now() -> str:
    return datetime.now(KST).isoformat(timespec="seconds")


def clean_profile(p: dict, old: dict) -> dict:
    """프로필 검증. 화면에서 바꿀 수 있는 칸만 받고, 내부용 칸(user_id, prompt_*)은 기존 값을 지킨다."""
    def strs(x, n=20):
        return [str(v).strip()[:200] for v in (x or []) if str(v).strip()][:n]
    stocks = []
    for s in (p.get("stocks") or [])[:30]:
        name = str(s.get("name", "")).strip()[:60]
        if not name:
            continue
        stocks.append({"name": name, "ticker": str(s.get("ticker", "")).strip()[:20],
                       "market": str(s.get("market", "")).strip()[:20],
                       "country": str(s.get("country", "")).strip().upper()[:2],  # 상장 시장의 국가 (KR, US). 본사 소재지가 아니다
                       "focus": s.get("focus") is True,  # 집중 분석. 보유·관심 구분과 별개이며 기본은 해제
                       "status": "held" if s.get("status") == "held" else "watchlist",
                       "sector": str(s.get("sector", "")).strip()[:100],
                       "thesis": str(s.get("thesis", "")).strip()[:1000],
                       "keywords": strs(s.get("keywords")), "aliases": strs(s.get("aliases")),
                       "risks": strs(s.get("risks")), "ask_ai": str(s.get("ask_ai", "")).strip()[:500],
                       **({"known_relations": s["known_relations"]} if s.get("known_relations") else {})})
    keep = {k: v for k, v in old.items() if k in ("user_id", "language", "briefing_mix", "_note")
            or k.startswith("prompt_")}
    return {**keep, "macro_topics": strs(p.get("macro_topics")), "interest_industries": strs(p.get("interest_industries")),
            "stocks": stocks, "updated_at": now()}


class App:
    def __init__(self, mode: str):
        cfg = MODES[mode]
        self.mode = mode
        self.out_root = ROOT / cfg["out_root"]
        ud = ROOT / cfg["userdata"]
        prof = ud / "profile.json"
        if not prof.exists():  # 처음 실행: 원래 프로필을 복사해 시작 (원본은 그대로)
            prof.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(ROOT / cfg["seed_profile"], prof)
        self.profile = JsonStore(prof, {})
        self.memos = JsonStore(ud / "memos.json", [])
        self.checks = JsonStore(ud / "checks.json", [])

    def runs(self) -> list[dict]:
        """모든 실행. status: approved(그 날짜의 승인판) / record(개발·평가 기록). 승인은 app/release.py"""
        from app import release
        rel = release.load(self.out_root)["dates"]
        approved = {v["run_id"]: v for v in rel.values()}
        out = []
        for d in sorted(self.out_root.glob("*/briefing.json"), reverse=True):
            if not RUN_ID.match(d.parent.name):
                continue
            b = json.loads(d.read_text(encoding="utf-8"))
            stories = b.get("stories", [])
            out.append({"id": d.parent.name, "date": b["date"], "title": b["title"], "seconds": b["audio"]["seconds"],
                        "mode": b.get("mode"), "cutoff_at": b["cutoff_at"], "is_demo": b.get("is_demo"),
                        # 같은 날짜에 다시 만든 판(오타 수정·재검증)이 있으면 가장 나중 판이 그 날짜의 대표다
                        "published_at": (b.get("revision") or {}).get("at") or b.get("generated_at") or "",
                        "revision_note": (b.get("revision") or {}).get("change", ""),
                        "headlines": [s["headline"] for s in stories[:3]], "n_stories": len(stories),
                        "holdings": sorted({h for s in stories for h in s.get("related_holdings", [])}),
                        "status": "approved" if d.parent.name in approved else "record",
                        "approved_at": approved.get(d.parent.name, {}).get("approved_at")})
        # 날짜 최신순, 같은 날짜 안에서는 나중에 만든 판이 먼저. 브리핑이 없는 날짜는 만들지 않는다
        out.sort(key=lambda r: (r["date"], r["published_at"]), reverse=True)
        return out


class Handler(BaseHTTPRequestHandler):
    app: App = None  # type: ignore

    def log_message(self, fmt, *args):  # 접근 기록은 짧게
        print(f"{self.command} {self.path.split('?')[0]} {args[1] if len(args) > 1 else ''}")

    # --- 응답 도우미
    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def fail(self, status: int, msg: str):
        self.send_json({"error": msg}, status)

    def body(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        if n > MAX_BODY:
            raise ValueError("요청이 너무 큽니다")
        return json.loads(self.rfile.read(n) or b"{}")

    def send_file(self, path: Path, ctype: str):
        size = path.stat().st_size
        rng = self.headers.get("Range")
        start, end = 0, size - 1
        if rng and (m := re.match(r"bytes=(\d*)-(\d*)$", rng)):  # iPhone Safari는 오디오에 Range 요청을 쓴다
            if m.group(1):
                start = int(m.group(1))
                end = int(m.group(2)) if m.group(2) else size - 1
            else:
                start = size - int(m.group(2))
            end = min(end, size - 1)
            if start > end:
                self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return
            self.send_response(HTTPStatus.PARTIAL_CONTENT)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        with path.open("rb") as f:
            f.seek(start)
            left = end - start + 1
            while left > 0:
                chunk = f.read(min(65536, left))
                if not chunk:
                    break
                self.wfile.write(chunk)
                left -= len(chunk)

    # --- 라우팅
    def do_GET(self):
        u = urlparse(self.path)
        p, q = u.path, parse_qs(u.query)
        a = self.app
        if p in STATIC:
            f, ctype = STATIC[p]
            return self.send_file(ROOT / f, ctype)
        if (m := re.fullmatch(r"/report/([^/]+)", p)) and RUN_ID.match(m.group(1)):
            return self.send_file(ROOT / "web/report.html", HTML)
        if p == "/api/symbols":  # 로컬 종목 목록 검색. 외부 호출 없음. 목록이 없으면 available=false (직접 입력은 그대로 가능)
            from app import symbols
            d = symbols.load()
            return self.send_json({"available": bool(d["records"]), "meta": d["meta"],
                                   "results": symbols.search((q.get("q") or [""])[0][:60], 12, d)})
        if p == "/api/meta":
            return self.send_json({"service": "그내종", "tagline": "그래서 내 종목은?", "mode": a.mode,
                                   "today": datetime.now(KST).strftime("%Y-%m-%d")})
        if p == "/api/briefings":  # 일반 목록: 날짜마다 승인판 하나만. 승인판이 없는 날짜는 보이지 않는다
            return self.send_json([r for r in a.runs() if r["status"] == "approved"])
        if p == "/api/records":  # 개발·평가 기록: 승인판이 아닌 실행 전부 (지우지 않고 보존)
            from app import release
            recs = [r for r in a.runs() if r["status"] == "record"]
            for r in recs:  # 승인판이 될 수 없는 이유 (관문). 개발·평가용 정보
                r["gate"] = release.gate(a.out_root / r["id"])
            return self.send_json(recs)
        if m := re.fullmatch(r"/api/briefings/([^/]+)", p):
            rid = m.group(1)
            f = a.out_root / rid / "briefing.json"
            if not RUN_ID.match(rid) or not f.exists():
                return self.fail(404, "브리핑 없음")
            b = json.loads(f.read_text(encoding="utf-8"))
            mine = a.checks.read()
            added = {c.get("ai_ref", {}).get("id") for c in mine if c.get("origin") == "ai"}
            for c in b.get("ai_checks", []):
                c["already_added"] = c["id"] in added
            me = next((r for r in a.runs() if r["id"] == rid), {})
            b["release"] = {"status": me.get("status", "record"), "approved_at": me.get("approved_at")}
            return self.send_json(b)
        if m := re.fullmatch(r"/media/([^/]+)/briefing\.mp3", p):
            rid = m.group(1)
            f = a.out_root / rid / "briefing.mp3"
            if not RUN_ID.match(rid) or not f.exists():
                return self.fail(404, "음성 없음")
            return self.send_file(f, "audio/mpeg")
        if p == "/api/profile":
            return self.send_json(a.profile.read())
        if p == "/api/memos":
            memos = a.memos.read()
            if "date" in q:
                memos = [x for x in memos if x["date"] == q["date"][0]]
            return self.send_json(sorted(memos, key=lambda x: x["created_at"], reverse=True))
        if p == "/api/checks":
            return self.send_json(a.checks.read())
        return self.fail(404, "없는 주소")

    def do_POST(self):
        a, p = self.app, urlparse(self.path).path
        try:
            d = self.body()
        except (ValueError, json.JSONDecodeError) as ex:
            return self.fail(400, str(ex))
        if p == "/api/memos":
            text = str(d.get("text", "")).strip()[:5000]
            date = str(d.get("date", ""))[:10]
            if not text or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                return self.fail(400, "날짜와 내용이 필요합니다")
            with a.memos.lock:
                memos = a.memos.read()
                item = {"id": uuid.uuid4().hex[:12], "date": date, "text": text, "created_at": now(), "updated_at": now()}
                memos.append(item)
                a.memos.write(memos)
            return self.send_json(item, 201)
        if p == "/api/checks":
            text = str(d.get("text", "")).strip()[:500]
            if not text:
                return self.fail(400, "내용이 필요합니다")
            origin = "ai" if d.get("origin") == "ai" else "user"
            with a.checks.lock:
                checks = a.checks.read()
                ref = d.get("ai_ref") if origin == "ai" else None
                if ref and any(c.get("ai_ref", {}).get("id") == ref.get("id") for c in checks):
                    return self.fail(409, "이미 목록에 있습니다")
                item = {"id": uuid.uuid4().hex[:12], "text": text, "origin": origin, "done": False,
                        "created_at": now(), "updated_at": now(), "done_at": None,
                        "briefing_date": str(d.get("briefing_date", ""))[:10] or None}
                if ref:  # AI 추천을 사용자가 직접 골랐을 때만 들어온다
                    item["ai_ref"] = {k: ref.get(k) for k in ("id", "target", "reason", "when", "sources")}
                checks.append(item)
                a.checks.write(checks)
            return self.send_json(item, 201)
        return self.fail(404, "없는 주소")

    def do_PUT(self):
        a, p = self.app, urlparse(self.path).path
        try:
            d = self.body()
        except (ValueError, json.JSONDecodeError) as ex:
            return self.fail(400, str(ex))
        if p == "/api/profile":
            with a.profile.lock:
                prof = clean_profile(d, a.profile.read())
                a.profile.write(prof)
            return self.send_json(prof)
        if m := re.fullmatch(r"/api/(memos|checks)/([^/]+)", p):
            kind, iid = m.groups()
            if not ITEM_ID.match(iid):
                return self.fail(400, "잘못된 id")
            store = a.memos if kind == "memos" else a.checks
            with store.lock:
                items = store.read()
                it = next((x for x in items if x["id"] == iid), None)
                if not it:
                    return self.fail(404, "없음")
                if "text" in d and str(d["text"]).strip():
                    it["text"] = str(d["text"]).strip()[:5000 if kind == "memos" else 500]
                if kind == "checks" and "done" in d:
                    it["done"] = bool(d["done"])
                    it["done_at"] = now() if it["done"] else None
                if kind == "checks" and "important" in d:  # 메인 화면에 먼저 보일 항목
                    it["important"] = bool(d["important"])
                it["updated_at"] = now()
                store.write(items)
            return self.send_json(it)
        return self.fail(404, "없는 주소")

    def do_DELETE(self):
        a, p = self.app, urlparse(self.path).path
        if m := re.fullmatch(r"/api/(memos|checks)/([^/]+)", p):
            kind, iid = m.groups()
            store = a.memos if kind == "memos" else a.checks
            with store.lock:
                items = store.read()
                rest = [x for x in items if x["id"] != iid]
                if len(rest) == len(items):
                    return self.fail(404, "없음")
                store.write(rest)
            return self.send_json({"deleted": iid})
        return self.fail(404, "없는 주소")


def main() -> None:
    ap = argparse.ArgumentParser(description="그내종 로컬 웹 서버")
    ap.add_argument("--data", choices=list(MODES), default="demo")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8777)
    a = ap.parse_args()
    Handler.app = App(a.data)
    if a.host not in ("127.0.0.1", "localhost"):
        print("주의: 인증이 없습니다. 같은 네트워크의 누구나 접속할 수 있으니 집 안 테스트에만 쓰세요.")
    print(f"그내종 ({'가상 데모' if a.data == 'demo' else '내 프로필'}) → http://{a.host}:{a.port}")
    ThreadingHTTPServer((a.host, a.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
