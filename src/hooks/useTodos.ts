import { useState, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Todo, Category, Priority, Filter, CATEGORIES, isTodayDue } from '../types/todo';

// Supabase DB에서 반환하는 행 타입 정의
// DB 컬럼명은 snake_case이므로 camelCase로 변환해야 합니다
interface TodoRow {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  due_date: number | null;
  created_at: number;
}

// DB 행을 앱에서 사용하는 Todo 객체로 변환하는 함수
function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    category: row.category,
    priority: row.priority,
    createdAt: row.created_at,
    dueDate: row.due_date ?? undefined, // null → undefined로 변환
  };
}

// 투두 상태를 관리하는 커스텀 훅 (Supabase 연동 버전)
// user: 현재 로그인한 사용자 (null이면 훅이 동작하지 않습니다)
export function useTodos(user: User | null) {
  // 할일 목록 상태
  const [todos, setTodos] = useState<Todo[]>([]);

  // 현재 선택된 필터 상태 ('all' = 전체 보기)
  const [filter, setFilter] = useState<Filter>('all');

  // 데이터를 불러오는 중인지 여부
  const [loading, setLoading] = useState(false);

  // DB 작업 오류 메시지
  const [error, setError] = useState<string | null>(null);

  // 로그인한 사용자가 바뀔 때마다 해당 사용자의 할일을 불러옵니다
  useEffect(() => {
    if (!user) {
      // 로그인하지 않은 경우 목록을 비웁니다
      setTodos([]);
      return;
    }
    fetchTodos();
  }, [user]);

  // Supabase에서 현재 사용자의 할일 목록을 가져오는 함수
  async function fetchTodos(): Promise<void> {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false }); // 최신 항목이 위에 오도록 정렬

    if (fetchError) {
      setError('할일을 불러오는 중 오류가 발생했습니다.');
      console.error(fetchError);
    } else {
      // DB 행 목록을 Todo 객체 배열로 변환합니다
      setTodos((data as TodoRow[]).map(rowToTodo));
    }
    setLoading(false);
  }

  // 새 할일을 Supabase에 추가하는 함수
  async function addTodo(text: string, category: Category, priority: Priority, dueDate?: number): Promise<void> {
    const trimmed = text.trim(); // 앞뒤 공백 제거
    if (!trimmed || !user) return; // 내용이 없거나 로그인하지 않은 경우 중단

    // DB에 삽입할 행 데이터를 구성합니다 (snake_case 컬럼명 사용)
    const newRow = {
      user_id: user.id,        // RLS 정책에서 사용자를 구분하는 키
      text: trimmed,
      completed: false,
      category,
      priority,
      created_at: Date.now(),  // 현재 시각 (밀리초 타임스탬프)
      due_date: dueDate ?? null, // undefined → null로 변환 (DB는 null 사용)
    };

    const { data, error: insertError } = await supabase
      .from('todos')
      .insert(newRow)
      .select()
      .single(); // 삽입된 행을 바로 반환받습니다

    if (insertError) {
      setError('할일을 추가하는 중 오류가 발생했습니다.');
      console.error(insertError);
    } else {
      // 서버에서 반환된 데이터를 상태에 추가합니다 (맨 앞에 추가)
      setTodos((prev) => [rowToTodo(data as TodoRow), ...prev]);
    }
  }

  // 특정 할일을 Supabase에서 삭제하는 함수
  async function deleteTodo(id: string): Promise<void> {
    // 먼저 화면에서 즉시 제거합니다 (낙관적 업데이트 - 빠른 UX 제공)
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id); // id가 일치하는 행만 삭제합니다

    if (deleteError) {
      // 삭제에 실패하면 다시 목록을 불러옵니다
      setError('할일을 삭제하는 중 오류가 발생했습니다.');
      fetchTodos();
    }
  }

  // 할일 내용을 수정하는 함수
  // id: 수정할 할일의 고유 식별자, updates: 바꿀 필드만 부분적으로 전달합니다
  async function updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'dueDate'>>): Promise<void> {
    // 화면 먼저 업데이트 (낙관적 업데이트)
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    // DB 컬럼명으로 변환합니다 (dueDate → due_date)
    const dbUpdates: Record<string, unknown> = { ...updates };
    if ('dueDate' in updates) {
      dbUpdates['due_date'] = updates.dueDate ?? null;
      delete dbUpdates['dueDate'];
    }

    const { error: updateError } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('id', id);

    if (updateError) {
      setError('할일을 수정하는 중 오류가 발생했습니다.');
      fetchTodos(); // 실패 시 서버 상태로 복원합니다
    }
  }

  // 할일 완료 상태를 토글(전환)하는 함수
  async function toggleTodo(id: string): Promise<void> {
    // 현재 상태를 찾아서 반전시킵니다
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;

    // 화면 먼저 업데이트 (낙관적 업데이트)
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    const { error: toggleError } = await supabase
      .from('todos')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (toggleError) {
      setError('할일 상태를 변경하는 중 오류가 발생했습니다.');
      fetchTodos(); // 실패 시 서버 상태로 복원합니다
    }
  }

  // 필터링된 할일 목록 - 선택된 필터에 맞는 할일만 반환합니다
  const filteredTodos = useMemo<Todo[]>(() => {
    if (filter === 'all') return todos;
    if (filter === 'today') return todos.filter(isTodayDue);
    return todos.filter((t) => t.category === filter);
  }, [todos, filter]);

  // 각 필터별 할일 개수 - 필터 버튼에 표시할 숫자를 계산합니다
  const todoCounts = useMemo<Record<Filter, number>>(() => {
    const counts: Record<Filter, number> = {
      all: todos.length,
      today: todos.filter(isTodayDue).length,
    } as Record<Filter, number>;
    for (const cat of CATEGORIES) {
      counts[cat] = todos.filter((t) => t.category === cat).length;
    }
    return counts;
  }, [todos]);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    filter,
    setFilter,
    filteredTodos,
    todoCounts,
    loading,
    error,
  };
}
