import { Todo } from '../../types/todo';
import { TodoItem } from '../TodoItem/TodoItem';
import './TodoList.css';

// TodoList 컴포넌트가 부모로부터 받는 속성(props) 정의
interface TodoListProps {
  todos: Todo[];                    // 표시할 할일 목록
  onToggle: (id: string) => void;  // 완료 상태를 바꿀 때 호출하는 함수
  onDelete: (id: string) => void;  // 할일을 삭제할 때 호출하는 함수
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'dueDate'>>) => void; // 할일을 수정할 때 호출하는 함수
}

// 할일 목록 전체를 렌더링하는 컴포넌트
export function TodoList({ todos, onToggle, onDelete, onUpdate }: TodoListProps) {
  // 할일이 없을 때 안내 메시지를 보여줍니다
  if (todos.length === 0) {
    return (
      <div className="todo-list__empty">
        <div className="todo-list__empty-icon">&#10003;</div>
        <p className="todo-list__empty-text">할일이 없습니다</p>
        <p className="todo-list__empty-sub">새로운 할일을 추가해보세요!</p>
      </div>
    );
  }

  // 할일 목록을 순서 없는 리스트(ul)로 렌더링합니다
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        // 각 할일을 리스트 아이템(li)으로 감싸서 표시합니다
        <li key={todo.id} className="todo-list__item">
          <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
        </li>
      ))}
    </ul>
  );
}
