import { usePwa } from '@/composables/usePwa'
import { mediaStatus, prefetchMedia, saveData } from '@/composables/offline'

/**
 * 后台下离线包里的图片和发音（composables/offline.ts，需求 4.3 / P7）：页面打开后等一会儿开始（让首页和第一个分类先走），
 * 断网 / 失败停下，联网或回到前台接着下；没下全的一轮过一分钟再补一次。只有一份在跑，进度写进 usePwa().media。
 * 没有 Service Worker 的打开方式（微信内置浏览器、无痕、file://）下了也用不上，不下；省流量模式不主动下。
 */

/** 页面打开后等这么久才开始 */
export const START_DELAY_MS = 4000
/** 这一轮没下全（个别文件失败）过这么久再补 */
export const RETRY_MS = 60_000

let running = false
let timer: ReturnType<typeof setTimeout> | null = null

async function run(): Promise<void> {
  const pwa = usePwa()
  if (running || saveData()) return
  running = true
  try {
    pwa.media.value = await prefetchMedia(undefined, { onProgress: (p) => (pwa.media.value = p) })
  } finally {
    running = false
  }
  const p = pwa.media.value
  if (p && !p.stopped && p.total > 0 && p.cached < p.total) schedule(RETRY_MS)
}

function schedule(delay: number): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void run()
  }, delay)
}

/** main.ts 启动时调一次 */
export function setupOffline(): void {
  const pwa = usePwa()
  if (pwa.swState.value === 'unsupported' || typeof caches === 'undefined') return
  // 先不联网看一眼上一轮下到哪了（断网打开时也显示得对），再等一会儿开始补
  void mediaStatus().then((p) => {
    if (p && !pwa.media.value) pwa.media.value = p
  })
  schedule(START_DELAY_MS)
  window.addEventListener('online', () => schedule(1000))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && pwa.media.value?.stopped) schedule(1000)
  })
}
