import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

// Supabase 서버 클라이언트 (service role key → RLS 우회)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mattermost slash command body 타입
interface MattermostBody {
  token: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
}

// Mattermost 응답 타입
function reply(res: ServerResponse, text: string, inChannel = false) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    response_type: inChannel ? 'in_channel' : 'ephemeral',
    text,
  }));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return reply(res, 'Method not allowed');
  }

  // body 파싱 (Mattermost는 application/x-www-form-urlencoded 전송)
  const raw = await new Promise<string>((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });

  const body: MattermostBody = Object.fromEntries(
    new URLSearchParams(raw).entries()
  ) as unknown as MattermostBody;

  // 토큰 검증
  if (body.token !== process.env.MATTERMOST_TOKEN) {
    res.statusCode = 401;
    return reply(res, '❌ 인증 실패');
  }

  const userId = process.env.SUPABASE_USER_ID!;
  const [command, ...rest] = (body.text || '').trim().split(' ');
  const args = rest.join(' ').trim();

  try {
    switch (command) {
      // /todo 목록
      case '목록':
      case '': {
        const { data } = await supabase
          .from('todos')
          .select('id, text, category, priority, completed')
          .eq('user_id', userId)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (!data || data.length === 0) {
          return reply(res, '할일이 없습니다! 🎉');
        }

        const list = data
          .map((t, i) => `${i + 1}. **${t.text}** [${t.category} / ${t.priority}]`)
          .join('\n');
        return reply(res, `📋 **할일 목록 (${data.length}개)**\n${list}`);
      }

      // /todo 추가 [내용]
      case '추가': {
        if (!args) {
          return reply(res, '사용법: `/todo 추가 [할일 내용]`');
        }
        await supabase.from('todos').insert({
          user_id: userId,
          text: args,
          completed: false,
          category: '개인',
          priority: '보통',
          created_at: Date.now(),
        });
        return reply(res, `✅ **"${args}"** 추가됐습니다!`, true);
      }

      // /todo 완료 [번호]
      case '완료': {
        const num = parseInt(args);
        if (isNaN(num) || num < 1) {
          return reply(res, '사용법: `/todo 완료 [번호]`  (번호는 목록에서 확인)');
        }

        const { data } = await supabase
          .from('todos')
          .select('id, text')
          .eq('user_id', userId)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        const todo = data?.[num - 1];
        if (!todo) {
          return reply(res, `❌ ${num}번 항목이 없습니다. \`/todo 목록\`으로 확인하세요.`);
        }

        await supabase.from('todos').update({ completed: true }).eq('id', todo.id);
        return reply(res, `🎉 **"${todo.text}"** 완료 처리됐습니다!`, true);
      }

      // 도움말
      default:
        return reply(res, [
          '**📌 Todo 슬래시 커맨드 사용법**',
          '`/todo 목록` - 미완료 할일 목록 보기',
          '`/todo 추가 [내용]` - 새 할일 추가',
          '`/todo 완료 [번호]` - 할일 완료 처리',
        ].join('\n'));
    }
  } catch {
    res.statusCode = 500;
    return reply(res, '❌ 서버 오류가 발생했습니다.');
  }
}
