#!/bin/zsh
# 매일 07:35 (KST) launchd가 실행한다. 수집 → 선별 → 편집 → 대본 → 사실 검증 → MP3 → 비공개 피드 갱신.
# 로그: outputs/logs/daily_YYYYMMDD.log
set -euo pipefail
export TZ="Asia/Seoul"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cd "$(dirname "$0")/.."
mkdir -p outputs/logs
LOG="outputs/logs/daily_$(date +%Y%m%d).log"
PUBLISH=""
if grep -q '^PODCAST_PATH_TOKEN=.\+' .env 2>/dev/null; then PUBLISH="--publish"; fi
{
  echo "=== start $(date '+%F %T %Z')"
  .venv/bin/python -u -m app.pipeline --mode live --collect --export $PUBLISH
  echo "=== done $(date '+%F %T %Z')"
} >> "$LOG" 2>&1 || {
  echo "=== FAILED $(date '+%F %T %Z')" >> "$LOG"
  osascript -e 'display notification "아침 브리핑 생성 실패 — outputs/logs 확인" with title "투자 브리핑"' || true
  exit 1
}
