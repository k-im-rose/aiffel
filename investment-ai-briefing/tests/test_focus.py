"""집중 분석 종목 테스트 (AI 호출 없음: python -m tests.test_focus).

확인: 저장·보존, 집중 종목이 없을 때 기존 프롬프트·점수가 그대로인지, 집중 종목이 있을 때만 지침이 붙는지,
규칙 점수 가점이 작아서 더 중요한 다른 기사를 밀어내지 못하는지, 프롬프트 조립(LLM 호출은 가짜로 대체).
"""
import copy
from types import SimpleNamespace

from app import editor, export_web, focus, relevance_llm, script_writer, web_server

BASE = {"user_id": "demo", "macro_topics": ["금리"], "interest_industries": ["자동차"], "briefing_mix": {"stocks": 0.4},
        "stocks": [
            {"name": "가나다", "ticker": "000001", "status": "held", "thesis": "이유 A", "keywords": ["k"], "risks": ["r"], "ask_ai": "확인 요청"},
            {"name": "라마바", "ticker": "000002", "status": "watchlist", "thesis": "이유 B", "keywords": [], "risks": []}]}


def with_focus(*names):
    p = copy.deepcopy(BASE)
    for s in p["stocks"]:
        s["focus"] = s["name"] in names
    return p


def test_names_only_true():
    assert focus.names(BASE) == []
    assert focus.names(with_focus("라마바")) == ["라마바"]  # 관심 종목도 가능
    assert focus.names(with_focus("가나다", "라마바")) == ["가나다", "라마바"]


def test_profile_text_unchanged_without_focus():
    base = relevance_llm.profile_text(BASE)
    assert base == relevance_llm.profile_text(with_focus())  # focus: False를 명시해도 같다
    assert "집중 분석" not in base


def test_profile_text_marks_focus():
    t = relevance_llm.profile_text(with_focus("가나다"))
    assert "[집중 분석] 가나다" in t and t.count("집중 분석") == 2
    assert "이유 A" in t and "확인 요청" in t  # 기존 내용은 그대로


def test_select_system_rule_only_with_focus():
    assert "집중 분석" not in relevance_llm.system_for(BASE)
    s = relevance_llm.system_for(with_focus("가나다"))
    assert "집중 분석 종목" in s and "중요도는 평소 기준 그대로" in s


def cand(i, imp, rel="direct", stocks=()):
    return {"id": i, "title": i, "summary": "요약 있음", "published_at": "2026-11-17T06:00:00+09:00", "lang": "ko"}, \
           {"article_id": i, "relevance_type": rel, "importance": imp, "include_in_podcast": True,
            "duplicate_of": "", "related_stocks": list(stocks)}


def ranked_ids(focus_set):
    pairs = [cand("a", "high"), cand("b", "medium", stocks=["가나다"]), cand("c", "medium"), cand("d", "low", stocks=["가나다"])]
    cands = [p[0] for p in pairs]; judged = [p[1] for p in pairs]
    return [x["id"] for x in editor.pre_rank(cands, judged, limit=10, reserve_foreign=0, focus=focus_set)]


def test_pre_rank_focus_bonus_is_small():
    none = ranked_ids(None)
    assert none == ranked_ids(set())  # 집중 종목이 없으면 순서·점수가 같다
    f = ranked_ids({"가나다"})
    assert f.index("b") < f.index("c")  # 같은 중요도면 집중 종목 관련 기사가 먼저
    assert f[0] == "a"  # 더 중요한 다른 기사를 밀어내지 않는다
    assert f.index("d") > f.index("c")  # 중요도 낮은 기사는 가점으로 올라오지 않는다


def test_pre_rank_no_bonus_without_related_news():
    pairs = [cand("x", "medium"), cand("y", "medium")]
    cands = [p[0] for p in pairs]; judged = [p[1] for p in pairs]
    a = editor.pre_rank(cands, judged, limit=10, reserve_foreign=0, focus={"가나다"})
    assert all(r["personal"] == editor.personal_score(r) for r in a)  # 관련 뉴스가 없으면 가점 없음


class Fake:
    def __init__(self, data):
        self.data = data; self.calls = []

    def __call__(self, prompt, *, system, **kw):
        self.calls.append({"prompt": prompt, "system": system})
        return SimpleNamespace(data=self.data, model="fake", seconds=0, input_tokens=0, output_tokens=0, cost_usd=0)


def test_editor_plan_rule_only_with_focus():
    fake = Fake({"stories": [], "excluded": []})
    orig, editor.llm.call = editor.llm.call, fake
    try:
        editor.plan([], relevance_llm.profile_text(BASE), "날짜")
        editor.plan([], relevance_llm.profile_text(with_focus("가나다")), "날짜")
    finally:
        editor.llm.call = orig
    assert "12. 집중 분석 종목" not in fake.calls[0]["system"]
    assert fake.calls[0]["system"] == editor.SYSTEM
    assert "12. 집중 분석 종목" in fake.calls[1]["system"] and "빼는 이유로 쓰지 않습니다" in fake.calls[1]["system"]


def test_script_writer_rule_only_with_focus():
    fake = Fake({"title": "t", "lines": [], "checks_needed": []})
    orig, script_writer.llm.call = script_writer.llm.call, fake
    plan = {"stories": []}
    try:
        script_writer.write(plan, {}, "날짜", {"companies": []}, profile=BASE)
        script_writer.write(plan, {}, "날짜", {"companies": []}, profile=with_focus("라마바"))
    finally:
        script_writer.llm.call = orig
    assert "집중 분석" not in fake.calls[0]["system"] + fake.calls[0]["prompt"]
    assert "집중 분석" in fake.calls[1]["system"] and "# 집중 분석 종목\n라마바" in fake.calls[1]["prompt"]


def test_clean_profile_keeps_everything_and_defaults_off():
    old = {"user_id": "demo", "briefing_mix": {"stocks": 0.4}, "prompt_theme_examples": "x"}
    p = web_server.clean_profile(copy.deepcopy(BASE), old)
    s0, s1 = p["stocks"]
    assert s0["focus"] is False and s1["focus"] is False  # 기본은 해제 (기존 프로필에는 칸이 없다)
    assert s0["thesis"] == "이유 A" and s0["keywords"] == ["k"] and s0["risks"] == ["r"] and s0["ask_ai"] == "확인 요청"
    assert p["briefing_mix"] == {"stocks": 0.4} and p["prompt_theme_examples"] == "x"  # 내부용 칸 보존
    q = web_server.clean_profile(with_focus("라마바"), old)
    assert [s["focus"] for s in q["stocks"]] == [False, True]  # 보유·관심과 별개
    assert [s["status"] for s in q["stocks"]] == ["held", "watchlist"]
    bad = copy.deepcopy(BASE); bad["stocks"][0]["focus"] = "yes"
    assert web_server.clean_profile(bad, old)["stocks"][0]["focus"] is False  # true만 인정
    c = copy.deepcopy(BASE); c["stocks"][0]["country"] = "us"
    assert web_server.clean_profile(c, old)["stocks"][0]["country"] == "US"


def test_export_prompt_rule_only_with_focus():
    assert "집중 분석" not in export_web.SYSTEM
    assert "집중 분석" in focus.EXPORT_RULE and "아무것도 만들지 않습니다" in focus.EXPORT_RULE
    assert focus.tag({"focus": True}) == " [집중 분석]" and focus.tag({}) == ""


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
