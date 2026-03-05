/**
 * SearchStore - 搜索状态管理
 * 管理宝可梦物种搜索的状态、结果和分页
 * Validates: Requirements 5.1, 5.3, 5.4, 5.5, 6.6, 8.2, 8.5
 */

import { defineStore } from 'pinia'
import { pokeApiClient } from '../api/graphql'
import type { PokemonSpecies } from '../types/pokemon'

/**
 * 搜索状态接口
 */
interface SearchState {
  keyword: string
  results: PokemonSpecies[]
  currentPage: number
  totalPages: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    keyword: '',
    results: [],
    currentPage: 1,
    totalPages: 0,
    pageSize: 20, // Validates: Requirement 6.6 - 每页显示20条结果
    isLoading: false,
    error: null,
  }),

  getters: {
    /**
     * 获取当前页的分页结果
     * Validates: Requirement 6.6 - 分页显示
     */
    paginatedResults(): PokemonSpecies[] {
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      return this.results.slice(startIndex, endIndex)
    },

    /**
     * 检查是否有搜索结果
     */
    hasResults(): boolean {
      return this.results.length > 0
    },

    /**
     * 检查搜索结果是否为空
     */
    isEmpty(): boolean {
      return !this.isLoading && this.results.length === 0 && this.keyword !== ''
    },
  },

  actions: {
    /**
     * 执行搜索操作
     * Validates: Requirements 5.1, 5.3, 5.4, 5.5
     * @param keyword - 搜索关键词
     */
    async search(keyword: string): Promise<void> {
      console.log('keyword', keyword)
      // 如果关键词为空，清空结果
      if (!keyword || keyword.trim() === '') {
        this.clearResults()
        return
      }

      // 设置加载状态 - Validates: Requirement 5.3
      this.isLoading = true
      this.error = null
      this.keyword = keyword

      try {
        console.log('keyword111', keyword)
        // 调用GraphQL客户端进行搜索 - Validates: Requirement 5.1
        const response = await pokeApiClient.searchPokemonSpecies(
          keyword,
          1000, // 获取所有结果用于客户端分页
          0
        )
        console.log('response11', response)

        // 更新搜索结果 - Validates: Requirement 5.5
        this.results = response.pokemon_v2_pokemon
        
        // 计算总页数
        this.totalPages = Math.ceil(this.results.length / this.pageSize)
        
        // 重置到第一页
        this.currentPage = 1
      } catch (err) {
        // 处理错误
        this.error = err instanceof Error ? err.message : '搜索失败'
        this.results = []
        this.totalPages = 0
      } finally {
        // 隐藏加载指示器 - Validates: Requirement 5.4
        this.isLoading = false
      }
    },

    /**
     * 设置当前页码
     * Validates: Requirement 6.6 - 分页导航
     * @param page - 页码
     */
    setPage(page: number): void {
      if (page < 1 || page > this.totalPages) {
        return
      }
      this.currentPage = page
    },

    /**
     * 清空搜索结果
     */
    clearResults(): void {
      this.keyword = ''
      this.results = []
      this.currentPage = 1
      this.totalPages = 0
      this.error = null
    },
  },
})
