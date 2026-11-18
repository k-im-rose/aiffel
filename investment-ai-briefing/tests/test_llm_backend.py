"""LLM 백엔드 선택 테스트 (AI 호출 없음: python -m tests.test_llm_backend).
비용 원칙: 종량제 API는 ALLOW_PAID_API=1을 직접 켠 경우에만 자동 선택된다."""
import os
from unittest import mock

from app import llm


def pick(env, which):
    with mock.patch.dict(os.environ, env, clear=True), mock.patch("shutil.which", return_value=which):
        return llm.pick_backend()


def test_api_key_alone_does_not_select_paid_api():
    assert pick({"ANTHROPIC_API_KEY": "x"}, "/usr/bin/claude") == "cli"


def test_paid_api_needs_explicit_opt_in():
    assert pick({"ANTHROPIC_API_KEY": "x", "ALLOW_PAID_API": "1"}, "/usr/bin/claude") == "api"
    assert pick({"ALLOW_PAID_API": "1"}, "/usr/bin/claude") == "cli"  # 키가 없으면 켜도 api가 아니다


def test_explicit_request_is_respected_and_no_option_raises():
    assert llm.pick_backend("cli") == "cli"
    try:
        pick({"ANTHROPIC_API_KEY": "x"}, None)
    except RuntimeError:
        return
    raise AssertionError("방법이 없으면 오류여야 한다")


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
