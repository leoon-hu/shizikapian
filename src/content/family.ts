import type { Category } from './types'

export const family: Category = {
  id: 'family',
  name: { zh: '家人', en: 'family' },
  emoji: '👨‍👩‍👧',
  color: '#ce93d8',
  cards: [
    { id: 'daddy', zh: '爸爸', en: 'daddy', emoji: '👨', sentence: { zh: '爸爸抱抱我。', en: 'Daddy hugs me.' }, wiki: 'Father', scene: 'father hugging child', say: { zh: '[爸爸]，抱抱我。' }, photos: ['Father and son 27.jpg', 'Father\'s love (cropped).jpg'] },
    { id: 'mommy', zh: '妈妈', en: 'mommy', emoji: '👩', sentence: { zh: '妈妈亲亲我。', en: 'Mommy kisses me.' }, wiki: 'Mother', scene: 'mother kissing baby', say: { zh: '[妈妈]，亲亲我。' }, photos: ['Mother kissing her child.jpg', 'Young mother smiling while holding her baby in Laos.jpg'] },
    { id: 'grandpa', zh: '爷爷', en: 'grandpa', emoji: '👴', sentence: { zh: '爷爷笑眯眯。', en: 'Grandpa is smiling.' }, wiki: 'Grandparent', scene: 'grandfather smiling', say: { zh: '[爷爷]，笑眯眯。' }, photos: ['Fishmonger smiling.jpg', 'Bratan Bali Indonesia Grandfather-and-grandson-after-Puja-01.jpg'] },
    { id: 'grandma', zh: '奶奶', en: 'grandma', emoji: '👵', sentence: { zh: '奶奶做饭真香。', en: 'Grandma cooks yummy food.' }, wiki: 'Grandparent', scene: 'grandmother cooking', say: { zh: '[奶奶]，做饭真香。' }, photos: ['Taste-testing the cookie dough with Grandm.jpg', 'Grandparents Wendy Berry.jpg'] },
    { id: 'grandpa-m', zh: '外公', en: 'grandpa', emoji: '👨‍🦳', sentence: { zh: '外公带我去公园。', en: 'Grandpa takes me to the park.' }, wiki: 'Grandparent', scene: 'grandfather with child park', photos: ['Grandpa and Grandson.jpg', 'Grandfather and grandchild in Goa.jpg'] },
    { id: 'grandma-m', zh: '外婆', en: 'grandma', emoji: '👩‍🦳', sentence: { zh: '外婆给我讲故事。', en: 'Grandma tells me a story.' }, wiki: 'Grandparent', scene: 'grandmother reading to child', photos: ['Grandmother and grandchild2.jpg', 'Grandmother and Grandchild.jpg'] },
    { id: 'brother', zh: '哥哥', en: 'brother', emoji: '👦', sentence: { zh: '哥哥陪我玩。', en: 'My brother plays with me.' }, wiki: 'Sibling', scene: 'boys playing together', say: { zh: '[哥哥]，陪我玩。' }, photos: ['Haitian brothers.jpg', 'Big brother holding little brother\'s hand walking home from school, Shiraz, Iran (15515926721).jpg'] },
    { id: 'sister', zh: '姐姐', en: 'sister', emoji: '👧', sentence: { zh: '姐姐牵着我的手。', en: 'My sister holds my hand.' }, wiki: 'Sibling', scene: 'girl holding hand child', say: { zh: '[姐姐]，牵着我的手。' }, photos: ['Me and my other brother.jpg', 'Dandelion Sisters.jpg'] },
    { id: 'baby', zh: '宝宝', en: 'baby', emoji: '👶', sentence: { zh: '宝宝在睡觉。', en: 'The baby is sleeping.' }, wiki: 'Infant', scene: 'baby sleeping', say: { zh: '[宝宝]，在睡觉。' }, photos: ['Newborn baby sleeps in a basket.jpg', 'Being a twin means you always have a pillow or blanket handy.jpg'] },
    { id: 'uncle', zh: '叔叔', en: 'uncle', emoji: '👨‍🦱', sentence: { zh: '叔叔你好！', en: 'Hello, uncle!' }, wiki: 'Uncle', scene: 'man waving hello', say: { zh: '[叔叔]，你好！' }, photos: ['Smiling Man (Imagicity 97).jpg', 'Young men smiling with teeth, studio portrait.jpg'] },
    { id: 'aunt', zh: '阿姨', en: 'auntie', emoji: '👩‍🦰', sentence: { zh: '阿姨再见！', en: 'Bye bye, auntie!' }, wiki: 'Aunt', scene: 'woman waving', photos: ['Older woman waves goodbye while preparing to travel in a cozy camper van interior.jpg', 'Woman waves while talking on the phone outside a building with a yellow wall.jpg'] },
    { id: 'family-all', zh: '一家人', en: 'family', emoji: '👨‍👩‍👧', sentence: { zh: '我们是一家人。', en: 'We are a family.' }, wiki: 'Family', scene: 'parents and toddler family portrait', photos: ['Family Picnic (52842627487).jpg', 'A family on a four seater bike.jpg'] },
  ],
}
