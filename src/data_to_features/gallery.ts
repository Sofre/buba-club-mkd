export type GalleryPhoto = {
  src: string
  thumbnailSrc?: string
  title?: string
  caption?: string
}

export type GalleryAlbum = {
  id: string
  title: string
  description: string
  year: number
  photos: GalleryPhoto[]
}

export type GalleryHighlightPhoto = GalleryPhoto & {
  albumId: string
  albumTitle: string
}

type GalleryBlob = {
  url: string
  pathname: string
  thumbnailUrl?: string
}

const albumImageModules = import.meta.glob(
  [
    '../assets/albums/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
    '!../assets/albums/Bubijada, Belgrad 17-19.05.2019/**',
  ],
  { eager: true, as: 'url' },
) as Record<string, string>

const toTitleCase = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toAlbumId = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'album'

const extractYear = (value: string) => {
  const match = value.match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : 0
}

const buildAlbumsFromAssets = (): GalleryAlbum[] => {
  const grouped = new Map<string, { relativePath: string; src: string }[]>()

  for (const [modulePath, src] of Object.entries(albumImageModules)) {
    const relative = modulePath.replace('../assets/albums/', '')
    const segments = relative.split('/')

    if (segments.length < 2) {
      continue
    }

    const albumFolder = segments[0]
    const currentGroup = grouped.get(albumFolder) ?? []
    currentGroup.push({ relativePath: relative, src })
    grouped.set(albumFolder, currentGroup)
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'mk'))
    .map(([albumFolder, files]) => {
      const photos = files
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'mk'))
        .map(({ relativePath, src }) => {
          const fileName = relativePath.split('/').pop() ?? ''
          const baseName = fileName.replace(/\.[^.]+$/, '')

          return {
            src,
            title: toTitleCase(baseName),
          }
        })

      return {
        id: toAlbumId(albumFolder),
        title: albumFolder,
        description: '',
        year: extractYear(albumFolder),
        photos,
      }
    })
    .filter((album) => album.photos.length > 0)
}

export const galleryAlbums: GalleryAlbum[] = buildAlbumsFromAssets()

const titleFromPathname = (pathname: string) => {
  const filename = pathname.split('/').pop() ?? pathname
  return toTitleCase(filename.replace(/\.[^.]+$/, ''))
}

const albumFolderFromPathname = (pathname: string) => {
  const folders = pathname.split('/').filter(Boolean).map((folder) => decodeURIComponent(folder))

  return folders[0]?.toLowerCase() === 'albums' ? folders[1] : folders[0]
}

export const fetchVercelBlobPhotos = async (): Promise<GalleryAlbum[]> => {
  try {
    const response = await fetch('/api/gallery/list', { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Gallery request failed with status ${response.status}`)
    }

    const data = (await response.json()) as { blobs?: GalleryBlob[] }
    const albums = galleryAlbums.map((album) => ({ ...album, photos: [...album.photos] }))

    for (const blob of data.blobs ?? []) {
      const albumFolder = albumFolderFromPathname(blob.pathname)

      if (!albumFolder) {
        continue
      }

      const albumId = toAlbumId(albumFolder)
      let album = albums.find((candidate) => candidate.id === albumId || toAlbumId(candidate.title) === albumId)

      if (!album) {
        album = {
          id: albumId,
          title: albumFolder,
          description: '',
          year: extractYear(albumFolder),
          photos: [],
        }
        albums.push(album)
      }

      if (!album.photos.some((photo) => photo.src === blob.url)) {
        album.photos.push({ src: blob.url, thumbnailSrc: blob.thumbnailUrl, title: titleFromPathname(blob.pathname) })
      }
    }

    return albums
  } catch {
    return galleryAlbums
  }
}

export const getAllGalleryPhotos = async (): Promise<GalleryHighlightPhoto[]> =>
  (await fetchVercelBlobPhotos()).flatMap((album) =>
    album.photos.map((photo) => ({
      ...photo,
      albumId: album.id,
      albumTitle: album.title,
    })),
  )

export const getRandomGalleryHighlights = async (count = 6): Promise<GalleryHighlightPhoto[]> => {
  const allPhotos = await getAllGalleryPhotos()

  if (allPhotos.length <= count) {
    return allPhotos
  }

  const randomized = [...allPhotos]

  for (let index = randomized.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = randomized[index]
    randomized[index] = randomized[randomIndex]
    randomized[randomIndex] = current
  }

  return randomized.slice(0, count)
}
