# 루틴 플래너 (Todo 앱)

## 개요
루틴과 할 일을 추가·완료·조회하는 1인용 앱. 웹 화면은 `npm start`, 데이터는 로컬 SQLite `todo.db`.

## 명령 (CLI)
- 오늘 목록: `node todo.js list`
- 추가: `node todo.js add "<내용>"`
- 완료: `node todo.js done <번호>`
- 오늘 완료 요약: `node todo.js summary`
- 연습·시험할 때는 앞에 `DB_FILE=demo.db`를 붙여 예시 DB를 쓴다.

## 규칙
- 할 일 데이터를 볼 때는 코드나 DB 파일을 직접 읽지 말고 위 CLI를 실행한다.
- UI 문구는 존댓말로.

## 하지 말 것
- `todo.db`(실데이터)를 직접 지우거나 덮어쓰지 말 것.
- `.env`(Supabase 인증 정보)를 읽거나 출력하지 말 것.
