<template>
  <button class="back-button" @tap="handleClick">
    <text>← 返回</text>
  </button>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'click'): void
}

const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('click')
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.back-button {
  min-width: 100px;
  height: 44px;
  padding: 0 @spacing-large;
  font-size: 16px;
  font-weight: 500;
  color: @text-primary;
  background: white;
  border: 2px solid @pokemon-primary;
  border-radius: @border-radius-medium;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: @shadow-small;

  &:hover {
    background: @pokemon-light;
    transform: translateY(-2px);
    box-shadow: @shadow-medium;
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
