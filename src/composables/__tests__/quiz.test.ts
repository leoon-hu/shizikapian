import { describe, expect, it } from 'vitest'
import { categories } from '@/content/categories'
import { makeRound, OPTION_COUNT, ROUND_SIZE, type Rng } from '../quiz'

/** 可重复的随机源（mulberry32） */
function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('小测验出题（T2）', () => {
  it('每个分类、多个种子：题数 = min(8, 张数)，题目不重复，每题 4 个互不相同插画的选项且含答案', () => {
    for (const cat of categories) {
      for (let seed = 1; seed <= 20; seed++) {
        const round = makeRound(cat.cards, seeded(seed))
        expect(round.length, cat.id).toBe(Math.min(ROUND_SIZE, cat.cards.length))
        expect(new Set(round.map((q) => q.answer.id)).size, cat.id).toBe(round.length)
        for (const q of round) {
          expect(q.options.length, `${cat.id}/${q.answer.id}`).toBe(OPTION_COUNT)
          expect(q.options.some((o) => o.id === q.answer.id), `${cat.id}/${q.answer.id}`).toBe(true)
          const pics = q.options.map((o) => o.emoji ?? `#${o.id}`)
          expect(new Set(pics).size, `${cat.id}/${q.answer.id} 插画重复`).toBe(OPTION_COUNT)
          expect(new Set(q.options.map((o) => o.id)).size, cat.id).toBe(OPTION_COUNT)
        }
      }
    }
  })

  it('答案的位置是随机的，不总在同一格', () => {
    const cat = categories[0]
    const positions = new Set<number>()
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of makeRound(cat.cards, seeded(seed))) positions.add(q.options.findIndex((o) => o.id === q.answer.id))
    }
    expect(positions.size).toBe(OPTION_COUNT)
  })

  it('同一种子出同一套题（可复现）', () => {
    const cat = categories[1]
    const a = makeRound(cat.cards, seeded(7)).map((q) => [q.answer.id, q.options.map((o) => o.id)])
    const b = makeRound(cat.cards, seeded(7)).map((q) => [q.answer.id, q.options.map((o) => o.id)])
    expect(a).toEqual(b)
  })
})
