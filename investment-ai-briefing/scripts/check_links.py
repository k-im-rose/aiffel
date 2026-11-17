"""저장된 모든 브리핑에서 출처-이야기 연결을 점검한다 (모델 호출 없음).

  python scripts/check_links.py [결과 폴더 ...]   (기본: demo/outputs, outputs)

- plan.json: 원문 대조 결과의 근거 기사가 그 이야기의 기사인지 (links.check_plan)
- briefing.json: 웹에 보이는 사실의 근거 기사가 그 이야기의 출처 목록에 있는지 (links.check_briefing)
- 재연결: 저장된 대조 결과를 지금 규칙(links.attach)으로 다시 붙였을 때 각 결과가 근거 기사의 이야기로 가는지
문제가 있어도 결과 파일은 고치지 않는다. 보존한 개발·평가 기록의 오류는 그대로 보고만 한다.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import copy  # noqa: E402

from app import corroborate, links, release  # noqa: E402

roots = [Path(p) for p in sys.argv[1:]] or [Path("demo/outputs"), Path("outputs")]
bad_approved = 0
for root in roots:
    if not root.exists():
        continue
    approved = {v["run_id"] for v in release.load(root)["dates"].values()}
    for d in sorted(p.parent for p in root.glob("*/briefing.json")):
        plan = json.loads((d / "plan.json").read_text(encoding="utf-8")) if (d / "plan.json").exists() else {"stories": []}
        b = json.loads((d / "briefing.json").read_text(encoding="utf-8"))
        issues = links.check_plan(plan) + links.check_briefing(b)
        # 재연결 시험: 저장된 결과를 번호를 지운 채 다시 붙여도 근거 기사의 이야기로 가는가
        results = [dict(s["corroboration"], priority=None) for s in plan["stories"] if s.get("corroboration")]
        if results and (d / "candidates_judged.json").exists():
            judged = {j["article_id"]: j for j in json.loads((d / "candidates_judged.json").read_text(encoding="utf-8"))}
            p2 = copy.deepcopy(plan)
            log = links.attach(p2, results, corroborate.targets(p2, judged))
            issues += [f"재연결: {x}" for x in links.check_plan(p2)]
            issues += [f"재연결 실패: {u['reason']}" for u in log["unmatched"]]
        tag = "승인판" if d.name in approved else "기록"
        print(f"{str(root)}/{d.name:24} {tag:4} 이야기 {len(b.get('stories', [])):2}  사실 {sum(len(s['facts']) for s in b.get('stories', [])):3}  "
              + ("연결 문제 없음" if not issues else f"연결 문제 {len(issues)}건"))
        for x in issues:
            print("    -", x)
        bad_approved += bool(issues) and d.name in approved
sys.exit(1 if bad_approved else 0)
