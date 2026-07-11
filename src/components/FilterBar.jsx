import { useApp } from '../context/AppContext.jsx'
import FilterMenu from './FilterMenu.jsx'

const PRICING = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
]
const SORT = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
]

export default function FilterBar() {
  const { filter, updateFilter, isFiltering, clearFilter } = useApp()
  return (
    <div className="filter" role="toolbar" aria-label="Filter prompts">
      <div className="filter-group">
        <FilterMenu
          label="Pricing"
          value={filter.pricing}
          options={PRICING}
          onChange={(v) => updateFilter({ pricing: v })}
          align="left"
        />
        {isFiltering && (
          <button type="button" className="filter-clear" onClick={clearFilter}>
            Clear filters
          </button>
        )}
      </div>
      <div className="filter-group">
        <FilterMenu
          label="Sort"
          value={filter.sort}
          options={SORT}
          onChange={(v) => updateFilter({ sort: v })}
          align="right"
        />
      </div>
    </div>
  )
}
