"""출처-이야기 연결 규칙 테스트 (pytest 없이: python -m tests.test_links).

다루는 경우: 모델이 번호를 다시 매김, 대조 대상이 아닌 이야기가 중간에 빠짐, 결과 순서가 섞임, 일부 결과 누락,
근거 기사가 두 이야기에 걸침, 같은 기사가 두 이야기에 쓰임, 근거 없는 결과, 출처에서 뺀 기사, 저장된 결과 점검.
"""
import copy

from app import links


def plan(*stories):
    return {"stories": [{"priority": p, "headline": f"이야기 {p}", "article_ids": ids} for p, ids in stories]}


def res(priority, *fact_sources, unverified=()):
    return {"priority": priority, "same_event": "yes", "same_event_basis": "",
            "confirmed_facts": [{"fact": f"사실({','.join(s)})", "source_ids": list(s)} for s in fact_sources],
            "conflicts": [], "unverified": list(unverified)}


def facts_of(p):
    return {s["priority"]: sorted({i for f in (s.get("corroboration") or {}).get("confirmed_facts", []) for i in f["source_ids"]})
            for s in p["stories"]}


# 7개 이야기 중 5번은 대조 대상이 아님 (2026-11-17 실제 실패와 같은 모양)
BASE = plan((1, ["a1", "a2"]), (2, ["b1"]), (3, ["c1"]), (4, ["d1"]), (5, ["e1"]), (6, ["f1", "f2"]), (7, ["g1", "g2"]))
TARGETS = [s for s in BASE["stories"] if s["priority"] != 5]


def test_renumbered_results_follow_sources():
    p = copy.deepcopy(BASE)
    # 모델이 6·7번 이야기 결과를 5·6번으로 돌려줌
    results = [res(1, ["a1"]), res(2, ["b1"]), res(3, ["c1"]), res(4, ["d1"]), res(5, ["f1", "f2"]), res(6, ["g1"])]
    log = links.attach(p, results, TARGETS)
    got = facts_of(p)
    assert got[5] == [] and got[6] == ["f1", "f2"] and got[7] == ["g1"], got
    assert log["renumbered"] == [{"reported": 5, "actual": 6}, {"reported": 6, "actual": 7}]
    assert links.check_plan(p) == []


def test_shuffled_order_and_missing_result():
    p = copy.deepcopy(BASE)
    # 순서가 섞이고 3번 이야기 결과가 빠짐, 번호도 엉뚱함
    results = [res(9, ["g2"]), res(1, ["d1"]), res(2, ["a1", "a2"])]
    links.attach(p, results, TARGETS)
    got = facts_of(p)
    assert got[7] == ["g2"] and got[4] == ["d1"] and got[1] == ["a1", "a2"] and got[3] == [], got
    assert links.check_plan(p) == []


def test_fact_spanning_two_stories_is_dropped():
    p = copy.deepcopy(BASE)
    log = links.attach(p, [res(1, ["a1"], ["b1"])], TARGETS)  # 근거가 1번·2번 이야기에 걸침
    assert facts_of(p)[1] == [] and facts_of(p)[2] == []
    assert log["unmatched"] and log["matched"] == 0


def test_shared_article_prefers_reported_then_position():
    p = plan((1, ["x", "a"]), (2, ["x", "b"]))
    links.attach(p, [res(2, ["x"])], p["stories"])
    assert facts_of(p) == {1: [], 2: ["x"]}
    p = plan((1, ["x", "a"]), (2, ["x", "b"]))
    log = links.attach(p, [res(8, ["x"])], [p["stories"][0]])  # 번호도 안 맞고 순서도 못 믿음 → 첫 대상 순서로만
    assert facts_of(p) == {1: ["x"], 2: []}, (facts_of(p), log)


def test_no_fact_result_needs_reliable_order():
    p = copy.deepcopy(BASE)
    # 결과 수가 대상 수(6)와 다르면, 근거 없는 결과는 붙이지 않는다 (확인 불가 문구가 엉뚱한 이야기로 가지 않게)
    log = links.attach(p, [res(5, unverified=["원문 접근 실패"])], TARGETS)
    assert all(not s.get("corroboration") for s in p["stories"])
    assert log["unmatched"]
    # 수가 같으면 대상 순서로 붙인다: 5번째 결과 → 6번 이야기
    p = copy.deepcopy(BASE)
    results = [res(1, ["a1"]), res(2, ["b1"]), res(3, ["c1"]), res(4, ["d1"]), res(5, unverified=["x"]), res(6, ["g1"])]
    links.attach(p, results, TARGETS)
    assert p["stories"][5]["corroboration"]["unverified"] == ["x"] and not p["stories"][4].get("corroboration")


def test_one_story_gets_at_most_one_result():
    p = copy.deepcopy(BASE)
    log = links.attach(p, [res(1, ["a1"]), res(1, ["a2"])], TARGETS)
    assert facts_of(p)[1] == ["a1"] and len(log["unmatched"]) == 1


def test_story_facts_drops_foreign_and_removed_sources():
    story = {"priority": 2, "article_ids": ["b1", "b2"]}
    c = res(2, ["b1"], ["b2"], ["z9"], ["b1", "z9"], [])
    assert [f["source_ids"] for f in links.story_facts(story, c)] == [["b1"], ["b2"]]
    assert [f["source_ids"] for f in links.story_facts(story, c, {"b2"})] == [["b1"]]


def test_check_briefing_flags_misattached_fact():
    b = {"stories": [{"priority": 5, "sources": [{"id": "e1"}],
                      "facts": [{"text": "정상회담", "source_ids": ["f1"]}, {"text": "비만치료제", "source_ids": ["e1"]}]}],
         "ai_checks": [{"id": "ai-1", "sources": [{"id": "e1"}]}]}
    assert links.check_briefing(b) == ["이야기 5: 이야기 출처에 없는 기사의 사실 ['f1']"]


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
