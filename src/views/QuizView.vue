<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardImage, categoryImage, findCategory, type Card } from '@/content'
import { useSettings } from '@/composables/useSettings'
import { useSpeaker } from '@/composables/useSpeaker'
import { useWakeLock } from '@/composables/useWakeLock'
import { usePress } from '@/composables/usePress'
import { makeRound, OPTION_COUNT, type Question } from '@/composables/quiz'
import BigButton from '@/components/BigButton.vue'
import AppIcon from '@/components/AppIcon.vue'

/**
 * 小测验（3.6）：读一个词，四幅插画里点出对的那张。没有失败：找错了只是「再试试」，
 * 第二次找错就指给孩子看，每一题都以找到结束；不计分、不出音效。
 */

/** 换题的滑动时长，与卡片页一致（K4） */
const SLIDE_MS = 200
/** 找对了：读完停这么久再滑下一题（T4），这段时间里也不响应点按（T8） */
const NEXT_DELAY_MS = 800
/** 再听一遍的连点判定，与卡片页同一个值（K6） */
const REPEAT_MS = 700
/** 点错的图摇一下的时长，与 CSS 的 shake 动画一致 */
const SHAKE_MS = 400

const route = useRoute()
const router = useRouter()
const settings = useSettings()
const speaker = useSpeaker()
useWakeLock()

const category = computed(() => findCategory(String(route.params.categoryId)))
if (!category.value) void router.replace({ name: 'home' })

const round = ref<Question[]>([])
const qi = ref(0)
const phase = ref<'ask' | 'right' | 'done'>('ask')
const question = computed(() => round.value[qi.value])
/** 这一题里点错过的卡：变淡、不可再点 */
const wrong = ref(new Set<string>())
/** 第二次找错后指给孩子看的那张 */
const hinted = ref(false)
/** 找对的那张 */
const picked = ref<string | null>(null)
/** 正在摇的那张（点错） */
const shaking = ref<string | null>(null)
let shakeTimer: ReturnType<typeof setTimeout> | undefined
let nextTimer: ReturnType<typeof setTimeout> | undefined

const showZh = computed(() => settings.display !== 'en')
const showEn = computed(() => settings.display !== 'zh')

function ask() {
  const q = question.value
  if (!q) return
  speaker.speakQuiz('find', q.answer)
}

function start() {
  const cat = category.value
  if (!cat) return
  clearTimeout(nextTimer)
  round.value = makeRound(cat.cards)
  qi.value = 0
  phase.value = 'ask'
  wrong.value = new Set()
  hinted.value = false
  picked.value = null
  ask()
}

let lastRepeatKey = ''
let lastRepeatAt = 0
/** 再听一遍题（T3）：连敲期间不打断，读完还在敲就再读 */
function repeat() {
  const q = question.value
  if (!q || phase.value !== 'ask') return
  const key = `${q.answer.id}:${settings.display}`
  const now = performance.now()
  const dup = key === lastRepeatKey && now - lastRepeatAt < REPEAT_MS
  lastRepeatKey = key
  lastRepeatAt = now
  if (dup && speaker.busy.value) return
  ask()
}

function next() {
  clearTimeout(nextTimer)
  if (qi.value + 1 >= round.value.length) {
    phase.value = 'done'
    speaker.speakDone()
    return
  }
  qi.value++
  phase.value = 'ask'
  wrong.value = new Set()
  hinted.value = false
  picked.value = null
  // 旧题滑出、新题滑入之后再开口（K5）
  nextTimer = setTimeout(ask, SLIDE_MS * 2)
}

function pick(i: number) {
  const q = question.value
  if (!q || phase.value !== 'ask') return
  const card = q.options[i]
  if (!card || wrong.value.has(card.id)) return
  if (card.id === q.answer.id) {
    phase.value = 'right'
    picked.value = card.id
    speaker.speakQuiz('right', q.answer)
    return
  }
  // 找错了（T5）：摇一下、变淡，读「再试试」+ 词；第二次就指出来
  wrong.value = new Set([...wrong.value, card.id])
  shaking.value = card.id
  clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => { shaking.value = null }, SHAKE_MS)
  if (wrong.value.size >= 2) {
    hinted.value = true
    speaker.speakQuiz('hint', q.answer)
  } else {
    speaker.speakQuiz('wrong', q.answer)
  }
}

// 找对了：读完（或音频被拦、队列空了）停 NEXT_DELAY_MS 再下一题
watch(
  () => speaker.busy.value,
  (busy) => {
    if (phase.value !== 'right' || busy) return
    clearTimeout(nextTimer)
    nextTimer = setTimeout(next, NEXT_DELAY_MS)
  },
)

/** 四个格子各一套点按判定（整页一根手指锁在 usePress 里） */
const presses = Array.from({ length: OPTION_COUNT }, (_, i) => usePress(() => pick(i)))
const promptPress = usePress(repeat)

const optionClass = (card: Card) => ({
  'quiz__option--right': picked.value === card.id,
  'quiz__option--faded': (picked.value !== null && picked.value !== card.id) || wrong.value.has(card.id),
  'quiz__option--hint': hinted.value && picked.value === null && card.id === question.value?.answer.id,
  'quiz__option--shake': shaking.value === card.id,
})

/** 回卡片页（T1）：从卡片页进来的有历史可退，直接打开地址的替换到卡片页 */
function back() {
  speaker.stop()
  if (window.history.state?.back) router.back()
  else void router.replace({ name: 'cards', params: { categoryId: String(route.params.categoryId) } })
}

onMounted(() => {
  if (!category.value) return
  speaker.preload(category.value)
  start()
})
onBeforeUnmount(() => {
  clearTimeout(nextTimer)
  clearTimeout(shakeTimer)
  speaker.stop()
})
</script>

<template>
  <main v-if="category" class="quiz" :style="{ '--cat': category.color }">
    <header class="quiz__bar">
      <button type="button" class="quiz__back" aria-label="返回卡片" @click="back" @contextmenu.prevent>
        <AppIcon name="back" />
      </button>
      <!-- 第几题：给家长看的小圆点（T3） -->
      <span v-if="phase !== 'done'" class="quiz__dots" aria-hidden="true">
        <i v-for="(_, i) in round" :key="i" class="quiz__dot" :class="{ 'quiz__dot--done': i < qi, 'quiz__dot--now': i === qi }" />
      </span>
      <span class="quiz__cat" :lang="settings.display === 'en' ? 'en' : undefined">{{ settings.display === 'en' ? category.name.en : category.name.zh }}</span>
    </header>

    <!-- 一轮做完（T6） -->
    <section v-if="phase === 'done'" class="quiz__done">
      <img class="quiz__done-img" :src="categoryImage(category)" :alt="category.name.zh" draggable="false" />
      <nav class="quiz__done-buttons">
        <BigButton label="返回卡片" class="quiz__done-back" :color="category.color" @press="back"><AppIcon name="back" /></BigButton>
        <BigButton label="再玩一次" primary :pulse="speaker.busy.value" @press="start"><AppIcon name="replay" /></BigButton>
      </nav>
    </section>

    <Transition v-else name="slide-next" mode="out-in">
      <section :key="qi" class="quiz__q">
        <!-- 提示区：喇叭 + 词的文字（家长看）；点哪里都是再听一遍 -->
        <div class="quiz__prompt" v-on="promptPress">
          <BigButton label="再听一遍" primary :pulse="speaker.busy.value" @press="repeat"><AppIcon name="speaker" /></BigButton>
          <div v-if="question" class="quiz__words">
            <span v-if="showZh" class="quiz__zh">{{ question.answer.zh }}</span>
            <span v-if="showEn" class="quiz__en" lang="en">{{ question.answer.en }}</span>
          </div>
        </div>
        <!-- 四张图（T3）：白底圆角卡片上一幅插画 -->
        <div v-if="question" class="quiz__grid">
          <button
            v-for="(card, i) in question.options"
            :key="card.id"
            type="button"
            class="quiz__option"
            :class="optionClass(card)"
            :aria-label="card.zh"
            :aria-disabled="wrong.has(card.id) || phase !== 'ask'"
            v-on="presses[i]"
          >
            <img :src="cardImage(card)" :alt="card.zh" draggable="false" />
          </button>
        </div>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.quiz {
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: linear-gradient(rgba(255, 248, 236, 0.78), rgba(255, 248, 236, 0.78)), var(--cat);
  background: color-mix(in srgb, var(--cat) 22%, var(--c-bg));
  padding: var(--safe-top) max(var(--gap), var(--safe-right)) calc(max(var(--gap), var(--safe-bottom)) + 12px)
    max(var(--gap), var(--safe-left));
  gap: 12px;
  touch-action: none;
}
.quiz__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
}
.quiz__back {
  width: var(--tap-adult);
  height: var(--tap-adult);
  display: grid;
  place-items: center;
  font-size: 28px;
  color: var(--c-text-light);
  border-radius: 50%;
}
.quiz__dots {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.quiz__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(61, 44, 30, 0.18);
}
.quiz__dot--done {
  background: var(--c-accent);
}
.quiz__dot--now {
  background: var(--c-text);
}
.quiz__cat {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  opacity: 0.72;
  padding-right: 6px;
}

.quiz__q {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
}
/* 提示区：圆形喇叭键（≥ 96px）+ 词的文字 */
.quiz__prompt {
  display: flex;
  align-items: center;
  gap: 16px;
  height: clamp(var(--tap-kid), 14vh, 120px);
}
.quiz__words {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.quiz__zh {
  font-size: clamp(32px, 6vh, 56px);
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.quiz__en {
  font-size: clamp(22px, 4vh, 36px);
  font-weight: 700;
  color: var(--c-text);
  opacity: 0.8;
  white-space: nowrap;
}
.quiz__zh + .quiz__en {
  margin-top: 2px;
}

/* 四张图：2×2，各 ≥ 120px 见方（T3） */
.quiz__grid {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(120px, 1fr));
  gap: var(--gap);
}
.quiz__option {
  --shade: rgba(61, 44, 30, 0.18);
  position: relative;
  min-width: 0;
  min-height: 0;
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: 0 6px 0 var(--shade);
  touch-action: none;
  transition: transform 0.15s ease, opacity 0.2s ease, box-shadow 0.15s ease;
}
.quiz__option:active {
  transform: translateY(4px) scale(0.97);
  box-shadow: 0 2px 0 var(--shade);
}
/* 插画绝对定位铺在卡片里（留 10% 白边），不参与格子的尺寸计算——横屏矮格子里才不会撑出去 */
.quiz__option img {
  position: absolute;
  inset: 10%;
  width: 80%;
  height: 80%;
  object-fit: contain;
  pointer-events: none;
}
.quiz__option--faded {
  opacity: 0.3;
  transform: scale(0.94);
}
.quiz__option--right {
  animation: cheer 0.6s ease-out;
  box-shadow: 0 0 0 5px var(--c-accent), 0 6px 0 var(--shade);
}
.quiz__option--hint {
  animation: nudge 0.9s ease-in-out infinite;
  box-shadow: 0 0 0 5px var(--c-accent), 0 6px 0 var(--shade);
}
.quiz__option--shake {
  animation: shake 0.4s ease-in-out;
}
@keyframes cheer {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.12);
  }
  70% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1.04);
  }
}
@keyframes nudge {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px) rotate(-2deg);
  }
  75% {
    transform: translateX(8px) rotate(2deg);
  }
}

/* 一轮做完：分类图标 + 两个大按钮 */
.quiz__done {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: var(--gap);
  justify-items: center;
  align-items: center;
}
.quiz__done-img {
  max-width: min(60%, 320px);
  max-height: 100%;
  aspect-ratio: 1;
  filter: drop-shadow(0 8px 12px rgba(61, 44, 30, 0.18));
}
.quiz__done-buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: var(--gap);
  height: clamp(var(--tap-kid), 16vh, 140px);
}
.quiz__done-back {
  flex: 0 1 260px;
}

.slide-next-enter-active,
.slide-next-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-next-enter-from {
  transform: translateX(60%);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-60%);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .quiz__option {
    transition: none;
  }
  .quiz__option--right,
  .quiz__option--hint,
  .quiz__option--shake {
    animation: none;
  }
}

/* 横屏：提示区在左、四张图在右 */
@media (orientation: landscape) and (min-width: 640px) {
  .quiz__q {
    grid-template-columns: minmax(200px, 0.8fr) minmax(0, 1.4fr);
    grid-template-rows: minmax(0, 1fr);
  }
  .quiz__prompt {
    flex-direction: column;
    justify-content: center;
    height: auto;
  }
  .quiz__prompt > :first-child {
    height: clamp(var(--tap-kid), 24vh, 140px);
  }
  .quiz__words {
    align-items: center;
    text-align: center;
  }
  .quiz__done {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    align-items: center;
  }
}
</style>
