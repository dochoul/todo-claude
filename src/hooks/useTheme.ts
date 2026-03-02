import { useState, useEffect } from 'react';

// 지원하는 테마 타입
type Theme = 'light' | 'dark';

// localStorage에 저장할 키 이름
const STORAGE_KEY = 'theme';

// 테마 상태 관리 커스텀 훅
export function useTheme() {
  // 초기값 결정 순서: localStorage 저장값 → OS 시스템 설정 → 'light'
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // OS 다크모드 설정 자동 감지
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // theme가 바뀔 때마다 <html> 태그에 data-theme 속성을 업데이트합니다
  // CSS 변수가 [data-theme="dark"]에 따라 자동으로 전환됩니다
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // 라이트 ↔ 다크 전환 함수
  function toggleTheme(): void {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  return { theme, toggleTheme };
}
