import { Todo, CATEGORY_COLORS, PRIORITY_COLORS, PRIORITY_ICONS, getDueDateStatus, formatDueDateLabel } from '../../types/todo';
import './TodoItem.css';

// TodoItem 컴포넌트가 부모로부터 받는 속성(props) 정의
interface TodoItemProps {
  todo: Todo;                    // 표시할 할일 데이터
  onToggle: (id: string) => void; // 완료 상태를 바꿀 때 호출하는 함수
  onDelete: (id: string) => void; // 할일을 삭제할 때 호출하는 함수
}

// DueDateStatus별 색상을 정의합니다
const DUE_DATE_COLORS = {
  far:     { color: '#9E9E9E', bg: '#9e9e9e1a', border: '#9e9e9e66' },
  soon:    { color: '#FF9800', bg: '#ff98001a', border: '#ff980066' },
  today:   { color: '#F44336', bg: '#f443361a', border: '#f4433666' },
  overdue: { color: '#ffffff', bg: '#F44336',   border: '#F44336'   }, // 진한 빨강 배경
};

// 할일 하나를 카드 형태로 보여주는 컴포넌트
export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  // 이 할일의 카테고리에 맞는 색상을 가져옵니다
  const badgeColor = CATEGORY_COLORS[todo.category];

  // 이 할일의 중요도에 맞는 색상을 가져옵니다
  const priorityColor = PRIORITY_COLORS[todo.priority];

  // 마감일 상태를 계산합니다 (null이면 마감일 없음)
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
          onChange={() => onToggle(todo.id)} // 클릭하면 완료 상태가 바뀝니다
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

      {/* 중요도 배지 - 아이콘과 텍스트로 중요도를 표시합니다 */}
      <span
        className="todo-item__priority-badge"
        style={{
          background: `${priorityColor}1a`, // 색상에 투명도를 적용합니다
          color: priorityColor,
          borderColor: `${priorityColor}66`,
        }}
      >
        {PRIORITY_ICONS[todo.priority]} {todo.priority}
      </span>

      {/* 카테고리 배지 - 어떤 카테고리인지 표시합니다 */}
      <span
        className="todo-item__badge"
        style={{
          background: `${badgeColor}1a`, // 색상에 투명도를 적용합니다
          color: badgeColor,
          borderColor: `${badgeColor}66`,
        }}
      >
        {todo.category}
      </span>

      {/* 삭제 버튼 - 클릭하면 이 할일이 목록에서 사라집니다 */}
      <button
        className="todo-item__delete"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제" // 화면 낭독기(스크린리더)를 위한 설명
      >
        &times; {/* × 기호 */}
      </button>
    </div>
  );
}
