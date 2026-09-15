import type { GalleryPhoto } from './gallery'

const STORAGE_KEY = 'bubaclubmk.gallery.uploads'

export function readUploadedGalleryPhotos(): Record<string, GalleryPhoto[]> {
  if (typeof localStorage === 'undefined') {
    return {}
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return {}
    }

    const parsed = JSON.parse(rawValue) as Record<string, GalleryPhoto[]>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveUploadedGalleryPhotos(uploadedPhotos: Record<string, GalleryPhoto[]>) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedPhotos))
}

export function addUploadedGalleryPhoto(albumId: string, photo: GalleryPhoto) {
  const allUploads = readUploadedGalleryPhotos()
  const albumPhotos = Array.isArray(allUploads[albumId]) ? allUploads[albumId] : []

  const nextValue = {
    ...allUploads,
    [albumId]: [...albumPhotos, photo],
  }

  saveUploadedGalleryPhotos(nextValue)
  return photo
}

export async function uploadGalleryPhoto(file: File): Promise<GalleryPhoto> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.')
  }

  const response = await fetch(
    `/api/gallery/upload?filename=${encodeURIComponent(file.name)}`,
    {
      method: 'POST',
      body: file,
    },
  )

  const data = (await response.json().catch(() => ({ error: 'Unable to upload image.' }))) as {
    url?: string
    pathname?: string
    error?: string
  }

  if (!response.ok || (!data.url && !data.pathname)) {
    throw new Error(data.error ?? 'Unable to upload image.')
  }

  const fileName = file.name.replace(/\.[^.]+$/, '') || 'uploaded-photo'

  return {
    src: data.url ?? data.pathname ?? '',
    title: fileName,
  }
}
