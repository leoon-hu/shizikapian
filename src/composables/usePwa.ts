import { ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { INSTALL_HINT_FOREVER, INSTALL_HINT_SNOOZE_MS } from '@/composables/installHint'

/** Chrome / Edge 的安装事件：lib.dom 里没有类型，只声明用到的两个成员 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * 模块级单例：安装与离线状态，给首页的安装提示条（C5）与家长设置页的「离线与安装」一行用。
 * 写入方在 main.ts（注册 SW 的回调、SW 发来的进度、beforeinstallprompt / appinstalled），这里只放状态与 install()。
 */

/**
 * 离线包（全部图片与发音）的状态：
 * unsupported = 这个浏览器存不了（没有 Service Worker：微信内置浏览器、无痕模式、file://）；
 * installing = 正在下载；ready = 已进缓存，断网也能用；failed = 下载中断且重试用完（连上网后重新打开会接着下）
 */
const offlineState = ref<'unsupported' | 'installing' | 'ready' | 'failed'>(
  typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol !== 'file:' ? 'installing' : 'unsupported',
)
/** 下载进度（SW 每下完一批就发一次），没收到过为 null */
const progress = ref<{ done: number; total: number } | null>(null)
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
 * 启动时的兜底：SW 早就装好了的话这次不会再触发 onOfflineReady，
 * 有控制中的 SW 且 workbox 的预缓存桶已存在就当离线包就绪（SW 只在全部装完后才接管，所以桶在 = 全在）
 */
async function detectCached() {
  try {
    if (!navigator.serviceWorker?.controller || typeof caches === 'undefined') return
    const keys = await caches.keys()
    if (keys.some((k) => k.startsWith('workbox-precache'))) offlineState.value = 'ready'
  } catch {
    /* file:// 或隐私模式下 caches 不可用 */
  }
}
if (typeof navigator !== 'undefined') void detectCached()

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
  return { offlineState, progress, installPrompt, isStandalone, isIOS, isIPad, isIOSSafari, isInApp, isTouch, install }
}
