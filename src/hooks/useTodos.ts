import { useState, useEffect, useMemo } from 'react';
import { Todo, Category, Priority, Filter, CATEGORIES, isTodayDue } from '../types/todo';

// 로컬스토리지에 저장할 때 사용하는 키 이름
const STORAGE_KEY = 'todos';

// 로컬스토리지에서 저장된 할일 목록을 불러오는 함수
function loadFromStorage(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // 저장된 데이터가 없으면 빈 배열을 반환합니다
    if (!raw) return [];
    return JSON.parse(raw) as Todo[];
  } catch {
    // JSON 파싱 오류 등 예외 상황에서는 빈 배열을 반환합니다
    return [];
  }
}

// 할일 목록을 로컬스토리지에 저장하는 함수
function saveToStorage(todos: Todo[]): void {
  // 배열을 JSON 문자열로 변환해서 저장합니다
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 투두 상태를 관리하는 커스텀 훅
// 이 훅을 사용하면 할일 추가/삭제/완료 처리를 쉽게 할 수 있습니다
export function useTodos() {
  // 할일 목록 상태 - 처음에는 로컬스토리지에서 불러옵니다
  const [todos, setTodos] = useState<Todo[]>(() => loadFromStorage());

  // 현재 선택된 필터 상태 ('all' = 전체 보기)
  const [filter, setFilter] = useState<Filter>('all');

  // todos가 바뀔 때마다 자동으로 로컬스토리지에 저장합니다
  useEffect(() => {
    saveToStorage(todos);
  }, [todos]);

  // 새 할일을 추가하는 함수
  // text: 할일 내용, category: 카테고리, priority: 중요도, dueDate: 마감일(선택사항)
  function addTodo(text: string, category: Category, priority: Priority, dueDate?: number): void {
    const trimmed = text.trim(); // 앞뒤 공백 제거
    if (!trimmed) return; // 내용이 없으면 추가하지 않습니다

    // 새 할일 객체를 만듭니다
    const newTodo: Todo = {
      id: crypto.randomUUID(), // 고유한 ID 자동 생성
      text: trimmed,
      completed: false, // 처음에는 미완료 상태
      category,
      priority, // 사용자가 선택한 중요도
      createdAt: Date.now(), // 현재 시간을 저장
      dueDate,  // 마감일 (없으면 undefined로 저장됩니다)
    };

    // 새 할일을 목록 맨 앞에 추가합니다 (최신 항목이 위에 보이도록)
    setTodos((prev) => [newTodo, ...prev]);
  }

  // 특정 할일을 삭제하는 함수
  // id: 삭제할 할일의 고유 식별자
  function deleteTodo(id: string): void {
    // 해당 id를 가진 할일만 제외하고 나머지를 유지합니다
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  // 할일 완료 상태를 토글(전환)하는 함수
  // id: 상태를 바꿀 할일의 고유 식별자
  function toggleTodo(id: string): void {
    setTodos((prev) =>
      prev.map((todo) =>
        // 해당 id의 할일만 completed 값을 반전시킵니다
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  // 필터링된 할일 목록 - 선택된 필터에 맞는 할일만 반환합니다
  // useMemo를 사용해서 todos나 filter가 바뀔 때만 다시 계산합니다 (성능 최적화)
  const filteredTodos = useMemo<Todo[]>(() => {
    if (filter === 'all') return todos;              // 전체 보기
    if (filter === 'today') return todos.filter(isTodayDue); // 오늘 마감 필터
    return todos.filter((todo) => todo.category === filter); // 카테고리 필터
  }, [todos, filter]);

  // 각 필터별 할일 개수 - 필터 버튼에 표시할 숫자를 계산합니다
  // todos가 바뀔 때만 다시 계산합니다 (성능 최적화)
  const todoCounts = useMemo<Record<Filter, number>>(() => {
    const counts: Record<Filter, number> = {
      all: todos.length,
      today: todos.filter(isTodayDue).length, // 오늘 마감인 할일 개수
    } as Record<Filter, number>;
    for (const cat of CATEGORIES) {
      counts[cat] = todos.filter((t) => t.category === cat).length;
    }
    return counts;
  }, [todos]);

  // 이 훅이 제공하는 상태와 함수들을 반환합니다
  return {
    todos,
    addTodo,
    deleteTodo,
    toggleTodo,
    filter,
    setFilter,
    filteredTodos,
    todoCounts,
  };
}
