import CardThumb from './CardThumb.jsx'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../hooks/useClipboard.js'

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

export default function Card({ item }) {
  const { openItem, showToast } = useApp()
  const isPremium = item.tier === 'premium'

  const onCardActivate = () => openItem(item)
  const onCardKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCardActivate()
    }
  }

  const onBadgeClick = async (e) => {
    e.stopPropagation()
    if (isPremium) {
      openItem(item)
      return
    }
    const ok = await copyToClipboard(item.prompt)
    if (ok) showToast(`Copied “${item.title}”`)
    else showToast('Copy failed. Try again.')
  }

  return (
    <article
      className="card"
      tabIndex="0"
      onClick={onCardActivate}
      onKeyDown={onCardKey}
      role="button"
      aria-label={`Open ${item.title}`}
    >
      <CardThumb
        brand={item.brand}
        variant={item.variant}
        thumbSrc={item.thumbSrc}
        hoverSrc={item.hoverSrc}
      />
      <div className="card-meta">
        <div className="card-row">
          <h3 className="card-title">{item.title}</h3>
          <button
            type="button"
            className={`badge badge-${isPremium ? 'premium' : 'copy'}`}
            onClick={onBadgeClick}
            aria-label={isPremium ? 'Premium — view details' : `Copy ${item.title}`}
          >
            {isPremium ? <LockIcon /> : <CopyIcon />}
            {isPremium ? 'Premium' : 'Copy'}
          </button>
        </div>
        <div className="card-cat" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {item.category && item.category.split(',').map((cat, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px' }}>{cat.trim()}</span>
          ))}
        </div>
      </div>
    </article>
  )
}
