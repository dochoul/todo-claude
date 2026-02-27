import { Filter, CATEGORIES, CATEGORY_COLORS } from '../../types/todo';
import './CategoryFilter.css';

// '오늘 마감' 필터의 강조 색상 (카테고리 색상과 구분되는 핑크 계열)
const TODAY_FILTER_COLOR = '#E91E63';

// CategoryFilter 컴포넌트가 부모로부터 받는 속성(props) 정의
interface CategoryFilterProps {
  currentFilter: Filter;                    // 현재 선택된 필터
  onFilterChange: (filter: Filter) => void; // 필터가 바뀔 때 호출하는 함수
  todoCounts: Record<Filter, number>;       // 각 필터별 할일 개수
}

// 카테고리 필터 버튼 목록을 렌더링하는 컴포넌트
export function CategoryFilter({
  currentFilter,
  onFilterChange,
  todoCounts,
}: CategoryFilterProps) {
  return (
    <div className="category-filter">
      {/* '전체' 필터 버튼 - 모든 할일을 보여줍니다 */}
      <button
        className={`category-filter__btn${currentFilter === 'all' ? ' category-filter__btn--active' : ''}`}
        onClick={() => onFilterChange('all')}
        style={currentFilter === 'all' ? { borderColor: '#5c6bc0', color: '#5c6bc0' } : {}}
      >
        전체
        <span className="category-filter__count">{todoCounts['all']}</span>
      </button>

      {/* '오늘 마감' 필터 버튼 - 오늘 마감인 할일만 보여줍니다 */}
      <button
        className={`category-filter__btn${currentFilter === 'today' ? ' category-filter__btn--active' : ''}`}
        onClick={() => onFilterChange('today')}
        style={currentFilter === 'today' ? { borderColor: TODAY_FILTER_COLOR, color: TODAY_FILTER_COLOR } : {}}
      >
        {/* 달력 아이콘으로 마감일 필터임을 표시합니다 */}
        <span className="category-filter__dot" style={{ background: TODAY_FILTER_COLOR }} />
        오늘 마감
        <span className="category-filter__count">{todoCounts['today'] ?? 0}</span>
      </button>

      {/* 각 카테고리별 필터 버튼을 렌더링합니다 */}
      {CATEGORIES.map((cat) => {
        const isActive = currentFilter === cat; // 현재 선택된 카테고리인지 확인
        const color = CATEGORY_COLORS[cat];     // 카테고리 고유 색상
        return (
          <button
            key={cat}
            className={`category-filter__btn${isActive ? ' category-filter__btn--active' : ''}`}
            onClick={() => onFilterChange(cat)}
            style={isActive ? { borderColor: color, color: color } : {}}
          >
            {/* 카테고리 색상을 나타내는 원형 점 */}
            <span
              className="category-filter__dot"
              style={{ background: color }}
            />
            {cat}
            <span className="category-filter__count">{todoCounts[cat] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
