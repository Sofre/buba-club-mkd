```vue
<template>
  <section class="gallery-lab">
    <header class="gallery-lab__header">
      <p class="eyebrow">{{ content.pages.gallery.eyebrow }}</p>

      <h2>{{ content.pages.gallery.title }}</h2>

      <p class="gallery-lab__lead">
        {{ galleryLead }}
      </p>
    </header>

    <!-- ALBUMS -->
    <div
      class="folder-rail"
      role="tablist"
      aria-label="Gallery folders"
    >
      <button
        class="folder-chip"
        :class="{
          'folder-chip--active': selectedAlbumId === null,
        }"
        type="button"
        @click="selectAlbum(null)"
      >
        {{ highlightsLabel }}
      </button>

      <button
        v-for="album in galleryAlbums"
        :key="album.id"
        class="folder-chip"
        :class="{
          'folder-chip--active':
            selectedAlbumId === album.id,
        }"
        type="button"
        @click="selectAlbum(album.id)"
      >
        <span>{{ album.title }}</span>
      </button>
    </div>

    <!-- HIGHLIGHTS -->
    <section
      v-if="!selectedAlbum"
      class="highlights-panel"
    >
      <PhotoHighlights
        v-if="randomHighlights.length"
        :photos="randomHighlights"
        :close-label="currentLanguageCode === 'mkd' ? 'Затвори' : 'Close'"
        :prev-label="currentLanguageCode === 'mkd' ? 'Претходна' : 'Previous photo'"
        :next-label="currentLanguageCode === 'mkd' ? 'Следна' : 'Next photo'"
      />

      <p
        v-if="
          !loadingAlbums &&
          !randomHighlights.length
        "
      >
        {{
          currentLanguageCode === 'mkd'
            ? 'Нема достапни фотографии.'
            : 'No photos available.'
        }}
      </p>
    </section>

    <!-- ALBUM -->
    <section
      v-else
      class="folder-view"
    >
      <div class="folder-view__meta">
        <h3>
          {{ selectedAlbum.title }}
        </h3>
      </div>

      <div
        v-if="loadingPhotos"
        class="folder-view__loading"
      >
        {{
          currentLanguageCode === 'mkd'
            ? 'Се вчитуваат фотографии...'
            : 'Loading photos...'
        }}
      </div>

      <div
        v-else-if="
          !visibleAlbumPhotos.length
        "
        class="folder-view__empty"
      >
        {{
          currentLanguageCode === 'mkd'
            ? 'Нема фотографии во овој албум.'
            : 'No photos in this album.'
        }}
      </div>

      <div
        v-else
        class="folder-grid"
      >
        <button
          v-for="(
            photo, index
          ) in visibleAlbumPhotos"
          :key="`${selectedAlbum.id}-${photo.src}`"
          class="folder-photo"
          type="button"
          @click="openViewer(index)"
        >
          <img
            :src="
              photo.thumbnailSrc ||
              photo.src
            "
            :alt="
              photo.title ||
              selectedAlbum.title
            "
            loading="lazy"
          />
        </button>
      </div>

      <div
        v-if="hasMoreAlbumPhotos"
        ref="loadMoreSentinelRef"
        class="folder-view__load-more"
      >
        <button
          class="load-more-button"
          type="button"
          :disabled="loadingMore"
          @click="loadMoreAlbumPhotos"
        >
          {{
            loadingMore
              ? currentLanguageCode ===
                'mkd'
                ? 'Се вчитува...'
                : 'Loading...'
              : currentLanguageCode ===
                'mkd'
              ? 'Вчитај повеќе'
              : 'Load more'
          }}
        </button>
      </div>
    </section>

    <!-- PHOTO VIEWER -->
    <teleport to="body">
      <div
        v-if="
          viewerOpen &&
          selectedAlbum &&
          activePhoto
        "
        ref="viewerOverlayRef"
        class="photo-viewer"
        @click.self="closeViewer"
      >
        <div
          ref="viewerCardRef"
          class="photo-viewer__card"
        >
          <button
            class="photo-viewer__close"
            type="button"
            aria-label="Close"
            @click="closeViewer"
          >
            ×
          </button>

          <button
            class="photo-viewer__nav"
            type="button"
            @click="prevPhoto"
            :aria-label="
              content.pages.gallery.prev
            "
            :disabled="viewerIndex === 0"
          >
            ←
          </button>

          <img
            class="photo-viewer__image"
            :src="activePhoto.src"
            :alt="
              activePhoto.title ||
              selectedAlbum.title
            "
          />

          <button
            class="photo-viewer__nav"
            type="button"
            @click="nextPhoto"
            :aria-label="
              content.pages.gallery.next
            "
            :disabled="
              viewerIndex >=
              selectedAlbumPhotos.length - 1
            "
          >
            →
          </button>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  getGalleryAlbums,
  getGalleryPhotos,
  
  type GalleryAlbum,
  type GalleryPhoto,
  type GalleryHighlightPhoto,
} from '../services_and_configuratables/gallery'

import {
  currentLanguageCode,
  currentTranslation,
} from '../services_and_configuratables/translations_state_change'

import PhotoHighlights from '../components/PhotoHighlights.vue'


const logPhotoCount = (album: GalleryAlbum) => {
  console.log(album.photos.length);
  return album.photos.length;
};

const content = computed(
  () => currentTranslation.value,
)

/* --------------------------------
   STATE
-------------------------------- */

const selectedAlbumId =
  ref<string | null>(null)

const galleryAlbums =
  ref<GalleryAlbum[]>([])

const selectedAlbumPhotos =
  ref<GalleryPhoto[]>([])

const albumNextCursor =
  ref<string | null>(null)

const loadingAlbums =
  ref(false)

const loadingPhotos =
  ref(false)

const loadingMore =
  ref(false)

const randomHighlights =
  ref<GalleryHighlightPhoto[]>([])

const viewerOpen =
  ref(false)

const viewerIndex =
  ref(0)

const viewerOverlayRef =
  ref<HTMLElement | null>(null)

const viewerCardRef =
  ref<HTMLElement | null>(null)

const loadMoreSentinelRef =
  ref<HTMLElement | null>(null)

let previousBodyOverflow = ''

let loadMoreObserver:
  | IntersectionObserver
  | null = null

/* --------------------------------
   COMPUTED
-------------------------------- */

const selectedAlbum = computed(
  () =>
    selectedAlbumId.value
      ? galleryAlbums.value.find(
          (album) =>
            album.id ===
            selectedAlbumId.value,
        ) ?? null
      : null,
)

const visibleAlbumPhotos =
  computed(
    () =>
      selectedAlbumPhotos.value,
  )

const hasMoreAlbumPhotos =
  computed(
    () =>
      Boolean(
        albumNextCursor.value,
      ),
  )

const activePhoto = computed(
  () =>
    selectedAlbumPhotos.value[
      viewerIndex.value
    ] ?? null,
)

const galleryLead = computed(() =>
  currentLanguageCode.value ===
  'mkd'
    ? 'Избери папка за да ги видиш сите фотографии. Ако нема избрана папка, ќе се прикажат издвоени фотографии.'
    : 'Select a folder to open all photos. If no folder is selected, featured photos are shown.',
)

const highlightsLabel = computed(
  () =>
    currentLanguageCode.value ===
    'mkd'
      ? 'Издвоени'
      : 'Highlights',
)

/* --------------------------------
   LOAD ALBUMS
-------------------------------- */

const loadAlbums = async () => {
  loadingAlbums.value = true

  try {
    galleryAlbums.value =
      await getGalleryAlbums()
  } catch (error) {
    console.error(
      'Failed to load gallery albums:',
      error,
    )

    galleryAlbums.value = []
  } finally {
    loadingAlbums.value = false
  }
}

/* --------------------------------
   LOAD ALBUM PHOTOS
-------------------------------- */

const loadAlbumPhotos = async (
  album: GalleryAlbum,
) => {
  loadingPhotos.value = true

  selectedAlbumPhotos.value = []
  albumNextCursor.value = null
  viewerIndex.value = 0

  try {
    const result =
      await getGalleryPhotos(
        album.folder,
      )

    selectedAlbumPhotos.value =
      result.photos

    albumNextCursor.value =
      result.nextCursor
  } catch (error) {
    console.error(
      'Failed to load album photos:',
      error,
    )

    selectedAlbumPhotos.value = []
    albumNextCursor.value = null
  } finally {
    loadingPhotos.value = false
  }
}

/* --------------------------------
   LOAD MORE
-------------------------------- */

const loadMoreAlbumPhotos =
  async () => {
    if (
      !selectedAlbum.value ||
      !albumNextCursor.value ||
      loadingMore.value
    ) {
      return
    }

    loadingMore.value = true

    try {
      const result =
        await getGalleryPhotos(
          selectedAlbum.value.folder,
          albumNextCursor.value,
        )
        

      selectedAlbumPhotos.value =
        [
          ...selectedAlbumPhotos.value,
          ...result.photos,
        ]

      albumNextCursor.value =
        result.nextCursor
    } catch (error) {
      console.error(
        'Failed to load more gallery photos:',
        error,
      )
    } finally {
      loadingMore.value = false
    }
  }

/* --------------------------------
   SELECT ALBUM
-------------------------------- */

const selectAlbum = async (
  albumId: string | null,
) => {
  selectedAlbumId.value =
    albumId

  if (!albumId) {
    selectedAlbumPhotos.value = []
    albumNextCursor.value = null
    viewerOpen.value = false
    return
  }

  const album =
    galleryAlbums.value.find(
      (item) =>
        item.id === albumId,
    )

  if (!album) {
    return
  }

  await loadAlbumPhotos(album)
}

/* --------------------------------
   VIEWER
-------------------------------- */

const openViewer = (
  index: number,
) => {
  viewerIndex.value = index
  viewerOpen.value = true
}

const closeViewer = () => {
  viewerOpen.value = false
}

const nextPhoto = () => {
  if (
    !selectedAlbum.value
  ) {
    return
  }

  viewerIndex.value =
    Math.min(
      viewerIndex.value + 1,
      selectedAlbumPhotos.value
        .length - 1,
    )
}

const prevPhoto = () => {
  viewerIndex.value =
    Math.max(
      viewerIndex.value - 1,
      0,
    )
}

/* --------------------------------
   INITIAL LOAD
-------------------------------- */

onMounted(async () => {
  await loadAlbums()

  const highlights: GalleryHighlightPhoto[] =
    []

  for (const album of galleryAlbums.value) {
    if (highlights.length >= 24) {
      break
    }

    try {
      const result =
        await getGalleryPhotos(
          album.folder,
        )

      for (const photo of result.photos.slice(0, 5)) {
        highlights.push({
          ...photo,
          albumId: album.id,
          albumTitle:
            album.title,
        })
      }
    } catch (error) {
      console.error(
        `Failed to load highlights for ${album.title}:`,
        error,
      )
    }
  }

  randomHighlights.value =
    highlights
})

/* --------------------------------
   INFINITE SCROLL
-------------------------------- */

watch(
  loadMoreSentinelRef,
  async (sentinel) => {
    loadMoreObserver?.disconnect()

    if (
      !sentinel ||
      typeof IntersectionObserver ===
        'undefined'
    ) {
      return
    }

    await nextTick()

    loadMoreObserver =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry?.isIntersecting &&
            hasMoreAlbumPhotos.value
          ) {
            void loadMoreAlbumPhotos()
          }
        },
        {
          rootMargin: '300px',
        },
      )

    loadMoreObserver.observe(
      sentinel,
    )
  },
)

/* --------------------------------
   BODY SCROLL LOCK
-------------------------------- */

watch(
  viewerOpen,
  async (isOpen) => {
    if (
      typeof document ===
      'undefined'
    ) {
      return
    }

    if (isOpen) {
      previousBodyOverflow =
        document.body.style
          .overflow

      document.body.style.overflow =
        'hidden'

      await nextTick()

      viewerOverlayRef.value?.scrollTo(
        {
          top: 0,
          behavior: 'smooth',
        },
      )

      viewerCardRef.value?.scrollIntoView(
        {
          block: 'center',
          behavior: 'smooth',
        },
      )

      return
    }

    document.body.style.overflow =
      previousBodyOverflow
  },
)

/* --------------------------------
   CLEANUP
-------------------------------- */

onBeforeUnmount(() => {
  if (
    typeof document !==
    'undefined'
  ) {
    document.body.style.overflow =
      previousBodyOverflow
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
  inset: 12px;
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
  color: #045e9b;
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

.highlights-panel,
.folder-view {
  display: grid;
  gap: 1rem;
}

.folder-view__meta h3 {
  margin: 0;
  color: #171a1d;
  font-size: clamp(1.4rem, 3vw, 2rem);
}

.folder-view__meta p {
  margin: 0.35rem 0 0;
  color: rgba(23, 26, 29, 0.8);
}

.folder-view__loading,
.folder-view__empty {
  padding: 2rem;
  text-align: center;
  color: rgba(23, 26, 29, 0.7);
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(180px, 1fr)
  );
  gap: 0.75rem;
}

.folder-photo {
  border: 1px solid rgba(23, 26, 29, 0.12);
  overflow: hidden;
  padding: 0;
  background: rgba(255, 255, 255, 0.18);
  cursor: pointer;
}

.folder-photo img {
  width: 100%;
  height: 175px;
  object-fit: cover;
  display: block;
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

.load-more-button:disabled {
  opacity: 0.5;
  cursor: wait;
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
}

.photo-viewer__nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 720px) {
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
