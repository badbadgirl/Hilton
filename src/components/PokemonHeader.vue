<template>
  <view class="pokemon-header">
    <text class="pokemon-name">{{ name }}</text>
    <text class="pokemon-id">#{{ id }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  name: string
  id: number
}

const props = defineProps<Props>()
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.pokemon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: @spacing-large;
  background: linear-gradient(135deg, @pokemon-primary, @pokemon-secondary);
  border-radius: @border-radius-large;
  box-shadow: @shadow-medium;
  margin-bottom: @spacing-large;
}

.pokemon-name {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-transform: capitalize;
}

.pokemon-id {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
</style>
