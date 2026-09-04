export type GalleryPhoto = {
  src: string
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

export function normalizeDriveImageUrl(src: string) {
  const trimmed = src.trim()

  const fileMatch = trimmed.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/)
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`
  }

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch) {
    return `https://drive.google.com/thumbnail?id=${folderMatch[1]}&sz=w1000`
  }

  return trimmed
}

export const galleryAlbums: GalleryAlbum[] = buildAlbumsFromAssets()

export const getAllGalleryPhotos = (): GalleryHighlightPhoto[] =>
  galleryAlbums.flatMap((album) =>
    album.photos.map((photo) => ({
      ...photo,
      albumId: album.id,
      albumTitle: album.title,
    })),
  )

export const getRandomGalleryHighlights = (count = 6): GalleryHighlightPhoto[] => {
  const allPhotos = getAllGalleryPhotos()

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
