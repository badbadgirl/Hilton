<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useThemeStore } from './stores/theme'
import { useWelcomeStore } from './stores/welcome'

const themeStore = useThemeStore()
const welcomeStore = useWelcomeStore()

onLaunch(() => {
  console.log('App Launch')
  // Load persisted theme
  themeStore.loadTheme()
  // Check if welcome modal should be shown
  welcomeStore.checkFirstLaunch()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
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
