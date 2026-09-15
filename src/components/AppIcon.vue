<script setup lang="ts">
/** 界面里用到的几个图标，内联 SVG，颜色跟随 currentColor */
defineProps<{ name: 'prev' | 'next' | 'speaker' | 'back' | 'gear' | 'quiz' | 'replay' }>()
</script>

<template>
  <!-- 三角与喇叭占到 viewBox 的六成：孩子隔着一臂远也要一眼认出方向与「会响」（K3） -->
  <svg class="icon" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
    <path v-if="name === 'prev'" d="M34 6 L8 24 L34 42 Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" />
    <path v-else-if="name === 'next'" d="M14 6 L40 24 L14 42 Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" />
    <g v-else-if="name === 'speaker'">
      <path d="M4 18 H13 L25 8 V40 L13 30 H4 Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
      <path d="M30 17 Q35 24 30 31" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
      <path d="M36 11 Q45 24 36 37" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
    </g>
    <path v-else-if="name === 'back'" d="M28 10 L14 24 L28 38" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <!-- 小测验入口：问号 -->
    <g v-else-if="name === 'quiz'" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 18 Q15 8 24 8 Q33 8 33 17 Q33 23 26 26 Q24 27 24 31" />
      <circle cx="24" cy="39" r="3.5" fill="currentColor" stroke="none" />
    </g>
    <!-- 再玩一次：转一圈的箭头 -->
    <g v-else-if="name === 'replay'" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M38 24 A14 14 0 1 1 30 11.5" />
      <path d="M31 4 L31 13 L22 13" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="name === 'gear'" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">
      <circle cx="24" cy="24" r="6" />
      <path d="M24 6 L27 11 L33 9 L35 15 L41 17 L39 23 L43 27 L39 32 L40 38 L34 39 L31 44 L25 42 L19 44 L16 39 L10 38 L11 32 L7 27 L11 23 L9 17 L15 15 L17 9 L23 11 Z" />
    </g>
  </svg>
</template>

<style scoped>
.icon {
  width: 1em;
  height: 1em;
  display: block;
}
</style>
