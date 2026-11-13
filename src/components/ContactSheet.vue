<script setup lang="ts">
import { AUTHOR_CONTACT } from '@/sites'

/**
 * 「联系站长」面板（C6 / 设置页共用）：底部弹出的一张卡，一句怎么加 + 两张并排的图
 * （站长微信二维码、微信支付的赞助码，图下各一行小字）+ 「知道了」。
 * 家长自己点开的，不算零干扰里的弹窗；不出声、不朗读。结构与 InstallSteps 一样。
 */
const emit = defineEmits<{ close: [] }>()
const qrSrc = `${import.meta.env.BASE_URL}${AUTHOR_CONTACT.qr}`
const paySrc = `${import.meta.env.BASE_URL}${AUTHOR_CONTACT.pay}`
</script>

<template>
  <Teleport to="body">
    <div class="mask" @click.self="emit('close')">
      <div class="sheet" role="dialog" aria-modal="true" :aria-label="AUTHOR_CONTACT.label">
        <h3 class="sheet__title">{{ AUTHOR_CONTACT.label }}</h3>
        <p class="sheet__desc">{{ AUTHOR_CONTACT.hint }}</p>
        <div class="sheet__qrs">
          <figure>
            <img :src="qrSrc" alt="站长微信二维码" width="720" height="987" draggable="false" />
            <figcaption>{{ AUTHOR_CONTACT.qrCaption }}</figcaption>
          </figure>
          <figure>
            <img :src="paySrc" alt="微信支付赞助码" width="720" height="983" draggable="false" />
            <figcaption>{{ AUTHOR_CONTACT.payCaption }}</figcaption>
          </figure>
        </div>
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
  /* 矮屏（横屏手机）上内容比视口高时在面板里滚，不把标题顶出屏幕 */
  max-height: 100%;
  overflow-y: auto;
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
/* 两张图并排：左边站长微信二维码、右边微信支付的赞助码，图下各一行小字；高度按视口限一下，横屏手机上别把「知道了」挤出去 */
.sheet__qrs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}
.sheet__qrs figure {
  margin: 0;
  text-align: center;
}
.sheet__qrs img {
  display: block;
  width: min(240px, 100%, 42vh);
  height: auto;
  margin: 0 auto;
  border-radius: var(--radius-md);
  background: #fff;
}
.sheet__qrs figcaption {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--c-text-light);
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
