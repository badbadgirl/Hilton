<template>
  <view :class="['detail-page', themeClass]">
    <BackButton @click="handleBack" />

    <LoadingIndicator :is-loading="isLoading" />

    <view v-if="error" class="error-message">
      <text>{{ error }}</text>
    </view>

    <view v-if="pokemon && !isLoading" class="detail-content">
      <PokemonHeader
        :name="pokemon.name"
        :id="pokemon.id"
      />

      <view class="info-section theme-surface">
        <view class="info-item">
          <text :class="['info-label', 'theme-text-secondary']">身高</text>
          <text :class="['info-value', 'theme-text']">{{ pokemon.height || 'N/A' }}</text>
        </view>
        <view class="info-item">
          <text :class="['info-label', 'theme-text-secondary']">体重</text>
          <text :class="['info-value', 'theme-text']">{{ pokemon.weight || 'N/A' }}</text>
        </view>
      </view>

      <AbilitiesList
        v-if="pokemon.pokemon_v2_pokemonabilities.length > 0"
        :abilities="pokemon.pokemon_v2_pokemonabilities"
      />

      <view v-if="pokemon.pokemon_v2_pokemontypes && pokemon.pokemon_v2_pokemontypes.length > 0" class="types-section theme-surface">
        <text :class="['section-title', 'theme-text']">类型</text>
        <view class="types-list">
          <view
            v-for="(type, index) in pokemon.pokemon_v2_pokemontypes"
            :key="index"
            class="type-badge theme-primary-bg"
          >
            <text>{{ type.pokemon_v2_type.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import type { Pokemon } from '../../types'
import { graphqlClient } from '../../api/graphql'
import { useThemeStore } from '../../stores/theme'
import PokemonHeader from '../../components/PokemonHeader.vue'
import AbilitiesList from '../../components/AbilitiesList.vue'
import BackButton from '../../components/BackButton.vue'
import LoadingIndicator from '../../components/LoadingIndicator.vue'

const themeStore = useThemeStore()
const themeClass = computed(() => `theme-${themeStore.currentTheme}`)

const pokemon = ref<Pokemon | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Use onLoad for WeChat mini-app page lifecycle
onLoad(async (options: any) => {
  const pokemonId = parseInt(options.id || '0')
  
  if (pokemonId > 0) {
    isLoading.value = true
    error.value = null
    
    try {
      pokemon.value = await graphqlClient.getPokemonDetail(pokemonId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取宝可梦详情失败'
      console.error('Failed to fetch pokemon detail:', err)
    } finally {
      isLoading.value = false
    }
  }
})

const handleBack = () => {
  // @ts-ignore - WeChat mini-app API
  wx.navigateBack()
}
</script>

<style lang="less" scoped>
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.detail-page {
  min-height: 100vh;
  padding: @spacing-medium;
  background: linear-gradient(135deg, @pokemon-light, white);
}

.error-message {
  padding: @spacing-large;
  background: #ffebee;
  border-radius: @border-radius-medium;
  text-align: center;
  color: #c62828;
  margin: @spacing-large 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: @spacing-large;
  margin-top: @spacing-large;
}

.info-section {
  display: flex;
  gap: @spacing-medium;
  padding: @spacing-medium;
  background: white;
  border-radius: @border-radius-medium;
  box-shadow: @shadow-small;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: @spacing-small;
}

.info-label {
  font-size: 14px;
  color: @text-secondary;
  margin-bottom: @spacing-xs;
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: @text-primary;
}

.types-section {
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

.types-list {
  display: flex;
  flex-wrap: wrap;
  gap: @spacing-small;
}

.type-badge {
  padding: @spacing-small @spacing-medium;
  background: @pokemon-secondary;
  border-radius: @border-radius-small;
  color: white;
  font-size: 14px;
  text-transform: capitalize;
}
</style>
