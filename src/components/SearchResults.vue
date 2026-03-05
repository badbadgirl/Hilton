<template>
  <view class="search-results">
    <view v-if="isEmpty" class="empty-state">
      <text class="empty-text">未找到结果</text>
      <text class="empty-hint">请尝试其他搜索关键词</text>
    </view>
    <view v-else class="results-list">
      <SpeciesCard
        v-for="species in results"
        :key="species.id"
        :species="species"
        @pokemon-click="handlePokemonClick"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PokemonSpecies } from '../types'
import SpeciesCard from './SpeciesCard.vue'

interface Props {
  results: PokemonSpecies[]
  isEmpty: boolean
}

interface Emits {
  (e: 'pokemonClick', pokemonId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handlePokemonClick = (pokemonId: number) => {
  emit('pokemonClick', pokemonId)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.search-results {
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: @spacing-xl;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  font-weight: bold;
  color: @text-secondary;
  margin-bottom: @spacing-small;
}

.empty-hint {
  font-size: 14px;
  color: @text-secondary;
  opacity: 0.7;
}

.results-list {
  display: flex;
  flex-direction: column;
}
</style>
