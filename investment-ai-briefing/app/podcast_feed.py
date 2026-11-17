"""비공개 팟캐스트 피드: 날짜별 MP3와 feed.xml을 S3 호환 저장소(기본: Cloudflare R2)에 올린다.

Apple Podcasts에서 '보관함 → … → URL로 프로그램 팔로우'로 feed.xml 주소를 한 번 등록하면,
새 에피소드가 올라올 때마다 앱이 가져온다.

접근 제어는 '추측할 수 없는 경로'로 한다 (주소 자체가 비밀번호 역할).
- Apple Podcasts는 비밀번호(Basic Auth)·만료 링크·Cloudflare Access를 공식 지원하지 않는다.
- 피드에 <itunes:block>Yes</itunes:block>를 넣어 Apple 공개 목록에 실리지 않게 한다.
- 주소는 절대 공개된 곳(README, GitHub, 메신저 단체방)에 적지 않는다.
- 보관 기간이 지난 에피소드는 MP3와 피드 항목을 함께 지운다 (기본 30일).

.env 설정 (값은 커밋하지 않는다)
  PODCAST_S3_ENDPOINT   예: https://<account_id>.r2.cloudflarestorage.com
  PODCAST_S3_BUCKET     버킷 이름
  PODCAST_S3_KEY_ID / PODCAST_S3_SECRET   R2 API 토큰 (해당 버킷 쓰기 권한만)
  PODCAST_PUBLIC_BASE   공개 주소 앞부분. 예: https://pub-xxxx.r2.dev
  PODCAST_PATH_TOKEN    무작위 경로 (python -c "import secrets;print(secrets.token_urlsafe(32))")
  PODCAST_KEEP_DAYS     보관 일수 (기본 30)
"""
from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
KST = timezone(timedelta(hours=9))
INDEX = ROOT / "outputs" / "feed" / "episodes.json"
COVER = ROOT / "outputs" / "feed" / "cover.png"
TITLE = "나의 아침 투자 브리핑"


def env(name: str, default: str | None = None) -> str:
    v = os.environ.get(name, default)
    if not v:
        raise SystemExit(f".env에 {name}가 없습니다. app/podcast_feed.py 맨 위 설명을 보세요.")
    return v


def make_cover(path: Path) -> None:
    """Apple 요구사항(1400~3000px 정사각형, RGB)에 맞는 단색 표지."""
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new("RGB", (1400, 1400), (24, 44, 72))
    d = ImageDraw.Draw(img)
    font = None
    for f in ("/System/Library/Fonts/AppleSDGothicNeo.ttc", "/System/Library/Fonts/Supplemental/AppleGothic.ttf"):
        if Path(f).exists():
            font = ImageFont.truetype(f, 120)
            break
    d.text((120, 520), "아침 투자\n브리핑", fill=(240, 240, 240), font=font, spacing=40)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


def description(run_dir: Path) -> str:
    """에피소드 설명: AI 생성 고지 + 이야기 목록 + 출처 링크 (방송에서 뺀 고지·확인 사항은 여기로)."""
    plan = json.loads((run_dir / "plan.json").read_text(encoding="utf-8"))
    cands = {a["id"]: a for a in json.loads((run_dir / "candidates.json").read_text(encoding="utf-8"))}
    fc = json.loads((run_dir / "factcheck.json").read_text(encoding="utf-8"))["final"]
    lines = ["AI가 기사를 고르고 대본을 쓴 뒤 AI 음성(edge-tts)으로 읽은 개인용 브리핑입니다. 투자 권유가 아닙니다.", ""]
    for s in sorted(plan["stories"], key=lambda s: s["priority"]):
        lines.append(f"■ {s['headline']}")
        for i in s["article_ids"]:
            if i in cands:
                lines.append(f"  - {cands[i]['title']} ({cands[i]['source']}) {cands[i]['url']}")
    lines += ["", f"사실 검증: 중대 오류 {fc['critical_issues']}건, 경미 {fc['minor_issues']}건 (자세한 내용은 텍스트 리포트)"]
    return "\n".join(lines)


def build_feed(episodes: list[dict], base: str) -> str:
    items = []
    for e in sorted(episodes, key=lambda e: e["date"], reverse=True):
        items.append(f"""  <item>
    <title>{escape(e['title'])}</title>
    <description>{escape(e['description'])}</description>
    <enclosure url="{base}/{e['file']}" length="{e['bytes']}" type="audio/mpeg"/>
    <guid isPermaLink="false">briefing-{e['date']}</guid>
    <pubDate>{e['pub_date']}</pubDate>
    <itunes:duration>{e['seconds']}</itunes:duration>
    <itunes:explicit>false</itunes:explicit>
  </item>""")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0">
<channel>
  <title>{TITLE}</title>
  <link>{base}/feed.xml</link>
  <description>개인 투자 프로필로 고른 뉴스를 두 진행자가 설명하는 비공개 브리핑 (개인용, 투자 권유 아님)</description>
  <language>ko</language>
  <itunes:author>personal</itunes:author>
  <itunes:image href="{base}/cover.png"/>
  <itunes:category text="Business"><itunes:category text="Investing"/></itunes:category>
  <itunes:explicit>false</itunes:explicit>
  <itunes:block>Yes</itunes:block>
  <podcast:block>yes</podcast:block>
{chr(10).join(items)}
</channel>
</rss>
"""


def client():
    import boto3
    return boto3.client("s3", endpoint_url=env("PODCAST_S3_ENDPOINT"),
                        aws_access_key_id=env("PODCAST_S3_KEY_ID"), aws_secret_access_key=env("PODCAST_S3_SECRET"),
                        region_name="auto")


def publish(run_dir: Path, *, dry_run: bool = False) -> str:
    """run_dir의 briefing.mp3를 올리고 feed.xml을 다시 만든다. 반환: 피드 주소 (화면에만 출력, 어디에도 저장하지 않음)."""
    token = env("PODCAST_PATH_TOKEN")
    base = env("PODCAST_PUBLIC_BASE").rstrip("/") + "/" + token
    keep = int(os.environ.get("PODCAST_KEEP_DAYS", "30"))
    run = json.loads((run_dir / "run.json").read_text(encoding="utf-8"))
    date = run["started_at"][:10]
    mp3 = run_dir / "briefing.mp3"
    file = f"{date}-{secrets.token_hex(6)}.mp3"  # 날짜만으로는 추측할 수 없게
    episodes = json.loads(INDEX.read_text(encoding="utf-8")) if INDEX.exists() else []
    episodes = [e for e in episodes if e["date"] != date]  # 같은 날 다시 만들면 교체
    episodes.append({"date": date, "file": file, "bytes": mp3.stat().st_size,
                     "seconds": run["audio"]["approx_seconds"],
                     "title": f"{date} 아침 투자 브리핑", "description": description(run_dir),
                     "pub_date": format_datetime(datetime.fromisoformat(run["finished_at"]))})
    cutoff = (datetime.now(KST) - timedelta(days=keep)).strftime("%Y-%m-%d")
    expired = [e for e in episodes if e["date"] < cutoff]
    episodes = [e for e in episodes if e["date"] >= cutoff]
    feed = build_feed(episodes, base)
    if not COVER.exists():
        make_cover(COVER)
    if dry_run:
        (INDEX.parent / "feed_preview.xml").write_text(feed, encoding="utf-8")
        return str(INDEX.parent / "feed_preview.xml")

    s3, bucket = client(), env("PODCAST_S3_BUCKET")
    hdr = {"CacheControl": "no-cache"}
    s3.upload_file(str(mp3), bucket, f"{token}/{file}", ExtraArgs={"ContentType": "audio/mpeg"})
    s3.upload_file(str(COVER), bucket, f"{token}/cover.png", ExtraArgs={"ContentType": "image/png"})
    s3.put_object(Bucket=bucket, Key=f"{token}/feed.xml", Body=feed.encode("utf-8"),
                  ContentType="application/rss+xml; charset=utf-8", **hdr)
    s3.put_object(Bucket=bucket, Key="robots.txt", Body=b"User-agent: *\nDisallow: /\n", ContentType="text/plain")
    for e in expired:
        s3.delete_object(Bucket=bucket, Key=f"{token}/{e['file']}")
    INDEX.parent.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps(episodes, ensure_ascii=False, indent=1), encoding="utf-8")
    return f"{base}/feed.xml"


if __name__ == "__main__":
    import argparse
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
    ap = argparse.ArgumentParser(description="비공개 팟캐스트 피드 올리기")
    ap.add_argument("run_dir")
    ap.add_argument("--dry-run", action="store_true", help="올리지 않고 feed_preview.xml만 만든다")
    a = ap.parse_args()
    print(publish(ROOT / a.run_dir, dry_run=a.dry_run))
