<template>
  <view :class="['search-page', 'theme-bg', themeClass]">
    <view class="page-header">
      <ThemeSelector />
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
        :results="searchStore.paginatedResults"
        :is-empty="searchStore.isEmpty"
        @pokemon-click="navigateToDetail"
      />

      <Pagination
        v-if="searchStore.hasResults"
        :current-page="searchStore.currentPage"
        :total-pages="searchStore.totalPages"
        @page-change="handlePageChange"
      />
    </view>

    <WelcomeModal />
  </view>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSearchStore } from '../../stores/search'
import { useWelcomeStore } from '../../stores/welcome'
import { useThemeStore } from '../../stores/theme'
import WelcomeModal from '../../components/WelcomeModal.vue'
import ThemeSelector from '../../components/ThemeSelector.vue'
import SearchInput from '../../components/SearchInput.vue'
import SearchButton from '../../components/SearchButton.vue'
import LoadingIndicator from '../../components/LoadingIndicator.vue'
import SearchResults from '../../components/SearchResults.vue'
import Pagination from '../../components/Pagination.vue'

const searchStore = useSearchStore()
const welcomeStore = useWelcomeStore()
const themeStore = useThemeStore()

const themeClass = computed(() => `theme-${themeStore.currentTheme}`)

const handleSearch = async () => {
  if (searchStore.keyword) {
    await searchStore.search(searchStore.keyword)
  }
}

const handlePageChange = (page: number) => {
  searchStore.setPage(page)
}

const navigateToDetail = (pokemonId: number) => {
  // @ts-ignore - WeChat mini-app API
  wx.navigateTo({
    url: `/pages/detail/detail?id=${pokemonId}`
  })
}

onMounted(() => {
  welcomeStore.checkFirstLaunch()
})
</script>

<style lang="less" scoped>
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.search-page {
  min-height: 100vh;
  padding: @spacing-medium;
}

.page-header {
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
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
</style>
