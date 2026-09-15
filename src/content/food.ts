import type { Category } from './types'

export const food: Category = {
  id: 'food',
  name: { zh: '食物', en: 'food' },
  emoji: '🍚',
  color: '#ffd54f',
  cards: [
    { id: 'rice', zh: '米饭', en: 'rice', emoji: '🍚', sentence: { zh: '我要吃米饭。', en: 'I eat rice.' }, wiki: 'Cooked rice', scene: 'bowl of rice', photos: ['A bowl of rice.jpg', 'Meshi 001.jpg'] },
    { id: 'noodles', zh: '面条', en: 'noodles', emoji: '🍜', sentence: { zh: '面条长长的。', en: 'The noodles are long.' }, wiki: 'Noodle', scene: 'bowl of noodles', photos: ['Udon noodle Bowl (Nongshim) 20210701 003.jpg', 'Dalian Liaoning China Noodlemaker-01.jpg'] },
    { id: 'bread', zh: '面包', en: 'bread', emoji: '🍞', sentence: { zh: '面包软软的。', en: 'The bread is soft.' }, scene: 'loaf of bread', photos: ['Breads of Russia.jpg', 'Assorted bread.jpg'] },
    { id: 'egg', zh: '鸡蛋', en: 'egg', emoji: '🥚', sentence: { zh: '我爱吃鸡蛋。', en: 'I like eggs.' }, wiki: 'Egg as food', scene: 'eggs', photos: ['Brown chicken eggs.jpg', 'Eierdoos.jpg'] },
    { id: 'milk', zh: '牛奶', en: 'milk', emoji: '🥛', sentence: { zh: '我要喝牛奶。', en: 'I drink milk.' }, scene: 'child drinking milk', photos: ['Glass of Milk (33657535532).jpg', 'Baby drinks milk.jpg'] },
    { id: 'cake', zh: '蛋糕', en: 'cake', emoji: '🍰', sentence: { zh: '生日吃蛋糕。', en: 'Cake for my birthday!' }, scene: 'birthday cake', photos: ['Birthday cake with seven candles.jpg', 'American Birthday Cake.jpg'] },
    { id: 'cookie', zh: '饼干', en: 'cookie', emoji: '🍪', sentence: { zh: '饼干脆脆的。', en: 'The cookie is crunchy.' }, scene: 'cookies', photos: ['Danish butter cookies in container with wrappers, December 2009.jpg', 'Choc-Chip-Cookie.jpg'] },
    { id: 'dumpling', zh: '饺子', en: 'dumpling', emoji: '🥟', sentence: { zh: '饺子真好吃。', en: 'Dumplings are yummy.' }, wiki: 'Jiaozi', scene: 'jiaozi dumplings', photos: ['Potstickers with sauce - Massachusetts.jpg', '台灣南投草屯水餃Nantou, Taiwan Caotun dumplings.jpg'] },
    { id: 'ice-cream', zh: '冰淇淋', en: 'ice cream', emoji: '🍦', sentence: { zh: '冰淇淋凉凉的。', en: 'Ice cream is cold.' }, scene: 'ice cream cone', photos: ['It\'s time to have ice cream on the beach.jpg', 'A cup of three ice cream in Victoria Peak Hong Kong.jpg'] },
    { id: 'water', zh: '水', en: 'water', emoji: '💧', sentence: { zh: '我要喝水。', en: 'I drink water.' }, wiki: 'Drinking water', scene: 'child drinking water', photos: ['School child drinking water.jpg', 'Clean water for a village in West Lombok (10686572086).jpg'] },
    { id: 'juice', zh: '果汁', en: 'juice', emoji: '🧃', sentence: { zh: '果汁甜甜的。', en: 'The juice is sweet.' }, scene: 'glass of juice', photos: ['Orange juice in a glass.jpg', 'A glass of orange juice (2015-10-10).JPG'] },
    { id: 'hamburger', zh: '汉堡', en: 'hamburger', emoji: '🍔', sentence: { zh: '汉堡大大的。', en: 'The hamburger is big.' }, scene: 'hamburger', photos: ['Big Mac hamburger.jpg', 'NCI Visuals Food Hamburger.jpg'] },
    { id: 'pizza', zh: '披萨', en: 'pizza', emoji: '🍕', sentence: { zh: '披萨圆圆的。', en: 'The pizza is round.' }, scene: 'pizza', photos: ['Eq it-na pizza-margherita sep2005 sml.jpg', 'Pizza-3007395.jpg'] },
    { id: 'sandwich', zh: '三明治', en: 'sandwich', emoji: '🥪', sentence: { zh: '三明治夹着菜。', en: 'The sandwich has veggies.' }, scene: 'sandwich', photos: ['Sandwiches Vienna.jpg', 'Sandwich.jpg'] },
    { id: 'candy', zh: '糖果', en: 'candy', emoji: '🍬', sentence: { zh: '少吃糖果。', en: 'Not too much candy.' }, scene: 'candy', photos: ['Candy 6577.jpg', 'ColoredcandyC.jpg'] },
    { id: 'chocolate', zh: '巧克力', en: 'chocolate', emoji: '🍫', sentence: { zh: '巧克力香香的。', en: 'Chocolate is yummy.' }, scene: 'chocolate bar', photos: ['Toms Guldbarre Chocolate Bar In Pieces.jpg', 'Cocoa Powder and Chocolate on Marble Background.jpg'] },
    { id: 'fries', zh: '薯条', en: 'fries', emoji: '🍟', sentence: { zh: '薯条要蘸酱。', en: 'Fries with ketchup.' }, wiki: 'French fries', scene: 'french fries ketchup', photos: ['French Fries with Ketchup 01.jpg', 'Papas fritas (plato).jpg'] },
    { id: 'chicken-leg', zh: '鸡腿', en: 'chicken leg', emoji: '🍗', sentence: { zh: '鸡腿香喷喷。', en: 'The chicken leg smells good.' }, wiki: 'Chicken leg', scene: 'roasted chicken leg', photos: ['Roasted chicken leg piece-MB20.jpg', 'Crispy Fried Chicken Drumsticks Leg Piece.jpg'] },
  ],
}
