/**
 * 生成 public/images/：
 *   - 有 emoji 的卡片与全部分类图标：从 @twemoji/svg（Twemoji，图形 CC-BY 4.0）拷出对应 SVG
 *   - 没有 emoji 的卡片：用 draw.ts 自绘
 * 已存在的文件会覆盖（图片就是由数据决定的，不手改）。用法：npm run images
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { categories } from '../src/content/categories'
import { drawCard } from './draw'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'public', 'images')
const twemojiDir = join(root, 'node_modules', '@twemoji', 'svg')
mkdirSync(outDir, { recursive: true })

/** emoji → Twemoji 文件名：码点小写十六进制用 - 连接；带 fe0f 的文件多数不带 fe0f，两种都试 */
function twemojiFile(emoji: string): string | undefined {
  const points = Array.from(emoji).map((ch) => ch.codePointAt(0)!.toString(16))
  const candidates = [points.join('-'), points.filter((p) => p !== 'fe0f').join('-')]
  for (const name of candidates) {
    const file = join(twemojiDir, `${name}.svg`)
    if (existsSync(file)) return file
  }
  return undefined
}

let ok = 0
const missing: string[] = []

function emit(id: string, emoji: string | undefined) {
  const target = join(outDir, `${id}.svg`)
  if (emoji) {
    const src = twemojiFile(emoji)
    if (!src) { missing.push(`${id} ${emoji}（Twemoji 里没有）`); return }
    copyFileSync(src, target)
  } else {
    const body = drawCard(id)
    if (!body) { missing.push(`${id}（没有 emoji，draw.ts 也不认识）`); return }
    writeFileSync(target, body)
  }
  ok++
}

for (const cat of categories) {
  emit(`cat-${cat.id}`, cat.emoji)
  for (const card of cat.cards) emit(card.id, card.emoji)
}

console.log(`生成 ${ok} 张图片 → public/images/`)
if (missing.length) {
  console.error(`缺 ${missing.length} 张：\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
