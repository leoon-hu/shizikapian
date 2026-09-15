import type { Category } from './types'

export const home: Category = {
  id: 'home',
  name: { zh: '家里', en: 'home' },
  emoji: '🏠',
  color: '#ffab91',
  cards: [
    { id: 'door', zh: '门', en: 'door', emoji: '🚪', sentence: { zh: '请把门关上。', en: 'Please close the door.' }, scene: 'front door', photos: ['Red-painted front door and mailbox, Burano.jpg', 'Red House Museum 006.JPG'] },
    { id: 'window', zh: '窗户', en: 'window', emoji: '🪟', sentence: { zh: '打开窗户。', en: 'Open the window.' }, scene: 'open window', photos: ['Fischerkirche (window), Born a. Darß.jpg', 'Gordijnen aan venster.JPG'] },
    { id: 'sofa', zh: '沙发', en: 'sofa', emoji: '🛋️', sentence: { zh: '坐在沙发上。', en: 'Sit on the sofa.' }, wiki: 'Couch', scene: 'sofa living room', photos: ['Couch-furniture-living-room-sofa (24300293356).jpg', 'Cozy living room setup with a warm sofa, coffee cup, and an open book in a softly lit environment.jpg'] },
    { id: 'chair', zh: '椅子', en: 'chair', emoji: '🪑', sentence: { zh: '椅子有四条腿。', en: 'The chair has four legs.' }, scene: 'chair', photos: ['Silla-Abuelo.jpg', 'Santorin (GR), Fira -- 2017 -- 2598.jpg'] },
    { id: 'bed', zh: '床', en: 'bed', emoji: '🛏️', sentence: { zh: '该上床睡觉了。', en: 'Time for bed.' }, scene: 'child sleeping bed', photos: ['Imagerrrrrr.jpg', 'A child sleeping.jpg'] },
    { id: 'lamp', zh: '灯', en: 'light', emoji: '💡', sentence: { zh: '打开灯。', en: 'Turn on the light.' }, wiki: 'Lamp', scene: 'lamp light', photos: ['Lamp with a lampshade illuminated by sunlight.jpg', 'Münster, Prinzipalmarkt, Ratskeller -- 2024 -- 6795.jpg'] },
    { id: 'tv', zh: '电视', en: 'tv', emoji: '📺', sentence: { zh: '少看电视。', en: 'Not too much TV.' }, wiki: 'Television set', scene: 'television', photos: ['Mirai LCD TV.JPG', 'Flat Screen TV (279407707).jpg'] },
    { id: 'clock', zh: '闹钟', en: 'clock', emoji: '⏰', sentence: { zh: '闹钟响了，起床啦。', en: 'The alarm rings, wake up!' }, wiki: 'Alarm clock', scene: 'alarm clock', photos: ['Classic alarm clock 20180513.jpg', '2010-07-20 Black windup alarm clock face.jpg'] },
    { id: 'toilet', zh: '马桶', en: 'toilet', emoji: '🚽', sentence: { zh: '我要上厕所。', en: 'I need the potty.' }, wiki: 'Flush toilet', scene: 'toilet', photos: ['Hotel bathroom with toilet, toilet brush, and toilet paper in hotel in Os, Hordaland, Norway 2018-03-19 E. Also wall and floor tiles.jpg', 'Toilet, toilet paper, toilet brush, etc. in a bathroom in small hotel in Tysnes, Hordaland, Norway 2018-03-18 C. Also wall and floor tiles.jpg'] },
    { id: 'bathtub', zh: '浴缸', en: 'bathtub', emoji: '🛁', sentence: { zh: '在浴缸里洗澡。', en: 'Bath in the bathtub.' }, scene: 'bathtub', photos: ['Bathtub of Khan Pool Suite in Amantaka luxury Resort & Hotel in Luang Prabang Laos.jpg', 'Bubble bath.jpg'] },
    { id: 'mirror', zh: '镜子', en: 'mirror', emoji: '🪞', sentence: { zh: '照照镜子。', en: 'Look in the mirror.' }, scene: 'child mirror', photos: ['Mirror baby.jpg', 'Mirror, Mirror - Flickr - Lisa Zins.jpg'] },
    { id: 'shower', zh: '花洒', en: 'shower', emoji: '🚿', sentence: { zh: '花洒哗哗哗。', en: 'Take a shower.' }, scene: 'shower', photos: ['Showerhead.JPG', 'High speed shower filtered.jpg'] },
    { id: 'broom', zh: '扫帚', en: 'broom', emoji: '🧹', sentence: { zh: '用扫帚扫地。', en: 'Sweep with a broom.' }, scene: 'sweeping broom', photos: ['Hue Vietnam Broom-in-Càn-Thành-Palace-01.jpg', 'BroomsforSale.jpg'] },
    { id: 'bucket', zh: '水桶', en: 'bucket', emoji: '🪣', sentence: { zh: '水桶里有水。', en: 'Water in the bucket.' }, scene: 'bucket water', photos: ['Gotland-Bottarve Museumshof 07.jpg'] },
    { id: 'toilet-paper', zh: '卫生纸', en: 'toilet paper', emoji: '🧻', sentence: { zh: '用卫生纸擦一擦。', en: 'Wipe with toilet paper.' }, scene: 'toilet paper roll', photos: ['Toilet paper orientation over.jpg', 'Toiletpapier (Gobran111).jpg'] },
    { id: 'trash-can', zh: '垃圾桶', en: 'trash can', emoji: '🗑️', sentence: { zh: '垃圾扔进垃圾桶。', en: 'Put trash in the trash can.' }, wiki: 'Waste container', scene: 'kitchen trash can', photos: ['Poubelle à pédale (et à roulettes) novembre 2021 en France.jpg', '2015 Madeira Samsung (48).jpg'] },
  ],
}
