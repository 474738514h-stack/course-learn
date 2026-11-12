const DB_NAME = 'coursemind-upload-media'
const STORE = 'files'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
  })
}

export async function saveUploadMedia(
  courseId: string,
  file: File
): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(
      { blob: file, mimeType: file.type || 'application/octet-stream', name: file.name },
      courseId
    )
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function loadUploadMedia(
  courseId: string
): Promise<{ url: string; mimeType: string; fileName: string } | null> {
  const db = await openDb()
  const record = await new Promise<
    { blob: Blob; mimeType: string; name: string } | undefined
  >((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(courseId)
    req.onsuccess = () => resolve(req.result as typeof record)
    req.onerror = () => reject(req.error)
  })
  db.close()
  if (!record?.blob) return null
  return {
    url: URL.createObjectURL(record.blob),
    mimeType: record.mimeType,
    fileName: record.name,
  }
}

export async function deleteUploadMedia(courseId: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(courseId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}
