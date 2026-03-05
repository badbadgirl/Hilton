<template>
  <view class="pokemon-item" @tap="handleClick">
    <text class="pokemon-name">{{ pokemon.name }}</text>
    <text class="pokemon-id">#{{ pokemon.id }}</text>
  </view>
</template>

<script setup lang="ts">
import type { Pokemon } from '../types'

interface Props {
  pokemon: Pokemon
}

interface Emits {
  (e: 'click', pokemonId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('click', props.pokemon.id)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.pokemon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: @spacing-small @spacing-medium;
  min-height: 44px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: @border-radius-small;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(4px);
  }
}

.pokemon-name {
  font-size: 14px;
  color: @text-primary;
  font-weight: 500;
}

.pokemon-id {
  font-size: 12px;
  color: @text-secondary;
}
</style>
