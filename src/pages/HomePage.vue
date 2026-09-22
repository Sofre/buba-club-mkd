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

    <section class="content-section">
      <div class="section-header">
        <div>
          <p class="section-tag section-tag--muted">{{ content.home.cards.news.eyebrow }}</p>
          <h2>{{ articlePageCopy.title }}</h2>
        </div>
        <router-link class="inline-link" to="/articles">All articles</router-link>
      </div>

      <div class="articles-list">
        <article v-for="article in featuredArticles" :key="article.id" class="article-card">
          <div class="article-card__meta">
            <span class="article-card__dot" aria-hidden="true" />
            <span class="article-card__date">{{ formatArticleDate(article.postedAt) }}</span>
            <span class="article-card__tag">{{ article.tag }}</span>
          </div>

          <div class="article-card__body">
            <h3>{{ article.title }}</h3>
            <p>{{ article.body }}</p>

            <img
              v-if="article.kind === 'photo' && article.imageUrl"
              :src="article.imageUrl"
              :alt="article.title"
              class="article-card__media"
              loading="lazy"
            />

            <div v-else-if="article.kind === 'video' && article.videoUrl" class="article-card__video-wrap">
              <iframe
                :src="normalizeYoutubeEmbed(article.videoUrl)"
                :title="article.title"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              />
            </div>

            <a
              v-else-if="article.kind === 'social' && article.socialUrl"
              :href="article.socialUrl"
              target="_blank"
              rel="noopener noreferrer"
              :class="[
                'article-card__social-link',
                article.socialPlatform === 'instagram'
                  ? 'article-card__social-link--instagram'
                  : article.socialPlatform === 'facebook'
                    ? 'article-card__social-link--facebook'
                    : '',
              ]"
            >
              {{ socialCtaLabel }} · {{ getSocialPlatformLabel(article.socialPlatform) }}
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="gallery-section">
      <div class="section-header">
        <div>
          <p class="section-tag section-tag--muted">{{ content.home.gallery.title || 'club gallery' }}</p>
          <h2>{{ content.home.gallery.eyebrow || 'Club moments' }}</h2>
        </div>
        <router-link class="inline-link" to="/gallery">Open gallery</router-link>
      </div>

      <div class="gallery-layout">
        <div class="gallery-main-image" :style="{ backgroundImage: `url(${galleryMainImage})` }" />
        <div class="gallery-stack">
          <div v-for="photo in gallerySidePhotos" :key="photo.src" class="gallery-stack__item" :style="{ backgroundImage: `url(${photo.src})` }" />
        </div>
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
        <article class="timeline-item">
          <span class="timeline-item__year">2001</span>
          <div class="timeline-item__content">
            <h3>The beginning</h3>
            <p>Our story starts with the love for the air-cooled classic, the community around it and the rituals of the drive.</p>
          </div>
        </article>
        <article class="timeline-item">
          <span class="timeline-item__year">2016</span>
          <div class="timeline-item__content">
            <h3>Shared identity</h3>
            <p>The club began to grow through regular meetups, restoration stories and a shared passion for bringing old machines back to life.</p>
          </div>
        </article>
        <article class="timeline-item">
          <span class="timeline-item__year">2026</span>
          <div class="timeline-item__content">
            <h3>Today</h3>
            <p>From casual weekend cruises to community gatherings, we keep the Beetle spirit alive in the heart of Macedonia.</p>
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
        <div v-for="partner in pastSponsors" :key="`past-${partner.name}`" class="sponsor-logo">
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

            <div class="join-form-actions">
              <button class="button button--secondary" type="button" @click="closeJoinForm">{{ content.home.joinModal.cancel }}</button>
              <button class="button button--primary" type="submit">{{ content.home.joinModal.submit }}</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { ArticleSocialPlatform } from '../data_to_features/articles'
import { getArticlesForLanguage, getArticlesPageCopy } from '../data_to_features/articles'
import { galleryAlbums } from '../data_to_features/gallery'
import { currentLanguageCode, currentTranslation } from '../data_to_features/translations_state_change'

const content = computed(() => currentTranslation.value)

const sponsorAssets = Object.entries(
  import.meta.glob('../assets/sponsors/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    import: 'default',
  }),

// code for partners 


)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([path, logo]) => {
    const fileName = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Sponsor'
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
  const partnerNames = ((currentTranslation.value.home?.partners?.items as string[]) ?? []).filter(Boolean)

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
    const fileName = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Past Partner'
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
const galleryAlbum = computed(() => {
  if (!galleryAlbums.length) {
    return undefined
  }

  return galleryAlbums[Math.floor(Math.random() * galleryAlbums.length)] ?? galleryAlbums[0]
})

const heroImage = computed(() => 'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365298/DSC06171_ne1v7q.jpg')
const storyImage = computed(() => 'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365298/DSC06171_ne1v7q.jpg')
const galleryMainImage = computed(() => {
  const photos = galleryAlbum.value?.photos ?? []

  if (!photos.length) {
    return heroImage.value
  }

  const mainIndex = Math.floor(Math.random() * photos.length)
  return photos[mainIndex]?.src ?? heroImage.value
})
const gallerySidePhotos = computed(() => {
  const photos = [...(galleryAlbum.value?.photos ?? [])]

  if (!photos.length) {
    return []
  }

  const mainPhoto = galleryMainImage.value
  const shuffled = photos
    .filter((photo) => photo.src !== mainPhoto)
    .sort(() => Math.random() - 0.5)

  return shuffled.slice(0, 4)
})

const articlePageCopy = computed(() => getArticlesPageCopy(currentLanguageCode.value))

const featuredArticles = computed(() =>
  [...getArticlesForLanguage(currentLanguageCode.value)].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  ).slice(0, 3),
)

const normalizeYoutubeEmbed = (value: string) => {
  if (!value.includes('youtube.com/watch?v=')) {
    return value
  }

  const embedUrl = value.replace('watch?v=', 'embed/')
  return embedUrl.split('&')[0]
}

const formatArticleDate = (value: string) =>
  new Date(value).toLocaleDateString(currentLanguageCode.value === 'mkd' ? 'mk-MK' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const socialCtaLabel = computed(() =>
  currentLanguageCode.value === 'mkd' ? 'Отвори објава' : 'Open post',
)

const getSocialPlatformLabel = (platform?: ArticleSocialPlatform) => {
  if (platform === 'instagram') {
    return 'Instagram'
  }

  if (platform === 'facebook') {
    return 'Facebook'
  }

  return currentLanguageCode.value === 'mkd' ? 'Социјална мрежа' : 'Social'
}



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

const openJoinForm = () => {
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
    joinOverlayRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
    joinModalRef.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
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

const submitJoinRequest = () => {
  const subject = `Membership request from ${form.name} ${form.surname}`
  const body = [
    `Name: ${form.name}`,
    `Surname: ${form.surname}`,
    `Email: ${form.email}`,
    '',
    `Description: ${form.description}`,
  ].join('\n')

  const mailtoLink = `mailto:dukisofronievski@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  window.location.href = mailtoLink
  closeJoinForm()
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

.articles-list {
  display: grid;
  gap: 1rem;
}

.article-card {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 1rem;
  padding: 1.1rem 0 0;
  border-top: 1px solid rgba(26, 28, 34, 0.12);
  color: #1a1c22;
}

.article-card:first-child {
  border-top: none;
  padding-top: 0;
}

.article-card__meta {
  display: grid;
  align-content: start;
  gap: 0.45rem;
}

.article-card__dot {
  width: 0.64rem;
  height: 0.64rem;
  border-radius: 50%;
  background: #8c2f2f;
  box-shadow: 0 0 0 5px rgba(140, 47, 47, 0.12);
}

.article-card__date {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #000000;
}

.article-card__tag {
  display: inline-flex;
  width: fit-content;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.26rem 0.5rem;
  border-radius: 999px;
  background: rgba(125, 30, 30, 0.08);
  color: #7d1e1e;
}

.article-card__body h3 {
  margin: 0;
  font-size: clamp(1.18rem, 2.5vw, 1.6rem);
  color: #1a1c22;
}

.article-card__body {
  display: grid;
  gap: 0.7rem;
}

.article-card__body p {
  margin: 0;
  color: #3b3f47;
  line-height: 1.75;
}

.article-card__media,
.article-card__video-wrap {
  margin-top: 0;
  border-radius: 0.9rem;
  border: 1px solid rgba(26, 28, 34, 0.1);
  overflow: hidden;
  width: 100%;
}

.article-card__media {
  display: block;
  max-height: 420px;
  object-fit: cover;
}

.article-card__video-wrap {
  position: relative;
  padding-top: 56.25%;
}

.article-card__video-wrap iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.article-card__social-link {
  width: fit-content;
  margin-top: 0.1rem;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: #2c100f;
  text-decoration: none;
  background: rgba(233, 187, 84, 0.45);
  border: 1px solid rgba(44, 16, 15, 0.2);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
}

.article-card__social-link:hover {
  background: rgba(233, 187, 84, 0.7);
}

.article-card__social-link--instagram {
  color: #fff4d1;
  background: linear-gradient(135deg, #651f88 0%, #8a33b1 58%, #d8a940 100%);
  border-color: rgba(216, 169, 64, 0.58);
}

.article-card__social-link--instagram:hover {
  background: linear-gradient(135deg, #5a1979 0%, #7e2aa8 58%, #c8952f 100%);
}

.article-card__social-link--facebook {
  color: #f8fbff;
  background: #1f58d4;
  border-color: rgba(17, 48, 116, 0.45);
}

.article-card__social-link--facebook:hover {
  background: #1a4ab4;
}

.card-link {
  display: inline-block;
  margin-top: 1rem;
}

@media (max-width: 780px) {
  .article-card {
    grid-template-columns: 1fr;
  }
}

.gallery-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.1rem;
}

.gallery-main-image {
  min-height: 520px;
  border-radius: 1.5rem;
  background-size: cover;
  background-position: center;
  box-shadow: 0 22px 50px rgba(17, 13, 9, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.gallery-stack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.gallery-stack__item {
  min-height: 250px;
  border-radius: 1.2rem;
  background-size: cover;
  background-position: center;
  box-shadow: 0 18px 40px rgba(17, 13, 9, 0.09);
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

