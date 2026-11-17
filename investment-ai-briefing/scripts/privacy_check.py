"""공개 전 노출 검사: 실제 투자 정보가 공개될 파일에 들어 있지 않은지 본다. 하나라도 걸리면 종료 코드 1.

검사 대상 = Git이 올릴 파일 (이미 추적 중인 파일 + .gitignore에 걸리지 않는 새 파일). 이 프로젝트 폴더 안만 본다.
검사 단어 = 비공개 실제 프로필(profiles/my_profile.json, userdata/profile.json)에서 자동으로 뽑는다:
  종목명·별칭·종목코드, 투자 이유·확인된 관계·프롬프트 예시 문장의 12자 이상 조각.
  (검사 단어 목록 자체는 화면에 출력하지 않는다)
추가로 Git 커밋 기록 전체에서 종목명·종목코드를 찾는다.

  python scripts/privacy_check.py
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIVATE_PROFILES = [ROOT / "profiles" / "my_profile.json", ROOT / "userdata" / "profile.json"]
BINARY = {".mp3", ".png", ".jpg", ".pdf", ".numbers", ".xlsx", ".pyc"}


def terms() -> tuple[list[str], list[str]]:
    names, phrases = set(), set()
    for p in PRIVATE_PROFILES:
        if not p.exists():
            continue
        prof = json.loads(p.read_text(encoding="utf-8"))
        for s in prof.get("stocks", []):
            for n in [s.get("name"), s.get("ticker"), *s.get("aliases", [])]:
                if n and len(n) >= 2:
                    names.add(n)
            for long in (s.get("thesis", ""), s.get("known_relations", "")):
                for sent in re.split(r"[.。]\s*", long):
                    sent = sent.strip()
                    if len(sent) >= 12:
                        phrases.add(sent[:30])
        for k, v in prof.items():
            if k.startswith("prompt_") and isinstance(v, str):
                phrases.add(v.split("\n")[0][:30])
    return sorted(names), sorted(phrases)


def files_to_publish() -> list[Path]:
    def git(*a):
        return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True).stdout.splitlines()
    tracked = git("ls-files", ".")
    new = git("ls-files", "--others", "--exclude-standard", ".")
    return sorted({ROOT / f for f in tracked + new if (ROOT / f).is_file()})


def main() -> int:
    names, phrases = terms()
    if not names:
        print("비공개 실제 프로필을 찾지 못해 검사 단어가 없습니다. (검사 불가)")
        return 1
    hits = []
    files = files_to_publish()
    for f in files:
        if f.suffix.lower() in BINARY:
            hits.append((f, "바이너리 파일 (내용 검사 불가, 공개 여부를 직접 판단)")) if f.suffix.lower() in {".mp3", ".pdf", ".numbers", ".xlsx"} else None
            continue
        text = f.read_text(encoding="utf-8", errors="ignore")
        found = [n for n in names if re.search(rf"(?<![0-9A-Za-z가-힣]){re.escape(n)}", text)]
        found += [ph for ph in phrases if ph in text]
        if found:
            hits.append((f, f"실제 프로필 단어 {len(found)}개"))
    # Git 기록 전체
    hist = subprocess.run(["git", "log", "--all", "-p", "--", "."], cwd=ROOT, capture_output=True, text=True).stdout
    hist_hits = sum(1 for n in names if n in hist)

    print(f"공개 대상 파일 {len(files)}개 검사")
    for f, why in hits:
        print(f"  ✗ {f.relative_to(ROOT)} — {why}")
    print(f"Git 기록(이 폴더) 속 실제 종목 단어: {hist_hits}개")
    ok = not hits and hist_hits == 0
    print("통과: 공개 파일에서 실제 투자 정보가 발견되지 않았습니다." if ok else "실패: 위 파일을 비공개로 옮기거나 .gitignore에 넣으세요.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
