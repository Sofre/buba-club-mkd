<template>
  <article class="photo-showcase-card" @click="openModal">
    <img v-if="!imageError" :src="resolvedSrc" :alt="photo.title || 'Gallery photo'" @error="handleImageError" />
    <div v-else class="photo-fallback">
      <p>{{ content.components.photoShowcase.fallbackTitle }}</p>
      <small>{{ content.components.photoShowcase.fallbackSubtitle }}</small>
    </div>
    <div class="photo-showcase-copy">
      <h4>{{ photo.title }}</h4>
      <p v-if="photo.caption">{{ photo.caption }}</p>
    </div>
  </article>

  <teleport to="body">
    <div v-if="isOpen && !imageError && !isFolderLink" class="photo-modal-backdrop" @click.self="closeModal">
      <div class="photo-modal-card">
        <button class="photo-modal-close" @click="closeModal" :aria-label="content.components.photoShowcase.modalClose">×</button>
        <img :src="resolvedSrc" :alt="photo.title || 'Gallery photo'" />
        <div class="photo-modal-copy">
          <h3>{{ photo.title }}</h3>
          <p v-if="photo.caption">{{ photo.caption }}</p>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { normalizeDriveImageUrl, type GalleryPhoto } from '../data_to_features/gallery'
import { currentTranslation } from '../data_to_features/translations_state_change'

const props = defineProps<{ photo: GalleryPhoto }>()
const content = computed(() => currentTranslation.value)

const isOpen = ref(false)
const imageError = ref(false)
const isFolderLink = computed(() => props.photo.src.includes('/folders/'))
const resolvedSrc = computed(() => normalizeDriveImageUrl(props.photo.src))

let previousBodyOverflow = ''

const openModal = () => {
  if (!imageError.value && !isFolderLink.value) {
    isOpen.value = true
  }
}

const closeModal = () => {
  isOpen.value = false
}

watch(isOpen, async (open) => {
  if (typeof document === 'undefined') {
    return
  }

  if (open) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    await nextTick()
    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }
})

const handleImageError = () => {
  imageError.value = true
}
</script>
