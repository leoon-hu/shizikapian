import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 卡片页屏幕常亮：孩子看一张卡可能盯着看很久不碰屏幕，别让屏幕黑掉。
 * 在组件 setup 里调用：挂载时申请 Screen Wake Lock，切后台系统会自动释放、回前台再申请一次，
 * 卸载时释放。不支持的浏览器（iOS 16.3 以下等）全部静默，不提示、不请求任何权限。
 */
export function useWakeLock() {
  let sentinel: WakeLockSentinel | null = null

  async function acquire() {
    if (sentinel || document.visibilityState !== 'visible') return
    try {
      sentinel = (await navigator.wakeLock?.request('screen')) ?? null
      sentinel?.addEventListener('release', () => {
        sentinel = null
      })
    } catch {
      sentinel = null
    }
  }

  async function release() {
    const s = sentinel
    sentinel = null
    try {
      await s?.release()
    } catch {
      /* 已经被系统释放了 */
    }
  }

  const onVisible = () => {
    if (document.visibilityState === 'visible') void acquire()
  }

  onMounted(() => {
    void acquire()
    document.addEventListener('visibilitychange', onVisible)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisible)
    void release()
  })
}
