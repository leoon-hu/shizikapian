import type { Category } from './types'

/** 动词：3 岁孩子学说话最缺的一类，其它分类全是名词 */
export const actions: Category = {
  id: 'actions',
  name: { zh: '动作', en: 'actions' },
  emoji: '🏃',
  color: '#9575cd',
  cards: [
    { id: 'run', zh: '跑', en: 'run', emoji: '🏃', sentence: { zh: '我们跑一跑。', en: 'Let\'s run.' }, wiki: 'Running', scene: 'children running', photos: ['Girls running.jpg', 'Child running on hillside.jpg'] },
    { id: 'walk', zh: '走', en: 'walk', emoji: '🚶', sentence: { zh: '我们走一走。', en: 'Let\'s walk.' }, wiki: 'Walking', scene: 'child walking', photos: ['-mypubliclandsroadtrip 2016- Get outdoors Baby, King Range National Conservation Area (28487604443).jpg', 'SAKURAKO - Running! (4695696539).jpg'] },
    { id: 'hug', zh: '抱抱', en: 'hug', emoji: '🫂', sentence: { zh: '抱抱我。', en: 'Give me a hug.' }, wiki: 'Hug', scene: 'mother hugging child', photos: ['Flickr - The U.S. Army - A mother\'s love.jpg', 'Nittaya Wongsin With Child Jiang Wongsin Wandeegroup Office 2011.jpg'] },
    { id: 'bye', zh: '再见', en: 'bye bye', emoji: '👋', sentence: { zh: '再见，明天见。', en: 'Bye bye, see you tomorrow.' }, wiki: 'Wave (gesture)', scene: 'child waving goodbye', photos: ['Waving RCMP (7612733982) (cropped).jpg', 'US Navy 100601-N-6674H-008 A child waves goodbye as the guided-missile destroyer USS Chung-Hoon (DDG 93) departs on a deployment to the western Pacific Ocean.jpg'] },
    { id: 'clap', zh: '拍手', en: 'clap', emoji: '👏', sentence: { zh: '拍拍手。', en: 'Clap your hands.' }, wiki: 'Clapping', scene: 'child clapping hands', photos: ['Hands-Clapping.jpg', 'Belit Onay 2025 - 02.jpg'] },
    { id: 'sleep', zh: '睡觉', en: 'sleep', emoji: '🛌', sentence: { zh: '该睡觉了。', en: 'Time to sleep.' }, wiki: 'Sleep', scene: 'child sleeping', photos: ['A child sleeping.jpg', 'Lion and lioness sleeping.JPG'] },
    { id: 'bath', zh: '洗澡', en: 'bath', emoji: '🛀', sentence: { zh: '该洗澡了。', en: 'Time for a bath.' }, wiki: 'Bathing', scene: 'child bath', photos: ['Bubble bath.jpg', 'Kelksemajna bebo en kuvo (Havano).jpg'] },
    { id: 'climb', zh: '爬', en: 'climb', emoji: '🧗', sentence: { zh: '往上爬。', en: 'Climb up.' }, wiki: 'Climbing', scene: 'child climbing', photos: ['Child-Climbing-8672.jpg', 'SAKURAKO and KOUHEI. (14105923301).jpg'] },
    { id: 'dance', zh: '跳舞', en: 'dance', emoji: '💃', sentence: { zh: '我们跳舞吧。', en: 'Let\'s dance.' }, wiki: 'Dance', scene: 'children dancing', photos: ['Children dancing, Geneva.jpg', 'Shrinika performing Abhinaya (Kede Chhanda Janilu Tuhi).jpg'] },
    { id: 'sing', zh: '唱歌', en: 'sing', emoji: '🎤', sentence: { zh: '我们唱歌吧。', en: 'Let\'s sing a song.' }, wiki: 'Singing', scene: 'child singing', photos: ['Girl singing at a concert at school Russia 2021.jpg', 'Ah cricket 20122 (7364759010).jpg'] },
    { id: 'slide', zh: '滑滑梯', en: 'slide', emoji: '🛝', sentence: { zh: '我要玩滑滑梯。', en: 'I want to go down the slide.' }, wiki: 'Playground slide', scene: 'child playground slide', photos: ['Japanese child - various situations - 20172016 - 04.jpg', 'Playground Slide Metal.jpg'] },
    { id: 'swim', zh: '游泳', en: 'swim', emoji: '🏊', sentence: { zh: '我们去游泳。', en: 'Let\'s go swimming.' }, wiki: 'Swimming', scene: 'child swimming', photos: ['Child jumps into a pool while another child swims nearby.jpg', 'Avishag Turek in training camp Eilat Israel.jpg'] },
    { id: 'ride', zh: '骑车', en: 'ride', emoji: '🚴', sentence: { zh: '我会骑车。', en: 'I can ride a bike.' }, wiki: 'Cycling', scene: 'child riding bicycle', photos: ['Child bicycle Managing ports Altagracia.jpg', 'Boy on bicycle.jpg'] },
    { id: 'raise-hand', zh: '举手', en: 'raise hand', emoji: '🙋', sentence: { zh: '请举手。', en: 'Raise your hand.' }, wiki: 'Raised hand', scene: 'child raising hand', photos: ['1964 Hammond Slides Student Raising Hand.jpg', 'Students raise hands (25564212661).jpg'] },
    { id: 'shake-hands', zh: '握手', en: 'shake hands', emoji: '🤝', sentence: { zh: '握握手。', en: 'Shake hands.' }, wiki: 'Handshake', scene: 'handshake', photos: ['Handshake - Men - 38826275042.jpg', 'Handshake (Workshop Cologne \'06).jpeg'] },
    { id: 'cartwheel', zh: '翻跟头', en: 'cartwheel', emoji: '🤸', sentence: { zh: '翻个跟头。', en: 'Do a cartwheel.' }, wiki: 'Cartwheel (gymnastics)', scene: 'child cartwheel', photos: ['Cartwheel.jpg'] },
  ],
}
