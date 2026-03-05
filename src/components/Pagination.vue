<template>
  <view class="pagination">
    <button
      class="page-button"
      :class="{ disabled: currentPage === 1 }"
      :disabled="currentPage === 1"
      @tap="handlePrevious"
    >
      <text>上一页</text>
    </button>
    <view class="page-info">
      <text>{{ currentPage }} / {{ totalPages }}</text>
    </view>
    <button
      class="page-button"
      :class="{ disabled: currentPage === totalPages }"
      :disabled="currentPage === totalPages"
      @tap="handleNext"
    >
      <text>下一页</text>
    </button>
  </view>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
}

interface Emits {
  (e: 'pageChange', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handlePrevious = () => {
  if (props.currentPage > 1) {
    emit('pageChange', props.currentPage - 1)
  }
}

const handleNext = () => {
  if (props.currentPage < props.totalPages) {
    emit('pageChange', props.currentPage + 1)
  }
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: @spacing-medium;
  padding: @spacing-medium;
}

.page-button {
  min-width: 80px;
  height: 44px;
  padding: 0 @spacing-medium;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: @pokemon-primary;
  border: none;
  border-radius: @border-radius-medium;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(.disabled) {
    background: @pokemon-secondary;
    transform: translateY(-2px);
  }

  &.disabled {
    background: @pokemon-light;
    color: @text-secondary;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.page-info {
  min-width: 60px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: @text-primary;
}
</style>
