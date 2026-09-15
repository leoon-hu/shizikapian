import type { Category } from './types'

export const vegetables: Category = {
  id: 'vegetables',
  name: { zh: '蔬菜', en: 'vegetables' },
  emoji: '🥕',
  color: '#81c784',
  cards: [
    { id: 'carrot', zh: '胡萝卜', en: 'carrot', emoji: '🥕', sentence: { zh: '胡萝卜橙橙的。', en: 'The carrot is orange.' }, scene: 'carrots', photos: ['Fresh orange carrots.jpg', 'Vegetable-Carrot-Bundle-wStalks.jpg'] },
    { id: 'tomato', zh: '西红柿', en: 'tomato', emoji: '🍅', sentence: { zh: '西红柿红红的。', en: 'The tomato is red.' }, scene: 'tomatoes', photos: ['Organic home-grown tomatoes - unripe to ripe.jpg', 'European tomates from Ivory Coast 01.jpg'] },
    { id: 'cucumber', zh: '黄瓜', en: 'cucumber', emoji: '🥒', sentence: { zh: '黄瓜脆脆的。', en: 'The cucumber is crunchy.' }, scene: 'cucumber', photos: ['Ryerson Market cucumbers on sale.jpg', 'Kurkkuja.jpg'] },
    { id: 'potato', zh: '土豆', en: 'potato', emoji: '🥔', sentence: { zh: '土豆长在土里。', en: 'Potatoes grow underground.' }, scene: 'potatoes', photos: ['Russet potato cultivar with sprouts.jpg', 'Solanales - Solanum tuberosum - 3.jpg'] },
    { id: 'corn', zh: '玉米', en: 'corn', emoji: '🌽', sentence: { zh: '我爱啃玉米。', en: 'I like corn on the cob.' }, wiki: 'Maize', scene: 'corn cob', photos: ['Maize, Kurigram, Bangladesh.jpg', 'Boiled corn cob in Araku Valley, Andhra Pradesh 03.jpg'] },
    { id: 'greens', zh: '青菜', en: 'bok choy', emoji: '🥬', sentence: { zh: '多吃青菜。', en: 'Eat your greens.' }, wiki: 'Bok choy', scene: 'bok choy', photos: ['Brassica rapa var. chinensis (leaf).jpg', 'Bok choy, sauteed - Massachusetts.jpg'] },
    { id: 'eggplant', zh: '茄子', en: 'eggplant', emoji: '🍆', sentence: { zh: '茄子紫紫的。', en: 'The eggplant is purple.' }, scene: 'eggplant', photos: ['Solanum melongena 24 08 2012 (1).JPG', 'Purple eggplants 2017 A.jpg'] },
    { id: 'broccoli', zh: '西兰花', en: 'broccoli', emoji: '🥦', sentence: { zh: '西兰花像小树。', en: 'Broccoli looks like a tree.' }, scene: 'broccoli', photos: ['Liat Portal for Foodie Disorder - Fresh Broccoli.jpg', 'Starr-091108-9381-Brassica oleracea var botrytis-broccoli florets-Olinda-Maui (24989226785).jpg'] },
    { id: 'pepper', zh: '青椒', en: 'pepper', emoji: '🫑', sentence: { zh: '青椒绿绿的。', en: 'The pepper is green.' }, wiki: 'Bell pepper', scene: 'green bell pepper', photos: ['Green bell pepper 2017 A.jpg', 'Green Bell Pepper.jpg'] },
    { id: 'mushroom', zh: '蘑菇', en: 'mushroom', emoji: '🍄', sentence: { zh: '蘑菇像小伞。', en: 'The mushroom looks like an umbrella.' }, wiki: 'Agaricus bisporus', scene: 'white button mushrooms', photos: ['Twee tere paddenstoelen. 06-11-2024. (d.j.b).jpg', 'ChampignonMushroom.jpg'] },
    { id: 'peas', zh: '豌豆', en: 'peas', emoji: '🫛', sentence: { zh: '豌豆圆圆的。', en: 'Peas are round.' }, wiki: 'Pea', scene: 'peas pod', photos: ['Green pea pod 8872.jpg', 'Green pea pods.jpg'] },
    { id: 'onion', zh: '洋葱', en: 'onion', emoji: '🧅', sentence: { zh: '洋葱辣眼睛。', en: 'Onions make you cry.' }, scene: 'onions', photos: ['Mixed onions.jpg', 'Purple onion 01.jpg'] },
    { id: 'sweet-potato', zh: '红薯', en: 'sweet potato', emoji: '🍠', sentence: { zh: '烤红薯真香。', en: 'Baked sweet potato smells good.' }, scene: 'baked sweet potato', photos: ['Gungoguma (roasted sweet potatoes) 2.jpg', 'Ipomoea batatas 006.JPG'] },
    { id: 'chili', zh: '辣椒', en: 'chili pepper', emoji: '🌶️', sentence: { zh: '辣椒好辣。', en: 'The chili pepper is spicy.' }, wiki: 'Chili pepper', scene: 'red chili peppers', photos: ['Funchal (Madeira, Portugal), Mercado dos Lavradores -- 2025 -- 0994.jpg', 'Madame Jeanette and other chillies.jpg'] },
    { id: 'garlic', zh: '大蒜', en: 'garlic', emoji: '🧄', sentence: { zh: '大蒜一瓣一瓣的。', en: 'Garlic has cloves.' }, scene: 'garlic cloves', photos: ['Garlic bulbs and cloves.jpg', 'Opened garlic bulb with garlic clove.jpg'] },
    { id: 'peanut', zh: '花生', en: 'peanut', emoji: '🥜', sentence: { zh: '花生有壳。', en: 'Peanuts have shells.' }, scene: 'peanuts shell', photos: ['Peanuts (Arachis hypogaea) - in shell, shell cracked open, shelled, peeled.jpg', 'Roasted Peanuts with shell.jpg'] },
    { id: 'chestnut', zh: '栗子', en: 'chestnut', emoji: '🌰', sentence: { zh: '栗子香香的。', en: 'Chestnuts are yummy.' }, scene: 'chestnuts', photos: ['Frucht der Edelkastanie.jpg', 'Chestnuts roasted.jpg'] },
  ],
}
