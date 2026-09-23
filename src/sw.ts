/// <reference lib="webworker" />
/**
 * Service Worker：预缓存页面外壳（代码、图标、清单页、照片出处），图片和发音走下面的媒体路由；添加到主屏幕后断网可用。
 * 自己写而不用 generateSW，是为了：
 * - 给媒体挂上 Range 支持——iOS Safari 取媒体时先发 Range: bytes=0-1，缓存里的完整 200 响应它不认，音频会静默失败；
 * - 自己跑 install：Workbox 自带的 install 是一个接一个下，任何一个文件失败整包作废。这里改成几路并发、单个文件失败重试。
 * 图片和发音（约 22 MB）2026-09-23 起不进预缓存（需求 4.3）：以前全在预缓存里，SW 要全部下完才算装好，要一两分钟，
 * 「检查更新」「重新安装」都要排在它后面等；现在由页面在后台下进缓存 MEDIA_CACHE（composables/offline.ts），
 * 这里缓存优先从它取、没有才走网络并存下。
 */
import { cleanupOutdatedCaches, PrecacheController, PrecacheRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { RangeRequestsPlugin, createPartialResponse } from 'workbox-range-requests'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> }

/** 同时下几个文件：小文件多、受来回延迟而不是带宽限制，多开几路就快几倍；再多对手机没好处 */
const CONCURRENCY = 6
/** 单个文件失败后重试几次、每次等多久（弱网偶发的一次失败不该让整包重来） */
const RETRY_DELAYS_MS = [1000, 3000, 8000]

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
      let next = 0
      const worker = async () => {
        while (next < entries.length) {
          const [url, cacheKey] = entries[next++]
          await cacheOne(url, cacheKey, event)
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    })(),
  )
})
/** 与 composables/offline.ts 的 MEDIA_CACHE 一致 */
const MEDIA_CACHE = 'media'
/** 图片和发音：插画 images/*.svg、照片 photos/*.webp、发音 audio/**.mp3（子路径部署也对，所以不锚开头） */
const MEDIA_RE = /\/(images\/[^/]+\.svg|photos\/[^/]+\.webp|audio\/.+\.mp3)$/

/**
 * 媒体路由：缓存优先。只认同源、不带查询串的地址——页面后台下载时带 ?v=哈希，要绕过这里直接取网络（改过的文件不能被缓存里的旧文件顶上）。
 * 缓存里没有：取整个文件（不带 Range，好存下）存进缓存，再按请求的 Range 切一段回去。
 */
registerRoute(
  ({ url, request, sameOrigin }) => sameOrigin && request.method === 'GET' && !url.search && MEDIA_RE.test(url.pathname),
  async ({ url, request, event }) => {
    const cache = await caches.open(MEDIA_CACHE)
    let res = await cache.match(url.href)
    if (!res) {
      const net = await fetch(url.href, { credentials: 'same-origin' })
      if (net.status !== 200) return net
      ;(event as ExtendableEvent | undefined)?.waitUntil(cache.put(url.href, net.clone()).catch(() => undefined))
      res = net
    }
    return request.headers.has('range') ? createPartialResponse(request, res) : res
  },
)

self.addEventListener('activate', (event) => {
  event.waitUntil(controller.activate(event))
})

// 新版本装好后不自动接管：主线程在回到首页、没在朗读时发 SKIP_WAITING 再切换并刷新（见 main.ts）
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})
clientsClaim()
