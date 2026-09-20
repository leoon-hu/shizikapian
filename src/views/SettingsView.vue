<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Category, DisplayMode } from '@/content'
import { categories, categoryImage } from '@/content'
import { useSettings } from '@/composables/useSettings'
import { useSpeaker } from '@/composables/useSpeaker'
import { usePwa } from '@/composables/usePwa'
import AppIcon from '@/components/AppIcon.vue'
import InstallSteps from '@/components/InstallSteps.vue'
import ContactSheet from '@/components/ContactSheet.vue'
import { AUTHOR_CONTACT, OPEN_CLAIM, REPO_URL } from '@/sites'
import { useShare } from '@/composables/useShare'
import type { InstallHintKind } from '@/composables/installHint'

const router = useRouter()
const settings = useSettings()
const speaker = useSpeaker()
const pwa = usePwa()

// 进过一次设置页，首页那行「家长设置：长按 ⚙」的提示就不再需要了
settings.settingsSeen = true

const DISPLAY_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'both', label: '中英文' },
]

/** 试音用的卡：第一张动物卡（小狗），三种模式都有现成发音 */
const sampleCard = (categories.find((c) => c.id === 'animals') ?? categories[0])?.cards[0]

/**
 * 选显示模式：先改设置再在同一个点击回调里同步朗读（P2）。
 * 家长递手机前就听到了新模式的读法，顺带把这台设备的音频解锁（S4）——之后孩子的第一下才会响
 */
function pickDisplay(mode: DisplayMode) {
  settings.display = mode
  if (sampleCard) speaker.speakCard(sampleCard)
}

/**
 * 「离线与安装」的安装部分（P7）：拿到安装事件给「安装到主屏幕」按钮，其它环境给「查看步骤」，
 * 弹与首页提示条（C5）相同的步骤面板；判断顺序与 C5 一致（内置浏览器先于 iOS）
 */
const installKind = computed<InstallHintKind | null>(() => {
  if (pwa.isStandalone) return null
  if (pwa.installPrompt.value) return 'prompt'
  if (pwa.isInApp) return 'inapp'
  if (pwa.isIOS) return 'ios'
  return 'menu'
})
const stepsOpen = ref(false)
/** 「联系站长」与「分享给朋友」（C6 的第二入口）：与首页页脚同一个面板 */
const contactOpen = ref(false)
const { share } = useShare()

/** 离线包状态一行（P7）：下载中带百分比，家长知道是在下而不是卡住了 */
const offlineText = computed(() => {
  const p = pwa.progress.value
  const percent = p && p.total ? `，已完成 ${Math.min(99, Math.floor((p.done / p.total) * 100))}%` : ''
  switch (pwa.offlineState.value) {
    case 'ready':
      return '离线包已就绪，没有网也能用'
    case 'installing':
      return `正在下载图片和发音（约 20 MB${percent}），第一次请保持打开一会儿；中途关掉，下次会接着下`
    case 'failed':
      return '下载中断了，联网后会自动接着下；一直这样的话，关掉再打开一次'
    default:
      return '这个浏览器存不了离线包（微信内置浏览器、无痕模式都这样），只能联网用；用 Safari / Chrome 打开这个网址就能离线，也能装到主屏幕'
  }
})

const hidden = computed(() => new Set(settings.hiddenCategories))
const shownCount = computed(() => categories.length - hidden.value.size)
const isShown = (cat: Category) => !hidden.value.has(cat.id)
/** 最后一个打开的不允许关：首页不能空 */
const canHide = (cat: Category) => !isShown(cat) || shownCount.value > 1

function toggleCategory(cat: Category) {
  if (isShown(cat)) {
    if (!canHide(cat)) return
    settings.hiddenCategories = [...settings.hiddenCategories, cat.id]
  } else {
    settings.hiddenCategories = settings.hiddenCategories.filter((id) => id !== cat.id)
  }
}

/** 照片出处（P10）：CC BY / CC BY-SA 要求在用到照片的地方能看到作者与许可；展开时才读 credits.json，离线包里也有 */
interface Credit {
  file: string
  license: string
  licenseUrl: string
  artist: string
  page: string
}
const credits = ref<{ card: string; items: Credit[] }[] | null>(null)
const creditsFailed = ref(false)
const cardName = new Map(categories.flatMap((c) => c.cards.map((card) => [card.id, card.zh] as const)))
async function loadCredits() {
  if (credits.value || creditsFailed.value) return
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}photos/credits.json`)
    const data = (await res.json()) as Record<string, Credit[]>
    credits.value = Object.entries(data)
      .map(([id, items]) => ({ card: cardName.get(id) ?? id, items }))
      .sort((a, b) => a.card.localeCompare(b.card, 'zh'))
  } catch {
    creditsFailed.value = true
  }
}

/** 从首页长按进来的有历史可退；直接打开 #/settings 的没有，替换成首页免得系统返回退出应用（P5） */
function back() {
  speaker.stop()
  if (window.history.state?.back) router.back()
  else void router.replace({ name: 'home' })
}
</script>

<template>
  <main class="settings">
    <header class="settings__bar">
      <button type="button" class="settings__back" aria-label="返回" @click="back">
        <AppIcon name="back" />
      </button>
      <h1 class="settings__title">家长设置</h1>
    </header>

    <section class="group">
      <h2 class="group__title">卡片显示</h2>
      <p class="group__hint">显示什么就读什么；中英文一起显示时先读中文再读英文。点一下会试读一张卡。</p>
      <div class="segment" role="radiogroup" aria-label="卡片显示">
        <button
          v-for="opt in DISPLAY_OPTIONS"
          :key="opt.value"
          type="button"
          class="segment__item"
          :class="{ 'segment__item--on': settings.display === opt.value }"
          role="radio"
          :aria-checked="settings.display === opt.value"
          @click="pickDisplay(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <section class="group">
      <h2 id="auto-speak-title" class="group__title">自动朗读</h2>
      <p class="group__hint">关掉后翻到新卡片不会自动读，只有点中间的喇叭或点图片才读——适合让孩子先自己说、再听。</p>
      <div class="row">
        <span class="row__label">{{ settings.autoSpeak ? '开' : '关' }}</span>
        <button
          type="button"
          class="switch"
          :class="{ 'switch--on': settings.autoSpeak }"
          role="switch"
          :aria-checked="settings.autoSpeak"
          aria-labelledby="auto-speak-title"
          @click="settings.autoSpeak = !settings.autoSpeak"
        >
          <span class="switch__knob" />
        </button>
      </div>
    </section>

    <section class="group">
      <h2 id="sentences-title" class="group__title">读例句</h2>
      <p class="group__hint">每张卡在词后面有一句常用的话（「小狗汪汪叫。」），读完词接着读它，卡片上也显示。关掉只读词、不显示例句——适合刚开始只认单词的孩子。</p>
      <div class="row">
        <span class="row__label">{{ settings.sentences ? '开' : '关' }}</span>
        <button
          type="button"
          class="switch"
          :class="{ 'switch--on': settings.sentences }"
          role="switch"
          :aria-checked="settings.sentences"
          aria-labelledby="sentences-title"
          @click="settings.sentences = !settings.sentences"
        >
          <span class="switch__knob" />
        </button>
      </div>
    </section>

    <section class="group">
      <h2 id="quiz-title" class="group__title">小测验</h2>
      <p class="group__hint">卡片页右上角的「?」：读一个词，四幅画里点出对的那张。找错了只是「再试试」，第二次会指给孩子看，不计分、没有错误音效。关掉后不显示入口。</p>
      <div class="row">
        <span class="row__label">{{ settings.quiz ? '开' : '关' }}</span>
        <button
          type="button"
          class="switch"
          :class="{ 'switch--on': settings.quiz }"
          role="switch"
          :aria-checked="settings.quiz"
          aria-labelledby="quiz-title"
          @click="settings.quiz = !settings.quiz"
        >
          <span class="switch__knob" />
        </button>
      </div>
    </section>

    <!-- 放在分类列表前面：家长第一次最需要看的是它，别被 17 行开关压到页底（P7） -->
    <section class="group">
      <h2 class="group__title">离线与安装</h2>
      <p class="status">
        <span class="status__dot" :class="{ 'status__dot--ok': pwa.offlineState.value === 'ready' }" />
        {{ offlineText }}
      </p>
      <p v-if="!installKind" class="group__hint">已安装到主屏幕。</p>
      <button v-else-if="installKind === 'prompt'" type="button" class="install" @click="pwa.install()">安装到主屏幕</button>
      <template v-else>
        <p class="group__hint">装到主屏幕后从桌面图标打开就是全屏、离线的，孩子自己就能打开。</p>
        <button type="button" class="install" @click="stepsOpen = true">查看步骤</button>
        <p v-if="installKind === 'ios'" class="group__hint">
          主屏幕里的是独立的一份，设置要在那里重新选（离线包可能也要再下一次）；只在 Safari 里用的话，一周不打开会被系统清掉。
        </p>
      </template>
      <p class="group__hint">没有声音？先把音量键调大（iPhone / iPad 的静音拨键不影响本应用）。</p>
    </section>
    <InstallSteps v-if="stepsOpen && installKind && installKind !== 'prompt'" :kind="installKind" @close="stepsOpen = false" />

    <section class="group">
      <h2 class="group__title">显示哪些分类</h2>
      <p class="group__hint">关掉的分类首页不显示。顺序固定，方便孩子靠位置记住；至少留一个。</p>
      <ul class="cats">
        <li v-for="cat in categories" :key="cat.id" class="row cats__row">
          <img class="cats__icon" :src="categoryImage(cat)" alt="" draggable="false" />
          <span :id="`cat-${cat.id}`" class="row__label cats__name">{{ cat.name.zh }}</span>
          <button
            type="button"
            class="switch"
            :class="{ 'switch--on': isShown(cat), 'switch--locked': !canHide(cat) }"
            role="switch"
            :aria-checked="isShown(cat)"
            :aria-disabled="!canHide(cat)"
            :aria-labelledby="`cat-${cat.id}`"
            @click="toggleCategory(cat)"
          >
            <span class="switch__knob" />
          </button>
        </li>
      </ul>
    </section>

    <p class="settings__foot">
      <a class="settings__link" href="./cards.html">全部卡片清单</a>（一页网页，方便家长过一遍词和例句）。
      设置只保存在这台设备上。回到首页后长按右上角的齿轮可以再进来。
      怕孩子误退出：添加到主屏幕后，iPhone / iPad 可在「设置 → 辅助功能 → 引导式访问」把设备锁在本应用里（那一页会写明按哪个键），Android 用「屏幕固定」。
    </p>
    <p class="settings__foot">
      {{ OPEN_CLAIM }}<a class="settings__link" :href="REPO_URL" target="_blank" rel="noopener">GitHub 源码 ↗</a>
      觉得好用就<button type="button" class="settings__link settings__contact" @click="share()">分享给朋友</button>；
      有问题、建议或想要的卡片，<button type="button" class="settings__link settings__contact" @click="contactOpen = true">{{ AUTHOR_CONTACT.label }}</button>（微信二维码）直接说。
    </p>
    <ContactSheet v-if="contactOpen" @close="contactOpen = false" />

    <details class="credits" @toggle="loadCredits">
      <summary class="credits__summary">素材来源</summary>
      <p class="group__hint">
        插画来自 <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener">Twemoji</a>（CC BY 4.0），颜色 / 形状 / 数字 / 草为自绘；
        发音由微软 Edge 朗读接口合成；照片来自 <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a>，只做了裁切与缩放，作者与许可如下（点文件名看原页面）：
      </p>
      <p v-if="creditsFailed" class="group__hint">出处清单没有加载出来。</p>
      <ul v-else-if="credits" class="credits__list">
        <li v-for="c in credits" :key="c.card">
          <span class="credits__card">{{ c.card }}</span>
          <span v-for="it in c.items" :key="it.file" class="credits__item">
            <a :href="it.page" target="_blank" rel="noopener">{{ it.file }}</a>
            · {{ it.artist }} ·
            <a :href="it.licenseUrl" target="_blank" rel="noopener">{{ it.license }}</a>
          </span>
        </li>
      </ul>
    </details>
  </main>
</template>

<style scoped>
.settings {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  padding: var(--safe-top) max(var(--gap), var(--safe-right)) max(var(--gap), var(--safe-bottom))
    max(var(--gap), var(--safe-left));
  max-width: 640px;
  margin: 0 auto;
}
.settings__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 4px 0 8px;
}
.settings__back {
  width: var(--tap-adult);
  height: var(--tap-adult);
  display: grid;
  place-items: center;
  font-size: 28px;
  color: var(--c-text-light);
  border-radius: 50%;
}
.settings__title {
  font-size: 22px;
  font-weight: 700;
}

.group {
  background: var(--c-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 18px 20px 20px;
  margin-bottom: var(--gap);
}
.group__title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}
.group__hint {
  font-size: 14px;
  color: var(--c-text-light);
  line-height: 1.5;
  margin-bottom: 14px;
}
.group__hint:last-child {
  margin-bottom: 0;
}

.segment {
  display: flex;
  gap: 8px;
}
.segment__item {
  flex: 1;
  min-height: 52px;
  border-radius: var(--radius-md);
  background: var(--c-bg);
  /* 未选中用深字色 + 看得见的边框区分，浅字色在米色底上对比度不够 */
  border: 2px solid var(--c-line-strong);
  font-size: 17px;
  font-weight: 600;
  color: var(--c-text);
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}
.segment__item--on {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: #fff;
}

/* 一行 = 文字 + 右侧开关；只有开关本身可点（和系统设置一样），孩子误入设置页后随手拍到文字不会改设置 */
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
}
.row__label {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  text-align: left;
}
/* 开关 ≥ 44px（家长目标），行高 56px 让相邻开关之间留出 12px */
.switch {
  position: relative;
  flex: none;
  width: 72px;
  height: 44px;
  border-radius: 22px;
  background: var(--c-line-strong);
  transition: background-color 0.2s;
}
.switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}
.switch--on {
  background: var(--c-accent);
}
.switch--on .switch__knob {
  transform: translateX(28px);
}

.cats {
  list-style: none;
}
.cats__row {
  border-top: 1px solid var(--c-line);
}
.cats li:first-child {
  border-top: 0;
}
.cats__icon {
  width: 32px;
  height: 32px;
  flex: none;
}
/* 最后一个开着的关不掉：开关变淡表示锁住，点了没反应 */
.switch--locked {
  opacity: 0.4;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.status__dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-line);
  border: 1px solid var(--c-text-light);
}
.status__dot--ok {
  background: #6cc070;
  border-color: #6cc070;
}
.install {
  min-height: 48px;
  margin-bottom: 14px;
  padding: 0 24px;
  border-radius: var(--radius-md);
  background: var(--c-accent);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  transition: transform 0.12s ease;
}
.install:active {
  transform: scale(0.96);
}

.settings__foot {
  font-size: 14px;
  color: var(--c-text-light);
  line-height: 1.5;
  padding: 4px 6px;
}
.settings__link {
  color: var(--c-text);
  font-weight: 600;
  text-decoration: underline;
}
/* 段落里的「联系站长」是按钮，长得和旁边的链接一样 */
.settings__contact {
  padding: 0;
  min-height: var(--tap-adult);
  font-size: inherit;
}

/* 素材来源：折叠在页底，展开才读清单；只给家长看 */
.credits {
  padding: 4px 6px 12px;
  color: var(--c-text-light);
  font-size: 13px;
  line-height: 1.5;
}
.credits__summary {
  min-height: var(--tap-adult);
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.credits a {
  color: inherit;
  text-decoration: underline;
  word-break: break-all;
}
.credits__list {
  list-style: none;
  margin-top: 8px;
}
.credits__list li {
  margin-bottom: 6px;
}
.credits__card {
  font-weight: 600;
  color: var(--c-text);
  margin-right: 6px;
}
.credits__item {
  display: block;
  padding-left: 12px;
}
</style>
