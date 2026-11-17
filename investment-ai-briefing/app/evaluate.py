"""키워드 기준선(A)과 LLM 판정(B)을 사람이 먼저 단 정답과 비교한다.

정답 CSV(evaluation/labeled_news.csv)의 label 열:
  direct / industry_policy / theme / macro  → '관련' (브리핑에 넣을 기사)
  irrelevant                                 → '무관'
  uncertain                                  → 사람도 판단하기 어려운 기사 (정밀도·재현율에서 빼고 따로 보고)
- LLM의 uncertain은 브리핑의 '확인 필요' 칸으로 가므로 '선택'으로 센다 (누락을 더 위험하게 보기 때문).
  엄격 기준(relevant만 선택)도 함께 보고한다.
"""
from __future__ import annotations

import argparse
import csv
import json
import time
from datetime import datetime
from pathlib import Path

from app import keyword_baseline, relevance_llm

LABELS = {"direct", "industry_policy", "theme", "macro", "irrelevant", "uncertain"}

# 라벨링 뒤 사용자가 "기존 6개 라벨로는 의도를 담기 어렵다"고 밝힌 기사 (정답은 그대로 두고 영향만 따로 계산)
TAXONOMY_GAP_IDS = {"n-7e1ce24dba": "6번 은행 ATM 폐쇄 (새 사업 기회 관점)",
                    "s-e5f3a2055b": "10번 中 수능 부정행위 (시험 보안 수요 관점)"}


def to_binary(label: str) -> str:
    if label in relevance_llm.RELEVANT_TYPES:
        return "relevant"
    return label  # irrelevant / uncertain

ROOT = Path(__file__).resolve().parent.parent


def load_labels(path: Path) -> list[dict]:
    """기사 정보는 CSV에서, 정답은 CSV 또는 엑셀(.xlsx)에서 읽는다 (id로 맞춘다)."""
    csv_path = path.with_suffix(".csv")
    with csv_path.open(encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    if path.suffix == ".xlsx":
        from openpyxl import load_workbook
        ws = load_workbook(path, read_only=True)["라벨"]
        it = ws.iter_rows(values_only=True)
        header = list(next(it))
        filled = {r[header.index("id")]: dict(zip(header, r)) for r in it if r and r[header.index("id")]}
        for r in rows:
            x = filled.get(r["id"], {})
            for col in ("label", "related_stocks", "importance", "note"):
                r[col] = str(x.get(col) or "").strip()
    missing = [r["id"] for r in rows if r.get("label", "").strip() not in LABELS]
    if missing:
        raise SystemExit(f"정답이 비어 있거나 잘못된 행이 {len(missing)}개 있습니다: {missing[:5]} …\n"
                         "label 열에 " + " / ".join(sorted(LABELS)) + " 중 하나를 적어 주세요.")
    return rows


def metrics(gold: dict[str, str], selected: dict[str, bool]) -> dict:
    ids = [i for i, g in gold.items() if g in ("relevant", "irrelevant")]
    tp = sum(1 for i in ids if gold[i] == "relevant" and selected[i])
    fp = sum(1 for i in ids if gold[i] == "irrelevant" and selected[i])
    fn = sum(1 for i in ids if gold[i] == "relevant" and not selected[i])
    tn = sum(1 for i in ids if gold[i] == "irrelevant" and not selected[i])
    p = tp / (tp + fp) if tp + fp else 0.0
    r = tp / (tp + fn) if tp + fn else 0.0
    return {"n": len(ids), "tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": round(p, 3), "recall": round(r, 3),
            "f1": round(2 * p * r / (p + r), 3) if p + r else 0.0,
            "selected_count": sum(1 for i in ids if selected[i])}


def main() -> None:
    ap = argparse.ArgumentParser(description="키워드 vs LLM 관련성 평가")
    ap.add_argument("--labels", default="evaluation/labeled_news.xlsx", help="엑셀(.xlsx) 또는 CSV")
    ap.add_argument("--profile", default="profiles/my_profile.json")
    ap.add_argument("--model", default="haiku", help="haiku | sonnet | 모델 ID")
    ap.add_argument("--backend", default="auto", help="auto | api | cli")
    ap.add_argument("--batch-size", type=int, default=15)
    ap.add_argument("--tag", default=None, help="결과 폴더 이름에 붙일 표시")
    args = ap.parse_args()

    rows = load_labels(ROOT / args.labels)
    profile = json.loads((ROOT / args.profile).read_text(encoding="utf-8"))
    articles = [{"id": r["id"], "source": r["source"], "category": r.get("category", ""),
                 "title": r["title"], "summary": r["summary"]} for r in rows]
    gold_type = {r["id"]: r["label"].strip() for r in rows}
    gold = {i: to_binary(t) for i, t in gold_type.items()}

    t0 = time.perf_counter()
    kw = keyword_baseline.classify(articles, profile)
    kw_sec = time.perf_counter() - t0

    t0 = time.perf_counter()
    ai, calls = relevance_llm.classify(articles, profile, model=args.model,
                                       backend=args.backend, batch_size=args.batch_size)
    ai_sec = time.perf_counter() - t0

    kw_by = {k["article_id"]: k for k in kw}
    ai_by = {a["article_id"]: a for a in ai}
    report = {
        "run_at": datetime.now().isoformat(timespec="seconds"),
        "labels_file": args.labels, "profile_file": args.profile,
        "model": calls[0]["model"] if calls else args.model, "backend": calls[0]["backend"] if calls else None,
        "n_articles": len(rows),
        "gold_counts": {k: sum(1 for g in gold.values() if g == k) for k in ("relevant", "irrelevant", "uncertain")},
        "keyword": {**metrics(gold, {i: kw_by[i]["selected"] for i in gold}), "seconds": round(kw_sec, 4)},
        "ai_lenient": {**metrics(gold, {i: ai_by[i]["selected"] for i in gold}), "seconds": round(ai_sec, 2)},
        "ai_strict": metrics(gold, {i: ai_by[i]["relevance_type"] in relevance_llm.RELEVANT_TYPES for i in gold}),
        "ai_uncertain_count": sum(1 for a in ai if a["relevance_type"] == "uncertain"),
        "ai_missing_count": sum(1 for a in ai if a["relevance_type"] == "missing"),
        "type_agreement": round(sum(1 for i in gold if gold_type[i] == ai_by[i]["relevance_type"]) / len(gold), 3),
        "llm_calls": calls,
        "llm_cost_usd": round(sum(c["cost_usd"] or 0 for c in calls), 5),
    }

    def subset(ids_out):
        g = {i: v for i, v in gold.items() if i not in ids_out}
        return {"keyword": metrics(g, {i: kw_by[i]["selected"] for i in g}),
                "ai_lenient": metrics(g, {i: ai_by[i]["selected"] for i in g})}
    report["direct_missed"] = {  # 중요 뉴스 누락: 정답 direct(보유·관심 종목 직접 뉴스)를 버린 건
        "keyword": [i for i in gold if gold_type[i] == "direct" and not kw_by[i]["selected"]],
        "ai": [i for i in gold if gold_type[i] == "direct" and not ai_by[i]["selected"]]}
    conf = {}
    for i in gold:
        k = f"{gold_type[i]} -> {ai_by[i]['relevance_type']}"
        conf[k] = conf.get(k, 0) + 1
    report["type_confusion"] = dict(sorted(conf.items(), key=lambda x: -x[1]))
    report["without_taxonomy_gap"] = subset(set(TAXONOMY_GAP_IDS))
    report["taxonomy_gap_items"] = {i: {"note": n, "gold": gold_type[i], "keyword_selected": kw_by[i]["selected"],
                                        "ai_type": ai_by[i]["relevance_type"], "ai_reason": ai_by[i]["reason"]}
                                    for i, n in TAXONOMY_GAP_IDS.items() if i in gold}

    tag = args.tag or f"{args.model}_{report['backend']}"
    out_dir = ROOT / "evaluation" / "runs" / f"{datetime.now():%Y%m%d_%H%M%S}_{tag}"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "metrics.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    with (out_dir / "results.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "title", "gold_label", "keyword_selected", "keyword_terms",
                    "ai_type", "ai_importance", "ai_related_stocks", "ai_reason", "ai_confirmed_facts",
                    "ai_needs_check", "ai_duplicate_of", "keyword_correct", "ai_correct"])
        for r in rows:
            i = r["id"]; k = kw_by[i]; a = ai_by[i]; g = gold[i]
            def ok(sel):
                return "" if g == "uncertain" else ("O" if sel == (g == "relevant") else "X")
            w.writerow([i, r["title"], gold_type[i], k["selected"], "|".join(k["matched_terms"]),
                        a["relevance_type"], a["importance"], "|".join(a["related_stocks"]), a["reason"],
                        " / ".join(a["confirmed_facts"]), a["needs_check"], a["duplicate_of"],
                        ok(k["selected"]), ok(a["selected"])])
    (out_dir / "ai_raw.json").write_text(json.dumps(ai, ensure_ascii=False, indent=1), encoding="utf-8")

    def line(name, m):
        return (f"| {name} | {m['precision']:.0%} | {m['recall']:.0%} | {m['f1']:.2f} | "
                f"{m['fp']} | {m['fn']} | {m['selected_count']}/{m['n']} |")
    print(f"\n정답 분포: {report['gold_counts']}  (정밀도·재현율은 정답 uncertain 제외 {report['keyword']['n']}건)")
    print("| 방식 | 정밀도 | 재현율 | F1 | 오탐 | 누락 | 선택 |\n|---|---|---|---|---|---|---|")
    print(line("A 키워드", report["keyword"]))
    print(line(f"B {args.model} (uncertain 포함)", report["ai_lenient"]))
    print(line(f"B {args.model} (relevant만)", report["ai_strict"]))
    print(f"정답 direct 누락: 키워드 {len(report['direct_missed']['keyword'])}건, AI {len(report['direct_missed']['ai'])}건 "
          f"| 유형 일치율 {report['type_agreement']:.0%}")
    w = report["without_taxonomy_gap"]
    print("6·10번 제외 시: " + line("A 키워드", w["keyword"]) + " " + line("B AI", w["ai_lenient"]))
    print(f"\n처리 시간: 키워드 {kw_sec:.3f}초, AI {ai_sec:.1f}초 ({len(calls)}회 호출), "
          f"AI 비용 약 ${report['llm_cost_usd']}")
    print(f"결과 저장: {out_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
