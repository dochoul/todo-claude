import { useState } from 'react';
import { useTelegramSettings } from '../../hooks/useTelegramSettings';
import './TelegramSettings.css';

interface TelegramSettingsProps {
  userId: string;
}

// 텔레그램 알림 Chat ID 설정 컴포넌트
// 접기/펼치기 방식으로 표시되며, Chat ID를 입력해 알림을 활성화합니다
export function TelegramSettings({ userId }: TelegramSettingsProps) {
  // 패널 열림/닫힘 상태 (기본: 닫힘)
  const [isOpen, setIsOpen] = useState(false);

  // 입력창에 임시로 입력 중인 값
  const [inputValue, setInputValue] = useState('');

  // 패널이 열릴 때 현재 저장된 값으로 입력창 초기화 여부 추적
  const [initialized, setInitialized] = useState(false);

  const { chatId, saving, saveResult, saveChatId } = useTelegramSettings(userId);

  // 패널 열기 — 현재 저장된 chat_id로 입력창 초기화
  function handleOpen() {
    setInputValue(chatId);
    setInitialized(true);
    setIsOpen(true);
  }

  // chatId가 로드된 후 패널이 열린 상태라면 inputValue 동기화 (최초 1회)
  if (isOpen && !initialized && chatId) {
    setInputValue(chatId);
    setInitialized(true);
  }

  // 저장 버튼 클릭
  async function handleSave() {
    await saveChatId(inputValue);
  }

  // 알림 끄기 버튼 클릭 (빈 값으로 저장 → NULL)
  async function handleDisable() {
    setInputValue('');
    await saveChatId('');
  }

  return (
    <div className="telegram-settings">
      {/* 접기/펼치기 토글 버튼 */}
      <button
        type="button"
        className="telegram-settings__toggle"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        aria-expanded={isOpen}
      >
        <span className="telegram-settings__toggle-icon">✈️</span>
        <span className="telegram-settings__toggle-label">텔레그램 알림 설정</span>
        <span className="telegram-settings__toggle-status">
          {chatId ? `알림 수신 중 (${chatId})` : '알림 꺼짐'}
        </span>
        <span className="telegram-settings__toggle-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* 펼쳐진 설정 패널 */}
      {isOpen && (
        <div className="telegram-settings__panel">
          {/* 안내 텍스트 */}
          <p className="telegram-settings__guide">
            텔레그램에서 봇을 열고 <code>/내아이디</code> 를 입력해 Chat ID를 확인한 후 아래에 입력하세요.
          </p>

          {/* Chat ID 입력 영역 */}
          <div className="telegram-settings__input-row">
            <input
              type="text"
              className="telegram-settings__input"
              placeholder="Chat ID (예: 123456789)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={saving}
            />
            <button
              type="button"
              className="telegram-settings__btn telegram-settings__btn--save"
              onClick={handleSave}
              disabled={saving || !inputValue.trim()}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            {chatId && (
              <button
                type="button"
                className="telegram-settings__btn telegram-settings__btn--disable"
                onClick={handleDisable}
                disabled={saving}
              >
                알림 끄기
              </button>
            )}
          </div>

          {/* 저장 결과 피드백 */}
          {saveResult === 'success' && (
            <p className="telegram-settings__feedback telegram-settings__feedback--success">
              ✅ 저장되었습니다. 이제 할일 변경 시 텔레그램으로 알림이 옵니다.
            </p>
          )}
          {saveResult === 'error' && (
            <p className="telegram-settings__feedback telegram-settings__feedback--error">
              ❌ 저장 중 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
