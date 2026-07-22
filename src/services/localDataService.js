const DB_NAME = 'vein-brown-local'
const STORE_NAME = 'records'
const DB_VERSION = 1

const openDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION)
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'key' })
    }
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const transaction = async (mode, operation) => {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = operation(tx.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => reject(tx.error)
  })
}

const encode = (value) => new TextEncoder().encode(JSON.stringify(value))
const decode = (value) => JSON.parse(new TextDecoder().decode(value))

// CompressionStream is supported by current Chromium, Firefox, and Safari.
// A plain JSON fallback keeps the app usable in older browsers.
const compress = async (value) => {
  if (!('CompressionStream' in window)) return { compressed: false, data: encode(value) }
  const stream = new Blob([encode(value)]).stream().pipeThrough(new CompressionStream('gzip'))
  return { compressed: true, data: await new Response(stream).arrayBuffer() }
}

const decompress = async (record) => {
  if (!record.compressed || !('DecompressionStream' in window)) return decode(record.data)
  const stream = new Blob([record.data]).stream().pipeThrough(new DecompressionStream('gzip'))
  return decode(await new Response(stream).arrayBuffer())
}

const keyFor = (uid, name) => `${uid}:${name}`

export const readLocalData = async (uid, name, fallback = null) => {
  if (!uid) return fallback
  const record = await transaction('readonly', (store) => store.get(keyFor(uid, name)))
  return record ? decompress(record) : fallback
}

export const writeLocalData = async (uid, name, value) => {
  if (!uid) return
  const packed = await compress(value)
  await transaction('readwrite', (store) => store.put({ key: keyFor(uid, name), ...packed, updatedAt: Date.now() }))
}

export const removeLocalData = async (uid, name) => {
  if (uid) await transaction('readwrite', (store) => store.delete(keyFor(uid, name)))
}

export const clearUserLocalData = async (uid) => {
  if (!uid) return
  const db = await openDatabase()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.openCursor()
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return
      if (cursor.key.startsWith(`${uid}:`)) cursor.delete()
      cursor.continue()
    }
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export const exportUserLocalData = async (uid) => {
  if (!uid) return {}
  const db = await openDatabase()
  const rawRecords = []
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).openCursor()
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return
      if (String(cursor.key).startsWith(`${uid}:`)) rawRecords.push([String(cursor.key).slice(uid.length + 1), cursor.value])
      cursor.continue()
    }
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  const result = Object.fromEntries(await Promise.all(rawRecords.map(async ([name, record]) => [name, await decompress(record)])))
  return { version: 1, exportedAt: new Date().toISOString(), data: result }
}

export const importUserLocalData = async (uid, backup) => {
  if (!uid || !backup?.data || typeof backup.data !== 'object') throw new Error('Invalid backup file.')
  await Promise.all(Object.entries(backup.data).map(async ([name, value]) => {
    const existing = await readLocalData(uid, name, null)
    if (Array.isArray(value) && Array.isArray(existing)) {
      const merged = [...existing, ...value].reduce((items, item) => items.some((saved) => saved.id && saved.id === item.id) ? items : [...items, item], [])
      return writeLocalData(uid, name, merged)
    }
    if (name === 'daily-records' && existing && typeof existing === 'object') return writeLocalData(uid, name, { ...existing, ...value })
    return writeLocalData(uid, name, value)
  }))
}
