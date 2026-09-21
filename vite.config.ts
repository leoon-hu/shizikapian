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

export default defineConfig(({ mode }) => ({
  // 相对路径：放到任意静态托管的任意子目录都能用（配合 hash 路由）
  base: './',
  plugins: [
    vue(),
    seoHead(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL),
    analyticsTag(loadEnv(mode, process.cwd(), 'VITE_')),
    VitePWA({
      // 自写 src/sw.ts（预缓存 + Range 支持），见该文件注释
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // 新版本不自动 reload：由 main.ts 在回到首页且没在朗读时才切换
      registerType: 'prompt',
      injectManifest: {
        // credits.json 也进离线包：设置页的「素材来源」离线也要能打开（CC BY 的署名要在应用里看得到）
        globPatterns: ['**/*.{js,css,html,svg,mp3,png,jpg,webp,webmanifest}', 'photos/credits.json'],
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
