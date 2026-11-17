"""LLM 호출을 한 곳에 모은다. 백엔드 두 가지:

- api : Anthropic API (ANTHROPIC_API_KEY 필요). 구조화 출력(json_schema)으로 형식을 보장한다.
- cli : Claude Code CLI(`claude -p`). API 키가 없을 때의 대체 수단. 개인 구독으로 돌고,
        형식은 프롬프트로만 요구하므로 응답에서 JSON을 직접 꺼낸다.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
from dataclasses import dataclass

MODELS = {
    "haiku": "claude-haiku-5-5",
    "sonnet": "claude-sonnet-5-5",
}


@dataclass
class LLMResult:
    data: object
    model: str
    backend: str
    seconds: float
    input_tokens: int | None = None
    output_tokens: int | None = None
    cost_usd: float | None = None


# 1M 토큰당 USD (2026-11 공개 가격, 입력/출력)
PRICES = {"claude-haiku-5-5": (0.10, 0.50), "claude-sonnet-5-5": (2.00, 10.00)}


def pick_backend(requested: str | None = None) -> str:
    if requested and requested != "auto":
        return requested
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "api"
    if shutil.which("claude"):
        return "cli"
    raise RuntimeError(
        "LLM을 부를 방법이 없습니다. .env에 ANTHROPIC_API_KEY를 넣거나 Claude Code CLI를 설치하세요. "
        "키 없이 결과만 보려면 --mode sample 로 저장된 결과를 재생하세요.")


def extract_json(text: str):
    text = text.strip()
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if m:
        text = m.group(1)
    start = min([i for i in (text.find("{"), text.find("[")) if i >= 0], default=-1)
    if start < 0:
        raise ValueError("응답에 JSON이 없습니다: " + text[:200])
    return json.loads(text[start:text.rfind("}" if text[start] == "{" else "]") + 1])


def call(prompt: str, *, system: str, schema: dict, model: str = "haiku",
         backend: str | None = None, max_tokens: int = 16000, effort: str = "low") -> LLMResult:
    backend = pick_backend(backend)
    model_id = MODELS.get(model, model)
    t0 = time.perf_counter()

    if backend == "api":
        import anthropic
        client = anthropic.Anthropic()
        resp = client.messages.create(
            model=model_id,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
            output_config={"effort": effort,
                           "format": {"type": "json_schema", "schema": schema}},
        )
        if resp.stop_reason == "refusal":
            raise RuntimeError(f"모델이 응답을 거절했습니다: {resp.stop_details}")
        if resp.stop_reason == "max_tokens":
            raise RuntimeError("max_tokens에 걸려 응답이 잘렸습니다. 한 번에 보내는 기사 수를 줄이세요.")
        text = next(b.text for b in resp.content if b.type == "text")
        u = resp.usage
        pin, pout = PRICES.get(model_id, (0, 0))
        return LLMResult(json.loads(text), model_id, "api", time.perf_counter() - t0,
                         u.input_tokens, u.output_tokens,
                         (u.input_tokens * pin + u.output_tokens * pout) / 1e6)

    # cli 백엔드: Claude Code의 기본 지시문·도구·설정을 모두 끄고, 우리 system 프롬프트와
    # JSON Schema(구조화 출력)만 넘긴다. 같은 모델을 API와 거의 같은 조건으로 부르기 위해서다.
    proc = subprocess.run(
        ["claude", "-p", "--model", model_id, "--output-format", "json",
         "--tools", "", "--no-session-persistence", "--disable-slash-commands",
         "--strict-mcp-config", "--setting-sources", "",
         "--system-prompt", system, "--effort", effort,
         "--json-schema", json.dumps(schema, ensure_ascii=False)],
        input=prompt, capture_output=True, text=True, timeout=900, cwd="/tmp")
    if proc.returncode != 0:
        raise RuntimeError("claude CLI 실패: " + (proc.stderr or proc.stdout)[:500])
    envelope = json.loads(proc.stdout)
    if envelope.get("is_error"):
        raise RuntimeError("claude CLI 오류: " + str(envelope.get("result"))[:500])
    data = envelope.get("structured_output")
    if data is None:
        data = extract_json(envelope["result"])
    usage = next(iter(envelope.get("modelUsage", {}).values()), {})
    return LLMResult(data, f"{model_id} (Claude Code CLI)", "cli",
                     time.perf_counter() - t0,
                     (usage.get("inputTokens") or 0) + (usage.get("cacheCreationInputTokens") or 0)
                     + (usage.get("cacheReadInputTokens") or 0),
                     usage.get("outputTokens"), envelope.get("total_cost_usd"))
