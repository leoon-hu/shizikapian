import type { Card, Category, DisplayMode, Lang, Part, PromptId } from '@/content'
import { cardAudio, categoryAudio, promptAudio, prompts } from '@/content'

/** 一段要朗读的内容：先播音频文件，失败退到 Web Speech 读 text */
export interface SpeechItem {
  /** 读的是谁：卡片 id 或 cat-<分类 id>，词区只高亮自己那张卡 */
  key: string
  lang: Lang
  /** 词还是例句（K7 / K8） */
  part: Part
  text: string
  url: string
}

export interface PlanOptions {
  /** 读完词接着读例句（P9，默认开） */
  sentences?: boolean
}

/** 显示模式 → 朗读的语言顺序：中英文模式先中后英 */
export const langsFor = (display: DisplayMode): Lang[] => (display === 'both' ? ['zh', 'en'] : [display])

/** 每种语言：词 → 例句；中英文模式是 中词、中句、英词、英句 */
export const planCard = (card: Card, display: DisplayMode, opts: PlanOptions = {}): SpeechItem[] =>
  langsFor(display).flatMap((lang) => {
    const items: SpeechItem[] = [{ key: card.id, lang, part: 'word', text: card[lang], url: cardAudio(card, lang) }]
    if (opts.sentences !== false) {
      items.push({ key: card.id, lang, part: 'sentence', text: card.sentence[lang], url: cardAudio(card, lang, 'sentence') })
    }
    return items
  })

export const planCategory = (cat: Category, display: DisplayMode): SpeechItem[] =>
  langsFor(display).map((lang) => ({ key: `cat-${cat.id}`, lang, part: 'word', text: cat.name[lang], url: categoryAudio(cat, lang) }))

/** 小测验的一句提示语（T7），key 是 q-<id> */
export const promptItem = (id: PromptId, lang: Lang): SpeechItem => ({ key: `q-${id}`, lang, part: 'word', text: prompts[id][lang], url: promptAudio(id, lang) })
const wordItem = (card: Card, lang: Lang): SpeechItem => ({ key: card.id, lang, part: 'word', text: card[lang], url: cardAudio(card, lang) })

/**
 * 小测验：提示语 + 词（T3 / T4 / T5）。每种语言都是「提示语 → 词」，中英文模式先中后英；
 * 找对了（right）在词后面再接例句（读例句开着时）
 */
export const planQuiz = (id: PromptId, card: Card, display: DisplayMode, opts: PlanOptions = {}): SpeechItem[] =>
  langsFor(display).flatMap((lang) => {
    const items = [promptItem(id, lang), wordItem(card, lang)]
    if (id === 'right' && opts.sentences !== false) {
      items.push({ key: card.id, lang, part: 'sentence', text: card.sentence[lang], url: cardAudio(card, lang, 'sentence') })
    }
    return items
  })
/** 一轮做完（T6） */
export const planDone = (display: DisplayMode): SpeechItem[] => langsFor(display).map((lang) => promptItem('done', lang))

/** 进入分类时要预加载的全部音频（分类名 + 每张卡片 + 小测验提示语，只取当前显示模式用到的语言） */
export const preloadList = (cat: Category, display: DisplayMode, opts: PlanOptions = {}): string[] => [
  ...planCategory(cat, display).map((i) => i.url),
  ...cat.cards.flatMap((card) => planCard(card, display, opts).map((i) => i.url)),
  ...langsFor(display).flatMap((lang) => (['find', 'right', 'wrong', 'hint', 'done'] as PromptId[]).map((id) => promptAudio(id, lang))),
]
