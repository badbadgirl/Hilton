<template>
  <button
    class="search-button"
    :class="{ disabled: disabled }"
    :disabled="disabled"
    @tap="handleClick"
  >
    <text>搜索</text>
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.search-button {
  min-width: 100px;
  height: 44px;
  padding: 0 @spacing-large;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: @pokemon-primary;
  border: none;
  border-radius: @border-radius-medium;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: @shadow-small;

  &:hover:not(.disabled) {
    background: @pokemon-secondary;
    transform: translateY(-2px);
    box-shadow: @shadow-medium;
  }

  &:active:not(.disabled) {
    transform: translateY(0);
  }

  &.disabled {
    background: @pokemon-light;
    color: @text-secondary;
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
