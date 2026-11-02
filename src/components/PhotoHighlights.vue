<template>
  <section class="ph" :aria-label="title">
    <p v-if="!filteredPhotos.length" class="ph__empty">{{ emptyLabel }}</p>

    <template v-else>
      <button
        v-if="featuredPhoto"
        :key="`featured-${featuredPhoto.src}`"
        class="ph__featured"
        type="button"
        :aria-label="featuredPhoto.title || featuredPhoto.albumTitle"
        @click="openLightbox(0)"
      >
        <img
          :src="featuredPhoto.src"
          :alt="featuredPhoto.title || featuredPhoto.albumTitle"
          decoding="async"
        />
        <span class="ph__featured-copy">
          <span class="ph__label">{{ featuredPhoto.albumTitle }}</span>
          <span v-if="featuredPhoto.title" class="ph__featured-title">{{ featuredPhoto.title }}</span>
        </span>
      </button>

      <TransitionGroup v-if="gridPhotos.length" name="ph-fade" tag="div" class="ph__grid">
        <button
          v-for="(photo, index) in gridPhotos"
          :key="`${photo.albumId}-${photo.src}`"
          class="ph__tile"
          :class="tileClass(index)"
          type="button"
          :aria-label="photo.title || photo.albumTitle"
          @click="openLightbox(index + 1)"
        >
          <img
            :src="photo.thumbnailSrc || photo.src"
            :alt="photo.title || photo.albumTitle"
            loading="lazy"
            decoding="async"
          />
          <span class="ph__overlay">
            <span class="ph__label">{{ photo.albumTitle }}</span>
            <span v-if="photo.title" class="ph__tile-title">{{ photo.title }}</span>
          </span>
        </button>
      </TransitionGroup>
    </template>

    <teleport to="body">
      <Transition name="ph-lightbox">
        <div
          v-if="lightboxIndex !== null && currentPhoto"
          ref="lightboxRef"
          class="ph-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="currentPhoto.title || currentPhoto.albumTitle"
          tabindex="-1"
          @click.self="closeLightbox"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <button class="ph-lightbox__close" type="button" :aria-label="closeLabel" @click="closeLightbox">×</button>

          <button
            class="ph-lightbox__nav ph-lightbox__nav--prev"
            type="button"
            :aria-label="prevLabel"
            :disabled="lightboxIndex === 0"
            @click="step(-1)"
          >
            ‹
          </button>

          <figure class="ph-lightbox__figure">
            <img
              :key="currentPhoto.src"
              :src="currentPhoto.src"
              :alt="currentPhoto.title || currentPhoto.albumTitle"
            />
            <figcaption>
              <span class="ph__label">{{ currentPhoto.albumTitle }}</span>
              <span v-if="currentPhoto.title">{{ currentPhoto.title }}</span>
              <span class="ph-lightbox__count">{{ lightboxIndex + 1 }} / {{ filteredPhotos.length }}</span>
            </figcaption>
          </figure>

          <button
            class="ph-lightbox__nav ph-lightbox__nav--next"
            type="button"
            :aria-label="nextLabel"
            :disabled="lightboxIndex === filteredPhotos.length - 1"
            @click="step(1)"
          >
            ›
          </button>
        </div>
      </Transition>
    </teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { GalleryHighlightPhoto } from '../services_and_configuratables/gallery'

const props = withDefaults(
  defineProps<{
    photos: GalleryHighlightPhoto[]
    title?: string
    emptyLabel?: string
    closeLabel?: string
    prevLabel?: string
    nextLabel?: string
  }>(),
  {
    title: 'Highlights',
    emptyLabel: 'No photos available.',
    closeLabel: 'Close',
    prevLabel: 'Previous photo',
    nextLabel: 'Next photo',
  },
)

const filteredPhotos = computed(() => props.photos)

const featuredPhoto = computed(() => filteredPhotos.value[0] ?? null)
const gridPhotos = computed(() => filteredPhotos.value.slice(1))

// Repeating asymmetric pattern for the editorial grid
const tileClass = (index: number) => {
  const slot = index % 8
  if (slot === 0) return 'ph__tile--tall'
  if (slot === 3) return 'ph__tile--wide'
  if (slot === 5) return 'ph__tile--tall'
  return ''
}

/* Lightbox */

const lightboxIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
const currentPhoto = computed(() =>
  lightboxIndex.value === null ? null : filteredPhotos.value[lightboxIndex.value] ?? null,
)

let previousBodyOverflow = ''
let lastFocused: HTMLElement | null = null

const openLightbox = (index: number) => {
  lastFocused = document.activeElement as HTMLElement | null
  lightboxIndex.value = index
}

const closeLightbox = () => {
  lightboxIndex.value = null
}

const step = (direction: 1 | -1) => {
  if (lightboxIndex.value === null) return
  const next = lightboxIndex.value + direction
  if (next >= 0 && next < filteredPhotos.value.length) {
    lightboxIndex.value = next
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeLightbox()
  else if (event.key === 'ArrowLeft') step(-1)
  else if (event.key === 'ArrowRight') step(1)
}

let touchStartX = 0

const onTouchStart = (event: TouchEvent) => {
  touchStartX = event.changedTouches[0].clientX
}

const onTouchEnd = (event: TouchEvent) => {
  const delta = event.changedTouches[0].clientX - touchStartX
  if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1)
}

watch(
  () => lightboxIndex.value !== null,
  async (open) => {
    if (open) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      lightboxRef.value?.focus()
      return
    }

    document.body.style.overflow = previousBodyOverflow
    window.removeEventListener('keydown', onKeydown)
    lastFocused?.focus?.()
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (lightboxIndex.value !== null) {
    document.body.style.overflow = previousBodyOverflow
  }
})
</script>

<style scoped>
.ph {
  display: grid;
  gap: 1.75rem;
  padding: 1rem 0 2rem;
}

.ph__featured:focus-visible,
.ph__tile:focus-visible {
  outline: 2px solid #171a1d;
  outline-offset: 3px;
}

.ph__empty {
  margin: 0;
  padding: 2rem 0;
  color: rgba(23, 26, 29, 0.6);
}

/* Featured */

.ph__featured {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  padding: 0;
  border: 0;
  border-radius: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);border: 1px solid rgba(23, 26, 29, 0.12);
  cursor: zoom-in;
}

.ph__featured img,
.ph__tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.ph__featured:hover img,
.ph__tile:hover img,
.ph__tile:focus-visible img {
  transform: scale(1.05);
}

.ph__featured-copy {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  gap: 0.35rem;
  padding: 3rem clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 1.75rem);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
  color: #fff;
  text-align: left;
}

.ph__featured-title {
  font-size: clamp(1.2rem, 2.6vw, 2rem);
  font-weight: 300;
  letter-spacing: -0.01em;
}

.ph__label {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.85;
}

/* Editorial grid */

.ph__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: clamp(120px, 15vw, 220px);
  grid-auto-flow: dense;
  gap: 0.75rem;
}

.ph__tile {
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 0;
  overflow: hidden;
  background: #e4e2dd;
  cursor: zoom-in;
  grid-row: span 1;
}

.ph__tile--tall {
  grid-row: span 2;
}

.ph__tile--wide {
  grid-column: span 2;
}

.ph__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 0.9rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1) 60%);
  color: #fff;
  text-align: left;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.ph__tile:hover .ph__overlay,
.ph__tile:focus-visible .ph__overlay {
  opacity: 1;
}

.ph__tile-title {
  font-size: 0.95rem;
  font-weight: 400;
}

.ph-fade-enter-active,
.ph-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.ph-fade-enter-from,
.ph-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 960px) {
  .ph__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .ph__grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 38vw;
  }

  .ph__featured {
    aspect-ratio: 4 / 3;
  }
}

/* Touch devices have no hover: keep labels visible */
@media (hover: none) {
  .ph__overlay {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 55%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ph__featured img,
  .ph__tile img,
  .ph__overlay,
  .ph-fade-enter-active,
  .ph-fade-leave-active {
    transition: none;
  }

  .ph__featured:hover img,
  .ph__tile:hover img {
    transform: none;
  }
}
</style>

<style>
.ph-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(10, 10, 12, 0.94);
  color: #fff;
  outline: none;
}

.ph-lightbox__figure {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
  margin: 0;
  min-width: 0;
}

.ph-lightbox__figure img {
  max-width: 100%;
  max-height: calc(100vh - 9rem);
  object-fit: contain;
  border-radius: 4px;
  animation: ph-lightbox-img 0.35s ease;
}

.ph-lightbox__figure figcaption {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.ph-lightbox__figure .ph__label {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
}

.ph-lightbox__count {
  opacity: 0.6;
}

.ph-lightbox__close,
.ph-lightbox__nav {
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font: inherit;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.ph-lightbox__close:hover,
.ph-lightbox__nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}

.ph-lightbox__close:focus-visible,
.ph-lightbox__nav:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.ph-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.75rem;
  height: 2.75rem;
  font-size: 1.6rem;
  z-index: 1;
}

.ph-lightbox__nav {
  width: 3rem;
  height: 3rem;
  font-size: 2rem;
}

.ph-lightbox__nav:disabled {
  opacity: 0.25;
  cursor: default;
}

.ph-lightbox-enter-active,
.ph-lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.ph-lightbox-enter-from,
.ph-lightbox-leave-to {
  opacity: 0;
}

@keyframes ph-lightbox-img {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
}

@media (max-width: 640px) {
  .ph-lightbox {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .ph-lightbox__nav {
    position: absolute;
    bottom: 1rem;
    width: 2.75rem;
    height: 2.75rem;
  }

  .ph-lightbox__nav--prev {
    left: 1rem;
  }

  .ph-lightbox__nav--next {
    right: 1rem;
  }

  .ph-lightbox__figure img {
    max-height: calc(100vh - 10rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ph-lightbox__figure img {
    animation: none;
  }

  .ph-lightbox-enter-active,
  .ph-lightbox-leave-active {
    transition: none;
  }
}
</style>
