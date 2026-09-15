import type { Category } from './types'

/** 图片由 scripts/draw.ts 自绘，没有 emoji；不配照片 */
export const shapes: Category = {
  id: 'shapes',
  name: { zh: '形状', en: 'shapes' },
  emoji: '🔷',
  color: '#7986cb',
  photos: false,
  cards: [
    { id: 'circle', zh: '圆形', en: 'circle', sentence: { zh: '球是圆形的。', en: 'The ball is a circle.' } },
    { id: 'triangle', zh: '三角形', en: 'triangle', sentence: { zh: '三角形有三个角。', en: 'A triangle has three corners.' } },
    { id: 'square', zh: '正方形', en: 'square', sentence: { zh: '正方形有四条边。', en: 'A square has four sides.' } },
    { id: 'rectangle', zh: '长方形', en: 'rectangle', sentence: { zh: '门是长方形的。', en: 'The door is a rectangle.' } },
    { id: 'star-shape', zh: '星星', en: 'star', sentence: { zh: '星星有五个角。', en: 'A star has five points.' }, say: { zh: '[星星]，真亮。' } },
    { id: 'heart', zh: '爱心', en: 'heart', sentence: { zh: '爱心送给你。', en: 'A heart for you.' } },
    { id: 'crescent', zh: '月牙', en: 'crescent', sentence: { zh: '月牙弯弯的。', en: 'The crescent is curved.' } },
    { id: 'oval', zh: '椭圆形', en: 'oval', sentence: { zh: '鸡蛋是椭圆形的。', en: 'The egg is an oval.' } },
    { id: 'diamond', zh: '菱形', en: 'diamond', sentence: { zh: '菱形有四个角。', en: 'A diamond has four corners.' } },
    { id: 'semicircle', zh: '半圆', en: 'half circle', sentence: { zh: '半圆像彩虹。', en: 'A half circle looks like a rainbow.' } },
    { id: 'hexagon', zh: '六边形', en: 'hexagon', sentence: { zh: '六边形有六条边。', en: 'A hexagon has six sides.' } },
  ],
}
