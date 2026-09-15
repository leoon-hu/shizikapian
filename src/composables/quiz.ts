import type { Card } from '@/content'

/**
 * 小测验的出题（T2）：纯函数、可注入随机源，能单测。
 * 一轮从分类里随机抽 ROUND_SIZE 张不重复的卡做题；每题的选项 = 正确的卡 + 同分类另外几张，
 * 四张插画互不相同（家人里爷爷 / 外公同图，不会同时出现），位置随机。
 */

/** 一轮最多几题：幼儿的注意力只有几分钟 */
export const ROUND_SIZE = 8
/** 每题几个选项（2×2） */
export const OPTION_COUNT = 4

export interface Question {
  answer: Card
  /** 已打乱顺序，含 answer */
  options: Card[]
}

/** 0 ≤ r < 1 的随机源；默认 Math.random，测试传可重复的 */
export type Rng = () => number

export function shuffle<T>(list: T[], rng: Rng): T[] {
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 插画来源相同的卡视为同一幅画：有 emoji 的按 emoji，自绘的（颜色 / 形状 / 数字 / 草）按 id */
const picture = (card: Card) => card.emoji ?? `#${card.id}`

export function makeRound(cards: Card[], rng: Rng = Math.random): Question[] {
  const asked = shuffle(cards, rng).slice(0, ROUND_SIZE)
  return asked.map((answer) => {
    const used = new Set([picture(answer)])
    const others: Card[] = []
    for (const c of shuffle(cards, rng)) {
      if (others.length >= OPTION_COUNT - 1) break
      if (c.id === answer.id || used.has(picture(c))) continue
      used.add(picture(c))
      others.push(c)
    }
    return { answer, options: shuffle([answer, ...others], rng) }
  })
}
