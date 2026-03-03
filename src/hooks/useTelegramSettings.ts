import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 저장 결과 타입: 성공/실패 구분
type SaveResult = 'success' | 'error' | null;

// 텔레그램 Chat ID 설정을 관리하는 커스텀 훅
// useTheme.ts와 동일한 패턴으로 구현됩니다
export function useTelegramSettings(userId?: string) {
  // 현재 저장된 Chat ID (없으면 빈 문자열)
  const [chatId, setChatId] = useState<string>('');

  // 저장 중 여부
  const [saving, setSaving] = useState(false);

  // 저장 결과 (성공/실패, 3초 후 자동 초기화)
  const [saveResult, setSaveResult] = useState<SaveResult>(null);

  // 로그인 유저의 telegram_chat_id를 DB에서 불러옵니다
  useEffect(() => {
    if (!userId) return;

    supabase
      .from('user_profiles')
      .select('telegram_chat_id')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        setChatId(data?.telegram_chat_id ?? '');
      });
  }, [userId]);

  // Chat ID를 DB에 저장하는 함수
  // 빈 문자열을 전달하면 NULL로 저장 → 알림 끄기
  async function saveChatId(value: string): Promise<void> {
    if (!userId) return;
    setSaving(true);
    setSaveResult(null);

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        telegram_chat_id: value.trim() || null, // 빈 값은 NULL로 저장
      });

    setSaving(false);

    if (error) {
      console.error('텔레그램 설정 저장 실패:', error);
      setSaveResult('error');
    } else {
      setChatId(value.trim());
      setSaveResult('success');
    }

    // 3초 후 피드백 메시지 자동 초기화
    setTimeout(() => setSaveResult(null), 3000);
  }

  return { chatId, saving, saveResult, saveChatId };
}
