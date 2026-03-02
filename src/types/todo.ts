// 카테고리 타입 - 할일을 분류하는 데 사용됩니다
export type Category = '개인' | '업무' | '쇼핑' | '회의' | '기타';

// 중요도 타입 - 할일의 우선순위를 나타냅니다
export type Priority = '높음' | '보통' | '낮음';

// 사용 가능한 카테고리 목록 (화면에 표시할 순서대로 나열)
export const CATEGORIES: Category[] = ['개인', '업무', '쇼핑', '회의', '기타'];

// 사용 가능한 중요도 목록 (높은 순서대로 나열)
export const PRIORITIES: Priority[] = ['높음', '보통', '낮음'];

// 카테고리별 색상 정의 (배지에 사용됩니다)
export const CATEGORY_COLORS: Record<Category, string> = {
  '개인': '#4CAF50', // 초록색
  '업무': '#2196F3', // 파란색
  '쇼핑': '#FF9800', // 주황색
  '회의': '#9C27B0', // 보라색
  '기타': '#9E9E9E', // 회색
};

// 중요도별 색상 정의
export const PRIORITY_COLORS: Record<Priority, string> = {
  '높음': '#F44336', // 빨간색 - 긴급함을 표현
  '보통': '#FF9800', // 주황색 - 중간 중요도를 표현
  '낮음': '#8BC34A', // 연두색 - 낮은 중요도를 표현
};

// 중요도별 아이콘 이모지 (시각적으로 중요도를 구분하기 쉽게 합니다)
export const PRIORITY_ICONS: Record<Priority, string> = {
  '높음': '🔴',
  '보통': '🟡',
  '낮음': '🟢',
};

// 필터 타입 - '전체', '오늘 마감', 또는 특정 카테고리로 할일을 필터링할 때 사용합니다
export type Filter = 'all' | 'today' | Category;

// 할일 하나를 나타내는 데이터 구조 (인터페이스)
export interface Todo {
  id: string;        // 각 할일을 구별하는 고유한 식별자
  text: string;      // 할일 내용
  completed: boolean; // 완료 여부 (true = 완료, false = 미완료)
  category: Category; // 카테고리 (개인/업무/쇼핑/기타)
  priority: Priority; // 중요도 (높음/보통/낮음)
  createdAt: number; // 만들어진 시간 (밀리초 단위 타임스탬프)
  dueDate?: number;  // 마감일 타임스탬프 (선택사항, 해당 날짜 자정 기준)
}

// D-Day 상태 타입 - 마감일까지 남은 시간을 4단계로 분류합니다
export type DueDateStatus = 'far' | 'soon' | 'today' | 'overdue' | null;
// far     = D-3 이상 (회색, 여유 있음)
// soon    = D-2 ~ D-1 (주황색, 임박)
// today   = D-Day (빨간색, 오늘 마감)
// overdue = 기한 초과 (진한 빨강 배경)
// null    = 마감일 없음

// 오늘 자정(00:00:00) 타임스탬프를 반환하는 함수
function getTodayMidnight(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시/분/초/밀리초를 0으로 설정
  return today.getTime();
}

// 마감일 상태를 계산하는 함수 (D-Day 배지에 사용)
export function getDueDateStatus(dueDate?: number): DueDateStatus {
  if (dueDate === undefined) return null; // 마감일이 없으면 null 반환

  const todayMs = getTodayMidnight();
  const MS_PER_DAY = 1000 * 60 * 60 * 24; // 하루를 밀리초로 표현
  const diffDays = Math.round((dueDate - todayMs) / MS_PER_DAY); // 남은 일수

  if (diffDays < 0) return 'overdue'; // 이미 기한이 지났습니다
  if (diffDays === 0) return 'today';  // 오늘이 마감입니다
  if (diffDays <= 2) return 'soon';    // 2일 이내로 임박했습니다
  return 'far';                         // 3일 이상 남았습니다
}

// D-Day 라벨 문자열을 반환하는 함수 ("D-3", "D-Day", "D+2" 형식)
export function formatDueDateLabel(dueDate: number): string {
  const todayMs = getTodayMidnight();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((dueDate - todayMs) / MS_PER_DAY);

  if (diffDays === 0) return 'D-Day';                    // 오늘 마감
  if (diffDays > 0) return `D-${diffDays}`;              // 남은 일수
  return `D+${Math.abs(diffDays)}`;                      // 초과 일수
}

// 날짜 문자열("2026-02-27")을 로컬 자정 타임스탬프로 변환하는 함수
export function toMidnightTimestamp(dateStr: string): number {
  // 'T00:00:00'을 붙여서 로컬 시간 기준 자정으로 파싱합니다
  return new Date(dateStr + 'T00:00:00').getTime();
}

// 타임스탬프를 날짜 input용 "YYYY-MM-DD" 문자열로 변환하는 함수 (편집 모드에 사용)
export function timestampToDateStr(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 할일의 마감일이 오늘인지 확인하는 함수 ('오늘 마감' 필터에 사용)
export function isTodayDue(todo: Todo): boolean {
  if (todo.dueDate === undefined) return false;
  return getDueDateStatus(todo.dueDate) === 'today';
}
