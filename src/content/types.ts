/** 一张卡片：图 + 中文词 + 英文词 + 一句例句。图片、照片与音频按 id 约定路径查找（见 paths.ts） */
export interface Card {
  /** 全局唯一，英文小写与连字符；图片、音频文件名都用它 */
  id: string
  /** 中文词，口语叫法，优先双音节 */
  zh: string
  /** 英文词，小写，名词单数（习惯成对的用复数） */
  en: string
  /** 常用例句（N8）：读完词接着读它；孩子平时会听到的短句 */
  sentence: { zh: string; en: string }
  /**
   * 图片来源：有 emoji 的由 scripts/images.ts 从开源图集拷 SVG；
   * 没有的（颜色 / 形状 / 数字 / 草）由 scripts/draw.ts 自绘。运行时不用这个字段
   */
  emoji?: string
  /** 送给 TTS 的文本，与显示的词不同时才写（读音不准时用同音字替换）；运行时不用 */
  say?: Partial<Record<Lang, string>>
  /** 找照片用的英文维基百科条目名，默认是英文词首字母大写；运行时不用（N9） */
  wiki?: string
  /** 找照片用的场景短语（英文，和例句对应，如 'rabbit eating carrot'），照片优先按它搜；运行时不用（N9） */
  scene?: string
  /**
   * 手选的照片（Wikimedia Commons 文件名，不带 File: 前缀）；不写则由 scripts/photos.ts 自动挑。
   * 空数组 = 这张卡不配照片。运行时不用
   */
  photos?: string[]
}

export interface Category {
  /** 全局唯一，英文小写 */
  id: string
  name: { zh: string; en: string }
  /** 分类方砖图标的来源 emoji，生成脚本用；图片文件为 images/cat-<id>.svg */
  emoji: string
  /** 分类主色，用于方砖与卡片页底色 */
  color: string
  /** 同 Card.say */
  say?: Partial<Record<Lang, string>>
  /** false = 整个分类不配照片（数字 / 形状这类抽象内容，照片反而添乱） */
  photos?: false
  cards: Card[]
}

export type Lang = 'zh' | 'en'
export type DisplayMode = 'zh' | 'en' | 'both'
/** 一段朗读是词还是例句 */
export type Part = 'word' | 'sentence'
