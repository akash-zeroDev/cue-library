import { useApp } from '../context/AppContext.jsx'

export default function EmptyState() {
  const { clearFilter } = useApp()
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <h3 className="empty-title">No prompts match your filters</h3>
      <p className="empty-sub">Try removing a filter, or search the full library.</p>
      <button type="button" className="empty-cta" onClick={clearFilter}>Clear filters</button>
    </div>
  )
}
