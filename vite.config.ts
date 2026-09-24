import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import { loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { analyticsAttrs, analyticsConfig } from './src/composables/analytics'

/**
 * index.html 里需要绝对地址的 SEO 标签（canonical / og:url / og:image）：站点地址来自 .env 的 VITE_SITE_URL（不进仓库），
 * 没设就不注入。静态清单页 cards.html、robots.txt、sitemap.xml 由 scripts/seo.ts 在构建前写进 public/（package.json 的 prebuild）。
 */
function seoHead(siteUrl: string | undefined): Plugin {
  const base = siteUrl?.replace(/\/+$/, '')
  return {
    name: 'shizikapian-seo-head',
    transformIndexHtml(html) {
      if (!base) return html
      return html.replace(
        '<!-- seo:absolute -->',
        [
          `<link rel="canonical" href="${base}/" />`,
          `<meta property="og:url" content="${base}/" />`,
          `<meta property="og:image" content="${base}/icons/og.png" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta name="twitter:image" content="${base}/icons/og.png" />`,
        ].join('\n    '),
      )
    },
  }
}

/**
 * 访问统计标签（需求 4.6，composables/analytics.ts）：.env 里 VITE_UMAMI_SCRIPT / VITE_UMAMI_WEBSITE_ID 都有时，正式构建把
 * 一行 <script defer> 写进 index.html 的 <head>；dev 不加，没配置什么都不加。cards.html 的同一行由 scripts/seo.ts 写。
 */
function analyticsTag(env: Record<string, string>): Plugin {
  const cfg = analyticsConfig(env)
  return {
    name: 'shizikapian-analytics-tag',
    apply: 'build',
    transformIndexHtml: () => (cfg ? [{ tag: 'script', attrs: analyticsAttrs(cfg), injectTo: 'head' }] : []),
  }
}

/**
 * 当前版本（需求 C6「版本与更新」，composables/version.ts）：构建时刻的北京时间「2026-09-23 14:05」（与构建机器的时区无关）。
 * 页面里是 __APP_VERSION__；同一份写进 dist/version.json 给首页页脚的「检查更新」比对（不在 injectManifest 的 globPatterns 里，
 * 不进离线包），dev 服务器也回同一份。
 */
function buildVersion(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]))
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`
}
function versionFile(version: string): Plugin {
  const body = `${JSON.stringify({ version })}\n`
  return {
    name: 'shizikapian-version-file',
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(body)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: body })
    },
  }
}
const VERSION = buildVersion()

export default defineConfig(({ mode }) => ({
  // 相对路径：放到任意静态托管的任意子目录都能用（配合 hash 路由）
  base: './',
  define: { __APP_VERSION__: JSON.stringify(VERSION) },
  plugins: [
    vue(),
    seoHead(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL),
    analyticsTag(loadEnv(mode, process.cwd(), 'VITE_')),
    versionFile(VERSION),
    VitePWA({
      // 自写 src/sw.ts（预缓存 + Range 支持），见该文件注释
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // 新版本不自动 reload：由 main.ts 在回到首页且没在朗读时才切换
      registerType: 'prompt',
      // 预缓存只有页面外壳（代码、图标、清单页、照片出处，几十个文件、几秒装好）：插画 / 照片 / 发音只在页面用到时才取、
      // 取过的存进缓存（src/sw.ts 的媒体路由）；以前全在预缓存里，SW 要全部下完才算装好，「检查更新」「重新安装」都要排队等它
      injectManifest: {
        // credits.json 也进预缓存：设置页的「素材来源」没网也要能打开（CC BY 的署名要在应用里看得到）
        globPatterns: ['**/*.{js,css,html,png,jpg,webmanifest}', 'photos/credits.json'],
        // 分享预览图只给社交平台抓，不进预缓存
        globIgnores: ['icons/og.png'],
      },
      manifest: {
        name: '识字卡片',
        short_name: '识字卡片',
        description: '看图、听音、学说话',
        lang: 'zh-CN',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#fff8ec',
        theme_color: '#fff8ec',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          // maskable 用满底版：Android 圆形遮罩只留中央，透明圆角的那张会被裁掉卡片角（见 scripts/icons.ts）
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
}))
