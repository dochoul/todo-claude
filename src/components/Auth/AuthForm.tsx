import { useState, KeyboardEvent } from 'react';
import './AuthForm.css';

// AuthForm 컴포넌트가 부모로부터 받는 속성(props) 정의
interface AuthFormProps {
  // 로그인 함수 (true=성공, false=실패)
  onSignIn: (email: string, password: string) => Promise<boolean>;
  // 회원가입 함수 (true=성공, false=실패)
  onSignUp: (email: string, password: string) => Promise<boolean>;
  // 오류 메시지 (null이면 오류 없음)
  error: string | null;
}

// 로그인 / 회원가입 폼 컴포넌트
export function AuthForm({ onSignIn, onSignUp, error }: AuthFormProps) {
  // 현재 모드: 'signin' = 로그인, 'signup' = 회원가입
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // 이메일 입력값 상태
  const [email, setEmail] = useState('');

  // 비밀번호 입력값 상태
  const [password, setPassword] = useState('');

  // 요청 처리 중 여부 (중복 제출 방지)
  const [submitting, setSubmitting] = useState(false);

  // 회원가입 완료 후 안내 메시지 표시 여부
  const [signUpDone, setSignUpDone] = useState(false);

  // 제출 버튼 클릭 또는 Enter 키 입력 시 호출되는 함수
  async function handleSubmit(): Promise<void> {
    // 이메일 또는 비밀번호가 비어있으면 제출하지 않습니다
    if (!email.trim() || !password.trim()) return;
    if (submitting) return; // 이미 처리 중이면 중복 제출 방지

    setSubmitting(true); // 처리 시작
    setSignUpDone(false);

    if (mode === 'signin') {
      // 로그인 시도
      await onSignIn(email.trim(), password);
    } else {
      // 회원가입 시도 - 반환값(true/false)으로 성공 여부를 직접 확인합니다
      // error prop은 React 상태 업데이트 타이밍 때문에 여기서 바로 읽으면 안 됩니다
      const success = await onSignUp(email.trim(), password);
      if (success) {
        setSignUpDone(true);
      }
    }

    setSubmitting(false); // 처리 완료
  }

  // Enter 키 입력 시 제출하는 함수 (IME 조합 중에는 무시합니다)
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit();
    }
  }

  // 모드 전환 시 입력값과 상태를 초기화합니다
  function switchMode(newMode: 'signin' | 'signup'): void {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setSignUpDone(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* 앱 제목 */}
        <div className="auth-header">
          <span className="auth-icon">&#10003;</span>
          <h1 className="auth-title">Todo</h1>
          <p className="auth-subtitle">할일을 어디서든 관리하세요</p>
        </div>

        {/* 로그인 / 회원가입 탭 전환 버튼 */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            로그인
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            회원가입
          </button>
        </div>

        {/* 이메일 입력 필드 */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-email">이메일</label>
          <input
            id="auth-email"
            type="email"
            className="auth-input"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />
        </div>

        {/* 비밀번호 입력 필드 */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-password">비밀번호</label>
          <input
            id="auth-password"
            type="password"
            className="auth-input"
            placeholder="6자 이상 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        {/* 오류 메시지 (오류가 있을 때만 표시) */}
        {error && <p className="auth-error">{error}</p>}

        {/* 회원가입 완료 안내 메시지 */}
        {signUpDone && (
          <p className="auth-success">
            가입이 완료되었습니다! 이메일을 확인하여 인증 후 로그인해주세요.
          </p>
        )}

        {/* 제출 버튼 */}
        <button
          type="button"
          className="auth-submit"
          onClick={handleSubmit}
          disabled={!email.trim() || !password.trim() || submitting}
        >
          {submitting
            ? '처리 중...'
            : mode === 'signin' ? '로그인' : '회원가입'}
        </button>
      </div>
    </div>
  );
}
