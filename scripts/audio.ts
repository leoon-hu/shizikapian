/**
 * 用 Edge-TTS（微软 Edge 朗读接口，Azure 神经音色，免费无 Key，npm 包 msedge-tts）批量合成发音，
 * 再把每段前后的静音裁掉（接口给的音频前有 ~200ms、后有 ~700ms 静音，英文更长），统一成固定的头尾留白：
 *   public/audio/zh/<id>.mp3            中文词      public/audio/en/<id>.mp3            英文词
 *   public/audio/zh/sentences/<id>.mp3  中文例句    public/audio/en/sentences/<id>.mp3  英文例句
 *   分类名为 cat-<分类id>。词的合成文本默认是词本身，卡片 / 分类的 say 字段可以覆盖：
 *     - 同音字替换：say: { zh: '常方形' }
 *     - 带载体句、只裁出方括号里的部分：say: { zh: '[青蛙]呱呱叫。' }——孤立读「青蛙」时「蛙」会被读成降调，
 *       在句子里就对了（句末位置也会降，所以载体要让目标词在句中）；按接口给的 WordBoundary 找到目标词的
 *       起止，前后各在 60ms 内找最安静的一帧下刀，然后和普通的段一样裁静音、加留白。
 *       目标词后面紧跟别的字时切口会显得突然（字尾直接撞进下一个字的闭塞），在目标词后加个逗号
 *       '[妈妈]，亲亲我。' 让它自然收尾、后面有停顿，切在停顿里就听不出来；但逗号会让个别词变成句末调
 *       （青蛙的蛙又降下去），所以逗号不逗号得一个词一个词试。
 * public/audio/manifest.json 记每段是用什么文本 / 音色 / 参数合成的：文本、音色或参数变了就自动重做，没变的跳过；
 * --force 全部重合成；--only <id> 只做一张（含 cat- 前缀）；--report 只分析现有文件不合成；
 * --audition <id,id…> 用几个候选音色各合成一份到 .audition/（不进 public），给家长试听后再定 VOICE。
 * 用法：npm run audio [-- --force] [-- --only dog] [-- --report] [-- --audition rain,horse,five]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { MPEGDecoder } from 'mpg123-decoder'
import { Mp3Encoder } from '@breezystack/lamejs'
import { categories } from '../src/content/categories'
import { promptIds, prompts } from '../src/content/prompts'
import type { Lang, Part } from '../src/content/types'

/** 音色与语速：温和清晰的女声，比默认慢一点，孩子听得清 */
const VOICE: Record<Lang, string> = {
  zh: 'zh-CN-XiaoxiaoNeural',
  en: 'en-US-JennyNeural',
}
const RATE = '-15%'
/** 接口取 96k 的源，裁切后按 64k 重编码，两次有损叠加也听不出 */
const SOURCE_FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
const OUT_KBPS = 64
/** 裁切后保留的头尾留白与淡入淡出（毫秒） */
const LEAD_MS = 60
const TRAIL_MS = 140
const FADE_IN_MS = 8
const FADE_OUT_MS = 40
/** 低于这个响度（dBFS，5ms 帧的 RMS）算静音 */
const SILENCE_DB = -45
/**
 * 接口的 WordBoundary 时间轴比音频早约 110ms（每个词元的起点都是），词元的「终点」不可靠
 * （把后面的停顿也算进去了），所以切尾要用下一个词元的起点。
 */
const BOUNDARY_LAG_MS = 110
/** 响度归一：有声段 RMS 拉到这个值（中文 Xiaoxiao 约 -16、英文 Jenny 约 -18.5，不归一的话英文明显轻一截），峰值不超过 PEAK_DB */
const TARGET_RMS_DB = -16
const PEAK_DB = -1
/** --audition 用的候选音色（Edge 免费端点上 zh-CN 只有这几个女声可选；童声 Xiaoshuang 不在） */
const AUDITION_VOICES: Record<Lang, string[]> = {
  zh: ['zh-CN-XiaoxiaoNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunxiaNeural'],
  en: ['en-US-JennyNeural', 'en-US-AriaNeural', 'en-US-AnaNeural'],
}
/** 有声段短于 / 长于这个范围的段在报告里标出来，可能合成出了问题（词 / 例句各一档） */
const SPEECH_MIN_MS = 150
const SPEECH_MAX_MS: Record<Part, number> = { word: 2500, sentence: 6000 }

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const audioDir = join(root, 'public', 'audio')
const manifestFile = join(audioDir, 'manifest.json')
/** 合成参数指纹：任何一项变了都要重合成 */
const PARAMS = `${RATE}|${SOURCE_FORMAT}|${OUT_KBPS}|${LEAD_MS}|${TRAIL_MS}|${FADE_IN_MS}|${FADE_OUT_MS}|${SILENCE_DB}|${TARGET_RMS_DB}|${PEAK_DB}`
type ManifestEntry = { text: string; voice: string; params: string; speechMs: number }
type Manifest = Record<string, ManifestEntry>
function loadManifest(): Manifest {
  try { return JSON.parse(readFileSync(manifestFile, 'utf8')) as Manifest } catch { return {} }
}
function saveManifest(m: Manifest) {
  const sorted = Object.fromEntries(Object.keys(m).sort().map((k) => [k, m[k]]))
  writeFileSync(manifestFile, JSON.stringify(sorted, null, 2) + '\n')
}
const args = process.argv.slice(2)
const force = args.includes('--force')
const reportOnly = args.includes('--report')
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined
const audition = args.includes('--audition') ? args[args.indexOf('--audition') + 1]?.split(',').filter(Boolean) ?? [] : undefined

/** name = 清单 key 与相对路径：zh/dog、zh/sentences/dog、zh/cat-animals */
type Job = { id: string; lang: Lang; part: Part; name: string; text: string; word: string }
const jobs: Job[] = []
// 小测验的提示语（T7）：id 用 q-<id>，--only q-find 可单做
for (const id of promptIds) {
  for (const lang of ['zh', 'en'] as const) {
    jobs.push({ id: `q-${id}`, lang, part: 'word', name: `${lang}/q-${id}`, text: prompts[id][lang], word: prompts[id][lang] })
  }
}
for (const cat of categories) {
  for (const lang of ['zh', 'en'] as const) {
    jobs.push({ id: `cat-${cat.id}`, lang, part: 'word', name: `${lang}/cat-${cat.id}`, text: cat.say?.[lang] ?? cat.name[lang], word: cat.name[lang] })
  }
  for (const card of cat.cards) {
    for (const lang of ['zh', 'en'] as const) {
      jobs.push({ id: card.id, lang, part: 'word', name: `${lang}/${card.id}`, text: card.say?.[lang] ?? card[lang], word: card[lang] })
      jobs.push({ id: card.id, lang, part: 'sentence', name: `${lang}/sentences/${card.id}`, text: card.sentence[lang], word: card.sentence[lang] })
    }
  }
}

// ---------- 合成 ----------
const clients = new Map<string, MsEdgeTTS>()
async function client(voice: string): Promise<MsEdgeTTS> {
  let c = clients.get(voice)
  if (!c) {
    c = new MsEdgeTTS()
    await c.setMetadata(voice, SOURCE_FORMAT, { wordBoundaryEnabled: true })
    clients.set(voice, c)
  }
  return c
}

type Bound = { text: string; startMs: number; endMs: number }
/** 载体句写法 '一只[青蛙]'：整句合成，只留方括号里的词 */
function parseCarrier(text: string): { full: string; target: string } | null {
  const m = text.match(/^(.*)\[(.+)\](.*)$/)
  return m ? { full: m[1] + m[2] + m[3], target: m[2] } : null
}
function dropClient(voice: string) {
  try { clients.get(voice)?.close() } catch { /* 已断开 */ }
  clients.delete(voice)
}

async function synth(job: Job, voice = VOICE[job.lang]): Promise<{ mp3: Buffer; bounds: Bound[] }> {
  const carrier = parseCarrier(job.text)
  const text = carrier ? carrier.full : job.text
  let lastErr: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const c = await client(voice)
      const { audioStream, metadataStream } = c.toStream(text, { rate: RATE })
      const bounds: Bound[] = []
      metadataStream?.on('data', (d: Buffer) => {
        try {
          for (const e of JSON.parse(d.toString()).Metadata ?? []) {
            if (e.Type === 'WordBoundary') bounds.push({ text: e.Data.text.Text, startMs: e.Data.Offset / 10000, endMs: (e.Data.Offset + e.Data.Duration) / 10000 })
          }
        } catch { /* 元数据坏了就当没有 */ }
      })
      metadataStream?.on('error', () => { /* 音频结束时接口会直接关掉它，不算错 */ })
      const chunks: Buffer[] = []
      const timer = setTimeout(() => audioStream.destroy(new Error('20 秒超时')), 20_000)
      try {
        for await (const chunk of audioStream) chunks.push(chunk as Buffer)
      } finally { clearTimeout(timer) }
      const buf = Buffer.concat(chunks)
      if (buf.length > 0) return { mp3: buf, bounds }
      lastErr = new Error('返回空音频')
    } catch (e) { lastErr = e }
    dropClient(voice)
    await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)))
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

// ---------- 解码 / 裁切 / 编码 ----------
const decoder = new MPEGDecoder()
await decoder.ready

async function decode(mp3: Buffer): Promise<{ pcm: Float32Array; sampleRate: number }> {
  await decoder.reset() // 不 await 会让 wasm 崩掉
  const { channelData, sampleRate, samplesDecoded } = decoder.decode(new Uint8Array(mp3))
  return { pcm: Float32Array.from(channelData[0].subarray(0, samplesDecoded)), sampleRate }
}

/** 5ms 一帧的响度（dBFS） */
function loudness(pcm: Float32Array, sampleRate: number): number[] {
  const n = Math.floor(sampleRate * 0.005)
  const out: number[] = []
  for (let i = 0; i + n <= pcm.length; i += n) {
    let s = 0
    for (let j = i; j < i + n; j++) s += pcm[j] * pcm[j]
    out.push(20 * Math.log10(Math.sqrt(s / n) + 1e-9))
  }
  return out
}

type Analysis = { totalMs: number; leadMs: number; trailMs: number; speechMs: number }
function analyze(pcm: Float32Array, sampleRate: number): Analysis {
  const f = loudness(pcm, sampleRate)
  let first = f.findIndex((v) => v > SILENCE_DB)
  let last = f.length - 1
  while (last > 0 && f[last] <= SILENCE_DB) last--
  if (first < 0) { first = 0; last = -1 }
  return {
    totalMs: Math.round((pcm.length / sampleRate) * 1000),
    leadMs: first * 5,
    trailMs: (f.length - 1 - last) * 5,
    speechMs: Math.max(0, (last - first + 1) * 5),
  }
}

function encode(pcm: Float32Array, sampleRate: number): Buffer {
  const enc = new Mp3Encoder(1, sampleRate, OUT_KBPS)
  const int16 = new Int16Array(pcm.length)
  for (let i = 0; i < pcm.length; i++) int16[i] = Math.max(-32768, Math.min(32767, Math.round(pcm[i] * 32767)))
  const parts: Buffer[] = []
  for (let i = 0; i < int16.length; i += 1152) {
    const out = enc.encodeBuffer(int16.subarray(i, Math.min(i + 1152, int16.length)))
    if (out.length) parts.push(Buffer.from(out))
  }
  const tail = enc.flush()
  if (tail.length) parts.push(Buffer.from(tail))
  return Buffer.concat(parts)
}

/** 有声段 RMS 拉到 TARGET_RMS_DB，再保证峰值不超过 PEAK_DB（只是一个增益，不做压缩） */
function normalize(pcm: Float32Array, speechStart: number, speechEnd: number) {
  let sum = 0
  for (let i = speechStart; i < speechEnd; i++) sum += pcm[i] * pcm[i]
  const rms = Math.sqrt(sum / Math.max(1, speechEnd - speechStart))
  if (rms < 1e-6) return
  let gain = 10 ** (TARGET_RMS_DB / 20) / rms
  let peak = 0
  for (let i = 0; i < pcm.length; i++) peak = Math.max(peak, Math.abs(pcm[i]))
  gain = Math.min(gain, 10 ** (PEAK_DB / 20) / Math.max(peak, 1e-6))
  for (let i = 0; i < pcm.length; i++) pcm[i] *= gain
}

/**
 * 从载体句里切出目标词：按 WordBoundary 找到覆盖目标词的词元得到起止（加接口的固定延迟），
 * 起止各在前后 60ms 内找最安静的一帧下刀（相邻字之间总有个小坑，尤其是下一个字以清辅音开头时），
 * 切口处淡入淡出，后面补一段静音让 trim() 照常加尾部留白。
 */
function cutCarrier(pcm: Float32Array, sampleRate: number, bounds: Bound[], target: string): Float32Array {
  // 词元可能是「青蛙」一个，也可能拆成「青」「蛙」：从每个词元往后连，连到包含目标词为止
  let startMs = -1, endMs = -1, first = -1, last = -1
  for (let i = 0; i < bounds.length && startMs < 0; i++) {
    let joined = ''
    for (let j = i; j < bounds.length; j++) {
      joined += bounds[j].text
      const at = joined.indexOf(target)
      if (at >= 0) {
        first = i
        last = j
        const perStart = (bounds[i].endMs - bounds[i].startMs) / bounds[i].text.length
        startMs = bounds[i].startMs + at * perStart + BOUNDARY_LAG_MS
        const tailChars = joined.length - (at + target.length) // 目标词后面还挂着几个字（在最后一个词元里）
        if (tailChars > 0) {
          const perEnd = (bounds[j].endMs - bounds[j].startMs) / bounds[j].text.length
          endMs = bounds[j].endMs - tailChars * perEnd + BOUNDARY_LAG_MS
        } else if (j + 1 < bounds.length) {
          endMs = bounds[j + 1].startMs + BOUNDARY_LAG_MS // 下一个词元的起点才准
        } else {
          endMs = -1 // 目标词在句末：不用切尾
        }
        break
      }
      if (!target.startsWith(joined)) break
    }
  }
  if (startMs < 0) throw new Error(`载体句里找不到「${target}」的词边界（词元：${bounds.map((b) => b.text).join('/')}）`)
  const f = loudness(pcm, sampleRate)
  /** 在 [ms - before, ms + after] 里找最安静的一帧 */
  const quietest = (ms: number, before: number, after: number) => {
    const guess = Math.round(ms / 5)
    let best = Math.min(f.length - 1, Math.max(0, guess))
    for (let k = Math.max(0, guess - Math.round(before / 5)); k <= Math.min(f.length - 1, guess + Math.round(after / 5)); k++) if (f[k] < f[best]) best = k
    return Math.round(((best * 5) / 1000) * sampleRate)
  }
  const start = quietest(startMs, 60, 60)
  // 下一个词元起点前面就是两个词之间的停顿（下一个字以清辅音开头时最明显），在那里面找最安静的一帧
  const end = endMs < 0 ? pcm.length : quietest(endMs, 90, 20)
  if (end <= start + Math.round(0.12 * sampleRate)) throw new Error(`载体句里「${target}」切出来不到 120ms（${first}–${last} 号词元），切点不对`)
  const out = new Float32Array(end - start + Math.round(((TRAIL_MS + 50) / 1000) * sampleRate))
  out.set(pcm.subarray(start, end))
  const fade = Math.round((60 / 1000) * sampleRate)
  for (let i = 0; i < fade && i < end - start; i++) out[end - start - 1 - i] *= i / fade
  return out
}

/** 裁掉头尾静音，留固定留白并淡入淡出，响度归一；整段静音就原样返回 */
async function trim(mp3: Buffer, carrier?: { bounds: Bound[]; target: string }): Promise<{ mp3: Buffer; before: Analysis; after: Analysis }> {
  const decoded = await decode(mp3)
  const sampleRate = decoded.sampleRate
  const pcm = carrier ? cutCarrier(decoded.pcm, sampleRate, carrier.bounds, carrier.target) : decoded.pcm
  const before = analyze(pcm, sampleRate)
  if (before.speechMs === 0) return { mp3, before, after: before }
  const ms = (x: number) => Math.round((x / 1000) * sampleRate)
  normalize(pcm, ms(before.leadMs), ms(before.leadMs + before.speechMs))
  const start = Math.max(0, ms(before.leadMs - LEAD_MS))
  const end = Math.min(pcm.length, ms(before.leadMs + before.speechMs + TRAIL_MS))
  const out = pcm.slice(start, end)
  const fi = ms(FADE_IN_MS), fo = ms(FADE_OUT_MS)
  for (let i = 0; i < fi && i < out.length; i++) out[i] *= i / fi
  for (let i = 0; i < fo && i < out.length; i++) out[out.length - 1 - i] *= i / fo
  const encoded = encode(out, sampleRate)
  const back = await decode(encoded)
  return { mp3: encoded, before, after: analyze(back.pcm, back.sampleRate) }
}

// ---------- 试听：几个候选音色各合成一份，家长听完再定 VOICE ----------
if (audition) {
  const dir = join(root, '.audition')
  mkdirSync(dir, { recursive: true })
  const picked = jobs.filter((j) => audition.includes(j.id))
  if (!picked.length) { console.error(`--audition 后面要跟卡片 id，用逗号分隔，如 rain,horse,five`); process.exit(1) }
  for (const job of picked) {
    for (const voice of AUDITION_VOICES[job.lang]) {
      const file = join(dir, `${job.name.replace(/\//g, '-')}-${voice.replace(/^.._..-|Neural$/g, '')}.mp3`)
      try {
        const raw = await synth(job, voice)
        const carrier = parseCarrier(job.text)
        const { mp3 } = await trim(raw.mp3, carrier ? { bounds: raw.bounds, target: carrier.target } : undefined)
        writeFileSync(file, mp3)
        console.log(`${file.slice(root.length + 1)}  ${job.text}`)
      } catch (e) { console.error(`${voice} ${job.id}：${(e as Error).message}`) }
    }
  }
  for (const v of clients.keys()) dropClient(v)
  decoder.free()
  console.log(`听完在 scripts/audio.ts 里改 VOICE 常量，再 npm run audio -- --force`)
  process.exit(0)
}

// ---------- 主流程 ----------
let done = 0, skipped = 0
const failed: string[] = []
const odd: string[] = []
const rows: string[] = []
const manifest = loadManifest()
const wanted = new Set<string>()

for (const job of jobs) {
  const name = job.name
  wanted.add(name)
  if (only && job.id !== only) continue
  const file = join(audioDir, `${name}.mp3`)
  mkdirSync(dirname(file), { recursive: true })
  const entry: ManifestEntry = { text: job.text, voice: VOICE[job.lang], params: PARAMS, speechMs: 0 }
  if (reportOnly) {
    if (!existsSync(file)) { failed.push(`${name}：文件不存在`); continue }
    const { pcm, sampleRate } = await decode(readFileSync(file))
    const a = analyze(pcm, sampleRate)
    rows.push(`${name.padEnd(30)} ${String(a.totalMs).padStart(5)}ms  有声 ${String(a.speechMs).padStart(5)}ms  头 ${a.leadMs} 尾 ${a.trailMs}  ${job.text}`)
    if (a.speechMs < SPEECH_MIN_MS || a.speechMs > SPEECH_MAX_MS[job.part]) odd.push(`${name} 有声 ${a.speechMs}ms「${job.text}」`)
    continue
  }
  const prev = manifest[name]
  const same = prev && prev.text === entry.text && prev.voice === entry.voice && prev.params === entry.params
  if (!force && existsSync(file) && same) { skipped++; continue }
  try {
    const raw = await synth(job)
    const carrier = parseCarrier(job.text)
    const { mp3, before, after } = await trim(raw.mp3, carrier ? { bounds: raw.bounds, target: carrier.target } : undefined)
    writeFileSync(file, mp3)
    manifest[name] = { ...entry, speechMs: after.speechMs }
    saveManifest(manifest)
    done++
    const note = job.text !== job.word ? `（读作「${job.text}」）` : ''
    process.stdout.write(`${name.padEnd(30)} ${job.word}${note}  ${before.totalMs}→${after.totalMs}ms，有声 ${after.speechMs}ms\n`)
    if (after.speechMs < SPEECH_MIN_MS || after.speechMs > SPEECH_MAX_MS[job.part]) odd.push(`${name} 有声 ${after.speechMs}ms「${job.text}」`)
  } catch (e) {
    failed.push(`${name}：${(e as Error).message}`)
  }
}
for (const v of clients.keys()) dropClient(v)
decoder.free()

// 内容里已经没有的段：从清单里去掉并提醒删文件（不自动删，免得误删）
if (!only && !reportOnly) {
  const stale = Object.keys(manifest).filter((k) => !wanted.has(k))
  if (stale.length) {
    for (const k of stale) delete manifest[k]
    saveManifest(manifest)
    console.warn(`内容里已没有这些段，清单已去掉，文件可手动删除：\n  ${stale.join('\n  ')}`)
  }
}

if (reportOnly) console.log(rows.join('\n'))
else console.log(`合成 ${done} 段，跳过 ${skipped} 段已有的`)
if (odd.length) console.warn(`有声段长度异常（词 ${SPEECH_MIN_MS}–${SPEECH_MAX_MS.word}ms、例句到 ${SPEECH_MAX_MS.sentence}ms 之外），值得听一下：\n  ${odd.join('\n  ')}`)
if (failed.length) {
  console.error(`失败 ${failed.length} 段：\n  ${failed.join('\n  ')}`)
  process.exit(1)
}
