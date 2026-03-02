# Plan: supabase-migration

## 목표
localStorage 기반 저장소를 Supabase로 교체하고,
이메일 로그인/회원가입을 통해 사용자별 개인 할일을 관리한다.

## 배경
- 현재: 브라우저 localStorage에만 저장 → 기기 간 공유 불가, 데이터 유실 위험
- 목표: Supabase DB에 저장 + 로그인한 사용자만 본인 데이터에 접근

---

## 요구사항

### 인증 (Auth)
1. 이메일 + 비밀번호로 회원가입 / 로그인
2. 로그아웃
3. 로그인하지 않은 사용자는 로그인 화면만 표시
4. 로그인 상태는 세션으로 유지 (새로고침해도 로그인 유지)

### 데이터
1. 할일은 로그인한 사용자의 것만 표시
2. 기존 CRUD(추가/수정/삭제/완료 토글)가 그대로 동작
3. RLS(Row Level Security)로 다른 사용자 데이터 접근 차단

### UI
1. 로그인 / 회원가입 화면 (이메일, 비밀번호 입력)
2. 앱 헤더에 현재 사용자 이메일 + 로그아웃 버튼 표시
3. 로딩 상태 표시 (Supabase 요청 중)
4. 에러 메시지 표시 (로그인 실패, 저장 실패 등)

---

## 변경 범위

### 새로 생성하는 파일

| 파일 | 역할 |
|------|------|
| `src/lib/supabase.ts` | Supabase 클라이언트 초기화 |
| `src/hooks/useAuth.ts` | 로그인/로그아웃/세션 관리 훅 |
| `src/components/Auth/AuthForm.tsx` | 로그인/회원가입 폼 컴포넌트 |
| `src/components/Auth/AuthForm.css` | 폼 스타일 |
| `.env` | Supabase URL, anon key 환경변수 |

### 수정하는 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useTodos.ts` | localStorage → Supabase CRUD, 비동기 처리, user_id 연동 |
| `src/App.tsx` | 인증 상태에 따라 AuthForm / TodoApp 분기 렌더링, 헤더에 유저 정보 |

### Supabase 설정 (대시보드)

1. **테이블 생성**: `todos`
   ```sql
   create table todos (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users not null,
     text text not null,
     completed boolean not null default false,
     category text not null,
     priority text not null,
     due_date bigint,
     created_at bigint not null
   );
   ```

2. **RLS 활성화 및 정책 설정**
   ```sql
   alter table todos enable row level security;

   -- 본인 데이터만 조회
   create policy "본인 할일만 조회" on todos
     for select using (auth.uid() = user_id);

   -- 본인만 삽입 (user_id 자동 설정)
   create policy "본인 할일만 추가" on todos
     for insert with check (auth.uid() = user_id);

   -- 본인만 수정
   create policy "본인 할일만 수정" on todos
     for update using (auth.uid() = user_id);

   -- 본인만 삭제
   create policy "본인 할일만 삭제" on todos
     for delete using (auth.uid() = user_id);
   ```

---

## 구현 순서

1. Supabase 대시보드에서 테이블 + RLS 설정
2. `npm install @supabase/supabase-js`
3. `.env` 파일에 환경변수 추가
4. `src/lib/supabase.ts` — 클라이언트 생성
5. `src/hooks/useAuth.ts` — 인증 훅
6. `src/components/Auth/AuthForm.tsx` — 로그인/회원가입 UI
7. `src/hooks/useTodos.ts` — Supabase CRUD로 교체
8. `src/App.tsx` — 인증 분기 + 헤더 수정

---

## 완료 기준
- [ ] 이메일로 회원가입 후 로그인 가능
- [ ] 로그인 후 기존 Todo 기능 모두 정상 동작
- [ ] 새로고침해도 로그인 유지
- [ ] 다른 계정으로 로그인하면 본인 데이터만 표시
- [ ] 로딩/에러 상태 UI 표시
- [ ] localStorage 코드 제거

---

## 주의사항
- `.env` 파일은 `.gitignore`에 반드시 포함 (키 노출 방지)
- `VITE_` 접두사 없이는 환경변수가 브라우저에 노출되지 않음
- anon key는 공개 가능하나 service_role key는 절대 클라이언트에 사용 금지
