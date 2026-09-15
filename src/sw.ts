/// <reference lib="webworker" />
/**
 * Service Worker：预缓存全部资源（含图片与音频），添加到主屏幕后断网可用。
 * 自己写而不用 generateSW，是为了：
 * - 给预缓存挂上 RangeRequestsPlugin——iOS Safari 取媒体时先发 Range: bytes=0-1，缓存里的完整 200 响应它不认，音频会静默失败；
 * - 自己跑 install：Workbox 自带的 install 是 1700 多个文件一个接一个下（每个都要等一个来回，4G 上要几分钟，
 *   超过 5 分钟还会被 Chrome 杀掉），而且任何一个文件失败整包作废。这里改成几路并发、单个文件失败重试，
 *   并把进度发给页面（家长设置页显示百分比）。
 */
import { cleanupOutdatedCaches, PrecacheController, PrecacheRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { RangeRequestsPlugin } from 'workbox-range-requests'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> }

/** 同时下几个文件：小文件多、受来回延迟而不是带宽限制，多开几路就快几倍；再多对手机没好处 */
const CONCURRENCY = 6
/** 单个文件失败后重试几次、每次等多久（弱网偶发的一次失败不该让整包重来） */
const RETRY_DELAYS_MS = [1000, 3000, 8000]
/** 每下完多少个文件通知页面一次 */
const PROGRESS_EVERY = 25

// 构建时注入的清单只能出现一次（vite-plugin-pwa 的断言），先存下来
const manifest = self.__WB_MANIFEST
const controller = new PrecacheController({ plugins: [new RangeRequestsPlugin()] })
controller.addToCacheList(manifest)
// 入口地址忽略查询串：从微信 / QQ 分享出去的链接会带 ?from=singlemessage 之类的参数，离线重开也要能进
registerRoute(new PrecacheRoute(controller, { ignoreURLParametersMatching: [/.*/] }))
cleanupOutdatedCaches()

/** 有 revision 的（照片 / 音频 / 插画等文件名不带 hash 的）取时绕过 HTTP 缓存，和 Workbox 自己的规则一致 */
const revisioned = new Set<string>()
for (const e of manifest) if (typeof e !== 'string' && e.revision) revisioned.add(e.url)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function notify(done: number, total: number) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  for (const c of clients) c.postMessage({ type: 'precache-progress', done, total })
}

/** 取一个文件进预缓存（已在缓存里的 Workbox 会直接跳过），失败按 RETRY_DELAYS_MS 重试 */
async function cacheOne(url: string, cacheKey: string, event: ExtendableEvent) {
  for (let attempt = 0; ; attempt++) {
    try {
      const request = new Request(url, { cache: revisioned.has(url) ? 'reload' : 'default', credentials: 'same-origin' })
      await Promise.all(controller.strategy.handleAll({ params: { cacheKey }, request, event }))
      return
    } catch (err) {
      if (attempt >= RETRY_DELAYS_MS.length) throw err
      await sleep(RETRY_DELAYS_MS[attempt])
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const entries = [...controller.getURLsToCacheKeys()]
      const total = entries.length
      let next = 0
      let done = 0
      const worker = async () => {
        while (next < entries.length) {
          const [url, cacheKey] = entries[next++]
          await cacheOne(url, cacheKey, event)
          done++
          if (done % PROGRESS_EVERY === 0) void notify(done, total)
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
      void notify(total, total)
    })(),
  )
})
self.addEventListener('activate', (event) => {
  event.waitUntil(controller.activate(event))
})

// 新版本装好后不自动接管：主线程在回到首页、没在朗读时发 SKIP_WAITING 再切换并刷新（见 main.ts）
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})
clientsClaim()
