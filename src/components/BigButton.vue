<script setup lang="ts">
import { ref } from 'vue'
import { usePress } from '@/composables/usePress'

/**
 * 孩子用的大按钮：≥ 96px 高、纯图标、按下缩小回弹、有一条「厚度」（K3）。
 * label 只给辅助技术 / 家长，孩子看的是图标与颜色。
 * 点按用 usePress 判（指针事件，不靠 click）：另一根手指搁在屏幕上、两指同拍、按下去滚一下都要响。
 */
defineProps<{
  label: string
  /** 按钮颜色，默认橙色（朗读键） */
  color?: string
  /** 朗读中的脉动 */
  pulse?: boolean
  /** 主操作（朗读键）：圆形、带白色内环，比左右两个方键更醒目 */
  primary?: boolean
}>()
const emit = defineEmits<{ press: [] }>()

const el = ref<HTMLButtonElement>()
const reduceMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null

/**
 * 幼儿的点按只有 80–120ms，:active 一闪就过去了；click 时再补一段 200ms 的「压下—回弹」，
 * 保证每次点按都看得见反馈（4.1）。用 Web Animations 而不是切 class，是因为连点时它能重头再放。
 */
function flash() {
  if (reduceMotion?.matches || !el.value?.animate) return
  el.value.animate(
    [
      { transform: 'translateY(5px) scale(0.94)' },
      { transform: 'translateY(0) scale(1.04)', offset: 0.6 },
      { transform: 'none' },
    ],
    { duration: 200, easing: 'ease-out' },
  )
}

const press = usePress(() => {
  flash()
  emit('press')
})
</script>

<template>
  <button
    ref="el"
    type="button"
    class="big-btn"
    :class="{ 'big-btn--pulse': pulse, 'big-btn--primary': primary }"
    :style="color ? { '--btn': color } : undefined"
    :aria-label="label"
    v-on="press"
  >
    <span class="big-btn__icon"><slot /></span>
  </button>
</template>

<style scoped>
.big-btn {
  --btn: var(--c-accent);
  /* 「厚度」的颜色：不支持 color-mix 的 Safari 16.0/16.1 用半透明深色，任何按钮色上都说得过去 */
  --btn-shade: rgba(61, 44, 30, 0.3);
  flex: 1 1 0;
  min-width: 0;
  min-height: var(--tap-kid);
  border-radius: var(--radius-lg);
  background: var(--btn);
  color: #fff;
  box-shadow: 0 6px 0 var(--btn-shade);
  display: grid;
  place-items: center;
  touch-action: manipulation;
  /* 压下瞬间到位、抬起再慢慢回弹：手指一碰就有反应 */
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform;
}
@supports (color: color-mix(in srgb, red 50%, blue)) {
  .big-btn {
    --btn-shade: color-mix(in srgb, var(--btn) 72%, #3d2c1e);
  }
}
.big-btn:active {
  transform: translateY(5px) scale(0.96);
  box-shadow: 0 1px 0 var(--btn-shade);
  transition-duration: 0.04s;
}
/* 主操作：圆形，高度撑满、宽度等于高度；白色内环让它在任何分类底色上都跳出来 */
.big-btn--primary {
  flex: 0 0 auto;
  height: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: inset 0 0 0 4px #fff, 0 6px 0 var(--btn-shade);
}
.big-btn--primary:active {
  box-shadow: inset 0 0 0 4px #fff, 0 1px 0 var(--btn-shade);
}
/* 左右键图标用正文深色：白图标在食物 #ffd54f 上只有 1.4:1，深色在 16 个分类色上最低 3.6:1；只有朗读键是白图标，「会说话的那个」更好认 */
.big-btn:not(.big-btn--primary) {
  color: var(--c-text);
}
.big-btn__icon {
  font-size: clamp(56px, 8.5vh, 84px);
}
.big-btn--primary .big-btn__icon {
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.12));
}
.big-btn--pulse .big-btn__icon {
  animation: pulse 0.9s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}
@media (prefers-reduced-motion: reduce) {
  .big-btn--pulse .big-btn__icon {
    animation: none;
  }
  .big-btn,
  .big-btn:active {
    transition: none;
  }
}
</style>
