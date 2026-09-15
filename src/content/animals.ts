import type { Category } from './types'

export const animals: Category = {
  id: 'animals',
  name: { zh: '小动物', en: 'animals' },
  emoji: '🐶',
  color: '#ffb74d',
  cards: [
    { id: 'dog', zh: '小狗', en: 'dog', emoji: '🐶', sentence: { zh: '小狗汪汪叫。', en: 'The dog says woof.' }, scene: 'dog barking', photos: ['Jack Russell Terrier Puppy - Eddi.jpg', 'Fawn and white Welsh Corgi puppy standing on rear legs and sticking out the tongue.jpg'] },
    { id: 'cat', zh: '小猫', en: 'cat', emoji: '🐱', sentence: { zh: '小猫喵喵叫。', en: 'The cat says meow.' }, scene: 'cat meowing', photos: ['Wraxall 2012 MMB 43 Smudge.jpg', 'Cat grooming.jpg'] },
    { id: 'rabbit', zh: '兔子', en: 'rabbit', emoji: '🐰', sentence: { zh: '兔子爱吃胡萝卜。', en: 'The rabbit eats carrots.' }, scene: 'rabbit eating carrot', photos: ['Memleben, Erlebnistierpark, Hauskaninchen.jpg', 'Oryctolagus cuniculus Rcdo.jpg'] },
    { id: 'bird', zh: '小鸟', en: 'bird', emoji: '🐦', sentence: { zh: '小鸟在天上飞。', en: 'The bird flies in the sky.' }, scene: 'bird flying', photos: ['Swallow flying drinking.jpg', 'Ploceus velatus beak open.jpg'] },
    { id: 'fish', zh: '小鱼', en: 'fish', emoji: '🐟', sentence: { zh: '小鱼在水里游。', en: 'The fish swims in the water.' }, scene: 'fish swimming', photos: ['Botete negro (Arothron meleagris), Cabo Pulmo, Baja California, México, 2024-12-19, DD 54.jpg', 'Balantiocheilos melanopterus - Karlsruhe Zoo 02 (cropped).jpg'] },
    { id: 'cow', zh: '奶牛', en: 'cow', emoji: '🐮', sentence: { zh: '奶牛哞哞叫。', en: 'The cow says moo.' }, wiki: 'Cattle', scene: 'cow pasture', photos: ['Black and Whites - geograph.org.uk - 522470.jpg', 'Milchkuh auf Weide in NRW.jpg'] },
    { id: 'sheep', zh: '小羊', en: 'sheep', emoji: '🐑', sentence: { zh: '小羊咩咩叫。', en: 'The sheep says baa.' }, scene: 'lamb meadow', photos: ['Flock of sheep.jpg', 'Yorkshire dales sheep.jpg'] },
    { id: 'pig', zh: '小猪', en: 'pig', emoji: '🐷', sentence: { zh: '小猪胖乎乎的。', en: 'The pig is chubby.' }, scene: 'pig', photos: ['Pot-bellied pigs in Lisbon Zoo 2008.jpg', 'Pig farm Vampula 1.jpg'] },
    { id: 'horse', zh: '小马', en: 'horse', emoji: '🐴', sentence: { zh: '小马跑得快。', en: 'The horse runs fast.' }, scene: 'horse running', photos: ['Dülmen, Merfeld, Wildpferdebahn, Dülmener Wildpferde -- 2020 -- 7311.jpg', 'Biandintz eta zaldiak - modified2.jpg'] },
    { id: 'duck', zh: '鸭子', en: 'duck', emoji: '🦆', sentence: { zh: '鸭子嘎嘎叫。', en: 'The duck says quack.' }, scene: 'duck swimming pond', photos: ['Anas platyrhynchos domesticus Palo Alto May 2011 003.jpg', 'Anas platyrhynchos - Mallard - Stockente - canard colvert - Moenchbruch - Mönchbruch - 03.jpg'] },
    { id: 'chick', zh: '小鸡', en: 'chick', emoji: '🐥', sentence: { zh: '小鸡叽叽叫。', en: 'The chick says peep.' }, wiki: 'Chicken', scene: 'baby chicks', photos: ['Fuzzy yellow chicks in a brooder.jpg', 'Gallus gallus domesticus - Vogelpark Steinen 02.jpg'] },
    { id: 'mouse', zh: '老鼠', en: 'mouse', emoji: '🐭', sentence: { zh: '老鼠吱吱叫。', en: 'The mouse says squeak.' }, scene: 'mouse', photos: ['Домовая мышь (Mus musculus), Москва.jpg', 'Mus musculus 131536695.jpg'] },
    { id: 'frog', zh: '青蛙', en: 'frog', emoji: '🐸', sentence: { zh: '青蛙呱呱叫。', en: 'The frog says ribbit.' }, say: { zh: '[青蛙]呱呱叫。' }, scene: 'frog pond', photos: ['Green frog on stone.jpg', 'Golden-eyed tree frog (Agalychnis annae).jpg'] },
    { id: 'turtle', zh: '乌龟', en: 'turtle', emoji: '🐢', sentence: { zh: '乌龟爬得慢。', en: 'The turtle is slow.' }, wiki: 'Chinese pond turtle', scene: 'pond turtle walking on grass', photos: ['Radiated tortoise (Astrochelys radiata) Tsimanampetsotsa.jpg', 'Assam roofed turtle in Kaziranga National Park March 2025 by Tisha Mukherjee 01.jpg'] },
    { id: 'butterfly', zh: '蝴蝶', en: 'butterfly', emoji: '🦋', sentence: { zh: '蝴蝶飞呀飞。', en: 'The butterfly flies.' }, scene: 'butterfly on flower', photos: ['Peacock butterfly (Aglais io) 2.jpg', 'Monarch butterfly male (52341).jpg'] },
    { id: 'bee', zh: '蜜蜂', en: 'bee', emoji: '🐝', sentence: { zh: '蜜蜂嗡嗡嗡。', en: 'The bee says buzz.' }, scene: 'honey bee close-up on flower', photos: ['Honey Bee on Gaillardia Flower - Flickr - Swallowtail Garden Seeds.jpg', 'Bee on top of rata flower.jpg'] },
    { id: 'snail', zh: '蜗牛', en: 'snail', emoji: '🐌', sentence: { zh: '蜗牛背着壳。', en: 'The snail has a shell.' }, scene: 'snail shell', photos: ['Common snail.jpg', 'Garden snail moving down the Vennbahn in disputed territory (DSCF5880).jpg'] },
    { id: 'deer', zh: '小鹿', en: 'deer', emoji: '🦌', sentence: { zh: '小鹿在树林里。', en: 'The deer is in the woods.' }, scene: 'deer in forest', photos: ['Fawn in Forest edit.jpg', 'Fawn in grass 2, by Forest Wander.jpg'] },
  ],
}
