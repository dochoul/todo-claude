import { useState, KeyboardEvent } from 'react';
import doneItLogo from '../../assets/done-it-logo.svg';
import './AuthForm.css';

// AuthForm 컴포넌트가 부모로부터 받는 속성(props) 정의
interface AuthFormProps {
  // 로그인 함수 (true=성공, false=실패)
  onSignIn: (email: string, password: string) => Promise<boolean>;
  // 회원가입 함수 (true=성공, false=실패)
  onSignUp: (email: string, password: string) => Promise<boolean>;
  // 구글 로그인 함수
  onSignInWithGoogle: () => Promise<void>;
  // 오류 메시지 (null이면 오류 없음)
  error: string | null;
}

// 로그인 / 회원가입 폼 컴포넌트
export function AuthForm({ onSignIn, onSignUp, onSignInWithGoogle, error }: AuthFormProps) {
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
          <img src={doneItLogo} alt="DoneIt" className="auth-logo" />
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

        {/* 구분선 */}
        <div className="auth-divider">
          <span>또는</span>
        </div>

        {/* 구글 로그인 버튼 */}
        <button
          type="button"
          className="auth-google"
          onClick={onSignInWithGoogle}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.583 9 3.583z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>
      </div>
    </div>
  );
}
