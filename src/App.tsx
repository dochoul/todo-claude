import { useMemo } from 'react';
import { useTodos } from './hooks/useTodos';
import { AddTodo } from './components/AddTodo/AddTodo';
import { CategoryFilter } from './components/CategoryFilter/CategoryFilter';
import { TodoList } from './components/TodoList/TodoList';
import './App.css';

export function App() {
  const { addTodo, deleteTodo, toggleTodo, filter, setFilter, filteredTodos, todoCounts } =
    useTodos();

  // 현재 필터 기준으로 완료된 할일 개수
  const completedCount = useMemo(
    () => filteredTodos.filter((t) => t.completed).length,
    [filteredTodos]
  );

  return (
    <div className="app">
      <div className="app__container">
        <header className="app__header">
          <h1 className="app__title">
            <span className="app__title-icon">&#10003;</span>
            Todo
          </h1>
          <p className="app__subtitle">
            오늘의 할일을 관리하세요
          </p>
        </header>

        <AddTodo onAdd={addTodo} />

        <CategoryFilter
          currentFilter={filter}
          onFilterChange={setFilter}
          todoCounts={todoCounts}
        />

        <div className="app__stats">
          <span className="app__stats-text">
            {filteredTodos.length}개 중{' '}
            <strong>{completedCount}개</strong> 완료
          </span>
          {filteredTodos.length > 0 && (
            <div className="app__progress">
              <div
                className="app__progress-bar"
                style={{ width: `${(completedCount / filteredTodos.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  );
}
