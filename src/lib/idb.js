/**
 * Minimal IndexedDB wrapper for Cue drafts.
 * localStorage is limited to ~5 MB per origin; IndexedDB gives us
 * ~50% of available disk (hundreds of MB minimum) — enough for
 * 20 MB video previews as base64 data URLs.
 */

const DB_NAME = 'cue-store'
const STORE = 'drafts'
const VERSION = 1

let openPromise = null

function openDb() {
  if (openPromise) return openPromise
  openPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available in this browser'))
      return
    }
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'))
  })
  return openPromise
}

function runTx(mode, fn) {
  return openDb().then(
    (db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const store = tx.objectStore(STORE)
      let result
      const attempt = fn(store)
      if (attempt && typeof attempt.then === 'function') {
        attempt.then((r) => { result = r }, reject)
      } else {
        result = attempt
      }
      tx.oncomplete = () => resolve(result)
      tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'))
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'))
    })
  )
}

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbGetAll() {
  return runTx('readonly', async (store) => {
    return await requestToPromise(store.getAll())
  })
}
export async function idbPut(item) {
  return runTx('readwrite', async (store) => {
    await requestToPromise(store.put(item))
    return item
  })
}
export async function idbDelete(id) {
  return runTx('readwrite', async (store) => {
    await requestToPromise(store.delete(id))
  })
}
export async function idbClear() {
  return runTx('readwrite', async (store) => {
    await requestToPromise(store.clear())
  })
}
