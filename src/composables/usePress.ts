/**
 * 孩子用的按钮 / 方砖的「点按」判定，不依赖浏览器合成的 click：
 * 浏览器只为第一根手指合成 click，屏幕上另有一根手指搁着（拇指压在边上、家长托着 iPad）、两根手指一起拍下去、
 * 按下去手指滚了十几像素，都不会有 click，整页看起来像死了。这里用指针事件自己判：落在元素上的那根手指
 * 抬起时仍在元素（外扩 SLOP_PX）内就算一下，其它手指不影响。
 *
 * 规则（K3 / K9）：
 * - 整页共用一把锁（按钮、方砖、图片区 / 词区）：同一时刻只认一根手指，手掌横跨图片区和三个按钮、两指同拍都只算一下；
 * - 已经有手指按着时，后落下的手指不算——除非先前那根已经搁了超过 HOLD_MS（那是手掌 / 拇指，改认后来的）；
 * - 按住超过 HOLD_MS 再抬起不算（手掌搁在屏幕上）；
 * - click 只在没有对应 pointerup 时才当作一次点按（键盘 Enter / 空格、辅助技术）。
 *
 * primaryViaClick：主指针仍走浏览器的 click（首页方砖用——点方砖是 iOS 上解锁音频的第一次手势，保留已验证的路径），
 * 只给非主指针补 pointerup；这时同一块砖上的第二根手指也算（两指一起拍一块砖时主指针没有 click）。
 */

/** 抬起点离元素边缘多远以内还算点在上面：孩子手指粗、按下去会滚一下 */
const SLOP_PX = 16
/** 按住超过这么久再抬起不算操作，先前那根搁了这么久后来的才算：与卡片页图片区的规则一致 */
export const HOLD_MS = 1500
/** pointerup 之后多久内的 click 视为同一次手势 */
const CLICK_AFTER_UP_MS = 500

/** 整页共用（按钮、方砖、卡片页的图片区 / 词区）：当前持有手指的元素、指针与按下时刻 */
let held: { el: Element; id: number; at: number } | null = null

/**
 * 一根手指按下时问一句「现在算不算你」：没人按着、或先前那根已经搁了超过 HOLD_MS（手掌 / 拇指）就算；
 * allowSameEl = 同一元素上的第二根手指也算（首页方砖用，见 primaryViaClick）
 */
export function claimPointer(el: Element, id: number, allowSameEl = false): boolean {
  const now = performance.now()
  if (held && now - held.at <= HOLD_MS && !(allowSameEl && held.el === el)) return false
  held = { el, id, at: now }
  return true
}
export function releasePointer(id: number) {
  if (held?.id === id) held = null
}
// 手指在哪里抬起 / 被取消都要放锁：没捕获指针的元素（首页方砖的主指针）手指滑出去再抬起，元素自己收不到 pointerup
if (typeof document !== 'undefined') {
  document.addEventListener('pointerup', (e) => releasePointer(e.pointerId), true)
  document.addEventListener('pointercancel', (e) => releasePointer(e.pointerId), true)
}

export function usePress(onPress: () => void, opts: { primaryViaClick?: boolean } = {}) {
  let activeId: number | null = null
  let downAt = 0
  /** 最近一次在本元素上处理过的抬起（不管有没有触发）：之后紧跟的 click 是浏览器为同一次手势合成的，不再算 */
  let lastUpAt = 0
  /** 按下时被忽略的手指：它们抬起时也要记 lastUpAt，免得浏览器为它合成的 click 漏过来 */
  const ignored = new Set<number>()

  const release = (id: number) => {
    if (id === activeId) activeId = null
    releasePointer(id)
  }

  return {
    pointerdown(e: PointerEvent) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const el = e.currentTarget as Element
      if (!claimPointer(el, e.pointerId, opts.primaryViaClick)) {
        ignored.add(e.pointerId)
        return
      }
      activeId = e.pointerId
      downAt = performance.now()
      // 主指针走 click 的元素：主指针只登记（占住锁，好让手掌 / 第二指的规则成立），不捕获、不在 pointerup 里触发
      if (!(opts.primaryViaClick && e.isPrimary)) el.setPointerCapture?.(e.pointerId)
    },
    pointerup(e: PointerEvent) {
      const now = performance.now()
      if (ignored.delete(e.pointerId)) {
        // 主指针走 click 的元素：主指针的 click 才是正路，不能因为按下时被锁挡过就把它也吞掉
        if (!(opts.primaryViaClick && e.isPrimary)) lastUpAt = now
        return
      }
      if (e.pointerId !== activeId) return
      release(e.pointerId)
      if (opts.primaryViaClick && e.isPrimary) return
      lastUpAt = now
      if (now - downAt > HOLD_MS) return
      const r = (e.currentTarget as Element).getBoundingClientRect()
      const inside =
        e.clientX >= r.left - SLOP_PX && e.clientX <= r.right + SLOP_PX && e.clientY >= r.top - SLOP_PX && e.clientY <= r.bottom + SLOP_PX
      if (inside) onPress()
    },
    pointercancel(e: PointerEvent) {
      ignored.delete(e.pointerId)
      release(e.pointerId)
    },
    lostpointercapture(e: PointerEvent) {
      release(e.pointerId)
    },
    click() {
      if (performance.now() - lastUpAt < CLICK_AFTER_UP_MS) return
      onPress()
    },
    contextmenu(e: Event) {
      e.preventDefault()
    },
  }
}
