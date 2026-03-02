import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase 접속 정보를 가져옵니다
// .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해야 합니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Supabase 클라이언트를 생성합니다
// 이 객체를 통해 DB 조회, 인증 등 모든 Supabase 기능을 사용합니다
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
