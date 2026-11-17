"""개인화 검증: 같은 30건에 다른 투자자 프로필을 적용해 선택과 근거가 달라지는지 본다.

  python -m app.personalization --base-run evaluation/runs/<haiku 실행 폴더>
기본 프로필(A)의 판정은 이미 돌린 평가 결과(ai_raw.json)를 그대로 쓰고, B만 새로 판정한다.
"""
from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path

from app import relevance_llm

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-run", required=True)
    ap.add_argument("--profile-b", default="fixtures/profile_b.json")
    ap.add_argument("--model", default="haiku")
    args = ap.parse_args()

    rows = list(csv.DictReader((ROOT / "evaluation/labeled_news.csv").open(encoding="utf-8-sig")))
    articles = [{"id": r["id"], "source": r["source"], "category": "", "title": r["title"],
                 "summary": r["summary"]} for r in rows]
    a = {x["article_id"]: x for x in json.loads((ROOT / args.base_run / "ai_raw.json").read_text(encoding="utf-8"))}
    profile_b = json.loads((ROOT / args.profile_b).read_text(encoding="utf-8"))
    b_list, calls = relevance_llm.classify(articles, profile_b, model=args.model, batch_size=15)
    b = {x["article_id"]: x for x in b_list}

    sel_a = {i for i in a if a[i]["selected"]}
    sel_b = {i for i in b if b[i]["selected"]}
    both = sel_a & sel_b
    out_dir = ROOT / "evaluation" / "runs" / f"{datetime.now():%Y%m%d_%H%M%S}_personalization"
    out_dir.mkdir(parents=True, exist_ok=True)
    with (out_dir / "compare.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["no", "title", "A_type", "A_stocks", "A_reason", "B_type", "B_stocks", "B_reason", "same_selection"])
        for r in rows:
            i = r["id"]
            w.writerow([r["no"], r["title"], a[i]["relevance_type"], "|".join(a[i]["related_stocks"]), a[i]["reason"],
                        b[i]["relevance_type"], "|".join(b[i]["related_stocks"]), b[i]["reason"],
                        (i in sel_a) == (i in sel_b)])
    summary = {"profile_a_selected": len(sel_a), "profile_b_selected": len(sel_b), "both": len(both),
               "jaccard": round(len(both) / len(sel_a | sel_b), 3) if sel_a | sel_b else 0,
               "same_type": sum(1 for i in a if a[i]["relevance_type"] == b[i]["relevance_type"]),
               "both_selected_same_reason_type": sum(1 for i in both if a[i]["relevance_type"] == b[i]["relevance_type"]),
               "b_calls": calls}
    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "b_calls"}, ensure_ascii=False))
    print("저장:", out_dir.relative_to(ROOT))


if __name__ == "__main__":
    main()
