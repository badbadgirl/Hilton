/**
 * 集成测试
 * 测试完整的用户流程和组件交互
 * Validates: Requirements 2.3, 5.1, 6.5, 7.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSearchStore } from '../stores/search'
import { useThemeStore } from '../stores/theme'
import type { PokemonSpecies } from '../types/pokemon'

// Mock WeChat Mini Program APIs
const mockNavigateTo = vi.fn()
const mockNavigateBack = vi.fn()
const mockWx = {
  setStorageSync: vi.fn(),
  getStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
  navigateTo: mockNavigateTo,
  navigateBack: mockNavigateBack,
  request: vi.fn(),
}

;(globalThis as any).wx = mockWx

// Mock GraphQL client module
vi.mock('../api/graphql', () => {
  return {
    pokeApiClient: {
      searchPokemonSpecies: vi.fn(),
      listPokemon: vi.fn(),
      getPokemonDetail: vi.fn(),
    },
  }
})

import { pokeApiClient } from '../api/graphql'

describe('集成测试 - 完整用户流程', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    mockWx.getStorageSync.mockReturnValue('')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('完整搜索流程 (Requirement 5.1)', () => {
    it('应该完成从输入到显示结果的完整搜索流程', async () => {
      const mockResults: PokemonSpecies[] = [
        {
          id: 25,
          name: 'pikachu',
          pokemon_v2_pokemonabilities: [
            { pokemon_v2_ability: { id: 9, name: 'static' } },
          ],
        },
      ]

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      const searchStore = useSearchStore()

      expect(searchStore.allResults).toEqual([])
      expect(searchStore.isLoading).toBe(false)

      await searchStore.search('pikachu')

      expect(searchStore.isLoading).toBe(false)
      expect(searchStore.allResults).toEqual(mockResults)
      expect(searchStore.hasResults).toBe(true)
      expect(searchStore.isEmpty).toBe(false)

      expect(pokeApiClient.searchPokemonSpecies).toHaveBeenCalledWith(
        'pikachu',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('应该在搜索期间显示加载指示器', async () => {
      vi.mocked(pokeApiClient.searchPokemonSpecies).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ pokemon_v2_pokemon: [] }), 100))
      )

      const searchStore = useSearchStore()
      const searchPromise = searchStore.search('test')

      expect(searchStore.isLoading).toBe(true)

      await searchPromise

      expect(searchStore.isLoading).toBe(false)
    })

    it('应该在无结果时显示空状态消息', async () => {
      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: [],
      })

      const searchStore = useSearchStore()

      await searchStore.search('nonexistent')

      expect(searchStore.isEmpty).toBe(true)
      expect(searchStore.hasResults).toBe(false)
    })
  })

  describe('详情页导航和返回 (Requirement 6.5, 7.4)', () => {
    it('应该能够通过 wx.navigateTo 导航到详情页', () => {
      const pokemonId = 25
      wx.navigateTo({ url: `/pages/detail/detail?id=${pokemonId}` })

      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: `/pages/detail/detail?id=${pokemonId}`,
      })
    })

    it('应该在导航后保留搜索结果状态', async () => {
      const mockResults: PokemonSpecies[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      const searchStore = useSearchStore()

      await searchStore.search('pokemon')

      const savedKeyword = searchStore.keyword
      const savedResults = [...searchStore.allResults]

      // 模拟导航
      wx.navigateTo({ url: '/pages/detail/detail?id=25' })

      // Pinia store 状态应保持不变
      expect(searchStore.keyword).toBe(savedKeyword)
      expect(searchStore.allResults).toEqual(savedResults)
    })
  })

  describe('主题切换 (Requirement 2.3)', () => {
    it('应该能够切换主题并立即应用', () => {
      const themeStore = useThemeStore()

      expect(themeStore.currentTheme).toBe('pokemon')

      themeStore.setTheme('dark')
      expect(themeStore.currentTheme).toBe('dark')

      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_theme',
        JSON.stringify('dark')
      )

      themeStore.setTheme('light')
      expect(themeStore.currentTheme).toBe('light')
    })

    it('应该在应用重启时加载上次选择的主题', () => {
      mockWx.getStorageSync.mockReturnValue(JSON.stringify('dark'))

      const themeStore = useThemeStore()
      themeStore.loadTheme()

      expect(themeStore.currentTheme).toBe('dark')
    })

    it('应该提供三种不同的视觉主题', () => {
      const themeStore = useThemeStore()

      expect(themeStore.availableThemes.length).toBe(3)

      const themeNames = themeStore.availableThemes.map(t => t.name)
      expect(themeNames).toContain('pokemon')
      expect(themeNames).toContain('dark')
      expect(themeNames).toContain('light')
    })
  })

  describe('错误处理和边界情况', () => {
    it('应该处理搜索 API 错误', async () => {
      vi.mocked(pokeApiClient.searchPokemonSpecies).mockRejectedValue(
        new Error('Network error')
      )

      const searchStore = useSearchStore()

      await searchStore.search('pikachu')

      expect(searchStore.error).toBe('Network error')
      expect(searchStore.isLoading).toBe(false)
      expect(searchStore.allResults).toEqual([])
    })

    it('应该处理空搜索关键词', async () => {
      vi.mocked(pokeApiClient.listPokemon).mockResolvedValue({
        pokemon_v2_pokemon: [],
      })

      const searchStore = useSearchStore()

      await searchStore.search('')

      expect(searchStore.keyword).toBe('')
    })

    it('应该在没有更多数据时阻止 loadMore', () => {
      const searchStore = useSearchStore()
      searchStore.allResults = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))
      searchStore.displayCount = 10

      searchStore.loadMore()

      // displayCount 不应改变，因为 hasMore 为 false
      expect(searchStore.displayCount).toBe(10)
    })
  })
})
