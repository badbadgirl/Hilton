import { ref, onMounted } from 'vue'
import type { Pokemon } from '../types'
import { pokeApiClient } from '../api/graphql'
import { Logger } from './logger'

export function usePokemonDetail(pokemonId: number) {
  const pokemon = ref<Pokemon | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPokemonDetail = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await pokeApiClient.getPokemonDetail(pokemonId)
      pokemon.value = result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取宝可梦详情失败'
      Logger.error('获取宝可梦详情失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchPokemonDetail()
  })

  return {
    pokemon,
    isLoading,
    error,
    refetch: fetchPokemonDetail
  }
}
