import type { Category } from './types'

export const body: Category = {
  id: 'body',
  name: { zh: '身体', en: 'body' },
  emoji: '👀',
  color: '#f48fb1',
  cards: [
    { id: 'eyes', zh: '眼睛', en: 'eyes', emoji: '👀', sentence: { zh: '我用眼睛看。', en: 'I see with my eyes.' }, wiki: 'Eye', scene: 'child eyes', photos: ['003 2016 02 23 Augenpflege.jpg', 'Smiling Eyes (Unsplash).jpg'] },
    { id: 'ear', zh: '耳朵', en: 'ear', emoji: '👂', sentence: { zh: '我用耳朵听。', en: 'I hear with my ears.' }, scene: 'child ear', photos: ['Human right ear (cropped).jpg'] },
    { id: 'nose', zh: '鼻子', en: 'nose', emoji: '👃', sentence: { zh: '我用鼻子闻。', en: 'I smell with my nose.' }, wiki: 'Human nose', scene: 'child nose', photos: ['Smiling girl holding a lotus flower.jpg', 'A curious child, smelling flower, India.jpg'] },
    { id: 'mouth', zh: '嘴巴', en: 'mouth', emoji: '👄', sentence: { zh: '我用嘴巴吃饭。', en: 'I eat with my mouth.' }, wiki: 'Human mouth', scene: 'child eating', photos: ['Yogurt Face 4884 (3756259617).jpg'] },
    { id: 'tongue', zh: '舌头', en: 'tongue', emoji: '👅', sentence: { zh: '伸出舌头。', en: 'Stick out your tongue.' }, scene: 'child sticking out tongue', photos: ['Child tongue.jpg', 'Rolled tongue flikr.jpg'] },
    { id: 'tooth', zh: '牙齿', en: 'tooth', emoji: '🦷', sentence: { zh: '每天要刷牙。', en: 'Brush your teeth every day.' }, wiki: 'Human tooth', scene: 'child brushing teeth', photos: ['Annoyed Girl Brushing Teeth.jpg', '06-10-06smile.jpg'] },
    { id: 'head', zh: '头', en: 'head', emoji: '🧒', sentence: { zh: '点点头。', en: 'Nod your head.' }, wiki: 'Human head', scene: 'child head', photos: ['Gracyn Shinyei - 2013.jpg', 'Girl on a Train, Madagascar (22680173276).jpg'] },
    { id: 'hand', zh: '小手', en: 'hand', emoji: '✋', sentence: { zh: '洗洗小手。', en: 'Wash your hands.' }, scene: 'child washing hands', photos: ['Child washing hands closeup.jpg', 'Playing with hands.JPG'] },
    { id: 'finger', zh: '手指', en: 'finger', emoji: '☝️', sentence: { zh: '我有十个手指。', en: 'I have ten fingers.' }, scene: 'child fingers', photos: ['Child shows hand with fingers spread in classroom setting during art activity.jpg', 'Human fingers both sides 2.jpg'] },
    { id: 'arm', zh: '胳膊', en: 'arm', emoji: '💪', sentence: { zh: '举起胳膊。', en: 'Raise your arms.' }, scene: 'child raising arms', photos: ['Happy child finds joy.jpg', 'Arm2.jpg'] },
    { id: 'leg', zh: '腿', en: 'leg', emoji: '🦵', sentence: { zh: '腿可以跑。', en: 'I run with my legs.' }, wiki: 'Human leg', scene: 'child running', photos: ['A male child running.jpg', 'Boy run.jpg'] },
    { id: 'foot', zh: '小脚', en: 'foot', emoji: '🦶', sentence: { zh: '跺跺小脚。', en: 'Stomp your feet.' }, scene: 'baby feet', photos: ['Sole of foot of a two week old Asian infant on a white bed sheet, focus stacking (2).jpg', 'Baby Feet on Granite.JPG'] },
  ],
}
