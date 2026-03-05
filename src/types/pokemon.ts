/**
 * Pokemon related type definitions
 * Validates: Requirements 3.3, 8.2, 8.3
 */

/**
 * Pokemon ability interface
 */
export interface PokemonAbility {
  pokemon_v2_ability: {
    id: number
    name: string
  }
}

/**
 * Pokemon type interface
 */
export interface PokemonType {
  pokemon_v2_type: {
    name: string
  }
}

/**
 * Pokemon instance interface
 */
export interface Pokemon {
  id: number
  name: string
  height?: number
  weight?: number
  pokemon_v2_pokemonabilities: PokemonAbility[]
  pokemon_v2_pokemontypes?: PokemonType[]
}

/**
 * Pokemon species interface
 */
export interface PokemonSpecies {
  id: number
  name: string
  pokemon_v2_pokemonabilities: PokemonAbility[]
}

/**
 * Search result interface
 */
export interface SearchResult {
  species: PokemonSpecies[]
  total: number
  page: number
  pageSize: number
}
