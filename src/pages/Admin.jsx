import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../hooks/useClipboard.js'
import { backend, backendMode } from '../lib/backend.js'
import { useUser } from '@clerk/clerk-react'

const SECTIONS = ['Hero', 'Landing', 'Pricing', 'CTA', 'Portfolio', 'Agency']
const TIERS = [{ v: 'free', l: 'Free (Copy)' }, { v: 'premium', l: 'Premium (Locked)' }]
const RAILS = [
  { v: 'featured', l: 'Featured picks' },
  { v: 'fresh', l: 'Fresh finds' },
  { v: 'trending', l: 'Trending this week' },
  { v: null, l: 'No rail (filter only)' },
]
const VARIANTS = [
  { v: 'sans', l: 'Sans (default)' },
  { v: 'caps', l: 'ALL CAPS' },
  { v: 'serif', l: 'Serif italic' },
  { v: 'sans-accent', l: 'Sans (blue accent)' },
]
const STACK_OPTIONS = ['Bolt', 'v0', 'Cursor', 'Framer']

// Upload caps — same in both modes now.
// Note: local mode stores media as base64 in localStorage (~5 MB quota per origin).
// Large uploads may fail if the quota fills — Supabase mode has no such limit.
const MAX_IMG_BYTES   = 20 * 1024 * 1024     //  20 MB
const MAX_VIDEO_BYTES = 20 * 1024 * 1024     //  20 MB

function formatMB(bytes) {
  return bytes >= 1024 * 1024 ? `${Math.round(bytes / (1024 * 1024))} MB` : `${Math.round(bytes / 1024)} KB`
}

function nextId(existing) {
  let n = 1
  const nums = existing
    .map((p) => parseInt(p.id.replace(/\D/g, ''), 10))
    .filter((x) => !Number.isNaN(x))
  if (nums.length) n = Math.max(...nums) + 1
  return `cue${String(n).padStart(3, '0')}`
}

function toJsObjectLiteral(p) {
  const stack = JSON.stringify(p.stack)
  const rail = p.rail === null ? 'null' : `'${p.rail}'`
  const optional = (k, v) => (v ? `\n  ${k}: ${JSON.stringify(v)},` : '')
  return `{
  id: '${p.id}',
  title: ${JSON.stringify(p.title)},
  category: ${JSON.stringify(p.category)},
  section: '${p.section}',
  tier: '${p.tier}',
  rail: ${rail},
  brand: ${JSON.stringify(p.brand)},
  variant: '${p.variant}',
  stack: ${stack},${optional('thumbSrc', p.thumbSrc)}${optional('hoverSrc', p.hoverSrc)}
  prompt: \`${p.prompt.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
}`
}

export default function Admin() {
  const { allPrompts, drafts, addDraft, removeDraft, clearDrafts, openItem, showToast } = useApp()
  const { isLoaded, isSignedIn, user } = useUser()
  const fileRef = useRef(null)
  const videoRef = useRef(null)

  const [form, setForm] = useState(() => ({
    id: nextId(allPrompts),
    title: '',
    category: '',
    section: 'Hero',
    tier: 'free',
    rail: 'fresh',
    brand: '',
    variant: 'sans',
    stack: ['Bolt', 'v0'],
    thumbSrc: '',
    hoverSrc: '',
    prompt: '',
  }))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null) // 'img' | 'video' | null
  const [touched, setTouched] = useState({})
  const markTouched = (k) => setTouched((t) => ({ ...t, [k]: true }))

  const isAdmin = isSignedIn && ['akashkumar7653099@gmail.com', 'aloksivastava1025@gmail.com'].includes(user?.primaryEmailAddress?.emailAddress);

  if (!isLoaded) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading...</div>
  
  if (!isAdmin) {
    return (
      <div className="admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '120px' }}>
        <a className="admin-back" href="#/" style={{ alignSelf: 'center', marginBottom: '24px' }}>← Back to library</a>
        <h1 className="admin-title">Access Denied</h1>
        <p className="admin-sub">You do not have permission to view this page. Only authorized administrators can access the dashboard.</p>
      </div>
    )
  }

  const missing = []
  if (!form.title.trim()) missing.push('Title')
  if (!form.category.trim()) missing.push('Category')
  if (!form.brand.trim()) missing.push('Brand')
  if (!form.prompt.trim()) missing.push('Prompt')
  if (form.tier === 'premium' && (!form.price || form.price <= 0)) missing.push('Price')
  const canSubmit = missing.length === 0 && !saving
  const errFor = (k) => {
    if (k === 'price' && form.tier === 'premium') return touched.price && (!form.price || form.price <= 0)
    return touched[k] && typeof form[k] === 'string' && !form[k].trim()
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const toggleStack = (tool) => {
    setForm((f) => ({
      ...f,
      stack: f.stack.includes(tool) ? f.stack.filter((t) => t !== tool) : [...f.stack, tool],
    }))
  }

  const imgCap = MAX_IMG_BYTES
  const videoCap = MAX_VIDEO_BYTES

  const onPickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Only image files are allowed'); return }
    if (file.size > imgCap) {
      showToast(`Image over ${formatMB(imgCap)} — compress or paste a URL`)
      return
    }
    setUploading('img')
    try {
      const { url } = await backend.uploadMedia(file)
      set({ thumbSrc: url })
      showToast('Image uploaded')
    } catch (err) {
      showToast('Upload failed: ' + (err.message || 'unknown'))
    } finally {
      setUploading(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  const clearThumb = () => set({ thumbSrc: '' })

  const onPickVideo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { showToast('Only video files are allowed'); return }
    if (file.size > videoCap) {
      showToast(`Video over ${formatMB(videoCap)} — compress or paste a URL`)
      return
    }
    setUploading('video')
    try {
      const { url } = await backend.uploadMedia(file)
      set({ hoverSrc: url })
      showToast('Video uploaded')
    } catch (err) {
      showToast('Upload failed: ' + (err.message || 'unknown'))
    } finally {
      setUploading(null)
      if (videoRef.current) videoRef.current.value = ''
    }
  }
  const clearVideo = () => set({ hoverSrc: '' })

  const submitWithStatus = async (status) => {
    if (!canSubmit) {
      // reveal which fields are still empty
      setTouched({ title: true, category: true, brand: true, prompt: true })
      if (missing.length) showToast(`Fill required: ${missing.join(', ')}`)
      return
    }
    setSaving(true)
    try {
      await addDraft({ ...form, status })
      showToast(`${status === 'published' ? 'Published' : 'Saved draft'} "${form.title}"`)
      setForm({
        id: nextId([...allPrompts, form]),
        title: '',
        category: '',
        section: form.section,
        tier: form.tier,
        price: form.tier === 'premium' ? form.price : 0,
        rail: form.rail,
        brand: '',
        variant: form.variant,
        stack: form.stack,
        thumbSrc: '',
        hoverSrc: '',
        prompt: '',
      })
      setTouched({})
    } catch (err) {
      showToast('Save failed: ' + (err.message || 'unknown'))
    } finally {
      setSaving(false)
    }
  }

  const onCopyCode = async (p) => {
    const code = toJsObjectLiteral(p)
    const ok = await copyToClipboard(code)
    if (ok) showToast(`Copied code for "${p.title}"`)
  }

  const onExportAll = async () => {
    if (drafts.length === 0) { showToast('No drafts to export yet'); return }
    const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cue-drafts-${Date.now()}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Exported ${drafts.length} draft${drafts.length === 1 ? '' : 's'}`)
  }

  const onEdit = async (p) => {
    try {
      let promptContent = p.prompt
      if (!promptContent) {
        const content = await backend.getPromptContent(p.id)
        promptContent = content || ''
      }
      setForm({ ...p, prompt: promptContent })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      showToast('Failed to load prompt content for editing')
    }
  }

  const onRemove = async (id) => {
    try { await removeDraft(id) } catch (err) { showToast('Delete failed: ' + err.message) }
  }

  const totalCount = allPrompts.length
  const draftsCount = drafts.length
  const seedCount = totalCount - draftsCount
  const isDataUrl = form.thumbSrc?.startsWith('data:')
  const videoIsData = form.hoverSrc?.startsWith('data:')

  const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' };
  const labelStyle = { color: '#fff', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.7 };
  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' };
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' };
  const btnStyle = { padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' };
  const btnPrimaryStyle = { ...btnStyle, background: '#3B82F6', borderColor: '#3B82F6' };
  
  return (
    <div style={{ padding: '90px clamp(20px, 4vw, 56px) 120px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <a href="#/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>← Back to library</a>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 12px 0' }}>Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '15px' }}>
            {backendMode === 'supabase'
              ? <>Backed by Supabase — new prompts publish site-wide instantly. <span style={{ color: '#fff' }}>Signed in as {user?.primaryEmailAddress?.emailAddress}.</span></>
              : <>Local mode (IndexedDB, this browser only). Set <code>VITE_SUPABASE_URL</code> in <code>.env</code> to publish site-wide.</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 24px', textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: 800 }}>{seedCount}</div><div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seed</div></div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 24px', textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: 800 }}>{draftsCount}</div><div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{backendMode === 'supabase' ? 'Live' : 'Drafts'}</div></div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 24px', textAlign: 'center' }}><div style={{ fontSize: '32px', fontWeight: 800 }}>{totalCount}</div><div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div></div>
        </div>
      </header>

      <form onSubmit={(e) => e.preventDefault()} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: 'clamp(24px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Title <span style={{color: '#ef4444'}}>*</span></label>
            <input style={{...inputStyle, borderColor: errFor('title') ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.title} onChange={(e) => set({ title: e.target.value })} onBlur={() => markTouched('title')} placeholder="Aurora hero" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Category / Tag <span style={{color: '#ef4444'}}>*</span></label>
            <input style={{...inputStyle, borderColor: errFor('category') ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.category} onChange={(e) => set({ category: e.target.value })} onBlur={() => markTouched('category')} placeholder="e.g. Hero, Landing, Web3" />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Section Layout</label>
            <select style={inputStyle} value={form.section} onChange={(e) => set({ section: e.target.value })}>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tier</label>
            <select style={inputStyle} value={form.tier} onChange={(e) => set({ tier: e.target.value, price: e.target.value === 'free' ? 0 : form.price })}>
              {TIERS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
        </div>

        {form.tier === 'premium' && (
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Price (USD) <span style={{color: '#ef4444'}}>*</span></label>
              <input type="number" step="0.01" min="0" style={{...inputStyle, borderColor: errFor('price') ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.price || ''} onChange={(e) => set({ price: parseFloat(e.target.value) || 0 })} onBlur={() => markTouched('price')} placeholder="e.g. 9.99" />
            </div>
            <div style={fieldStyle}>
              {/* empty cell to maintain grid */}
            </div>
          </div>
        )}

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Theme Text (Fallback brand) <span style={{color: '#ef4444'}}>*</span></label>
            <input style={{...inputStyle, borderColor: errFor('brand') ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.brand} onChange={(e) => set({ brand: e.target.value })} onBlur={() => markTouched('brand')} placeholder="Aurora" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Text Variant</label>
            <select style={inputStyle} value={form.variant} onChange={(e) => set({ variant: e.target.value })}>
              {VARIANTS.map((v) => <option key={v.v} value={v.v}>{v.l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Video / GIF Preview (plays on hover/click) <span style={{opacity: 0.5, fontWeight: 400, textTransform: 'none'}}>— max {formatMB(videoCap)}</span></label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button type="button" style={btnStyle} onClick={() => videoRef.current?.click()} disabled={uploading === 'video'}>{uploading === 'video' ? 'Uploading…' : 'Upload video / GIF'}</button>
            <input ref={videoRef} type="file" accept="video/*,image/gif" onChange={onPickVideo} style={{ display: 'none' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>or</span>
            <input style={{...inputStyle, flex: 1}} placeholder="paste video/GIF URL (https://…)" value={videoIsData ? '' : form.hoverSrc} onChange={(e) => set({ hoverSrc: e.target.value })} disabled={videoIsData} />
            {form.hoverSrc && <button type="button" style={{...btnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)'}} onClick={clearVideo}>Clear</button>}
          </div>
          {form.hoverSrc && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', flexDirection: 'column', gap: '8px' }}>
              <video src={form.hoverSrc} muted loop autoPlay playsInline style={{ height: '120px', borderRadius: '8px' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{videoIsData ? 'Uploaded (base64)' : 'Hosted URL'} · plays on hover, muted, looping</span>
            </div>
          )}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Source Prompt (paste-ready) <span style={{color: '#ef4444'}}>*</span></label>
          <textarea style={{...inputStyle, minHeight: '300px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", borderColor: errFor('prompt') ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.prompt} onChange={(e) => set({ prompt: e.target.value })} onBlur={() => markTouched('prompt')} placeholder="Design a hero section..." />
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>{form.prompt.length} characters</div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
          <button type="button" onClick={() => submitWithStatus('draft')} style={btnStyle} disabled={saving}>
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button type="button" onClick={() => submitWithStatus('published')} style={btnPrimaryStyle} disabled={saving}>
            {saving ? 'Publishing…' : 'Publish Live'}
          </button>
          {missing.length > 0 && Object.keys(touched).length > 0 && <span style={{ color: '#ef4444', fontSize: '14px' }}>Missing: <strong>{missing.join(', ')}</strong></span>}
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Next id: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px' }}>{form.id}</code></span>
        </div>
      </form>

      <section style={{ marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            {backendMode === 'supabase' ? 'Live prompts' : 'Your drafts'} ({draftsCount})
          </h2>
          {draftsCount > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" style={btnStyle} onClick={onExportAll}>Export JSON</button>
              <button type="button" style={{...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)'}} onClick={() => { if (confirm('Delete all?')) clearDrafts() }}>Clear all</button>
            </div>
          )}
        </div>

        {draftsCount === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px', color: 'rgba(255,255,255,0.5)' }}>No drafts yet. Add your first prompt above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {drafts.map((p) => (
              <article key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{p.title}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', background: p.status === 'published' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.1)', color: p.status === 'published' ? '#93C5FD' : '#fff', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>{p.status === 'published' ? 'LIVE' : 'DRAFT'}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '999px' }}>{p.category}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '999px' }}>{p.tier}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{p.id}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={btnStyle} onClick={() => onEdit(p)}>Edit</button>
                  <button style={{...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)'}} onClick={() => onRemove(p.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

        {backendMode === 'local' && (
          <div style={{ marginTop: '32px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '24px', borderRadius: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.6 }}>
            <strong style={{ color: '#93C5FD' }}>Local mode (IndexedDB):</strong> Drafts and media are saved directly in this browser with a generous quota (20 MB videos work easily). They persist through page reloads but will not be published to other visitors. Click <em style={{ color: '#fff', fontStyle: 'normal', fontWeight: 600 }}>Copy code</em> on a draft and paste it into <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace", color: '#93C5FD' }}>src/data/prompts.js</code>, or set up Supabase to write straight to the live site.
          </div>
        )}
    </div>
  )
}
