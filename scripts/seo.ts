/**
 * SEO 静态文件：应用本身是 hash 路由的单页，搜索引擎只能看到根页面，而 #app 在脚本跑起来之前只有一段启动页文字。
 * 这个脚本在构建 / 起 dev 之前（package.json 的 prebuild / predev）往 public/ 写：
 *   cards.html   不用 JS 的静态页——17 个分类、全部卡片的词与例句、插画（带 alt），搜索引擎与不跑 JS 的爬虫（百度）
 *                在这一页能读到全部内容，页面上再链回应用；进离线包（glob 会扫到 html）
 *   robots.txt   允许全部；设了站点地址就带 Sitemap 一行
 *   sitemap.xml  只在设了站点地址时生成（sitemap 需要绝对地址）
 * 站点地址来自 .env 的 VITE_SITE_URL（不进仓库，不带末尾斜杠，如 https://example.com/shizikapian）；
 * index.html 里 canonical / og:image 这类绝对地址由 vite.config.ts 的小插件按同一个变量注入。
 * 三个产物都不进仓库（.gitignore），每次构建重新生成。
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { categories } from '../src/content/categories'
import { AUTHOR_CONTACT, OPEN_CLAIM, REPO_URL, SISTER_SITES } from '../src/sites'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const publicDir = join(root, 'public')

const NAME = '识字卡片'
const TAGLINE = '看图、听音、学说话'
const DESCRIPTION =
  '给 2–4 岁幼儿的看图听音认知卡片：17 个分类、256 张卡，每张有真实照片、插画、中文 / 英文词和一句例句，点一下就朗读；纯离线、不联网、不注册、没有广告，可添加到手机 / iPad 主屏幕。'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const total = categories.reduce((n, c) => n + c.cards.length, 0)

/** 头部里需要绝对地址的标签 */
function absoluteTags(siteUrl: string, path: string, image: string) {
  const url = `${siteUrl}/${path}`.replace(/\/$/, '/')
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${siteUrl}/${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:image" content="${siteUrl}/${image}" />`,
  ].join('\n    ')
}

function cardsPage(siteUrl: string | undefined): string {
  const nav = categories
    .map((c) => `<a href="#${c.id}"><img src="images/cat-${c.id}.svg" alt="" width="28" height="28" /> ${esc(c.name.zh)}</a>`)
    .join('\n      ')
  const sections = categories
    .map(
      (c) => `
    <section id="${c.id}" style="--cat: ${c.color}">
      <h2><img src="images/cat-${c.id}.svg" alt="" width="44" height="44" /> ${esc(c.name.zh)} <span lang="en">${esc(c.name.en)}</span> <small>${c.cards.length} 张</small></h2>
      <ul>
        ${c.cards
          .map(
            (k) => `<li>
          <img src="images/${k.id}.svg" alt="${esc(k.zh)} ${esc(k.en)}" width="72" height="72" loading="lazy" />
          <div><b>${esc(k.zh)}</b> <span lang="en">${esc(k.en)}</span><p>${esc(k.sentence.zh)} <span lang="en">${esc(k.sentence.en)}</span></p></div>
        </li>`,
          )
          .join('\n        ')}
      </ul>
    </section>`,
    )
    .join('\n')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${NAME} · 全部卡片清单`,
    description: DESCRIPTION,
    inLanguage: ['zh-CN', 'en'],
    isPartOf: { '@type': 'WebApplication', name: NAME, ...(siteUrl ? { url: `${siteUrl}/` } : {}) },
    hasPart: categories.map((c) => ({ '@type': 'ItemList', name: c.name.zh, numberOfItems: c.cards.length, itemListElement: c.cards.map((k, i) => ({ '@type': 'ListItem', position: i + 1, name: `${k.zh} ${k.en}` })) })),
  }
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${NAME} · 全部 ${total} 张卡片清单（${categories.length} 个分类，中英文词与例句）</title>
    <meta name="description" content="${esc(NAME)}收录的全部卡片：${categories.map((c) => c.name.zh).join('、')}，每张卡的中文 / 英文词与例句。${esc(DESCRIPTION)}" />
    <meta name="robots" content="index, follow" />
    <meta name="color-scheme" content="only light" />
    <meta name="theme-color" content="#fff8ec" />
    <link rel="icon" href="icons/icon-192.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${NAME}" />
    <meta property="og:title" content="${NAME} · 全部卡片清单" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:locale" content="zh_CN" />
    <meta name="twitter:card" content="summary_large_image" />
    ${siteUrl ? absoluteTags(siteUrl, 'cards.html', 'icons/og.png') : ''}
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0 16px 48px; background: #fff8ec; color: #3d2c1e; font: 16px/1.5 ui-rounded, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif; }
      header, main { max-width: 960px; margin: 0 auto; }
      header { padding: 28px 0 8px; }
      h1 { font-size: 28px; margin: 0 0 6px; }
      header p { margin: 0 0 12px; color: #716254; }
      .app { display: inline-block; padding: 12px 22px; border-radius: 999px; background: #ef6c00; color: #fff; font-weight: 700; text-decoration: none; }
      nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 8px; }
      nav a { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px 6px 8px; border-radius: 999px; background: #fff; color: #3d2c1e; text-decoration: none; font-weight: 600; box-shadow: 0 2px 8px rgba(61, 44, 30, 0.08); }
      section { margin-top: 28px; padding: 16px; border-radius: 24px; background: color-mix(in srgb, var(--cat) 22%, #fff8ec); }
      h2 { display: flex; align-items: center; gap: 10px; font-size: 22px; margin: 0 0 12px; }
      h2 span { font-weight: 600; opacity: 0.7; }
      h2 small { margin-left: auto; font-size: 14px; color: #716254; font-weight: 600; }
      ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
      li { display: flex; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 16px; background: rgba(255, 255, 255, 0.85); }
      li img { flex: none; width: 72px; height: 72px; }
      li b { font-size: 20px; }
      li span[lang] { font-weight: 600; opacity: 0.75; }
      li p { margin: 4px 0 0; font-size: 14px; color: #716254; }
      footer { max-width: 960px; margin: 32px auto 0; font-size: 13px; color: #716254; }
      footer a { color: inherit; }
      footer p { margin: 0 0 6px; }
      footer summary { cursor: pointer; font-weight: 600; }
      footer .contact img { display: block; max-width: 100%; height: auto; margin-top: 8px; border-radius: 12px; background: #fff; }
    </style>
  </head>
  <body>
    <header>
      <h1>${NAME} · 全部卡片清单</h1>
      <p>${esc(TAGLINE)}。${esc(DESCRIPTION)}</p>
      <a class="app" href="./">打开${NAME}</a>
      <nav>
      ${nav}
      </nav>
    </header>
    <main>${sections}
    </main>
    <footer>
      <p>插画来自 <a href="https://github.com/jdecked/twemoji">Twemoji</a>（CC BY 4.0）；应用里的照片来自 Wikimedia Commons，出处见应用内「家长设置 → 素材来源」。</p>
      <p>${esc(OPEN_CLAIM)}<a href="${REPO_URL}">GitHub 源码</a></p>
      <p>更多应用：${SISTER_SITES.map((s) => `<a href="${s.url}">${esc(s.name)}</a>（${esc(s.desc)}）`).join('、')}</p>
      <details class="contact"><summary>${esc(AUTHOR_CONTACT.label)}</summary><p>${esc(AUTHOR_CONTACT.hint)}</p><img src="./${AUTHOR_CONTACT.qr}" alt="站长微信二维码" width="200" height="274" loading="lazy" /></details>
    </footer>
  </body>
</html>
`
}

const siteUrl = loadEnv(process.env.NODE_ENV ?? 'production', root, 'VITE_').VITE_SITE_URL?.replace(/\/+$/, '') || undefined
mkdirSync(publicDir, { recursive: true })
writeFileSync(join(publicDir, 'cards.html'), cardsPage(siteUrl))
writeFileSync(join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`)
if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = [`${siteUrl}/`, `${siteUrl}/cards.html`]
  writeFileSync(
    join(publicDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`,
  )
} else {
  rmSync(join(publicDir, 'sitemap.xml'), { force: true })
}
console.log(`cards.html（${total} 张）、robots.txt${siteUrl ? '、sitemap.xml' : ''} → public/${siteUrl ? `，站点 ${siteUrl}` : '（没设 VITE_SITE_URL，不生成 sitemap 与绝对地址）'}`)
