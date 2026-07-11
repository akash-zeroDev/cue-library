import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const TABS = [
  { label: 'All', section: null },
  { label: 'Heroes', section: 'Hero' },
  { label: 'Landings', section: 'Landing' },
  { label: 'Pricing', section: 'Pricing' },
  { label: 'CTA', section: 'CTA' },
  { label: 'Portfolios', section: 'Portfolio' },
  { label: 'Agencies', section: 'Agency' },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

export default function Nav({ onSearchClick }) {
  const { filter, updateFilter } = useApp()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`} aria-label="Primary">
      <a
        className="nav-wm"
        href="/"
        aria-label="Cue home"
        onClick={(e) => { e.preventDefault(); updateFilter({ section: null, pricing: 'all', q: '' }) }}
      >
        cue<span className="dot">·</span>
      </a>
      <div className="nav-tabs">
        {TABS.map((t) => {
          const on = filter.section === t.section
          return (
            <button
              key={t.label}
              type="button"
              className={`tab${on ? ' tab-on' : ''}`}
              onClick={() => updateFilter({ section: t.section })}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div className="nav-right">
        <button className="nav-icon-btn" onClick={onSearchClick} aria-label="Search prompts">
          <SearchIcon />
        </button>
      </div>
    </nav>
  )
}
