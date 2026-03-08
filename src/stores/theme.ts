/**
 * ThemeStore - 主题状态管理
 * 管理应用的视觉主题，支持三种主题切换和持久化
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 8.3
 */

import { defineStore } from 'pinia'
import { useLocalStorage } from '../utils/useLocalStorage'
import { Logger } from '../utils/logger'

const THEME_STORAGE_KEY = 'pokemon_app_theme'

/**
 * 主题配色接口
 */
interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  accent: string
  error: string
  success: string
  warning: string
}

/**
 * 主题接口
 */
interface Theme {
  name: string
  displayName: string
  colors: ThemeColors
}

/**
 * 主题状态接口
 */
interface ThemeState {
  currentTheme: 'pokemon' | 'dark' | 'light'
  availableThemes: Theme[]
}

/**
 * 定义三种主题配色方案
 * Validates: Requirement 2.1
 */
const themes: Theme[] = [
  {
    name: 'pokemon',
    displayName: '宝可梦',
    colors: {
      primary: '#FFCB05',      // 宝可梦黄
      secondary: '#3D7DCA',    // 宝可梦蓝
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#2C2C2C',
      textSecondary: '#666666',
      accent: '#FF0000',       // 精灵球红
      error: '#D32F2F',
      success: '#388E3C',
      warning: '#F57C00',
    },
  },
  {
    name: 'dark',
    displayName: '暗黑',
    colors: {
      primary: '#BB86FC',
      secondary: '#03DAC6',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      accent: '#CF6679',
      error: '#CF6679',
      success: '#03DAC6',
      warning: '#FFB74D',
    },
  },
  {
    name: 'light',
    displayName: '明亮',
    colors: {
      primary: '#6200EE',
      secondary: '#03DAC6',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#757575',
      accent: '#018786',
      error: '#B00020',
      success: '#4CAF50',
      warning: '#FF9800',
    },
  },
]

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: 'pokemon', // Validates: Requirement 2.2 - 默认使用宝可梦风格主题
    availableThemes: themes,
  }),

  getters: {
    /**
     * 获取当前主题对象
     */
    getCurrentThemeObject(): Theme | undefined {
      return this.availableThemes.find(theme => theme.name === this.currentTheme)
    },

    /**
     * 获取当前主题的颜色配置
     */
    getCurrentColors(): ThemeColors | undefined {
      return this.getCurrentThemeObject?.colors
    },
  },

  actions: {
    /**
     * 设置主题并应用到全局样式
     * Validates: Requirement 2.3 - 立即应用所选主题到整个应用
     * @param themeName - 主题名称
     */
    setTheme(themeName: string): void {
      // 验证主题名称是否有效
      const theme = this.availableThemes.find(t => t.name === themeName)
      if (!theme) {
        Logger.error(`无效的主题名称: ${themeName}`)
        return
      }

      // 更新当前主题
      this.currentTheme = themeName as 'pokemon' | 'dark' | 'light'

      // 应用主题到全局样式
      this.applyThemeToGlobalStyles(theme)

      // 持久化主题选择
      this.persistTheme()
    },

    /**
     * 应用主题颜色到全局CSS变量
     * @param theme - 主题对象
     */
    applyThemeToGlobalStyles(theme: Theme): void {
      // 检查是否在浏览器环境（H5）
      if (typeof document !== 'undefined' && document.documentElement) {
        const root = document.documentElement
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value)
        })
      }
      
      // 在小程序环境中，CSS变量通过Less编译时已经设置
      // 主题切换可以通过动态类名或其他方式实现
      // 这里我们只需要更新状态，样式会通过响应式更新
    },

    /**
     * 从本地存储加载主题
     * Validates: Requirement 2.5 - 用户重新启动应用时，加载上次选择的主题
     */
    loadTheme(): void {
      const storage = useLocalStorage<string>(THEME_STORAGE_KEY, 'pokemon')
      storage.load()

      const savedTheme = storage.value.value
      // 验证保存的主题是否有效
      const theme = this.availableThemes.find(t => t.name === savedTheme)
      
      if (theme) {
        this.currentTheme = savedTheme as 'pokemon' | 'dark' | 'light'
        this.applyThemeToGlobalStyles(theme)
      } else {
        // 如果保存的主题无效，使用默认主题
        const defaultTheme = this.availableThemes.find(t => t.name === 'pokemon')
        if (defaultTheme) {
          this.applyThemeToGlobalStyles(defaultTheme)
        }
      }
    },

    /**
     * 持久化当前主题到本地存储
     * Validates: Requirement 2.4 - 持久化用户的主题选择
     */
    persistTheme(): void {
      const storage = useLocalStorage<string>(THEME_STORAGE_KEY, 'pokemon')
      storage.value.value = this.currentTheme
      storage.save()
    },
  },
})
