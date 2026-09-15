import type { Category } from './types'

/** 图片由 scripts/draw.ts 自绘（蜡笔），没有 emoji */
export const colors: Category = {
  id: 'colors',
  name: { zh: '颜色', en: 'colors' },
  emoji: '🎨',
  color: '#ba68c8',
  cards: [
    { id: 'red', zh: '红色', en: 'red', sentence: { zh: '苹果是红色的。', en: 'The apple is red.' }, wiki: 'Red', scene: 'red apple', photos: ['Red Delicious Apple 2021.jpg', 'Fiat 500 in Emilia-Romagna.jpg'] },
    { id: 'orange-color', zh: '橙色', en: 'orange', sentence: { zh: '橙子是橙色的。', en: 'The orange is orange.' }, wiki: 'Orange (colour)', scene: 'orange fruit', photos: ['Orange-Fruit-Pieces.jpg', 'Orange -- 2022 -- 9721.jpg'] },
    { id: 'yellow', zh: '黄色', en: 'yellow', sentence: { zh: '香蕉是黄色的。', en: 'The banana is yellow.' }, wiki: 'Yellow', scene: 'yellow banana', photos: ['Bananas.jpg', 'Yellow Rubber Duck.jpg'] },
    { id: 'green', zh: '绿色', en: 'green', sentence: { zh: '叶子是绿色的。', en: 'The leaf is green.' }, wiki: 'Green', scene: 'green leaf', photos: ['Leaf 1 web.jpg', 'Wet Leaf.jpg'] },
    { id: 'blue', zh: '蓝色', en: 'blue', sentence: { zh: '天空是蓝色的。', en: 'The sky is blue.' }, wiki: 'Blue', scene: 'blue sky', photos: ['Burimun gate and pine under blue sky at Beomeosa temple in Busan, South Korea.jpg', 'Blue Sky White Clouds Green Trees Bangladesh.jpg'] },
    { id: 'purple', zh: '紫色', en: 'purple', sentence: { zh: '葡萄是紫色的。', en: 'Grapes are purple.' }, wiki: 'Purple', scene: 'purple grapes', photos: ['USDA Eat Healthy Food Group Gallery serving size medium bunch purple grapes.jpg', 'BUNCH WINE GRAPES green and purple close up (48986786716).jpg'] },
    { id: 'pink', zh: '粉色', en: 'pink', sentence: { zh: '小猪是粉色的。', en: 'The pig is pink.' }, wiki: 'Pink', scene: 'piglet', photos: ['Piglets At The Fair (32027327).jpeg', 'International Rose Test Garden, Portland, Oregon (2022) - 020.jpg'] },
    { id: 'brown', zh: '棕色', en: 'brown', sentence: { zh: '泥土是棕色的。', en: 'Dirt is brown.' }, wiki: 'Brown', scene: 'brown soil', photos: ['Plant a Sapling for Better Future.jpg', 'European Brown Bear.jpg'] },
    { id: 'black', zh: '黑色', en: 'black', sentence: { zh: '小猫是黑色的。', en: 'The cat is black.' }, wiki: 'Black', scene: 'black cat', photos: ['Black-Cat-Sitia-Crete-Greece-3.jpg', 'Full moon in night sky - India.jpg'] },
    { id: 'white', zh: '白色', en: 'white', sentence: { zh: '雪是白色的。', en: 'Snow is white.' }, wiki: 'White', scene: 'snow', photos: ['Mountains in snow, Mountain lake, Chola Valley, Nepal, Himalayas.jpg', 'African Cape Daisy (Osteospermum barberiae).jpg'] },
    { id: 'gray', zh: '灰色', en: 'gray', sentence: { zh: '大象是灰色的。', en: 'The elephant is gray.' }, wiki: 'Grey', scene: 'elephant', photos: ['Loxodonta africana - crossing.jpg', 'African bush elephant, South Luangwa National Park (51866798415).jpg'] },
  ],
}
