import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 지원하는 테마 타입
type Theme = 'light' | 'dark';

// localStorage에 저장할 키 이름 (비로그인 상태 fallback용)
const STORAGE_KEY = 'theme';

// 테마 상태 관리 커스텀 훅
// userId가 있으면 DB에서 읽고 쓰며, 없으면 localStorage를 사용합니다
export function useTheme(userId?: string) {
  // 초기값 결정 순서: localStorage 저장값 → OS 시스템 설정 → 'light'
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // OS 다크모드 설정 자동 감지
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // theme가 바뀔 때마다 <html> 태그에 data-theme 속성을 업데이트합니다
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // 로그인된 사용자의 테마를 DB에서 불러옵니다
  useEffect(() => {
    if (!userId) return;

    supabase
      .from('user_profiles')
      .select('theme')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.theme === 'light' || data?.theme === 'dark') {
          setTheme(data.theme);
        }
      });
  }, [userId]);

  // 라이트 ↔ 다크 전환 함수
  // 로그인 상태면 DB에도 저장합니다
  function toggleTheme(): void {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);

    if (userId) {
      supabase
        .from('user_profiles')
        .upsert({ user_id: userId, theme: next })
        .then(({ error }) => {
          if (error) console.error('테마 저장 실패:', error);
        });
    }
  }

  return { theme, toggleTheme };
}
