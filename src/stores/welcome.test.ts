/**
 * Unit tests for WelcomeStore
 * Validates: Requirements 1.4, 1.5, 8.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWelcomeStore } from './welcome'

// Mock WeChat Mini Program APIs
const mockWx = {
  setStorageSync: vi.fn(),
  getStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
}

// Assign to global
;(globalThis as any).wx = mockWx

describe('WelcomeStore', () => {
  beforeEach(() => {
    // Create a new pinia instance for each test
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()

      expect(store.hasShown).toBe(false)
      expect(store.shouldShow).toBe(false)
    })
  })

  describe('checkFirstLaunch', () => {
    it('should set shouldShow to true when app is launched for the first time', () => {
      // 模拟首次启动，本地存储为空
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      store.checkFirstLaunch()

      expect(store.hasShown).toBe(false)
      expect(store.shouldShow).toBe(true)
      expect(mockWx.getStorageSync).toHaveBeenCalledWith('pokemon_app_welcome_shown')
    })

    it('should set shouldShow to false when app has been launched before', () => {
      // 模拟非首次启动，本地存储有值
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))

      const store = useWelcomeStore()
      store.checkFirstLaunch()

      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)
      expect(mockWx.getStorageSync).toHaveBeenCalledWith('pokemon_app_welcome_shown')
    })

    it('should handle storage read errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockWx.getStorageSync.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const store = useWelcomeStore()
      
      // 不应该抛出错误
      expect(() => store.checkFirstLaunch()).not.toThrow()
      
      // 应该回退到默认行为（首次启动）
      expect(store.hasShown).toBe(false)
      expect(store.shouldShow).toBe(true)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('markAsShown', () => {
    it('should update state and persist to storage when called', () => {
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      
      // 初始状态
      expect(store.hasShown).toBe(false)
      expect(store.shouldShow).toBe(false)

      // 标记为已显示
      store.markAsShown()

      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)
      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_welcome_shown',
        JSON.stringify(true)
      )
    })

    it('should persist state correctly after marking as shown', () => {
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      store.markAsShown()

      // 验证持久化调用
      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_welcome_shown',
        JSON.stringify(true)
      )
    })

    it('should handle storage write errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockWx.getStorageSync.mockReturnValue('')
      mockWx.setStorageSync.mockImplementation(() => {
        throw new Error('Storage full')
      })

      const store = useWelcomeStore()
      
      // 不应该抛出错误
      expect(() => store.markAsShown()).not.toThrow()
      
      // 状态应该仍然更新
      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Complete User Flow', () => {
    it('should handle first launch flow correctly (Requirement 1.1, 1.4)', () => {
      // 模拟首次启动
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      
      // 检查首次启动
      store.checkFirstLaunch()
      expect(store.shouldShow).toBe(true)
      expect(store.hasShown).toBe(false)

      // 用户关闭欢迎模态框
      store.markAsShown()
      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)
      expect(mockWx.setStorageSync).toHaveBeenCalled()
    })

    it('should handle subsequent launch flow correctly (Requirement 1.5)', () => {
      // 模拟非首次启动
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))

      const store = useWelcomeStore()
      
      // 检查启动状态
      store.checkFirstLaunch()
      
      // 应该跳过欢迎模态框
      expect(store.shouldShow).toBe(false)
      expect(store.hasShown).toBe(true)
    })

    it('should maintain state across multiple checkFirstLaunch calls', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))

      const store = useWelcomeStore()
      
      // 多次调用 checkFirstLaunch
      store.checkFirstLaunch()
      expect(store.shouldShow).toBe(false)
      
      store.checkFirstLaunch()
      expect(store.shouldShow).toBe(false)
      
      store.checkFirstLaunch()
      expect(store.shouldShow).toBe(false)
    })

    it('should allow resetting state by calling markAsShown multiple times', () => {
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      
      store.markAsShown()
      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)

      // 再次调用不应该改变状态
      store.markAsShown()
      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)
    })
  })

  describe('Integration with useLocalStorage', () => {
    it('should use correct storage key', () => {
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      store.checkFirstLaunch()

      expect(mockWx.getStorageSync).toHaveBeenCalledWith('pokemon_app_welcome_shown')
    })

    it('should persist boolean value correctly', () => {
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      store.markAsShown()

      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_welcome_shown',
        JSON.stringify(true)
      )
    })

    it('should load persisted value correctly', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))

      const store = useWelcomeStore()
      store.checkFirstLaunch()

      expect(store.hasShown).toBe(true)
    })
  })

  describe('State Management (Requirement 8.4)', () => {
    it('should manage welcome modal display state correctly', () => {
      mockWx.getStorageSync.mockReturnValue('')

      const store = useWelcomeStore()
      
      // 初始状态
      expect(store.$state).toEqual({
        hasShown: false,
        shouldShow: false,
      })

      // 检查首次启动
      store.checkFirstLaunch()
      expect(store.$state.shouldShow).toBe(true)

      // 标记为已显示
      store.markAsShown()
      expect(store.$state).toEqual({
        hasShown: true,
        shouldShow: false,
      })
    })

    it('should be accessible from multiple components', () => {
      mockWx.getStorageSync.mockReturnValue('')

      // 模拟两个组件访问同一个 store
      const store1 = useWelcomeStore()
      const store2 = useWelcomeStore()

      // 应该是同一个实例
      expect(store1).toBe(store2)

      // 在一个组件中更新状态
      store1.markAsShown()

      // 另一个组件应该看到更新
      expect(store2.hasShown).toBe(true)
      expect(store2.shouldShow).toBe(false)
    })
  })
})
