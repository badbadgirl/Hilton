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
    listPokemon: vi.fn(),
  },
}))

describe('SearchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useSearchStore()

      expect(store.keyword).toBe('')
      expect(store.allResults).toEqual([])
      expect(store.displayCount).toBe(10)
      expect(store.pageSize).toBe(10)
      expect(store.isLoading).toBe(false)
      expect(store.isLoadingMore).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('search action', () => {
    it('应该在搜索时设置加载状态', async () => {
      const store = useSearchStore()

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ pokemon_v2_pokemon: [] }), 100))
      )

      const searchPromise = store.search('pikachu')
      expect(store.isLoading).toBe(true)

      await searchPromise
      expect(store.isLoading).toBe(false)
    })

    it('应该成功搜索并更新结果', async () => {
      const store = useSearchStore()

      const mockResults: PokemonSpecies[] = [
        {
          id: 25,
          name: 'pikachu',
          pokemon_v2_pokemonabilities: [{ pokemon_v2_ability: { id: 9, name: 'static' } }],
        },
        {
          id: 26,
          name: 'raichu',
          pokemon_v2_pokemonabilities: [{ pokemon_v2_ability: { id: 9, name: 'static' } }],
        },
      ]

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      await store.search('pikachu')

      expect(store.keyword).toBe('pikachu')
      expect(store.allResults).toEqual(mockResults)
      expect(store.displayCount).toBe(store.pageSize)
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
      expect(store.allResults).toEqual([])
      expect(store.isLoading).toBe(false)
    })

    it('应该在关键词为空时调用 listPokemon', async () => {
      const store = useSearchStore()

      vi.mocked(pokeApiClient.listPokemon).mockResolvedValue({
        pokemon_v2_pokemon: [
          { id: 1, name: 'bulbasaur', pokemon_v2_pokemonabilities: [] },
        ],
      })

      await store.search('')

      expect(pokeApiClient.listPokemon).toHaveBeenCalled()
      expect(store.allResults.length).toBe(1)
    })

    it('应该正确处理大量结果', async () => {
      const store = useSearchStore()

      const mockResults: PokemonSpecies[] = Array.from({ length: 45 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))

      vi.mocked(pokeApiClient.searchPokemonSpecies).mockResolvedValue({
        pokemon_v2_pokemon: mockResults,
      })

      await store.search('pokemon')

      expect(store.allResults.length).toBe(45)
      expect(store.hasMore).toBe(true)
    })
  })

  describe('loadMore action', () => {
    it('应该增加 displayCount', () => {
      const store = useSearchStore()
      store.allResults = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))
      store.displayCount = 10

      store.loadMore()

      expect(store.displayCount).toBe(20)
    })

    it('应该在没有更多数据时不加载', () => {
      const store = useSearchStore()
      store.allResults = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))
      store.displayCount = 10

      store.loadMore()

      expect(store.displayCount).toBe(10) // 不变
    })
  })

  describe('clearResults action', () => {
    it('应该清空所有搜索状态', () => {
      const store = useSearchStore()

      store.keyword = 'pikachu'
      store.allResults = [
        { id: 25, name: 'pikachu', pokemon_v2_pokemonabilities: [] },
      ]
      store.displayCount = 20
      store.error = 'Some error'

      store.clearResults()

      expect(store.keyword).toBe('')
      expect(store.allResults).toEqual([])
      expect(store.displayCount).toBe(10)
      expect(store.error).toBe(null)
    })
  })

  describe('displayedResults getter', () => {
    it('应该返回前 displayCount 条结果', () => {
      const store = useSearchStore()

      store.allResults = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))
      store.displayCount = 10

      expect(store.displayedResults.length).toBe(10)
      expect(store.displayedResults[0].id).toBe(1)
      expect(store.displayedResults[9].id).toBe(10)
    })
  })

  describe('hasResults getter', () => {
    it('应该在有结果时返回 true', () => {
      const store = useSearchStore()

      store.allResults = [
        { id: 25, name: 'pikachu', pokemon_v2_pokemonabilities: [] },
      ]

      expect(store.hasResults).toBe(true)
    })

    it('应该在无结果时返回 false', () => {
      const store = useSearchStore()
      expect(store.hasResults).toBe(false)
    })
  })

  describe('isEmpty getter', () => {
    it('应该在搜索后无结果时返回 true', () => {
      const store = useSearchStore()

      store.keyword = 'nonexistent'
      store.allResults = []
      store.isLoading = false

      expect(store.isEmpty).toBe(true)
    })

    it('应该在有结果时返回 false', () => {
      const store = useSearchStore()

      store.keyword = 'pikachu'
      store.allResults = [
        { id: 25, name: 'pikachu', pokemon_v2_pokemonabilities: [] },
      ]
      store.isLoading = false

      expect(store.isEmpty).toBe(false)
    })

    it('应该在加载中时返回 false', () => {
      const store = useSearchStore()

      store.keyword = 'pikachu'
      store.allResults = []
      store.isLoading = true

      expect(store.isEmpty).toBe(false)
    })

    it('应该在未搜索时返回 false', () => {
      const store = useSearchStore()

      store.keyword = ''
      store.allResults = []
      store.isLoading = false

      expect(store.isEmpty).toBe(false)
    })
  })

  describe('hasMore getter', () => {
    it('应该在还有更多数据时返回 true', () => {
      const store = useSearchStore()
      store.allResults = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))
      store.displayCount = 10

      expect(store.hasMore).toBe(true)
    })

    it('应该在没有更多数据时返回 false', () => {
      const store = useSearchStore()
      store.allResults = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        pokemon_v2_pokemonabilities: [],
      }))
      store.displayCount = 10

      expect(store.hasMore).toBe(false)
    })
  })
})
