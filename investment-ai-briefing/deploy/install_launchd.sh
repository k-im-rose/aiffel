#!/bin/zsh
# 매일 07:35 자동 실행 등록 (사용자가 직접 실행). plist의 __PROJECT_DIR__을 이 프로젝트 경로로 바꿔 설치한다.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/Library/LaunchAgents/com.investment-briefing.daily.plist"
mkdir -p "$DIR/outputs/logs"
sed "s#__PROJECT_DIR__#$DIR#g" "$DIR/deploy/com.investment-briefing.daily.plist" > "$DEST"
launchctl unload "$DEST" 2>/dev/null || true
launchctl load "$DEST"
echo "등록됨: 매일 07:35 (맥 시간대 기준) → $DEST"
