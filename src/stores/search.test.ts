/**
 * SearchStore 单元测试
 * 测试搜索状态管理的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from './search'
import { pokeApiClient } from '../api/graphql'
import type { PokemonSpecies } from '../types/pokemon'

// Mock GraphQL client
vi.mock('../api/graphql', () => ({
  pokeApiClient: {
    searchPokemonSpecies: vi.fn(),
  },
}))

describe('SearchStore', () => {
  beforeEach(() => {
    // 为每个测试创建新的 Pinia 实例
    setActivePinia(createPinia())
    // 清除所有 mock
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useSearchStore()

      expect(store.keyword).toBe('')
      expect(store.results).toEqual([])
      expect(store.currentPage).toBe(1)
      expect(store.totalPages).toBe(0)
      expect(store.pageSize).toBe(20)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('search action', () => {
    it('应该在搜索时设置加载状态', async () => {
      const store = useSearchStore()
      
      // Mock API 响应
      vi.mocked(pokeApiClient.searchPokemonSpecies).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ pokemon_v2_pokemon: [] }), 100))
      )

      const searchPromise = store.search('pikachu')
      
      // 搜索期间应该显示加载状态
      expect(store.isLoading).toBe(true)
      
      await searchPromise
      
      // 搜索完成后应该隐藏加载状态
      expect(store.isLoading).toBe(false)
    })

    it('应该成功搜索并更新结果', async () => {
      const store = useSearchStore()
      
      const mockResults: PokemonSpecies[] = [
        {
          id: 25,
          name: 'pikachu',
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [],
        },
        {
          id: 26,
          name: 'raichu',
          capture_rate: 75,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [],
        },
      ]

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      await store.search('pikachu')

      expect(store.keyword).toBe('pikachu')
      expect(store.results).toEqual(mockResults)
      expect(store.totalPages).toBe(1) // 2 results / 20 per page = 1 page
      expect(store.currentPage).toBe(1)
      expect(store.error).toBe(null)
    })

    it('应该处理搜索错误', async () => {
      const store = useSearchStore()
      
      const errorMessage = 'Network error'
      vi.mocked(pokeApiClient.searchPokemonSpecies).mockRejectedValue(
        new Error(errorMessage)
      )

      await store.search('pikachu')

      expect(store.error).toBe(errorMessage)
      expect(store.results).toEqual([])
      expect(store.totalPages).toBe(0)
      expect(store.isLoading).toBe(false)
    })

    it('应该在关键词为空时清空结果', async () => {
      const store = useSearchStore()
      
      // 先设置一些结果
      store.results = [
        {
          id: 25,
          name: 'pikachu',
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [],
        },
      ]
      store.keyword = 'pikachu'

      await store.search('')

      expect(store.keyword).toBe('')
      expect(store.results).toEqual([])
      expect(store.totalPages).toBe(0)
    })

    it('应该正确计算多页结果的总页数', async () => {
      const store = useSearchStore()
      
      // 创建 45 个结果（应该分成 3 页，每页 20 个）
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

      await store.search('pokemon')

      expect(store.totalPages).toBe(3) // 45 / 20 = 2.25, rounded up to 3
    })
  })

  describe('setPage action', () => {
    it('应该更新当前页码', () => {
      const store = useSearchStore()
      store.totalPages = 5

      store.setPage(3)

      expect(store.currentPage).toBe(3)
    })

    it('应该拒绝无效的页码（小于1）', () => {
      const store = useSearchStore()
      store.currentPage = 2
      store.totalPages = 5

      store.setPage(0)

      expect(store.currentPage).toBe(2) // 保持不变
    })

    it('应该拒绝无效的页码（大于总页数）', () => {
      const store = useSearchStore()
      store.currentPage = 2
      store.totalPages = 5

      store.setPage(6)

      expect(store.currentPage).toBe(2) // 保持不变
    })
  })

  describe('clearResults action', () => {
    it('应该清空所有搜索状态', () => {
      const store = useSearchStore()
      
      // 设置一些状态
      store.keyword = 'pikachu'
      store.results = [
        {
          id: 25,
          name: 'pikachu',
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [],
        },
      ]
      store.currentPage = 2
      store.totalPages = 3
      store.error = 'Some error'

      store.clearResults()

      expect(store.keyword).toBe('')
      expect(store.results).toEqual([])
      expect(store.currentPage).toBe(1)
      expect(store.totalPages).toBe(0)
      expect(store.error).toBe(null)
    })
  })

  describe('paginatedResults getter', () => {
    it('应该返回第一页的结果', () => {
      const store = useSearchStore()
      
      // 创建 25 个结果
      store.results = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        capture_rate: 100,
        pokemon_v2_pokemoncolor: { name: 'red' },
        pokemon_v2_pokemons: [],
      }))
      store.currentPage = 1
      store.pageSize = 20

      const paginated = store.paginatedResults

      expect(paginated.length).toBe(20)
      expect(paginated[0].id).toBe(1)
      expect(paginated[19].id).toBe(20)
    })

    it('应该返回第二页的结果', () => {
      const store = useSearchStore()
      
      // 创建 25 个结果
      store.results = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        capture_rate: 100,
        pokemon_v2_pokemoncolor: { name: 'red' },
        pokemon_v2_pokemons: [],
      }))
      store.currentPage = 2
      store.pageSize = 20

      const paginated = store.paginatedResults

      expect(paginated.length).toBe(5)
      expect(paginated[0].id).toBe(21)
      expect(paginated[4].id).toBe(25)
    })
  })

  describe('hasResults getter', () => {
    it('应该在有结果时返回 true', () => {
      const store = useSearchStore()
      
      store.results = [
        {
          id: 25,
          name: 'pikachu',
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [],
        },
      ]

      expect(store.hasResults).toBe(true)
    })

    it('应该在无结果时返回 false', () => {
      const store = useSearchStore()
      
      store.results = []

      expect(store.hasResults).toBe(false)
    })
  })

  describe('isEmpty getter', () => {
    it('应该在搜索后无结果时返回 true', () => {
      const store = useSearchStore()
      
      store.keyword = 'nonexistent'
      store.results = []
      store.isLoading = false

      expect(store.isEmpty).toBe(true)
    })

    it('应该在有结果时返回 false', () => {
      const store = useSearchStore()
      
      store.keyword = 'pikachu'
      store.results = [
        {
          id: 25,
          name: 'pikachu',
          capture_rate: 190,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemons: [],
        },
      ]
      store.isLoading = false

      expect(store.isEmpty).toBe(false)
    })

    it('应该在加载中时返回 false', () => {
      const store = useSearchStore()
      
      store.keyword = 'pikachu'
      store.results = []
      store.isLoading = true

      expect(store.isEmpty).toBe(false)
    })

    it('应该在未搜索时返回 false', () => {
      const store = useSearchStore()
      
      store.keyword = ''
      store.results = []
      store.isLoading = false

      expect(store.isEmpty).toBe(false)
    })
  })
})
