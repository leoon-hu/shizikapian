<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { usePwa } from '@/composables/usePwa'
import { INSTALL_HINT_SNOOZE_MS, installHintKind } from '@/composables/installHint'
import AppIcon from '@/components/AppIcon.vue'

/**
 * 首页的「安装到手机」提示条（C5）：给家长看的一条静态元素，不是弹窗、不出声、不遮方砖。
 * 没从主屏幕打开时从第一次打开就显示；关掉 7 天后再出现；装好了永不出现。
 */
const settings = useSettings()
const pwa = usePwa()

/** 每次进首页重新算一次（Date.now() 不是响应式的，但组件每次挂载都会重建这个 computed） */
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
    Date.now(),
  ),
)

const title = computed(() => (pwa.isIPad ? '安装到 iPad' : '安装到手机'))

function dismiss() {
  settings.installHintMutedUntil = Date.now() + INSTALL_HINT_SNOOZE_MS
}

/** 家长在系统安装框里选了「不了」也当关掉：同一屏上别马上换成「浏览器菜单」那句接着劝 */
async function install() {
  if ((await pwa.install()) === 'dismissed') dismiss()
}
</script>

<template>
  <aside v-if="kind" class="hint" role="note" aria-label="安装提示">
    <div class="hint__body">
      <strong class="hint__title">{{ title }}</strong>
      <!-- 写在一行里：模板里的换行会变成多余的空格 -->
      <span class="hint__text">
        全屏打开、没有网也能用。<template v-if="kind === 'ios'">Safari 里点{{ pwa.isIPad ? '右上角' : '底部' }}的 <AppIcon name="share" class="hint__share" /> →「添加到主屏幕」</template><template v-else-if="kind === 'inapp'">点右上角「···」→「在浏览器打开」，再安装</template><template v-else-if="kind === 'menu'">浏览器菜单 →「添加到主屏幕」</template>
      </span>
    </div>
    <button v-if="kind === 'prompt'" type="button" class="hint__install" @click="install">安装</button>
    <button type="button" class="hint__close" aria-label="关闭安装提示" @click="dismiss">
      <AppIcon name="close" />
    </button>
  </aside>
</template>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--gap);
  padding: 8px 4px 8px 14px;
  background: var(--c-card);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
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
.hint__share {
  display: inline-block;
  vertical-align: -0.2em;
  font-size: 1.15em;
  color: var(--c-text);
}
/* 家长用的按钮：≥ 44px；「安装」是橙色药丸，和设置页的一致 */
.hint__install {
  flex: none;
  min-height: 44px;
  padding: 0 18px;
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
  width: var(--tap-adult);
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
