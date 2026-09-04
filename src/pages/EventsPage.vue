<template>
  <section class="page-card">
    <p class="eyebrow">{{ content.pages.events.eyebrow }}</p>
    <h2>{{ content.pages.events.title }}</h2>

    <div v-if="nextEvent" class="featured-event-card">
      <div>
        <p class="eyebrow">{{ content.pages.events.nextUp }}</p>
        <h3>{{ nextEvent.title }}</h3>
        <p>{{ formattedDate(nextEvent.date) }}</p>
        <p>{{ nextEvent.description }}</p>
      </div>
      <router-link class="feature-button" :to="`/events/${nextEvent.id}`">View details</router-link>
    </div>

    <div class="event-list">
      <article v-for="event in upcomingEvents" :key="event.id" class="event-item">
        <h3>{{ event.title }}</h3>
        <p>{{ formattedDate(event.date) }}</p>
        <p>{{ event.location }}</p>
        <p>{{ event.description }}</p>
        <router-link class="secondary-link" :to="`/events/${event.id}`">{{ content.pages.events.viewDetails }}</router-link>
      </article>
    </div>
  </section>
</template>



<script setup lang="ts">
import { computed } from 'vue'
import { events } from '../data_to_features/events'
import { currentTranslation } from '../data_to_features/translations_state_change'

const content = computed(() => currentTranslation.value)
const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

const upcomingEvents = computed(() => sortedEvents.filter((event) => new Date(event.date).getTime() >= Date.now()))
const nextEvent = computed(() => upcomingEvents.value[0])

const formattedDate = (value: string) => new Date(value).toLocaleString('en', {
  dateStyle: 'full',
  timeStyle: 'short',
})
</script>

<style scoped>
.page-card {
  position: relative;
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

.page-card > h2 {
  position: relative;
  z-index: 1;
  margin: 0.25rem 0 1.5rem;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
  color: #191d20;
}

.eyebrow {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #4f2f2b;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.featured-event-card {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) auto;
  align-items: center;
  gap: 1.2rem;
  padding: clamp(1.25rem, 2vw, 1.8rem);
  margin-bottom: 2rem;
  background: #d9d2c4;
  border: 6px solid #1c1e22;
  box-shadow: inset 0 0 0 3px #8a7d67;
  color: #181b1e;
}

.featured-event-card::before {
  content: '';
  position: absolute;
  inset: 18px 18px 18px auto;
  width: 28%;
  background: rgba(32, 35, 39, 0.06);
  border-left: 4px solid rgba(24, 27, 30, 0.52);
}

.featured-event-card h3 {
  margin: 0.4rem 0 0.6rem;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #13171a;
}

.featured-event-card p {
  margin: 0.35rem 0;
  color: rgba(24, 27, 30, 0.8);
  line-height: 1.7;
}

.feature-button,
.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0.8rem 1.2rem;
  border: 3px solid #1a1d20;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  font-weight: 900;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.feature-button {
  position: relative;
  z-index: 1;
  background: #f0c870;
  color: #171a1d;
  box-shadow: 8px 8px 0 rgba(24, 26, 29, 0.8);
}

.secondary-link {
  width: fit-content;
  background: #f5f0e9;
  color: #1a1d20;
  box-shadow: 6px 6px 0 rgba(24, 26, 29, 0.78);
}

.feature-button:hover,
.secondary-link:hover {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 rgba(24, 26, 29, 0.82);
}

.event-list {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.event-item {
  display: grid;
  gap: 0.8rem;
  padding: 1.25rem;
  background: #d7d0c2;
  border: 4px solid #1b1d1e;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.12);
}

.event-item h3 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
  color: #171a1d;
}

.event-item p {
  margin: 0;
  color: rgba(23, 26, 29, 0.8);
  line-height: 1.7;
}

.event-item .secondary-link {
  margin-top: 0.3rem;
}

@media (max-width: 720px) {
  .featured-event-card {
    grid-template-columns: 1fr;
  }

  .feature-button,
  .secondary-link {
    width: 100%;
  }
}
</style>

