"""대본 → 두 목소리 MP3 (edge-tts).

edge-tts는 Microsoft Edge의 '소리 내어 읽기' 서비스를 비공식으로 부르는 라이브러리다(LGPLv3).
개인 학습·데모용으로만 쓰고, 배포·상업 서비스에서는 Azure AI Speech 같은 공식 API로 바꿔야 한다.
(자세한 내용: docs/sources_and_licenses.md)

ffmpeg 없이 만들기 위해, 같은 형식(24kHz 48kbps mono MP3)으로 받은 조각을 바이트 단위로 이어 붙인다.
MP3는 프레임 단위 형식이라 같은 설정의 조각은 이어 붙여도 재생된다.
"""
from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

import edge_tts

VOICES = {"A": "ko-KR-SunHiNeural", "B": "ko-KR-InJoonNeural"}
_PRON = Path(__file__).resolve().parent.parent / "data" / "reference" / "pronunciation.json"


def normalize(text: str) -> str:
    """음성으로 읽을 때만 쓰는 표기 변환 (영문 매체명·약어·단위). 대본 원문은 바꾸지 않는다."""
    d = {"replace": {}, "regex": []}
    for f in (_PRON, _PRON.parent.parent.parent / "private" / "pronunciation_private.json"):  # 공개 사전 + 비공개 사전
        if f.exists():
            x = json.loads(f.read_text(encoding="utf-8"))
            d["replace"].update(x.get("replace", {}))
            d["regex"] += x.get("regex", [])
    for k in sorted(d.get("replace", {}), key=len, reverse=True):
        text = text.replace(k, d["replace"][k])
    for pat, rep in d.get("regex", []):
        text = re.sub(pat, rep, text)
    return text


RATE = "+8%"


async def _speak(text: str, voice: str, retries: int = 3) -> bytes:
    for attempt in range(retries):
        try:
            buf = bytearray()
            async for chunk in edge_tts.Communicate(text, voice, rate=RATE).stream():
                if chunk["type"] == "audio":
                    buf += chunk["data"]
            if buf:
                return bytes(buf)
        except Exception:  # 네트워크 오류는 잠시 뒤 다시 시도
            if attempt == retries - 1:
                raise
        await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError("음성 합성 결과가 비어 있습니다: " + text[:40])


async def _render(lines: list[dict], concurrency: int = 4) -> list[bytes]:
    sem = asyncio.Semaphore(concurrency)

    async def one(ln):
        async with sem:
            return await _speak(normalize(ln["text"]), VOICES[ln["speaker"]])
    return await asyncio.gather(*(one(ln) for ln in lines))


def measure_seconds(path: Path) -> float | None:
    """실제 재생 시간(초). macOS afinfo, 없으면 ffprobe. 둘 다 없으면 None."""
    import shutil, subprocess
    try:
        if shutil.which("afinfo"):
            m = re.search(r"estimated duration: ([\d.]+)", subprocess.run(["afinfo", str(path)], capture_output=True, text=True).stdout)
            return float(m.group(1)) if m else None
        if shutil.which("ffprobe"):
            r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                               capture_output=True, text=True)
            return float(r.stdout.strip())
    except Exception:
        return None
    return None


def synthesize(script: dict, out_path: Path) -> dict:
    lines = [ln for ln in script["lines"] if ln["text"].strip()]
    parts = asyncio.run(_render(lines))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    data = b"".join(parts)
    out_path.write_bytes(data)
    # 48kbps 기준 대략 길이
    root = Path(__file__).resolve().parent.parent
    rel = out_path.resolve().relative_to(root) if out_path.resolve().is_relative_to(root) else out_path.name
    approx = round(len(data) * 8 / 48000)
    real = measure_seconds(out_path)
    return {"path": str(rel), "bytes": len(data), "approx_seconds": round(real) if real else approx,
            "measured_seconds": round(real, 1) if real else None, "bitrate_estimate_seconds": approx,
            "voices": VOICES, "n_clips": len(parts)}


if __name__ == "__main__":  # 저장된 대본으로 MP3만 다시 만들기: python -m app.tts demo/outputs/20261117
    import sys
    for d in sys.argv[1:]:
        run_dir = Path(d)
        info = synthesize(json.loads((run_dir / "script.json").read_text(encoding="utf-8")), run_dir / "briefing.mp3")
        print(f"{run_dir}/briefing.mp3 — 약 {info['approx_seconds'] // 60}분 {info['approx_seconds'] % 60}초")
