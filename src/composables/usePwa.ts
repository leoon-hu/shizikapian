import { computed, ref } from 'vue'
import type { MediaProgress } from '@/composables/offline'
import { useSettings } from '@/composables/useSettings'
import { INSTALL_HINT_FOREVER, INSTALL_HINT_SNOOZE_MS } from '@/composables/installHint'

/** Chrome / Edge 的安装事件：lib.dom 里没有类型，只声明用到的两个成员 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * 模块级单例：安装与离线状态，给首页的安装提示条（C5）与家长设置页的「离线与安装」一行用。
 * 写入方：main.ts（注册 SW 的回调、beforeinstallprompt / appinstalled）、useOffline.ts（图片和发音的后台下载），这里只放状态与 install()。
 */

/**
 * Service Worker（页面外壳的离线包）的状态，main.ts 写：unsupported = 这个浏览器存不了（没有 Service Worker：微信内置浏览器、
 * 无痕模式、file://）；installing = 还没装好；ready = 已装好在接管页面；failed = 首次安装失败且重试用完。
 * 已经有 SW 在接管页面的（装过了）一打开就是 ready。
 */
const swSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol !== 'file:'
const swState = ref<'unsupported' | 'installing' | 'ready' | 'failed'>(
  !swSupported ? 'unsupported' : navigator.serviceWorker.controller ? 'ready' : 'installing',
)
/** 图片和发音（离线包的大头）在后台下到哪了，useOffline.ts 写；还没看过为 null */
const media = ref<MediaProgress | null>(null)
/**
 * 离线包整体的状态（设置页 P7 一行、首页版本卡片）：SW 装好 + 图片和发音全部下好才是 ready（断网也能用）；
 * 下载停了（断网 / 连续失败）又没下全是 failed（联网后会接着下）；其余是 installing。
 */
const offlineState = computed<'unsupported' | 'installing' | 'ready' | 'failed'>(() => {
  if (swState.value === 'unsupported' || swState.value === 'failed') return swState.value
  const m = media.value
  const complete = !!m && m.total > 0 && m.cached >= m.total
  if (complete) return swState.value === 'ready' ? 'ready' : 'installing'
  return m?.stopped ? 'failed' : 'installing'
})
/** 下载进度（图片和发音，个数），还没开始为 null */
const progress = computed(() => (media.value && media.value.total > 0 ? { done: media.value.cached, total: media.value.total } : null))
/** Android Chrome 的安装提示事件；用过、装好了或不支持为 null，首页提示条与设置页据此显示 / 隐藏「安装」按钮 */
const installPrompt = ref<Event | null>(null)

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
/** iPadOS 13 起 UA 冒充 Mac，靠触点数认出来；iPad 的 Safari 分享按钮在右上角，指引要分开写 */
const isIPad = /iPad/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isIOS = /iPhone|iPod/.test(ua) || isIPad
/** 微信 / QQ / 微博 / Facebook / Instagram / LINE 内置浏览器：没有 Service Worker、分享菜单里也没有「添加到主屏幕」，只能教家长去浏览器打开 */
const isInApp = /MicroMessenger|\bQQ\/|Weibo|FBAN|FBAV|Instagram|Line\//.test(ua)
/** iOS 上只有 Safari 的分享菜单里有「添加到主屏幕」；Chrome / Edge / Firefox for iOS 与内置浏览器都要先换 Safari */
const isIOSSafari = isIOS && /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPT\/|DuckDuckGo/.test(ua) && !isInApp
/** 主要输入是触屏（手机 / 平板）；电脑浏览器不提示安装 */
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** 已从主屏幕打开（manifest 是 fullscreen，iOS 老版本只认 navigator.standalone） */
const isStandalone =
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true)

/**
 * 家长点「安装」：弹系统安装框，无论装不装事件都只能用一次，用完清掉让按钮消失。
 * 家长在系统框里点了安装就记为已装（C5：永不再提示；main.ts 收到 appinstalled 也会记），拒绝了当关掉（3 天）。
 * 返回家长在系统框里的选择；关掉系统框 / 出错都算 dismissed
 */
async function install(): Promise<'accepted' | 'dismissed'> {
  const e = installPrompt.value as BeforeInstallPromptEvent | null
  installPrompt.value = null
  if (!e) return 'dismissed'
  let outcome: 'accepted' | 'dismissed' = 'dismissed'
  try {
    await e.prompt()
    outcome = (await e.userChoice).outcome
  } catch {
    outcome = 'dismissed'
  }
  const settings = useSettings()
  settings.installHintMutedUntil = outcome === 'accepted' ? INSTALL_HINT_FOREVER : Date.now() + INSTALL_HINT_SNOOZE_MS
  return outcome
}

export function usePwa() {
  return { swState, media, offlineState, progress, installPrompt, isStandalone, isIOS, isIPad, isIOSSafari, isInApp, isTouch, install }
}
