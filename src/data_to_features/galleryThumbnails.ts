const databaseName = 'buba-club-gallery'
const storeName = 'thumbnails'
const memoryCache = new Map<string, string>()

const openThumbnailDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const readCachedThumbnail = async (source: string): Promise<string | undefined> => {
  const memoryThumbnail = memoryCache.get(source)
  if (memoryThumbnail) return memoryThumbnail

  try {
    const database = await openThumbnailDatabase()
    const thumbnail = await new Promise<string | undefined>((resolve, reject) => {
      const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(source)
      request.onsuccess = () => resolve(request.result as string | undefined)
      request.onerror = () => reject(request.error)
    })
    database.close()
    if (thumbnail) memoryCache.set(source, thumbnail)
    return thumbnail
  } catch {
    return undefined
  }
}

const writeCachedThumbnail = async (source: string, thumbnail: string) => {
  memoryCache.set(source, thumbnail)

  try {
    const database = await openThumbnailDatabase()
    await new Promise<void>((resolve, reject) => {
      const request = database.transaction(storeName, 'readwrite').objectStore(storeName).put(thumbnail, source)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    database.close()
  } catch {
    // The in-memory cache still works when IndexedDB is unavailable.
  }
}

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Unable to load gallery image: ${source}`))
    image.src = source
  })

export const getGalleryThumbnail = async (source: string, maxSize = 640): Promise<string> => {
  if (typeof window === 'undefined') return source

  const cachedThumbnail = await readCachedThumbnail(source)
  if (cachedThumbnail) return cachedThumbnail

  try {
    const image = await loadImage(source)
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)

    const thumbnail = canvas.toDataURL('image/webp', 0.72)
    await writeCachedThumbnail(source, thumbnail)
    return thumbnail
  } catch {
    return source
  }
}
