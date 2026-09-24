<script setup lang="ts">
// 首页页脚最上面的「版本与更新」卡片（需求 C6，child-education 三个静态站统一）：应用图标 + 当前版本 + 「检查更新」。
// 有新版本就让 Service Worker 取新的、装好接管后自动重新载入；重新载入后卡片滚到眼前，说「已更新」或「更新没有完成」。
// 检查过、慢、失败时给「重新安装」（先确认连得上服务器，再清掉缓存重新下载）。
// 给家长看的：在方砖下面要滚到底才看得到，不出声、不算孩子的操作面。逻辑在 composables/version.ts。
import { computed, onMounted, ref } from 'vue'
import { APP_VERSION, applyUpdate, checkVersion, noteUpdate, reinstall, takeUpdateNote } from '@/composables/version'

type State =
  | 'idle'
  | 'checking'
  | 'latest'
  | 'found'
  | 'slow'
  | 'offline'
  | 'failed'
  | 'installFailed'
  | 'updated'
  | 'reinstalled'
  | 'incomplete'
  | 'reinstalling'

const TEXT: Record<Exclude<State, 'idle' | 'checking'>, (v: string) => string> = {
  latest: () => '✓ 已是最新版本',
  updated: () => '✓ 已更新到最新版本',
  reinstalled: () => '✓ 已重新安装，现在是最新版本',
  found: (v) => `发现新版本 ${v}，正在下载，好了会自动刷新…`,
  slow: () => '新版本还在下载，好了会自动刷新',
  offline: () => '没有联网，连上网再检查',
  failed: () => '没检查成功，稍后再试',
  installFailed: () => '新版本没下载成功',
  incomplete: () => '更新没有完成，还是旧版本',
  reinstalling: () => '正在重新安装…',
}

const iconSrc = `${import.meta.env.BASE_URL}icons/icon-192.png`
const state = ref<State>('idle')
const found = ref('')
const root = ref<HTMLElement | null>(null)

const busy = computed(() => state.value === 'checking' || state.value === 'found' || state.value === 'slow' || state.value === 'reinstalling')
const canReinstall = computed(() => ['latest', 'failed', 'installFailed', 'incomplete', 'slow'].includes(state.value))
const buttonText = computed(() => (state.value === 'checking' ? '检查中…' : busy.value ? '更新中…' : '检查更新'))
const message = computed(() => (state.value === 'idle' || state.value === 'checking' ? '' : TEXT[state.value](found.value)))
const tone = computed(() => {
  if (['latest', 'updated', 'reinstalled'].includes(state.value)) return 'ok'
  if (['offline', 'failed', 'installFailed', 'incomplete'].includes(state.value)) return 'warn'
  return 'info'
})

async function check(): Promise<void> {
  if (busy.value) return
  state.value = 'checking'
  const r = await checkVersion(APP_VERSION)
  if (r.kind !== 'newer') {
    state.value = r.kind
    return
  }
  found.value = r.version
  state.value = 'found'
  noteUpdate('update', r.version)
  state.value = (await applyUpdate()) === 'slow' ? 'slow' : 'installFailed'
}

/** 重新安装前先确认连得上服务器：没网时清掉缓存，重新载入就打不开了 */
async function redo(): Promise<void> {
  if (busy.value) return
  state.value = 'reinstalling'
  const r = await checkVersion(APP_VERSION)
  if (r.kind === 'offline' || r.kind === 'failed') {
    state.value = r.kind
    return
  }
  noteUpdate('reinstall', r.kind === 'newer' ? r.version : APP_VERSION)
  await reinstall()
}

// 刚为更新 / 重新安装重新载入过：说结果，并把卡片滚到眼前（页脚在方砖下面，重新载入后回到了顶上）。
// 等页面载入完再过一小会儿才滚：浏览器重新载入后会恢复原来的滚动位置（在 load 前后），得在它之后
onMounted(() => {
  const outcome = takeUpdateNote(APP_VERSION)
  if (!outcome) return
  state.value = outcome
  const show = (): void => void setTimeout(() => root.value?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
  if (document.readyState === 'complete') show()
  else window.addEventListener('load', show, { once: true })
})
</script>

<template>
  <section ref="root" class="ver" aria-label="当前版本">
    <div class="ver__main">
      <img class="ver__icon" :src="iconSrc" alt="" draggable="false" />
      <p class="ver__text">
        <span class="ver__label">当前版本</span>
        <span class="ver__num">{{ APP_VERSION }}</span>
      </p>
      <button type="button" class="ver__btn" :disabled="busy" @click="check">
        <span v-if="busy" class="ver__spin" aria-hidden="true" />{{ buttonText }}
      </button>
    </div>
    <p class="ver__status" :class="`ver__status--${tone}`" role="status">{{ message }}</p>
    <p v-if="canReinstall" class="ver__more">还是旧版？<button type="button" class="ver__redo" @click="redo">重新安装</button>（清掉本机缓存重新下载，设置不会丢）</p>
  </section>
</template>

<style scoped>
.ver {
  width: min(100%, 440px);
  margin: 0 auto;
  padding: 12px 14px;
  border: 1.5px solid var(--c-line);
  border-radius: var(--radius-md);
  background: var(--c-card);
  box-shadow: 0 4px 12px rgba(61, 44, 30, 0.06);
  text-align: left;
  color: var(--c-text);
}
.ver__main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ver__icon {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
.ver__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.ver__label {
  font-size: 13px;
  color: var(--c-text-light);
}
.ver__num {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ver__btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--tap-adult);
  padding: 0 18px;
  border-radius: 999px;
  background: var(--c-accent);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}
.ver__btn:active:not(:disabled) {
  transform: scale(0.96);
}
.ver__btn:disabled {
  opacity: 0.75;
}
.ver__spin {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ver-spin 0.8s linear infinite;
}
@keyframes ver-spin {
  to {
    transform: rotate(360deg);
  }
}
.ver__status {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}
.ver__status:empty {
  display: none;
}
.ver__status--ok {
  color: #2e7d32;
}
.ver__status--warn {
  color: #bf360c;
}
.ver__status--info {
  color: var(--c-text-light);
}
.ver__more {
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-text-light);
}
.ver__redo {
  padding: 6px 2px;
  color: var(--c-text);
  font-size: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
