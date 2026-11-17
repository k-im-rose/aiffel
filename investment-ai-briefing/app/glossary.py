"""한국은행 『경제금융용어 800선』(2026, 2판) 색인과 조회.

저작권: "Copyright ⓒ BANK OF KOREA. All Rights Reserved". PDF와 이 색인(private/glossary_index.json)은 공개 저장소에 올리지 않는다.
웹에는 정의를 그대로 길게 옮기지 않고, 짧은 인용(한두 문장)과 출처(책 쪽수)만 보여 준다.

색인 만드는 법: 목차의 "용어·····쪽" 줄로 용어와 책 쪽수를 얻고, 본문 해당 쪽에서 용어 머리줄부터 '연관검색어' 전까지를 정의로 잘라 낸다.
  python -m app.glossary build   # private/bok_terms_800.pdf → private/glossary_index.json
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "private" / "bok_terms_800.pdf"
INDEX = ROOT / "private" / "glossary_index.json"
SOURCE = "한국은행, 『경제금융용어 800선』(2026, 2판 1쇄)"
TOC_RE = re.compile(r"^(.+?)[·\s]*·{3,}[·\s]*·?(\d(?:\s?\d){0,2})\s*$")  # 쪽수 숫자 사이에 공백이 끼어 있다 ("1 0")


def _norm(s: str) -> str:
    return re.sub(r"[\s·]", "", s)


def build() -> list[dict]:
    from pypdf import PdfReader
    reader = PdfReader(str(PDF))
    pages = [p.extract_text() or "" for p in reader.pages]
    # 1) 목차: 앞 20쪽 안의 "용어·····쪽"
    toc, pending = [], ""
    for t in pages[:20]:
        for line in t.splitlines():
            line = line.strip()
            m = TOC_RE.match(pending + line)
            if m:
                toc.append((m.group(1).replace("·", " ").strip(), int(m.group(2).replace(" ", ""))))
                pending = ""
            elif line.endswith("·") and len(line) < 40:  # 두 줄로 나뉜 목차 항목
                pending = line.rstrip("· ") + ("/" if line.rstrip("· ").endswith("/") is False and "/" in line else "")
            else:
                pending = ""
    # 2) 책 쪽수 → PDF 쪽 번호: 본문 쪽 상단/하단에 찍힌 책 쪽수로 맞춘다
    offset = None
    for i in range(15, 60):
        if re.search(r"(^|\n)\s*13\s*(\n|$)", pages[i]) and "경기" in pages[i]:
            offset = i - 13
            break
    offset = offset if offset is not None else 17
    heads = {_norm(term) for term, _ in toc}
    out = []
    for term, page in toc:
        key = _norm(term)
        text = "\n".join(pages[page + offset: page + offset + 2])
        lines = text.splitlines()
        start = next((n for n, ln in enumerate(lines) if _norm(ln.split("(")[0]) == key.split("(")[0] or _norm(ln) == key), None)
        if start is None:
            continue
        body = []
        for ln in lines[start + 1:]:
            if "연관검색어" in ln:
                break
            if body and _norm(ln) in heads and len(ln) < 40:  # 다음 용어 머리줄
                break
            if re.fullmatch(r"\s*(\d{1,3}|[ㄱ-ㅎ]|[가-힣A-Za-z·/ ()+\-]{1,40})\s*", ln) and _norm(ln) in heads:
                break
            if re.fullmatch(r"\s*\d{1,3}\s*|\s*[ㄱ-ㅎ]\s*", ln):  # 쪽 번호, 자음 색인
                continue
            body.append(ln.lstrip())
        # 줄바꿈은 단어 중간에서도 일어난다. 실제 띄어쓰기 자리는 줄 끝 공백으로 남아 있으므로 그대로 이어 붙인다
        definition = re.sub(r"\s+", " ", "".join(body)).strip()
        if len(definition) < 40:
            continue
        abbr = re.findall(r"\(([A-Za-z][A-Za-z0-9+&\- ]{1,20})\)", term)
        base = re.sub(r"\s*\(.*?\)", "", term).strip()
        out.append({"term": term, "base": base, "aliases": [a.strip() for a in abbr] + [p.strip() for p in base.split("/") if "/" in base],
                    "book_page": page, "definition": definition})
    INDEX.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    return out


def load() -> list[dict]:
    if not INDEX.exists():
        return []
    return json.loads(INDEX.read_text(encoding="utf-8"))


# 영문 약어로 수록된 용어를 기사·대본에서는 한글 발음으로 쓰는 경우 (800선 수록 여부는 바꾸지 않고 찾는 이름만 더한다)
KO_READING = {"COFIX": ["코픽스"], "ELS": ["주가연계증권"], "ETF": ["상장지수펀드"], "PER": ["주가수익비율"],
              "PBR": ["주가순자산비율"], "ROE": ["자기자본이익률"], "DSR": ["총부채원리금상환비율"], "LTV": ["담보인정비율"],
              "IPO": ["기업공개"], "GDP": ["국내총생산"], "CPI": ["소비자물가지수"], "PPI": ["생산자물가지수"]}


def find_in_text(text: str, index: list[dict] | None = None) -> list[dict]:
    """대본·기사 텍스트에 실제로 나온 800선 용어. 2글자 이하 한글 용어와 2글자 영문 약어는 오탐이 많아 뺀다."""
    index = index if index is not None else load()
    plain = re.sub(r"\s", "", text)
    found = []
    for e in index:
        names = [e["base"]] + e["aliases"] + [k for ab in e["aliases"] for k in KO_READING.get(ab, [])]
        hit = None
        for nm in names:
            if not nm:
                continue
            if re.fullmatch(r"[A-Za-z0-9+&\- ]+", nm):
                if len(nm) >= 3 and re.search(rf"(?<![A-Za-z]){re.escape(nm)}(?![A-Za-z])", text):
                    hit = nm
            elif len(_norm(nm)) >= 3 and _norm(nm) in plain:
                hit = nm
            if hit:
                break
        if hit:
            found.append({**e, "matched": hit, "count": plain.count(_norm(hit)) or text.count(hit)})
    found.sort(key=lambda e: -e["count"])
    return found


def short_quote(definition: str, max_chars: int = 160) -> str:
    """첫 문장(최대 max_chars자)만 인용한다."""
    first = re.split(r"(?<=[다음])\.\s", definition, maxsplit=1)[0]
    first = first if first.endswith(".") else first + "."
    return first if len(first) <= max_chars else first[:max_chars].rstrip() + "…"


if __name__ == "__main__":
    if sys.argv[1:] == ["build"]:
        idx = build()
        print(f"용어 {len(idx)}개 → {INDEX.relative_to(ROOT)}")
        for e in idx[:3] + [x for x in idx if "COFIX" in x["term"]]:
            print(e["term"], e["book_page"], e["aliases"], "|", e["definition"][:120])
