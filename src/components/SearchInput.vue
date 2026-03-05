<template>
  <view class="search-input-wrapper">
    <input
      class="search-input"
      type="text"
      :value="modelValue"
      @input="handleInput"
      placeholder="搜索宝可梦..."
      placeholder-class="input-placeholder"
    />
  </view>
</template>

<script setup lang="ts">
import { useDebouncedSearch } from '../utils/useDebouncedSearch'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { debouncedSearch } = useDebouncedSearch((keyword: string) => {
  emit('search', keyword)
}, { delay: 300 })

const handleInput = (event: any) => {
  const value = event.detail.value
  emit('update:modelValue', value)
  debouncedSearch(value)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.search-input-wrapper {
  width: 100%;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 @spacing-medium;
  font-size: 16px;
  border: 2px solid @pokemon-light;
  border-radius: @border-radius-medium;
  background: white;
  color: @text-primary;
  transition: all 0.2s;

  &:focus {
    border-color: @pokemon-primary;
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 203, 5, 0.1);
  }
}

.input-placeholder {
  color: @text-secondary;
}
</style>
