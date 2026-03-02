# Plan: dark-mode

## 목표
라이트/다크 테마를 전환할 수 있는 다크모드를 추가한다.
사용자의 설정을 기억하고, 시스템 설정(OS 다크모드)도 자동 감지한다.

## 배경
- 현재: 모든 색상이 각 CSS 파일에 하드코딩 (`#5c6bc0`, `#ffffff` 등)
- 목표: CSS 변수(Custom Properties)로 색상을 중앙 관리 → 테마 전환 시 변수 값만 교체

---

## 요구사항

### 기능
1. 헤더에 다크모드 토글 버튼 (☀ / 🌙)
2. 토글 시 라이트 ↔ 다크 테마 즉시 전환
3. 선택한 테마를 localStorage에 저장 (새로고침해도 유지)
4. 최초 방문 시 OS 시스템 설정 자동 감지 (`prefers-color-scheme`)

### UI
1. 토글 버튼: 헤더 우측에 배치 (로그아웃 버튼 옆)
2. 전환 시 부드러운 트랜지션 (`transition: background 0.3s, color 0.3s`)
3. 모든 컴포넌트에 다크 테마 적용 (배경, 텍스트, 배지, 버튼, 입력창)

### 다크 테마 색상
| 역할 | 라이트 | 다크 |
|------|--------|------|
| 앱 배경 | `#e8eaf6 → #f3e5f5` (그라데이션) | `#1a1a2e → #16213e` |
| 카드 배경 | `#ffffff` | `#1e1e2e` |
| 메인 텍스트 | `#333333` | `#e0e0e0` |
| 보조 텍스트 | `#757575` | `#9e9e9e` |
| 포인트 색상 | `#5c6bc0` | `#7986cb` |
| 테두리 | `#c5cae9` | `#3a3a5c` |
| 입력창 배경 | `#f8f9ff` | `#2a2a3e` |

---

## 변경 범위

### 새로 생성하는 파일
| 파일 | 역할 |
|------|------|
| `src/hooks/useTheme.ts` | 테마 상태 관리 (toggle, persist, system detect) |

### 수정하는 파일
| 파일 | 변경 내용 |
|------|-----------|
| `src/index.css` | CSS 변수 정의 (`:root` 라이트, `[data-theme="dark"]` 다크) |
| `src/App.tsx` | 토글 버튼 추가, `useTheme` 훅 연결, `document.documentElement`에 `data-theme` 적용 |
| `src/App.css` | 하드코딩 색상 → CSS 변수로 교체 |
| `src/components/AddTodo/AddTodo.css` | CSS 변수로 교체 |
| `src/components/TodoItem/TodoItem.css` | CSS 변수로 교체 |
| `src/components/TodoList/TodoList.css` | CSS 변수로 교체 |
| `src/components/CategoryFilter/CategoryFilter.css` | CSS 변수로 교체 |
| `src/components/Auth/AuthForm.css` | CSS 변수로 교체 |

---

## 구현 방식

### CSS 변수 전략
```css
/* src/index.css */
:root {
  --color-bg: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 50%, #e3f2fd 100%);
  --color-card: #ffffff;
  --color-text: #333333;
  --color-text-sub: #757575;
  --color-primary: #5c6bc0;
  --color-primary-light: #7986cb;
  --color-border: #c5cae9;
  --color-input-bg: #f8f9ff;
  --color-surface: #f5f6ff;
  /* ...기타 변수 */
}

[data-theme="dark"] {
  --color-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --color-card: #1e1e2e;
  --color-text: #e0e0e0;
  --color-text-sub: #9e9e9e;
  --color-primary: #7986cb;
  --color-primary-light: #9fa8da;
  --color-border: #3a3a5c;
  --color-input-bg: #2a2a3e;
  --color-surface: #252540;
  /* ...기타 변수 */
}
```

### 테마 훅
```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  // localStorage → system preference → 'light' 순으로 초기값 결정
  // document.documentElement.setAttribute('data-theme', theme)
  // toggle: light ↔ dark
}
```

---

## 구현 순서
1. `src/index.css` — CSS 변수 정의 (라이트 + 다크)
2. `src/hooks/useTheme.ts` — 테마 훅 (상태 + toggle + persist)
3. `src/App.tsx` — `useTheme` 연결 + 토글 버튼 추가
4. 각 CSS 파일 — 하드코딩 색상 → CSS 변수 교체 (6개 파일)

---

## 완료 기준
- [ ] 헤더 토글 버튼으로 라이트 ↔ 다크 전환 가능
- [ ] 새로고침해도 선택한 테마 유지
- [ ] 최초 방문 시 OS 다크모드 자동 감지
- [ ] 모든 컴포넌트(카드, 버튼, 입력창, 배지, 폼)에 다크 테마 적용
- [ ] 전환 시 부드러운 트랜지션

---

## 주의사항
- 배지 색상(카테고리, 중요도, D-Day)은 인라인 style로 설정되므로 CSS 변수 적용 불가 → 별도 처리 불필요 (색상 자체는 유지해도 무방)
- `prefers-color-scheme`은 초기값 결정에만 사용, 이후 사용자 설정 우선
