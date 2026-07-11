import { useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../hooks/useClipboard.js'
import CardThumb from './CardThumb.jsx'

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
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

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3h7v7" />
      <path d="M10 14L21 3" />
      <path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5" />
    </svg>
  )
}

// Direct prompt-carrier links where the destination supports it.
function buildDeepLink(target, prompt) {
  const p = encodeURIComponent(prompt.slice(0, 4000))
  if (target === 'Bolt') return `https://bolt.new/?prompt=${p}`
  if (target === 'v0') return `https://v0.dev/chat?q=${p}`
  return null
}

export default function Modal() {
  const { selectedItem, closeItem, showToast } = useApp()

  useEffect(() => {
    if (!selectedItem) return
    const onKey = (e) => { if (e.key === 'Escape') closeItem() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [selectedItem, closeItem])

  if (!selectedItem) return null
  const item = selectedItem
  const isPremium = item.tier === 'premium'

  const onCopy = async () => {
    if (isPremium) {
      showToast('Premium prompt — upgrade coming soon')
      return
    }
    const ok = await copyToClipboard(item.prompt)
    if (ok) showToast(`Copied “${item.title}”`)
    else showToast('Copy failed. Try again.')
  }

  return (
    <div className="modal-backdrop" onClick={closeItem}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={closeItem} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="modal-preview">
          <CardThumb
            brand={item.brand}
            variant={item.variant}
            thumbSrc={item.thumbSrc}
            hoverSrc={item.hoverSrc}
          />
          <div className="modal-stack">
            <span className="modal-stack-label">Works with</span>
            {item.stack.map((s) => (
              <span key={s} className="stack-chip">{s}</span>
            ))}
          </div>
        </div>

        <div className="modal-body">
          <h2 id="modal-title" className="modal-title">{item.title}</h2>
          <div className="modal-meta">
            <span className="modal-tag">{item.category}</span>
            <span className="modal-tag">Section · {item.section}</span>
          </div>

          <div className="modal-prompt-label">Prompt</div>

          {isPremium ? (
            <div className="modal-prompt-locked">
              <div className="lock-icon"><LockIcon /></div>
              <div className="lock-copy">
                <div className="lock-title">Premium prompt</div>
                <div className="lock-sub">Unlock the full library — every Premium prompt, forever.</div>
              </div>
            </div>
          ) : (
            <pre className="modal-prompt">{item.prompt}</pre>
          )}

          <div className="modal-actions">
            <button className="modal-copy" onClick={onCopy}>
              {isPremium ? 'Get unlimited →' : 'Copy prompt'}
            </button>
            {!isPremium && item.stack.map((target) => {
              const href = buildDeepLink(target, item.prompt)
              if (!href) return null
              return (
                <a
                  key={target}
                  className="modal-openin"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in {target}
                  <ExternalIcon />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
