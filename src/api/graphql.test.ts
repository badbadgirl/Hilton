/**
 * Unit tests for GraphQL Client (WeChat Mini Program)
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GraphQLClient, pokeApiClient } from './graphql'

// Mock WeChat Mini Program API
const mockWxRequest = vi.fn()
;(globalThis as any).wx = {
  request: mockWxRequest,
}

describe('GraphQLClient', () => {
  let client: GraphQLClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new GraphQLClient('https://beta.pokeapi.co/graphql/v1beta')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Constructor', () => {
    it('should create client with correct base URL', () => {
      const testClient = new GraphQLClient('https://test.api.com')
      expect(testClient).toBeInstanceOf(GraphQLClient)
    })
  })

  describe('searchPokemonSpecies', () => {
    it('should search pokemon species successfully', async () => {
      const mockResponse = {
        data: {
          pokemon_v2_pokemon: [
            {
              id: 25,
              name: 'pikachu',
              capture_rate: 190,
              pokemon_v2_pokemoncolor: { name: 'yellow' },
              pokemon_v2_pokemons: [
                {
                  id: 25,
                  name: 'pikachu',
                },
              ],
              pokemon_v2_pokemonabilities: [
                {
                  pokemon_v2_ability: {
                    name: 'static',
                  },
                },
              ],
            },
          ],
        },
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      const result = await client.searchPokemonSpecies('pikachu', 20, 0)

      expect(mockWxRequest).toHaveBeenCalledWith({
        url: 'https://beta.pokeapi.co/graphql/v1beta',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query: expect.stringContaining('pokemon_v2_pokemon'),
          variables: {
            keyword: '%pikachu%',
            limit: 20,
            offset: 0,
          },
        },
        timeout: 10000,
        success: expect.any(Function),
        fail: expect.any(Function),
      })

      expect(result.pokemon_v2_pokemon).toHaveLength(1)
      expect(result.pokemon_v2_pokemon[0].name).toBe('pikachu')
    })

    it('should use default limit and offset', async () => {
      const mockResponse = {
        data: {
          pokemon_v2_pokemon: [],
        },
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      await client.searchPokemonSpecies('test')

      expect(mockWxRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            query: expect.any(String),
            variables: {
              keyword: '%test%',
              limit: 20,
              offset: 0,
            },
          },
        })
      )
    })

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        data: null,
        errors: [
          { message: 'Field not found' },
          { message: 'Invalid query' },
        ],
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      await expect(client.searchPokemonSpecies('test')).rejects.toThrow(
        'GraphQL Error: Field not found, Invalid query'
      )
    })

    it('should handle network errors with errMsg', async () => {
      mockWxRequest.mockImplementation((options: any) => {
        options.fail({ errMsg: 'request:fail timeout' })
      })

      await expect(client.searchPokemonSpecies('test')).rejects.toThrow(
        'Network Error: request:fail timeout'
      )
    })

    it('should handle network errors without errMsg', async () => {
      mockWxRequest.mockImplementation((options: any) => {
        options.fail({})
      })

      await expect(client.searchPokemonSpecies('test')).rejects.toThrow(
        'Network Error: Request failed'
      )
    })

    it('should add wildcard to keyword for fuzzy search', async () => {
      const mockResponse = {
        data: {
          pokemon_v2_pokemon: [],
        },
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      await client.searchPokemonSpecies('pika')

      expect(mockWxRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            variables: {
              keyword: '%pika%',
              limit: 20,
              offset: 0,
            },
          }),
        })
      )
    })

    it('should handle custom limit and offset', async () => {
      const mockResponse = {
        data: {
          pokemon_v2_pokemon: [],
        },
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      await client.searchPokemonSpecies('test', 50, 100)

      expect(mockWxRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            variables: {
              keyword: '%test%',
              limit: 50,
              offset: 100,
            },
          }),
        })
      )
    })
  })

  describe('getPokemonDetail', () => {
    it('should get pokemon detail successfully', async () => {
      const mockResponse = {
        data: {
          pokemon_v2_pokemon_by_pk: {
            id: 25,
            name: 'pikachu',
            height: 4,
            weight: 60,
            pokemon_v2_pokemonabilities: [
              {
                pokemon_v2_ability: {
                  id: 9,
                  name: 'static',
                },
              },
            ],
            pokemon_v2_pokemontypes: [
              {
                pokemon_v2_type: {
                  name: 'electric',
                },
              },
            ],
          },
        },
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      const result = await client.getPokemonDetail(25)

      expect(mockWxRequest).toHaveBeenCalledWith({
        url: 'https://beta.pokeapi.co/graphql/v1beta',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query: expect.stringContaining('pokemon_v2_pokemon_by_pk'),
          variables: {
            pokemonId: 25,
          },
        },
        timeout: 10000,
        success: expect.any(Function),
        fail: expect.any(Function),
      })

      expect(result.name).toBe('pikachu')
      expect(result.height).toBe(4)
    })

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        data: null,
        errors: [{ message: 'Pokemon not found' }],
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      await expect(client.getPokemonDetail(9999)).rejects.toThrow(
        'GraphQL Error: Pokemon not found'
      )
    })

    it('should handle network errors', async () => {
      mockWxRequest.mockImplementation((options: any) => {
        options.fail({ errMsg: 'request:fail' })
      })

      await expect(client.getPokemonDetail(25)).rejects.toThrow(
        'Network Error: request:fail'
      )
    })
  })

  describe('pokeApiClient', () => {
    it('should export a default client instance', () => {
      expect(pokeApiClient).toBeInstanceOf(GraphQLClient)
    })
  })

  describe('Error handling edge cases', () => {
    it('should handle empty error array', async () => {
      const mockResponse = {
        data: {
          pokemon_v2_pokemon: [],
        },
        errors: [],
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      const result = await client.searchPokemonSpecies('test')
      expect(result.pokemon_v2_pokemon).toEqual([])
    })

    it('should handle multiple GraphQL errors', async () => {
      const mockResponse = {
        data: null,
        errors: [
          { message: 'Error 1' },
          { message: 'Error 2' },
          { message: 'Error 3' },
        ],
      }

      mockWxRequest.mockImplementation((options: any) => {
        options.success({ data: mockResponse })
      })

      await expect(client.searchPokemonSpecies('test')).rejects.toThrow(
        'GraphQL Error: Error 1, Error 2, Error 3'
      )
    })
  })
})
