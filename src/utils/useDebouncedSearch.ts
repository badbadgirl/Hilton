import { ref } from 'vue'

/**
 * 防抖搜索组合式函数选项
 * 
 * **Validates: Requirements 4.5, 4.6**
 */
export interface UseDebouncedSearchOptions {
  /** 延迟时间（毫秒），默认300ms */
  delay?: number
  /** 是否立即执行第一次调用 */
  immediate?: boolean
}

/**
 * 防抖搜索组合式函数
 * 
 * 实现搜索输入的防抖处理，延迟执行回调函数，避免频繁触发搜索请求。
 * 
 * @param callback - 搜索回调函数，接收关键词参数
 * @param options - 配置选项
 * @returns 包含防抖搜索函数、取消和立即执行方法的对象
 * 
 * @example
 * ```typescript
 * const { debouncedSearch, cancel, flush } = useDebouncedSearch(
 *   (keyword) => console.log('搜索:', keyword),
 *   { delay: 300 }
 * )
 * 
 * // 使用防抖搜索
 * debouncedSearch('pikachu')
 * 
 * // 取消待执行的搜索
 * cancel()
 * 
 * // 立即执行待执行的搜索
 * flush()
 * ```
 * 
 * **Validates: Requirements 4.5, 4.6**
 */
export function useDebouncedSearch(
  callback: (keyword: string) => void,
  options: UseDebouncedSearchOptions = {}
) {
  const { delay = 300, immediate = false } = options
  
  // 存储定时器ID
  const timerId = ref<number | null>(null)
  // 存储最后一次调用的关键词
  const lastKeyword = ref<string>('')
  // 标记是否是第一次调用
  const isFirstCall = ref(true)

  /**
   * 防抖搜索函数
   * 
   * @param keyword - 搜索关键词
   */
  const debouncedSearch = (keyword: string) => {
    lastKeyword.value = keyword

    // 如果设置了immediate且是第一次调用，立即执行
    if (immediate && isFirstCall.value) {
      isFirstCall.value = false
      callback(keyword)
      return
    }

    isFirstCall.value = false

    // 清除之前的定时器
    if (timerId.value !== null) {
      clearTimeout(timerId.value)
    }

    // 设置新的定时器
    timerId.value = setTimeout(() => {
      callback(keyword)
      timerId.value = null
    }, delay) as unknown as number
  }

  /**
   * 取消待执行的搜索
   */
  const cancel = () => {
    if (timerId.value !== null) {
      clearTimeout(timerId.value)
      timerId.value = null
    }
  }

  /**
   * 立即执行待执行的搜索
   */
  const flush = () => {
    if (timerId.value !== null) {
      clearTimeout(timerId.value)
      timerId.value = null
      callback(lastKeyword.value)
    }
  }

  return {
    debouncedSearch,
    cancel,
    flush
  }
}
