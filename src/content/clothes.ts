import type { Category } from './types'

export const clothes: Category = {
  id: 'clothes',
  name: { zh: '衣服', en: 'clothes' },
  emoji: '👕',
  color: '#4fc3f7',
  cards: [
    { id: 'shirt', zh: '上衣', en: 'shirt', emoji: '👕', sentence: { zh: '穿好上衣。', en: 'Put on your shirt.' }, wiki: 'T-shirt', scene: 't-shirt', photos: ['Toddler boy (front view).jpg', 'Small child in marinière.jpg'] },
    { id: 'pants', zh: '裤子', en: 'pants', emoji: '👖', sentence: { zh: '穿上裤子。', en: 'Put on your pants.' }, wiki: 'Trousers', scene: 'child pants', photos: ['Jeans for men.jpg', 'Broek en jas van uniform ROTEB, objectnr 62773-B-C(2).JPG'] },
    { id: 'dress', zh: '裙子', en: 'dress', emoji: '👗', sentence: { zh: '裙子真漂亮。', en: 'The dress is pretty.' }, scene: 'girl dress', photos: ['Little girl wearing a white wedding dress 3.jpg', 'Dress with circle skirt in the wind - pose 2.jpg'] },
    { id: 'shoes', zh: '鞋子', en: 'shoes', emoji: '👟', sentence: { zh: '穿上鞋子。', en: 'Put on your shoes.' }, wiki: 'Shoe', scene: 'child shoes', photos: ['Forgotten children\'s sneakers in Rågårdsdal 2.jpg', 'Reebok Royal Glide Ripple Clip shoe.jpg'] },
    { id: 'socks', zh: '袜子', en: 'socks', emoji: '🧦', sentence: { zh: '袜子穿在脚上。', en: 'Socks go on your feet.' }, wiki: 'Sock', scene: 'pair of socks', photos: ['Villased sokid, STM 1998.jpg', 'HandKnittedWhiteLaceSock.jpg'] },
    { id: 'hat', zh: '帽子', en: 'hat', emoji: '🧢', sentence: { zh: '戴上帽子。', en: 'Put on your hat.' }, scene: 'child hat', photos: ['Child wearing traditional designs of tiger hat for year of tiger.jpg', 'Baby Beach Club.jpg'] },
    { id: 'coat', zh: '外套', en: 'coat', emoji: '🧥', sentence: { zh: '天冷穿外套。', en: 'Coat for the cold.' }, wiki: 'Coat (clothing)', scene: 'child winter coat', photos: ['Hammond Slides Child in the Cold.jpg', 'Polo Ralph Lauren winter coat jacket.jpg'] },
    { id: 'scarf', zh: '围巾', en: 'scarf', emoji: '🧣', sentence: { zh: '围上围巾。', en: 'Wrap the scarf.' }, scene: 'scarf', photos: ['Knitted snood.jpg', 'Brioche scarf.jpg'] },
    { id: 'gloves', zh: '手套', en: 'gloves', emoji: '🧤', sentence: { zh: '戴上手套。', en: 'Put on your gloves.' }, wiki: 'Glove', scene: 'gloves', photos: ['Multi-color hand-knit mitten.jpg', 'Handschoenen-nappaleer0859.JPG'] },
    { id: 'shorts', zh: '短裤', en: 'shorts', emoji: '🩳', sentence: { zh: '夏天穿短裤。', en: 'Shorts for summer.' }, scene: 'shorts', photos: ['Men\'s Shorts - Old Bull Lee - Orange.jpg', 'Tanpan.jpg'] },
    { id: 'boots', zh: '靴子', en: 'boots', emoji: '🥾', sentence: { zh: '下雨穿靴子。', en: 'Boots for the rain.' }, wiki: 'Boot', scene: 'child rain boots', photos: ['Rain boots on Stairs.jpg', 'Joules wellington boots.jpg'] },
    { id: 'swimsuit', zh: '泳衣', en: 'swimsuit', emoji: '🩱', sentence: { zh: '游泳穿泳衣。', en: 'Swimsuit for swimming.' }, scene: 'child swimsuit', photos: ['Swimsuit toddler girl in white hat.jpg', 'Running for a bath in the sea.jpg'] },
    { id: 'slippers', zh: '拖鞋', en: 'slippers', emoji: '🩴', sentence: { zh: '在家穿拖鞋。', en: 'Slippers at home.' }, wiki: 'Slipper', scene: 'slippers', photos: ['2023 Kapcie.jpg', 'Slippers.jpg'] },
  ],
}
