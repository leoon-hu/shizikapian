/**
 * 首页「安装 识字卡片」提示条（C5）的纯逻辑：显不显示、按环境给哪种做法、「怎么做」面板的步骤。
 * 与 child-education 下另外三个站（AI加词 / 同步练 / 拼音学习机）是同一套规则（2026-09-16 统一）。
 * 不碰 window / 设置，好单测；InstallHint.vue 负责把环境喂进来并画出来。
 */

/** 关掉 / 拒绝之后多久再出现（C5：3 天） */
export const INSTALL_HINT_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000
/** 「永不再显示」（装好了）：JSON 存得下的最大整数，Infinity 会被 JSON.stringify 写成 null */
export const INSTALL_HINT_FOREVER = Number.MAX_SAFE_INTEGER

/**
 * prompt = 拿到 beforeinstallprompt（Android / 电脑 Chromium），按钮「安装」直接弹系统框；
 * inapp  = 微信 / QQ 等内置浏览器，装不了，教他去浏览器打开；
 * ios    = iPhone / iPad，教他点分享 → 添加到主屏幕；
 * menu   = 其它触屏浏览器，「浏览器菜单 → 添加到主屏幕」
 */
export type InstallHintKind = 'prompt' | 'inapp' | 'ios' | 'menu'

export interface InstallHintEnv {
  /** 已从主屏幕打开 */
  standalone: boolean
  /** 触屏设备（pointer: coarse）；电脑只在能一键安装时提示 */
  touch: boolean
  /** 微信 / QQ / 微博 / Facebook / Instagram / LINE 内置浏览器 */
  inApp: boolean
  ios: boolean
  /** 拿到了 beforeinstallprompt */
  hasPrompt: boolean
}

/** null = 不显示。判断顺序就是 C5 的顺序：能一键安装最优先（电脑也算），内置浏览器要先于 iOS（iOS 微信里 ios 也为真） */
export function installHintKind(env: InstallHintEnv, mutedUntil: number, now: number): InstallHintKind | null {
  if (env.standalone || now < mutedUntil) return null
  if (env.hasPrompt) return 'prompt'
  if (!env.touch) return null
  if (env.inApp) return 'inapp'
  if (env.ios) return 'ios'
  return 'menu'
}

/** 「怎么做」面板的一步：文字 + 是否在后面画分享图标 */
export interface InstallStep {
  text: string
  share?: boolean
}

/** 步骤面板的内容（prompt 不需要：直接弹系统框）。iOS 不在 Safari 里先换 Safari；iPad 的分享按钮在右上角 */
export function installSteps(kind: InstallHintKind, opts: { iosSafari: boolean; ipad: boolean }): InstallStep[] {
  switch (kind) {
    case 'inapp':
      return [{ text: '点右上角「···」' }, { text: '选「在浏览器打开」' }, { text: '在浏览器里再按提示安装' }]
    case 'ios':
      return [
        ...(opts.iosSafari ? [] : [{ text: '先用 Safari 打开本站' }]),
        { text: opts.ipad ? '点右上角的分享按钮' : '点底部工具栏的分享按钮', share: true },
        { text: '在菜单里向下找到「添加到主屏幕」' },
        { text: '点右上角「添加」，主屏幕上就会出现图标' },
      ]
    case 'menu':
      return [{ text: '点浏览器的菜单（右上角 ⋮ 或底部 ≡）' }, { text: '选「添加到主屏幕」或「安装应用」' }, { text: '确认添加，桌面上就会出现图标' }]
    default:
      return []
  }
}
