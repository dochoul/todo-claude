import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  Todo, Category, CATEGORIES, Priority, PRIORITIES, PRIORITY_ICONS,
  CATEGORY_COLORS, PRIORITY_COLORS,
  getDueDateStatus, formatDueDateLabel,
  toMidnightTimestamp, timestampToDateStr,
} from '../../types/todo';
import './TodoItem.css';

// TodoItem 컴포넌트가 부모로부터 받는 속성(props) 정의
interface TodoItemProps {
  todo: Todo;                                                                        // 표시할 할일 데이터
  onToggle: (id: string) => void;                                                    // 완료 상태를 바꿀 때 호출하는 함수
  onDelete: (id: string) => void;                                                    // 할일을 삭제할 때 호출하는 함수
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'dueDate'>>) => void; // 할일을 수정할 때 호출하는 함수
}

// DueDateStatus별 색상을 정의합니다
const DUE_DATE_COLORS = {
  far:     { color: '#9E9E9E', bg: '#9e9e9e1a', border: '#9e9e9e66' },
  soon:    { color: '#FF9800', bg: '#ff98001a', border: '#ff980066' },
  today:   { color: '#F44336', bg: '#f443361a', border: '#f4433666' },
  overdue: { color: '#ffffff', bg: '#F44336',   border: '#F44336'   }, // 진한 빨강 배경
};

// 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환하는 함수 (날짜 input의 min 값에 사용)
function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 할일 하나를 카드 형태로 보여주는 컴포넌트
export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  // 편집 모드 여부를 추적하는 상태
  const [isEditing, setIsEditing] = useState(false);

  // 편집 중인 각 필드의 임시 상태 (저장 전까지 원래 값에 영향을 주지 않습니다)
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState<Category>(todo.category);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDueDateStr, setEditDueDateStr] = useState('');

  // 편집 모드 진입 시 텍스트 input에 자동으로 포커스를 줍니다
  const editInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  // 편집 모드를 시작하는 함수 - 현재 값으로 편집 상태를 초기화합니다
  function handleEditStart(): void {
    setEditText(todo.text);
    setEditCategory(todo.category);
    setEditPriority(todo.priority);
    // 저장된 타임스탬프를 날짜 input 형식("YYYY-MM-DD")으로 변환합니다
    setEditDueDateStr(todo.dueDate ? timestampToDateStr(todo.dueDate) : '');
    setIsEditing(true);
  }

  // 편집 내용을 저장하는 함수
  function handleEditSave(): void {
    const trimmed = editText.trim();
    if (!trimmed) return; // 내용이 없으면 저장하지 않습니다

    // 날짜 문자열이 있으면 타임스탬프로 변환, 없으면 undefined (마감일 제거)
    const dueDate = editDueDateStr ? toMidnightTimestamp(editDueDateStr) : undefined;

    onUpdate(todo.id, { text: trimmed, category: editCategory, priority: editPriority, dueDate });
    setIsEditing(false);
  }

  // 편집을 취소하고 원래 값으로 되돌리는 함수
  function handleEditCancel(): void {
    setIsEditing(false);
  }

  // 편집 중 키보드 입력 처리 - Enter로 저장, ESC로 취소
  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  }

  // --- 편집 모드 UI ---
  if (isEditing) {
    return (
      <div className="todo-item todo-item--editing">
        {/* 할일 내용을 수정하는 텍스트 input */}
        <input
          ref={editInputRef}
          className="todo-item__edit-input"
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          placeholder="할일을 입력하세요..."
        />

        {/* 카테고리 수정 드롭다운 */}
        <select
          className="todo-item__edit-select"
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* 중요도 수정 드롭다운 */}
        <select
          className="todo-item__edit-select"
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value as Priority)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_ICONS[p]} {p}</option>
          ))}
        </select>

        {/* 마감일 수정 날짜 input */}
        <input
          className="todo-item__edit-date"
          type="date"
          value={editDueDateStr}
          min={getTodayString()}
          onChange={(e) => setEditDueDateStr(e.target.value)}
          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
          title="마감일 (선택사항)"
        />

        {/* 저장 버튼 - 내용이 없으면 비활성화됩니다 */}
        <button
          type="button"
          className="todo-item__edit-save"
          onClick={handleEditSave}
          disabled={!editText.trim()}
          aria-label="저장"
        >
          ✓
        </button>

        {/* 취소 버튼 */}
        <button
          type="button"
          className="todo-item__edit-cancel"
          onClick={handleEditCancel}
          aria-label="취소"
        >
          &times;
        </button>
      </div>
    );
  }

  // --- 일반(보기) 모드 UI ---
  const badgeColor = CATEGORY_COLORS[todo.category];
  const priorityColor = PRIORITY_COLORS[todo.priority];
  const dueDateStatus = getDueDateStatus(todo.dueDate);

  return (
    // 완료된 할일은 'todo-item--completed' 클래스가 추가되어 스타일이 달라집니다
    // 중요도에 따라 왼쪽 테두리 색상이 달라집니다 (시각적으로 구분)
    <div
      className={`todo-item${todo.completed ? ' todo-item--completed' : ''}`}
      style={{ borderLeftColor: priorityColor }}
    >
      {/* 완료 여부를 체크하는 체크박스 */}
      <label className="todo-item__checkbox-label">
        <input
          type="checkbox"
          className="todo-item__checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="todo-item__checkmark" />
      </label>

      {/* 할일 내용 텍스트 */}
      <span className="todo-item__text">{todo.text}</span>

      {/* D-Day 배지 - 마감일이 있을 때만 표시합니다 */}
      {dueDateStatus !== null && todo.dueDate !== undefined && (
        <span
          className={`todo-item__due-badge${dueDateStatus === 'overdue' ? ' todo-item__due-badge--overdue' : ''}`}
          style={{
            background: DUE_DATE_COLORS[dueDateStatus].bg,
            color: DUE_DATE_COLORS[dueDateStatus].color,
            borderColor: DUE_DATE_COLORS[dueDateStatus].border,
          }}
        >
          {formatDueDateLabel(todo.dueDate)}
        </span>
      )}

      {/* 중요도 배지 */}
      <span
        className="todo-item__priority-badge"
        style={{
          background: `${priorityColor}1a`,
          color: priorityColor,
          borderColor: `${priorityColor}66`,
        }}
      >
        {PRIORITY_ICONS[todo.priority]} {todo.priority}
      </span>

      {/* 카테고리 배지 */}
      <span
        className="todo-item__badge"
        style={{
          background: `${badgeColor}1a`,
          color: badgeColor,
          borderColor: `${badgeColor}66`,
        }}
      >
        {todo.category}
      </span>

      {/* 편집 버튼 - 호버 시 나타납니다 */}
      <button
        type="button"
        className="todo-item__edit"
        onClick={handleEditStart}
        aria-label="편집"
      >
        ✏
      </button>

      {/* 삭제 버튼 */}
      <button
        type="button"
        className="todo-item__delete"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
      >
        &times;
      </button>
    </div>
  );
}
