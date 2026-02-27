# Plan: code-refactoring

## 목표
Todo 앱 코드 품질 개선 - 중복 제거, 책임 분리, 주석 통일

## 발견된 문제점

### 1. Filter 타입 중복 정의
- `useTodos.ts` 5번줄에 정의
- `App.tsx` 9번줄에 재정의
- `CategoryFilter.tsx` 4번줄에 재정의
- **해결**: `types/todo.ts`로 이동 후 import해서 사용

### 2. App.tsx 로직 과부하
- `todoCounts` 계산이 App.tsx에 있음 (훅이 해야 할 일)
- **해결**: `useTodos.ts`로 이동해 훅에서 반환

### 3. 중복 조건 검사
- App.tsx 59번줄: `filteredTodos.length > 0 &&` 블록 안에서 또 `filteredTodos.length > 0 ?` 삼항 연산자 사용
- **해결**: 중복 조건 제거

### 4. 한국어 주석 누락
- `TodoList.tsx` - 주석 없음
- `CategoryFilter.tsx` - 주석 없음
- **해결**: 프로젝트 규칙에 맞게 한국어 주석 추가

## 변경 범위

| 파일 | 변경 내용 |
|------|----------|
| `src/types/todo.ts` | Filter 타입 추가 |
| `src/hooks/useTodos.ts` | Filter 타입 import 사용, todoCounts 추가 |
| `src/App.tsx` | Filter 타입 제거, todoCounts 훅에서 가져오기, 중복 조건 제거 |
| `src/components/TodoList/TodoList.tsx` | 한국어 주석 추가 |
| `src/components/CategoryFilter/CategoryFilter.tsx` | Filter import 사용, 한국어 주석 추가 |
