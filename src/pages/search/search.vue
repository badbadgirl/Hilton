<template>
  <view :class="['search-page', 'theme-bg', themeClass]">
    <view class="page-header">
      <text :class="['page-title', 'theme-primary-text']">宝可梦搜索</text>
    </view>

    <view class="search-section">
      <view class="search-controls">
        <SearchInput
          v-model="searchStore.keyword"
          @search="handleSearch"
        />
        <SearchButton
          :disabled="!searchStore.keyword"
          @click="handleSearch"
        />
      </view>
    </view>

    <LoadingIndicator :is-loading="searchStore.isLoading" />

    <view v-if="!searchStore.isLoading" class="results-section">
      <SearchResults
        :results="searchStore.displayedResults"
        :is-empty="searchStore.isEmpty"
        @pokemon-click="navigateToDetail"
      />

      <view v-if="searchStore.isLoadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="searchStore.hasResults && !searchStore.hasMore" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { useSearchStore } from '../../stores/search'
import { useThemeStore } from '../../stores/theme'
import SearchInput from '../../components/SearchInput.vue'
import SearchButton from '../../components/SearchButton.vue'
import LoadingIndicator from '../../components/LoadingIndicator.vue'
import SearchResults from '../../components/SearchResults.vue'

const searchStore = useSearchStore()
const themeStore = useThemeStore()

const themeClass = computed(() => `theme-${themeStore.currentTheme}`)

const handleSearch = async () => {
  if (searchStore.keyword) {
    await searchStore.search(searchStore.keyword)
  }
}

onReachBottom(() => {
  searchStore.loadMore()
})

const navigateToDetail = (pokemonId: number) => {
  // @ts-ignore - WeChat mini-app API
  wx.navigateTo({
    url: `/pages/detail/detail?id=${pokemonId}`
  })
}

</script>

<style lang="less" scoped>
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.search-page {
  min-height: 100vh;
  padding: @spacing-medium;
}

.page-header {
  margin-bottom: @spacing-sm;
}

.page-title {
  width: 100%;
  display: block;
  font-size: 24px;
  font-weight: bold;
  padding-top: 20px;
}

.search-section {
  width: 100;
  margin-bottom: @spacing-large;
}

.search-controls {
  display: flex;
  gap: @spacing-small;
  align-items: center;
}

.results-section {
  margin-top: @spacing-large;
}

.loading-more {
  text-align: center;
  padding: @spacing-medium;
  color: @text-secondary;
  font-size: 14px;
}

.no-more {
  text-align: center;
  padding: @spacing-medium;
  color: @text-secondary;
  font-size: 14px;
  opacity: 0.6;
}
</style>
