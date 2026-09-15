import { describe, expect, it } from 'vitest'
import { INSTALL_HINT_FOREVER, INSTALL_HINT_SNOOZE_MS, installHintKind, type InstallHintEnv } from '../installHint'

const base: InstallHintEnv = { standalone: false, touch: true, inApp: false, ios: false, hasPrompt: false }
const NOW = 1_700_000_000_000

describe('installHintKind（C5）', () => {
  it('第一次打开（从没关过）就显示，普通触屏浏览器给菜单做法', () => {
    expect(installHintKind(base, 0, NOW)).toBe('menu')
  })

  it('从主屏幕打开、电脑浏览器都不显示', () => {
    expect(installHintKind({ ...base, standalone: true, hasPrompt: true }, 0, NOW)).toBeNull()
    expect(installHintKind({ ...base, touch: false, hasPrompt: true }, 0, NOW)).toBeNull()
  })

  it('拿到安装事件给「安装」按钮，iOS 给分享做法', () => {
    expect(installHintKind({ ...base, hasPrompt: true }, 0, NOW)).toBe('prompt')
    expect(installHintKind({ ...base, ios: true }, 0, NOW)).toBe('ios')
  })

  it('微信 / QQ 内置浏览器优先于 iOS 与安装事件：教他去浏览器打开', () => {
    expect(installHintKind({ ...base, inApp: true, ios: true }, 0, NOW)).toBe('inapp')
    expect(installHintKind({ ...base, inApp: true, hasPrompt: true }, 0, NOW)).toBe('inapp')
  })

  it('关掉后 7 天内不显示，到期再显示；装好后永不显示', () => {
    const muted = NOW + INSTALL_HINT_SNOOZE_MS
    expect(installHintKind(base, muted, NOW)).toBeNull()
    expect(installHintKind(base, muted, muted - 1)).toBeNull()
    expect(installHintKind(base, muted, muted)).toBe('menu')
    expect(installHintKind(base, INSTALL_HINT_FOREVER, Date.now() + 1e13)).toBeNull()
    // 永久值要能原样存进 JSON（Infinity 会变 null）
    expect(JSON.parse(JSON.stringify({ t: INSTALL_HINT_FOREVER })).t).toBe(INSTALL_HINT_FOREVER)
  })
})
