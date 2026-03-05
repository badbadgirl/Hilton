/**
 * 集成测试
 * 测试完整的用户流程和组件交互
 * Validates: Requirements 2.3, 5.1, 6.5, 7.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SearchPage from '../pages/search/search.vue'
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
}

// Assign to global
;(globalThis as any).wx = mockWx

// Mock GraphQL client module
vi.mock('../api/graphql', () => {
  return {
    pokeApiClient: {
      searchPokemonSpecies: vi.fn(),
      getPokemonDetail: vi.fn(),
    },
  }
})

// Import after mocking
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
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [
            {
              id: 25,
              name: 'pikachu',
              pokemon_v2_pokemonabilities: [
                {
                  pokemon_v2_ability: {
                    id: 9,
                    name: 'static',
                  },
                },
              ],
            },
          ],
        },
      ]

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()

      expect(searchStore.results).toEqual([])
      expect(searchStore.isLoading).toBe(false)

      searchStore.keyword = 'pikachu'
      await wrapper.vm.$nextTick()

      await searchStore.search('pikachu')
      await flushPromises()

      expect(searchStore.isLoading).toBe(false)
      expect(searchStore.results).toEqual(mockResults)
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

      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()
      const searchPromise = searchStore.search('test')

      expect(searchStore.isLoading).toBe(true)

      await searchPromise
      await flushPromises()

      expect(searchStore.isLoading).toBe(false)
    })

    it('应该在无结果时显示空状态消息', async () => {
      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: [],
      })

      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()

      await searchStore.search('nonexistent')
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(searchStore.isEmpty).toBe(true)
      expect(searchStore.hasResults).toBe(false)
    })
  })

  describe('详情页导航和返回 (Requirement 6.5, 7.4)', () => {
    it('应该能够从搜索结果导航到详情页', async () => {
      const mockResults: PokemonSpecies[] = [
        {
          id: 25,
          name: 'pikachu',
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [
            {
              id: 25,
              name: 'pikachu',
              pokemon_v2_pokemonabilities: [],
            },
          ],
        },
      ]

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()

      await searchStore.search('pikachu')
      await flushPromises()

      const pokemonId = 25
      await wrapper.vm.navigateToDetail(pokemonId)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: `/pages/detail/detail?id=${pokemonId}`,
      })
    })

    it('应该在返回搜索页时保留搜索结果和分页状态', async () => {
      const mockResults: PokemonSpecies[] = Array.from({ length: 45 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        capture_rate: 100,
        pokemon_v2_pokemoncolor: { name: 'red' },
        pokemon_v2_pokemons: [],
      }))

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()

      await searchStore.search('pokemon')
      await flushPromises()

      searchStore.setPage(2)
      await wrapper.vm.$nextTick()

      const savedKeyword = searchStore.keyword
      const savedResults = [...searchStore.results]
      const savedPage = searchStore.currentPage

      await wrapper.vm.navigateToDetail(25)

      expect(searchStore.keyword).toBe(savedKeyword)
      expect(searchStore.results).toEqual(savedResults)
      expect(searchStore.currentPage).toBe(savedPage)
    })
  })

  describe('主题切换 (Requirement 2.3)', () => {
    it('应该能够切换主题并立即应用到整个应用', async () => {
      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const themeStore = useThemeStore()

      expect(themeStore.currentTheme).toBe('pokemon')

      themeStore.setTheme('dark')
      await wrapper.vm.$nextTick()

      expect(themeStore.currentTheme).toBe('dark')

      expect(mockWx.setStorageSync).toHaveBeenCalledWith(
        'pokemon_app_theme',
        JSON.stringify('dark')
      )

      themeStore.setTheme('light')
      await wrapper.vm.$nextTick()

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

      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()

      await searchStore.search('pikachu')
      await flushPromises()

      expect(searchStore.error).toBe('Network error')
      expect(searchStore.isLoading).toBe(false)
      expect(searchStore.results).toEqual([])
    })

    it('应该处理空搜索关键词', async () => {
      const wrapper = mount(SearchPage, {
        global: {
          plugins: [pinia],
          stubs: {
            WelcomeModal: true,
          },
        },
      })

      const searchStore = useSearchStore()

      await searchStore.search('')
      await flushPromises()

      expect(searchStore.results).toEqual([])
      expect(searchStore.keyword).toBe('')
    })

    it('应该处理无效的页码切换', () => {
      const searchStore = useSearchStore()
      searchStore.totalPages = 5
      searchStore.currentPage = 2

      searchStore.setPage(0)
      expect(searchStore.currentPage).toBe(2)

      searchStore.setPage(10)
      expect(searchStore.currentPage).toBe(2)

      searchStore.setPage(-1)
      expect(searchStore.currentPage).toBe(2)
    })
  })
})
