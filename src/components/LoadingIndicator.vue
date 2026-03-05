<template>
  <view v-if="isLoading" class="loading-indicator">
    <view class="spinner"></view>
    <text class="loading-text">加载中...</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  isLoading: boolean
}

const props = defineProps<Props>()
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: @spacing-large;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid @pokemon-light;
  border-top-color: @pokemon-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: @spacing-small;
  font-size: 14px;
  color: @text-secondary;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
