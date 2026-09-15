import type { Category } from './types'

export const nature: Category = {
  id: 'nature',
  name: { zh: '大自然', en: 'nature' },
  emoji: '🌈',
  color: '#aed581',
  cards: [
    { id: 'sun', zh: '太阳', en: 'sun', emoji: '☀️', sentence: { zh: '太阳暖洋洋。', en: 'The sun is warm.' }, scene: 'sun sky', photos: ['Shining sun in blue sky of desert with sand cover elgolea city.jpg', 'The cloud and the Shining sun.jpg'] },
    { id: 'moon', zh: '月亮', en: 'moon', emoji: '🌙', sentence: { zh: '月亮弯弯的。', en: 'The moon shines at night.' }, scene: 'crescent moon', photos: ['Crescent Moon Clouds (201245183).jpeg', 'FullMoon2010.jpg'] },
    { id: 'star', zh: '星星', en: 'star', emoji: '⭐', sentence: { zh: '星星一闪一闪。', en: 'Twinkle twinkle little star.' }, wiki: 'Night sky', scene: 'starry night', say: { zh: '[星星]，真亮。' }, photos: ['Starry night in Langtang National Park.jpg', 'Свет от деревни - panoramio.jpg'] },
    { id: 'cloud', zh: '云朵', en: 'cloud', emoji: '☁️', sentence: { zh: '云朵白白的。', en: 'The cloud is white.' }, scene: 'white clouds', photos: ['White Cumulus Clouds against Blue Sky (4).jpg', 'Three White Clouds in Blue Sky.JPG'] },
    { id: 'rain', zh: '下雨', en: 'rain', emoji: '🌧️', sentence: { zh: '下雨了。', en: 'It is raining.' }, scene: 'rain', photos: ['Falling rain in mexico.jpg', 'Vihmavarjuga jalakäija Sossi mäel Tallinnas. 2016. aasta aprill..jpg'] },
    { id: 'snow', zh: '雪花', en: 'snow', emoji: '❄️', sentence: { zh: '雪花飘下来。', en: 'Snowflakes fall down.' }, scene: 'snowflakes falling', photos: ['Snowflake (lumehelves).jpg', 'Falling snowflakes in England.JPG'] },
    { id: 'rainbow', zh: '彩虹', en: 'rainbow', emoji: '🌈', sentence: { zh: '彩虹有好多颜色。', en: 'The rainbow has many colors.' }, scene: 'rainbow', photos: ['Rainbow over field - geograph.org.uk - 6264288.jpg', 'Rainbow over the house in the sugar cane fields.JPG'] },
    { id: 'flower', zh: '花', en: 'flower', emoji: '🌷', sentence: { zh: '花儿真香。', en: 'The flower smells nice.' }, scene: 'flowers', photos: ['Halictus bee on flower-2.jpg', 'Magnolia grandiflora - flower 1.jpg'] },
    { id: 'leaf', zh: '叶子', en: 'leaf', emoji: '🍃', sentence: { zh: '叶子绿绿的。', en: 'The leaf is green.' }, scene: 'green leaf', photos: ['Leaf 1 web.jpg', 'Ocimum Basilicum leaf lighted by the left.jpg'] },
    { id: 'tree', zh: '大树', en: 'tree', emoji: '🌳', sentence: { zh: '大树高高的。', en: 'The tree is tall.' }, scene: 'big tree', photos: ['Maury Sandy Intramural Fields Lone Tree.jpg', 'Flooded Albizia Saman (rain tree) in the Mekong.jpg'] },
    // 🌱 画的是幼苗，草由 scripts/draw.ts 自绘
    { id: 'grass', zh: '小草', en: 'grass', sentence: { zh: '小草软软的。', en: 'The grass is soft.' }, scene: 'grass', photos: ['Memories of green (8947632371).jpg', 'Little girl, blue eyes, seated in grass, smiling (23072470504).jpg'] },
    { id: 'mountain', zh: '山', en: 'mountain', emoji: '⛰️', sentence: { zh: '山上有树。', en: 'Trees on the mountain.' }, scene: 'mountain trees', photos: ['Front view of a wooden footbridge over a lagoon, trees and mountains in Vang Vieng, Laos.jpg', 'Himalayas, Ama Dablam, Nepal.jpg'] },
    { id: 'sea', zh: '大海', en: 'ocean', emoji: '🌊', sentence: { zh: '大海蓝蓝的。', en: 'The ocean is blue.' }, wiki: 'Sea', scene: 'blue ocean', photos: ['Seal Rocks, Ocean Beach, San Francisco.jpg', 'Paracas National Reserve, Ica, Peru-3April2011.jpg'] },
    { id: 'rock', zh: '石头', en: 'rock', emoji: '🪨', sentence: { zh: '石头硬硬的。', en: 'The rock is hard.' }, wiki: 'Rock (geology)', scene: 'rocks', photos: ['Beach Pebbles Stone Lagoon.jpg', 'Balanced Rock.jpg'] },
    { id: 'shell', zh: '贝壳', en: 'shell', emoji: '🐚', sentence: { zh: '海边捡贝壳。', en: 'Shells on the beach.' }, wiki: 'Seashell', scene: 'seashells beach', photos: ['DSC0224a.jpg', 'Flexopecten ponticus 2008 G1.jpg'] },
    { id: 'fire', zh: '火', en: 'fire', emoji: '🔥', sentence: { zh: '火很烫，别碰。', en: 'Fire is hot, don\'t touch.' }, scene: 'campfire', photos: ['Campfire in front of two Bivouac tents.jpg', 'Campfire September 2017.jpg'] },
    { id: 'lightning', zh: '闪电', en: 'lightning', emoji: '⚡', sentence: { zh: '天上有闪电。', en: 'Lightning flashes.' }, scene: 'lightning', photos: ['Lightning Pritzerbe 01 (MK).jpg', 'Funkturm Arsenal Blitze.jpg'] },
    { id: 'beach', zh: '沙滩', en: 'beach', emoji: '🏖️', sentence: { zh: '在沙滩上玩。', en: 'Play on the beach.' }, scene: 'children beach', photos: ['Child playing in the sand at Misquamicut Beach.JPG', 'Young african child playing with sand at the beach.jpg'] },
  ],
}
