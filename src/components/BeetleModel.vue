<template>
  <section class="model-section">
    <header class="model-header">
      <p class="model-label">{{ content.components.beetleModel.label }}</p>
      <h2>{{ content.components.beetleModel.title }}</h2>
      <p class="model-indicator">
        <span class="model-indicator__dot" aria-hidden="true"></span>
        {{ content.components.beetleModel.interactive }}
      </p>
    </header>

    <div class="model-frame">
      <model-viewer
        ref="viewerRef"
        class="beetle-viewer"
        :src="modelUrl"
        :alt="content.components.beetleModel.alt"
        auto-rotate
        :camera-controls="unlocked"
        :disable-pan="!unlocked"
        :disable-zoom="!unlocked"
        enable-tap
        ar
        shadow-intensity="1"
        camera-orbit="-35deg 82deg 2.1m"
        field-of-view="10deg"
        environment-image="neutral"
        exposure="1.1"
      />

      <div class="model-controls">
        <button
          class="model-control"
          type="button"
          :aria-pressed="unlocked"
          :aria-label="unlocked ? content.components.beetleModel.lockAria : content.components.beetleModel.unlockAria"
          @click="unlocked = !unlocked"
        >
          {{ unlocked ? content.components.beetleModel.lock : content.components.beetleModel.unlock }}
        </button>
        <button
          v-if="unlocked"
          class="model-control"
          type="button"
          @click="resetView"
        >
          {{ content.components.beetleModel.reset }}
        </button>
      </div>
    </div>

    <footer class="model-footer">
      <span class="model-footer__rule" aria-hidden="true"></span>
      <p class="model-hint">
        {{ unlocked ? content.components.beetleModel.hintUnlocked : content.components.beetleModel.hintLocked }}
      </p>
      <span class="model-footer__rule" aria-hidden="true"></span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { currentTranslation } from '../services_and_configuratables/translations_state_change'

const content = computed(() => currentTranslation.value)
const modelUrl = new URL('../assets/3d/1968_volkswagen_beetle.glb', import.meta.url).href
const unlocked = ref(false)

const viewerRef = ref<HTMLElement | null>(null)

const resetView = () => {
  const viewer = viewerRef.value as (HTMLElement & {
    cameraOrbit: string
    fieldOfView: string
    jumpCameraToGoal?: () => void
  }) | null

  if (!viewer) return

  viewer.cameraOrbit = '-35deg 82deg 2.1m'
  viewer.fieldOfView = '10deg'
  viewer.jumpCameraToGoal?.()
}
</script>

<style scoped>
.model-section {
  --charcoal: #171916;
  --cream: #e8dfc9;
  --gold: #b49a68;

  display: grid;
  gap: 1rem;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: var(--charcoal);
  color: var(--cream);
  border-radius: 0;
  outline: 1px solid rgba(180, 154, 104, 0.35);
  outline-offset: -10px;
}

.model-header {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  text-align: center;
}

.model-label,
.model-indicator,
.model-hint,
.model-control {
  font-family: 'Segoe UI', sans-serif;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.model-label {
  margin: 0;
  color: var(--gold);
}

.model-header h2 {
  margin: 0;
  max-width: 28ch;
  font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', serif;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 400;
  font-style: italic;
  line-height: 1.15;
  letter-spacing: 0;
  color: var(--cream);
}

.model-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  color: rgba(232, 223, 201, 0.6);
}

.model-indicator__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  animation: model-pulse 2.4s ease-in-out infinite;
}

.model-frame {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(380px, 58vh, 680px);
  background: radial-gradient(
    ellipse 55% 60% at 50% 52%,
    rgba(232, 223, 201, 0.16) 0%,
    rgba(180, 154, 104, 0.06) 45%,
    transparent 72%
  );
}

.beetle-viewer {
  display: block;
  width: min(100%, 1100px);
  height: clamp(380px, 58vh, 660px);
  border-radius: 0;
  background: transparent;
  filter: none;
  --poster-color: transparent;
}

.model-controls {
  position: absolute;
  right: 0;
  bottom: 0.25rem;
  display: flex;
  gap: 0.5rem;
}

.model-control {
  padding: 0.55rem 0.9rem;
  border: 1px solid rgba(180, 154, 104, 0.55);
  border-radius: 0;
  background: rgba(23, 25, 22, 0.6);
  color: var(--cream);
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.model-control:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--charcoal);
}

.model-control:focus-visible {
  outline: 2px solid var(--cream);
  outline-offset: 2px;
}

.model-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.model-footer__rule {
  height: 1px;
  background: rgba(180, 154, 104, 0.4);
}

.model-hint {
  margin: 0;
  color: rgba(232, 223, 201, 0.6);
  text-align: center;
}

@keyframes model-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 700px) {
  .model-label,
  .model-indicator,
  .model-hint,
  .model-control {
    letter-spacing: 0.18em;
  }

  .model-frame {
    min-height: 340px;
  }

  .beetle-viewer {
    height: 340px;
  }

  .model-controls {
    right: 50%;
    transform: translateX(50%);
  }

  .model-footer {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-top: 2.25rem;
  }

  .model-footer__rule {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .model-indicator__dot {
    animation: none;
  }
}
</style>
