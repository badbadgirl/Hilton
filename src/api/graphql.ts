/**
 * GraphQL Client for PokeAPI (WeChat Mini Program)
 * Validates: Requirements 3.1, 3.4, 3.5
 */

import type { PokemonSpecies, Pokemon } from '../types/pokemon'
import { config } from '../config'
import { Logger } from '../utils/logger'

/**
 * GraphQL Response wrapper
 */
interface GraphQLResponse<T> {
  data: T
  errors?: Array<{ message: string }>
}

/**
 * Search response from GraphQL
 */
interface SearchResponse {
  pokemon_v2_pokemon: PokemonSpecies[]
}

/**
 * Detail response from GraphQL
 */
interface DetailResponse {
  pokemon_v2_pokemon_by_pk: {
    id: number
    name: string
    height: number
    weight: number
    pokemon_v2_pokemonabilities: Array<{
      pokemon_v2_ability: {
        id: number
        name: string
      }
    }>
    pokemon_v2_pokemontypes: Array<{
      pokemon_v2_type: {
        name: string
      }
    }>
  }
}


/**
 * GraphQL Client class for making queries to PokeAPI
 * Uses WeChat Mini Program's wx.request API
 * 支持重试机制和输入验证
 */
export class GraphQLClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * 发送 GraphQL 请求，支持自动重试
   */
  private async request<T>(
    query: string,
    variables: Record<string, any>,
    retries: number = config.maxRetries
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const attemptRequest = (attempt: number) => {
        wx.request({
          url: this.baseURL,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
          },
          data: { query, variables },
          timeout: config.requestTimeout,
          success: (res: { data: GraphQLResponse<T> }) => {
            const response = res.data as GraphQLResponse<T>
            if (response.errors && response.errors.length > 0) {
              const errorMessages = response.errors.map((err) => err.message).join(', ')
              reject(new Error(`GraphQL Error: ${errorMessages}`))
              return
            }
            resolve(response.data)
          },
          fail: (error: { errMsg: any }) => {
            if (attempt < retries) {
              Logger.warn(`请求失败，正在重试 (${attempt + 1}/${retries})...`)
              setTimeout(() => attemptRequest(attempt + 1), 1000 * attempt)
            } else {
              reject(new Error(`Network Error: ${error.errMsg || 'Request failed'}`))
            }
          },
        })
      }
      attemptRequest(1)
    })
  }

  /**
   * 获取宝可梦列表
   */
  async listPokemon(limit: number = 5, offset: number = 0): Promise<SearchResponse> {
    const query = `query pokemon_v2_pokemon($limit: Int!, $offset: Int!) {
      pokemon_v2_pokemon(limit: $limit, offset: $offset, order_by: {id: asc}) {
        id
        name
        pokemon_v2_pokemonabilities {
          pokemon_v2_ability {
            name
          }
        }
      }
    }`
    return this.request<SearchResponse>(query, {
      limit: Math.min(Math.max(limit, 1), 1000),
      offset: Math.max(offset, 0),
    })
  }

  /**
   * 按名称搜索宝可梦
   * 包含输入验证和清理
   */
  async searchPokemonSpecies(
    keyword: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResponse> {
    // 输入验证
    if (!keyword || typeof keyword !== 'string') {
      throw new Error('搜索关键词不能为空')
    }

    // 清理输入：去空格、限制长度20、移除危险字符
    const sanitizedKeyword = keyword
      .trim()
      .substring(0, 20)
      .replace(/[<>'"%;()&+]/g, '')

    if (sanitizedKeyword.length === 0) {
      throw new Error('搜索关键词格式不正确')
    }

    const query = `query pokemon_v2_pokemon($keyword: String!, $limit: Int!, $offset: Int!) {
      pokemon_v2_pokemon(
        where: { name: { _ilike: $keyword } }
        limit: $limit
        offset: $offset
      ) {
        id
        name
        pokemon_v2_pokemonabilities {
          pokemon_v2_ability {
            name
          }
        }
      }
    }`

    const variables = {
      keyword: `%${sanitizedKeyword}%`,
      limit: Math.min(Math.max(limit, 1), 100),
      offset: Math.max(offset, 0),
    }

    return this.request<SearchResponse>(query, variables)
  }

  /**
   * 根据 ID 获取宝可梦详情
   */
  async getPokemonDetail(pokemonId: number): Promise<Pokemon> {
    const query = `
      query GetPokemonDetail($pokemonId: Int!) {
        pokemon_v2_pokemon_by_pk(id: $pokemonId) {
          id
          name
          height
          weight
          pokemon_v2_pokemonabilities {
            pokemon_v2_ability {
              id
              name
            }
          }
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
        }
      }
    `
    const response = await this.request<DetailResponse>(query, { pokemonId })
    return response.pokemon_v2_pokemon_by_pk
  }
}

/**
 * 默认 GraphQL 客户端实例
 */
export const pokeApiClient = new GraphQLClient(config.apiBaseUrl)

/**
 * 向后兼容别名
 */
export const graphqlClient = pokeApiClient
