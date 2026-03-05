/**
 * WelcomeStore - 欢迎模态框状态管理
 * 管理首次启动欢迎界面的显示状态
 * Validates: Requirements 1.4, 1.5, 8.4
 */

import { defineStore } from 'pinia'
import { useLocalStorage } from '../utils/useLocalStorage'

const WELCOME_STORAGE_KEY = 'pokemon_app_welcome_shown'

interface WelcomeState {
  hasShown: boolean
  shouldShow: boolean
}

export const useWelcomeStore = defineStore('welcome', {
  state: (): WelcomeState => ({
    hasShown: false,
    shouldShow: false,
  }),

  actions: {
    /**
     * 标记欢迎模态框已显示，并持久化到本地存储
     * Validates: Requirement 1.4
     */
    markAsShown(): void {
      this.hasShown = true
      this.shouldShow = false
      
      // 持久化到本地存储
      const storage = useLocalStorage<boolean>(WELCOME_STORAGE_KEY, false)
      storage.value.value = true
      storage.save()
    },

    /**
     * 检查是否首次启动应用
     * Validates: Requirements 1.5
     */
    checkFirstLaunch(): void {
      const storage = useLocalStorage<boolean>(WELCOME_STORAGE_KEY, false)
      storage.load()
      
      this.hasShown = storage.value.value
      // 如果未显示过，则应该显示欢迎模态框
      this.shouldShow = !this.hasShown
    },
  },
})
