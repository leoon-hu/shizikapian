import type { Category } from './types'

export const fruits: Category = {
  id: 'fruits',
  name: { zh: '水果', en: 'fruit' },
  emoji: '🍎',
  color: '#ff8a80',
  cards: [
    { id: 'apple', zh: '苹果', en: 'apple', emoji: '🍎', sentence: { zh: '我爱吃苹果。', en: 'I like apples.' }, scene: 'child eating apple', photos: ['Red Delicious Apple 2021.jpg', 'Assorted Red and Green Apples 2120px.jpg'] },
    { id: 'banana', zh: '香蕉', en: 'banana', emoji: '🍌', sentence: { zh: '香蕉黄黄的。', en: 'The banana is yellow.' }, scene: 'yellow bananas', photos: ['Bananas on black background 02.jpg', 'Cavendish banana from Maracaibo.jpg'] },
    { id: 'orange', zh: '橙子', en: 'orange', emoji: '🍊', sentence: { zh: '橙子酸酸甜甜。', en: 'The orange is sweet.' }, wiki: 'Orange (fruit)', scene: 'orange fruit', photos: ['Orange-Fruit-Pieces.jpg', 'Orange Garden in Sittong, Darjeeling.jpg'] },
    { id: 'grapes', zh: '葡萄', en: 'grapes', emoji: '🍇', sentence: { zh: '葡萄一串串。', en: 'Grapes grow in bunches.' }, wiki: 'Grape', scene: 'bunch of grapes', photos: ['Javier shows part of the grape harvest in his Lysekil vineyard 1 - cropped.jpg', 'Grapes, Rostov-on-Don, Russia.jpg'] },
    { id: 'strawberry', zh: '草莓', en: 'strawberry', emoji: '🍓', sentence: { zh: '草莓红红的。', en: 'The strawberry is red.' }, scene: 'strawberries', photos: ['Garden strawberry (Fragaria × ananassa) single2.jpg', 'Strawberries.JPG'] },
    { id: 'watermelon', zh: '西瓜', en: 'watermelon', emoji: '🍉', sentence: { zh: '西瓜真甜。', en: 'The watermelon is sweet.' }, scene: 'watermelon slice', photos: ['Watermelon slice, May 2024.jpg', 'Taiwan 2009 Tainan City Organic Farm Watermelon FRD 7962.jpg'] },
    { id: 'peach', zh: '桃子', en: 'peach', emoji: '🍑', sentence: { zh: '桃子毛茸茸。', en: 'The peach is fuzzy.' }, scene: 'peaches', photos: ['Peaches in basket 2026 G1.jpg', 'Ripe peach.jpg'] },
    { id: 'pear', zh: '梨子', en: 'pear', emoji: '🍐', sentence: { zh: '梨子很好吃。', en: 'The pear is yummy.' }, scene: 'pears', photos: ['Pear DS.jpg', 'D\'anjou pear.jpg'] },
    { id: 'cherry', zh: '樱桃', en: 'cherry', emoji: '🍒', sentence: { zh: '樱桃小小的。', en: 'Cherries are small.' }, scene: 'cherries', photos: ['Cherry Stella444.jpg', 'Cherry season (48216568227).jpg'] },
    { id: 'pineapple', zh: '菠萝', en: 'pineapple', emoji: '🍍', sentence: { zh: '菠萝有刺。', en: 'The pineapple is spiky.' }, scene: 'pineapple', photos: ['The pineapple (Ananas comosus).JPG', 'കൈതച്ചക്ക.jpg'] },
    { id: 'lemon', zh: '柠檬', en: 'lemon', emoji: '🍋', sentence: { zh: '柠檬好酸呀。', en: 'The lemon is sour.' }, scene: 'lemons', photos: ['Lemon - whole and split.jpg', 'Five Lemons on lemon tree, Burj Bhalaike.jpg'] },
    { id: 'mango', zh: '芒果', en: 'mango', emoji: '🥭', sentence: { zh: '芒果真香。', en: 'The mango smells good.' }, scene: 'mango', photos: ['Alphonso Ripe Mango from north India.jpg', 'MangoAlphonso04 Asit.jpg'] },
    { id: 'blueberry', zh: '蓝莓', en: 'blueberry', emoji: '🫐', sentence: { zh: '蓝莓蓝蓝的。', en: 'Blueberries are blue.' }, scene: 'blueberries', photos: ['Dish of blueberries.jpg', 'Wild blueberries near Sydney.jpg'] },
    { id: 'kiwi', zh: '猕猴桃', en: 'kiwi', emoji: '🥝', sentence: { zh: '猕猴桃绿绿的。', en: 'The kiwi is green.' }, wiki: 'Kiwifruit', scene: 'kiwifruit', photos: ['Kiwi aka.jpg', 'Kiwifruit cross section.jpg'] },
    { id: 'coconut', zh: '椰子', en: 'coconut', emoji: '🥥', sentence: { zh: '椰子里有水。', en: 'The coconut has water inside.' }, scene: 'coconut water', photos: ['Coconut Drink, Pangandaran.JPG', 'Young boy drinking a coconuts with a straw, in Fakarava atoll 20061106.jpg'] },
    { id: 'melon', zh: '哈密瓜', en: 'melon', emoji: '🍈', sentence: { zh: '哈密瓜香香的。', en: 'The melon smells sweet.' }, wiki: 'Cantaloupe', scene: 'cantaloupe', photos: ['Cantaloupe.jpg', 'A hami melon for sale at a Publix market in Knoxville, Tennessee.jpg'] },
  ],
}
