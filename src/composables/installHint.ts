/**
 * 首页「安装到手机」提示条（C5）的纯逻辑：显不显示、按设备给哪种做法。
 * 不碰 window / 设置，好单测；InstallHint.vue 负责把环境喂进来并画出来。
 */

/** 关掉提示条后多久再出现（C5：7 天） */
export const INSTALL_HINT_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000
/** 「永不再显示」（装好了）：JSON 存得下的最大整数，Infinity 会被 JSON.stringify 写成 null */
export const INSTALL_HINT_FOREVER = Number.MAX_SAFE_INTEGER

/**
 * prompt = Android Chrome / Edge 给了安装事件，显示「安装」按钮；
 * inapp = 微信 / QQ 内置浏览器，装不了，教他去浏览器打开；
 * ios = iPhone / iPad，教他点分享 → 添加到主屏幕；
 * menu = 其它触屏浏览器，「浏览器菜单 → 添加到主屏幕」
 */
export type InstallHintKind = 'prompt' | 'inapp' | 'ios' | 'menu'

export interface InstallHintEnv {
  /** 已从主屏幕打开 */
  standalone: boolean
  /** 触屏设备（pointer: coarse）；电脑浏览器不提示 */
  touch: boolean
  /** 微信 / QQ 内置浏览器 */
  inApp: boolean
  ios: boolean
  /** 拿到了 beforeinstallprompt */
  hasPrompt: boolean
}

/** null = 不显示。内置浏览器要先于 iOS 判断：iOS 微信里 isIOS 也为真，但分享菜单里没有「添加到主屏幕」 */
export function installHintKind(env: InstallHintEnv, mutedUntil: number, now: number): InstallHintKind | null {
  if (env.standalone || !env.touch || now < mutedUntil) return null
  if (env.inApp) return 'inapp'
  if (env.hasPrompt) return 'prompt'
  if (env.ios) return 'ios'
  return 'menu'
}
