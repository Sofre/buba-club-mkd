import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import EventsPage from '../pages/EventsPage.vue'
import EventDetailPage from '../pages/EventDetailPage.vue'
import GalleryPage from '../pages/GalleryPage.vue'
import HeritagePage from '../pages/HeritagePage.vue'
import ArticlesPage from '../pages/ArticlesPage.vue'
import ModelBeetlePage from '../pages/ModelBeetlePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/events', name: 'events', component: EventsPage },
  { path: '/events/:id', name: 'event-detail', component: EventDetailPage },
  { path: '/gallery', name: 'gallery', component: GalleryPage },
  { path: '/heritage', name: 'heritage', component: HeritagePage },
  { path: '/articles', name: 'articles', component: ArticlesPage },
  { path: '/news', redirect: '/articles' },
  {path: '/beetle', name: 'beetle', component: ModelBeetlePage},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
