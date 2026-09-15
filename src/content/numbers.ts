import type { Category } from './types'

/** 图片由 scripts/draw.ts 自绘（数字 + 同样数量的苹果），没有 emoji；不配照片 */
export const numbers: Category = {
  id: 'numbers',
  name: { zh: '数字', en: 'numbers' },
  emoji: '🔢',
  color: '#4db6ac',
  photos: false,
  cards: [
    { id: 'one', zh: '一', en: 'one', sentence: { zh: '一个苹果。', en: 'One apple.' } },
    { id: 'two', zh: '二', en: 'two', sentence: { zh: '两个苹果。', en: 'Two apples.' } },
    { id: 'three', zh: '三', en: 'three', sentence: { zh: '三个苹果。', en: 'Three apples.' } },
    { id: 'four', zh: '四', en: 'four', sentence: { zh: '四个苹果。', en: 'Four apples.' } },
    { id: 'five', zh: '五', en: 'five', sentence: { zh: '五个苹果。', en: 'Five apples.' } },
    { id: 'six', zh: '六', en: 'six', sentence: { zh: '六个苹果。', en: 'Six apples.' } },
    { id: 'seven', zh: '七', en: 'seven', sentence: { zh: '七个苹果。', en: 'Seven apples.' } },
    { id: 'eight', zh: '八', en: 'eight', sentence: { zh: '八个苹果。', en: 'Eight apples.' } },
    { id: 'nine', zh: '九', en: 'nine', sentence: { zh: '九个苹果。', en: 'Nine apples.' } },
    { id: 'ten', zh: '十', en: 'ten', sentence: { zh: '十个苹果。', en: 'Ten apples.' } },
  ],
}
