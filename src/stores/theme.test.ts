/**
 * Unit tests for ThemeStore
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 8.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from './theme'

// Mock WeChat Mini Program APIs
const mockWx = {
  setStorageSync: vi.fn(),
  getStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
}

// Assign to global
;(globalThis as any).wx = mockWx

// Mock document.documentElement for CSS variable testing
const mockRootStyle = {
  setProperty: vi.fn(),
}

const mockDocumentElement = {
  style: mockRootStyle,
}

Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: mockDocumentElement,
  },
  writable: true,
})

describe('ThemeStore', () => {
  beforeEach(() => {
    // Create a new pinia instance for each test
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with pokemon theme as default (Requirement 2.2)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      expect(store.currentTheme).toBe('pokemon')
      expect(store.availableThemes).toHaveLength(3)
    })

    it('should provide three different visual themes (Requirement 2.1)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      expect(store.availableThemes).toHaveLength(3)
      
      const themeNames = store.availableThemes.map(t => t.name)
      expect(themeNames).toContain('pokemon')
      expect(themeNames).toContain('dark')
      expect(themeNames).toContain('light')
    })

    it('should have complete color definitions for each theme', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      store.availableThemes.forEach(theme => {
        expect(theme.colors).toHaveProperty('primary')
        expect(theme.colors).toHaveProperty('secondary')
        expect(theme.colors).toHaveProperty('background')
        expect(theme.colors).toHaveProperty('surface')
        expect(theme.colors).toHaveProperty('text')
        expect(theme.colors).toHaveProperty('textSecondary')
        expect(theme.colors).toHaveProperty('accent')
        expect(theme.colors).toHaveProperty('error')
        expect(theme.colors).toHaveProperty('success')
        expect(theme.colors).toHaveProperty('warning')
      })
    })
  })

  describe('Getters', () => {
    it('should return current theme object', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      const currentThemeObject = store.getCurrentThemeObject
      expect(currentThemeObject).toBeDefined()
      expect(currentThemeObject?.name).toBe('pokemon')
    })

    it('should return current theme colors', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      const colors = store.getCurrentColors
      expect(colors).toBeDefined()
      expect(colors?.primary).toBe('#FFCB05')
      expect(colors?.secondary).toBe('#3D7DCA')
    })

    it('should update getters when theme changes', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      // 初始主题
      expect(store.getCurrentThemeObject?.name).toBe('pokemon')

      // 切换主题
      store.setTheme('dark')

      // Getters 应该更新
      expect(store.getCurrentThemeObject?.name).toBe('dark')
      expect(store.getCurrentColors?.primary).toBe('#BB86FC')
    })
  })

  describe('setTheme', () => {
    it('should update current theme when valid theme name is provided (Requirement 2.3)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      store.setTheme('dark')

      expect(store.currentTheme).toBe('dark')
    })

    it('should apply theme to global styles immediately (Requirement 2.3)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      store.setTheme('dark')

      // 验证 CSS 变量被设置
      expect(mockRootStyle.setProperty).toHaveBeenCalled()
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-primary', '#BB86FC')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-secondary', '#03DAC6')
    })

    it('should persist theme selection (Requirement 2.4)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      store.setTheme('light')

      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_theme',
        JSON.stringify('light')
      )
    })

    it('should not update theme when invalid theme name is provided', () => {
      mockWx.getStorageSync.mockReturnValue('')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const store = useThemeStore()
      const originalTheme = store.currentTheme

      store.setTheme('invalid-theme')

      expect(store.currentTheme).toBe(originalTheme)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid theme name: invalid-theme')

      consoleErrorSpy.mockRestore()
    })

    it('should handle all three theme options', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      // Pokemon theme
      store.setTheme('pokemon')
      expect(store.currentTheme).toBe('pokemon')
      expect(store.getCurrentColors?.primary).toBe('#FFCB05')

      // Dark theme
      store.setTheme('dark')
      expect(store.currentTheme).toBe('dark')
      expect(store.getCurrentColors?.primary).toBe('#BB86FC')

      // Light theme
      store.setTheme('light')
      expect(store.currentTheme).toBe('light')
      expect(store.getCurrentColors?.primary).toBe('#6200EE')
    })
  })

  describe('applyThemeToGlobalStyles', () => {
    it('should set CSS variables for all theme colors', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      const darkTheme = store.availableThemes.find(t => t.name === 'dark')!

      store.applyThemeToGlobalStyles(darkTheme)

      // 验证所有颜色都被设置为 CSS 变量
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-primary', '#BB86FC')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-secondary', '#03DAC6')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-background', '#121212')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-surface', '#1E1E1E')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-text', '#FFFFFF')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-textSecondary', '#B3B3B3')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-accent', '#CF6679')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-error', '#CF6679')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-success', '#03DAC6')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-warning', '#FFB74D')
    })
  })

  describe('loadTheme', () => {
    it('should load saved theme from storage (Requirement 2.5)', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify('dark'))
      
      const store = useThemeStore()
      store.loadTheme()

      expect(store.currentTheme).toBe('dark')
      expect(mockWx.getStorageSync).toHaveBeenCalledWith('pokemon_app_theme')
    })

    it('should apply loaded theme to global styles (Requirement 2.5)', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify('light'))
      
      const store = useThemeStore()
      store.loadTheme()

      expect(mockRootStyle.setProperty).toHaveBeenCalled()
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-primary', '#6200EE')
    })

    it('should use default theme when no saved theme exists', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      store.loadTheme()

      // 应该使用默认的 pokemon 主题
      expect(store.currentTheme).toBe('pokemon')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-primary', '#FFCB05')
    })

    it('should use default theme when saved theme is invalid', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify('invalid-theme'))
      
      const store = useThemeStore()
      store.loadTheme()

      // 应该回退到默认主题
      expect(store.currentTheme).toBe('pokemon')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-primary', '#FFCB05')
    })

    it('should handle storage read errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockWx.getStorageSync.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const store = useThemeStore()
      
      // 不应该抛出错误
      expect(() => store.loadTheme()).not.toThrow()
      
      // 应该使用默认主题
      expect(store.currentTheme).toBe('pokemon')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('persistTheme', () => {
    it('should save current theme to storage (Requirement 2.4)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      store.currentTheme = 'dark'
      store.persistTheme()

      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_theme',
        JSON.stringify('dark')
      )
    })

    it('should handle storage write errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockWx.getStorageSync.mockReturnValue('')
      mockWx.setStorageSync.mockImplementation(() => {
        throw new Error('Storage full')
      })

      const store = useThemeStore()
      
      // 不应该抛出错误
      expect(() => store.persistTheme()).not.toThrow()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Complete User Flow', () => {
    it('should handle theme selection and persistence flow (Requirements 2.3, 2.4)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      // 用户选择主题
      store.setTheme('dark')

      // 主题应该立即应用
      expect(store.currentTheme).toBe('dark')
      expect(mockRootStyle.setProperty).toHaveBeenCalled()

      // 主题应该被持久化
      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_theme',
        JSON.stringify('dark')
      )
    })

    it('should handle app restart with saved theme (Requirement 2.5)', () => {
      // 模拟用户之前选择了 light 主题
      mockWx.getStorageSync.mockReturnValue(JSON.stringify('light'))
      
      const store = useThemeStore()
      
      // 应用启动时加载主题
      store.loadTheme()

      // 应该恢复上次选择的主题
      expect(store.currentTheme).toBe('light')
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith('--color-primary', '#6200EE')
    })

    it('should handle multiple theme switches', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      // 切换到 dark
      store.setTheme('dark')
      expect(store.currentTheme).toBe('dark')

      // 切换到 light
      store.setTheme('light')
      expect(store.currentTheme).toBe('light')

      // 切换回 pokemon
      store.setTheme('pokemon')
      expect(store.currentTheme).toBe('pokemon')

      // 每次切换都应该持久化
      expect(mockWx.setStorageSync).toHaveBeenCalledTimes(3)
    })
  })

  describe('State Management (Requirement 8.3)', () => {
    it('should manage theme state correctly', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      // 初始状态
      expect(store.$state.currentTheme).toBe('pokemon')
      expect(store.$state.availableThemes).toHaveLength(3)

      // 更新状态
      store.setTheme('dark')
      expect(store.$state.currentTheme).toBe('dark')
    })

    it('should be accessible from multiple components', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      // 模拟两个组件访问同一个 store
      const store1 = useThemeStore()
      const store2 = useThemeStore()

      // 应该是同一个实例
      expect(store1).toBe(store2)

      // 在一个组件中更新主题
      store1.setTheme('dark')

      // 另一个组件应该看到更新
      expect(store2.currentTheme).toBe('dark')
    })

    it('should provide reactive state updates', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()

      // 验证状态是响应式的
      expect(store.currentTheme).toBe('pokemon')

      // 切换主题
      store.setTheme('dark')
      expect(store.currentTheme).toBe('dark')

      store.setTheme('light')
      expect(store.currentTheme).toBe('light')

      // 验证 getter 也是响应式的
      expect(store.getCurrentThemeObject?.name).toBe('light')
    })
  })

  describe('Integration with useLocalStorage', () => {
    it('should use correct storage key', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      store.loadTheme()

      expect(mockWx.getStorageSync).toHaveBeenCalledWith('pokemon_app_theme')
    })

    it('should persist string value correctly', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      store.setTheme('dark')

      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_theme',
        JSON.stringify('dark')
      )
    })

    it('should load persisted value correctly', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify('light'))
      
      const store = useThemeStore()
      store.loadTheme()

      expect(store.currentTheme).toBe('light')
    })
  })

  describe('Theme Color Schemes', () => {
    it('should have Pokemon theme with correct colors', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      const pokemonTheme = store.availableThemes.find(t => t.name === 'pokemon')

      expect(pokemonTheme).toBeDefined()
      expect(pokemonTheme?.displayName).toBe('宝可梦')
      expect(pokemonTheme?.colors.primary).toBe('#FFCB05')
      expect(pokemonTheme?.colors.secondary).toBe('#3D7DCA')
      expect(pokemonTheme?.colors.accent).toBe('#FF0000')
    })

    it('should have Dark theme with correct colors', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      const darkTheme = store.availableThemes.find(t => t.name === 'dark')

      expect(darkTheme).toBeDefined()
      expect(darkTheme?.displayName).toBe('暗黑')
      expect(darkTheme?.colors.background).toBe('#121212')
      expect(darkTheme?.colors.text).toBe('#FFFFFF')
    })

    it('should have Light theme with correct colors', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useThemeStore()
      const lightTheme = store.availableThemes.find(t => t.name === 'light')

      expect(lightTheme).toBeDefined()
      expect(lightTheme?.displayName).toBe('明亮')
      expect(lightTheme?.colors.background).toBe('#FFFFFF')
      expect(lightTheme?.colors.text).toBe('#000000')
    })
  })
})
