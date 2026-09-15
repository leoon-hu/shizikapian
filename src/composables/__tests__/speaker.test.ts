import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSpeaker, type Speaker } from '../speaker'
import type { SpeechItem } from '../speechPlan'
import type { Lang } from '@/content'

const item = (key: string, lang: Lang = 'zh'): SpeechItem => ({ key, lang, part: 'word', text: key, url: `audio/${lang}/${key}.mp3` })

/** 假的播放层：每段 play 挂起等测试决定怎么结束；interrupt 像真实适配层一样 settle 掉当前段 */
function setup(opts: { gapMs?: number; watchdogMs?: number } = {}) {
  let pending: { item: SpeechItem; resolve: () => void; reject: (e: unknown) => void } | null = null
  const played: string[] = []
  const play = vi.fn((it: SpeechItem) => new Promise<void>((resolve, reject) => {
    played.push(`${it.key}:${it.lang}`)
    pending = { item: it, resolve, reject }
  }))
  const tts = vi.fn(() => Promise.resolve())
  const interrupt = vi.fn(() => { pending?.resolve(); pending = null })
  const speaker: Speaker = createSpeaker({ play, tts, interrupt, gapMs: 350, watchdogMs: 8000, ...opts })
  return {
    speaker, play, tts, interrupt, played,
    end: () => { pending?.resolve(); pending = null },
    fail: (e: unknown) => { pending?.reject(e); pending = null },
  }
}

/** 只跑微任务，不推时间 */
const flush = () => vi.advanceTimersByTimeAsync(0)

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('朗读器状态机', () => {
  it('① 播放中 speak（不 append）：旧段被 settle，只有新段在播，不兜底', async () => {
    const s = setup()
    s.speaker.speak([item('a')])
    expect(s.speaker.current.value).toEqual({ key: 'a', lang: 'zh', part: 'word' })
    s.interrupt.mockClear()
    s.speaker.speak([item('b')])
    expect(s.interrupt).toHaveBeenCalledTimes(1)
    await flush()
    expect(s.played).toEqual(['a:zh', 'b:zh'])
    expect(s.speaker.current.value).toEqual({ key: 'b', lang: 'zh', part: 'word' })
    expect(s.speaker.busy.value).toBe(true)
    expect(s.tts).not.toHaveBeenCalled()
    s.end()
    await flush()
    expect(s.speaker.busy.value).toBe(false)
    expect(s.speaker.current.value).toBeNull()
  })

  it('② 播放中 append：旧段播完、等 gap、再播新段', async () => {
    const s = setup()
    s.speaker.speak([item('a')])
    s.speaker.speak([item('b')], { append: true })
    await flush()
    expect(s.play).toHaveBeenCalledTimes(1)
    s.end()
    await flush()
    expect(s.speaker.current.value).toBeNull()
    expect(s.speaker.busy.value).toBe(true)
    await vi.advanceTimersByTimeAsync(349)
    expect(s.play).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(s.played).toEqual(['a:zh', 'b:zh'])
    expect(s.speaker.current.value).toEqual({ key: 'b', lang: 'zh', part: 'word' })
  })

  it('③ 队列播完后 append：立即开播，不等 gap', async () => {
    const s = setup()
    s.speaker.speak([item('a')])
    s.end()
    await flush()
    expect(s.speaker.busy.value).toBe(false)
    s.speaker.speak([item('b')], { append: true })
    expect(s.speaker.busy.value).toBe(true)
    await flush()
    expect(s.played).toEqual(['a:zh', 'b:zh'])
    expect(s.speaker.current.value).toEqual({ key: 'b', lang: 'zh', part: 'word' })
  })

  it('④ play 普通失败（文件缺失）：退到 tts，读完继续下一段', async () => {
    const s = setup()
    s.speaker.speak([item('a'), item('a', 'en')])
    s.fail(new Error('audio error'))
    await flush()
    expect(s.tts).toHaveBeenCalledTimes(1)
    expect(s.tts).toHaveBeenCalledWith(item('a'))
    await vi.advanceTimersByTimeAsync(350)
    expect(s.played).toEqual(['a:zh', 'a:en'])
  })

  it('⑤ play 被自动播放策略拦（NotAllowedError）：不兜底，清空队列，静默', async () => {
    const s = setup()
    s.speaker.speak([item('a'), item('a', 'en')])
    const err = new Error('play() failed')
    err.name = 'NotAllowedError'
    s.fail(err)
    await flush()
    await vi.advanceTimersByTimeAsync(1000)
    expect(s.tts).not.toHaveBeenCalled()
    expect(s.played).toEqual(['a:zh'])
    expect(s.speaker.busy.value).toBe(false)
    expect(s.speaker.current.value).toBeNull()
    // 之后再点还能播
    s.speaker.speak([item('b')])
    expect(s.played).toEqual(['a:zh', 'b:zh'])
  })

  it('⑥ stop 后同步 append：能立即播（running 在 stop 里同步清零）', async () => {
    const s = setup()
    s.speaker.speak([item('a')])
    s.speaker.stop()
    expect(s.speaker.busy.value).toBe(false)
    s.speaker.speak([item('b')], { append: true })
    expect(s.speaker.busy.value).toBe(true)
    expect(s.played).toEqual(['a:zh', 'b:zh'])
    await flush()
    // 旧循环醒来后不能把新循环的状态清掉
    expect(s.speaker.busy.value).toBe(true)
    expect(s.speaker.current.value).toEqual({ key: 'b', lang: 'zh', part: 'word' })
  })

  it('⑥b 被 stop 打断的段之后再 reject 也不兜底', async () => {
    const s = setup()
    s.speaker.speak([item('a')])
    s.speaker.stop()
    s.fail(new Error('aborted'))
    await flush()
    expect(s.tts).not.toHaveBeenCalled()
  })

  it('⑦ watchdog 超时：当这段读完，继续下一段', async () => {
    const s = setup()
    s.speaker.speak([item('a'), item('b')])
    await vi.advanceTimersByTimeAsync(7999)
    expect(s.speaker.current.value).toEqual({ key: 'a', lang: 'zh', part: 'word' })
    await vi.advanceTimersByTimeAsync(1)
    expect(s.speaker.current.value).toBeNull()
    expect(s.speaker.busy.value).toBe(true)
    await vi.advanceTimersByTimeAsync(350)
    expect(s.played).toEqual(['a:zh', 'b:zh'])
    s.end()
    await flush()
    expect(s.speaker.busy.value).toBe(false)
  })

  it('⑧ 两段之间 current 为 null 而 busy 仍为 true（喇叭继续脉动、词行不高亮）', async () => {
    const s = setup()
    s.speaker.speak([item('a', 'zh'), item('a', 'en')])
    expect(s.speaker.current.value).toEqual({ key: 'a', lang: 'zh', part: 'word' })
    s.end()
    await flush()
    expect(s.speaker.current.value).toBeNull()
    expect(s.speaker.busy.value).toBe(true)
    await vi.advanceTimersByTimeAsync(350)
    expect(s.speaker.current.value).toEqual({ key: 'a', lang: 'en', part: 'word' })
    s.end()
    await flush()
    expect(s.speaker.current.value).toBeNull()
    expect(s.speaker.busy.value).toBe(false)
  })

  it('会话里第一次 speak 就是 append、播放中再 append：只有一个播放循环（直接打开卡片页的路径）', async () => {
    const s = setup()
    s.speaker.speak([item('a'), item('a2')], { append: true })
    s.speaker.speak([item('b')], { append: true })
    await flush()
    expect(s.play).toHaveBeenCalledTimes(1)
    expect(s.speaker.busy.value).toBe(true)
    s.end()
    await flush()
    await vi.advanceTimersByTimeAsync(349)
    expect(s.play).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(s.played).toEqual(['a:zh', 'a2:zh'])
    s.end()
    await vi.advanceTimersByTimeAsync(350)
    s.end()
    await flush()
    expect(s.played).toEqual(['a:zh', 'a2:zh', 'b:zh'])
    expect(s.speaker.busy.value).toBe(false)
  })

  it('gap 期间 stop：不再播下一段', async () => {
    const s = setup()
    s.speaker.speak([item('a'), item('b')])
    s.end()
    await flush()
    s.speaker.stop()
    await vi.advanceTimersByTimeAsync(1000)
    expect(s.played).toEqual(['a:zh'])
    expect(s.speaker.busy.value).toBe(false)
  })
})
