# Plan: due-date (마감일 기능)

## 목표
각 할일에 선택적으로 마감일을 설정하고, 기한 임박/초과 여부를 시각적으로 표시한다.

## 배경
현재 앱은 중요도(높음/보통/낮음)로만 우선순위를 표현한다.
실제 마감이 있는 작업은 날짜 기반 관리가 더 실용적이다.

## 요구사항

### 핵심 기능
1. **마감일 설정**: 할일 추가 시 날짜 선택 (선택사항, 없어도 됨)
2. **D-Day 배지**: 마감일까지 남은 일수 표시
   - D-3 이상: 회색
   - D-2 ~ D-1: 주황색 (임박)
   - D-Day: 빨간색 굵게
   - 기한 초과: 빨간 배경 (OVERDUE)
3. **오늘 마감 필터**: 카테고리 필터 옆에 "오늘" 버튼 추가
4. **마감일 정렬**: 기존 목록 순서 유지, 마감일 기준 정렬은 미포함 (YAGNI)

### 비기능 요구사항
- 마감일 없는 기존 할일은 그대로 동작
- localStorage 하위호환 (dueDate 없는 데이터도 정상 로드)

## 변경 범위

| 파일 | 변경 내용 |
|------|----------|
| `src/types/todo.ts` | Todo 인터페이스에 `dueDate?: number` 추가, 헬퍼 함수 추가 |
| `src/hooks/useTodos.ts` | Filter 타입에 'today' 추가 |
| `src/components/AddTodo/AddTodo.tsx` | 날짜 input 추가 |
| `src/components/TodoItem/TodoItem.tsx` | D-Day 배지 렌더링 추가 |
| `src/components/CategoryFilter/CategoryFilter.tsx` | '오늘 마감' 버튼 추가 |

## 완료 기준
- [ ] 할일 추가 시 날짜 선택 가능 (선택사항)
- [ ] TodoItem에 D-Day 배지 표시
- [ ] 기한 초과 시 시각적 강조
- [ ] '오늘 마감' 필터 동작
- [ ] 기존 데이터(dueDate 없는) 정상 동작
