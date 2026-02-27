# Design: due-date (마감일 기능)

## 1. 타입 설계

### `src/types/todo.ts` 변경사항

```ts
// Filter 타입 - 'today' 추가
export type Filter = 'all' | 'today' | Category;

// Todo 인터페이스 - dueDate 필드 추가
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  createdAt: number;
  dueDate?: number; // 마감일 타임스탬프 (선택사항, 자정 기준)
}

// D-Day 상태 타입
export type DueDateStatus = 'far' | 'soon' | 'today' | 'overdue' | null;
// far    = D-3 이상 (회색)
// soon   = D-2 ~ D-1 (주황색)
// today  = D-Day (빨간색 굵게)
// overdue = 기한 초과 (빨간 배경)
// null   = 마감일 없음

// 마감일 상태를 계산하는 헬퍼 함수
export function getDueDateStatus(dueDate?: number): DueDateStatus
export function formatDueDateLabel(dueDate: number): string
// 예: "D-3", "D-1", "D-Day", "D+2"
```

---

## 2. 데이터 흐름

```
AddTodo (날짜 input)
    ↓ dueDate (number | undefined)
useTodos.addTodo()
    ↓ Todo 객체 생성
useTodos.filteredTodos (filter='today' 지원)
    ↓
TodoItem (dueDate prop)
    ↓ getDueDateStatus()
DueDateBadge 렌더링
```

---

## 3. 컴포넌트 설계

### 3-1. `AddTodo.tsx`

**추가할 UI**: 날짜 선택 `<input type="date">` (선택사항)

```
[ 할일 입력 ] [ 카테고리 ▼ ] [ 중요도 ▼ ] [ 날짜 🗓 ] [ 추가 ]
```

- `dueDate` 상태: `string` (input value) → 제출 시 `Date` → 자정 타임스탬프로 변환
- 날짜 없으면 `undefined` 전달 (선택 항목)
- min 속성: 오늘 날짜 (과거 날짜 선택 방지)

### 3-2. `TodoItem.tsx`

**추가할 UI**: D-Day 배지 (dueDate 있을 때만 표시)

배지 위치: 중요도 배지 왼쪽

```
[체크] 할일 내용  [D-1 🔴] [중요도] [카테고리] [삭제]
```

**DueDateStatus별 스타일**:

| 상태 | 텍스트 | 색상 | 배경 |
|------|--------|------|------|
| far | D-N | #9E9E9E | #9e9e9e1a |
| soon | D-N | #FF9800 | #ff98001a |
| today | D-Day | #F44336 | #f443361a |
| overdue | D+N 초과 | #fff | #F44336 (진한 빨강) |

### 3-3. `CategoryFilter.tsx`

**추가할 버튼**: "오늘" 필터 버튼 (전체 버튼 오른쪽에 배치)

```
[전체 N] [오늘 M] [개인] [업무] [쇼핑] [기타]
```

- 활성 색상: `#E91E63` (핑크 계열 — 카테고리와 구분)
- todoCounts에 'today' 카운트 추가

### 3-4. `useTodos.ts`

**Filter 확장**:
```ts
// 'today' 필터: dueDate가 오늘인 할일만 반환
const filteredTodos = useMemo(() => {
  if (filter === 'all') return todos;
  if (filter === 'today') return todos.filter(isToday);
  return todos.filter((t) => t.category === filter);
}, [todos, filter]);

// todoCounts에 'today' 추가
const todoCounts = useMemo(() => {
  return {
    all: todos.length,
    today: todos.filter(isToday).length,
    ...카테고리별,
  };
}, [todos]);
```

---

## 4. 헬퍼 함수 명세

### `getDueDateStatus(dueDate?: number): DueDateStatus`
```
입력: 타임스탬프 또는 undefined
처리:
  1. undefined → null 반환
  2. 오늘 자정 기준으로 남은 일수(diffDays) 계산
  3. diffDays < 0  → 'overdue'
  4. diffDays === 0 → 'today'
  5. diffDays <= 2 → 'soon'
  6. diffDays >= 3  → 'far'
```

### `formatDueDateLabel(dueDate: number): string`
```
입력: 타임스탬프
처리:
  1. 남은 일수 계산
  2. diffDays < 0  → `D+${Math.abs(diffDays)}`
  3. diffDays === 0 → `D-Day`
  4. diffDays > 0  → `D-${diffDays}`
```

### `toMidnightTimestamp(dateStr: string): number`
```
입력: "2026-02-27" 형식의 날짜 문자열
처리: 로컬 자정 기준 타임스탬프로 변환
      new Date(dateStr + 'T00:00:00').getTime()
```

### `isToday(todo: Todo): boolean`
```
입력: Todo 객체
처리: todo.dueDate가 오늘 날짜와 일치하는지 확인
```

---

## 5. CSS 설계

### `TodoItem.css` 추가
```css
/* D-Day 배지 기본 스타일 */
.todo-item__due-badge { ... }

/* 기한 초과: 진한 배경 */
.todo-item__due-badge--overdue { ... }
```

### `AddTodo.css` 추가
```css
/* 날짜 input 스타일 */
.add-todo__date { ... }
```

---

## 6. 구현 순서

1. `types/todo.ts` — 타입 + 헬퍼 함수 추가
2. `hooks/useTodos.ts` — Filter 'today' + todoCounts 업데이트
3. `components/AddTodo/` — 날짜 input UI + CSS
4. `components/TodoItem/` — D-Day 배지 UI + CSS
5. `components/CategoryFilter/` — '오늘' 버튼 추가
