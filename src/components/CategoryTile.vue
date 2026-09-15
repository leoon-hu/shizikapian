<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/content'
import { categoryImage } from '@/content'
import { useSettings } from '@/composables/useSettings'
import { usePress } from '@/composables/usePress'

const props = defineProps<{ category: Category }>()
const emit = defineEmits<{ pick: [] }>()
const settings = useSettings()
/** 主指针仍走 click（点方砖是 iOS 解锁音频的第一次手势）；另一根手指搁在屏幕上时的点按由 pointerup 补上 */
const press = usePress(() => emit('pick'), { primaryViaClick: true })

const image = computed(() => categoryImage(props.category))
const showZh = computed(() => settings.display !== 'en')
const showEn = computed(() => settings.display !== 'zh')
</script>

<template>
  <button
    type="button"
    class="tile"
    :style="{ '--cat': category.color }"
    :aria-label="`${category.name.zh}，${category.cards.length} 张`"
    v-on="press"
  >
    <img class="tile__icon" :src="image" alt="" draggable="false" />
    <span class="tile__name">
      <span v-if="showZh" class="tile__zh">{{ category.name.zh }}</span>
      <span v-if="showEn" class="tile__en" :class="{ 'tile__en--only': !showZh }" lang="en">{{ category.name.en }}</span>
    </span>
    <!-- 张数只给家长看：小字、右上角，不抢图标 -->
    <span class="tile__count" aria-hidden="true">{{ category.cards.length }}</span>
  </button>
</template>

<style scoped>
.tile {
  /* 「厚度」的颜色：不支持 color-mix 的 Safari 16.0/16.1 用半透明深色 */
  --cat-shade: rgba(61, 44, 30, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 164px;
  padding: 14px 10px 12px;
  border-radius: var(--radius-xl);
  background: var(--cat);
  box-shadow: 0 6px 0 var(--cat-shade);
  color: #fff;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
@supports (color: color-mix(in srgb, red 50%, blue)) {
  .tile {
    --cat-shade: color-mix(in srgb, var(--cat) 72%, #3d2c1e);
  }
}
.tile:active {
  transform: translateY(5px) scale(0.97);
  box-shadow: 0 1px 0 var(--cat-shade);
}
/* 图标是孩子认方砖的唯一线索（C1），尽量大 */
.tile__icon {
  width: clamp(76px, 52%, 112px);
  aspect-ratio: 1;
  filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.12));
}
/* 分类名给家长看：白字在浅色砖上对比只有 1.4–1.7:1，改成白色药丸 + 深字才达标 */
.tile__name {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 14px 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--c-text);
}
.tile__zh {
  font-size: 22px;
  font-weight: 700;
}
.tile__count {
  position: absolute;
  top: 8px;
  right: 10px;
  min-width: 26px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  color: var(--c-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}
.tile__en {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-light);
}
/* 只显示英文时它就是名字本身：和中文名一样大、一样深（C1「深色字」） */
.tile__en--only {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text);
}
@media (min-width: 640px) {
  .tile {
    min-height: 212px;
  }
  .tile__icon {
    width: clamp(104px, 50%, 140px);
  }
  .tile__zh,
  .tile__en--only {
    font-size: 26px;
  }
  .tile__en {
    font-size: 17px;
  }
}
/* 平板横屏 6 列时砖只有 130 多像素宽，26px 的「日常用品」药丸刚好顶满，降一档 */
@media (min-width: 1000px) and (orientation: landscape) {
  .tile__zh,
  .tile__en--only {
    font-size: 24px;
  }
}
</style>
