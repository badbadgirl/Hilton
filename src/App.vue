<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useThemeStore } from './stores/theme'
import { useWelcomeStore } from './stores/welcome'
import { Logger } from './utils/logger'

onLaunch(() => {
  Logger.info('App Launch')
  const themeStore = useThemeStore()
  const welcomeStore = useWelcomeStore()
  // 加载持久化主题
  themeStore.loadTheme()
  // 检查是否需要显示欢迎弹窗
  welcomeStore.checkFirstLaunch()
})

onShow(() => {
  Logger.debug('App Show')
})

onHide(() => {
  Logger.debug('App Hide')
})
</script>

<style lang="less">
@import './styles/variables.less';
@import './styles/mixins.less';
@import './styles/app.less';
@import './styles/themes.less';

/* Global styles */
page {
  background: @color-background;
  color: @color-text;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
