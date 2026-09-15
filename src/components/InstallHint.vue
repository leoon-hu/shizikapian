<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { usePwa } from '@/composables/usePwa'
import { INSTALL_HINT_SNOOZE_MS, installHintKind } from '@/composables/installHint'
import InstallSteps from '@/components/InstallSteps.vue'
import AppIcon from '@/components/AppIcon.vue'

/**
 * 首页的「安装 识字卡片」提示条（C5）：给家长看的一条静态元素，不是弹窗、不出声、不遮方砖。
 * 四个站同一套规则与结构：图标 + 粗体标题 + 一句说明 + 主按钮（安装 / 怎么做）+ ×。
 * 没从主屏幕打开时从第一次打开就显示（随页面一起画出来，不延时冒出，免得方砖跳动）；关掉 / 拒绝 3 天后再出现；装好了永不出现。
 */
const settings = useSettings()
const pwa = usePwa()
const sheet = ref(false)
/** 每次进首页重新取当前时间（Date.now() 不是响应式的）：静默期到了就重新出现 */
const now = ref(Date.now())
onMounted(() => (now.value = Date.now()))

const iconSrc = `${import.meta.env.BASE_URL}icons/icon-192.png`

const kind = computed(() =>
  installHintKind(
    {
      standalone: pwa.isStandalone,
      touch: pwa.isTouch,
      inApp: pwa.isInApp,
      ios: pwa.isIOS,
      hasPrompt: pwa.installPrompt.value !== null,
    },
    settings.installHintMutedUntil,
    now.value,
  ),
)

function dismiss() {
  sheet.value = false
  settings.installHintMutedUntil = Date.now() + INSTALL_HINT_SNOOZE_MS
}

/** 「安装」弹系统安装框（pwa.install 会按结果记永久 / 3 天）；其它环境打开步骤面板 */
async function primary() {
  if (kind.value === 'prompt') await pwa.install()
  else sheet.value = true
}
</script>

<template>
  <aside v-if="kind" class="hint" role="note" aria-label="安装 识字卡片">
    <img class="hint__icon" :src="iconSrc" alt="" draggable="false" />
    <div class="hint__body">
      <strong class="hint__title">安装 识字卡片</strong>
      <span class="hint__text">全屏打开，没有网也能用</span>
    </div>
    <button type="button" class="hint__install" @click="primary">{{ kind === 'prompt' ? '安装' : '怎么做' }}</button>
    <button type="button" class="hint__close" aria-label="关闭安装提示" @click="dismiss">
      <AppIcon name="close" />
    </button>
  </aside>
  <InstallSteps v-if="sheet && kind && kind !== 'prompt'" :kind="kind" @close="dismiss" />
</template>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--gap);
  padding: 8px 4px 8px 12px;
  background: var(--c-card);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.hint__icon {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}
.hint__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.4;
}
.hint__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
}
.hint__text {
  font-size: 13px;
  color: var(--c-text-light);
}
/* 家长用的按钮：≥ 44px；橙色药丸，和设置页的一致 */
.hint__install {
  flex: none;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 22px;
  background: var(--c-accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.12s;
}
.hint__install:active {
  transform: scale(0.96);
}
.hint__close {
  flex: none;
  width: 40px;
  height: var(--tap-adult);
  display: grid;
  place-items: center;
  font-size: 18px;
  color: var(--c-text-light);
  border-radius: 50%;
  transition: transform 0.12s;
}
.hint__close:active {
  transform: scale(0.9);
}
</style>
