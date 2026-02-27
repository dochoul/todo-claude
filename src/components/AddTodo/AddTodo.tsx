import { useState, useRef, KeyboardEvent } from 'react';
import { Category, CATEGORIES, Priority, PRIORITIES, PRIORITY_ICONS, toMidnightTimestamp } from '../../types/todo';
import './AddTodo.css';

// AddTodo 컴포넌트가 부모로부터 받는 속성(props) 정의
interface AddTodoProps {
  // 할일이 추가될 때 호출되는 함수 (내용, 카테고리, 중요도, 마감일을 전달합니다)
  onAdd: (text: string, category: Category, priority: Priority, dueDate?: number) => void;
}

// 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환하는 함수 (날짜 input의 min 값에 사용)
function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 새 할일을 입력하는 폼 컴포넌트
export function AddTodo({ onAdd }: AddTodoProps) {
  // 입력창에 적힌 텍스트를 저장하는 상태
  const [text, setText] = useState('');

  // 선택된 카테고리 상태 (기본값: 개인)
  const [category, setCategory] = useState<Category>('개인');

  // 선택된 중요도 상태 (기본값: 보통)
  const [priority, setPriority] = useState<Priority>('보통');

  // 선택된 마감일 상태 (기본값: 빈 문자열 = 마감일 없음)
  const [dueDateStr, setDueDateStr] = useState('');

  // 날짜 input 요소에 직접 접근하기 위한 ref
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 날짜 input 클릭 시 달력 피커를 바로 열어주는 함수
  // 기본 동작은 아이콘 영역만 피커를 열기 때문에 showPicker()로 강제로 열어줍니다
  function handleDateClick(): void {
    dateInputRef.current?.showPicker();
  }

  // 할일 추가 버튼을 눌렀을 때 실행되는 함수
  function handleSubmit(): void {
    const trimmed = text.trim(); // 앞뒤 공백 제거
    if (!trimmed) return; // 내용이 없으면 아무것도 하지 않습니다

    // 마감일이 입력된 경우 타임스탬프로 변환, 없으면 undefined
    const dueDate = dueDateStr ? toMidnightTimestamp(dueDateStr) : undefined;

    onAdd(trimmed, category, priority, dueDate); // 부모 컴포넌트에 새 할일 전달
    setText('');      // 입력창을 비웁니다
    setDueDateStr(''); // 마감일도 초기화합니다
  }

  // 키보드 입력을 감지하는 함수 - Enter 키를 누르면 할일이 추가됩니다
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className="add-todo">
      {/* 할일 내용을 입력하는 텍스트 입력창 */}
      <input
        className="add-todo__input"
        type="text"
        placeholder="할일을 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* 카테고리를 선택하는 드롭다운 */}
      <select
        className="add-todo__select"
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* 중요도를 선택하는 드롭다운 */}
      <select
        className="add-todo__select add-todo__select--priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_ICONS[p]} {p}
          </option>
        ))}
      </select>

      {/* 마감일을 선택하는 날짜 입력창 (선택사항) - 클릭하면 달력이 바로 열립니다 */}
      <input
        ref={dateInputRef}
        className="add-todo__date"
        type="date"
        value={dueDateStr}
        min={getTodayString()} // 오늘 이전 날짜는 선택할 수 없습니다
        onChange={(e) => setDueDateStr(e.target.value)}
        onClick={handleDateClick}
        title="마감일 (선택사항)"
      />

      {/* 할일 추가 버튼 - 내용이 없으면 비활성화됩니다 */}
      <button
        className="add-todo__button"
        onClick={handleSubmit}
        disabled={!text.trim()}
      >
        추가
      </button>
    </div>
  );
}
