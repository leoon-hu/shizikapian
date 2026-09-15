import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CardsView from '@/views/CardsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import QuizView from '@/views/QuizView.vue'

// hash 路由：静态托管、子目录都能用。
// 三个页面都静态导入、不拆 chunk：整站本来就全进预缓存，多的只是首屏 5 KB gzip；
// 拆开的话离线包还没装完时断网点分类，动态 import 一失败就被浏览器记住，这一页再也进不去分类，
// 而且首次运行点方砖要先等 chunk 才切页、才出声
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/c/:categoryId', name: 'cards', component: CardsView },
    { path: '/q/:categoryId', name: 'quiz', component: QuizView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
