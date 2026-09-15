<script lang="ts">
/**
 * 会话内每个分类最近看到的那张：回首页再进同一分类，封面之后接着看。不进 localStorage，
 * 关掉应用仍从分类页从头开始（K11）。放在普通 <script> 里是因为 <script setup> 顶层的变量
 * 都会编进 setup()，每个实例一份，记不住。
 */
const lastIndex = new Map<string, number>()
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardImage, cardPhotos, categoryImage, findCategory } from '@/content'
import { useSettings } from '@/composables/useSettings'
import { useSpeaker } from '@/composables/useSpeaker'
import { useWakeLock } from '@/composables/useWakeLock'
import { langsFor } from '@/composables/speechPlan'
import { claimPointer, HOLD_MS, releasePointer } from '@/composables/usePress'
import BigButton from '@/components/BigButton.vue'
import AppIcon from '@/components/AppIcon.vue'

/** 切卡滑动动画时长（K4）；自动朗读等动画结束再开始（K5） */
const SLIDE_MS = 200
/** 横向移动到这个距离、且横向多于纵向，算翻页（K9）；其余一律算点图——幼儿的「抹一下」也要响 */
const SWIPE_PX = 40
// 按住超过 HOLD_MS 再抬起不算操作（多半是手掌搁在屏幕上），与按钮的 usePress 同一个值
/**
 * 再听一遍的连点判定（K6）：两下间隔小于这个值算「还在连敲」，连敲期间不打断正在读的——
 * 幼儿敲喇叭 2–5 下 / 秒，每下都从头读会变成「小—小—小狗」；取约一个中文词的长度（词的有声段 0.3–0.9 秒）
 */
const REPEAT_MS = 700
/** 从首页进来后这段时间内按上一个 / 下一个不动作：孩子点方砖常连点两下，第二下会落到刚出现的卡片页上 */
const ENTER_GRACE_MS = 600
/** 点图 / 朗读开始时图片弹一下的时长，与下面 CSS 的 bounce 动画一致 */
const BOUNCE_MS = 250

const route = useRoute()
const router = useRouter()
const settings = useSettings()
const speaker = useSpeaker()
useWakeLock()

const category = computed(() => findCategory(String(route.params.categoryId)))
if (!category.value) void router.replace({ name: 'home' })

const cards = computed(() => category.value?.cards ?? [])
const dir = ref<'next' | 'prev'>('next')

function rememberedIndex() {
  const n = cards.value.length
  const cat = category.value
  return n && cat ? Math.min(lastIndex.get(cat.id) ?? 0, n - 1) : 0
}

/**
 * 从首页点方砖进来时分类名正在读（C2）：先摆「封面」——图与词都是分类本身——让孩子听到「动物」时
 * 看到的也是动物，读完再滑到卡片；第一张卡排在分类名后面（S6 不切断）。
 * 中英之间的 350ms 间隙里 current 是 null，所以还要看 busy。直接打开地址时什么都没在读，不走封面。
 * 必须在 setup 里判定：先渲染第 0 张再改成封面会多滑一次。
 */
const catKey = computed(() => (category.value ? `cat-${category.value.id}` : ''))
const cur0 = speaker.current.value
const fromHome = !!category.value && speaker.busy.value && (!cur0 || cur0.key === catKey.value)

/** 当前是第几张；-1 是封面 */
const index = ref(fromHome ? -1 : rememberedIndex())
const enteredAt = performance.now()
const card = computed(() => (index.value >= 0 ? cards.value[index.value] : undefined))

/** 画面上正显示的东西：封面是分类本身（没有照片、没有例句），否则是当前卡片 */
const shown = computed(() => {
  const cat = category.value
  if (!cat) return null
  const c = card.value
  return c
    ? { key: c.id, image: cardImage(c), photos: cardPhotos(c), zh: c.zh, en: c.en, sentence: c.sentence }
    : { key: catKey.value, image: categoryImage(cat), photos: [] as string[], zh: cat.name.zh, en: cat.name.en, sentence: null }
})

const showZh = computed(() => settings.display !== 'en')
const showEn = computed(() => settings.display !== 'zh')
/** 正在读的是画面上这一个的哪一段（语言 + 词 / 例句），读到哪行亮哪行（K8）；读的不是它就不高亮 */
const lit = computed(() => {
  const cur = speaker.current.value
  return cur && shown.value && cur.key === shown.value.key ? cur : null
})
const litLang = computed(() => (lit.value?.part === 'word' ? lit.value.lang : null))
/**
 * 例句只有一行（K2）：正在读哪种语言的例句就显示哪句；没在读时显示主语言的（中英文模式是中文）。
 * 中英文模式下四行（中词 / 中句 / 英词 / 英句）在手机上摆不下，所以例句这一行是切换的。
 */
const sentence = computed(() => {
  const st = shown.value?.sentence
  if (!st || !settings.sentences) return null
  const lang = lit.value?.part === 'sentence' ? lit.value.lang : settings.display === 'en' ? 'en' : 'zh'
  return { lang, text: st[lang] }
})
const sentenceLit = computed(() => lit.value?.part === 'sentence')
/** 图片的替代文本跟着显示语言走（读屏用；孩子看的是图） */
const altText = computed(() => (shown.value ? (settings.display === 'en' ? shown.value.en : shown.value.zh) : ''))

let lastRepeatKey = ''
let lastRepeatAt = 0

/**
 * 封面的收尾：分类名最后一段刚读完、还在段间 350ms 停顿里时就滑向第一张卡，200ms 的滑动落在停顿里，
 * 词开口时卡片已经停稳（K1 / K5）；第一张卡已经排在队列里，不再 speak。队列空了（自动朗读关着 / 被拦）也滑过去。
 * 第一张真正开口时插画弹一下（K8）。
 */
let stopCover: (() => void) | undefined
function endCover() {
  stopCover?.()
  stopCover = undefined
}
if (fromHome) {
  const target = rememberedIndex()
  const targetId = cards.value[target]?.id
  const langs = langsFor(settings.display)
  const lastLang = langs[langs.length - 1]
  // 封面上的第一下点图 / 点喇叭也走 K6 的连点判定：孩子点方砖常连点两下，第二下不该把分类名从头再读一遍
  lastRepeatKey = `${catKey.value}:${settings.display}`
  lastRepeatAt = enteredAt
  stopCover = watch(
    [() => speaker.current.value, () => speaker.busy.value],
    ([cur, busy], [prev]) => {
      if (index.value < 0) {
        // 用上一段是不是「分类名的最后一种语言」判断，封面上点图重读分类名（prev 又变成第一种语言）不会提前滑走
        const nameDone = !cur && busy && prev?.key === catKey.value && prev.lang === lastLang
        if (nameDone || cur?.key === targetId || !busy) {
          dir.value = 'next'
          index.value = target
        }
      }
      if (index.value >= 0 && (cur?.key === targetId || !busy)) {
        if (cur?.key === targetId) bounce()
        endCover()
      }
    },
  )
}

// 图片反馈：点图 / 点喇叭 / 自动朗读开始时弹一下；整段朗读期间轻微呼吸，与喇叭脉动同节奏
const bouncing = ref(false)
let bounceTimer: ReturnType<typeof setTimeout> | undefined
function bounce() {
  if (bouncing.value) return
  bouncing.value = true
  bounceTimer = setTimeout(() => { bouncing.value = false }, BOUNCE_MS)
}

let speakTimer: ReturnType<typeof setTimeout> | undefined
function scheduleSpeak() {
  speaker.stop()
  clearTimeout(speakTimer)
  if (!settings.autoSpeak) return
  speakTimer = setTimeout(() => {
    if (!card.value || document.visibilityState === 'hidden') return
    bounce()
    speaker.speakCard(card.value)
  }, SLIDE_MS)
}
/** 切后台 / 锁屏：还没到点的自动朗读取消掉，回来是一张安静的卡（朗读器自己的 stop 在 useSpeaker 里，这里配套） */
const cancelPending = () => clearTimeout(speakTimer)
const onVisibility = () => {
  if (document.visibilityState === 'hidden') cancelPending()
}

/**
 * 循环翻页：最后一张的下一张是第一张（K4）。封面上按下一个 / 左滑到记住的那张（K11，首次是第一张）、
 * 上一个到它前一张（首次是最后一张）；刚从首页进来的头几百毫秒不动作（方砖连点的第二下）
 */
function go(step: 1 | -1) {
  const n = cards.value.length
  if (!n) return
  if (index.value < 0 && fromHome && performance.now() - enteredAt < ENTER_GRACE_MS) return
  endCover()
  dir.value = step > 0 ? 'next' : 'prev'
  const r = rememberedIndex()
  index.value = index.value < 0 ? (step > 0 ? r : (r - 1 + n) % n) : (index.value + step + n) % n
  scheduleSpeak()
}

/** 再听一遍（K6）：朗读中再点从头重读；连敲（间隔 < REPEAT_MS）期间不打断，让整段读完，读完还在敲就再读一遍 */
function repeat() {
  // 自动朗读的定时器还没到就被点了图：只读一遍，不然两个都读
  clearTimeout(speakTimer)
  const cat = category.value
  const s = shown.value
  if (!cat || !s) return
  bounce()
  const key = `${s.key}:${settings.display}`
  const now = performance.now()
  const dup = key === lastRepeatKey && now - lastRepeatAt < REPEAT_MS
  lastRepeatKey = key
  lastRepeatAt = now
  // 队列已经读完（busy = false）则不管多快都再读：敲一下总要有声音
  if (dup && speaker.busy.value) return
  if (card.value) { speaker.speakCard(card.value); return }
  // 封面上点图：重读分类名，第一张卡照样排在后面，读完仍由封面的 watch 滑过去
  speaker.speakCategory(cat)
  const first = cards.value[rememberedIndex()]
  if (settings.autoSpeak && first) speaker.speakCard(first, { append: true })
}

/** 进本分类的小测验（T1） */
function toQuiz() {
  const cat = category.value
  if (!cat) return
  speaker.stop()
  void router.push({ name: 'quiz', params: { categoryId: cat.id } })
}

/** 回分类页（K10）：有来路就后退，直接打开地址进来的没有来路，替换掉当前记录 */
function back() {
  speaker.stop()
  if (window.history.state?.back) router.back()
  else void router.replace({ name: 'home' })
}

// 图片区 / 词区：不是横滑就是点（K9）。整页只认一根手指（锁在 usePress 里，和按钮共用）：已有手指按着时
// 第二根落下不算——除非先前那根已经搁了超过 HOLD_MS（那是拇指 / 手掌压在屏幕上，改认后来的这根，不然整页都点不响）
let activeId: number | null = null
let startX = 0
let startY = 0
let startAt = 0
function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if (!claimPointer(e.currentTarget as Element, e.pointerId)) return
  activeId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  startAt = performance.now()
  ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
}
function onPointerUp(e: PointerEvent) {
  releasePointer(e.pointerId)
  if (e.pointerId !== activeId) return
  activeId = null
  if (performance.now() - startAt > HOLD_MS) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
  else repeat()
}
function onPointerCancel(e: PointerEvent) {
  releasePointer(e.pointerId)
  if (e.pointerId === activeId) activeId = null
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility)
  // iOS 锁屏 / 回主屏时 visibilitychange 不一定来，pagehide 无条件清
  window.addEventListener('pagehide', cancelPending)
  if (!category.value) return
  // 从首页进来时分类名正在读，第一张卡排在它后面；直接打开这个地址则立即读（K5），开口时弹一下（K8）
  const first = cards.value[rememberedIndex()]
  if (settings.autoSpeak && first) {
    if (!fromHome) bounce()
    speaker.speakCard(first, { append: true })
  }
  // 先让第一张排上队，再预热其余的（预热是小并发排队取，不抢当前这段的连接）
  speaker.preload(category.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('pagehide', cancelPending)
  endCover()
  clearTimeout(speakTimer)
  clearTimeout(bounceTimer)
  speaker.stop()
})

watch(index, (i) => {
  if (i >= 0 && category.value) lastIndex.set(category.value.id, i)
})

// 同一个组件换了分类（路由只改参数时不会重建）：不走封面，直接到该分类记住的那张
watch(
  () => route.params.categoryId,
  () => {
    // 离开本页时参数变成 undefined，不是换分类
    if (route.name !== 'cards') return
    if (!category.value) { void router.replace({ name: 'home' }); return }
    endCover()
    index.value = rememberedIndex()
    dir.value = 'next'
    speaker.preload(category.value)
    scheduleSpeak()
  },
)
</script>

<template>
  <main v-if="category && shown" class="cards" :style="{ '--cat': category.color }">
    <header class="cards__bar">
      <button type="button" class="cards__back" aria-label="返回分类" @click="back" @contextmenu.prevent>
        <AppIcon name="back" />
      </button>
      <span class="cards__cat" :lang="settings.display === 'en' ? 'en' : undefined">{{ settings.display === 'en' ? category.name.en : category.name.zh }}</span>
      <!-- 小测验入口（T1）：家长开的，孩子也按得到；设置里关掉就不显示 -->
      <button v-if="settings.quiz" type="button" class="cards__quiz" aria-label="小测验" @click="toQuiz" @contextmenu.prevent>
        <AppIcon name="quiz" />
      </button>
    </header>

    <section
      class="cards__stage"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @lostpointercapture="onPointerCancel"
      @contextmenu.prevent
    >
      <Transition :name="`slide-${dir}`">
        <div :key="shown.key" class="cards__pic">
          <!-- 真实照片在上（K1），有几张摆几张；没有照片的卡（数字 / 形状 / 封面）插画占满 -->
          <div v-if="shown.photos.length" class="cards__photos" :class="{ 'cards__photos--one': shown.photos.length === 1 }">
            <div v-for="p in shown.photos" :key="p" class="cards__photo">
              <img :src="p" :alt="altText" draggable="false" />
            </div>
          </div>
          <!-- 呼吸与弹跳分别放在两层：滑动的 transform 在 .cards__pic 上，不能被动画盖掉 -->
          <div class="cards__figure" :class="{ 'cards__figure--breathe': speaker.busy.value }">
            <img
              class="cards__img"
              :class="{ 'cards__img--bounce': bouncing }"
              :src="shown.image"
              :alt="altText"
              draggable="false"
            />
          </div>
        </div>
      </Transition>
    </section>

    <section
      class="cards__words"
      :class="{ 'cards__words--both': showZh && showEn, 'cards__words--sentence': settings.sentences }"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @lostpointercapture="onPointerCancel"
      @contextmenu.prevent
    >
      <Transition :name="`slide-${dir}`">
        <div :key="shown.key" class="cards__word-box">
          <span v-if="showZh" class="word word--zh" :class="{ 'word--on': litLang === 'zh', 'word--long': shown.zh.length >= 4 }">{{ shown.zh }}</span>
          <span v-if="showEn" class="word word--en" :class="{ 'word--on': litLang === 'en' }" lang="en">{{ shown.en }}</span>
          <span v-if="sentence" class="sentence" :class="{ 'sentence--on': sentenceLit }" :lang="sentence.lang === 'en' ? 'en' : undefined">{{ sentence.text }}</span>
        </div>
      </Transition>
    </section>

    <nav class="cards__buttons">
      <BigButton label="上一个" :color="category.color" @press="go(-1)"><AppIcon name="prev" /></BigButton>
      <BigButton label="再听一遍" primary :pulse="speaker.busy.value" @press="repeat"><AppIcon name="speaker" /></BigButton>
      <BigButton label="下一个" :color="category.color" @press="go(1)"><AppIcon name="next" /></BigButton>
    </nav>
  </main>
</template>

<style scoped>
.cards {
  --row-gap: 12px;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  grid-template-areas: 'bar' 'stage' 'words' 'buttons';
  /* 底色 = 分类色掺 22% 进米色底；不支持 color-mix 的 Safari 16.0/16.1 用 78% 的米色盖在分类色上，效果一样 */
  background: linear-gradient(rgba(255, 248, 236, 0.78), rgba(255, 248, 236, 0.78)), var(--cat);
  background: color-mix(in srgb, var(--cat) 22%, var(--c-bg));
  /* 底部多留 12px：大按钮别贴着主屏指示条 */
  padding: var(--safe-top) max(var(--gap), var(--safe-right)) calc(max(var(--gap), var(--safe-bottom)) + 12px)
    max(var(--gap), var(--safe-left));
  gap: var(--row-gap) var(--gap);
  /* 整页都归自己处理手势：不给浏览器留任何滚动 / 缩放的机会 */
  touch-action: none;
}

.cards__bar {
  grid-area: bar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
}
.cards__back {
  width: var(--tap-adult);
  height: var(--tap-adult);
  display: grid;
  place-items: center;
  font-size: 28px;
  color: var(--c-text-light);
  border-radius: 50%;
}
.cards__cat {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  opacity: 0.72;
  padding-right: 6px;
}
/* 小测验入口：48px 的圆，白底 + 分类色描边，放在分类名右边 */
.cards__quiz {
  width: 48px;
  height: 48px;
  margin-left: 4px;
  display: grid;
  place-items: center;
  font-size: 30px;
  color: var(--c-text);
  background: rgba(255, 255, 255, 0.85);
  border: 3px solid var(--cat);
  border-radius: 50%;
  transition: transform 0.12s ease;
}
.cards__quiz:active {
  transform: scale(0.92);
}

/* 图片区与词区各自是一个相对定位的盒子，新旧卡片绝对定位叠着滑动 */
.cards__stage,
.cards__words {
  position: relative;
  overflow: hidden;
}
.cards__stage {
  grid-area: stage;
  min-height: 0;
}
.cards__words {
  grid-area: words;
  height: clamp(88px, 19vh, 176px);
}
/* 多一行例句 / 多一行英文，词区就要高一点；两个都有时最高 */
.cards__words--sentence {
  height: clamp(124px, 25vh, 224px);
}
.cards__words--both {
  height: clamp(132px, 26vh, 224px);
}
.cards__words--both.cards__words--sentence {
  height: clamp(168px, 31vh, 270px);
}
.cards__pic,
.cards__word-box {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cards__pic {
  padding: 2% 4%;
  flex-direction: column;
  gap: 10px;
}
/* 两张照片并排，4:3，白边像贴上去的相片；一张时居中放一半宽 */
.cards__photos {
  flex: 0 0 auto;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.cards__photo {
  flex: 1 1 0;
  max-width: 320px;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #fff;
  border: 4px solid #fff;
  box-shadow: var(--shadow-card);
}
/* 单张照片：不让它长满（flex-grow 归零），和两张时的每张一样大，插画不被挤成一个小图标 */
.cards__photos--one .cards__photo {
  flex: 0 0 calc(50% - 6px);
}
.cards__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cards__figure {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cards__figure--breathe {
  animation: breathe 0.9s ease-in-out infinite;
}
.cards__img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1;
  filter: drop-shadow(0 8px 12px rgba(61, 44, 30, 0.18));
}
.cards__img--bounce {
  animation: bounce 0.25s ease-out;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(0.94);
  }
  70% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

.cards__word-box {
  flex-direction: column;
  gap: 2px;
  /* 折成两行的例句也要居中（inline-block 内部换行默认左对齐） */
  text-align: center;
}
.word {
  display: inline-block;
  /* 词永不折行：4 字词在窄屏上按宽度缩小字号（见 .word--long），最坏也只是两侧裁一点 */
  white-space: nowrap;
  padding: 0 0.3em;
  border-radius: 0.3em;
  transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
  transform-origin: center;
  line-height: 1.1;
}
.word--zh {
  font-size: clamp(48px, 9vh, 96px);
  font-weight: 700;
  letter-spacing: 0.06em;
}
/* 4 字词（封面的「日常用品」「交通工具」）：只按高度取字号在 390 宽的手机上会折成两行，再按宽度封顶（4.84 字宽 × 1.1 高亮 ≤ 词区） */
.word--zh.word--long {
  font-size: clamp(48px, min(9vh, 17vw), 96px);
}
.word--en {
  font-size: clamp(30px, 6vh, 60px);
  font-weight: 700;
  color: var(--c-text);
}
/* 英文只在与中文同屏时退后一点；英文模式下它是唯一的词，不能灰 */
.word--zh + .word--en {
  opacity: 0.8;
}
/* 例句：一行，比词小得多，读到它时同样白底 + 橙杠 */
.sentence {
  display: inline-block;
  max-width: 100%;
  margin-top: 6px;
  padding: 2px 0.5em;
  border-radius: 0.5em;
  /* 也按宽度封顶：390–430 宽的手机上 28px 会让五十来句英文例句折行，25px 只剩十几句 */
  font-size: clamp(20px, min(3.4vh, 6.4vw), 34px);
  font-weight: 600;
  line-height: 1.25;
  /* 折行时两行等长（老 Safari 忽略） */
  text-wrap: balance;
  color: var(--c-text);
  opacity: 0.75;
  transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.sentence--on {
  opacity: 1;
  transform: scale(1.06);
  background: #fff;
  box-shadow: 0 3px 0 var(--c-accent);
}
/* 正在读的那行：白底 + 橙色底杠，在任何分类的暖色底上都看得见（K8） */
.word--on,
.word--zh + .word--en.word--on {
  transform: scale(1.1);
  background: #fff;
  box-shadow: 0 4px 0 var(--c-accent);
  color: var(--c-text);
  opacity: 1;
}

.cards__buttons {
  grid-area: buttons;
  display: flex;
  gap: var(--gap);
  height: clamp(var(--tap-kid), 16vh, 140px);
}

/* 滑动切卡：新的从一侧进来，旧的从另一侧出去 */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-next-enter-from,
.slide-prev-leave-to {
  transform: translateX(60%);
  opacity: 0;
}
.slide-next-leave-to,
.slide-prev-enter-from {
  transform: translateX(-60%);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: none;
  }
  .cards__figure--breathe,
  .cards__img--bounce {
    animation: none;
  }
  /* 高亮只换底色、不放大 */
  .word,
  .sentence {
    transition: none;
  }
  .word--on,
  .word--zh + .word--en.word--on,
  .sentence--on {
    transform: none;
  }
}

/* 矮屏手机（360×640 一类）：照片缩小，给插画留地方 */
@media (max-height: 700px) and (orientation: portrait) {
  .cards__photo {
    max-width: 200px;
  }
  .cards__words--both.cards__words--sentence {
    height: clamp(150px, 28vh, 270px);
  }
}

/* 平板横屏：图在左，词与按钮在右，按钮贴底 */
@media (orientation: landscape) and (min-width: 640px) {
  .word--zh {
    font-size: clamp(56px, 13vh, 120px);
  }
  .word--zh.word--long {
    font-size: clamp(56px, min(13vh, 8.2vw), 120px);
  }
  .word--en {
    font-size: clamp(34px, 8vh, 72px);
  }
  .cards {
    --btn-h: clamp(var(--tap-kid), 22vh, 140px);
    /* 右列至少 320px：手机横屏（667×375）三个按钮才都有 96px 宽，封面的 4 字分类名也放得下 */
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 1fr);
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'bar bar'
      'stage words'
      'stage buttons';
  }
  .cards__words,
  .cards__words--sentence,
  .cards__words--both,
  .cards__words--both.cards__words--sentence {
    height: auto;
    min-height: 0;
  }
  .cards__photo {
    max-width: none;
  }
  /*
   * 左边的图竖向占「词区 + 行距 + 按钮」三段，词盒要与它的中心对齐，就得把上边往下推
   * 一个「按钮高 + 行距」。屏幕矮（手机横屏）时推不了这么多，至少给词盒留 112px
   * （两行词在最小字号下约 102px），不够就少推一点。
   */
  .cards__word-box {
    top: clamp(0px, calc(var(--btn-h) + var(--row-gap)), calc(100% - 112px));
  }
  /* 中英文 + 例句是四行（中词 68 + 英词 37 + 间距 + 例句最多两行 57 ≈ 176px），112px 装不下会被 overflow 裁掉；
     手机横屏词区只有 160–215px，这里基本等于不推，词块顶到上边 */
  .cards__words--both.cards__words--sentence .cards__word-box {
    top: clamp(0px, calc(var(--btn-h) + var(--row-gap)), calc(100% - 200px));
  }
  .cards__buttons {
    height: var(--btn-h);
  }
}
</style>
