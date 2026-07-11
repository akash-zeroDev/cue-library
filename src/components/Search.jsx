import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext.jsx'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

export default function Search({ open, onClose }) {
  const { filter, updateFilter } = useApp()
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="search-backdrop" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <span className="search-icon"><SearchIcon /></span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search prompts by title, brand, or category"
            value={filter.q}
            onChange={(e) => updateFilter({ q: e.target.value })}
          />
          {filter.q && (
            <button type="button" className="search-clear" onClick={() => updateFilter({ q: '' })} aria-label="Clear search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="search-hint">
          <span><kbd>⌘</kbd> <kbd>K</kbd> to open · <kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
