<template>
  <main class="home-page">
    <section class="story-block">
      <div class="story-block__image" :style="{ backgroundImage: `url(${storyImage})` }" aria-label="Classic Beetle club photo" />
      <div class="story-block__content">
        <p class="section-tag section-tag--muted">{{ content.home.hero.title || 'About the club' }}</p>
        <h2>{{ content.home.hero.eyebrow || 'A machine, a culture, a community.' }}</h2>
        <p>{{ content.home.hero.body }}</p>
        <ul class="story-points">
          <li>{{ content.home.hero.storypoint1  }}</li>
          <li>{{ content.home.hero.storypoint2 }}</li>
          <li>{{ content.home.hero.storypoint3 }}</li>
        </ul>
        <button class="button button--primary" type="button" @click="openJoinForm">{{ content.home.cards.member.button }}</button>
      </div>
    </section>

    <section class="gallery-section">
      <div class="section-header">
        <div>
          <p class="section-tag section-tag--muted">{{ content.home.gallery.title || 'club gallery' }}</p>
          <h2>{{ content.home.gallery.eyebrow || 'Club moments' }}</h2>
        </div>
      </div>

      <div class="gallery-layout">
        <img
          v-if="galleryPreviewPhotos[0]"
          class="gallery-main-image"
          :src="galleryPreviewPhotos[0].thumbnailSrc || galleryPreviewPhotos[0].src"
          :alt="galleryPreviewPhotos[0].title || 'Beetle Club gallery highlight'"
          loading="eager"
          fetchpriority="high"
        />
        <div v-if="galleryPreviewPhotos.length > 1" class="gallery-stack">
          <img
            v-for="photo in galleryPreviewPhotos.slice(1)"
            :key="photo.src"
            class="gallery-stack__item"
            :src="photo.thumbnailSrc || photo.src"
            :alt="photo.title || 'Beetle Club gallery photo'"
            loading="lazy"
          />
        </div>
        <p v-if="!galleryLoading && !galleryPreviewPhotos.length" class="gallery-empty">
          {{ currentLanguageCode === 'mkd' ? 'Нема достапни фотографии.' : 'Gallery photos are temporarily unavailable.' }}
        </p>
      </div>
    </section>

    <section class="heritage-section">
      <div class="section-header">
        <div>
          <p class="section-tag section-tag--muted">{{ content.home.heritage.title }}</p>
          <h2>{{ content.home.heritage.title }}</h2>
        </div>
      </div>

      <div class="timeline">
        <article v-for="item in content.home.heritage.timeline" :key="item.year" class="timeline-item">
          <span class="timeline-item__year">{{ item.year }}</span>
          <div class="timeline-item__content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="partners-band">
      <div class="partners-band__header">
        <p class="section-tag section-tag--muted">{{ content.home.partners.eyebrow }}</p>
        <h2>{{ content.home.partners.title }}</h2>
      </div>

      <div class="sponsors-row">
        <div v-for="sponsor in sponsors" :key="sponsor.name" class="sponsor-logo">
          <img :src="sponsor.logo" :alt="sponsor.name" />
        </div>
      </div>
    </section>

    <section class="partners-band">
      <div class="partners-band__header">
        <p class="section-tag section-tag--muted">{{ pastPartnersCopy.eyebrow }}</p>
        <h2>{{ pastPartnersCopy.title }}</h2>
      </div>

      <div class="sponsors-row">
        <div
          v-for="partner in pastSponsors"
          :key="`past-${partner.name}`"
          class="sponsor-logo"
          :class="{ 'sponsor-logo--small': partner.name === 'Victorius' }"
        >
          <img :src="partner.logo" :alt="partner.name" />
        </div>
      </div>
    </section>

    

    <teleport to="body">
      <div v-if="isJoinFormOpen" ref="joinOverlayRef" class="join-modal-overlay" @click.self="closeJoinForm">
        <div ref="joinModalRef" class="join-modal" role="dialog" aria-modal="true" aria-labelledby="join-form-title" tabindex="-1">
          <div class="join-modal-header">
            <div>
              <p class="section-tag section-tag--muted">{{ content.home.joinModal.eyebrow }}</p>
              <h3 id="join-form-title">{{ content.home.joinModal.title }}</h3>
            </div>
            <button class="icon-button" type="button" @click="closeJoinForm" :aria-label="content.home.joinModal.close">×</button>
          </div>

          <form class="join-form" @submit.prevent="submitJoinRequest">
            <label>
              <span>{{ content.home.joinModal.name }}</span>
              <input ref="firstJoinFieldRef" v-model="form.name" type="text" required />
            </label>
            <label>
              <span>{{ content.home.joinModal.surname }}</span>
              <input v-model="form.surname" type="text" required />
            </label>
            <label>
              <span>{{ content.home.joinModal.email }}</span>
              <input v-model="form.email" type="email" required />
            </label>
            <label>
              <span>{{ content.home.joinModal.description }}</span>
              <textarea v-model="form.description" rows="4" required></textarea>
            </label>

            <p v-if="submitStatus === 'success'" class="join-form-message join-form-message--success" role="status">{{ content.home.joinModal.success }}</p>
            <p v-if="submitStatus === 'error'" class="join-form-message join-form-message--error" role="alert">{{ content.home.joinModal.error }}</p>

            <div class="join-form-actions">
              <button class="button button--secondary" type="button" @click="closeJoinForm">{{ content.home.joinModal.cancel }}</button>
              <button class="button button--primary" type="submit" :disabled="isSubmitting || submitStatus === 'success'">{{ isSubmitting ? content.home.joinModal.sending : content.home.joinModal.submit }}</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'

import {
  getGalleryAlbums,
  getGalleryPhotos,
  type GalleryPhoto,
} from '../services_and_configuratables/gallery'
import { markHomeReady } from '../services_and_configuratables/app_ready'

import {
  currentLanguageCode,
  currentTranslation,
} from '../services_and_configuratables/translations_state_change'

const content = computed(() => currentTranslation.value)

/* -------------------------------------------------------------------------- */
/* Partners                                                                   */
/* -------------------------------------------------------------------------- */

const sponsorAssets = Object.entries(
  import.meta.glob('../assets/sponsors/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([path, logo]) => {
    const fileName =
      path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Sponsor'

    const fallbackName = fileName
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    return {
      fallbackName,
      logo: logo as string,
    }
  })

const sponsors = computed(() => {
  const partnerNames =
    ((currentTranslation.value.home?.partners?.items as string[]) ?? [])
      .filter(Boolean)

  return sponsorAssets.map((asset, index) => ({
    name: partnerNames[index] ?? asset.fallbackName,
    logo: asset.logo,
  }))
})

const pastPartnerAssets = Object.entries(
  import.meta.glob('../assets/prev_partners/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([path, logo]) => {
    const fileName =
      path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Past Partner'

    const fallbackName = fileName
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    return {
      fallbackName,
      logo: logo as string,
    }
  })

const pastSponsors = computed(() =>
  pastPartnerAssets.map((asset) => ({
    name: asset.fallbackName,
    logo: asset.logo,
  })),
)

const pastPartnersCopy = computed(() =>
  currentLanguageCode.value === 'mkd'
    ? {
        eyebrow: 'Поранешни соработници',
        title: 'Поранешни партнери',
      }
    : {
        eyebrow: 'Past collaborators',
        title: 'Old partners',
      },
)

/* -------------------------------------------------------------------------- */
/* Gallery - Cloudinary API                                                   */
/* -------------------------------------------------------------------------- */

const galleryPreviewPhotos = ref<GalleryPhoto[]>([])
const galleryLoading = ref(false)

const loadGalleryPreview = async () => {
  galleryLoading.value = true

  try {
    const albums = await getGalleryAlbums()
    const previews = await Promise.all(
      albums.slice(0, 4).map(async (album) => {
        const result = await getGalleryPhotos(album.folder)
        return result.photos.slice(0, 2)
      }),
    )

    galleryPreviewPhotos.value = previews.flat().slice(0, 5)

    const first = galleryPreviewPhotos.value[0]
    if (first) {
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = first.thumbnailSrc || first.src
      })
    }
  } catch (error) {
    console.error('Could not load gallery preview:', error)
    galleryPreviewPhotos.value = []
  } finally {
    galleryLoading.value = false
    markHomeReady()
  }
}

onMounted(() => {
  void loadGalleryPreview()
})

/* -------------------------------------------------------------------------- */
/* Home images                                                                */
/* -------------------------------------------------------------------------- */

const storyImage = computed(
  () =>
    'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365298/DSC06171_ne1v7q.jpg',
)

/* -------------------------------------------------------------------------- */
/* Join form                                                                  */
/* -------------------------------------------------------------------------- */

const isJoinFormOpen = ref(false)

const joinOverlayRef = ref<HTMLElement | null>(null)
const joinModalRef = ref<HTMLElement | null>(null)
const firstJoinFieldRef = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: '',
  surname: '',
  email: '',
  description: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

const openJoinForm = () => {
  submitStatus.value = 'idle'
  isJoinFormOpen.value = true
}

const closeJoinForm = () => {
  isJoinFormOpen.value = false
}

let previousBodyOverflow = ''

watch(isJoinFormOpen, async (isOpen) => {
  if (typeof document === 'undefined') {
    return
  }

  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    await nextTick()

    joinOverlayRef.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    joinModalRef.value?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    })

    firstJoinFieldRef.value?.focus()

    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }
})

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const submitJoinRequest = async () => {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    submitStatus.value = 'success'
    form.name = ''
    form.surname = ''
    form.email = ''
    form.description = ''
  } catch {
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 3.5rem;
  padding: 1.5rem 0 0;
}

.section-tag {
  margin: 0 0 0.8rem;
  font-size: 0.72rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #e7bf5f;
  font-weight: 700;
}

.section-tag--muted {
  color: #7d1e1e;
}

.story-block {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(255, 249, 241, 0.68);
  border: 1px solid rgba(123, 30, 30, 0.12);
  border-radius: 1.6rem;
  box-shadow: 0 18px 50px rgba(23, 18, 14, 0.06);
}

.story-block__image {
  min-height: 450px;
  border-radius: 1.2rem;
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
}

.story-block__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.6rem 0.2rem;
}

.story-block__content p {
  margin: 0;
  color: #36343a;
  font-size: 1.04rem;
  line-height: 1.8;
}

.story-block__content > h2 + p {
  margin-top: 0.85rem;
}

.story-points {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 2rem;
  display: grid;
  gap: 0.85rem;
}

.story-points li {
  position: relative;
  padding-left: 1.35rem;
  color: #2a2e38;
  font-weight: 600;
}

.story-points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #D3342F;
  box-shadow: 0 0 0 4px rgba(211, 141, 47, 0.1);
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-header h2,
.story-block__content h2,
.timeline-item__content h3,
.event-card__body h3 {
  margin: 0;
  color: #1a1c22;
}

.section-header h2,
.story-block__content h2 {
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  
}

.content-section .section-header h2,
.gallery-section .section-header h2,
.partners-band .partners-band__header h2,
.content-section .section-header .inline-link,
.gallery-section .section-header .inline-link,
.partners-band .inline-link {
  color: #1a1c22;
}

.inline-link,
.card-link {
  color: #7d1e1e;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.content-section .inline-link,
.gallery-section .inline-link,
.partners-band .inline-link,
.card-link {
  color: #7d1e1e;
}

.hero {
  position: relative;
  display: grid;
  align-items: end;
  min-height: 72vh;
  border-radius: 1.8rem;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(118, 28, 28, 0.18);
  box-shadow: 0 30px 80px rgba(17, 14, 13, 0.18);
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(19, 17, 18, 0.86) 0%, rgba(19, 17, 18, 0.66) 42%, rgba(19, 17, 18, 0.25) 100%);
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 760px;
  padding: clamp(2rem, 5vw, 5rem);
}

.hero h1 {
  margin: 0;
  color: #f8f3ea;
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 0.96;
  letter-spacing: -0.06em;
  max-width: 700px;
}

.hero__lead {
  margin: 1.2rem 0 0;
  max-width: 620px;
  font-size: 1.15rem;
  line-height: 1.8;
  color: rgba(247, 240, 230, 0.9);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  appearance: none;
  border: none;
  border-radius: 999px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.82rem 1.4rem;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button--primary {
  background: #7d1e1e;
  color: #fdf5ec;
  box-shadow: 0 12px 28px rgba(125, 30, 30, 0.22);
}

.join-form-actions .button--primary {
  background-image: none;
  background-color: #7d1e1e;
}

.join-form-actions .button--primary:focus-visible {
  outline: 3px solid #c89c44;
  outline-offset: 3px;
}

.button--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #1a1c22;
  border: 1px solid rgba(26, 28, 34, 0.12);
}

.content-section,
.gallery-section,
.heritage-section,
.partners-band,
.social-strip {
  display: block;
}

.content-section,
.gallery-section,
.heritage-section,
.partners-band {
  padding: 1.75rem;
  background: rgba(255, 245, 235, 0.9);
  border: 1px solid rgba(26, 28, 34, 0.08);
  border-radius: 1.5rem;
  box-shadow: 0 14px 36px rgba(17, 13, 9, 0.06);
  color: #1a1c22;
}

.heritage-section {
  display: block;
}

.timeline {
  display: grid;
  gap: 1.25rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 1.2rem;
  align-items: start;
  padding: 1.3rem 0;
  border-top: 1px solid rgba(35, 30, 26, 0.12);
}

.timeline-item:first-child {
  border-top: none;
  padding-top: 0;
}

.timeline-item__year {
  font-size: clamp(2.6rem, 3vw, 4rem);
  font-weight: 900;
  line-height: 1;
  color: #7d1e1e;
  letter-spacing: -0.06em;
}

.timeline-item__content {
  padding-top: 0.5rem;
}

.timeline-item__content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.6rem;
}

.timeline-item__content p {
  margin: 0;
  line-height: 1.8;
  color: #3b3f47;
}

.card-link {
  display: inline-block;
  margin-top: 1rem;
}

.gallery-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.1rem;
}

.gallery-main-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 1.5rem;
  object-fit: cover;
  object-position: center;
  box-shadow: 0 22px 50px rgba(17, 13, 9, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.gallery-stack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.gallery-stack__item {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 1.2rem;
  object-fit: cover;
  object-position: center;
  box-shadow: 0 18px 40px rgba(17, 13, 9, 0.09);
}

.gallery-empty {
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
}

.timeline {
  display: grid;
  gap: 1.25rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 1.2rem;
  align-items: start;
  padding: 1.3rem 0;
  border-top: 1px solid rgba(35, 30, 26, 0.12);
}

.timeline-item:first-child {
  border-top: none;
  padding-top: 0;
}

.timeline-item__year {
  font-size: clamp(2.6rem, 3vw, 4rem);
  font-weight: 900;
  line-height: 1;
  color: #7d1e1e;
  letter-spacing: -0.06em;
}

.timeline-item__content {
  padding-top: 0.5rem;
}

.timeline-item__content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.6rem;
}

.timeline-item__content p {
  margin: 0;
  line-height: 1.8;
  color: #3b3f47;
}

.partners-band__header {
  margin-bottom: 1rem;
}

.partners-band h2 {
  margin: 0;
  font-size: clamp(1.9rem, 2.7vw, 2.8rem);
  line-height: 1.1;
}

.sponsors-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  align-items: center;
}

.sponsor-logo {
  display: grid;
  place-items: center;
  min-height: 110px;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sponsor-logo img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  filter: grayscale(0.15) contrast(1.08);
}

.social-strip {
  padding: 1rem 0 0.1rem;
  
}

.social-logo-wall {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 1.1rem;
  border-radius: 2rem;
  background: rgba(255, 250, 242, 0);
  border: 1px solid rgba(30, 23, 17, 0.08);
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.84), 2px 11px rgba(79, 50, 46, 0.46);
}

.social-logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  background: rgba(122, 72, 34, 0.08);
  box-shadow: 0 8px 18px rgba(22, 13, 9, 0.08);
}

.social-logo-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 24px rgba(16, 12, 10, 0.14);
  filter: saturate(1.08);
}

.social-logo-link:active {
  transform: translateY(-1px) scale(0.98);
}

.social-icon {
  display: grid;
  place-items: center;
  width: 4.85rem;
  height: 4.85rem;
  padding: 0.42rem;
  border-radius: 999px;
  border: 2px solid rgba(245, 235, 214, 0.7);
  background: linear-gradient(145deg, #1b1817, #2a241f);
  color: #fffaf1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -10px 18px rgba(0, 0, 0, 0.18);
}

.social-icon--instagram {
  background: linear-gradient(135deg, rgba(108, 26, 85, 0.95), rgba(187, 90, 32, 0.9) 52%, rgba(235, 180, 48, 0.92));
}

.social-icon--facebook {
  background: linear-gradient(135deg, #1d4fb8, #2f6de7);
}

.social-icon--youtube {
  background: linear-gradient(135deg, #a80707, #d01818);
}

.social-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.social-icon :deep(svg *) {
  vector-effect: non-scaling-stroke;
}

.join-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(1rem, 4vh, 2rem);
  z-index: 3000;
  overflow-y: auto;
}

.join-modal {
  width: min(100%, 500px);
  background: #f3efe8;
  border: 1px solid rgba(31, 24, 18, 0.08);
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  margin: auto 0;
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
}

.join-modal h3 {
  margin: 0;
  color: #1a1d22;
  font-size: 1.8rem;
}

.join-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.icon-button {
  border: none;
  background: transparent;
  color: #1a1d22;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.join-form {
  display: grid;
  gap: 0.9rem;
}

.join-form label {
  display: grid;
  gap: 0.35rem;
  color: #1d2128;
  font-weight: 600;
}

.join-form input,
.join-form textarea {
  width: 100%;
  border: 1px solid rgba(26, 29, 34, 0.12);
  border-radius: 0.8rem;
  padding: 0.78rem 0.9rem;
  background: rgba(255, 255, 255, 0.68);
  color: #111827;
}

.join-form textarea {
  resize: vertical;
  min-height: 110px;
}

.join-form-message {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.join-form-message--success {
  background: #e6f6ea;
  color: #1e6b34;
}

.join-form-message--error {
  background: #fdeaea;
  color: #a12626;
}

.join-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

@media (max-width: 1024px) {
  .story-block,
  .gallery-layout {
    grid-template-columns: 1fr;
  }

  .events-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .home-page {
    gap: 2.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }

  .gallery-stack {
    grid-template-columns: 1fr 1fr;
  }

  .button {
    width: 100%;
  }

  .hero__actions {
    flex-direction: column;
  }

  .social-logo-wall {
    border-radius: 1rem;
  }

  .join-modal-overlay {
    padding: 0.75rem;
  }

  .join-modal {
    max-height: calc(100dvh - 1.5rem);
  }
}
</style>
