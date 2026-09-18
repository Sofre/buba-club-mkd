<template>
  <section class="gallery-lab">
    <header class="gallery-lab__header">
      <p class="eyebrow">{{ content.pages.gallery.eyebrow }}</p>
      <h2>{{ content.pages.gallery.title }}</h2>
      <p class="gallery-lab__lead">{{ galleryLead }}</p>
    </header>

    <div class="folder-rail" role="tablist" aria-label="Gallery folders">
      <button
        class="folder-chip"
        :class="{ 'folder-chip--active': selectedAlbumId === null }"
        type="button"
        @click="selectedAlbumId = null"
      >
        {{ highlightsLabel }}
      </button>

      <button
        v-for="album in galleryAlbumsWithUploads"
        :key="album.id"
        class="folder-chip"
        :class="{ 'folder-chip--active': selectedAlbumId === album.id }"
        type="button"
        @click="selectedAlbumId = album.id"
      >
        <span>{{ album.title }}</span>
        <small>{{ album.photos.length }}</small>
      </button>
    </div>

    <section v-if="!selectedAlbum" class="highlights-panel">
      <div v-if="stackedHighlightGroups.length" class="stacked-showcase-rail" aria-label="Featured gallery images">
        <div v-for="(stack, stackIndex) in stackedHighlightGroups" :key="`stack-${stackIndex}`" class="stacked-showcase">
          <span class="stacked-showcase__pin" aria-hidden="true"></span>
          <figure
            v-for="(photo, index) in stack"
            :key="`${photo.albumId}-${photo.src}-${stackIndex}-${index}`"
            class="stacked-showcase__item"
            :style="stackStyle(stackIndex, index)"
          >
            <img :src="photo.thumbnailSrc || photo.src" :alt="photo.title || photo.albumTitle" loading="lazy" />
          </figure>
        </div>
      </div>

      <div v-if="randomHighlights.length" class="highlights-grid" aria-label="Gallery highlights">
        <button
          v-for="photo in randomHighlights"
          :key="`${photo.albumId}-${photo.src}`"
          class="highlight-item"
          type="button"
          @click="openAlbumFromHighlight(photo.albumId)"
        >
          <img :src="photo.thumbnailSrc || photo.src" :alt="photo.title || photo.albumTitle" loading="lazy" />
          <span>{{ photo.albumTitle }}</span>
        </button>
      </div>
    </section>

    <section v-else class="folder-view">
      <div class="folder-view__meta">
        <h3>{{ selectedAlbum.title }}</h3>
        <p>{{ selectedAlbum.description }}</p>

      </div>

      <div class="folder-grid">
        <button
          v-for="photo in visibleAlbumPhotos"
          :key="`${selectedAlbum.id}-${photo.src}`"
          class="folder-photo"
          type="button"
          @click="openViewer(selectedAlbum.photos.indexOf(photo))"
        >
          <img :src="photo.thumbnailSrc || photo.src" :alt="photo.title || selectedAlbum.title" loading="lazy" />
        </button>
      </div>

      <div v-if="hasMoreAlbumPhotos" ref="loadMoreSentinelRef" class="folder-view__load-more">
        <button class="load-more-button" type="button" @click="loadMoreAlbumPhotos">
          {{ currentLanguageCode === 'mkd' ? 'Вчитај повеќе' : 'Load more' }}
        </button>
      </div>
    </section>

    <teleport to="body">
      <div v-if="viewerOpen && selectedAlbum && activePhoto" ref="viewerOverlayRef" class="photo-viewer" @click.self="closeViewer">
        <div ref="viewerCardRef" class="photo-viewer__card">
          <button class="photo-viewer__close" type="button" @click="closeViewer">×</button>
          <button
            class="photo-viewer__nav"
            type="button"
            @click="prevPhoto"
            :aria-label="content.pages.gallery.prev"
            :disabled="viewerIndex === 0"
          >
            ←
          </button>

          <img class="photo-viewer__image" :src="activePhoto.src" :alt="activePhoto.title || selectedAlbum.title" />

          <button
            class="photo-viewer__nav"
            type="button"
            @click="nextPhoto"
            :aria-label="content.pages.gallery.next"
            :disabled="viewerIndex >= selectedAlbum.photos.length - 1"
          >
            →
          </button>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fetchVercelBlobPhotos, getRandomGalleryHighlights } from '../data_to_features/gallery'
import { currentLanguageCode, currentTranslation } from '../data_to_features/translations_state_change'

const content = computed(() => currentTranslation.value)
const selectedAlbumId = ref<string | null>(null)
const galleryAlbumsWithUploads = ref<Awaited<ReturnType<typeof fetchVercelBlobPhotos>>>([])
const randomHighlights = ref<Awaited<ReturnType<typeof getRandomGalleryHighlights>>>([])
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const viewerOverlayRef = ref<HTMLElement | null>(null)
const viewerCardRef = ref<HTMLElement | null>(null)
const loadMoreSentinelRef = ref<HTMLElement | null>(null)
let previousBodyOverflow = ''

const albumBatchSize = 6
const albumVisibleCount = ref(albumBatchSize)
let loadMoreObserver: IntersectionObserver | null = null

const stackedHighlightGroups = computed(() => {
  const groups: typeof randomHighlights.value[] = []

  for (let index = 0; index < randomHighlights.value.length; index += 3) {
    groups.push(randomHighlights.value.slice(index, index + 3))
  }

  return groups.slice(0, 4)
})

const stackStyle = (stackIndex: number, index: number) => {
  const rotations = [
    [-10, 8, -6],
    [-8, 7, -5],
    [-9, 6, -4],
    [-7, 5, -3],
  ]
  const offsets = [
    [0, 18, 34],
    [0, 16, 32],
    [0, 17, 33],
    [0, 15, 30],
  ]

  return {
    transform: `translate(${offsets[stackIndex]?.[index] ?? 0}px, ${index * 10}px) rotate(${rotations[stackIndex]?.[index] ?? 0}deg)`,
    zIndex: `${20 - index}`,
  }
}

const galleryLead = computed(() =>
  currentLanguageCode.value === 'mkd'
    ? 'Избери папка за да ги видиш сите фотографии. Ако нема избрана папка, ќе се прикажат случајни издвоени фотографии.'
    : 'Select a folder to open all photos. If no folder is selected, random highlights are shown.',
)

const highlightsLabel = computed(() => (currentLanguageCode.value === 'mkd' ? 'Издвоени' : 'Highlights'))

onMounted(async () => {
  galleryAlbumsWithUploads.value = await fetchVercelBlobPhotos()
  randomHighlights.value = await getRandomGalleryHighlights(12)
})

const selectedAlbum = computed(() =>
  selectedAlbumId.value ? galleryAlbumsWithUploads.value.find((album) => album.id === selectedAlbumId.value) ?? null : null,
)

const visibleAlbumPhotos = computed(() => selectedAlbum.value?.photos.slice(0, albumVisibleCount.value) ?? [])
const hasMoreAlbumPhotos = computed(() => (selectedAlbum.value?.photos.length ?? 0) > albumVisibleCount.value)

const loadMoreAlbumPhotos = () => {
  albumVisibleCount.value += albumBatchSize
}

watch(selectedAlbum, () => {
  albumVisibleCount.value = albumBatchSize
})

watch(loadMoreSentinelRef, async (sentinel) => {
  loadMoreObserver?.disconnect()
  if (!sentinel || typeof IntersectionObserver === 'undefined') return

  await nextTick()
  loadMoreObserver = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && hasMoreAlbumPhotos.value) loadMoreAlbumPhotos()
  })
  loadMoreObserver.observe(sentinel)
})

const activePhoto = computed(() => {
  if (!selectedAlbum.value) return null
  return selectedAlbum.value.photos[viewerIndex.value] ?? null
})

const openAlbumFromHighlight = (albumId: string) => {
  selectedAlbumId.value = albumId
}

const openViewer = (index: number) => {
  viewerIndex.value = index
  viewerOpen.value = true
}

const closeViewer = () => {
  viewerOpen.value = false
}

const nextPhoto = () => {
  if (!selectedAlbum.value) return
  viewerIndex.value = Math.min(viewerIndex.value + 1, selectedAlbum.value.photos.length - 1)
}

const prevPhoto = () => {
  viewerIndex.value = Math.max(viewerIndex.value - 1, 0)
}

watch(viewerOpen, async (isOpen) => {
  if (typeof document === 'undefined') {
    return
  }

  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    await nextTick()
    viewerOverlayRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
    viewerCardRef.value?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }
  loadMoreObserver?.disconnect()
})

</script>

<style scoped>
.gallery-lab {
  position: relative;
  display: grid;
  gap: 1.2rem;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: rgba(241, 237, 232, 0.97);
  border: 1px solid rgba(23, 26, 29, 0);
  box-shadow: 0 18px 40px rgba(17, 15, 13, 0);
  color: #171a1d;
  overflow: hidden;
}

.gallery-lab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(23, 26, 29, 0.12);
}

.gallery-lab::after {
  content: '';
  position: absolute;
  inset: 12px 12px 12px 12px;
  border: 1px solid rgba(23, 26, 29, 0.08);
  pointer-events: none;
}

.gallery-lab__header,
.folder-rail,
.highlights-panel,
.folder-view,
.photo-viewer__card {
  position: relative;
  z-index: 1;
}

.gallery-lab__header {
  display: grid;
  gap: 0.35rem;
}

.eyebrow {
  color: #045E9B;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}


.gallery-lab__header h2 {
  margin: 0;
  color: #191d20;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
}

.gallery-lab__lead {
  margin: 0;
  color: rgba(23, 26, 29, 0.8);
  line-height: 1.7;
}

.folder-rail {
  display: flex;
  gap: 0.7rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
}

.folder-rail {
  display: flex;
  gap: 0.7rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
}

.folder-chip {
  border: 1px solid rgba(23, 26, 29, 0.14);
  background: rgba(255, 255, 255, 0.2);
  color: #1a1d20;
  padding: 0.54rem 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.68rem;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.folder-chip small {
  display: inline-flex;
  min-width: 1.5rem;
  justify-content: center;
  background: #1a1d20;
  color: #f6f0e6;
  border-radius: 999px;
  font-size: 0.66rem;
  padding: 0.14rem 0.38rem;
}

.folder-chip--active {
  background: #1a1d20;
  border-color: #1a1d20;
  color: #f6f0e6;
}

.highlights-panel {
  display: grid;
  gap: 1rem;
}

.stacked-showcase-rail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.stacked-showcase {
  position: relative;
  height: 270px;
  width: 100%;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(23, 26, 29, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2);
  overflow: hidden;
}

.stacked-showcase__pin {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff3c7 0%, #f3c96b 28%, #c78b1f 60%, #7d4f0d 100%);
  border: 1px solid rgba(73, 43, 8, 0.35);
  box-shadow: 0 2px 4px rgba(30, 18, 10, 0.22);
  z-index: 6;
}

.stacked-showcase__pin::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 14px;
  width: 4px;
  height: 20px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #9b6a16 0%, #5c3710 100%);
  box-shadow: 0 2px 3px rgba(30, 18, 10, 0.2);
}

.stacked-showcase__pin::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 32px;
  width: 10px;
  height: 10px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(38, 24, 14, 0.16);
  filter: blur(2px);
}

.stacked-showcase__item {
  position: absolute;
  top: 36px;
  left: 12px;
  width: min(180px, 40vw);
  aspect-ratio: 4 / 3;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(23, 26, 29, 0.18);
  box-shadow: 0 12px 24px rgba(17, 15, 13, 0.08);
}

.stacked-showcase__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.highlight-item {
  border: 1px solid rgba(23, 26, 29, 0.12);
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(17, 15, 13, 0.06);
}

.highlight-item img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.highlight-item span {
  display: block;
  padding: 0.5rem 0.6rem 0.6rem;
  color: #171a1d;
  font-size: 0.8rem;
  font-weight: 700;
}

.folder-view {
  display: grid;
  gap: 0.9rem;
}

.folder-view__meta h3 {
  margin: 0;
  color: #171a1d;
  font-size: clamp(1.4rem, 3vw, 2rem);
}

.folder-view__meta p {
  margin: 0.35rem 0 0;
  color: rgba(23, 26, 29, 0.8);
  line-height: 1.7;
}

.upload-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.folder-view__load-more {
  display: flex;
  justify-content: center;
  padding-top: 0.4rem;
}

.load-more-button {
  border: 1px solid rgba(23, 26, 29, 0.14);
  background: rgba(255, 255, 255, 0.2);
  color: #1a1d20;
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1rem;
  background: #171a1d;
  color: #f6f0e6;
  border: 1px solid rgba(23, 26, 29, 0.12);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.upload-button input {
  display: none;
}

.upload-error {
  color: #8f1f1f;
  font-size: 0.8rem;
  font-weight: 700;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.folder-photo {
  border: 1px solid rgba(23, 26, 29, 0.12);
  overflow: hidden;
  padding: 0;
  background: rgba(255, 255, 255, 0.18);
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(17, 15, 13, 0.05);
}

.folder-photo img {
  width: 100%;
  height: 175px;
  object-fit: cover;
  display: block;
}

.photo-viewer {
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 14, 0.82);
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vh, 2rem);
  z-index: 3000;
  overflow-y: auto;
}

.photo-viewer__card {
  width: min(100%, 1020px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.7rem;
  align-items: center;
  position: relative;
  margin: auto 0;
}

.photo-viewer__close {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(26, 29, 32, 0.22);
  border-radius: 999px;
  background: rgba(240, 200, 112, 0.96);
  color: #171a1d;
  cursor: pointer;
  font-size: 1.15rem;
  box-shadow: 0 10px 22px rgba(24, 26, 29, 0.24);
}

.photo-viewer__image {
  width: 100%;
  max-height: 80vh;
  border: 4px solid #1a1d20;
  object-fit: contain;
  background: #111213;
}

.photo-viewer__nav {
  width: 52px;
  height: 52px;
  border: 1px solid rgba(26, 29, 32, 0.18);
  border-radius: 999px;
  background: rgba(245, 240, 233, 0.96);
  color: #171a1d;
  cursor: pointer;
  font-size: 1.1rem;
  box-shadow: 0 10px 20px rgba(24, 26, 29, 0.18);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.photo-viewer__nav:hover:not(:disabled),
.photo-viewer__close:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(24, 26, 29, 0.22);
}

.photo-viewer__nav:active:not(:disabled),
.photo-viewer__close:active {
  transform: translateY(0);
}

.photo-viewer__nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .stacked-showcase-rail {
    grid-template-columns: 1fr 1fr;
  }

  .stacked-showcase {
    height: 240px;
  }

  .stacked-showcase__item {
    width: min(170px, 44vw);
  }

  .photo-viewer__card {
    grid-template-columns: 1fr;
  }

  .photo-viewer__nav {
    width: 100%;
    height: 48px;
  }

  .photo-viewer__close {
    top: -14px;
    right: -14px;
  }
}
</style>
