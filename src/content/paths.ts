import type { Card, Category, Lang, Part } from './types'
import type { PromptId } from './prompts'
import photoCounts from './photos.json'

/** 静态资源都是相对路径（base './'），hash 路由不改变路径，直接从 index.html 所在目录找 */
const base = import.meta.env.BASE_URL

export const cardImage = (card: Card) => `${base}images/${card.id}.svg`
export const categoryImage = (cat: Category) => `${base}images/cat-${cat.id}.svg`
/** 词在 audio/<lang>/<id>.mp3，例句在 audio/<lang>/sentences/<id>.mp3 */
export const cardAudio = (card: Card, lang: Lang, part: Part = 'word') =>
  part === 'word' ? `${base}audio/${lang}/${card.id}.mp3` : `${base}audio/${lang}/sentences/${card.id}.mp3`
export const categoryAudio = (cat: Category, lang: Lang) => `${base}audio/${lang}/cat-${cat.id}.mp3`
/** 小测验提示语在 audio/<lang>/q-<id>.mp3（T7） */
export const promptAudio = (id: PromptId, lang: Lang) => `${base}audio/${lang}/q-${id}.mp3`
/** 这张卡有几张照片由生成脚本写进 photos.json；文件为 photos/<id>-1.webp、-2.webp */
export const cardPhotos = (card: Card): string[] => {
  const n = (photoCounts as Record<string, number>)[card.id] ?? 0
  return Array.from({ length: n }, (_, i) => `${base}photos/${card.id}-${i + 1}.webp`)
}
