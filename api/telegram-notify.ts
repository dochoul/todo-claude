import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin 클라이언트 (RLS 우회, user_profiles 조회용)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// 특정 chat_id로 텔레그램 메시지 발송
async function sendMessage(chatId: string, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  // 요청 body 파싱
  const raw = await new Promise<string>((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });

  const { action, text, userId } = JSON.parse(raw) as {
    action: 'add' | 'complete' | 'delete';
    text: string;
    userId: string;
  };

  // userId가 없으면 발송 불가
  if (!userId) {
    res.statusCode = 200;
    res.end('ok');
    return;
  }

  // user_profiles에서 해당 유저의 telegram_chat_id 조회
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('telegram_chat_id')
    .eq('user_id', userId)
    .single();

  const chatId: string | null = profile?.telegram_chat_id ?? null;

  // chat_id 미설정 유저는 조용히 스킵
  if (!chatId) {
    res.statusCode = 200;
    res.end('ok');
    return;
  }

  // 액션별 알림 메시지 구성
  const messages: Record<string, string> = {
    add:      `➕ 할일 추가: *${text}*`,
    complete: `✅ 완료: *${text}*`,
    delete:   `🗑 삭제: *${text}*`,
  };

  await sendMessage(chatId, messages[action] ?? `[${action}] ${text}`);

  res.statusCode = 200;
  res.end('ok');
}
