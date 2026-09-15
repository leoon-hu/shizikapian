import type { Category } from './types'

/** 情绪命名：2–4 岁孩子学会说「我生气了」比认字更重要 */
export const feelings: Category = {
  id: 'feelings',
  name: { zh: '表情', en: 'feelings' },
  emoji: '😄',
  color: '#dce775',
  cards: [
    { id: 'happy', zh: '开心', en: 'happy', emoji: '😄', sentence: { zh: '我很开心。', en: 'I am happy.' }, wiki: 'Happiness', scene: 'happy child laughing', photos: ['Child-Happy-9479.jpg', 'Sweet Baby Kisses Family Love.jpg'] },
    { id: 'sad', zh: '难过', en: 'sad', emoji: '😢', sentence: { zh: '我很难过。', en: 'I am sad.' }, wiki: 'Sadness', scene: 'sad child', photos: ['Crying-girl.jpg', 'Girl with sad face.jpg'] },
    { id: 'angry', zh: '生气', en: 'angry', emoji: '😠', sentence: { zh: '我生气了。', en: 'I am angry.' }, wiki: 'Anger', scene: 'angry child', photos: ['Child\'s Angry Face.jpg', 'Pouting boy in Shamar, Iraq.jpg'] },
    { id: 'scared', zh: '害怕', en: 'scared', emoji: '😨', sentence: { zh: '我有点害怕。', en: 'I am scared.' }, wiki: 'Fear', scene: 'scared child', photos: ['Crying child with blonde hair.jpg', 'Scared child.jpg'] },
    { id: 'surprised', zh: '惊讶', en: 'surprised', emoji: '😮', sentence: { zh: '哇，好惊讶！', en: 'Wow, what a surprise!' }, wiki: 'Surprise (emotion)', scene: 'surprised child', photos: ['Child - Surprise.jpg'] },
    { id: 'sleepy', zh: '困了', en: 'sleepy', emoji: '😴', sentence: { zh: '我困了。', en: 'I am sleepy.' }, wiki: 'Somnolence', scene: 'child yawning', photos: ['Yawning Infant, August 2018.jpg', 'Baby yawning.jpg'] },
    { id: 'crying', zh: '大哭', en: 'crying', emoji: '😭', sentence: { zh: '宝宝在大哭。', en: 'The baby is crying.' }, wiki: 'Crying', scene: 'crying baby', photos: ['Crying infant (43101898172).jpg', 'Crying-girl.jpg'] },
    { id: 'laughing', zh: '大笑', en: 'laughing', emoji: '😆', sentence: { zh: '哈哈哈，真好笑。', en: 'Ha ha, so funny!' }, wiki: 'Laughter', scene: 'laughing child', photos: ['Laughing Toddler (colorized).jpg', 'Killian Couppey.jpg'] },
    { id: 'sick', zh: '生病', en: 'sick', emoji: '🤒', sentence: { zh: '我生病了。', en: 'I am sick.' }, wiki: 'Disease', scene: 'sick child bed', photos: ['Child receives checkup from doctor in a clinic.jpg', 'Doctor examines child during a routine checkup in a bright, welcoming clinic environment with cheerful interactions undefined.jpg'] },
    { id: 'shy', zh: '害羞', en: 'shy', emoji: '😳', sentence: { zh: '我有点害羞。', en: 'I am shy.' }, wiki: 'Shyness', scene: 'shy child', photos: ['Tanzania child shying face by Rasheedhrasheed.jpg', 'Flickr - Sukanto Debnath - ......1.jpg'] },
    { id: 'kiss', zh: '亲亲', en: 'kiss', emoji: '😘', sentence: { zh: '亲亲妈妈。', en: 'Kiss mommy.' }, wiki: 'Kiss', scene: 'child kissing mother', photos: ['Mother kissing her child.jpg', 'Sweet Baby Kisses Family Love.jpg'] },
    { id: 'yummy', zh: '好吃', en: 'yummy', emoji: '😋', sentence: { zh: '真好吃！', en: 'Yummy!' }, wiki: 'Eating', scene: 'child eating happy', photos: ['Thai boys eating icecream.jpg', 'Eating-Frozen-Yogur (7448033168).jpg'] },
    { id: 'thinking', zh: '想一想', en: 'thinking', emoji: '🤔', sentence: { zh: '让我想一想。', en: 'Let me think.' }, wiki: 'Thought', scene: 'child thinking', photos: ['Contemplating boy in with his hand on his chin while thinking (15557042034).jpg'] },
  ],
}
