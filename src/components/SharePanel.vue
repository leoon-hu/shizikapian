<script setup lang="ts">
import { useShare } from '@/composables/useShare'

/**
 * 「分享给朋友」面板（C6）：底部弹出的一张卡，家长自己点开的、不出声，与 ContactSheet 同样式。
 * 微信 / QQ 里：教用右上角「···」；没有系统分享面板时：一段话 + 链接，已复制就说已复制，也能手动选中。
 * 挂在 App.vue，系统分享面板能用的环境不会走到这里。
 */
const { panel, copy, close } = useShare()
</script>

<template>
  <Teleport to="body">
    <div v-if="panel" class="mask" @click.self="close()">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="分享给朋友">
        <h3 class="sheet__title">分享给朋友</h3>
        <p class="sheet__desc">
          {{ panel.way === 'wechat' ? '点右上角的「···」，选「发送给朋友」或「分享到朋友圈」。' : panel.copied ? '已经复制好了，粘贴给朋友就行：' : '把下面这段话发给朋友就行：' }}
        </p>
        <pre class="sheet__message">{{ panel.message }}</pre>
        <button v-if="panel.way === 'copy'" type="button" class="sheet__ok" @click="copy()">{{ panel.copied ? '已复制' : '复制' }}</button>
        <button type="button" class="sheet__ok" :class="{ 'sheet__ok--ghost': panel.way === 'copy' }" @click="close()">知道了</button>
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
  margin: 4px 0 12px;
  font-size: 15px;
  color: var(--c-text-light);
}
/* 分享的那段话：可以选中复制（整站默认禁选） */
.sheet__message {
  margin: 0;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--c-bg);
  font: inherit;
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  -webkit-user-select: text;
  user-select: text;
}
.sheet__ok {
  width: 100%;
  min-height: 52px;
  margin-top: 12px;
  border-radius: var(--radius-md);
  background: var(--c-accent);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  transition: transform 0.12s;
}
.sheet__ok--ghost {
  background: var(--c-bg);
  color: var(--c-text);
}
.sheet__ok:active {
  transform: scale(0.98);
}
</style>
