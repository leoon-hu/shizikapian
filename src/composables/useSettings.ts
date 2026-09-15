import { reactive, watch } from 'vue'
import type { DisplayMode } from '@/content'
import { categories } from '@/content'

/** 本机唯一存储 key；结构变了就升 version 并在 load 里迁移。key 里的 v1 是存储位置，不是结构版本 */
const STORAGE_KEY = 'shizikapian:v1'

export interface Settings {
  version: 4
  /** 卡片显示 中文 / 英文 / 中英文，朗读跟随 */
  display: DisplayMode
  /** 切到新卡片时自动朗读；关掉后只有点「再听一遍」或点图才读 */
  autoSpeak: boolean
  /** 家长隐藏的分类 id；首页只显示其余的（至少留一个，由设置页保证） */
  hiddenCategories: string[]
  /** 家长进过一次设置页；之前首页会有一行「家长设置：长按 ⚙」的静态提示 */
  settingsSeen: boolean
  /** 读完词接着读例句、卡片上显示例句（P9）；关掉只读词 */
  sentences: boolean
  /** 卡片页显示小测验入口（P11） */
  quiz: boolean
}

const DEFAULTS: Settings = { version: 4, display: 'zh', autoSpeak: true, hiddenCategories: [], settingsSeen: false, sentences: true, quiz: true }
const DISPLAY_MODES: DisplayMode[] = ['zh', 'en', 'both']

/** 只留下内容里还存在的分类 id：分类改名 / 删掉后旧设置不会留下幽灵项 */
function sanitizeHidden(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const known = new Set(categories.map((c) => c.id))
  return raw.filter((id): id is string => typeof id === 'string' && known.has(id))
}

/** v1 没有 hiddenCategories / settingsSeen，v2 没有 sentences，v3 没有 quiz：缺的字段一律补默认值，所以升版本与「字段损坏」走同一条路 */
function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      version: 4,
      display: DISPLAY_MODES.includes(parsed.display as DisplayMode) ? (parsed.display as DisplayMode) : DEFAULTS.display,
      autoSpeak: typeof parsed.autoSpeak === 'boolean' ? parsed.autoSpeak : DEFAULTS.autoSpeak,
      hiddenCategories: sanitizeHidden(parsed.hiddenCategories),
      settingsSeen: typeof parsed.settingsSeen === 'boolean' ? parsed.settingsSeen : DEFAULTS.settingsSeen,
      sentences: typeof parsed.sentences === 'boolean' ? parsed.sentences : DEFAULTS.sentences,
      quiz: typeof parsed.quiz === 'boolean' ? parsed.quiz : DEFAULTS.quiz,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

const settings = reactive<Settings>(load())

watch(
  settings,
  (s) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      /* 隐私模式等存不了就算了，本次会话仍生效 */
    }
  },
  { deep: true },
)

/** 全局单例：所有页面共用同一份设置 */
export function useSettings() {
  return settings
}
