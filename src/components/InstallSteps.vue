<script setup lang="ts">
import { computed } from 'vue'
import { installSteps, type InstallHintKind } from '@/composables/installHint'
import { usePwa } from '@/composables/usePwa'
import AppIcon from '@/components/AppIcon.vue'

/**
 * 「怎么做」步骤面板（C5 / P7 共用）：底部弹出的一张卡，按环境列编号步骤。
 * 家长自己点开的，不算零干扰里的弹窗；「知道了」或点面板外关闭，关闭即静默 3 天（由调用方决定）。
 */
const props = defineProps<{ kind: InstallHintKind }>()
const emit = defineEmits<{ close: [] }>()
const pwa = usePwa()

const steps = computed(() => installSteps(props.kind, { iosSafari: pwa.isIOSSafari, ipad: pwa.isIPad }))
</script>

<template>
  <Teleport to="body">
    <div class="mask" @click.self="emit('close')">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="添加到主屏幕">
        <h3 class="sheet__title">添加到主屏幕</h3>
        <p class="sheet__desc">像 App 一样全屏打开，不用再找网址。</p>
        <ol class="steps">
          <li v-for="(s, i) in steps" :key="s.text" class="step">
            <span class="step__n">{{ i + 1 }}</span>
            <span class="step__text">{{ s.text }}<AppIcon v-if="s.share" name="share" class="step__share" /></span>
          </li>
        </ol>
        <button type="button" class="sheet__ok" @click="emit('close')">知道了</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(61, 44, 30, 0.35);
}
.sheet {
  width: 100%;
  max-width: 520px;
  padding: 20px 20px calc(20px + var(--safe-bottom));
  background: var(--c-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 -8px 28px rgba(61, 44, 30, 0.18);
  color: var(--c-text);
}
.sheet__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.sheet__desc {
  margin: 4px 0 14px;
  font-size: 15px;
  color: var(--c-text-light);
}
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 17px;
  line-height: 1.5;
}
.step__n {
  flex: none;
  width: 26px;
  height: 26px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--c-accent);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
}
.step__share {
  display: inline-block;
  margin-left: 4px;
  vertical-align: -0.2em;
  font-size: 1.15em;
  color: var(--c-text);
}
.sheet__ok {
  width: 100%;
  min-height: 52px;
  margin-top: 18px;
  border-radius: var(--radius-md);
  background: var(--c-accent);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  transition: transform 0.12s;
}
.sheet__ok:active {
  transform: scale(0.98);
}
</style>
