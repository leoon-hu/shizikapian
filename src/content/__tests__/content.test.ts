import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { categories } from '../categories'
import { promptIds, prompts } from '../prompts'

const publicDir = join(__dirname, '..', '..', '..', 'public')
const allCards = categories.flatMap((c) => c.cards)
const targets = [...categories.map((c) => `cat-${c.id}`), ...allCards.map((c) => c.id)]

describe('内容数据', () => {
  it('分类与卡片 id 全局唯一', () => {
    const ids = [...categories.map((c) => `cat-${c.id}`), ...allCards.map((c) => c.id)]
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(dup).toEqual([])
  })

  it('id 只用小写字母、数字与连字符（要做文件名）', () => {
    for (const id of [...categories.map((c) => c.id), ...allCards.map((c) => c.id)]) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('每个分类 8–20 张卡片', () => {
    for (const cat of categories) {
      expect(cat.cards.length, cat.id).toBeGreaterThanOrEqual(8)
      expect(cat.cards.length, cat.id).toBeLessThanOrEqual(20)
    }
  })

  it('中文词 1–4 个汉字，英文词小写（N4 / N5）', () => {
    for (const card of allCards) {
      expect(card.zh, card.id).toMatch(/^[一-鿿]{1,4}$/)
      expect(card.en, card.id).toMatch(/^[a-z]+( [a-z]+)*$/)
      if (card.say?.zh) {
        // 同音字替换，或载体句 '一只[青蛙]'（括号里必须就是这个词）
        expect(card.say.zh, card.id).toMatch(/^[一-鿿]+$|^[一-鿿，]*\[[一-鿿]+\][一-鿿，。！？]*$/)
        const m = card.say.zh.match(/\[(.+)\]/)
        if (m) expect(m[1], card.id).toBe(card.zh)
      }
    }
    for (const cat of categories) {
      expect(cat.name.zh, cat.id).toMatch(/^[一-鿿]{1,4}$/)
      expect(cat.name.en, cat.id).toMatch(/^[a-z]+( [a-z]+)*$/)
    }
  })

  it('每张卡有中英文例句：以句号 / 问号 / 感叹号结尾，中文 ≤ 12 字、英文 ≤ 8 个词（N8）', () => {
    for (const card of allCards) {
      expect(card.sentence.zh, card.id).toMatch(/^[\u4e00-\u9fff，、]{1,12}[。！？]$/)
      expect(card.sentence.en, card.id).toMatch(/^[A-Z][A-Za-z' ,-]*[.!?]$/)
      expect(card.sentence.en.split(' ').length, card.id).toBeLessThanOrEqual(8)
    }
  })

  it('分类主色是十六进制颜色', () => {
    for (const cat of categories) expect(cat.color, cat.id).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('资源文件（npm run images / npm run audio 生成）', () => {
  it('每张卡片与每个分类都有 SVG 图片', () => {
    const bad = targets.filter((id) => {
      const file = join(publicDir, 'images', `${id}.svg`)
      return !existsSync(file) || !readFileSync(file, 'utf8').trimStart().startsWith('<svg')
    })
    expect(bad).toEqual([])
  })

  const isMp3 = (file: string, maxBytes: number) => {
    if (!existsSync(file)) return false
    const buf = readFileSync(file)
    const sync = buf.length > 4 && ((buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) || buf.subarray(0, 3).toString() === 'ID3')
    return sync && buf.length >= 2000 && buf.length <= maxBytes
  }

  it('每张卡片与每个分类都有中文、英文发音，且是完整的 MP3（有帧同步头、大小合理）', () => {
    // 裁过静音的单词段在 2–20KB 之间；超出说明裁切或合成出了问题
    const bad = targets.flatMap((id) =>
      (['zh', 'en'] as const).filter((lang) => !isMp3(join(publicDir, 'audio', lang, `${id}.mp3`), 20_000)).map((lang) => `${lang}/${id}`),
    )
    expect(bad).toEqual([])
  })

  it('小测验的每句提示语都有中文、英文发音（T7）', () => {
    const bad = promptIds.flatMap((id) =>
      (['zh', 'en'] as const).filter((lang) => !isMp3(join(publicDir, 'audio', lang, `q-${id}.mp3`), 30_000)).map((lang) => `${lang}/q-${id}`),
    )
    expect(bad).toEqual([])
  })

  it('每张卡片都有中文、英文例句发音', () => {
    const bad = allCards.flatMap((card) =>
      (['zh', 'en'] as const)
        .filter((lang) => !isMp3(join(publicDir, 'audio', lang, 'sentences', `${card.id}.mp3`), 60_000))
        .map((lang) => `${lang}/sentences/${card.id}`),
    )
    expect(bad).toEqual([])
  })

  it('照片：photos.json 里的每张卡都存在、文件都在，出处齐全；分类 photos:false 的卡没有照片', () => {
    const counts = JSON.parse(readFileSync(join(__dirname, '..', 'photos.json'), 'utf8')) as Record<string, number>
    const credits = JSON.parse(readFileSync(join(publicDir, 'photos', 'credits.json'), 'utf8')) as Record<string, { file: string; license: string; artist: string; page: string }[]>
    const byId = new Map(allCards.map((c) => [c.id, c]))
    const noPhotoIds = new Set(categories.filter((c) => c.photos === false).flatMap((c) => c.cards.map((x) => x.id)))
    const problems: string[] = []
    for (const [id, n] of Object.entries(counts)) {
      if (!byId.has(id)) problems.push(`${id}：卡片已不存在`)
      if (noPhotoIds.has(id)) problems.push(`${id}：这个分类不配照片`)
      if (n < 1 || n > 2) problems.push(`${id}：数量 ${n}`)
      for (let i = 1; i <= n; i++) if (!existsSync(join(publicDir, 'photos', `${id}-${i}.webp`))) problems.push(`${id}-${i}.webp 不存在`)
      const cr = credits[id] ?? []
      if (cr.length !== n) problems.push(`${id}：出处 ${cr.length} 条，照片 ${n} 张`)
      for (const c of cr) if (!c.file || !c.license || !c.artist || !c.page) problems.push(`${id}：出处不全`)
    }
    expect(problems).toEqual([])
  })

  it('音频清单与内容一致：改了词没重跑 npm run audio 会在这里报出来', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'audio', 'manifest.json'), 'utf8')) as Record<string, { text: string }>
    const stale: string[] = []
    const check = (key: string, text: string) => {
      const entry = manifest[key]
      if (!entry) stale.push(`${key}：清单里没有`)
      else if (entry.text !== text) stale.push(`${key}：清单是「${entry.text}」，内容是「${text}」`)
    }
    for (const id of promptIds) {
      check(`zh/q-${id}`, prompts[id].zh)
      check(`en/q-${id}`, prompts[id].en)
    }
    for (const cat of categories) {
      check(`zh/cat-${cat.id}`, cat.say?.zh ?? cat.name.zh)
      check(`en/cat-${cat.id}`, cat.say?.en ?? cat.name.en)
      for (const card of cat.cards) {
        check(`zh/${card.id}`, card.say?.zh ?? card.zh)
        check(`en/${card.id}`, card.say?.en ?? card.en)
        check(`zh/sentences/${card.id}`, card.sentence.zh)
        check(`en/sentences/${card.id}`, card.sentence.en)
      }
    }
    expect(stale).toEqual([])
    const wanted = new Set([
      ...promptIds.flatMap((id) => [`zh/q-${id}`, `en/q-${id}`]),
      ...targets.flatMap((id) => [`zh/${id}`, `en/${id}`]),
      ...allCards.flatMap((c) => [`zh/sentences/${c.id}`, `en/sentences/${c.id}`]),
    ])
    expect(Object.keys(manifest).filter((k) => !wanted.has(k))).toEqual([])
  })
})
