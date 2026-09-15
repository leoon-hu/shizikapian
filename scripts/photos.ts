/**
 * 给卡片配真实照片（K1）：来源是 Wikimedia Commons（维基共享资源），只收 CC0 / 公有领域 / CC BY / CC BY-SA 的图，
 * 出处与作者记进 public/photos/credits.json（NOTICE.md 指向它）。零成本、不用 Key。
 *
 * 每张卡最多 2 张，照片要和例句对得上（「小狗汪汪叫」配一张狗在叫的照片）：
 *   - 卡片写了 photos: [...]（Commons 文件名）就用手选的；photos: [] 或分类 photos: false 表示不配
 *   - 没写的自动挑：第一张是「例句的场景」，第二张是「这个东西本身」，两张都得过「许可 / 是照片 / 够大 / 不是地图图表」：
 *       场景：用卡片的 scene（和例句对应的英文场景短语）在 Commons 精选图（Quality images）里搜，再全站搜（只要 ≥ 1000px 的）
 *       名词：Wikidata 条目的代表图（P18）→ 英文维基条目首图 → 中文维基条目首图 → 精选图搜英文词
 *     一边找不到就用另一边补；同一组连拍（文件名前缀相同）只取一张
 * 产物：public/photos/<id>-1.webp、-2.webp（480×360，居中裁），src/content/photos.json（每张卡几张，运行时用），
 *       public/photos/credits.json（出处）。已挑过且卡片没改手选的不再查网，--force 全部重来。
 *
 * 用法：npm run photos [-- --only dog] [-- --force]
 *       npm run photos -- --candidates dog,cat   列出候选（含被过滤掉的原因），缩略图放到 .photos-review/
 *       npm run photos -- --search "puppy barking" [--out dog]   按任意短语搜 Commons，结果拼成 .photos-review/search-<out>.png 供手选
 *       npm run photos -- --preview             把现有照片转成 JPEG 到 .photos-review/jpg/，给看不了 WebP 的工具用
 *       npm run photos -- --sheet                把现有照片拼成审片图 .photos-review/sheet-N.png，肉眼过一遍
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { Resvg } from '@resvg/resvg-js'
import { categories } from '../src/content/categories'
import type { Card } from '../src/content/types'

const UA = 'shizikapian-photos/0.1 (https://github.com/leoon-hu/shizikapian; toddler flashcards, offline use)'
const WIDTH = 480
const HEIGHT = 360
const MAX_PHOTOS = 2
/** 太小的图放大后糊 */
const MIN_SOURCE_WIDTH = 500
/** 文件名里出现这些的多半不是「这个东西的照片」 */
const NOISE =
  /map|chart|graph|diagram|logo|flag|coat_of_arms|wappen|icon|symbol|commons-|question_book|ambox|nuvola|crystal|speaker|loudspeaker|wiki|animated|magazine|advert|poster|engraving|painting|drawing|illustration|cartoon|sketch|lithograph|woodcut|stamp|\b1[89]\d\d\b|\.svg$|\.gif$|\.tiff?$|\.ogv$|\.webm$|\.pdf$|\.djvu$/i
/** 只收这些许可（CC BY-SA 也可以：署名 + 相同方式共享，我们不改图只裁切并注明出处即可） */
const LICENSE_OK = /^(cc0|public domain|pd|cc by(?!-nc)|cc-by(?!-nc))/i
/** Commons 分类里出现这些的是画、雕塑、扫描件、图表，或不适合孩子看的 */
const BAD_CATEGORIES = /paintings?|drawings?|engravings?|etchings?|prints?\b|illustrations?|artworks?|sculptures?|statues?|nude|nudity|naked|manuscripts?|posters?|advertis|logos?|diagrams?|\bmaps?\b|coats? of arms|stamps?|coins?|banknotes?|scans?|book pages?|cartoons?|comics?|screenshots?|renderings?|3d models?|weapons?|war\b|military|soldiers?|blood|dead|death|carcass|skull|skeleton|taxidermy|butcher|meat\b|slaughter|smoking|alcohol|beer|wine|cocktails?/i
/** 匹配分类时忽略的词 */
const STOP = new Set(['of', 'the', 'a', 'an', 'in', 'on', 'with', 'and', 'at', 'to', 'for', 'child', 'children', 'baby', 'babies', 'boy', 'girl', 'kid', 'kids', 'old', 'man', 'woman', 'big', 'little', 'small'])

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'public', 'photos')
const reviewDir = join(root, '.photos-review')
const creditsFile = join(outDir, 'credits.json')
const countsFile = join(root, 'src', 'content', 'photos.json')
mkdirSync(outDir, { recursive: true })

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined
const candidatesFor = args.includes('--candidates') ? args[args.indexOf('--candidates') + 1]?.split(',').filter(Boolean) ?? [] : undefined
const sheetOnly = args.includes('--sheet')

type Credit = { file: string; license: string; licenseUrl?: string; artist: string; page: string; source: string; manual: boolean; scene?: string }
type Credits = Record<string, Credit[]>
const credits: Credits = existsSync(creditsFile) ? (JSON.parse(readFileSync(creditsFile, 'utf8')) as Credits) : {}
const saveCredits = () =>
  writeFileSync(creditsFile, JSON.stringify(Object.fromEntries(Object.keys(credits).sort().map((k) => [k, credits[k]])), null, 2) + '\n')

// ---------- Wikimedia API ----------
const H = { 'User-Agent': UA, 'Api-User-Agent': UA }
async function getJson(url: string): Promise<any> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(url, { headers: H })
      if (attempt > 1) { /* 重试成功 */ }
      if (r.status === 429) throw new Error('429 限流')
      if (!r.ok) throw new Error(`${r.status}`)
      return await r.json()
    } catch (e) {
      if (attempt === 5) throw e
      await sleep(3000 * attempt)
    }
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const q = encodeURIComponent

type Candidate = { file: string; source: string; minWidth?: number; kind: 'scene' | 'noun' }
type FileInfo = { file: string; mime: string; width: number; height: number; thumb: string; license: string; licenseUrl?: string; artist: string; page: string; categories: string }

async function commonsSearch(query: string, limit: number): Promise<string[]> {
  const sr = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q(query)}&srnamespace=6&srlimit=${limit}&format=json`)
  return (sr.query?.search ?? []).map((hit: any) => String(hit.title).replace(/^File:/, ''))
}

/** 候选文件名，按可信度排序（去重、去掉 File: 前缀、下划线换空格）：先场景，后名词 */
async function candidates(card: Card): Promise<Candidate[]> {
  const title = card.wiki ?? card.en.charAt(0).toUpperCase() + card.en.slice(1)
  const out: Candidate[] = []
  if (card.scene) {
    for (const f of await commonsSearch(`${card.scene} filetype:bitmap incategory:"Quality images"`, 6)) out.push({ file: f, source: 'scene-qi', kind: 'scene' })
    for (const f of await commonsSearch(`${card.scene} filetype:bitmap`, 10)) out.push({ file: f, source: 'scene', minWidth: 1000, kind: 'scene' })
  }
  const wd = await getJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=${q(title)}&props=claims|sitelinks&sitefilter=zhwiki&format=json&normalize=1`)
  const ent: any = Object.values<any>(wd.entities ?? {})[0]
  for (const c of ent?.claims?.P18 ?? []) {
    const f = c.mainsnak?.datavalue?.value
    if (f) out.push({ file: f, source: 'wikidata', kind: 'noun' })
  }
  const zhTitle: string | undefined = ent?.sitelinks?.zhwiki?.title
  for (const [site, t] of [['en', title], ['zh', zhTitle]] as const) {
    if (!t) continue
    const pi = await getJson(`https://${site}.wikipedia.org/w/api.php?action=query&titles=${q(t)}&prop=pageimages&piprop=name&format=json&redirects=1`)
    const name = Object.values<any>(pi.query?.pages ?? {})[0]?.pageimage
    if (name) out.push({ file: name, source: `${site}wiki`, kind: 'noun' })
  }
  // 兜底：Commons 的精选图（Quality images）里搜英文词，多为清晰的主体照片
  for (const f of await commonsSearch(`${card.en} filetype:bitmap incategory:"Quality images"`, 8)) out.push({ file: f, source: 'noun-qi', kind: 'noun' })
  const seen = new Set<string>()
  return out
    .map((c) => ({ ...c, file: c.file.replace(/_/g, ' ') }))
    .filter((c) => (seen.has(c.file) ? false : (seen.add(c.file), true)))
}

/** 一批文件的许可 / 尺寸 / 缩略图地址（Commons 上没有的返回 null） */
async function fileInfos(files: string[]): Promise<Map<string, FileInfo | null>> {
  const result = new Map<string, FileInfo | null>()
  for (let i = 0; i < files.length; i += 20) {
    const batch = files.slice(i, i + 20)
    const r = await getJson(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${q(batch.map((f) => 'File:' + f).join('|'))}&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=${WIDTH * 2}&iiextmetadatafilter=LicenseShortName|LicenseUrl|Artist|Credit|Categories&format=json`,
    )
    const norm = new Map<string, string>()
    for (const n of r.query?.normalized ?? []) norm.set(n.to, n.from)
    for (const p of Object.values<any>(r.query?.pages ?? {})) {
      const title = String(p.title)
      const asked = (norm.get(title) ?? title).replace(/^File:/, '')
      const info = p.imageinfo?.[0]
      if (!info) { result.set(asked, null); continue }
      const em = info.extmetadata ?? {}
      const strip = (s: unknown) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      result.set(asked, {
        file: title.replace(/^File:/, ''),
        mime: info.mime,
        width: info.width,
        height: info.height,
        thumb: info.thumburl ?? info.url,
        license: strip(em.LicenseShortName?.value),
        licenseUrl: em.LicenseUrl?.value,
        artist: strip(em.Artist?.value) || strip(em.Credit?.value) || '未署名',
        page: info.descriptionurl,
        categories: String(em.Categories?.value ?? ''),
      })
    }
  }
  return result
}

/**
 * 自动挑的还要「对题」：卡片的名词（英文词 / 维基条目名）或场景短语里的实词得出现在 Commons 分类里。
 * 分类是人工标的，比描述可靠——搜「baby sleeping」搜出海豹幼崽，分类是 Seal pups，就过不了。
 * 动作 / 表情这类没有具体名词的卡，场景词能对上分类就行。
 */
const GLUE = new Set(['of', 'the', 'a', 'an', 'in', 'on', 'with', 'and', 'at', 'to', 'for'])
/** 卡片自己的名词只去掉虚词；场景短语还要去掉 child / baby / big 这类太泛的词 */
function words(text: string, generic = false): string[] {
  return text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && !GLUE.has(w) && !(generic && STOP.has(w)))
}
function onTopic(info: FileInfo, card: Card, sceneOnly: boolean): boolean {
  const cats = info.categories.toLowerCase()
  const hit = (w: string) => new RegExp(`\\b${w}(s|es)?\\b`).test(cats) || (w.endsWith('y') && new RegExp(`\\b${w.slice(0, -1)}ies\\b`).test(cats))
  if (words(`${card.en} ${card.wiki ?? ''}`).some(hit)) return true
  return sceneOnly && words(card.scene ?? '', true).some(hit)
}

function reject(info: FileInfo | null, file: string, minWidth = MIN_SOURCE_WIDTH, card?: Card, sceneOnly = false, manual = false): string | null {
  if (!info) return 'Commons 上没有这个文件'
  if (!manual && NOISE.test(file)) return '文件名像地图 / 图表 / 图标'
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime)) return `不是照片格式（${info.mime}）`
  if (!manual && info.mime === 'image/png') return 'PNG 多半是截图 / 图形，自动挑只要 JPEG'
  if (info.width < minWidth) return `太小（${info.width}px）`
  if (info.width / info.height > 2.6 || info.height / info.width > 2.2) return '太长或太扁，裁不出主体'
  if (!LICENSE_OK.test(info.license)) return `许可不行（${info.license || '未知'}）`
  if (!manual) {
    const bad = info.categories.match(BAD_CATEGORIES)
    if (bad) return `分类里有「${bad[0]}」`
    if (card && !onTopic(info, card, sceneOnly)) return `分类里没有这个词（${info.categories.slice(0, 60) || '无分类'}）`
  }
  return null
}

/** 同一组连拍的文件名只差个序号（IMG 3447 / IMG 3448、(8883362) / (8883364)），两张几乎一样，只留一张 */
function sameSeries(a: string, b: string): boolean {
  const norm = (f: string) => f.toLowerCase().replace(/\.[a-z]+$/, '').replace(/[\d()_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  const na = norm(a), nb = norm(b)
  if (na.length >= 12 && na === nb) return true
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i >= 20
}

/** 动作 / 表情 / 颜色没有具体名词，场景词对上分类就算对题 */
const SCENE_ONLY = new Set(['actions', 'feelings', 'colors'])

/** 先一张场景、再一张名词；哪边没有就用另一边补满 */
function pick(cands: Candidate[], infos: Map<string, FileInfo | null>, card: Card, catId: string): FileInfo[] {
  const picks: FileInfo[] = []
  const ok = (c: Candidate) => {
    const info = infos.get(c.file) ?? null
    if (reject(info, c.file, c.minWidth, card, SCENE_ONLY.has(catId))) return null
    if (picks.some((p) => p.file === info!.file || sameSeries(p.file, info!.file))) return null
    return info!
  }
  for (const kind of ['scene', 'noun'] as const) {
    for (const c of cands) {
      if (c.kind !== kind) continue
      const info = ok(c)
      if (info) { picks.push(info); break }
    }
  }
  for (const c of cands) {
    if (picks.length >= MAX_PHOTOS) break
    const info = ok(c)
    if (info) picks.push(info)
  }
  return picks.slice(0, MAX_PHOTOS)
}

/**
 * 裁成 4:3。接近 4:3 的原图直接裁（按主体位置）；竖图或很宽的图硬裁会把主体切掉一半
 * （一张 3:4 的狗头照裁完只剩耳朵），改成整图缩进来，空出的地方铺一层放大、模糊、压暗的同一张图当底。
 */
async function toCard(buf: Buffer, target: string) {
  const { data: rotated, info } = await sharp(buf).rotate().toBuffer({ resolveWithObject: true })
  const ratio = info.width / info.height
  if (ratio >= 1.1 && ratio <= 1.65) {
    await sharp(rotated).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' }).webp({ quality: 74 }).toFile(target)
    return
  }
  const bg = await sharp(rotated).resize(WIDTH, HEIGHT, { fit: 'cover' }).blur(20).modulate({ brightness: 0.8, saturation: 0.9 }).toBuffer()
  const fg = await sharp(rotated).resize(WIDTH, HEIGHT, { fit: 'inside' }).toBuffer()
  await sharp(bg).composite([{ input: fg, gravity: 'centre' }]).webp({ quality: 74 }).toFile(target)
}

async function download(info: FileInfo, target: string) {
  const r = await fetch(info.thumb, { headers: H })
  if (!r.ok) throw new Error(`下载失败 ${r.status} ${info.thumb}`)
  await toCard(Buffer.from(await r.arrayBuffer()), target)
}

function wantsPhotos(card: Card, catNoPhotos: boolean) {
  return !catNoPhotos && !(card.photos && card.photos.length === 0)
}

// ---------- --candidates：给手选用 ----------
if (candidatesFor) {
  mkdirSync(reviewDir, { recursive: true })
  const all = categories.flatMap((c) => c.cards)
  for (const id of candidatesFor) {
    const card = all.find((c) => c.id === id)
    if (!card) { console.error(`没有这张卡：${id}`); continue }
    const cands = await candidates(card)
    const infos = await fileInfos(cands.map((c) => c.file))
    console.log(`== ${id} ${card.zh} / ${card.en}（条目 ${card.wiki ?? card.en}）`)
    let n = 0
    const catId = categories.find((c) => c.cards.includes(card))!.id
    for (const c of cands) {
      const info = infos.get(c.file) ?? null
      const why = reject(info, c.file, c.minWidth, card, SCENE_ONLY.has(catId))
      const tag = why ? `✗ ${why}` : `✓ ${info!.license} ${info!.width}×${info!.height}  [${info!.categories.slice(0, 70)}]`
      console.log(`   [${c.source}] ${c.file}\n        ${tag}`)
      if (!why && info) {
        n++
        try { await download(info, join(reviewDir, `cand-${id}-${n}.webp`)) } catch { /* 看不了就算了 */ }
      }
    }
  }
  console.log(`可用候选的缩略图在 .photos-review/cand-<id>-N.webp，选好后写进卡片的 photos: [...]`)
  process.exit(0)
}

// ---------- --search：任意短语搜 Commons，拼成一张图供手选 ----------
const searchQuery = args.includes('--search') ? args[args.indexOf('--search') + 1] : undefined
const searchOut = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'search'
if (searchQuery) {
  mkdirSync(reviewDir, { recursive: true })
  const files = [
    ...(await commonsSearch(`${searchQuery} filetype:bitmap incategory:"Quality images"`, 8)),
    ...(await commonsSearch(`${searchQuery} filetype:bitmap`, 16)),
  ]
  const uniq = [...new Set(files.map((f) => f.replace(/_/g, ' ')))]
  const infos = await fileInfos(uniq)
  const okFiles = uniq.filter((f) => { const i = infos.get(f) ?? null; return !reject(i, f, MIN_SOURCE_WIDTH, undefined, false, true) && i!.mime === 'image/jpeg' && !BAD_CATEGORIES.test(i!.categories) })
  const COLS = 6, CW = 240, CH = 200
  const cells: string[] = []
  for (let i = 0; i < okFiles.length; i++) {
    const info = infos.get(okFiles[i])!
    try {
      const r = await fetch(info.thumb, { headers: H })
      const tmp = join(reviewDir, `.tmp-${i}.webp`)
      await toCard(Buffer.from(await r.arrayBuffer()), tmp)
      const jpg = await sharp(tmp).resize(CW - 8, 174).jpeg({ quality: 70 }).toBuffer()
      rmSync(tmp)
      const x = (i % COLS) * CW + 4, y = Math.floor(i / COLS) * CH + 4
      cells.push(`<image href="data:image/jpeg;base64,${jpg.toString('base64')}" x="${x}" y="${y}" width="${CW - 8}" height="174"/><text x="${x + 4}" y="${y + 190}" font-family="system-ui, sans-serif" font-size="12" fill="#333">${i + 1}</text>`)
      console.log(`${String(i + 1).padStart(2)}  ${okFiles[i]}   ${info.license}  [${info.categories.slice(0, 60)}]`)
    } catch { /* 跳过 */ }
  }
  const rows = Math.ceil(cells.length / COLS)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CW}" height="${Math.max(1, rows) * CH}"><rect width="100%" height="100%" fill="#fff"/>${cells.join('')}</svg>`
  writeFileSync(join(reviewDir, `search-${searchOut}.png`), new Resvg(svg, { fitTo: { mode: 'width', value: COLS * CW } }).render().asPng())
  console.log(`${cells.length} 张 → .photos-review/search-${searchOut}.png，编号对应上面的文件名`)
  process.exit(0)
}

// ---------- --preview：现有照片转 JPEG（审片工具不认 WebP 时用） ----------
if (args.includes('--preview')) {
  const dir = join(reviewDir, 'jpg')
  mkdirSync(dir, { recursive: true })
  const files = readdirSync(outDir).filter((f) => f.endsWith('.webp'))
  for (const f of files) await sharp(join(outDir, f)).jpeg({ quality: 80 }).toFile(join(dir, f.replace('.webp', '.jpg')))
  console.log(`${files.length} 张 → .photos-review/jpg/`)
  process.exit(0)
}

// ---------- --sheet：审片拼图 ----------
if (sheetOnly) {
  mkdirSync(reviewDir, { recursive: true })
  for (const f of readdirSync(reviewDir)) if (f.startsWith('sheet-')) rmSync(join(reviewDir, f))
  const files = readdirSync(outDir).filter((f) => f.endsWith('.webp')).sort()
  const COLS = 6, ROWS = 8, CW = 240, CH = 200
  for (let s = 0; s * COLS * ROWS < files.length; s++) {
    const chunk = files.slice(s * COLS * ROWS, (s + 1) * COLS * ROWS)
    const cells = await Promise.all(
      chunk.map(async (f, i) => {
        const jpg = await sharp(join(outDir, f)).resize(CW - 8, 174).jpeg({ quality: 70 }).toBuffer()
        const x = (i % COLS) * CW + 4, y = Math.floor(i / COLS) * CH + 4
        return `<image href="data:image/jpeg;base64,${jpg.toString('base64')}" x="${x}" y="${y}" width="${CW - 8}" height="174"/>` +
          `<text x="${x + 4}" y="${y + 190}" font-family="system-ui, sans-serif" font-size="13" fill="#333">${f.replace('.webp', '')}</text>`
      }),
    )
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CW}" height="${ROWS * CH}"><rect width="100%" height="100%" fill="#fff"/>${cells.join('')}</svg>`
    writeFileSync(join(reviewDir, `sheet-${s + 1}.png`), new Resvg(svg, { fitTo: { mode: 'width', value: COLS * CW } }).render().asPng())
  }
  console.log(`${files.length} 张照片 → .photos-review/sheet-N.png`)
  process.exit(0)
}

// ---------- 主流程 ----------
let done = 0, kept = 0
const short: string[] = []
const failed: string[] = []
/** 几张卡同时找：Wikimedia 允许适度并发（带 UA、串行请求各自间隔），4 路约 30 分钟跑完 */
const CONCURRENCY = 3
const work = categories.flatMap((cat) => cat.cards.map((card) => ({ cat, card })))
async function processOne({ cat, card }: (typeof work)[number]) {
    if (only && card.id !== only) return
    if (!wantsPhotos(card, cat.photos === false)) {
      if (credits[card.id]) { delete credits[card.id]; saveCredits() }
      for (let n = 1; n <= MAX_PHOTOS; n++) { const f = join(outDir, `${card.id}-${n}.webp`); if (existsSync(f)) rmSync(f) }
      return
    }
    const manual = card.photos && card.photos.length > 0 ? card.photos.slice(0, MAX_PHOTOS) : null
    const prev = credits[card.id]
    const sameManual = manual && prev && prev.every((p) => p.manual) && prev.map((p) => p.file).join('|') === manual.join('|')
    // 自动挑的：场景短语没变才沿用（改了 scene 就重挑）
    const sameAuto = !manual && prev && !prev.some((p) => p.manual) && prev.every((p) => (p.scene ?? '') === (card.scene ?? ''))
    const filesExist = prev && prev.every((_, i) => existsSync(join(outDir, `${card.id}-${i + 1}.webp`)))
    if (!force && prev && filesExist && (manual ? sameManual : sameAuto)) { kept++; return }
    try {
      let picks: FileInfo[] = []
      if (manual) {
        const infos = await fileInfos(manual)
        for (const f of manual) {
          const info = infos.get(f) ?? null
          const why = reject(info, f, MIN_SOURCE_WIDTH, undefined, false, true)
          if (why) throw new Error(`手选的「${f}」${why}`)
          picks.push(info!)
        }
      } else {
        const cands = await candidates(card)
        const infos = await fileInfos(cands.map((c) => c.file))
        picks = pick(cands, infos, card, cat.id)
      }
      for (let n = 1; n <= MAX_PHOTOS; n++) { const f = join(outDir, `${card.id}-${n}.webp`); if (existsSync(f)) rmSync(f) }
      const entries: Credit[] = []
      for (let i = 0; i < picks.length; i++) {
        const p = picks[i]
        await download(p, join(outDir, `${card.id}-${i + 1}.webp`))
        entries.push({ file: p.file, license: p.license, licenseUrl: p.licenseUrl, artist: p.artist, page: p.page, source: 'Wikimedia Commons', manual: !!manual, ...(manual ? {} : { scene: card.scene ?? '' }) })
      }
      if (entries.length) credits[card.id] = entries
      else delete credits[card.id]
      saveCredits()
      done++
      if (entries.length < MAX_PHOTOS) short.push(`${card.id}（${entries.length} 张）`)
      console.log(`${card.id.padEnd(14)} ${entries.length} 张  ${entries.map((e) => e.file.slice(0, 40)).join(' | ')}`)
      await sleep(300)
    } catch (e) {
      failed.push(`${card.id}：${(e as Error).message}`)
    }
}
let cursor = 0
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < work.length) await processOne(work[cursor++])
  }),
)

// 运行时用的数量表；内容里已没有的卡从出处与文件里清掉
const ids = new Set(categories.flatMap((c) => c.cards.map((x) => x.id)))
for (const id of Object.keys(credits)) if (!ids.has(id)) { delete credits[id]; console.warn(`已删除的卡片 ${id} 的出处已去掉，public/photos/${id}-*.webp 可手动删`) }
saveCredits()
const counts = Object.fromEntries(Object.keys(credits).sort().map((id) => [id, credits[id].length]))
writeFileSync(countsFile, JSON.stringify(counts, null, 2) + '\n')

console.log(`挑好 ${done} 张卡，沿用 ${kept} 张卡；${Object.keys(counts).length} 张卡有照片`)
if (short.length) console.warn(`不足 ${MAX_PHOTOS} 张的：${short.join('、')}`)
if (failed.length) {
  console.error(`失败：\n  ${failed.join('\n  ')}`)
  process.exit(1)
}
