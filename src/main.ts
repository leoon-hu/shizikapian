import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import router from '@/router'
import { useSpeaker } from '@/composables/useSpeaker'
import App from '@/App.vue'
import { usePwa } from '@/composables/usePwa'
import { useSettings } from '@/composables/useSettings'
import { INSTALL_HINT_FOREVER } from '@/composables/installHint'
import { trackBackNavigation } from '@/composables/analytics'
import { setupOffline } from '@/composables/useOffline'
import '@/styles/tokens.css'
import '@/styles/base.css'

// iOS Safari 只有页面上挂了 touchstart 监听，按钮的 :active 才会生效
document.body.addEventListener('touchstart', () => {}, { passive: true })

// 防误触兜底（4.1）：iOS Safari 不理会 viewport 的 user-scalable=no 与 touch-action，
// 孩子两根手指一捏页面就放大了；gesturestart / gesturechange 是 Safari 私有的捏合事件，
// 再加上多指 touchmove 一起拦下。必须 passive: false，否则 preventDefault 无效
const block = (e: Event) => e.preventDefault()
document.addEventListener('gesturestart', block, { passive: false })
document.addEventListener('gesturechange', block, { passive: false })
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault() }, { passive: false })

const pwa = usePwa()
// Android Chrome 的安装提示：先拦下不让浏览器自己弹（时机与文案自己控制），存起来给首页提示条（C5）与设置页的「安装」按钮
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  pwa.installPrompt.value = e
})
// 装好了：事件作废，首页的安装提示条永不再出现（这台浏览器里的存储和装好的应用是同一份）
window.addEventListener('appinstalled', () => {
  pwa.installPrompt.value = null
  useSettings().installHintMutedUntil = INSTALL_HINT_FOREVER
})

createApp(App).use(router).mount('#app')
// 访问统计（需求 4.6）：返回键那一下 tracker 自己不记，这里补；没加统计标签时什么都不做
trackBackNavigation()

// 离线缓存：Service Worker 只预缓存页面外壳（几秒装好），图片和发音由页面在后台下（useOffline.ts，需求 4.3）。
// 新版本装好后不立刻 reload（会打断正在看卡片的孩子），
// 记下来，等回到首页、且没在朗读时再切换——首页本来就是每次打开的起点，刷新对孩子无感（家长在页脚点「检查更新」的除外）
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null
/**
 * 首次安装失败（某个文件重试几次都没下下来、中途断网）时浏览器会把注册整个丢掉，本页再也不会重试，
 * 设置页就一直停在「正在下载」。这里按退避重新注册几次，网络恢复时也立刻再试一次；
 * 已下好的文件 Workbox 会跳过，重试只补缺的。要重新调 registerSW 而不是裸调 register：
 * 旧的 workbox-window 实例听的是已作废的注册，收不到新注册的 installed 事件
 */
const RETRY_DELAYS = [5_000, 20_000, 60_000]
let attempts = 0
let retryTimer: number | undefined
function scheduleRetry() {
  pwa.swState.value = 'failed'
  if (retryTimer !== undefined || attempts >= RETRY_DELAYS.length) return
  retryTimer = window.setTimeout(() => {
    retryTimer = undefined
    attempts++
    startSW()
  }, RETRY_DELAYS[attempts])
}
function startSW() {
  if (pwa.swState.value === 'unsupported') return
  if (pwa.swState.value !== 'ready') pwa.swState.value = 'installing'
  const update = registerSW({
    immediate: true,
    onOfflineReady() {
      pwa.swState.value = 'ready'
    },
    onNeedRefresh() {
      applyUpdate = update
    },
    onRegisteredSW(_url, reg) {
      const sw = reg?.installing
      sw?.addEventListener('statechange', () => {
        // 首次安装失败：installing 变 redundant 且没有 active；更新失败（有 active 在服务）不用管
        if (sw.state === 'redundant' && !reg?.active) scheduleRetry()
      })
    },
    onRegisterError(err: unknown) {
      // 取 sw.js 失败（弱网、服务器 5xx）是 TypeError，值得重试；其它（无痕模式的 SecurityError、协议不对）是环境问题
      if (err instanceof TypeError) scheduleRetry()
      else pwa.swState.value = 'unsupported'
    },
  })
}
startSW()
window.addEventListener('online', () => {
  if (pwa.swState.value !== 'failed') return
  if (retryTimer !== undefined) {
    clearTimeout(retryTimer)
    retryTimer = undefined
  }
  startSW()
})
// SW 接管页面（首次装好 / 新版本换上）：外壳离线可用了
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  pwa.swState.value = 'ready'
})
// 图片和发音在后台下（设置页与首页版本卡片显示进度）
setupOffline()
router.afterEach((to) => {
  if (to.name === 'home' && applyUpdate && document.visibilityState === 'visible' && !useSpeaker().busy.value) {
    const run = applyUpdate
    applyUpdate = null
    void run(true)
  }
})
