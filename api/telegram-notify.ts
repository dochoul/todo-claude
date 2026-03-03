import type { IncomingMessage, ServerResponse } from 'http';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMessage(text: string) {
  if (!CHAT_ID) return;
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const raw = await new Promise<string>((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });

  const { action, text } = JSON.parse(raw) as { action: 'add' | 'complete' | 'delete'; text: string };

  const messages: Record<string, string> = {
    add:      `➕ 할일 추가: *${text}*`,
    complete: `✅ 완료: *${text}*`,
    delete:   `🗑 삭제: *${text}*`,
  };

  await sendMessage(messages[action] ?? `[${action}] ${text}`);

  res.statusCode = 200;
  res.end('ok');
}
