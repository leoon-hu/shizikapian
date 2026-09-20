<script setup lang="ts">
import { RouterView } from 'vue-router'
import SharePanel from '@/components/SharePanel.vue'
</script>

<template>
  <RouterView />
  <!-- 「分享给朋友」在没有系统分享面板的环境下弹的面板（C6），首页与设置页都从这里画 -->
  <SharePanel />
</template>
