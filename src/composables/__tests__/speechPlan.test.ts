import { describe, expect, it } from 'vitest'
import { langsFor, planCard, planCategory, planDone, planQuiz, preloadList } from '../speechPlan'
import type { Card, Category } from '@/content'

const card: Card = { id: 'dog', zh: '小狗', en: 'dog', sentence: { zh: '小狗汪汪叫。', en: 'The dog says woof.' } }
const cat: Category = { id: 'animals', name: { zh: '动物', en: 'animals' }, emoji: '🐶', color: '#ffb74d', cards: [card] }

describe('朗读计划', () => {
  it('显示模式决定语言顺序：中英文先中后英', () => {
    expect(langsFor('zh')).toEqual(['zh'])
    expect(langsFor('en')).toEqual(['en'])
    expect(langsFor('both')).toEqual(['zh', 'en'])
  })

  it('卡片：每种语言先词后例句，中英文模式是 中词、中句、英词、英句（K7）', () => {
    expect(planCard(card, 'both').map((i) => [i.lang, i.part, i.text])).toEqual([
      ['zh', 'word', '小狗'],
      ['zh', 'sentence', '小狗汪汪叫。'],
      ['en', 'word', 'dog'],
      ['en', 'sentence', 'The dog says woof.'],
    ])
    expect(planCard(card, 'en').map((i) => i.text)).toEqual(['dog', 'The dog says woof.'])
  })

  it('例句关掉就只读词', () => {
    expect(planCard(card, 'both', { sentences: false }).map((i) => i.text)).toEqual(['小狗', 'dog'])
  })

  it('词与例句的音频路径不同；分类名用 cat- 前缀', () => {
    const [word, sentence] = planCard(card, 'zh')
    expect(word.url).toMatch(/audio\/zh\/dog\.mp3$/)
    expect(sentence.url).toMatch(/audio\/zh\/sentences\/dog\.mp3$/)
    expect(planCategory(cat, 'zh')).toEqual([
      { key: 'cat-animals', lang: 'zh', part: 'word', text: '动物', url: expect.stringMatching(/audio\/zh\/cat-animals\.mp3$/) },
    ])
  })

  it('预加载清单 = 分类名 + 全部卡片的词与例句 + 5 句小测验提示语，只含当前模式的语言', () => {
    expect(preloadList(cat, 'zh')).toHaveLength(3 + 5)
    expect(preloadList(cat, 'zh', { sentences: false })).toHaveLength(2 + 5)
    expect(preloadList(cat, 'both')).toHaveLength(6 + 10)
  })

  it('小测验：提示语 → 词，找对了再接例句；中英文先中后英（T3–T7）', () => {
    expect(planQuiz('find', card, 'both').map((i) => [i.key, i.lang, i.text])).toEqual([
      ['q-find', 'zh', '哪个是'],
      ['dog', 'zh', '小狗'],
      ['q-find', 'en', 'Which one is'],
      ['dog', 'en', 'dog'],
    ])
    expect(planQuiz('right', card, 'zh').map((i) => i.text)).toEqual(['对啦！', '小狗', '小狗汪汪叫。'])
    expect(planQuiz('right', card, 'zh', { sentences: false }).map((i) => i.text)).toEqual(['对啦！', '小狗'])
    expect(planQuiz('wrong', card, 'en').map((i) => i.url)).toEqual([
      expect.stringMatching(/audio\/en\/q-wrong\.mp3$/),
      expect.stringMatching(/audio\/en\/dog\.mp3$/),
    ])
    expect(planDone('both').map((i) => i.text)).toEqual(['全都找到啦！', 'You found them all!'])
  })
})
