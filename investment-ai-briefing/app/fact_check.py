"""대본 사실 검증 → 수정 → 재검증.

v1 대본에서 실제로 나온 오류 유형(2026-11-17, 상세는 비공개 기록):
- 이미 상장한 기업을 "비상장"이라고 말함 — 출처 없는 대사, 모델의 오래된 사전 지식
- 여러 소식이 묶인 요약에서 다른 회사 이야기를 해당 기업 이야기로 잘못 읽음
출처 id가 있는지, 숫자에 출처가 있는지만 보는 형식 점검으로는 둘 다 못 잡는다. 그래서 주장 단위 검증을 둔다.

검증 기준 (우선순위)
1. 기업 기본 사실(상장 여부·시장·종목코드·확인된 관계): data/reference/company_facts.json (공식 자료로 확인한 값)
   + 규칙 검사 (상장 관련 표현이 사실표와 어긋나면 바로 중대 오류)
2. 수치·날짜·계약: 대사에 붙은 출처 기사의 제목·요약과 수치, 단위, 기준일이 일치하는지
3. 출처 성격: 기업 공시인지, 기사 보도인지, 증권사 의견인지 바꿔 말하지 않았는지
검증 모델은 웹을 보지 않는다. 사실표와 출처 요약에 없는 주장은 '근거 없음'으로 처리한다.
"""
from __future__ import annotations

import json
import os
import re

from app import llm

SYSTEM = """당신은 오디오 브리핑 대본의 사실 검증 담당입니다. 대본의 각 대사에서 사실 주장을 뽑아, 주어진 근거로만 판정합니다.
근거는 두 가지뿐입니다: (1) 기업 기본 사실표 (공식 자료 기준, 가장 우선) (2) 대사에 붙은 출처 기사.
출처 기사마다 [제목], [요약](RSS·검색 요약), [원문](그 주소에서 실제로 읽히는 기자 본문, 상태 표시)이 주어집니다.
당신의 사전 지식으로 판정하지 않습니다.

출처-주장 일치 (가장 중요)
- 대사에 붙은 출처의 [원문]에 그 기업·수치·사건이 실제로 있어야 supported입니다. 출처 번호가 붙어 있다는 것만으로는 근거가 아닙니다.
- [원문]을 읽을 수 있는데(ok 또는 partial) 그 내용이 [요약]에만 있고 [원문]에 없으면 unsupported, category=source_mismatch, critical입니다
  (듣는 사람이 출처 링크를 열어 확인할 수 없기 때문). [원문]을 읽지 못한 경우에만 [요약]을 근거로 씁니다.
- 기사의 주제가 다른 기업인데 이 기업 이야기를 그 기사에 기대어 말하면, [원문]에 이 기업과 수치가 명시돼 있는지 특히 확인합니다.
- 언론사가 붙인 'AI 기사요약' 같은 자동 요약 문장은 근거가 아닙니다.

인과관계
- "A 때문에 B", "A가 반영됐다" 같은 인과 주장은 출처 [원문]이 그렇게 분석했을 때만 supported (category=causal)이고, 대사가 "기사는 ~로 분석했다"처럼 출처의 분석임을 밝혀야 합니다.
- 출처에 없는 원인을 덧붙이거나, 출처의 설명과 다른 원인을 말하면 unsupported 또는 contradicted, critical입니다.
- 해석(interpretation) 대사라도 경제적으로 앞뒤가 맞지 않는 인과(예: 안전자산 선호로 국채금리가 올랐다)는 contradicted, critical로 표시합니다.
문제가 있는 주장만이 아니라, 검증할 대사에 나오는 사실 주장을 모두 나열하고 각각 판정합니다 (supported 포함, fix는 빈 문자열).

판정
- supported: 근거와 일치
- contradicted: 근거와 어긋남 (수치·단위·날짜 다름, 상장 여부·시장·종목코드 다름, 공시를 보도로/보도를 공시로 바꿈, 의견을 사실로 말함, 다른 회사 이야기를 이 회사로 말함)
- unsupported: 근거에 없음 (단, 전문 용어의 일반적 뜻 풀이, 질문, 해석임이 말투로 드러난 문장은 주장으로 뽑지 않습니다)

심각도
- critical: 기업 상장 여부·시장·종목코드, 계약 상대방·금액·기간, 기업 간 사업 관계, 주요 경제지표의 수치·단위·기준일, 공시/기사 구분이 틀리거나 근거가 없는 경우
- minor: 그 밖의 표현상 과장, 근거 없는 사소한 묘사

contradicted 또는 unsupported면 fix에 고친 대사 전문을 적습니다. 근거로 고칠 수 없으면 해당 주장을 뺀 대사를 적고, 대사 전체가 그 주장뿐이면 빈 문자열을 적습니다.
고친 대사도 말투(진행자 A/B)와 흐름을 유지합니다."""

SCHEMA = {
    "type": "object",
    "properties": {"claims": {"type": "array", "items": {
        "type": "object",
        "properties": {
            "line_index": {"type": "integer"},
            "claim": {"type": "string"},
            "category": {"type": "string", "enum": ["company_status", "number", "date", "contract",
                                                    "relationship", "source_type", "source_mismatch", "causal", "other"]},
            "verdict": {"type": "string", "enum": ["supported", "contradicted", "unsupported"]},
            "severity": {"type": "string", "enum": ["critical", "minor"]},
            "evidence": {"type": "string"},
            "fix": {"type": "string"},
        },
        "required": ["line_index", "claim", "category", "verdict", "severity", "evidence", "fix"],
        "additionalProperties": False}}},
    "required": ["claims"],
    "additionalProperties": False,
}

LISTING_NEG = re.compile(r"(비상장|상장(사|기업)?(가|이)? 아(니|닌|님)|상장(되지|하지) 않|상장 전|상장을 앞|증시 입성을 앞|아직 상장)")
LISTING_POS = re.compile(r"(상장(사|기업)|상장돼|상장되어|상장했|상장된)")


def rule_check(script: dict, company_facts: dict) -> list[dict]:
    """상장 여부 표현을 사실표와 대조 (모델 없이). 회사 이름과 같은 대사에 나오면 검사한다."""
    issues = []
    for n, ln in enumerate(script["lines"]):
        for c in company_facts["companies"]:
            names = [c["name"], *c.get("aliases", [])]
            if not any(nm in ln["text"] for nm in names):
                continue
            if c["listed"] and LISTING_NEG.search(ln["text"]):
                issues.append({"line_index": n, "claim": ln["text"], "category": "company_status",
                               "verdict": "contradicted", "severity": "critical",
                               "evidence": f"사실표: {c['name']} 상장 ({c['market']} {c['ticker']}) — {c['sources'][0]}",
                               "fix": "", "by": "rule"})
            if not c["listed"] and LISTING_POS.search(ln["text"]):
                issues.append({"line_index": n, "claim": ln["text"], "category": "company_status",
                               "verdict": "contradicted", "severity": "critical",
                               "evidence": f"사실표: {c['name']} 비상장", "fix": "", "by": "rule"})
    return issues


def verify_tickers_with_dart(company_facts: dict) -> list[str]:
    """DART_API_KEY가 있으면 국내 종목코드를 OpenDART 고유번호 목록으로 확인한다."""
    if not os.environ.get("DART_API_KEY"):
        return ["OpenDART 키 없음: 국내 종목코드는 사용자 등록값을 썼다"]
    from app.ingest_dart import _corp_codes
    codes = _corp_codes(os.environ["DART_API_KEY"])
    out = []
    for c in company_facts["companies"]:
        if c.get("market") in ("KOSPI", "KOSDAQ"):
            out.append(f"{c['name']} {c['ticker']}: {'OpenDART 목록에 있음' if c['ticker'] in codes else '목록에 없음 (확인 필요)'}")
    return out


def source_text(a: dict, with_summary: bool = True) -> str:
    """출처 주소에서 확인할 수 있는 텍스트: 제목 + (RSS 요약) + 읽히는 원문. 검색 스니펫은 원문을 못 읽었을 때만 쓴다."""
    from app.corroborate import fetch_text
    status, body = fetch_text(a["url"]) if a.get("url") else ("none", "")
    a["original_access"] = status
    parts = [a["title"], a.get("title_ko") or ""]
    readable = status in ("ok", "partial")
    if readable:
        parts.append(body)
    if with_summary and (not readable or a.get("source_type") in ("news", "news_foreign")):  # RSS 요약은 언론사가 피드에 공개한 문장
        parts += [a.get("summary") or "", a.get("summary_ko") or ""]
    return " ".join(parts)


NUM_TOKEN = re.compile(r"\d+(?:[.,]\d+)*")


def _num_forms(tok: str) -> list[str]:
    t = tok.replace(",", "")
    return [tok, t] + ([f"{int(float(t)):,}"] if t.replace(".", "").isdigit() and "." not in t and len(t) > 3 else [])


UNIT = {"만": 1e4, "억": 1e8, "조": 1e12, "million": 1e6, "billion": 1e9, "trillion": 1e12}
VAL_RE = re.compile(r"(\d+(?:[.,]\d+)*)\s*(만|억|조|million|billion|trillion)?", re.I)


def _values(text: str) -> set[float]:
    """'170만'·'1.7 million'·'4조2000억'을 같은 수로 비교하기 위한 값 집합."""
    out = set()
    for m in VAL_RE.finditer(text):
        try:
            v = float(m.group(1).replace(",", ""))
        except ValueError:
            continue
        out.add(round(v * UNIT.get((m.group(2) or "").lower(), 1), 6))
    return out


def _supported_number(tok: str, unit: str, ev: str, ev_vals: set[float]) -> bool:
    if any(f in ev for f in _num_forms(tok)):
        return True
    v = float(tok.replace(",", "")) * UNIT.get(unit, 1)
    return any(abs(v - x) <= abs(v) * 0.005 for x in ev_vals)


def align_check(script: dict, articles: dict[str, dict], entity_names: list[str]) -> list[dict]:
    """결정적 검사: 사실 대사의 숫자·기업명이 붙은 출처(제목+원문, 원문 못 읽으면 요약)에 실제로 있는가."""
    issues, cache = [], {}
    for n, ln in enumerate(script["lines"]):
        if ln.get("kind") != "fact" or not ln["source_ids"]:
            continue
        ev = " ".join(cache.setdefault(s, source_text(articles[s])) for s in ln["source_ids"] if s in articles)
        ev_plain = re.sub(r"\s", "", ev)
        ev_vals = _values(ev)
        for sent in re.split(r"(?<=[.?!])\s+", ln["text"]):
            missing = []
            for m in re.finditer(r"(\d+(?:[.,]\d+)*)\s*(만|억|조)?(일|월)?", sent):
                tok, unit, dm = m.group(1), m.group(2) or "", m.group(3)
                if len(tok.replace(",", "").replace(".", "")) < 2 or (dm and not unit):  # 날짜(16일·11월)는 LLM 검증에 맡긴다
                    continue
                if not _supported_number(tok, unit, ev, ev_vals):
                    missing.append(tok + unit)
            missing += [e for e in entity_names if e in sent and re.sub(r"\s", "", e) not in ev_plain]
            if missing:
                issues.append({"line_index": n, "sentence": sent, "missing": missing})
    return issues


def missing_in_sources(text: str, srcs: list[dict], entity_names: list[str]) -> list[str]:
    """문장 하나의 숫자·기업명 중 출처에서 확인되지 않는 것 (웹 '확인된 사실' 거르기에도 쓴다)."""
    ev = " ".join(source_text(a) for a in srcs)
    ev_plain, ev_vals = re.sub(r"\s", "", ev), _values(ev)
    miss = []
    for m in re.finditer(r"(\d+(?:[.,]\d+)*)\s*(만|억|조)?(일|월)?", text):
        tok, unit, dm = m.group(1), m.group(2) or "", m.group(3)
        if len(tok.replace(",", "").replace(".", "")) < 2 or (dm and not unit):
            continue
        if not _supported_number(tok, unit, ev, ev_vals):
            miss.append(tok + unit)
    return miss + [e for e in entity_names if e in text and re.sub(r"\s", "", e) not in ev_plain]


def drop_unaligned(script: dict, issues: list[dict]) -> tuple[dict, list[dict]]:
    """정렬 검사에 걸린 문장을 지운다 (출처로 확인할 수 없는 내용은 말하지 않는다)."""
    lines = [dict(ln) for ln in script["lines"]]
    changes = []
    for it in issues:
        ln = lines[it["line_index"]]
        before = ln["text"]
        ln["text"] = before.replace(it["sentence"], "").strip()
        changes.append({"line_index": it["line_index"], "before": before, "after": ln["text"],
                        "reason": f"출처에서 확인되지 않음: {', '.join(it['missing'])}", "severity": "critical"})
    return {**script, "lines": [ln for ln in lines if ln["text"].strip()]}, changes


def _prompt(script: dict, articles: dict[str, dict], facts_text: str) -> str:
    from app.corroborate import fetch_text
    lines, used = [], []
    for n, ln in enumerate(script["lines"]):
        if ln.get("kind") == "transition" and not re.search(r"\d|상장|계약|공시", ln["text"]):
            continue  # 질문·전환 대사 중 사실 요소가 없는 것은 검증 대상에서 뺀다
        used += [s for s in ln["source_ids"] if s in articles and s not in used]
        lines.append(f"### 대사 {n} ({ln['speaker']}, {ln.get('kind', '-')})\n{ln['text']}\n출처: {', '.join(ln['source_ids']) or '(없음)'}")
    srcs = []
    for s in used:  # 출처마다 한 번만: 제목, 요약, 실제로 읽히는 원문
        a = articles[s]
        status, body = fetch_text(a["url"]) if a.get("url") else ("none", "")
        srcs.append(f"## [{s}] {a['source']} | {a['title']}"
                    + (f" (번역: {a.get('title_ko')})" if a.get("title_ko") else "")
                    + f"\n[요약] {a.get('summary') or '(없음)'}" + (f" (번역: {a.get('summary_ko')})" if a.get("summary_ko") else "")
                    + f"\n[원문 · {status}] {body[:3000] if status in ('ok', 'partial') else '(읽지 못함)'}")
    return (f"# 기업 기본 사실표\n{facts_text}\n\n# 출처 기사\n" + "\n\n".join(srcs)
            + "\n\n# 검증할 대사\n" + "\n\n".join(lines))


def check(script: dict, articles: dict[str, dict], company_facts: dict, facts_text: str,
          *, model: str = "sonnet") -> tuple[list[dict], dict]:
    r = llm.call(_prompt(script, articles, facts_text), system=SYSTEM, schema=SCHEMA, model=model, effort="medium")
    claims = [{**c, "by": "llm"} for c in r.data["claims"]]
    claims += rule_check(script, company_facts)
    return claims, {"model": r.model, "seconds": round(r.seconds, 1), "input_tokens": r.input_tokens,
                    "output_tokens": r.output_tokens, "cost_usd": r.cost_usd}


def apply_fixes(script: dict, claims: list[dict]) -> tuple[dict, list[dict]]:
    """contradicted/unsupported 주장이 있는 대사를 고친 대사로 바꾼다. 규칙 검사만 잡은 대사는 지운다."""
    lines = [dict(ln) for ln in script["lines"]]
    changes = []
    for c in claims:
        if c["verdict"] == "supported":
            continue
        n = c["line_index"]
        if not (0 <= n < len(lines)) or lines[n].get("_fixed"):
            continue
        new = c["fix"].strip() if c["by"] == "llm" else ""
        changes.append({"line_index": n, "before": lines[n]["text"], "after": new, "reason": c["evidence"],
                        "severity": c["severity"]})
        lines[n]["text"], lines[n]["_fixed"] = new, True
    fixed = [{k: v for k, v in ln.items() if k != "_fixed"} for ln in lines if ln["text"].strip()]
    return {**script, "lines": fixed}, changes


def summarize(claims: list[dict]) -> dict:
    bad = [c for c in claims if c["verdict"] != "supported"]
    return {"claims_checked": len(claims), "supported": len(claims) - len(bad),
            "critical_issues": sum(1 for c in bad if c["severity"] == "critical"),
            "minor_issues": sum(1 for c in bad if c["severity"] == "minor")}


# 판정 이름을 사람이 읽는 말로. 'unsupported'는 틀렸다는 뜻이 아니라 출처에서 확인할 수 없다는 뜻이다.
VERDICT_KO = {"supported": "출처와 일치", "contradicted": "출처와 어긋남", "unsupported": "확인 불가 (출처에 없음)"}
# 사실 대사의 근거 수준. 모두 '출처 기사와 맞는가'의 수준이며, 독립 사실 검증(공시·공식 통계 대조)과는 다른 단계다.
EVIDENCE_LEVELS = {"original": "기자 본문에서 확인", "partial": "공개된 일부 본문에서 확인 (유료 기사)",
                   "summary_only": "원문 확인 불가 · 제목·요약 기준", "no_source": "출처 없음"}
SCOPE_NOTE = ("출처 기사 대조 결과다. 독립적인 사실 검증이 아니며, 기업 공시·공식 통계와는 대조하지 않았다. "
              "'중대 오류 0건'은 출처와 어긋난 주장을 찾지 못했다는 뜻이다.")


def evidence_levels(script: dict, articles: dict[str, dict]) -> dict:
    """사실 대사마다 어떤 근거로 확인됐는지 (모델 없이). 붙은 출처 중 하나라도 기자 본문을 읽었으면 original."""
    from app.corroborate import fetch_text
    counts, lines = {k: 0 for k in EVIDENCE_LEVELS}, []
    for n, ln in enumerate(script["lines"]):
        if ln.get("kind") != "fact":
            continue
        sts = []
        for i in ln.get("source_ids", []):
            a = articles.get(i)
            if not a:
                continue
            if not a.get("original_access"):
                a["original_access"] = fetch_text(a["url"])[0] if a.get("url") else "none"
            sts.append(a["original_access"])
        lvl = ("no_source" if not sts else "original" if "ok" in sts else "partial" if "partial" in sts else "summary_only")
        counts[lvl] += 1
        lines.append({"line_index": n, "level": lvl})
    return {"counts": counts, "lines": lines}


def run(script: dict, articles: dict[str, dict], company_facts: dict, facts_text: str,
        *, model: str = "sonnet", max_rounds: int = 2, entity_names: list[str] | None = None) -> tuple[dict, dict]:
    """검증 → 수정을 최대 max_rounds번. 마지막 검증 결과까지 기록한다."""
    log = {"dart_ticker_check": verify_tickers_with_dart(company_facts), "rounds": []}
    for rnd in range(1, max_rounds + 1):
        claims, call = check(script, articles, company_facts, facts_text, model=model)
        s = summarize(claims)
        entry = {"round": rnd, **s, "call": call,
                 "issues": [c for c in claims if c["verdict"] != "supported"]}
        if s["critical_issues"] == 0 and s["minor_issues"] == 0:
            log["rounds"].append(entry)
            break
        script, changes = apply_fixes(script, claims)
        entry["changes"] = changes
        log["rounds"].append(entry)
    else:  # 수정 뒤 마지막 확인
        claims, call = check(script, articles, company_facts, facts_text, model=model)
        log["rounds"].append({"round": "final", **summarize(claims), "call": call,
                              "issues": [c for c in claims if c["verdict"] != "supported"]})
    log["final"] = {k: log["rounds"][-1][k] for k in ("claims_checked", "supported", "critical_issues", "minor_issues")}
    # 마지막 관문: 결정적 출처-주장 일치 검사. 걸린 문장은 지우고 한 번 더 확인한다
    names = entity_names or [n for c in company_facts["companies"] for n in [c["name"], *c.get("aliases", [])]]
    issues = align_check(script, articles, names)
    log["alignment"] = {"issues_before": issues}
    if issues:
        script, changes = drop_unaligned(script, issues)
        log["alignment"]["changes"] = changes
    log["alignment"]["issues_after"] = align_check(script, articles, names)
    log["final"]["alignment_issues"] = len(log["alignment"]["issues_after"])
    # 확인 불가로 빠진 문장 수와 남은 사실 대사의 근거 수준
    al_changes = log["alignment"].get("changes", [])
    removed = [ch for r in log["rounds"] for ch in r.get("changes", []) if not ch["after"]] + [ch for ch in al_changes if not ch["after"]]
    log["final"]["removed_unverifiable"] = len(removed)               # 통째로 뺀 문장
    log["final"]["shortened_unverifiable"] = len([ch for ch in al_changes if ch["after"]])  # 확인 안 된 부분만 뺀 문장
    ev = evidence_levels(script, articles)
    log["final"]["evidence"] = ev["counts"]
    log["evidence_lines"] = ev["lines"]
    log["final"]["official_check"] = "not_done"
    log["final"]["scope"] = SCOPE_NOTE
    return script, log


def to_markdown(log: dict) -> str:
    out = ["# 사실 검증 리포트", "",
           f"- 최종: 주장 {log['final']['claims_checked']}개 중 근거 일치 {log['final']['supported']}개, "
           f"중대 오류 {log['final']['critical_issues']}개, 경미 {log['final']['minor_issues']}개",
           f"- 범위: {SCOPE_NOTE}"]
    ev = log["final"].get("evidence")
    if ev:
        out.append("- 남은 사실 대사의 근거 수준: " + ", ".join(f"{EVIDENCE_LEVELS[k]} {v}개" for k, v in ev.items()))
        out.append(f"- 확인 불가로 빠진 문장: {log['final'].get('removed_unverifiable', 0)}개, 확인 안 된 부분만 뺀 문장: {log['final'].get('shortened_unverifiable', 0)}개 · 공식 통계·공시 대조: 하지 않음")
    out.append("")
    out += [f"- {x}" for x in log["dart_ticker_check"]] + [""]
    out += ["## 검증 범위", "",
            "- **LLM 주장 검증:** 대사마다 사실 주장을 뽑아, 붙은 출처의 [제목·요약]과 그 주소에서 실제로 읽히는 [원문](기자 본문, 유료 기사는 공개된 부분만)과 대조했다. 기업 기본 사실은 사실표(공식 자료)와 대조했다.",
            "- **출처-주장 일치 (결정적 검사):** 사실 대사의 숫자와 기업명이 붙은 출처의 제목·원문(원문을 못 읽은 경우 요약)에 글자 그대로 있는지 확인하고, 없으면 그 문장을 지웠다.",
            "- **하지 않은 것:** 공식 통계·공시 원문(BLS·FRED·DART 등)과의 대조, 출처 기사 자체가 틀렸는지에 대한 판단. '중대 오류 0건'은 이 범위 안에서 근거와 어긋난 주장을 찾지 못했다는 뜻이지, 모든 내용이 사실이라는 보증이 아니다.", ""]
    for r in log["rounds"]:
        out += [f"## 검증 {r['round']}회차", "",
                f"주장 {r['claims_checked']}개, 중대 {r['critical_issues']}개, 경미 {r['minor_issues']}개", ""]
        for c in r["issues"]:
            out.append(f"- [{c['severity']}/{VERDICT_KO.get(c['verdict'], c['verdict'])}/{c['category']}] 대사 {c['line_index']}: {c['claim']}  \n  근거: {c['evidence']}")
        for ch in r.get("changes", []):
            out.append(f"- 수정 (대사 {ch['line_index']}): \"{ch['before']}\" → \"{ch['after'] or '(삭제)'}\"")
        out.append("")
    al = log.get("alignment", {})
    out += ["## 출처-주장 일치 검사 (마지막 관문)", "",
            f"- 걸린 문장: 수정 전 {len(al.get('issues_before', []))}개 → 수정 후 {len(al.get('issues_after', []))}개"]
    out += [f"- 삭제 (대사 {ch['line_index']}): \"{ch['before']}\" → \"{ch['after'] or '(삭제)'}\" — {ch['reason']}" for ch in al.get("changes", [])]
    return "\n".join(out)


if __name__ == "__main__":  # v1 대본에 규칙 검사만 돌려 보기
    import sys
    from pathlib import Path
    facts = json.loads(Path("data/reference/company_facts.json").read_text(encoding="utf-8"))
    for p in sys.argv[1:]:
        sc = json.loads(Path(p).read_text(encoding="utf-8"))
        for i in rule_check(sc, facts):
            print(p, i["line_index"], i["claim"])
