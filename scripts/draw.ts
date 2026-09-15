/**
 * 没有 emoji 的卡片（颜色 / 形状 / 数字 / 草）的自绘 SVG，按卡片 id 索引。
 * 画布与 Twemoji 一致（viewBox 0 0 36 36），风格：大色块、圆角、无描边细节。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const svg = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">${inner}</svg>\n`

// ---- 颜色：一支大蜡笔。不用圆形色块，孩子会把它和「圆形」那张卡看成同一个东西 ----
const COLORS: Record<string, string> = {
  red: '#e53935',
  'orange-color': '#fb8c00',
  yellow: '#fdd835',
  green: '#43a047',
  blue: '#1e88e5',
  purple: '#8e24aa',
  pink: '#f06292',
  brown: '#8d6e63',
  black: '#212121',
  white: '#ffffff',
  gray: '#9e9e9e',
}

function crayon(fill: string): string {
  const white = fill === '#ffffff'
  const outline = white ? ' stroke="#cfd8dc" stroke-width="1.2"' : ''
  return svg(
    `<g transform="rotate(-20 18 18)">` +
      `<polygon points="18,1.5 24,10.5 12,10.5" fill="${fill}"${outline} stroke-linejoin="round"/>` +
      `<rect x="12" y="10.5" width="12" height="24" rx="2" fill="${fill}"${outline}/>` +
      // 纸套：一圈浅色带，让孩子认出这是蜡笔
      `<rect x="12" y="15" width="12" height="7" fill="${white ? '#eceff1' : '#fff'}" opacity="${white ? 1 : 0.55}"/>` +
      `<rect x="12" y="28" width="12" height="3" fill="${white ? '#eceff1' : '#fff'}" opacity="${white ? 1 : 0.55}"/>` +
      `</g>`,
  )
}

// ---- 形状：每种一个鲜亮的颜色 ----
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

const SHAPES: Record<string, string> = {
  circle: `<circle cx="18" cy="18" r="14" fill="#ff7043"/>`,
  triangle: `<polygon points="18,4 32.5,31 3.5,31" fill="#66bb6a" stroke="#66bb6a" stroke-width="2" stroke-linejoin="round"/>`,
  square: `<rect x="5" y="5" width="26" height="26" rx="2" fill="#42a5f5"/>`,
  rectangle: `<rect x="2" y="10" width="32" height="16" rx="2" fill="#ab47bc"/>`,
  'star-shape': `<polygon points="${starPoints(18, 19, 15, 6.5)}" fill="#ffca28" stroke="#ffca28" stroke-width="1.5" stroke-linejoin="round"/>`,
  heart: `<path d="M18 32 C10 25 3 20 3 12.5 C3 8 6.5 4.5 11 4.5 C14 4.5 16.5 6 18 8.5 C19.5 6 22 4.5 25 4.5 C29.5 4.5 33 8 33 12.5 C33 20 26 25 18 32 Z" fill="#ef5350"/>`,
  crescent:
    `<defs><mask id="m"><rect width="36" height="36" fill="#fff"/><circle cx="24" cy="15" r="12" fill="#000"/></mask></defs>` +
    `<circle cx="18" cy="18" r="15" fill="#ffd54f" mask="url(#m)"/>`,
  oval: `<ellipse cx="18" cy="18" rx="15.5" ry="10" fill="#26c6da"/>`,
  // 竖着的菱形（宽 22 高 33）：接近正方形的会被认成转了 45° 的「正方形」
  diamond: `<polygon points="18,1.5 29,18 18,34.5 7,18" fill="#ec407a" stroke="#ec407a" stroke-width="2" stroke-linejoin="round"/>`,
  semicircle: `<path d="M3 25 A15 15 0 0 1 33 25 Z" fill="#9ccc65"/>`,
  hexagon: `<polygon points="18,3 31,10.5 31,25.5 18,33 5,25.5 5,10.5" fill="#ffa726" stroke="#ffa726" stroke-width="2" stroke-linejoin="round"/>`,
}

// ---- 数字：上面一个大数字，下面同样数量的苹果（数实物比数圆点直观，一行最多 5 个） ----
const NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
}
const NUMBER_COLORS = ['#ef5350', '#fb8c00', '#f9a825', '#66bb6a', '#42a5f5', '#ab47bc', '#26c6da', '#ff7043', '#8d6e63', '#ec407a']

const root = dirname(dirname(fileURLToPath(import.meta.url)))
/** Twemoji 🍎 的内容（去掉外层 <svg>），嵌进数字卡里当计数用的实物 */
const APPLE = readFileSync(join(root, 'node_modules', '@twemoji', 'svg', '1f34e.svg'), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')

function numberCard(n: number): string {
  const color = NUMBER_COLORS[(n - 1) % NUMBER_COLORS.length]
  const rows = n <= 5 ? 1 : 2
  const size = 6.4 // 每个苹果占 6.4 单位
  const apples: string[] = []
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 5)
    const inRow = Math.min(5, n - row * 5)
    const col = i % 5
    const x = 18 + (col - (inRow - 1) / 2) * (size + 0.6) - size / 2
    const y = rows === 1 ? 24 : 20.5 + row * (size + 0.6)
    apples.push(`<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(size / 36).toFixed(4)})">${APPLE}</g>`)
  }
  return svg(
    `<text x="18" y="${rows === 1 ? 19 : 17}" text-anchor="middle" font-family="ui-rounded, 'PingFang SC', system-ui, sans-serif" font-weight="700" font-size="${rows === 1 ? 20 : 17}" fill="${color}">${n}</text>` +
      apples.join(''),
  )
}

// ---- 草：一片地面 + 几根高矮不一的草叶（🌱 画的是幼苗，孩子认不出是草） ----
const GRASS = svg(
  `<path d="M2 33 Q18 29 34 33 L34 36 L2 36 Z" fill="#8bc34a"/>` +
    [
      [6, 22, '#43a047'], [10, 14, '#66bb6a'], [14, 19, '#43a047'], [18, 9, '#66bb6a'],
      [22, 17, '#43a047'], [26, 12, '#66bb6a'], [30, 21, '#43a047'],
    ]
      .map(([x, top, c]) => `<path d="M${x} 33 Q${(x as number) + 1.5} ${(top as number) + 8} ${(x as number) + 2.5} ${top}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`)
      .join(''),
)

/** 卡片 id → SVG 文本；不认识的 id 返回 undefined */
export function drawCard(id: string): string | undefined {
  if (id in COLORS) return crayon(COLORS[id])
  if (id in SHAPES) return svg(SHAPES[id])
  if (id in NUMBERS) return numberCard(NUMBERS[id])
  if (id === 'grass') return GRASS
  return undefined
}
