import { supabase, isSupabaseConfigured } from './supabase.js'
import { idbGetAll, idbPut, idbDelete, idbClear } from './idb.js'

/* ============================================================
   BACKEND ADAPTER
   ------------------------------------------------------------
   Two modes:
   - 'local'    — IndexedDB. Default. Works with zero config.
                  Stores drafts + base64 media locally (~hundreds of MB).
   - 'supabase' — real DB + Storage + Auth. Turns on when
                  VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
                  are set. See supabase-schema.sql.
   ============================================================ */

const OLD_LOCAL_STORAGE_KEY = 'cue-drafts-v1'

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// One-time migration: move any drafts saved under the old
// localStorage key into IndexedDB, then clear the key.
async function migrateLegacyDrafts() {
  try {
    const raw = localStorage.getItem(OLD_LOCAL_STORAGE_KEY)
    if (!raw) return
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || arr.length === 0) {
      localStorage.removeItem(OLD_LOCAL_STORAGE_KEY)
      return
    }
    for (const item of arr) {
      try { await idbPut(item) } catch { /* ignore individual failures */ }
    }
    localStorage.removeItem(OLD_LOCAL_STORAGE_KEY)
  } catch { /* ignore */ }
}

let migrated = false
async function ensureMigrated() {
  if (migrated) return
  migrated = true
  await migrateLegacyDrafts()
}

const localAdapter = {
  mode: 'local',
  requiresAuth: false,
  async list() {
    await ensureMigrated()
    try { return await idbGetAll() }
    catch (err) {
      // Fall back to empty and surface a helpful error later on writes.
      console.warn('IndexedDB read failed:', err)
      return []
    }
  },
  async create(item) {
    await ensureMigrated()
    try {
      await idbPut(item)
      return item
    } catch (err) {
      throw new Error(
        `Could not save to IndexedDB: ${err?.message || 'unknown error'}. ` +
        `If this keeps happening, try clearing site data or set up Supabase.`
      )
    }
  },
  async remove(id) {
    await idbDelete(id)
  },
  async clear() {
    await idbClear()
  },
  async uploadMedia(file) {
    const url = await readFileAsDataURL(file)
    return { url, kind: file.type.startsWith('video/') ? 'video' : 'image' }
  },
  async signIn() { return { user: { email: 'local' } } },
  async signOut() {},
  async getUser() { return { email: 'local' } },
  onAuthChange(cb) { cb({ email: 'local' }); return () => {} },
}

/* ---------- Supabase ---------- */

function toJs(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    section: row.section,
    tier: row.tier,
    rail: row.rail,
    brand: row.brand,
    variant: row.variant,
    stack: row.stack,
    thumbSrc: row.thumb_src || undefined,
    hoverSrc: row.hover_src || undefined,
    prompt: row.prompt,
  }
}
function toDb(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    section: item.section,
    tier: item.tier,
    rail: item.rail,
    brand: item.brand,
    variant: item.variant,
    stack: item.stack,
    thumb_src: item.thumbSrc || null,
    hover_src: item.hoverSrc || null,
    prompt: item.prompt,
  }
}

const supabaseAdapter = supabase
  ? {
      mode: 'supabase',
      requiresAuth: true,
      async list() {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return (data || []).map(toJs)
      },
      async create(item) {
        const { data, error } = await supabase
          .from('prompts')
          .insert(toDb(item))
          .select()
          .single()
        if (error) throw error
        return toJs(data)
      },
      async remove(id) {
        const { error } = await supabase.from('prompts').delete().eq('id', id)
        if (error) throw error
      },
      async clear() {
        const { error } = await supabase.from('prompts').delete().neq('id', '')
        if (error) throw error
      },
      async uploadMedia(file) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error } = await supabase.storage
          .from('cue-media')
          .upload(path, file, { contentType: file.type, cacheControl: '31536000' })
        if (error) throw error
        const { data } = supabase.storage.from('cue-media').getPublicUrl(path)
        return { url: data.publicUrl, kind: file.type.startsWith('video/') ? 'video' : 'image' }
      },
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return { user: data.user }
      },
      async signOut() { await supabase.auth.signOut() },
      async getUser() {
        const { data } = await supabase.auth.getUser()
        return data.user || null
      },
      onAuthChange(cb) {
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          cb(session?.user || null)
        })
        return () => sub.subscription.unsubscribe()
      },
    }
  : null

export const backend = supabaseAdapter || localAdapter
export const backendMode = backend.mode
export { isSupabaseConfigured }
