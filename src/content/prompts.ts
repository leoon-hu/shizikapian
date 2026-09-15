import type { Lang } from './types'

/**
 * 小测验的固定提示语（T7）：中英各一段预合成音频 audio/<lang>/q-<id>.mp3，
 * 后面直接接词的音频拼着播（「哪个是」→「小狗」），所以句末不加标点、是接着说的语气。
 * 纯数据：合成脚本与运行时都 import 它。
 */
export const prompts = {
  /** 出题：「哪个是」+ 词 */
  find: { zh: '哪个是', en: 'Which one is' },
  /** 找对了：「对啦！」+ 词（+ 例句） */
  right: { zh: '对啦！', en: 'Yes!' },
  /** 找错了：「再试试。」+ 词 */
  wrong: { zh: '再试试。', en: 'Try again.' },
  /** 第二次找错后指给孩子看：「这个是」+ 词 */
  hint: { zh: '这个是', en: 'This is' },
  /** 一轮做完 */
  done: { zh: '全都找到啦！', en: 'You found them all!' },
} satisfies Record<string, Record<Lang, string>>

export type PromptId = keyof typeof prompts
export const promptIds = Object.keys(prompts) as PromptId[]
