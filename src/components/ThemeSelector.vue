<template>
  <view class="theme-selector">
    <text class="selector-label">主题</text>
    <view class="theme-options">
      <view
        v-for="theme in themeStore.availableThemes"
        :key="theme.name"
        class="theme-option"
        :class="{ active: themeStore.currentTheme === theme.name }"
        @tap="handleThemeChange(theme.name)"
      >
        <view 
          class="theme-preview" 
          :style="{ backgroundColor: theme.colors.primary }"
        ></view>
        <text class="theme-name">{{ theme.displayName }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

const handleThemeChange = (themeName: string) => {
  themeStore.setTheme(themeName)
}
</script>

<style lang="less" scoped>
@import '../styles/variables.less';
@import '../styles/mixins.less';

.theme-selector {
  padding: @spacing-medium;
  background: white;
  border-radius: @border-radius-medium;
  box-shadow: @shadow-small;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selector-label {
  font-size: 14px;
  font-weight: bold;
  color: @text-primary;
  margin-bottom: @spacing-small;
}

.theme-options {
  display: flex;
  gap: @spacing-small;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: @spacing-small;
  border-radius: @border-radius-small;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;

  &.active {
    border-color: @pokemon-primary;
    background: @pokemon-light;
  }

  &:hover {
    transform: translateY(-2px);
  }
}

.theme-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-bottom: @spacing-xs;
  box-shadow: @shadow-small;
}

.theme-name {
  font-size: 12px;
  color: @text-secondary;
}
</style>
