import type { Category } from './types'

/** 大动物：孩子在动物园和绘本里见到的 */
export const zoo: Category = {
  id: 'zoo',
  name: { zh: '动物园', en: 'zoo' },
  emoji: '🦁',
  color: '#a1887f',
  cards: [
    { id: 'elephant', zh: '大象', en: 'elephant', emoji: '🐘', sentence: { zh: '大象鼻子长。', en: 'The elephant has a long trunk.' }, scene: 'elephant trunk', photos: ['Elephant running.jpg', 'Indian elephant in Kaziranga National Park March 2025 by Tisha Mukherjee 06.jpg'] },
    { id: 'lion', zh: '狮子', en: 'lion', emoji: '🦁', sentence: { zh: '狮子吼一吼。', en: 'The lion roars.' }, scene: 'lion roaring', photos: ['Lion (Panthera leo) old male Chobe.jpg', 'Okonjima Lioness.jpg'] },
    { id: 'tiger', zh: '老虎', en: 'tiger', emoji: '🐯', sentence: { zh: '老虎有条纹。', en: 'The tiger has stripes.' }, scene: 'tiger stripes', photos: ['Bengal tiger (Panthera tigris tigris) female 3.jpg', 'Bengal-Tiger Corbett Uttarakhand Dec-2013.jpg'] },
    { id: 'monkey', zh: '猴子', en: 'monkey', emoji: '🐵', sentence: { zh: '猴子爱吃香蕉。', en: 'The monkey eats bananas.' }, scene: 'monkey eating banana', photos: ['Bonnet Macaque Eating Banana.jpg', 'Ubud Monkey Family.jpg'] },
    { id: 'panda', zh: '熊猫', en: 'panda', emoji: '🐼', sentence: { zh: '熊猫爱吃竹子。', en: 'The panda eats bamboo.' }, wiki: 'Giant panda', scene: 'giant panda eating bamboo', photos: ['Giant panda eating bamboo.jpg', 'Panda géant - tête (Ailuropoda melanoleuca) (2).jpg'] },
    { id: 'giraffe', zh: '长颈鹿', en: 'giraffe', emoji: '🦒', sentence: { zh: '长颈鹿脖子长。', en: 'The giraffe has a long neck.' }, scene: 'giraffe neck', photos: ['Close up on head of giraffe at Oakland Zoo (10528995334).jpg', 'Two Tall Giraffes in Lake Mburo National Park.jpg'] },
    { id: 'zebra', zh: '斑马', en: 'zebra', emoji: '🦓', sentence: { zh: '斑马一条黑一条白。', en: 'The zebra is black and white.' }, scene: 'zebra stripes', photos: ['Equus zebra hartmannae - Etosha 2015.jpg', 'Zebra close-up (4372731544).jpg'] },
    { id: 'penguin', zh: '企鹅', en: 'penguin', emoji: '🐧', sentence: { zh: '企鹅走路摇摇摆摆。', en: 'The penguin waddles.' }, scene: 'adelie penguin walking', photos: ['Adelie penguin (Pygoscelis adeliae), walking.jpg', 'African penguin, Cape Town (P1050585).jpg'] },
    { id: 'hippo', zh: '河马', en: 'hippo', emoji: '🦛', sentence: { zh: '河马嘴巴大。', en: 'The hippo has a big mouth.' }, wiki: 'Hippopotamus', scene: 'hippopotamus open mouth', photos: ['Hippopotamus in the Zambezi.jpg', 'Hippo (Hippopotamus amphibius) (16485955207).jpg'] },
    { id: 'bear', zh: '大熊', en: 'bear', emoji: '🐻', sentence: { zh: '大熊爱吃蜂蜜。', en: 'The bear likes honey.' }, wiki: 'Brown bear', scene: 'brown bear', photos: ['Brown bear (Ursus arctos arctos) running.jpg', '2010-kodiak-bear-1.jpg'] },
    { id: 'kangaroo', zh: '袋鼠', en: 'kangaroo', emoji: '🦘', sentence: { zh: '袋鼠跳跳跳。', en: 'The kangaroo hops.' }, scene: 'kangaroo hopping', photos: ['Forester kangaroo (Macropus giganteus tasmaniensis) juvenile hopping Esk Valley.jpg', 'Forester kangaroo (Macropus giganteus tasmaniensis) female with joey Esk Valley 2.jpg'] },
    { id: 'koala', zh: '考拉', en: 'koala', emoji: '🐨', sentence: { zh: '考拉在睡觉。', en: 'The koala is sleeping.' }, scene: 'koala sleeping tree', photos: ['Sa-sleeping-koala.JPG', 'Koala climbing tree.jpg'] },
    { id: 'fox', zh: '狐狸', en: 'fox', emoji: '🦊', sentence: { zh: '狐狸尾巴大大的。', en: 'The fox has a big tail.' }, wiki: 'Red fox', scene: 'red fox', photos: ['Red Fox drinking from a lake in Gennevilliers, France.jpg', 'Red fox sitting in the snow (55104387112).jpg'] },
    { id: 'crocodile', zh: '鳄鱼', en: 'crocodile', emoji: '🐊', sentence: { zh: '鳄鱼张大嘴。', en: 'The crocodile opens its mouth.' }, wiki: 'Crocodile', scene: 'crocodile open mouth' },
    { id: 'owl', zh: '猫头鹰', en: 'owl', emoji: '🦉', sentence: { zh: '猫头鹰晚上不睡觉。', en: 'The owl is awake at night.' }, wiki: 'Owl', scene: 'owl perched' },
    { id: 'camel', zh: '骆驼', en: 'camel', emoji: '🐪', sentence: { zh: '骆驼背上有驼峰。', en: 'The camel has a hump.' }, wiki: 'Dromedary', scene: 'camel desert' },
  ],
}
