/**
 * useLocalStorage - 本地存储组合式函数
 * 适配微信小程序的存储API
 * Validates: Requirements 2.4, 2.5
 */

import { ref, Ref } from 'vue'
import { Logger } from './logger'

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
  const value = ref<T>(defaultValue) as Ref<T>

  const save = (): void => {
    try {
      wx.setStorageSync(key, JSON.stringify(value.value))
    } catch (error) {
      Logger.error(`保存本地存储失败 key="${key}":`, error)
    }
  }

  const load = (): void => {
    try {
      const stored = wx.getStorageSync(key)
      if (stored) {
        value.value = JSON.parse(stored) as T
      } else {
        value.value = defaultValue
      }
    } catch (error) {
      Logger.error(`读取本地存储失败 key="${key}":`, error)
      value.value = defaultValue
    }
  }

  const clear = (): void => {
    try {
      wx.removeStorageSync(key)
      value.value = defaultValue
    } catch (error) {
      Logger.error(`清除本地存储失败 key="${key}":`, error)
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
