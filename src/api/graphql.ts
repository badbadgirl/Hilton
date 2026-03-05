/**
 * GraphQL Client for PokeAPI (WeChat Mini Program)
 * Validates: Requirements 3.1, 3.4, 3.5
 */

import type { PokemonSpecies, Pokemon } from '../types/pokemon'

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
 */
export class GraphQLClient {
  private baseURL: string

  /**
   * Initialize GraphQL client with base URL
   * @param baseURL - The GraphQL endpoint URL
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Make a GraphQL request using wx.request
   * @param query - GraphQL query string
   * @param variables - Query variables
   * @returns Promise with response data
   */
  private async request<T>(query: string, variables: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query,
          variables,
        },
        timeout: 10000,
        success: (res: { data: GraphQLResponse<T> }) => {
          const response = res.data as GraphQLResponse<T>

          // Check for GraphQL errors
          if (response.errors && response.errors.length > 0) {
            const errorMessages = response.errors.map((err) => err.message).join(', ')
            reject(new Error(`GraphQL Error: ${errorMessages}`))
            return
          }

          resolve(response.data)
        },
        fail: (error: { errMsg: any }) => {
          if (error.errMsg) {
            reject(new Error(`Network Error: ${error.errMsg}`))
          } else {
            reject(new Error('Network Error: Request failed'))
          }
        },
      })
    })
  }

  /**
   * Search for Pokemon species by name
   * Validates: Requirements 3.2, 3.3, 5.2
   * @param keyword - Search keyword for fuzzy matching
   * @param limit - Maximum number of results to return
   * @param offset - Number of results to skip for pagination
   * @returns Promise with search results
   */
  async searchPokemonSpecies(
    keyword: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResponse> {
    const query = `query pokemon_v2_pokemon($keyword: String!, $limit: Int!, $offset: Int!) {pokemon_v2_pokemon(
          where: { name: { _ilike: $keyword } }
          limit: $limit
          offset: $offset
        ){
          id
          name
          pokemon_v2_pokemonabilities {
            pokemon_v2_ability {
              name
            }
          }
        }
      }
    `
    // capture_rate
    //   pokemon_v2_pokemoncolor {
    //     name
    //   }
    //   pokemon_v2_pokemons {
    //     id
    //     name
    //   }
    //   pokemon_v2_pokemonabilities {
    //     pokemon_v2_ability {
    //       name
    //     }
    //   }
    const variables = {
      keyword: `%${keyword}%`,
      limit,
      offset,
    }

    return this.request<SearchResponse>(query, variables)
  }

  /**
   * Get Pokemon detail by ID
   * Validates: Requirements 3.2, 3.3, 7.2
   * @param pokemonId - Pokemon ID
   * @returns Promise with Pokemon detail
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

    const variables = {
      pokemonId,
    }

    const response = await this.request<DetailResponse>(query, variables)
    return response.pokemon_v2_pokemon_by_pk
  }
}

/**
 * Default GraphQL client instance for PokeAPI
 */
export const pokeApiClient = new GraphQLClient(
  'https://beta.pokeapi.co/graphql/v1beta'
)

/**
 * Alias for pokeApiClient for backward compatibility
 */
export const graphqlClient = pokeApiClient
