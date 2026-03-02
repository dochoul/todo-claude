import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// 이 훅이 반환하는 값의 타입 정의
interface UseAuthReturn {
  user: User | null;        // 현재 로그인한 사용자 정보 (없으면 null)
  loading: boolean;         // 세션 확인 중인지 여부
  error: string | null;     // 오류 메시지
  signIn: (email: string, password: string) => Promise<boolean>;    // 로그인 함수 (true=성공)
  signUp: (email: string, password: string) => Promise<boolean>;    // 회원가입 함수 (true=성공)
  signOut: () => Promise<void>;                                   // 로그아웃 함수
}

// 로그인/로그아웃/세션 관리를 담당하는 커스텀 훅
export function useAuth(): UseAuthReturn {
  // 현재 로그인한 사용자 상태 (null = 비로그인)
  const [user, setUser] = useState<User | null>(null);

  // 세션 초기화 중 여부 (앱 최초 로드 시 기존 세션 확인)
  const [loading, setLoading] = useState(true);

  // 오류 메시지 상태
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 앱 시작 시 현재 세션을 확인합니다 (새로고침해도 로그인 유지)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false); // 세션 확인 완료
    });

    // 로그인/로그아웃 등 인증 상태 변화를 실시간으로 감지합니다
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 컴포넌트가 사라질 때 이벤트 구독을 해제합니다 (메모리 누수 방지)
    return () => subscription.unsubscribe();
  }, []);

  // 이메일 + 비밀번호로 로그인하는 함수
  // 반환값: true = 로그인 성공, false = 실패
  async function signIn(email: string, password: string): Promise<boolean> {
    setError(null); // 이전 오류 초기화
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(translateAuthError(signInError.message));
      return false; // 실패
    }
    return true; // 성공
  }

  // 이메일 + 비밀번호로 회원가입하는 함수
  // 반환값: true = 가입 성공, false = 실패
  async function signUp(email: string, password: string): Promise<boolean> {
    setError(null); // 이전 오류 초기화
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      return false; // 실패
    }
    return true; // 성공
  }

  // 로그아웃 함수
  async function signOut(): Promise<void> {
    setError(null);
    await supabase.auth.signOut();
  }

  return { user, loading, error, signIn, signUp, signOut };
}

// Supabase 영어 오류 메시지를 한국어로 변환하는 함수
function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.';
  }
  if (message.includes('User already registered')) {
    return '이미 가입된 이메일입니다. 로그인을 시도해주세요.';
  }
  if (message.includes('Password should be at least')) {
    return '비밀번호는 최소 6자 이상이어야 합니다.';
  }
  if (message.includes('Unable to validate email address')) {
    return '유효하지 않은 이메일 주소입니다.';
  }
  if (message.toLowerCase().includes('rate limit')) {
    return '잠시 후 다시 시도해주세요. (이메일 발송 횟수 초과)';
  }
  // 번역되지 않은 오류는 원문 그대로 표시합니다
  return message;
}
