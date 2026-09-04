<template>
  <section class="heritage-section">
    <div class="section-header">
      <div>
        <p class="section-tag section-tag--muted">{{ content.pages.heritage.eyebrow }}</p>
        <h2>{{ content.pages.heritage.title }}</h2>
      </div>
    </div>

    <p class="heritage-intro">{{ heritagePageData.intro }}</p>

    <div class="timeline">
      <article v-for="item in heritageTimeline" :key="item.year" class="timeline-item">
        <span class="timeline-item__year">{{ item.year }}</span>
        <div class="timeline-item__content">
          <h3>{{ item.header }}</h3>
          <p v-for="(paragraph, index) in item.paragraphs" :key="`${item.year}-${index}`">{{ paragraph }}</p>
        </div>
      </article>
    </div>

    <p class="heritage-closing">{{ heritagePageData.closing }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { heritagePageData } from '../data_to_features/heritage'
import { currentTranslation } from '../data_to_features/translations_state_change'

const content = computed(() => currentTranslation.value ?? {
  home: {
    heritage: {
      body: '',
      cta: '',
    },
  },
  pages: {
    heritage: {
      eyebrow: 'Our Heritage',
      title: 'Preserving the legacy of the Beetle',
      paragraphOne: '',
      paragraphTwo: '',
    },
  },
})

const heritageTimeline = computed(() => heritagePageData.timeline)
</script>

<style scoped>
.heritage-section {
  display: grid;
  gap: 1.4rem;
  padding: clamp(2rem, 4vw, 3rem);
  min-height: clamp(34rem, 70vh, 50rem);
  margin-bottom: clamp(2.5rem, 6vw, 5rem);
  border-radius: 1.3rem;
  border: 1px solid rgba(122, 32, 32, 0.1);
  background: #f9f1e7;
}

.section-tag {
  margin: 0 0 0.8rem;
  font-size: 0.72rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #e7bf5f;
  font-weight: 700;
}

.section-tag--muted,
.timeline-item__year {
  color: #7d1e1e;
}

.section-header h2,
.timeline-item__content h3 {
  margin: 0;
  color: #1a1c22;
}

.section-header h2 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 1.05;
}

.heritage-intro,
.timeline-item__content p,
.heritage-closing {
  margin: 0;
  line-height: 1.8;
  color: #3b3f47;
}

.timeline-item__content p + p {
  margin-top: 0.7rem;
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
  letter-spacing: -0.06em;
}



.timeline-item__content {
  padding-top: 0.5rem;
}

.timeline-item__content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.6rem;
}

.heritage-closing {
  padding-top: 0.8rem;
  border-top: 1px solid rgba(35, 30, 26, 0.12);
  font-weight: 600;
}

@media (max-width: 700px) {
  .timeline-item {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
}
</style>
