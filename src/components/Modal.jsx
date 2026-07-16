import React, { useEffect, useState } from 'react'
import { copyToClipboard } from '../hooks/useClipboard.js'
import { backend } from '../lib/backend.js'
import { useClerk, useUser } from '@clerk/clerk-react'

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: '16px', height: '16px' }}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: '14px', height: '14px' }}>
      <path d="M14 3h7v7" />
      <path d="M10 14L21 3" />
      <path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5" />
    </svg>
  )
}

function buildDeepLink(target, prompt) {
  const p = encodeURIComponent(prompt?.slice(0, 4000) || '')
  if (target === 'Bolt') return `https://bolt.new/?prompt=${p}`
  if (target === 'v0') return `https://v0.dev/chat?q=${p}`
  return null
}

export default function Modal({ item, onClose, showToast }) {
  const { isSignedIn } = useUser()
  const clerk = useClerk()
  
  useEffect(() => {
    if (!item) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [item, onClose])

  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) {
      setContent(null)
      return
    }
    let active = true
    setLoading(true)
    backend.getPromptContent(item.id).then(text => {
      if (active) {
        setContent(text)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [item])

  if (!item) return null

  const isPremium = item.tier === 'premium'
  const isLocked = isPremium && content === null && !loading

  const onPurchase = async () => {
    if (!isSignedIn) {
      if (showToast) showToast('Please sign in to continue purchase')
      clerk.openSignIn({ redirectUrl: window.location.href })
      return
    }
    
    if (showToast) showToast('Redirecting to secure checkout...')
    try {
      const url = await backend.createCheckoutSession(item.id)
      window.location.href = url
    } catch (err) {
      if (showToast) showToast('Checkout failed: ' + err.message)
    }
  }

  const onCopy = async () => {
    if (isPremium && isLocked) {
      if(showToast) showToast('Premium prompt — purchase to unlock')
      return
    }
    const ok = await copyToClipboard(item.prompt || 'Placeholder prompt content')
    if (ok && showToast) showToast(`Copied “${item.title}”`)
    else if (showToast) showToast('Copy failed. Try again.')
  }
  
  // Generate a hash for the preview hue based on ID (same as card component)
  const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div
        style={{ position: 'relative', width: '90%', maxWidth: '960px', maxHeight: '90vh', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onClick={onClose} aria-label="Close" onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          <CloseIcon />
        </button>

        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
          {/* Left: Video Preview Area */}
          <div style={{ flex: 1, position: 'relative', background: '#000', borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.hoverSrc ? (
              <video src={item.hoverSrc} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, hsla(${hue}, 60%, 25%, 0.4) 0%, transparent 60%), radial-gradient(circle at 70% 70%, hsla(${hue + 40}, 60%, 20%, 0.4) 0%, transparent 60%)`, animation: 'barpulse 4s ease-in-out infinite alternate' }} />
                
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', animation: 'fadeGrid 2s ease-out infinite alternate' }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ width: '48px', height: '48px', color: `hsla(${hue}, 80%, 70%, 0.8)` }}>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Live Component Preview</div>
                </div>
              </>
            )}
            
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '8px' }}>
              {(item.stack || []).map((s) => (
                <span key={s} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '999px', fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Right: Details & Prompt */}
          <div style={{ width: '380px', display: 'flex', flexDirection: 'column', padding: '40px', background: 'rgba(255,255,255,0.02)' }}>
            <h2 id="modal-title" style={{ fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: '12px' }}>{item.title}</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid rgba(59,130,246,0.3)' }}>{item.category}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.section}</span>
            </div>

            {!isLocked && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '12px' }}>Source Prompt</div>}

            <div style={{ flex: 1, minHeight: 0, marginBottom: '24px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', padding: '12px' }}>Decrypting securely...</div>
                ) : isLocked ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ background: 'rgba(10,10,10,0.85)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                       <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Premium Component</div>
                       <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px', maxWidth: '240px' }}>Purchase to unlock the full React source code instantly.</div>
                       <button onClick={onPurchase} style={{ padding: '14px 28px', borderRadius: '12px', background: '#3B82F6', color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2563EB'} onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}>
                         Purchase for ${(item.price || 9.99).toFixed(2)}
                       </button>
                     </div>
                  </div>
                ) : (
                  <pre style={{ margin: 0, padding: 0, height: '100%', overflowY: 'auto', fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>
                    {content || 'No prompt available.'}
                  </pre>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!isLocked && (
                <button onClick={onCopy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '16px', borderRadius: '12px', background: '#3B82F6', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  Copy prompt to clipboard
                </button>
              )}
              
              {!isLocked && (item.stack || []).map((target) => {
                const href = buildDeepLink(target, content)
                if (!href) return null
                return (
                  <a
                    key={target}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#EDEDED', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    Open directly in {target}
                    <ExternalIcon />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
