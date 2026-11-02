const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"

export type GalleryPhoto = {
  src: string
  thumbnailSrc?: string
  originalSrc?: string
  title?: string
  caption?: string
}

export type GalleryAlbum = {
id: string
title: string
folder: string
photos: GalleryPhoto[]
photoCount?: number
}

export type GalleryHighlightPhoto = GalleryPhoto & {
albumId: string
albumTitle: string
}

type CloudinaryAlbum = {
id: string
name: string
folder: string

}

type CloudinaryPhoto = {
  id: string
  thumbnailUrl: string
  mediumUrl: string
  originalUrl: string
  width: number
  height: number
  filename?: string
  createdAt?: string
}

type AlbumsResponse = {
albums: CloudinaryAlbum[]
}

type PhotosResponse = {
photos: CloudinaryPhoto[]
nextCursor: string | null
}

const toTitle = (value: string) =>
value
.replace(/.[^.]+$/, "")
.replace(/[-_]+/g, " ")
.replace(/\s+/g, " ")
.trim()

const CACHE_TTL_MS = 10 * 60 * 1000
const memoryCache = new Map<string, { at: number; data: unknown }>()
const inflight = new Map<string, Promise<unknown>>()

const readCache = <T>(url: string): T | null => {
  const now = Date.now()
  const hit = memoryCache.get(url)

  if (hit && now - hit.at < CACHE_TTL_MS) {
    return hit.data as T
  }

  try {
    const raw = sessionStorage.getItem(`gallery:${url}`)
    if (raw) {
      const stored = JSON.parse(raw) as { at: number; data: T }
      if (now - stored.at < CACHE_TTL_MS) {
        memoryCache.set(url, stored)
        return stored.data
      }
    }
  } catch {
    // sessionStorage unavailable or corrupt: fall through to network
  }

  return null
}

const writeCache = (url: string, data: unknown) => {
  const entry = { at: Date.now(), data }
  memoryCache.set(url, entry)

  try {
    sessionStorage.setItem(`gallery:${url}`, JSON.stringify(entry))
  } catch {
    // storage full or unavailable: memory cache still works
  }
}

const cachedGetJson = async <T>(url: string, errorLabel: string): Promise<T> => {
  const cached = readCache<T>(url)
  if (cached) return cached

  const pending = inflight.get(url) as Promise<T> | undefined
  if (pending) return pending

  const request = (async () => {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`${errorLabel}: ${response.status}`)
    }

    const data = (await response.json()) as T
    writeCache(url, data)
    return data
  })().finally(() => inflight.delete(url))

  inflight.set(url, request)
  return request
}

/**

* Get all albums.
*
* GET /api/cloudinary
  */
  export const getGalleryAlbums =
  async (): Promise<GalleryAlbum[]> => {
  const data = await cachedGetJson<AlbumsResponse>(
    `${API_BASE_URL}/cloudinary`,
    "Failed to load albums",
  )




  return data.albums.map((album) => ({
  id: album.id,
  title: album.name,
  folder: album.folder,
  photos: [],


  }))
  }

/**

* Get photos from one Cloudinary folder.
*
* GET /api/cloudinary/photos?folder=...
  */
  export const getGalleryPhotos = async (
  folder: string,
  nextCursor?: string,
  ): Promise<{
  photos: GalleryPhoto[]
  nextCursor: string | null
  }> => {
  const params = new URLSearchParams()

params.set("folder", folder)

if (nextCursor) {
params.set("next_cursor", nextCursor)
}

const data = await cachedGetJson<PhotosResponse>(
  `${API_BASE_URL}/cloudinary/photos?${params.toString()}`,
  "Failed to load photos",
)

return {
photos: data.photos.map((photo) => ({
  src: photo.mediumUrl,
  thumbnailSrc: photo.thumbnailUrl,
  originalSrc: photo.originalUrl,

  title: photo.filename
    ? toTitle(photo.filename)
    : undefined,
})),


nextCursor: data.nextCursor,


}
}

/**

* Get one complete album.
  */
  export const getGalleryAlbum = async (
  album: GalleryAlbum,
  ): Promise<GalleryAlbum> => {
  const result = await getGalleryPhotos(
  album.folder,
  )

return {
...album,
photos: result.photos,
photoCount: result.photos.length
}
}

export const setAlbumNumber = async (
  album: GalleryAlbum,
): Promise<GalleryAlbum> => {
  const photos = await getGalleryPhotos(album.folder);

  return {
    ...album,
    photoCount: photos.photos.length
  };
};



/**

* Get photos from all albums.
  */
  export const getAllGalleryPhotos =
  async (): Promise<GalleryHighlightPhoto[]> => {
  const albums =
  await getGalleryAlbums()

  const result: GalleryHighlightPhoto[] = []

  for (const album of albums) {
  try {
  const photos =
  await getGalleryPhotos(
  album.folder,
  )

  
   for (const photo of photos.photos) {
     result.push({
       ...photo,
       albumId: album.id,
       albumTitle: album.title,
     })
   }


  } catch (error) {
  console.error(
  `Failed to load photos for ${album.title}:`,
  error,
  )
  }
  }

  return result
  }

/**

* Get random photos for gallery highlights.
  */
  export const getRandomGalleryHighlights =
  async (
  count = 6,
  ): Promise<GalleryHighlightPhoto[]> => {
  const allPhotos =
  await getAllGalleryPhotos()

  if (allPhotos.length <= count) {
  return allPhotos
  }

  const randomized = [...allPhotos]

  for (
  let index = randomized.length - 1;
  index > 0;
  index--
  ) {
  const randomIndex = Math.floor(
  Math.random() * (index + 1),
  )

  ;[
  randomized[index],
  randomized[randomIndex],
  ] = [
  randomized[randomIndex],
  randomized[index],
  ]
  }

  return randomized.slice(0, count)
  }


  