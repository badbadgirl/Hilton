<template>
  <view class="species-card" @tap="handleCardClick">
    <view class="species-header">
      <text class="species-name">{{ species.name }}</text>
      <text class="species-id">#{{ species.id }}</text>
    </view>
    <view class="abilities-list" v-if="species.pokemon_v2_pokemonabilities.length > 0">
      <text class="abilities-label">能力:</text>
      <text class="ability-name" v-for="(ability, index) in species.pokemon_v2_pokemonabilities" :key="index">
        {{ ability.pokemon_v2_ability.name }}{{ index < species.pokemon_v2_pokemonabilities.length - 1 ? ', ' : '' }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PokemonSpecies } from '../types'

interface Props {
  species: PokemonSpecies
}

interface Emits {
  (e: 'pokemonClick', pokemonId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleCardClick = () => {
  emit('pokemonClick', props.species.id)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.species-card {
  padding: @spacing-medium;
  border-radius: @border-radius-medium;
  box-shadow: @shadow-small;
  margin-bottom: @spacing-medium;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: @shadow-medium;
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.8);
  }
}

.species-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @spacing-small;
}

.species-name {
  font-size: 18px;
  font-weight: bold;
  color: @text-primary;
  text-transform: capitalize;
}

.species-id {
  font-size: 14px;
  color: @text-secondary;
}

.abilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.abilities-label {
  font-size: 14px;
  color: @text-secondary;
  font-weight: 500;
}

.ability-name {
  font-size: 14px;
  color: @text-primary;
}
</style>
