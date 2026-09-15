import { ref, type Ref } from 'vue'
import type { Lang, Part } from '@/content'
import type { SpeechItem } from './speechPlan'

/**
 * 朗读器的纯逻辑部分：队列、打断、看门狗、兜底与自动播放拦截的处理，不碰 DOM。
 * <audio> / Web Speech 的适配在 useSpeaker.ts 里通过 deps 注入，这样打断 / 追加 / 超时
 * 这些最容易在真机上「卡死或永远静默」的路径都能用假的 play 在 node 里单测。
 */
export interface SpeakerDeps {
  /**
   * 播放一段。正常结束 resolve；被 stop 打断时由适配层 settle 提前 resolve；
   * 被浏览器自动播放策略拦截时 reject 一个 name === 'NotAllowedError' 的错误；
   * 文件缺失 / 解码失败等其它情况 reject 别的错误。
   */
  play(item: SpeechItem): Promise<void>
  /** 兜底朗读（Web Speech，S3）：读不了也要 resolve，不要抛 */
  tts(item: SpeechItem): Promise<void>
  /** stop() 时同步调用：适配层在这里 pause <audio>、cancel speechSynthesis，并 settle 掉正在等的那段 */
  interrupt?(): void
  sleep?(ms: number): Promise<void>
  /** 中英之间的停顿（K7）。音频文件已裁掉首尾静音、只留 60/140ms 留白，350ms 听感刚好（需求 K7） */
  gapMs?: number
  /** 一段最多等多久：'ended' 不触发（iOS 偶发、系统打断）时按正常结束处理，否则喇叭会永远脉动 */
  watchdogMs?: number
}

export interface Speaker {
  /** 整个队列在播（含中英之间的间隙）：喇叭脉动、图片呼吸用 */
  busy: Ref<boolean>
  /** 正在读的那一段（key 是卡片 id 或 cat-<分类id>），间隙与没在读时为 null：词行高亮用（K8） */
  current: Ref<{ key: string; lang: Lang; part: Part } | null>
  /** 默认打断当前的只读新的（K5 / S6）；append 排到队尾（分类名后面接第一张卡） */
  speak(items: SpeechItem[], opts?: { append?: boolean }): void
  stop(): void
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** 自动播放被拦：不退 tts（那只是换个嗓子硬读，一样会被拦或更吵），整段静默，等下一次点击 */
const isNotAllowed = (err: unknown) => (err as { name?: unknown } | null)?.name === 'NotAllowedError'

export function createSpeaker(deps: SpeakerDeps): Speaker {
  const { play, tts, interrupt, sleep = defaultSleep, gapMs = 350, watchdogMs = 8000 } = deps

  const busy = ref(false)
  const current = ref<{ key: string; lang: Lang; part: Part } | null>(null)

  let queue: SpeechItem[] = []
  /** 每次打断 +1，旧的播放循环靠它知道自己已经作废。从 1 起步：running 用 0 表示「没有循环在跑」，token 不能和它相撞 */
  let token = 1
  /** 正在跑的播放循环的 token，0 = 没有。stop 里同步清零，这样 stop 之后立刻 append 也能起新循环 */
  let running = 0

  /** 一段最多等 watchdogMs：不管是文件还是兜底，超时都当作读完了 */
  const guarded = (p: Promise<void>) => Promise.race([p, sleep(watchdogMs)])

  async function drain(my: number) {
    running = my
    busy.value = true
    try {
      while (token === my && queue.length) {
        const item = queue.shift()!
        current.value = { key: item.key, lang: item.lang, part: item.part }
        let blocked = false
        try {
          await guarded(play(item))
        } catch (err) {
          // 被打断的段不兜底：token 已变，读了也是旧卡的词
          if (token !== my) return
          if (isNotAllowed(err)) {
            blocked = true
          } else {
            try {
              await guarded(tts(item))
            } catch {
              /* 兜底再失败就静默（S3） */
            }
          }
        }
        if (token !== my) return
        current.value = null
        if (blocked) {
          queue = []
          return
        }
        if (queue.length) await sleep(gapMs)
      }
    } finally {
      // 被 stop 打断时 running 已经不是自己的了（可能已换成新循环），别去动新循环的状态
      if (running === my) {
        running = 0
        busy.value = false
        current.value = null
      }
    }
  }

  function stop() {
    token++
    queue = []
    running = 0
    interrupt?.()
    busy.value = false
    current.value = null
  }

  function speak(items: SpeechItem[], opts: { append?: boolean } = {}) {
    if (opts.append) {
      queue.push(...items)
      if (!running && queue.length) void drain(token)
      return
    }
    stop()
    queue = items.slice()
    if (queue.length) void drain(token)
  }

  return { busy, current, speak, stop }
}
