"""날짜별 최종 승인판 관리.

일반 사용자에게는 날짜마다 승인된 보고서 하나만 보인다. 같은 날짜의 다른 실행(테스트, 재검증, 오타 수정 전 판 등)은
지우지 않고 '개발·평가 기록'으로 남긴다.

승인 기록: <결과 폴더>/releases.json   (AI 결과물과 따로 둔다. 승인은 사람이 하거나, 정규 실행이 관문을 통과했을 때만 자동으로 한다)
  {"dates": {"2026-11-17": {"run_id": "...", "approved_at": "...", "approved_by": "user|auto", "note": "..."}},
   "history": [이전 승인 기록 — 바뀐 승인도 지우지 않는다]}

승인 관문 (모두 통과해야 승인할 수 있다)
  - briefing.json과 briefing.mp3가 있다
  - 출처 대조 최종 결과: 중대 0, 경미 0, 출처-주장 일치 검사 0문장
  - 웹 데이터의 확인된 사실이 모두 그 이야기의 출처 기사에서 나왔다 (links.check_briefing)

  python -m app.release status demo/outputs
  python -m app.release approve demo/outputs 20261117_v3 --note "공개 데모 현재판"
"""
from __future__ import annotations

import argparse
import json
import os
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))


def _path(out_root: Path) -> Path:
    return Path(out_root) / "releases.json"


def load(out_root: Path) -> dict:
    p = _path(out_root)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"dates": {}, "history": []}


def _save(out_root: Path, data: dict) -> None:
    p = _path(out_root)
    fd, tmp = tempfile.mkstemp(dir=p.parent, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, p)


def gate(run_dir: Path) -> list[str]:
    """승인을 막는 이유 목록. 비어 있으면 통과."""
    from app import links
    run_dir = Path(run_dir)
    bj = run_dir / "briefing.json"
    if not bj.exists():
        return ["briefing.json 없음"]
    reasons = []
    if not (run_dir / "briefing.mp3").exists():
        reasons.append("briefing.mp3 없음")
    b = json.loads(bj.read_text(encoding="utf-8"))
    fc = (b.get("checks") or {}).get("fact_check") or {}
    for k, label in (("critical_issues", "중대"), ("minor_issues", "경미"), ("alignment_issues", "출처-주장 불일치")):
        if fc.get(k) is None:
            reasons.append(f"{label} 검사 결과 없음 (이전 검증 방식)")
        elif fc[k]:
            reasons.append(f"출처 대조 {label} {fc[k]}건")
    reasons += [f"연결 오류: {x}" for x in links.check_briefing(b)]
    return reasons


def approve(out_root: Path, run_id: str, *, by: str = "user", note: str = "") -> dict:
    out_root = Path(out_root)
    run_dir = out_root / run_id
    reasons = gate(run_dir)
    if reasons:
        raise ValueError("승인할 수 없습니다: " + " / ".join(reasons))
    date = json.loads((run_dir / "briefing.json").read_text(encoding="utf-8"))["date"]
    data = load(out_root)
    prev = data["dates"].get(date)
    if prev:
        data["history"].append({**prev, "date": date, "replaced_at": datetime.now(KST).isoformat(timespec="seconds")})
    data["dates"][date] = {"run_id": run_id, "approved_at": datetime.now(KST).isoformat(timespec="seconds"),
                           "approved_by": by, "note": note}
    _save(out_root, data)
    return data["dates"][date]


def main() -> None:
    ap = argparse.ArgumentParser(description="날짜별 최종 승인판 관리")
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("status")
    s.add_argument("out_root")
    a = sub.add_parser("approve")
    a.add_argument("out_root")
    a.add_argument("run_id")
    a.add_argument("--note", default="")
    a.add_argument("--by", default="user", help="승인한 사람 (user / auto / 그 밖의 이름)")
    args = ap.parse_args()
    root = Path(args.out_root)
    if args.cmd == "approve":
        print(json.dumps(approve(root, args.run_id, by=args.by, note=args.note), ensure_ascii=False))
        return
    rel = load(root)
    approved = {v["run_id"] for v in rel["dates"].values()}
    for d in sorted(root.glob("*/briefing.json"), reverse=True):
        rid = d.parent.name
        why = gate(d.parent)
        print(f"{rid:28} {'승인판' if rid in approved else '기록':4}  {'관문 통과' if not why else '관문 미통과: ' + ' / '.join(why)}")


if __name__ == "__main__":
    main()
