import { describe, expect, it } from 'vitest'
import { INSTALL_HINT_FOREVER, INSTALL_HINT_SNOOZE_MS, installHintKind, installSteps, type InstallHintEnv } from '../installHint'

const base: InstallHintEnv = { standalone: false, touch: true, inApp: false, ios: false, hasPrompt: false }
const NOW = 1_700_000_000_000

describe('installHintKind（C5，四个站统一的规则）', () => {
  it('第一次打开（从没关过）就显示，普通触屏浏览器给菜单做法', () => {
    expect(installHintKind(base, 0, NOW)).toBe('menu')
  })

  it('拿到安装事件最优先：电脑、内置浏览器、iOS 里拿到了也是「安装」', () => {
    expect(installHintKind({ ...base, hasPrompt: true }, 0, NOW)).toBe('prompt')
    expect(installHintKind({ ...base, hasPrompt: true, touch: false }, 0, NOW)).toBe('prompt')
    expect(installHintKind({ ...base, hasPrompt: true, inApp: true, ios: true }, 0, NOW)).toBe('prompt')
  })

  it('从主屏幕打开不显示；电脑没有安装事件不显示', () => {
    expect(installHintKind({ ...base, standalone: true, hasPrompt: true }, 0, NOW)).toBeNull()
    expect(installHintKind({ ...base, touch: false }, 0, NOW)).toBeNull()
    expect(installHintKind({ ...base, touch: false, ios: true }, 0, NOW)).toBeNull()
  })

  it('内置浏览器先于 iOS：iOS 微信里也教去浏览器打开；iOS 给分享做法', () => {
    expect(installHintKind({ ...base, inApp: true, ios: true }, 0, NOW)).toBe('inapp')
    expect(installHintKind({ ...base, inApp: true }, 0, NOW)).toBe('inapp')
    expect(installHintKind({ ...base, ios: true }, 0, NOW)).toBe('ios')
  })

  it('关掉后 3 天内不显示，到期再显示；装好后永不显示', () => {
    expect(INSTALL_HINT_SNOOZE_MS).toBe(3 * 24 * 3600 * 1000)
    const muted = NOW + INSTALL_HINT_SNOOZE_MS
    expect(installHintKind(base, muted, NOW)).toBeNull()
    expect(installHintKind(base, muted, muted - 1)).toBeNull()
    expect(installHintKind(base, muted, muted)).toBe('menu')
    expect(installHintKind({ ...base, hasPrompt: true }, INSTALL_HINT_FOREVER, Date.now() + 1e13)).toBeNull()
    // 永久值要能原样存进 JSON（Infinity 会变 null）
    expect(JSON.parse(JSON.stringify({ t: INSTALL_HINT_FOREVER })).t).toBe(INSTALL_HINT_FOREVER)
  })
})

describe('installSteps（「怎么做」面板）', () => {
  it('iOS 在 Safari 里三步、第一步画分享图标；不在 Safari 里先换 Safari；iPad 分享按钮在右上角', () => {
    const safari = installSteps('ios', { iosSafari: true, ipad: false })
    expect(safari).toHaveLength(3)
    expect(safari[0]).toEqual({ text: '点底部工具栏的分享按钮', share: true })
    const chrome = installSteps('ios', { iosSafari: false, ipad: true })
    expect(chrome).toHaveLength(4)
    expect(chrome[0]?.text).toContain('Safari')
    expect(chrome[1]).toEqual({ text: '点右上角的分享按钮', share: true })
  })
  it('内置浏览器与其它浏览器各三步；prompt 不需要步骤', () => {
    expect(installSteps('inapp', { iosSafari: false, ipad: false }).map((s) => s.text)[1]).toContain('在浏览器打开')
    expect(installSteps('menu', { iosSafari: false, ipad: false })).toHaveLength(3)
    expect(installSteps('prompt', { iosSafari: false, ipad: false })).toEqual([])
  })
})
