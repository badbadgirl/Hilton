<template>
  <view :class="['home-page', 'theme-bg', themeClass]">
    <view class="page-header">
      <ThemeSelector />
      <view class="title-row">
        <text :class="['page-title', 'theme-primary-text']">宝可梦图鉴</text>
        <text class="search-link" @tap="goToSearch">搜索</text>
      </view>
    </view>

    <ImageCarousel :images="bannerImages" />

    <LoadingIndicator :is-loading="homeStore.isLoading" />

    <view v-if="!homeStore.isLoading" class="results-section">
      <SearchResults
        :results="homeStore.displayedResults"
        :is-empty="!homeStore.hasResults && !homeStore.isLoading"
        @pokemon-click="navigateToDetail"
      />

      <view v-if="homeStore.isLoadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="homeStore.hasResults && !homeStore.hasMore" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>

    <WelcomeModal />
  </view>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { useHomeStore } from '../../stores/home'
import { useWelcomeStore } from '../../stores/welcome'
import { useThemeStore } from '../../stores/theme'
import WelcomeModal from '../../components/WelcomeModal.vue'
import ThemeSelector from '../../components/ThemeSelector.vue'
import LoadingIndicator from '../../components/LoadingIndicator.vue'
import SearchResults from '../../components/SearchResults.vue'
import ImageCarousel from '../../components/ImageCarousel.vue'

// 轮播图数据
const bannerImages = [
  '/static/images/bg1.png',
  '/static/images/bg2.png',
  '/static/images/bg3.png',
  '/static/images/bg4.png',
  '/static/images/bg5.png',
]

const homeStore = useHomeStore()
const welcomeStore = useWelcomeStore()
const themeStore = useThemeStore()

const themeClass = computed(() => `theme-${themeStore.currentTheme}`)

// 跳转到search页面
const goToSearch = () => {
  wx.navigateTo({ url: '/pages/search/search' })
}
// 跳转到详情页
const navigateToDetail = (pokemonId: number) => {
  wx.navigateTo({ url: `/pages/detail/detail?id=${pokemonId}` })
}

onReachBottom(() => {
  homeStore.loadMore()
})

onMounted(() => {
  welcomeStore.checkFirstLaunch() // 检测是否初次启动，初次启动弹出欢迎弹窗
  homeStore.fetchList() // 加载列表
})
</script>

<style lang="less" scoped>
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.home-page {
  min-height: 100vh;
  padding: @spacing-medium;
}

.page-header {
  margin-bottom: @spacing-sm;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
}

.search-link {
  font-size: 16px;
  color: @pokemon-secondary;
  padding: 8px 16px;
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
