# Plan: todo-edit (할일 편집)

## 목표
추가된 할일의 내용, 카테고리, 중요도, 마감일을 인라인으로 수정할 수 있다.

## 요구사항
1. TodoItem에 편집 버튼(연필 아이콘) 추가
2. 클릭 시 인라인 편집 모드로 전환
3. 텍스트, 카테고리, 중요도, 마감일 수정 가능
4. Enter 또는 저장 버튼으로 저장
5. ESC 또는 취소 버튼으로 원래 값 복원

## 변경 범위
| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useTodos.ts` | `updateTodo(id, updates)` 함수 추가 |
| `src/components/TodoItem/TodoItem.tsx` | 편집 모드 UI 추가 |
| `src/components/TodoItem/TodoItem.css` | 편집 모드 스타일 추가 |
| `src/components/TodoList/TodoList.tsx` | `onUpdate` prop 전달 |
| `src/App.tsx` | `updateTodo` 전달 |

## 완료 기준
- [ ] 편집 버튼 클릭 시 편집 모드 진입
- [ ] 텍스트/카테고리/중요도/마감일 수정 가능
- [ ] Enter/저장으로 저장, ESC/취소로 원복
- [ ] 편집 중 텍스트가 비어있으면 저장 불가
