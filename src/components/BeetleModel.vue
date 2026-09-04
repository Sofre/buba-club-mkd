<template>
  <section class="model-section">
    <div class="model-header">
      <h2>{{ content.components.beetleModel.title }}</h2>
      
    </div>
    <div class="model-frame">
      <model-viewer
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { currentTranslation } from '../data_to_features/translations_state_change'

const content = computed(() => currentTranslation.value)
const modelUrl = new URL('../assets/3d/1968_volkswagen_beetle.glb', import.meta.url).href
const unlocked = ref(false)


</script>

<style scoped>
.model-section {
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: #121212;
  border: 2px solid #8d8d8d;
  border-radius: 0;
  box-shadow: none;
}

.model-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #6b6b6b;
}

.model-header h2 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
  color: #f3f3f3;
}



.model-frame {
  position: relative;
  min-height: clamp(420px, 62vh, 720px);
  display: grid;
  place-items: center;
  padding: 1rem;
  border-radius: 0;
  background: #151515;
  border: 1px solid #7a7a7a;
  overflow: hidden;
  box-shadow: none;
}

.beetle-viewer {
  display: block;
  width: min(100%, 1100px);
  height: clamp(420px, 62vh, 700px);
  border-radius: 0;
  background: transparent;
  filter: none;
}

@media (max-width: 700px) {
  .model-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .unlock-btn {
    width: 100%;
  }
}
</style>
