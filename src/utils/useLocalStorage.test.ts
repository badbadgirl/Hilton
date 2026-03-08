/**
 * Unit tests for useLocalStorage
 * Validates: Requirements 2.4, 2.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

// Mock WeChat Mini Program APIs
const mockWx = {
  setStorageSync: vi.fn(),
  getStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
}

// Assign to global
;(globalThis as any).wx = mockWx

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default value when no stored value exists', () => {
    mockWx.getStorageSync.mockReturnValue('')

    const { value } = useLocalStorage('test-key', 'default')

    expect(mockWx.getStorageSync).toHaveBeenCalledWith('test-key')
    expect(value.value).toBe('default')
  })

  it('should load stored value on initialization', () => {
    const storedValue = { theme: 'dark' }
    mockWx.getStorageSync.mockReturnValue(JSON.stringify(storedValue))

    const { value } = useLocalStorage('theme-key', { theme: 'light' })

    expect(mockWx.getStorageSync).toHaveBeenCalledWith('theme-key')
    expect(value.value).toEqual(storedValue)
  })

  it('should save value to storage', () => {
    mockWx.getStorageSync.mockReturnValue('')

    const { value, save } = useLocalStorage('test-key', 'initial')

    value.value = 'updated'
    save()

    expect(mockWx.setStorageSync).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('updated')
    )
  })

  it('should save complex objects to storage', () => {
    mockWx.getStorageSync.mockReturnValue('')

    const defaultValue = { count: 0, name: 'test' }
    const { value, save } = useLocalStorage('object-key', defaultValue)

    value.value = { count: 5, name: 'updated' }
    save()

    expect(mockWx.setStorageSync).toHaveBeenCalledWith(
      'object-key',
      JSON.stringify({ count: 5, name: 'updated' })
    )
  })

  it('should load value from storage', () => {
    const storedValue = 'stored-value'
    mockWx.getStorageSync.mockReturnValue(JSON.stringify(storedValue))

    const { value, load } = useLocalStorage('test-key', 'default')

    // 初始化时已经加载了一次
    expect(value.value).toBe(storedValue)

    // 修改值
    value.value = 'modified'
    expect(value.value).toBe('modified')

    // 重新加载
    load()
    expect(value.value).toBe(storedValue)
    expect(mockWx.getStorageSync).toHaveBeenCalledTimes(2)
  })

  it('should clear storage and reset to default value', () => {
    mockWx.getStorageSync.mockReturnValue(JSON.stringify('stored'))

    const { value, clear } = useLocalStorage('test-key', 'default')

    expect(value.value).toBe('stored')

    clear()

    expect(mockWx.removeStorageSync).toHaveBeenCalledWith('test-key')
    expect(value.value).toBe('default')
  })

  it('should handle save errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockWx.getStorageSync.mockReturnValue('')
    mockWx.setStorageSync.mockImplementation(() => {
      throw new Error('Storage full')
    })

    const { value, save } = useLocalStorage('test-key', 'default')

    value.value = 'new-value'
    
    // 不应该抛出错误
    expect(() => save()).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('保存本地存储失败'),
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should handle load errors gracefully and use default value', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockWx.getStorageSync.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { value } = useLocalStorage('test-key', 'default')

    expect(value.value).toBe('default')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('读取本地存储失败'),
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should handle clear errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockWx.getStorageSync.mockReturnValue(JSON.stringify('stored'))
    mockWx.removeStorageSync.mockImplementation(() => {
      throw new Error('Remove error')
    })

    const { clear } = useLocalStorage('test-key', 'default')

    // 不应该抛出错误
    expect(() => clear()).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('清除本地存储失败'),
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should handle invalid JSON in storage', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockWx.getStorageSync.mockReturnValue('invalid-json{')

    const { value } = useLocalStorage('test-key', 'default')

    // 应该回退到默认值
    expect(value.value).toBe('default')
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should support different data types', () => {
    mockWx.getStorageSync.mockReturnValue('')

    // String
    const { value: stringValue } = useLocalStorage('string-key', 'test')
    expect(stringValue.value).toBe('test')

    // Number
    const { value: numberValue } = useLocalStorage('number-key', 42)
    expect(numberValue.value).toBe(42)

    // Boolean
    const { value: boolValue } = useLocalStorage('bool-key', true)
    expect(boolValue.value).toBe(true)

    // Array
    const { value: arrayValue } = useLocalStorage('array-key', [1, 2, 3])
    expect(arrayValue.value).toEqual([1, 2, 3])

    // Object
    const { value: objectValue } = useLocalStorage('object-key', { a: 1 })
    expect(objectValue.value).toEqual({ a: 1 })
  })

  it('should maintain reactivity', () => {
    mockWx.getStorageSync.mockReturnValue('')

    const { value } = useLocalStorage('test-key', 0)

    expect(value.value).toBe(0)

    value.value = 10
    expect(value.value).toBe(10)

    value.value = 20
    expect(value.value).toBe(20)
  })

  it('should work with theme persistence use case', () => {
    // 模拟主题持久化场景（需求2.4, 2.5）
    mockWx.getStorageSync.mockReturnValue('')

    const { value: theme, save, load } = useLocalStorage('app-theme', 'pokemon')

    // 默认主题
    expect(theme.value).toBe('pokemon')

    // 用户切换主题
    theme.value = 'dark'
    save()

    expect(mockWx.setStorageSync).toHaveBeenCalledWith(
      'app-theme',
      JSON.stringify('dark')
    )

    // 模拟应用重启，加载保存的主题
    mockWx.getStorageSync.mockReturnValue(JSON.stringify('dark'))
    load()

    expect(theme.value).toBe('dark')
  })

  it('should work with welcome modal state use case', () => {
    // 模拟欢迎模态框状态持久化场景（需求1.4, 1.5）
    mockWx.getStorageSync.mockReturnValue('')

    const { value: hasShown, save } = useLocalStorage('welcome-shown', false)

    // 首次启动
    expect(hasShown.value).toBe(false)

    // 显示欢迎模态框后标记为已显示
    hasShown.value = true
    save()

    expect(mockWx.setStorageSync).toHaveBeenCalledWith(
      'welcome-shown',
      JSON.stringify(true)
    )

    // 模拟应用重启，应该跳过欢迎模态框
    mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))
    const { value: hasShownAgain } = useLocalStorage('welcome-shown', false)

    expect(hasShownAgain.value).toBe(true)
  })
})
