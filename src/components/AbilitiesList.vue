<template>
  <view class="abilities-list">
    <text class="section-title">技能</text>
    <view class="abilities-grid">
      <view
        v-for="ability in abilities"
        :key="ability.pokemon_v2_ability.id"
        class="ability-item"
      >
        <text class="ability-name">{{ ability.pokemon_v2_ability.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PokemonAbility } from '../types'

interface Props {
  abilities: PokemonAbility[]
}

const props = defineProps<Props>()
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.abilities-list {
  padding: @spacing-medium;
  background: white;
  border-radius: @border-radius-medium;
  box-shadow: @shadow-small;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: @text-primary;
  margin-bottom: @spacing-medium;
}

.abilities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: @spacing-small;
}

.ability-item {
  padding: @spacing-small @spacing-medium;
  background: @pokemon-light;
  border-radius: @border-radius-small;
  border: 2px solid @pokemon-primary;
}

.ability-name {
  font-size: 14px;
  color: @text-primary;
  text-transform: capitalize;
}
</style>
