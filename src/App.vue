<template>
  <div class="app-frame">
    <div
      v-if="showSplash"
      class="splash-screen"
      :class="{ 'splash-screen--hidden': isSplashLeaving, 'splash-screen--reduced-motion': prefersReducedMotion }"
      aria-hidden="true"
    >
      <img class="splash-screen-logo" :src="bubaLogo" alt="" />
    </div>

    <div>
      <header class="topbar">
        <router-link to="/" class="brand-block" :aria-label="currentContent.app.header.goToHome">
          <img class="logo-mark" :class="{ 'logo-mark--initial': isInitialLoad }" :src="bubaLogo" :alt="currentContent.app.brand.eyebrow" />
        </router-link>
      </header>

      <div class="dashboard-controls">
        <div class="dashboard-controls__vents" aria-hidden="true">
        </div>

        <button
          class="mobile-nav-toggle"
          type="button"
          :aria-expanded="isMobileNavOpen"
          aria-controls="main-mobile-nav"
          @click="toggleMobileNav"
        >
          <span class="mobile-nav-toggle__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.3 7.3 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 14 1.5h-4a.5.5 0 0 0-.49.42l-.36 2.54c-.58.22-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.61 8.98a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.4 1.04.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h4a.5.5 0 0 0 .49-.42l.36-2.54c.58-.22 1.12-.53 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="mobile-nav-toggle__label">DASH CONTROLS</span>
          <span class="mobile-nav-toggle__hint">PUSH</span>
        </button>

        <nav id="main-mobile-nav" class="nav" :class="{ 'nav--mobile-open': isMobileNavOpen }" aria-label="Main navigation" @click="closeMobileNav">
          <router-link to="/" exact-active-class="nav-link--active" active-class="nav-link--active"><span class="nav-led" aria-hidden="true"></span>{{ currentContent.app.nav.home }}</router-link>
          <router-link to="/heritage" exact-active-class="nav-link--active" active-class="nav-link--active"><span class="nav-led" aria-hidden="true"></span>{{ currentContent.app.nav.heritage }}</router-link>
          <router-link to="/articles" exact-active-class="nav-link--active" active-class="nav-link--active"><span class="nav-led" aria-hidden="true"></span>{{ currentContent.app.nav.news }}</router-link>
          <router-link to="/events" exact-active-class="nav-link--active" active-class="nav-link--active"><span class="nav-led" aria-hidden="true"></span>{{ currentContent.app.nav.events }}</router-link>
          <router-link to="/gallery" exact-active-class="nav-link--active" active-class="nav-link--active"><span class="nav-led" aria-hidden="true"></span>{{ currentContent.app.nav.gallery }}</router-link>
          <router-link to="/beetle" exact-active-class="nav-link--active" active-class="nav-link--active" aria-label="Beetle"><span class="nav-led" aria-hidden="true"></span></router-link>
        </nav>

        <div class="lang-switcher" role="group" :aria-label="currentContent.app.header.languageSelector">
          <button
            class="lang-switcher__indicator"
            type="button"
            :class="{ 'lang-switcher__indicator--active': currentLanguageCode === 'mkd' }"
            @click="selectLanguage('mkd')"
            :aria-label="currentContent.app.header.switchToMkd"
          >
            <span class="lang-switcher__diode"></span>
            <span class="lang-switcher__label">MKD</span>
          </button>

          <button
            class="lang-switcher__indicator"
            type="button"
            :class="{ 'lang-switcher__indicator--active': currentLanguageCode === 'eng' }"
            @click="selectLanguage('eng')"
            :aria-label="currentContent.app.header.switchToEng"
          >
            <span class="lang-switcher__diode"></span>
            <span class="lang-switcher__label">ENG</span>
          </button>
        </div>
      </div>

      <section v-if="nextEvent" class="event-banner-section" :aria-label="currentContent.app.header.upcomingEventInfo">
        <button
          type="button"
          class="event-banner"
          :class="{ 'event-banner--compact': !isEventBannerExpanded }"
          :aria-label="currentContent.app.header.upcomingEventInfo"
          :aria-expanded="isEventBannerExpanded"
          @click="handleEventBannerClick"
        >
          <span class="event-banner__led" aria-hidden="true"></span>
          <span class="event-banner__screen">
            <span class="event-banner__label">{{ currentContent.app.header.nextMeet }}</span>
            <span v-if="!isEventBannerExpanded" class="event-banner__compact-date">{{ formattedEventDate }}</span>
            <span v-else :key="`flaps-${flapCycle}`" class="event-banner__flap-track">
              <span class="event-banner__flap">
                <span class="event-banner__flap-label">{{ eventBannerFields.date }}</span>
                <span class="event-banner__flap-value">{{ formattedEventDate }}</span>
              </span>
              <span class="event-banner__flap">
                <span class="event-banner__flap-label">{{ eventBannerFields.time }}</span>
                <span class="event-banner__flap-value">{{ formattedEventTime }}</span>
              </span>
              <span class="event-banner__flap">
                <span class="event-banner__flap-label">{{ eventBannerFields.city }}</span>
                <span class="event-banner__flap-value">{{ formattedEventLocation }}</span>
              </span>
              <span class="event-banner__flap event-banner__flap--title">
                <span class="event-banner__flap-label">{{ eventBannerFields.title }}</span>
                <span class="event-banner__flap-value">{{ nextEvent.title || 'BEETLE CLUB MEET' }}</span>
              </span>
            </span>
          </span>
        </button>
      </section>

      <main class="content">
        <router-view v-slot="{ Component, route }">
          <transition name="page-transition" mode="out-in" :key="route.fullPath">
            <div class="route-page" :class="{ 'route-page--ready': isRouteReady }">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>
    </div>

    <footer class="footer-plate">
      <div class="footer-plate__grid">
        <section class="stamp-module">
          <p class="stamp-label">{{ footerLabels.contact }}</p>
          <ul class="stamp-list">
            <li>Beetle Club Macedonia</li>
            <li>+389 75 404 907</li>
          </ul>
        </section>

        <section class="stamp-module">
          <p class="stamp-label">{{ footerLabels.location }}</p>
          <p class="stamp-text">Skopje, North Macedonia</p>
        </section>

        <section class="stamp-module">
          <p class="stamp-label">{{ footerLabels.mail }}</p>
          <a class="stamp-link" href="mailto:dukisofronievski@gmail.com">dukisofronievski@gmail.com</a>
        </section>

        <section class="stamp-module">
          <p class="stamp-label">{{ currentContent.app.footer.quickLinks }}</p>
          <nav class="stamp-links">
            <router-link to="/">{{ currentContent.app.nav.home }}</router-link>
            <router-link to="/heritage">{{ currentContent.app.nav.heritage }}</router-link>
            <router-link to="/articles">{{ currentContent.app.nav.news }}</router-link>
            <router-link to="/events">{{ currentContent.app.nav.events }}</router-link>
            <router-link to="/gallery">{{ currentContent.app.nav.gallery }}</router-link>
          </nav>
        </section>

        <section class="stamp-module">
           <p class="stamp-label">{{ currentContent.home.socials.title }}</p>
           <ul class="stamp-list">
            <li> <a class="stamp-link" href="mailto:dukisofronievski@gmail.com">Facebook</a></li>
            <li> <a class="stamp-link" href="mailto:dukisofronievski@gmail.com">Instagram</a></li>
            <li> <a class="stamp-link" href="mailto:dukisofronievski@gmail.com">X</a></li>
          </ul>
        </section>


      </div>

      <div class="footer-plate__bottom">
        <p>{{ currentContent.app.footer.copyright }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import bubaLogo from './assets/icons/bubalogo.jpg'
import { events } from './data_to_features/events'
import { currentLanguageCode, currentTranslation } from './data_to_features/translations_state_change'

const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
const nextEvent = computed(() => sortedEvents.find((event) => new Date(event.date).getTime() >= Date.now()))
const isInitialLoad = ref(true)
const isRouteReady = ref(false)
const showSplash = ref(true)
const isSplashLeaving = ref(false)
const prefersReducedMotion = ref(false)
const isEventBannerExpanded = ref(false)
const isMobileNavOpen = ref(false)
const flapCycle = ref(0)
let flapInterval: number | null = null
const currentContent = computed(() => currentTranslation.value)

const eventBannerFields = computed(() =>
  currentLanguageCode.value === 'mkd'
    ? {
        date: 'DATUM',
        time: 'VREME',
        city: 'GRAD',
        title: 'NASTAN',
      }
    : {
        date: 'DATE',
        time: 'TIME',
        city: 'CITY',
        title: 'TITLE',
      },
)

const footerLabels = computed(() =>
  currentLanguageCode.value === 'mkd'
    ? {
        contact: 'KONTAKT',
        location: 'LOKACIJA',
        mail: 'MAIL',
      }
    : {
        contact: 'CONTACT',
        location: 'LOCATION',
        mail: 'MAIL',
      },
)

const formattedEventDate = computed(() => {
  if (!nextEvent.value) return ''

  return new Date(nextEvent.value.date).toLocaleDateString(currentLanguageCode.value === 'mkd' ? 'mk' : 'en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
})

const formattedEventTime = computed(() => {
  if (!nextEvent.value) return ''

  return new Date(nextEvent.value.date).toLocaleTimeString(currentLanguageCode.value === 'mkd' ? 'mk' : 'en', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const formattedEventLocation = computed(() => {
  if (!nextEvent.value?.location) return 'SKOPJE'
  return nextEvent.value.location.toUpperCase()
})

const router = useRouter()

const handleEventBannerClick = () => {
  if (!isEventBannerExpanded.value) {
    isEventBannerExpanded.value = true
    if (!prefersReducedMotion.value) {
      triggerFlapAnimation()
    }
    return
  }

  if (nextEvent.value?.id) {
    router.push(`/events/${nextEvent.value.id}`)
    return
  }

  router.push('/events')
}

const selectLanguage = (code: 'eng' | 'mkd') => {
  currentLanguageCode.value = code
}

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

const closeMobileNav = () => {
  isMobileNavOpen.value = false
}

const triggerFlapAnimation = () => {
  flapCycle.value += 1
}

const startFlapTicker = () => {
  if (prefersReducedMotion.value) return
  if (flapInterval !== null) {
    window.clearInterval(flapInterval)
  }

  flapInterval = window.setInterval(() => {
    triggerFlapAnimation()
  }, 4200)
}

watch(
  [formattedEventDate, formattedEventTime, formattedEventLocation, () => nextEvent.value?.title, currentLanguageCode],
  () => {
    if (prefersReducedMotion.value) return
    triggerFlapAnimation()
  },
  { immediate: true },
)

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    closeMobileNav()
  },
)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startFlapTicker()

  window.setTimeout(() => {
    isInitialLoad.value = false
    isSplashLeaving.value = true

    window.setTimeout(() => {
      showSplash.value = false
    }, 450)
  }, 1800)
})

onBeforeUnmount(() => {
  if (flapInterval !== null) {
    window.clearInterval(flapInterval)
  }
})

const prepareRouteTransition = () => {
  isRouteReady.value = false
  window.setTimeout(() => {
    isRouteReady.value = true
  }, 120)
}

router.beforeEach(() => {
  prepareRouteTransition()
})

</script>

<style scoped>
/* App root wrapper */
.app-frame {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Plate + stamp footer */
.footer-plate {
  position: relative;
  margin-top: 2rem;
  padding: clamp(1.1rem, 2.4vw, 1.7rem);
  border-radius: 1rem;
  background: #f4ede3;
  border: 1px solid rgba(29, 24, 20, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(66, 51, 39, 0.08);
}

.footer-plate::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%23191512' fill-opacity='0.08'%3E%3Ccircle cx='12' cy='18' r='1'/%3E%3Ccircle cx='58' cy='24' r='1'/%3E%3Ccircle cx='96' cy='14' r='1'/%3E%3Ccircle cx='24' cy='62' r='1'/%3E%3Ccircle cx='78' cy='58' r='1'/%3E%3Ccircle cx='106' cy='70' r='1'/%3E%3Ccircle cx='38' cy='98' r='1'/%3E%3Ccircle cx='90' cy='102' r='1'/%3E%3C/g%3E%3C/svg%3E");
}

.footer-plate__grid,
.footer-plate__bottom {
  position: relative;
  z-index: 1;
}

.footer-plate__grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stamp-module {
  min-width: 0;
  padding: 0.9rem;
  border-radius: 0.7rem;
  background: #faf6f0;
  border: 1px solid rgba(34, 27, 22, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(73, 50, 34, 0.1);
}

.stamp-label {
  margin: 0 0 0.55rem;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #7b1f1f;
  font-weight: 800;
}

.stamp-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.32rem;
  color: #23262d;
  line-height: 1.55;
}

.stamp-text {
  margin: 0;
  color: #23262d;
  line-height: 1.55;
}

.stamp-link,
.stamp-links a {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: #23262d;
  text-decoration: none;
  font-weight: 700;
}

.stamp-link:hover,
.stamp-links a:hover {
  color: #7b1f1f;
}

.stamp-links {
  display: grid;
  gap: 0.42rem;
}

.footer-plate__bottom {
  margin-top: 0.85rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(34, 27, 22, 0.16);
}

.footer-plate__bottom p {
  margin: 0;
  color: #2f343d;
  font-size: 0.9rem;
}

/* Initial splash screen */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #7a0000;
  background-image:  #7a0000;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.45s ease, visibility 0.45s ease;
  pointer-events: all;
  overflow: hidden;
}

.splash-screen--hidden {
  opacity: 0;
  visibility: hidden;
}

.splash-screen-logo {
  width: min(42vw, 500px);
  max-width: 500px;
  aspect-ratio: 1;
  object-fit: contain;
  display: block;
  animation: splashSpin 1.8s linear infinite;
}

.splash-screen--reduced-motion .splash-screen-logo {
  animation: none;
}

/* Initial logo spin animation */
.logo-mark {
  animation: none;
}

.logo-mark--initial {
  animation: logoSpin 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

/* Route transition animation */
.route-page {
  display: block;
}

.route-page--ready {
  animation: routeContentAppear 0.2s ease-out both;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Keyframes for intro and route animations */
@keyframes logoSpin {
  from {
    transform: rotate(0deg) scale(0.9);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes splashSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes routeContentAppear {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lang-switcher {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 0.5rem 0.4rem;
  border-radius: 0;
  align-self: start;
  margin-top: 0;
  margin-bottom: auto;
  margin-left: 40px;
  background: #171512;
  border: 1px solid rgba(255, 228, 184, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.lang-switcher__indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 50px;
  padding: 0.35rem 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0;
  background: #201c1a;
  color: #f4f4f5;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.lang-switcher__indicator:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 222, 185, 0.32);
}

.lang-switcher__indicator--active {
  background: #2a241d;
  border-color: rgba(255, 255, 255, 0.24);
}

.lang-switcher__diode {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #615b53;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.lang-switcher__indicator--active .lang-switcher__diode {
  background: #c89c44;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 0 8px rgba(194, 147, 69, 0.4);
  transform: scale(1.04);
}

.lang-switcher__label {
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(244, 244, 245, 0.84);
}

.lang-switcher__indicator--active .lang-switcher__label {
  color: #f6e6bf;
}

.event-banner-section {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 0.75rem;
}

.event-banner {
  appearance: none;
  position: relative;
  display: block;
  text-align: left;
  cursor: pointer;
  width: min(100%, 1120px);
  padding: 1rem;
  text-decoration: none;
  border-radius: 0;
  background: #000201;
  border: 10px solid #1b1d1f;
  box-shadow: inset 0 0 0 4px #8f7d61, 0 20px 40px rgba(0, 0, 0, 0.18);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.event-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 12px;
  background: #3a3b3d;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.14);
}

.event-banner::after {
  content: '';
  position: absolute;
  inset: 18px 16px 16px 16px;
  border: 2px solid rgba(27, 29, 31, 0.18);
  pointer-events: none;
}

.event-banner--compact {
  width: min(100%, 440px);
  margin-inline: auto;
  padding: 0.8rem;
}

.event-banner:hover {
  transform: translateY(-1px);
  box-shadow: inset 0 0 0 4px #8f7d61, 0 24px 42px rgba(0, 0, 0, 0.2);
}

.event-banner__screen {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.7rem;
  min-width: 0;
  width: 100%;

  /* Keep your existing proportions */
  padding: 0.8rem 0.9rem 0.85rem;

  /* Vintage radio cabinet */
  border-radius: 4px;
  background:
    linear-gradient(
      90deg,
      rgba(60, 50, 35, 0.08) 1px,
      transparent 1px
    ),
    #d9d2c4;

  border: 6px solid #1c1e22;

  /* Inner metal/wood framing */
  box-shadow:
    inset 0 0 0 3px #8a7d67,
    inset 0 0 0 6px #b8ad98,
    inset 0 0 18px rgba(28, 30, 34, 0.35),
    0 4px 0 #111214,
    0 7px 12px rgba(0, 0, 0, 0.25);

  /* Slightly aged radio surface */
  background-size: 5px 5px;
}

/* Vintage radio grille */
.event-banner__screen::before {
  content: "";
  position: absolute;
  inset: 8px;
  pointer-events: none;

  background:
    repeating-linear-gradient(
      90deg,
      rgba(28, 30, 34, 0.10) 0,
      rgba(28, 30, 34, 0.10) 2px,
      transparent 2px,
      transparent 6px
    );

  opacity: 0.25;
  border-radius: 2px;
}

/* Small illuminated radio indicator */
.event-banner__screen::after {
  content: "";
  position: absolute;
  top: 10px;
  right: 12px;

  width: 7px;
  height: 7px;
  border-radius: 50%;

  background: #b84b32;

  box-shadow:
    0 0 4px rgba(184, 75, 50, 0.7),
    inset 1px 1px 2px rgba(255, 255, 255, 0.35);
}



.event-banner__label {
  position: relative;
  z-index: 1;
  margin: 0;

  color: #4f2f2b;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;

  font-family: "Arial Narrow", "Roboto Condensed", sans-serif;

  text-shadow:
    0.5px 0.5px 0 #8a7d67,
    0 1px 1px rgba(0, 0, 0, 0.15);
}

.event-banner__compact-date {
  position: relative;
  z-index: 1;

  font-size: clamp(1.02rem, 1.3vw, 1.18rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  color: #171a1d;

  /* Vintage automotive/radio typography */
  font-family: "Arial Narrow", "Roboto Condensed", "Trebuchet MS", sans-serif;

  /* Slightly worn printed lettering */
  text-shadow:
    0.5px 0.5px 0 #8a7d67,
    0 1px 1px rgba(0, 0, 0, 0.12);

  opacity: 0.94;
}

.event-banner__flap-track {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(110px, 1fr) minmax(140px, 1.2fr) minmax(300px, 2.4fr);
  gap: 0.7rem;
}

.event-banner__flap {
  display: grid;
  gap: 0.24rem;
  min-width: 0;

  padding: 0.75rem 0.8rem;

  /* Thick vintage instrument bezel */
  border: 4px solid #1b1d1e;
  background: #d7d0c2;

  /* Layered old-radio casing */
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.12),
    inset 0 0 8px rgba(28, 30, 34, 0.18),
    0 2px 0 #111214,
    0 3px 5px rgba(0, 0, 0, 0.22);

  /* Slightly aged panel texture */
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(28, 30, 34, 0.025) 0,
      rgba(28, 30, 34, 0.025) 1px,
      transparent 1px,
      transparent 4px
    );

  transform-origin: center top;
  animation: flapFlip 460ms cubic-bezier(0.2, 0.7, 0.2, 1);

  /* Makes the flap feel like a physical component */
  position: relative;
}

.event-banner__flap:nth-child(2) {
  animation-delay: 70ms;
}

.event-banner__flap:nth-child(3) {
  animation-delay: 130ms;
}

.event-banner__flap:nth-child(4) {
  animation-delay: 190ms;
}
.event-banner__flap-label {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;

  color: #4f2f2b;
  font-weight: 900;

  /* Vintage instrument lettering */
  font-family: "Arial Narrow", "Roboto Condensed", "Trebuchet MS", sans-serif;

  white-space: nowrap;

  /* Slightly aged/printed effect */
  text-shadow:
    0.5px 0.5px 0 #8a7d67,
    0 1px 1px rgba(0, 0, 0, 0.12);

  opacity: 0.92;
}


.event-banner__flap-value {
  font-size: clamp(0.88rem, 1.2vw, 1.15rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  color: #171a1d;

  /* Old automotive instrument typography */
  font-family: "Arial Narrow", "Roboto Condensed", "Trebuchet MS", sans-serif;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* Slightly recessed appearance */
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.25),
    0 1px 1px rgba(0, 0, 0, 0.15);
}


/* Event title */
.event-banner__flap--title .event-banner__flap-value {
  color: #171a1d;

  white-space: normal;
  overflow: visible;
  text-overflow: clip;

  line-height: 1.25;
  overflow-wrap: anywhere;

  text-transform: none;

  font-family: "Trebuchet MS", "Arial Narrow", sans-serif;
}


/* Third flap — preserve wrapping */
.event-banner__flap:nth-child(3) .event-banner__flap-value {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;

  line-height: 1.2;
}



@keyframes statusBlink {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes flapFlip {
  0% {
    transform: rotateX(-88deg);
    opacity: 0.35;
  }
  55% {
    transform: rotateX(14deg);
    opacity: 1;
  }
  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .lang-switcher {
    flex-direction: row;
    align-self: center;
    justify-self: center;
    width: fit-content;
    margin: 0 auto;
    padding: 0.45rem 0.45rem;
    gap: 0.45rem;
  }

  .footer-plate__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .splash-screen-logo {
    width: min(62vw, 170px);
  }

  .lang-switcher {
    flex-direction: row;
    align-self: center;
    justify-self: center;
    width: fit-content;
    margin: 0 auto;
    padding: 0.35rem 0.4rem;
    gap: 0.35rem;
  }

  .event-banner {
    width: 100%;
    padding: 0.72rem;
  }

  .event-banner-section {
    margin-top: 0.55rem;
    margin-bottom: 0.35rem;
  }

  .event-banner__flap-track {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .event-banner__flap-value {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
}

@media (max-width: 420px) {
  .lang-switcher {
    flex-direction: row;
    align-self: center;
    justify-self: center;
    width: fit-content;
    margin: 0 auto;
  }

  .footer-plate__grid {
    grid-template-columns: 1fr;
  }

  .footer-plate {
    padding: 0.95rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-screen {
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }

  .event-banner,
  .event-banner__flap,
  .event-banner__led {
    animation: none;
    transition: none;
  }
}
</style>
