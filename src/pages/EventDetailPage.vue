<template>
  <section class="page-card" v-if="event">
    <p class="eyebrow">{{ content.pages.events.eventDetails }}</p>
    <h2>{{ event.title }}</h2>

    <div class="event-meta-grid">
      <div class="event-meta-item">
        <span class="event-meta-label">{{ content.pages.events.dateLabel }}</span>
        <span>{{ formattedDate }}</span>
      </div>
      <div class="event-meta-item">
        <span class="event-meta-label">{{ content.pages.events.locationLabel }}</span>
        <span>{{ event.location }}</span>
      </div>
    </div>

    <p class="intro-copy">{{ event.description }}</p>
    <p class="detail-copy">{{ event.details }}</p>

    <router-link class="feature-button" to="/events">{{ content.pages.events.backToEvents }}</router-link>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { events } from '../data_to_features/events'
import { currentTranslation } from '../data_to_features/translations_state_change'

const content = computed(() => currentTranslation.value)
const route = useRoute()
const event = computed(() => events.find((item) => item.id === route.params.id))

const formattedDate = computed(() => {
  if (!event.value) return ''
  return new Date(event.value.date).toLocaleString('en', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
})
</script>

<style scoped>
.page-card {
  position: relative;
  display: grid;
  gap: 1.2rem;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: #c5bca9;
  border: 10px solid #1b1d1f;
  box-shadow: inset 0 0 0 4px #8f7d61, 0 20px 40px rgba(0, 0, 0, 0.18);
  color: #171a1d;
  overflow: hidden;
}

.page-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 12px;
  background: #3a3b3d;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.14);
}

.page-card::after {
  content: '';
  position: absolute;
  inset: 18px 16px 16px 16px;
  border: 2px solid rgba(27, 29, 31, 0.18);
  pointer-events: none;
}

.page-card > * {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0;
  color: #4f2f2b;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
  color: #191d20;
}

.event-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.event-meta-item {
  display: grid;
  gap: 0.4rem;
  padding: 1rem 1.1rem;
  background: #d9d2c4;
  border: 6px solid #1c1e22;
  box-shadow: inset 0 0 0 3px #8a7d67;
}

.event-meta-label {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #4f2f2b;
}

.event-meta-item span:last-child {
  font-size: 1rem;
  font-weight: 700;
  color: #171a1d;
}

.intro-copy,
.detail-copy {
  margin: 0;
  color: rgba(24, 27, 30, 0.82);
  line-height: 1.8;
}

.detail-copy {
  padding-top: 0.4rem;
}

.feature-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 46px;
  padding: 0.8rem 1.2rem;
  border: 3px solid #1a1d20;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  font-weight: 900;
  background: #f0c870;
  color: #171a1d;
  box-shadow: 8px 8px 0 rgba(24, 26, 29, 0.8);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.feature-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 rgba(24, 26, 29, 0.82);
}
</style>
