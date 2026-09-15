<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { categories, type Category } from '@/content'
import { useSettings } from '@/composables/useSettings'
import { useSpeaker } from '@/composables/useSpeaker'
import { useLongPress } from '@/composables/useLongPress'
import CategoryTile from '@/components/CategoryTile.vue'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const settings = useSettings()
const speaker = useSpeaker()

/** 家长在设置里隐藏的分类不显示；顺序仍按内容文件（C3）。设置页保证至少留一个，这里再兜一次底 */
const visible = computed(() => {
  const hidden = new Set(settings.hiddenCategories)
  const list = categories.filter((c) => !hidden.has(c.id))
  return list.length ? list : categories
})

/** 点方砖：同步开始朗读分类名（首次点击顺带解锁音频），同时切到卡片页；音频预热由卡片页挂载时做 */
function enter(cat: Category) {
  speaker.speakCategory(cat)
  void router.push({ name: 'cards', params: { categoryId: cat.id } })
}

/** 家长入口：长按 1.5 秒才进设置，短按无反应（C4）；按住 0.3 秒后进度环开始转，让家长知道按对了 */
const gear = useLongPress(1500, () => {
  speaker.stop()
  void router.push({ name: 'settings' })
})

/** 进度环：SVG 圆周长，dashoffset 从整圈（空）过渡到 0（满） */
const RING_R = 20
const RING_C = 2 * Math.PI * RING_R
</script>

<template>
  <main class="home">
    <header class="home__bar">
      <h1 class="home__title">识字卡片</h1>
      <div class="home__tools">
        <!-- 只在家长还没进过设置时提示一次入口在哪；静态文字，不动、不弹层 -->
        <span v-if="!settings.settingsSeen" class="home__hint">家长设置：长按 ⚙</span>
        <button
          type="button"
          class="home__gear"
          :class="{ 'home__gear--holding': gear.holding.value }"
          :style="{ '--fill-ms': `${gear.fillMs}ms` }"
          aria-label="家长设置（长按打开）"
          v-on="gear.handlers"
        >
          <AppIcon name="gear" />
          <svg class="home__ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle
              class="home__ring-arc"
              cx="22"
              cy="22"
              :r="RING_R"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="RING_C * (1 - gear.progress.value)"
            />
          </svg>
        </button>
      </div>
    </header>
    <div class="home__grid">
      <CategoryTile v-for="cat in visible" :key="cat.id" :category="cat" @pick="enter(cat)" />
    </div>
  </main>
</template>

<style scoped>
.home {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  /* 只放行竖向滚动，横向 / 捏合都不给 */
  touch-action: pan-y;
  padding: var(--safe-top) max(var(--gap), var(--safe-right)) max(var(--gap), var(--safe-bottom))
    max(var(--gap), var(--safe-left));
}
.home__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 4px 0 8px;
}
.home__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text-light);
}
.home__tools {
  display: flex;
  align-items: center;
  gap: 6px;
}
.home__hint {
  font-size: 13px;
  color: var(--c-text-light);
  white-space: nowrap;
}
.home__gear {
  position: relative;
  width: var(--tap-adult);
  height: var(--tap-adult);
  display: grid;
  place-items: center;
  font-size: 26px;
  color: var(--c-text-light);
  opacity: 0.8;
  border-radius: 50%;
  /* 长按期间手指微动也不能变成页面滚动，否则 pointercancel 会把长按打断 */
  touch-action: none;
  transition: opacity 0.15s;
}
.home__gear--holding {
  opacity: 1;
}
.home__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}
.home__ring-arc {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 3;
  stroke-linecap: round;
  /* 松手时立刻清空，不做回退动画 */
  transition: none;
}
.home__gear--holding .home__ring-arc {
  /* 从开始 holding 到触发正好剩 fillMs，环转满的那一刻就是打开设置的那一刻 */
  transition: stroke-dashoffset var(--fill-ms) linear;
}
.home__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gap);
  padding-bottom: var(--gap);
}
@media (min-width: 640px) {
  .home__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 960px) {
  .home__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
/* 平板横屏 6 列：17 块方砖三行放下、不用滚（C1）；竖屏 3–4 列放不下就接受滚动 */
@media (min-width: 1000px) and (orientation: landscape) {
  .home__grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
