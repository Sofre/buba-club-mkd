<template>
  <section class="articles-feed">
    <header class="articles-feed__header">
      <p class="eyebrow">{{ pageText.eyebrow }}</p>
      <h2>{{ pageText.title }}</h2>
    </header>

    <div class="articles-ticker">
      <span v-for="label in pageText.ticker" :key="label">{{ label }}</span>
    </div>

    <div class="articles-timeline">
      <article v-for="item in timelineItems" :key="item.id" class="timeline-post">
        <aside class="timeline-post__meta">
          <span class="timeline-post__dot" aria-hidden="true"></span>
          <span class="timeline-post__date">{{ formatDate(item.postedAt) }}</span>
          <span class="timeline-post__tag">{{ item.tag }}</span>
        </aside>

        <div class="timeline-post__body">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>

          <img v-if="item.kind === 'photo' && item.imageUrl" :src="item.imageUrl" :alt="item.title" class="timeline-post__media" loading="lazy" />

          <div v-else-if="item.kind === 'video' && item.videoUrl" class="timeline-post__video-wrap">
            <iframe
              :src="item.videoUrl"
              :title="item.title"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
          </div>

          <a
            v-else-if="item.kind === 'social' && item.socialUrl"
            :href="item.socialUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="[
              'timeline-post__social-link',
              item.socialPlatform === 'instagram'
                ? 'timeline-post__social-link--instagram'
                : item.socialPlatform === 'facebook'
                  ? 'timeline-post__social-link--facebook'
                  : '',
            ]"
          >
            {{ socialCtaLabel }} · {{ getSocialPlatformLabel(item.socialPlatform) }}
          </a>

          <div v-else class="timeline-post__text-note">{{ textOnlyLabel }}</div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleSocialPlatform } from '../data_to_features/articles'
import { getArticlesForLanguage, getArticlesPageCopy } from '../data_to_features/articles'
import { currentLanguageCode } from '../data_to_features/translations_state_change'

const pageText = computed(() => getArticlesPageCopy(currentLanguageCode.value))

const timelineItems = computed(() =>
  [...getArticlesForLanguage(currentLanguageCode.value)].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  ),
)

const textOnlyLabel = computed(() =>
  currentLanguageCode.value === 'mkd' ? 'Текст објава' : 'Text post',
)

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

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(currentLanguageCode.value === 'mkd' ? 'mk-MK' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
</script>

<style scoped>
.articles-feed {
  position: relative;
  display: grid;
  gap: 1.2rem;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: #f5efe6;
  border: 1px solid rgba(28, 19, 16, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 14px 28px rgba(20, 15, 12, 0.06);
  color: #171a1d;
}

.articles-feed__header,
.articles-ticker,
.articles-timeline,
.timeline-post,
.timeline-post__meta,
.timeline-post__body {
  position: relative;
  z-index: 1;
}

.articles-feed__header {
  display: grid;
  gap: 0.35rem;
}

.eyebrow {
  margin: 0;
  color: #9E5A01;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  
}

.articles-feed__header h2 {
  margin: 0;
  color: #191d20;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
}

.articles-ticker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.articles-ticker span {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-style: bold;
  color: #000000;
  background: #f4d788;
  border: 1px solid rgba(44, 28, 21, 0.18);
  border-radius: 999px;
  padding: 0.42rem 0.75rem;
}

.articles-timeline {
  display: grid;
  gap: 1rem;
}

.timeline-post {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #faf6f1;
  border: 1px solid rgba(28, 19, 16, 0.14);
  border-radius: 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.timeline-post__meta {
  display: grid;
  align-content: start;
  gap: 0.45rem;
}

.timeline-post__dot {
  width: 0.7rem;
  height: 0.7rem;
  background: #a35b36;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(163, 91, 54, 0.12);
}

.timeline-post__date {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6d2f2a;
}

.timeline-post__tag {
  display: inline-flex;
  width: fit-content;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.5rem;
  background: #EFD2D2;
  color: #1a1d20;
  border-radius: 999px;
  border: 1px solid rgba(26, 29, 32, 0.16);
}

.timeline-post__body {
  display: grid;
  gap: 0.75rem;
}

.timeline-post__body h3 {
  margin: 0;
  font-size: clamp(1.3rem, 2.5vw, 1.9rem);
  line-height: 1.15;
  color: #171a1d;
}

.timeline-post__body p {
  margin: 0;
  color: rgba(24, 27, 30, 0.8);
  line-height: 1.7;
}

.timeline-post__media,
.timeline-post__video-wrap {
  margin-top: 0;
  border: 1px solid rgba(28, 19, 16, 0.14);
  border-radius: 0.9rem;
  overflow: hidden;
  width: 100%;
  background: #efebe4;
}

.timeline-post__media {
  display: block;
  max-height: 500px;
  object-fit: cover;
}

.timeline-post__video-wrap {
  position: relative;
  padding-top: 56.25%;
}

.timeline-post__video-wrap iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.timeline-post__text-note {
  display: inline-flex;
  width: fit-content;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #171a1d;
  background: #efe3d2;
  border: 1px solid rgba(26, 29, 32, 0.16);
  border-radius: 999px;
  padding: 0.42rem 0.7rem;
}

.timeline-post__social-link {
  width: fit-content;
  margin-top: 0.1rem;
  color: #171a1d;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  background: #f4d788;
  border: 1px solid rgba(26, 29, 32, 0.16);
  border-radius: 999px;
  padding: 0.44rem 0.8rem;
}

.timeline-post__social-link:hover {
  background: #f0cb6c;
}

.timeline-post__social-link--instagram {
  color: #fff4d1;
  background: linear-gradient(135deg, #651f88 0%, #581D73 58%, #d8a940 100%);
  border-color: rgba(216, 169, 64, 0.58);
}

.timeline-post__social-link--instagram:hover {
  background: linear-gradient(135deg, #5a1979 0%, #626120 58%, #c8952f 100%);
}

.timeline-post__social-link--facebook {
  color: #f8fbff;
  background: #1f58d4;
  border-color: rgba(17, 48, 116, 0.45);
}

.timeline-post__social-link--facebook:hover {
  background: #1a4ab4;
}

@media (max-width: 780px) {
  .timeline-post {
    grid-template-columns: 1fr;
  }
}
</style>
