import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../hooks/useClipboard.js'
import { backend, backendMode } from '../lib/backend.js'

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

function AdminLogin({ showToast, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await backend.signIn(email, password)
      showToast('Signed in')
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.message || 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin admin-login">
      <a className="admin-back" href="#/">← Back to library</a>
      <h1 className="admin-title">Admin sign in</h1>
      <p className="admin-sub">This library is backed by Supabase. Sign in with your admin account to add prompts.</p>
      <form className="admin-form" onSubmit={submit} style={{ maxWidth: 420 }}>
        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Admin() {
  const { allPrompts, drafts, addDraft, removeDraft, clearDrafts, openItem, showToast, user } = useApp()
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

  const needsAuth = backend.requiresAuth && !user
  if (needsAuth) {
    return <AdminLogin showToast={showToast} />
  }

  const missing = []
  if (!form.title.trim()) missing.push('Title')
  if (!form.category.trim()) missing.push('Category')
  if (!form.brand.trim()) missing.push('Brand')
  if (!form.prompt.trim()) missing.push('Prompt')
  const canSubmit = missing.length === 0 && !saving
  const errFor = (k) => touched[k] && !form[k]?.trim()

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

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) {
      // reveal which fields are still empty
      setTouched({ title: true, category: true, brand: true, prompt: true })
      if (missing.length) showToast(`Fill required: ${missing.join(', ')}`)
      return
    }
    setSaving(true)
    try {
      await addDraft({ ...form })
      showToast(`Added "${form.title}"`)
      setForm({
        id: nextId([...allPrompts, form]),
        title: '',
        category: '',
        section: form.section,
        tier: form.tier,
        rail: form.rail,
        brand: '',
        variant: form.variant,
        stack: form.stack,
        thumbSrc: '',
        hoverSrc: '',
        prompt: '',
      })
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

  const onRemove = async (id) => {
    try { await removeDraft(id) } catch (err) { showToast('Delete failed: ' + err.message) }
  }

  const totalCount = allPrompts.length
  const draftsCount = drafts.length
  const seedCount = totalCount - draftsCount
  const isDataUrl = form.thumbSrc?.startsWith('data:')
  const videoIsData = form.hoverSrc?.startsWith('data:')

  return (
    <div className="admin">
      <header className="admin-head">
        <div>
          <a className="admin-back" href="#/">← Back to library</a>
          <h1 className="admin-title">Admin — Cue library</h1>
          <p className="admin-sub">
            {backendMode === 'supabase'
              ? <>Backed by Supabase — new prompts publish site-wide instantly. <span className="admin-user">Signed in as {user?.email}. <button className="admin-signout" onClick={() => backend.signOut()}>Sign out</button></span></>
              : <>Local mode (IndexedDB, this browser only). Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to publish site-wide.</>}
          </p>
        </div>
        <div className="admin-stats">
          <div className="stat"><div className="stat-n">{seedCount}</div><div className="stat-l">Seed</div></div>
          <div className="stat"><div className="stat-n">{draftsCount}</div><div className="stat-l">{backendMode === 'supabase' ? 'Live' : 'Drafts'}</div></div>
          <div className="stat"><div className="stat-n">{totalCount}</div><div className="stat-l">Total</div></div>
        </div>
      </header>

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Title <span className="req">*</span></label>
            <input
              className={`form-input${errFor('title') ? ' form-input-error' : ''}`}
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              onBlur={() => markTouched('title')}
              placeholder="Aurora hero"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Category (subtitle) <span className="req">*</span></label>
            <input
              className={`form-input${errFor('category') ? ' form-input-error' : ''}`}
              value={form.category}
              onChange={(e) => set({ category: e.target.value })}
              onBlur={() => markTouched('category')}
              placeholder="Hero section"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Section</label>
            <select className="form-input" value={form.section} onChange={(e) => set({ section: e.target.value })}>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Tier</label>
            <select className="form-input" value={form.tier} onChange={(e) => set({ tier: e.target.value })}>
              {TIERS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Rail</label>
            <select className="form-input" value={form.rail === null ? 'null' : form.rail} onChange={(e) => set({ rail: e.target.value === 'null' ? null : e.target.value })}>
              {RAILS.map((r) => <option key={String(r.v)} value={r.v === null ? 'null' : r.v}>{r.l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Brand (fallback wordmark) <span className="req">*</span></label>
            <input
              className={`form-input${errFor('brand') ? ' form-input-error' : ''}`}
              value={form.brand}
              onChange={(e) => set({ brand: e.target.value })}
              onBlur={() => markTouched('brand')}
              placeholder="Aurora"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Thumb variant</label>
            <select className="form-input" value={form.variant} onChange={(e) => set({ variant: e.target.value })}>
              {VARIANTS.map((v) => <option key={v.v} value={v.v}>{v.l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">
            Thumbnail image (optional) <span className="form-cap">· max {formatMB(imgCap)}</span>
          </label>
          <div className="upload-row">
            <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading === 'img'}>
              {uploading === 'img' ? 'Uploading…' : 'Upload image'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: 'none' }} />
            <span className="upload-or">or</span>
            <input
              className="form-input upload-url"
              placeholder="paste image URL (https://…)"
              value={isDataUrl ? '' : form.thumbSrc}
              onChange={(e) => set({ thumbSrc: e.target.value })}
              disabled={isDataUrl}
            />
            {form.thumbSrc && (
              <button type="button" className="btn-ghost btn-danger btn-small" onClick={clearThumb}>Clear</button>
            )}
          </div>
          {form.thumbSrc && (
            <div className="upload-preview">
              <img src={form.thumbSrc} alt="thumbnail preview" />
              <span className="upload-hint">
                {isDataUrl ? 'Uploaded (base64, ~' + Math.round(form.thumbSrc.length / 1024) + ' KB)' : 'Hosted URL'}
              </span>
            </div>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">
            Hover video (optional) <span className="form-cap">· max {formatMB(videoCap)}</span>
          </label>
          <div className="upload-row">
            <button type="button" className="btn-ghost" onClick={() => videoRef.current?.click()} disabled={uploading === 'video'}>
              {uploading === 'video' ? 'Uploading…' : 'Upload video'}
            </button>
            <input ref={videoRef} type="file" accept="video/*" onChange={onPickVideo} style={{ display: 'none' }} />
            <span className="upload-or">or</span>
            <input
              className="form-input upload-url"
              placeholder="paste video URL (https://…/preview.mp4)"
              value={videoIsData ? '' : form.hoverSrc}
              onChange={(e) => set({ hoverSrc: e.target.value })}
              disabled={videoIsData}
            />
            {form.hoverSrc && (
              <button type="button" className="btn-ghost btn-danger btn-small" onClick={clearVideo}>Clear</button>
            )}
          </div>
          {form.hoverSrc && (
            <div className="upload-preview">
              <video src={form.hoverSrc} muted loop autoPlay playsInline />
              <span className="upload-hint">
                {videoIsData ? 'Uploaded (base64)' : 'Hosted URL'} · plays on hover, muted, looping
              </span>
            </div>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Works with</label>
          <div className="stack-toggles">
            {STACK_OPTIONS.map((tool) => {
              const on = form.stack.includes(tool)
              return (
                <button key={tool} type="button" className={`stack-toggle${on ? ' stack-toggle-on' : ''}`} onClick={() => toggleStack(tool)}>{tool}</button>
              )
            })}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Prompt (paste-ready) <span className="req">*</span></label>
          <textarea
            className={`form-textarea${errFor('prompt') ? ' form-input-error' : ''}`}
            value={form.prompt}
            onChange={(e) => set({ prompt: e.target.value })}
            onBlur={() => markTouched('prompt')}
            placeholder={`Design a hero section for a dark-theme landing page.

Layout
- Full viewport width. 96px top padding.

Palette
- Background #0A0A0A
...`}
            rows={12}
          />
          <div className="form-hint">{form.prompt.length} characters</div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {saving ? 'Saving…' : (backendMode === 'supabase' ? 'Publish prompt' : 'Save prompt')}
          </button>
          {missing.length > 0 && (
            <span className="form-missing">Missing: <strong>{missing.join(', ')}</strong></span>
          )}
          <span className="form-id">Next id: <code>{form.id}</code></span>
        </div>
      </form>

      <section className="admin-drafts">
        <div className="drafts-head">
          <h2 className="drafts-title">
            {backendMode === 'supabase' ? 'Live prompts' : 'Your drafts'} ({draftsCount})
          </h2>
          {draftsCount > 0 && (
            <div className="drafts-actions">
              <button type="button" className="btn-ghost" onClick={onExportAll}>Export as JSON</button>
              <button type="button" className="btn-ghost btn-danger" onClick={() => {
                if (confirm('Delete all ' + (backendMode === 'supabase' ? 'live prompts?' : 'drafts?'))) clearDrafts()
              }}>Clear all</button>
            </div>
          )}
        </div>

        {draftsCount === 0 ? (
          <div className="drafts-empty">No {backendMode === 'supabase' ? 'live prompts' : 'drafts'} yet. Add your first prompt above.</div>
        ) : (
          <div className="drafts-list">
            {drafts.map((p) => (
              <article key={p.id} className="draft-row">
                {p.thumbSrc && <img className="draft-thumb" src={p.thumbSrc} alt="" />}
                <div className="draft-main">
                  <div className="draft-title">{p.title}</div>
                  <div className="draft-meta">
                    <span className="draft-tag">{p.section}</span>
                    <span className="draft-tag">{p.tier}</span>
                    {p.rail && <span className="draft-tag draft-tag-rail">{p.rail}</span>}
                    <span className="draft-id">{p.id}</span>
                  </div>
                </div>
                <div className="draft-actions">
                  <button className="btn-ghost btn-small" onClick={() => openItem(p)}>Preview</button>
                  <button className="btn-ghost btn-small" onClick={() => onCopyCode(p)}>Copy code</button>
                  <button className="btn-ghost btn-small btn-danger" onClick={() => onRemove(p.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {backendMode === 'local' && (
          <div className="admin-tip">
            <strong>Local mode (IndexedDB):</strong> drafts + media are saved in this browser (much bigger quota than localStorage — 20 MB videos work). They stay through page reload but never publish to other visitors. Click <em>Copy code</em> on a draft and paste into <code>src/data/prompts.js</code>, or set up Supabase (see <code>README.md</code>) to write straight to the live site from this form.
          </div>
        )}
      </section>
    </div>
  )
}
