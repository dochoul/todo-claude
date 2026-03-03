import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const USER_ID = process.env.SUPABASE_USER_ID!;

async function sendMessage(chatId: number, text: string) {
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

  // body 파싱
  const raw = await new Promise<string>((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });

  const body = JSON.parse(raw);
  const message = body?.message;
  if (!message) {
    res.statusCode = 200;
    res.end('ok');
    return;
  }

  const chatId: number = message.chat.id;
  const text: string = message.text || '';

  // 명령어 파싱 (/추가 내용 or 추가 내용)
  const [command, ...rest] = text.replace(/^\//, '').trim().split(' ');
  const args = rest.join(' ').trim();

  try {
    switch (command) {
      // 목록 조회
      case '목록':
      case 'list': {
        const { data } = await supabase
          .from('todos')
          .select('id, text, category, priority')
          .eq('user_id', USER_ID)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (!data || data.length === 0) {
          await sendMessage(chatId, '할일이 없습니다! 🎉');
          break;
        }

        const list = data
          .map((t, i) => `${i + 1}\\. *${t.text}* \\[${t.category} / ${t.priority}\\]`)
          .join('\n');
        await sendMessage(chatId, `📋 *할일 목록 (${data.length}개)*\n\n${list}`);
        break;
      }

      // 할일 추가
      case '추가':
      case 'add': {
        if (!args) {
          await sendMessage(chatId, '사용법: `/추가 [할일 내용]`');
          break;
        }
        await supabase.from('todos').insert({
          user_id: USER_ID,
          text: args,
          completed: false,
          category: '개인',
          priority: '보통',
          created_at: Date.now(),
        });
        await sendMessage(chatId, `✅ *"${args}"* 추가됐습니다!`);
        break;
      }

      // 완료 처리
      case '완료':
      case 'done': {
        const num = parseInt(args);
        if (isNaN(num) || num < 1) {
          await sendMessage(chatId, '사용법: `/완료 [번호]`\n번호는 `/목록`에서 확인하세요.');
          break;
        }

        const { data } = await supabase
          .from('todos')
          .select('id, text')
          .eq('user_id', USER_ID)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        const todo = data?.[num - 1];
        if (!todo) {
          await sendMessage(chatId, `❌ ${num}번 항목이 없습니다. \`/목록\`으로 확인하세요.`);
          break;
        }

        await supabase.from('todos').update({ completed: true }).eq('id', todo.id);
        await sendMessage(chatId, `🎉 *"${todo.text}"* 완료!`);
        break;
      }

      // 도움말
      default:
        await sendMessage(chatId, [
          '📌 *Todo Bot 사용법*',
          '',
          '`/목록` - 미완료 할일 보기',
          '`/추가 [내용]` - 할일 추가',
          '`/완료 [번호]` - 완료 처리',
        ].join('\n'));
    }
  } catch {
    await sendMessage(chatId, '❌ 오류가 발생했습니다.');
  }

  res.statusCode = 200;
  res.end('ok');
}
