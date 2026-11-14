-- 아, 그게 뭐더라? — Supabase 표 만들기
-- Supabase 대시보드 → SQL Editor → 이 파일 내용을 붙여 넣고 Run. 여러 번 실행해도 안전하다.

-- 섹션 (교육자료 단위)
create table if not exists public.sections (
  id    text primary key,          -- '02-04'
  title text not null
);

-- 용어 사전 (모두가 같이 쓰는 공용 데이터. 서버가 켜질 때 data/*.js 원본과 맞춘다)
create table if not exists public.terms (
  id         text primary key,      -- 'rls'
  section_id text not null references public.sections(id),
  position   integer not null,      -- WORD 001…
  term       text not null,
  ko         text not null,
  full_name  text not null default '',
  src        text not null,
  level      text not null default '',
  def        text not null,
  easy       text not null default '',
  ex         text not null default '',
  related    text[] not null default '{}'
);

-- 내 기록 (사람마다 따로)
-- owner_id: 로그인 전 'device:<브라우저마다 만든 UUID>', 구글 로그인 후 'user:<auth.users.id>'
create table if not exists public.notes (
  owner_id   text not null check (owner_id ~ '^(device|user):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  term_id    text not null references public.terms(id) on delete cascade,
  mine       text not null default '' check (char_length(mine) <= 5000),
  status     smallint not null default 0 check (status in (0, 1, 2)),
  updated_at timestamptz not null default now(),
  primary key (owner_id, term_id),
  -- 설명 없이 '마치기' 금지 (서버에 이어 DB에서도 한 번 더)
  constraint done_needs_note check (status <> 2 or length(trim(mine)) > 0)
);

-- RLS를 켜고 공개 정책은 만들지 않는다.
-- → 브라우저용 공개 키로는 아무 표도 읽거나 쓸 수 없고, 비밀 키를 가진 우리 서버만 접근한다.
alter table public.sections enable row level security;
alter table public.terms    enable row level security;
alter table public.notes    enable row level security;

-- 로그인 추가 전에 만든 DB를 옮기기 (device_id uuid → owner_id text 'device:…'). 한 번만 실행된다
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'notes' and column_name = 'device_id') then
    alter table public.notes alter column device_id type text using 'device:' || device_id::text;
    alter table public.notes rename column device_id to owner_id;
    alter table public.notes add constraint notes_owner_format
      check (owner_id ~ '^(device|user):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
  end if;
end $$;

-- 내 설명 한도를 2000자 → 5000자로 늘릴 때 (이미 만든 DB에 한 번만 실행)
-- alter table public.notes drop constraint if exists notes_mine_check;
-- alter table public.notes add constraint notes_mine_check check (char_length(mine) <= 5000);
