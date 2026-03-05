/**
 * Unit tests for WelcomeModal component
 * Validates: Requirements 1.1, 1.4, 1.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WelcomeModal from './WelcomeModal.vue'
import { useWelcomeStore } from '../stores/welcome'

// Mock WeChat Mini Program APIs
const mockWx = {
  setStorageSync: vi.fn(),
  getStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
}

// Assign to global
;(globalThis as any).wx = mockWx

describe('WelcomeModal', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    // Create a new pinia instance for each test
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Display Logic - First Launch (Requirement 1.1)', () => {
    it('should display modal when shouldShow is true', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should be visible
      expect(wrapper.find('.welcome-modal').exists()).toBe(true)
      expect(wrapper.find('.modal-content').exists()).toBe(true)
    })

    it('should not display modal when shouldShow is false', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should not be visible
      expect(wrapper.find('.welcome-modal').exists()).toBe(false)
    })

    it('should display welcome title and greeting text', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.text()).toContain('欢迎来到宝可梦世界！')
      expect(wrapper.text()).toContain('探索神奇的宝可梦世界')
    })

    it('should display greeting GIF image (Requirement 1.2)', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const image = wrapper.find('.greeting-gif')
      expect(image.exists()).toBe(true)
      expect(image.attributes('src')).toBe('/static/images/welcome.gif')
      expect(image.attributes('mode')).toBe('aspectFit')
    })

    it('should display close button', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const closeButton = wrapper.find('.close-button')
      expect(closeButton.exists()).toBe(true)
      expect(closeButton.text()).toContain('✕')
    })
  })

  describe('Close Behavior (Requirement 1.4)', () => {
    it('should call markAsShown when close button is clicked', async () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      const markAsShownSpy = vi.spyOn(store, 'markAsShown')
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('tap')

      expect(markAsShownSpy).toHaveBeenCalledTimes(1)
    })

    it('should call markAsShown when overlay is clicked', async () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      const markAsShownSpy = vi.spyOn(store, 'markAsShown')
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const overlay = wrapper.find('.modal-overlay')
      await overlay.trigger('tap')

      expect(markAsShownSpy).toHaveBeenCalledTimes(1)
    })

    it('should hide modal after close button is clicked', async () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should be visible initially
      expect(wrapper.find('.welcome-modal').exists()).toBe(true)

      // Click close button
      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('tap')

      // Wait for reactivity
      await wrapper.vm.$nextTick()

      // Modal should be hidden
      expect(wrapper.find('.welcome-modal').exists()).toBe(false)
    })

    it('should persist state after closing (Requirement 1.4)', async () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Click close button
      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('tap')

      // Verify state was persisted
      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_welcome_shown',
        JSON.stringify(true)
      )
    })
  })

  describe('Subsequent Launch Behavior (Requirement 1.5)', () => {
    it('should not display modal on subsequent launches', () => {
      // Simulate that welcome modal has been shown before
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should not be rendered
      expect(wrapper.find('.welcome-modal').exists()).toBe(false)
      expect(wrapper.find('.modal-content').exists()).toBe(false)
    })

    it('should skip modal and go directly to search page on non-first launch', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()

      // shouldShow should be false
      expect(store.shouldShow).toBe(false)
      expect(store.hasShown).toBe(true)
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should not exist in DOM
      expect(wrapper.html()).toBe('<!--v-if-->')
    })
  })

  describe('Integration with WelcomeStore', () => {
    it('should react to store state changes', async () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should be visible
      expect(wrapper.find('.welcome-modal').exists()).toBe(true)

      // Change store state
      store.markAsShown()
      await wrapper.vm.$nextTick()

      // Modal should be hidden
      expect(wrapper.find('.welcome-modal').exists()).toBe(false)
    })

    it('should use the same store instance across components', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const wrapper1 = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const wrapper2 = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Both components should use the same store
      const store1 = useWelcomeStore()
      const store2 = useWelcomeStore()
      
      expect(store1).toBe(store2)
    })
  })

  describe('Complete User Flow', () => {
    it('should handle first launch to close flow correctly', async () => {
      // First launch
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      // Modal should show
      expect(store.shouldShow).toBe(true)
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.welcome-modal').exists()).toBe(true)

      // User closes modal
      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('tap')
      await wrapper.vm.$nextTick()

      // Modal should be hidden
      expect(wrapper.find('.welcome-modal').exists()).toBe(false)
      
      // State should be persisted
      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)
      expect(mockWx.setStorageSync).toHaveBeenCalled()
    })

    it('should handle app restart after first launch', () => {
      // Simulate app restart with persisted state
      mockWx.getStorageSync.mockReturnValue(JSON.stringify(true))
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      // Modal should not show
      expect(wrapper.find('.welcome-modal').exists()).toBe(false)
      expect(store.shouldShow).toBe(false)
      expect(store.hasShown).toBe(true)
    })
  })

  describe('UI Elements and Styling', () => {
    it('should have correct CSS classes for modal structure', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.welcome-modal').exists()).toBe(true)
      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
      expect(wrapper.find('.modal-content').exists()).toBe(true)
      expect(wrapper.find('.modal-header').exists()).toBe(true)
      expect(wrapper.find('.modal-body').exists()).toBe(true)
    })

    it('should have correct structure for modal header', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const header = wrapper.find('.modal-header')
      expect(header.find('.modal-title').exists()).toBe(true)
      expect(header.find('.close-button').exists()).toBe(true)
    })

    it('should have correct structure for modal body', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const body = wrapper.find('.modal-body')
      expect(body.find('.greeting-gif').exists()).toBe(true)
      expect(body.find('.greeting-text').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple close attempts gracefully', async () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      const closeButton = wrapper.find('.close-button')
      
      // Click multiple times
      await closeButton.trigger('tap')
      await closeButton.trigger('tap')
      await closeButton.trigger('tap')

      // Should only call markAsShown once per click, but state should remain consistent
      expect(store.hasShown).toBe(true)
      expect(store.shouldShow).toBe(false)
    })

    it('should handle store initialization before component mount', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      // Initialize store before mounting component
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      expect(store.shouldShow).toBe(true)
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.welcome-modal').exists()).toBe(true)
    })

    it('should handle component unmount gracefully', () => {
      mockWx.getStorageSync.mockReturnValue('')
      
      const store = useWelcomeStore()
      store.checkFirstLaunch()
      
      const wrapper = mount(WelcomeModal, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.welcome-modal').exists()).toBe(true)

      // Unmount component
      wrapper.unmount()

      // Store state should remain intact
      expect(store.shouldShow).toBe(true)
    })
  })
})
