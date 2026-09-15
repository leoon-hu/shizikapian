/**
 * 生成 PWA 图标到 public/icons/：橙色底 + 一张白卡片 + 卡片上的小狗（Twemoji）。
 * 两套底：
 *   iconRounded  透明圆角底 → icon-192 / icon-512（manifest 里 purpose any，桌面 Chrome 等按原样显示）
 *   iconFull     无圆角的橙色满底、内容缩到中央约 78% → apple-touch-icon（iOS 自己切圆角，透明角会发黑）
 *                与 icon-512-maskable（Android 圆形 / 方圆遮罩只保留中央安全区，卡片角不会被裁掉）
 * 用法：npm run icons
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const ORANGE = '#ffb74d'

const dog = readFileSync(join(root, 'node_modules', '@twemoji', 'svg', '1f436.svg'), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace(/<svg[^>]*>/, '<svg viewBox="0 0 36 36" x="32" y="26" width="64" height="64">')

/** 卡片 + 小狗，画在 128×128 的画布上，两套底共用 */
const card = `<g transform="rotate(-6 64 64)">
    <rect x="26" y="20" width="76" height="88" rx="10" fill="#fff"/>
    ${dog}
    <rect x="44" y="94" width="40" height="6" rx="3" fill="${ORANGE}"/>
  </g>`

const iconRounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="${ORANGE}"/>
  ${card}
</svg>`

/** 满底：内容缩到 78%，居中；maskable 的安全区是中央 80% 的圆，留一点余量 */
const FULL_SCALE = 0.78
const iconFull = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="${ORANGE}"/>
  <g transform="translate(${(64 * (1 - FULL_SCALE)).toFixed(2)} ${(64 * (1 - FULL_SCALE)).toFixed(2)}) scale(${FULL_SCALE})">
  ${card}
  </g>
</svg>`

/** 分享预览图（og:image，1200×630）：左边图标、右边名字与一句话；文字用系统字体渲染 */
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff8ec"/>
  <g transform="translate(110 135) scale(2.8)">
    <rect width="128" height="128" rx="28" fill="${ORANGE}"/>
    ${card}
  </g>
  <text x="560" y="300" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="112" font-weight="700" fill="#3d2c1e">识字卡片</text>
  <text x="564" y="380" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="44" font-weight="600" fill="#716254">看图 · 听音 · 学说话</text>
  <text x="564" y="450" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="34" fill="#716254">2–4 岁 · 中英文 · 离线 · 免费</text>
</svg>`

const outputs = [
  ['icon-192.png', 192, iconRounded],
  ['icon-512.png', 512, iconRounded],
  ['apple-touch-icon.png', 180, iconFull],
  ['icon-512-maskable.png', 512, iconFull],
  ['og.png', 1200, og],
] as const

for (const [name, size, svg] of outputs) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
  writeFileSync(join(outDir, name), png)
  console.log(`${name} ${size}px`)
}
