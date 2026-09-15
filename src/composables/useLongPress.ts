import { ref } from 'vue'

/** 按下多久算「真的在按」：短于这个的点按不亮进度环，短按仍然什么都不发生（C4） */
const HOLD_START_MS = 300
/** 手指移动超过这么多像素就取消：拖走、抹一下都不算长按（Android 的 touch slop 8dp / iOS 的 10pt 同量级，家长按住时的抖动不会误取消） */
const SLOP_PX = 12

/** 屏幕上现在按着的全部手指（整页），长按只在「只有这一根手指」时才算数 */
const fingers = new Set<number>()
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (e) => fingers.add(e.pointerId), true)
  document.addEventListener('pointerup', (e) => fingers.delete(e.pointerId), true)
  document.addEventListener('pointercancel', (e) => fingers.delete(e.pointerId), true)
}

/**
 * 长按才触发（家长入口用）：按住 ms 毫秒回调一次，中途抬起 / 移开 / 取消都不算。
 * 只认「屏幕上唯一的一根手指」：按住期间屏幕任何地方（包括齿轮本身）再落下一根手指——手掌、孩子的手——
 * 长按就作废，家长要等孩子的手离开屏幕再按；已有别的手指按着时按齿轮也不计时。
 * 返回的 handlers 直接 v-on 绑到元素上；holding / progress 给进度环用，
 * 让家长知道「按对了、继续按」，而孩子随手一点不会有任何反应。
 */
export function useLongPress(ms: number, onLong: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let holdTimer: ReturnType<typeof setTimeout> | undefined
  /** 按下超过 HOLD_START_MS 后为 true，触发或松手后回 false */
  const holding = ref(false)
  /** 0 → 1：holding 时置 1，配合 CSS transition（时长 = ms - HOLD_START_MS）就是一个转满的进度环，不用 JS 逐帧算 */
  const progress = ref(0)

  /** 正在按着的那根手指；按住期间其它手指按下 / 抬起一律不理 */
  let activeId: number | null = null
  let startX = 0
  let startY = 0
  /** 当前捕获着的元素与指针；事件回调返回后 currentTarget 就是 null 了，所以按下时记下来 */
  let captured: { el: Element; id: number } | null = null

  /** 屏幕上别处又落下一根手指：手掌 / 孩子的手，长按作废 */
  const onOtherPointer = (e: PointerEvent) => {
    if (e.pointerId !== activeId) clear()
  }

  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (holdTimer !== undefined) {
      clearTimeout(holdTimer)
      holdTimer = undefined
    }
    holding.value = false
    progress.value = 0
    activeId = null
    document.removeEventListener('pointerdown', onOtherPointer, true)
    const c = captured
    captured = null
    try {
      c?.el.releasePointerCapture(c.id)
    } catch {
      /* 已经释放或指针已失效 */
    }
  }
  const start = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // 屏幕上还有别的手指（含正在按齿轮的那根）：不计时
    if (activeId !== null || fingers.size > 1) return
    clear()
    activeId = e.pointerId
    startX = e.clientX
    startY = e.clientY
    // 捕获指针：手指按住时微微一动不会被浏览器判成滚动而发 pointercancel，1.5 秒才按得满
    const el = e.currentTarget as Element | null
    if (el?.setPointerCapture) {
      try {
        el.setPointerCapture(e.pointerId)
        captured = { el, id: e.pointerId }
      } catch {
        /* 不支持就靠 touch-action: none 兜着 */
      }
    }
    document.addEventListener('pointerdown', onOtherPointer, true)
    holdTimer = setTimeout(() => {
      holdTimer = undefined
      holding.value = true
      progress.value = 1
    }, HOLD_START_MS)
    timer = setTimeout(() => {
      timer = undefined
      clear()
      onLong()
    }, ms)
  }
  /** 只有正在按的那根手指抬起 / 取消才算 */
  const end = (e: PointerEvent) => {
    if (activeId === null || e.pointerId === activeId) clear()
  }
  const move = (e: PointerEvent) => {
    if (e.pointerId !== activeId) return
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > SLOP_PX) clear()
  }

  return {
    holding,
    progress,
    /** 剩余时间：进度环的 transition 时长用它，保证环转满的瞬间正好触发 */
    fillMs: Math.max(0, ms - HOLD_START_MS),
    handlers: {
      pointerdown: start,
      pointermove: move,
      pointerup: end,
      pointercancel: end,
      contextmenu: (e: Event) => e.preventDefault(),
    },
  }
}
