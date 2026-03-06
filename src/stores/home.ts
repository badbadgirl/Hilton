import { defineStore } from 'pinia'
import { pokeApiClient } from '../api/graphql'
import type { PokemonSpecies } from '../types/pokemon'

interface HomeState {
  allResults: PokemonSpecies[]
  displayCount: number
  pageSize: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
}

export const useHomeStore = defineStore('home', {
  state: (): HomeState => ({
    allResults: [],
    displayCount: 10,
    pageSize: 10,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  }),

  getters: {
    displayedResults(): PokemonSpecies[] {
      return this.allResults.slice(0, this.displayCount)
    },
    hasResults(): boolean {
      return this.allResults.length > 0
    },
    hasMore(): boolean {
      return this.displayCount < this.allResults.length
    },
  },

  actions: {
    async fetchList(): Promise<void> {
      if (this.allResults.length > 0) return // 已加载过就不重复请求
      this.isLoading = true
      this.error = null
      try {
        const response = await pokeApiClient.listPokemon(1000, 0)
        this.allResults = response.pokemon_v2_pokemon
        this.displayCount = this.pageSize
      } catch (err) {
        this.error = err instanceof Error ? err.message : '加载失败'
        this.allResults = []
      } finally {
        this.isLoading = false
      }
    },

    loadMore(): void {
      if (!this.hasMore || this.isLoadingMore) return
      this.isLoadingMore = true
      this.displayCount += this.pageSize
      this.isLoadingMore = false
    },
  },
})
