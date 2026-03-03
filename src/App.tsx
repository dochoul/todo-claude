import { useMemo } from 'react';
import { Button } from '@hiworks/ui';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { AuthForm } from './components/Auth/AuthForm';
import { AddTodo } from './components/AddTodo/AddTodo';
import { CategoryFilter } from './components/CategoryFilter/CategoryFilter';
import { TodoList } from './components/TodoList/TodoList';
import { TelegramSettings } from './components/TelegramSettings/TelegramSettings';
import './App.css';

export function App() {
  // 인증 상태 관리
  const { user, loading: authLoading, error: authError, signIn, signUp, signInWithGoogle, signOut } = useAuth();

  // 테마 상태 관리 (로그인 시 DB에 저장, 비로그인 시 localStorage 사용)
  const { theme, toggleTheme } = useTheme(user?.id);

  // 할일 상태 관리 (로그인한 사용자의 할일만 불러옵니다)
  const { addTodo, updateTodo, deleteTodo, toggleTodo, filter, setFilter, filteredTodos, todoCounts, loading: todosLoading, error: todosError } = useTodos(user);

  // 현재 필터 기준으로 완료된 할일 개수
  const completedCount = useMemo(
    () => filteredTodos.filter((t) => t.completed).length,
    [filteredTodos]
  );

  // 테마 토글 버튼 (어떤 화면에서도 접근 가능)
  const themeToggleLabel = theme === 'light' ? '🌙' : '☀️';

  // 세션 확인 중 로딩 화면
  if (authLoading) {
    return (
      <div className="app">
        <div className="app__loading">
          <div className="app__loading-spinner" />
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 — 인증 화면 + 고정 토글 버튼
  if (!user) {
    return (
      <>
        {/* 우측 상단 고정 위치의 테마 토글 버튼 */}
        <button
          type="button"
          className="app__theme-toggle--fixed"
          onClick={toggleTheme}
          title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {themeToggleLabel}
        </button>
        <AuthForm onSignIn={signIn} onSignUp={signUp} onSignInWithGoogle={signInWithGoogle} error={authError} />
      </>
    );
  }

  // 로그인한 경우 — 메인 앱 화면
  return (
    <div className="app">
      <div className="app__container">
        <header className="app__header">
          <div className="app__header-top">
            <h1 className="app__title">
              <span className="app__title-icon">&#10003;</span>
              Todo
            </h1>
            {/* 사용자 이메일 + 테마 토글 + 로그아웃 */}
            <div className="app__user">
              <button
                type="button"
                className="app__theme-toggle"
                onClick={toggleTheme}
                title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              >
                {themeToggleLabel}
              </button>
              <span className="app__user-email">{user.email}</span>
              <Button
                kind="cancel"
                size="small"
                type="button"
                onClick={signOut}
              >
                로그아웃
              </Button>
            </div>
          </div>
          <p className="app__subtitle">
            오늘의 할일을 관리하세요
          </p>
        </header>

        {/* DB 오류 메시지 */}
        {todosError && (
          <div className="app__error">{todosError}</div>
        )}

        <TelegramSettings userId={user.id} />
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

        {todosLoading ? (
          <div className="app__todos-loading">할일을 불러오는 중...</div>
        ) : (
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
          />
        )}
      </div>
    </div>
  );
}
