/**
 * useLocalStorage - 本地存储组合式函数
 * 适配微信小程序的存储API
 * Validates: Requirements 2.4, 2.5
 */

import { ref, Ref } from 'vue'

/**
 * 本地存储组合式函数
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @returns 包含value、save、load、clear方法的对象
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): {
  value: Ref<T>
  save: () => void
  load: () => void
  clear: () => void
} {
  // 创建响应式引用
  const value = ref<T>(defaultValue) as Ref<T>

  /**
   * 保存当前值到本地存储
   */
  const save = (): void => {
    try {
      // 使用微信小程序的同步存储API
      wx.setStorageSync(key, JSON.stringify(value.value))
    } catch (error) {
      console.error(`Failed to save to localStorage with key "${key}":`, error)
    }
  }

  /**
   * 从本地存储加载值
   */
  const load = (): void => {
    try {
      // 使用微信小程序的同步获取API
      const stored = wx.getStorageSync(key)
      if (stored) {
        value.value = JSON.parse(stored) as T
      } else {
        // 如果没有存储值，使用默认值
        value.value = defaultValue
      }
    } catch (error) {
      console.error(`Failed to load from localStorage with key "${key}":`, error)
      // 加载失败时使用默认值
      value.value = defaultValue
    }
  }

  /**
   * 清除本地存储中的值并重置为默认值
   */
  const clear = (): void => {
    try {
      // 使用微信小程序的同步删除API
      wx.removeStorageSync(key)
      value.value = defaultValue
    } catch (error) {
      console.error(`Failed to clear localStorage with key "${key}":`, error)
    }
  }

  // 初始化时加载存储的值
  load()

  return {
    value,
    save,
    load,
    clear,
  }
}
