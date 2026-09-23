import type { Card, Category, PromptId } from '@/content'
import { useSettings } from './useSettings'
import { createSpeaker } from './speaker'
import { planCard, planCategory, planDone, planQuiz, preloadList, type SpeechItem } from './speechPlan'
import { usePwa } from './usePwa'

/**
 * 全局唯一的朗读器：队列 / 打断 / 看门狗的逻辑在 speaker.ts（可单测），这里只做 DOM 适配——
 * 一个复用的 <audio>、iOS 解锁、系统打断、Web Speech 兜底、预加载。
 * 复用同一个 <audio>：iOS 上它在点击回调里同步 play() 过一次之后，以后在 setTimeout 里也能出声（S4）。
 */
const audio = typeof Audio !== 'undefined' ? new Audio() : null
if (audio) audio.preload = 'auto'

/** 让当前这段（音频文件或 Web Speech）提前结束的钩子，stop 时调用；正常结束后自己清掉 */
let settle: (() => void) | null = null

/* ---------- 解锁 ---------- */

/** 几毫秒的静音 WAV：第一次点击里播一下把 <audio> 解锁，之后延时里的 play() 在 iOS 上才不会被拦 */
function silentWav(): string {
  const samples = 8
  const buf = new ArrayBuffer(44 + samples * 2)
  const v = new DataView(buf)
  const str = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)) }
  str(0, 'RIFF'); v.setUint32(4, 36 + samples * 2, true); str(8, 'WAVE')
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, samples * 2, true)
  return 'data:audio/wav;base64,' + btoa(String.fromCharCode(...new Uint8Array(buf)))
}

/**
 * 只有第一次真的播出声（'playing' 或 play() resolve）才算解锁。
 * 以前的写法是监听器一触发就注销，哪怕那次决定不播；iOS 上如果那次点击没能出声，之后就永远静默。
 */
let unlocked = false
function markUnlocked() {
  if (unlocked) return
  unlocked = true
  document.removeEventListener('touchend', unlock, true)
  document.removeEventListener('click', unlock, true)
}
function unlock() {
  if (!audio) return
  // 正在播说明这次点击的回调里已经同步 play() 了（首页点分类），用它来解锁；否则播一段静音
  if (unlocked || !audio.paused) return
  audio.src = silentWav()
  audio.play()?.then(markUnlocked).catch(() => { /* 会被紧跟着的真实播放换掉 src，或本身就被拦，都不算解锁 */ })
}
if (audio && typeof document !== 'undefined') {
  audio.addEventListener('playing', markUnlocked)
  document.addEventListener('touchend', unlock, true)
  document.addEventListener('click', unlock, true)
}

/* ---------- 音频文件 ---------- */

function playFile(item: SpeechItem): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!audio) { reject(new Error('no audio')); return }
    const cleanup = () => {
      audio.removeEventListener('ended', finish)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('pause', onPause)
      if (settle === finish) settle = null
    }
    const finish = () => { cleanup(); resolve() }
    const onError = () => { cleanup(); reject(new Error(`audio error: ${item.url}`)) }
    // 不是我们发起的 pause（来电、其它 App 抢走音频、拔耳机）：当这段读完了，别让喇叭一直脉动。
    // 自己 stop() 里的 pause() 事件是异步派发的，可能在下一段已经 play() 之后才到——那时 audio.paused
    // 已经是 false，靠它排除掉；真被系统暂停时 paused 一定是 true。
    // 播放到头时浏览器也会先发 pause 再发 ended，两条路殊途同归。
    const onPause = () => { if (settle === finish && audio.paused) finish() }
    audio.addEventListener('ended', finish)
    audio.addEventListener('error', onError)
    audio.addEventListener('pause', onPause)
    settle = finish
    audio.src = item.url
    // 必须在这里同步调用 play()，首次点击才能解锁音频（S4）
    const p = audio.play()
    if (p) {
      p.then(markUnlocked).catch((err: unknown) => {
        // settle 已被换掉 = 这段已被 stop 掉，rejection（AbortError）是我们自己 pause / 换 src 造成的
        if (settle !== finish) return
        // 别人换了 src 或暂停造成的 AbortError 也不算失败，不兜底
        if ((err as { name?: unknown } | null)?.name === 'AbortError') { finish(); return }
        cleanup()
        reject(err)
      })
    }
  })
}

/* ---------- Web Speech 兜底（S3） ---------- */

/** 留住最近几个 utterance 的引用：Chrome 会把没引用的回收掉，导致 onend 不触发 */
const utterances: SpeechSynthesisUtterance[] = []
function speakTts(item: SpeechItem): Promise<void> {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined') { resolve(); return }
    try {
      const u = new SpeechSynthesisUtterance(item.text)
      u.lang = item.lang === 'zh' ? 'zh-CN' : 'en-US'
      u.rate = 0.85
      const finish = () => { if (settle === finish) settle = null; resolve() }
      u.onend = finish
      u.onerror = finish
      utterances.push(u)
      if (utterances.length > 4) utterances.shift()
      settle = finish
      speechSynthesis.cancel()
      // Chrome 已知问题：cancel() 紧接着 speak() 会把新的一起吞掉，要让出一个宏任务；
      // 这期间被 stop 了（settle 换掉）就不读了
      setTimeout(() => {
        if (settle !== finish) return
        try { speechSynthesis.speak(u) } catch { finish() }
      }, 0)
    } catch {
      resolve()
    }
  })
}

/* ---------- 组装 ---------- */

const core = createSpeaker({
  play: playFile,
  tts: speakTts,
  interrupt() {
    const s = settle
    settle = null
    audio?.pause()
    if (typeof speechSynthesis !== 'undefined') { try { speechSynthesis.cancel() } catch { /* 忽略 */ } }
    s?.()
  },
})

// 锁屏 / 来电 / 切到别的 App：停掉，回来是一张安静的卡；Android 也不会在后台继续念
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') core.stop() })
  // iOS Safari 锁屏 / 回主屏时 visibilitychange 不一定来，pagehide 更靠得住
  window.addEventListener('pagehide', () => core.stop())
}

/* ---------- 预加载（S5） ---------- */

const preloaded = new Set<string>()
let pending: string[] = []
let workers = 0
/** 同时最多开几条连接预热：多了会和正在读的分类名、还在装的离线包抢同一批连接，首次运行点方砖要等一秒才出声 */
const PRELOAD_CONCURRENCY = 2
/**
 * 把一个分类的音频提前 fetch 一遍暖缓存（SW 的媒体路由支持 Range，不需要 blob URL；取过的它也顺手存进离线缓存）。
 * 离线包已备齐 = 全部音频都在缓存里，不用再取；还没备齐（首次运行、后台还在下、不支持 SW）时按顺序小并发地取，
 * 换分类就丢掉上一分类没取完的。file:// 下 fetch 会失败，忽略
 */
function preload(cat: Category) {
  if (usePwa().offlineState.value === 'ready') return
  const settings = useSettings()
  pending = preloadList(cat, settings.display, { sentences: settings.sentences }).filter((u) => !preloaded.has(u))
  while (workers < PRELOAD_CONCURRENCY && pending.length) {
    workers++
    void (async () => {
      let url: string | undefined
      while ((url = pending.shift())) {
        preloaded.add(url)
        try {
          await fetch(url)
        } catch {
          preloaded.delete(url)
        }
      }
      workers--
    })()
  }
}

export function useSpeaker() {
  const settings = useSettings()
  return {
    busy: core.busy,
    current: core.current,
    stop: core.stop,
    preload,
    speakCard: (card: Card, opts?: { append?: boolean }) => core.speak(planCard(card, settings.display, { sentences: settings.sentences }), opts),
    speakCategory: (cat: Category, opts?: { append?: boolean }) => core.speak(planCategory(cat, settings.display), opts),
    /** 小测验：提示语 + 词（找对了再接例句），见 speechPlan.planQuiz */
    speakQuiz: (id: PromptId, card: Card) => core.speak(planQuiz(id, card, settings.display, { sentences: settings.sentences })),
    speakDone: () => core.speak(planDone(settings.display)),
  }
}
