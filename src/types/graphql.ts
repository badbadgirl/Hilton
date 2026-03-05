/**
 * GraphQL related type definitions
 * Validates: Requirements 3.3, 8.2
 */

import type { PokemonSpecies, Pokemon } from './pokemon'

/**
 * Generic GraphQL response wrapper
 */
export interface GraphQLResponse<T> {
  data: T
  errors?: GraphQLError[]
}

/**
 * GraphQL error interface
 */
export interface GraphQLError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: string[]
  extensions?: Record<string, any>
}

/**
 * Pokemon species query response
 */
export interface PokemonSpeciesQueryResponse {
  pokemon_v2_pokemon: PokemonSpecies[]
}

/**
 * Pokemon detail query response
 */
export interface PokemonDetailQueryResponse {
  pokemon_v2_pokemon_by_pk: Pokemon | null
}

/**
 * GraphQL query variables for searching pokemon species
 */
export interface SearchPokemonSpeciesVariables {
  keyword: string
  limit: number
  offset: number
}

/**
 * GraphQL query variables for getting pokemon detail
 */
export interface GetPokemonDetailVariables {
  pokemonId: number
}
