/// <reference lib="webworker" />
/**
 * Service Worker：预缓存页面外壳（代码、图标、清单页、照片出处），图片和发音走下面的媒体路由。
 * 自己写而不用 generateSW，是为了：
 * - 给媒体挂上 Range 支持——iOS Safari 取媒体时先发 Range: bytes=0-1，缓存里的完整 200 响应它不认，音频会静默失败；
 * - 自己跑 install：Workbox 自带的 install 是一个接一个下，任何一个文件失败整包作废。这里改成几路并发、单个文件失败重试。
 * 图片和发音不进预缓存、也不在后台成批下载（需求 4.3，2026-09-24 起：以后素材还会多很多，不保证离线）：
 * 页面用到哪个才取哪个，取过的存进缓存 MEDIA_CACHE，下次先用缓存、再在后台按 HTTP 缓存规则更新一次。
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
/** 图片和发音的缓存名（老版本页面在后台下载时用的也是它，已经下好的接着用） */
const MEDIA_CACHE = 'media'
/** 图片和发音：插画 images/*.svg、照片 photos/*.webp、发音 audio/**.mp3（子路径部署也对，所以不锚开头） */
const MEDIA_RE = /\/(images\/[^/]+\.svg|photos\/[^/]+\.webp|audio\/.+\.mp3)$/
/** 这个 SW 生命周期里已经在后台重新取过的地址：<audio> 一次播放会发好几个 Range 请求，只取一次 */
const refreshed = new Set<string>()

/**
 * 媒体路由（stale-while-revalidate）：只认同源、不带查询串的地址。
 * - 缓存里有：先回缓存（快、没网也能回），同时在后台取一次整个文件更新缓存——文件名不带内容哈希，素材改过（换照片、
 *   重录发音）要靠这一步换上；后台这次走浏览器的 HTTP 缓存（素材的缓存时间由服务器的响应头定），不会每次都真的去服务器；
 * - 缓存里没有：取整个文件（不带 Range，好存下）存进缓存。
 * 带 Range 的请求都从完整文件里切一段回 206。
 */
registerRoute(
  ({ url, request, sameOrigin }) => sameOrigin && request.method === 'GET' && !url.search && MEDIA_RE.test(url.pathname),
  async ({ url, request, event }) => {
    const cache = await caches.open(MEDIA_CACHE)
    const ext = event as ExtendableEvent | undefined
    let res = await cache.match(url.href)
    if (res) {
      if (!refreshed.has(url.href)) {
        refreshed.add(url.href)
        const refresh = fetch(url.href, { credentials: 'same-origin' })
          .then((net) => (net.status === 200 ? cache.put(url.href, net) : undefined))
          .catch(() => void refreshed.delete(url.href))
        ext?.waitUntil(refresh)
      }
    } else {
      const net = await fetch(url.href, { credentials: 'same-origin' })
      if (net.status !== 200) return net
      refreshed.add(url.href)
      ext?.waitUntil(cache.put(url.href, net.clone()).catch(() => undefined))
      res = net
    }
    return request.headers.has('range') ? createPartialResponse(request, res) : res
  },
)

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      controller.activate(event),
      // 老版本页面在后台成批下载时记「下好了哪些」的那一条，现在用不上了
      caches
        .open(MEDIA_CACHE)
        .then((c) => c.delete(new URL('media-revs.json', self.registration.scope).href))
        .catch(() => false),
    ]),
  )
})

// 新版本装好后不自动接管：主线程在回到首页、没在朗读时发 SKIP_WAITING 再切换并刷新（见 main.ts）
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})
clientsClaim()
