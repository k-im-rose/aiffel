# 매일 자동 생성과 Apple Podcasts 비공개 구독

## 결론

| 항목 | 선택 |
|---|---|
| 실행 | 맥 `launchd`가 매일 **07:35 (KST)** 에 `deploy/run_daily.sh` 실행. 수집부터 MP3까지 약 8~10분이라 **07:45 전후 완성** |
| 저장 | **Cloudflare R2** 버킷 (무료 범위 안, 월 $0 예상) |
| 피드 | `app/podcast_feed.py`가 MP3와 `feed.xml`을 **추측할 수 없는 경로**에 올린다. 30일 지난 회차는 자동 삭제 |
| 구독 | iPhone Apple Podcasts → 보관함 → 오른쪽 위 … → **URL로 프로그램 팔로우** → feed.xml 주소 붙여넣기 (한 번만) |
| 자동 다운로드 | 설정 → 앱 → Podcasts → 자동 다운로드 켜기. 프로그램 화면 … → 설정에서도 켬 |

조사 일자는 2026-11-17이다. Apple과 Cloudflare 문서를 기준으로 했고, 문서에 없는 부분은 "불확실"로 표시했다.

## 1. Apple Podcasts에서 비공개 구독이 되나

**URL로 팔로우할 수 있다.** iPhone은 보관함 → … → URL로 프로그램 팔로우, Mac은 파일 → URL로 프로그램 팔로우다. ([Apple](https://podcasters.apple.com/support/5108-how-apple-podcasts-distributes-your-shows-to-listeners))

**공개 목록에 실리지 않는다.** Apple 문서에 따르면 URL로 팔로우한 프로그램은 다음과 같다.
- 공개 목록과 무관하게 호스팅 주소에서 직접 받는다.
- 검색과 추천에 나오지 않는다.

피드에는 `<itunes:block>Yes</itunes:block>`를 넣었다. Apple이 비공개 피드에 권하는 태그다.

**Apple 서버가 피드 주소를 알게 될 가능성이 높다 (불확실).** iOS 14.5 이후 피드는 Apple 서버(iTMS)가 가져오는 것으로 알려져 있다. 그래서 주소 자체를 비밀로 다룬다.

**비밀번호(Basic Auth)는 쓰지 않는다.** Apple 문서에 지원 방법이 없고, 사용자 보고도 엇갈린다.

**새 회차 반영 시간 (불확실):**
- Apple은 "자주" 확인한다고만 밝혔다. 외부 기록상으로는 대략 1시간 간격이다.
- 그래서 07:45에 올라가도 앱에 보이는 것은 **몇십 분에서 몇 시간 늦을 수 있다**.
- 보관함에서 아래로 당겨 새로 고치면 빨라질 수 있다.
- 출근 시간에 꼭 들어야 한다면 실행 시각을 앞당기는 것도 방법이다.

## 2. 저장소 비교

| 선택지 | 무료 범위 | 월 예상 비용 | 판단 |
|---|---|---|---|
| **Cloudflare R2** | 저장 10GB, 쓰기 100만·읽기 1,000만 회, 전송량 무료 ([요금](https://developers.cloudflare.com/r2/pricing)) | **$0** | **추천.** S3 호환이라 Python(boto3)으로 올린다 |
| Backblaze B2 | 10GB 무료, 저장량 3배까지 전송 무료 ([요금](https://www.backblaze.com/cloud-storage/pricing)) | $0 | 대안. 공개 주소에 버킷 이름이 보인다 |
| AWS S3 | 신규 계정 크레딧 (6개월) | 몇 센트 | 설정(IAM)이 가장 복잡하다 |
| GitHub Pages / Releases | 무료 계정은 저장소 공개 | $0 | **제외.** 개인 브리핑이 공개된다 |
| Google Drive / Dropbox | — | $0 | **제외.** 팟캐스트 앱이 파일을 못 받거나 링크가 자주 깨진다 |

**R2 참고 사항:**
- `r2.dev` 주소는 Cloudflare가 "개발용, 속도 제한"이라고 한다. 혼자 듣는 용도로는 충분하다.
- 도메인이 있으면 연결하는 것이 정식 방법이다.
- 결제 수단 등록이 필요할 수 있다 (불확실).

**용량:** 하루 MP3는 약 3.8MB (48kbps, 10~11분)다. 15분이어도 약 5.4MB다. 30일 보관하면 약 115~160MB로, 무료 10GB의 2% 이하다.

## 3. 개인정보와 접근 권한

- **비밀 경로가 비밀번호다:** 피드 주소는 `https://<공개주소>/<무작위 43자>/feed.xml` 형태다.
  - MP3 파일명에도 무작위 문자를 붙여 날짜만으로 추측할 수 없게 했다.
  - 버킷 목록 보기는 꺼 둔다 (R2 기본값).
- **주소를 공개된 곳에 적지 않는다:** README, GitHub, 메신저, 스크린샷 모두 해당한다.
  - `podcast_feed.py`는 주소를 화면에만 출력하고 파일로 저장하지 않는다.
  - `.env`는 커밋하지 않는다.
- **검색 차단:** `itunes:block`, `podcast:block` 태그와 `robots.txt` (Disallow: /)를 둔다.
  - 일부 팟캐스트 디렉터리가 이 태그를 무시할 수 있다. 주소가 새지 않게 하는 것이 핵심이다.
- **쓰지 않는 방식과 이유:**
  - 만료 서명 링크: 앱이 나중에 다시 받을 때 깨진다.
  - Cloudflare Access: 팟캐스트 앱이 로그인을 못 해 막힌다.
- **API 토큰 권한:** R2 토큰은 해당 버킷 쓰기 권한만 준다.
- **주소가 샌 것 같으면:** `PODCAST_PATH_TOKEN`을 새로 만들고 다시 구독한다. 이전 경로의 파일은 지운다.

## 4. 이용 조건

| 대상 | 조건 | 이 프로젝트의 처리 |
|---|---|---|
| **edge-tts** | Microsoft Edge 읽어 주기 서비스를 비공식으로 부르는 라이브러리 (LGPLv3). 서비스 약관상 자동화·재배포 허용이 명시되어 있지 않다 | 본인만 듣는 비공개 피드로 한정. 공개 데모나 다른 사람에게 배포하려면 **Azure AI Speech** 같은 공식 API로 바꾼다 |
| **기사 제목·요약** | 매일경제·한국경제 RSS 재사용 범위가 명시되지 않았다 | 본문은 수집하지 않는다. 방송은 요약을 바탕으로 다시 말하고 출처 링크를 단다. 비공개 피드라도 기술적으로는 주소를 아는 사람에게 열려 있으므로 **주소를 공유하지 않는다** |
| **Apple Podcasts** | URL 팔로우는 개인 사용 기능이다. 공개 목록에 등록(Podcasts Connect)하지 않는다 | `itunes:block` |
| **공개 포트폴리오** | — | 개인 프로필과 실제 브리핑은 올리지 않는다 (`.gitignore`). 가상 프로필로 만든 데모를 `outputs/demo/`에 따로 둔다 |

## 5. 설정 순서 (사용자가 직접 할 일 포함)

1. **Cloudflare 계정에서 R2 버킷을 만든다 (사용자 직접).** 이름은 예를 들어 `briefing-private`로 하고, 공개 접근은 r2.dev를 켠다. 버킷 쓰기 권한만 가진 API 토큰을 만든다.
2. `.env`에 다음 값을 적는다.
   - `PODCAST_S3_ENDPOINT`, `PODCAST_S3_BUCKET`, `PODCAST_S3_KEY_ID`, `PODCAST_S3_SECRET`, `PODCAST_PUBLIC_BASE`
   - `PODCAST_PATH_TOKEN`: 아래 명령으로 만든 값

   ```bash
   .venv/bin/python -c "import secrets;print(secrets.token_urlsafe(32))"
   ```

3. 미리보기로 피드를 확인한다.

   ```bash
   .venv/bin/python -m app.podcast_feed outputs/<날짜> --dry-run
   ```

4. 실제로 올린다. 출력된 feed.xml 주소를 iPhone에서 "URL로 프로그램 팔로우"에 넣는다.

   ```bash
   .venv/bin/python -m app.podcast_feed outputs/<날짜>
   ```

5. 매일 자동 실행을 등록한다.

   ```bash
   cp deploy/com.investment-briefing.daily.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/com.investment-briefing.daily.plist
   ```

6. 맥이 잠자기 상태면 실행되지 않을 수 있다. 07:30에 깨우는 설정은 관리자 암호가 필요해 사용자가 직접 한다.

   ```bash
   sudo pmset repeat wakeorpoweron MTWRFSU 07:30:00
   ```

   - **잠자기 상태:** 깨우기 설정이 있으면 실행된다.
   - **덮개를 닫아 완전히 꺼진 상태:** 실행되지 않는다.
   - **맥이 꺼진 날에도 받으려면:** 클라우드 예약 실행으로 옮겨야 한다 (확장 계획).

7. 실패하면 맥 알림이 뜬다. 기록은 `outputs/logs/daily_YYYYMMDD.log`에 남는다.

## 6. 남은 불확실성
- **Apple 서버의 피드 확인 주기:** 문서에 없다.
- **R2 결제 수단 필요 여부:** 확인하지 못했다.
- **CLI 백엔드의 무인 실행:** launchd에서 Claude Code CLI 로그인 상태가 유지되는지는 첫 자동 실행에서 확인해야 한다. 실패하면 `.env`에 API 키를 넣어 API 백엔드로 돌린다.
