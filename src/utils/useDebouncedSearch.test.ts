import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebouncedSearch } from './useDebouncedSearch'

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should debounce search calls with default 300ms delay', () => {
    const callback = vi.fn()
    const { debouncedSearch } = useDebouncedSearch(callback)

    // 快速连续调用
    debouncedSearch('pika')
    debouncedSearch('pikach')
    debouncedSearch('pikachu')

    // 回调不应该被立即调用
    expect(callback).not.toHaveBeenCalled()

    // 快进时间到300ms
    vi.advanceTimersByTime(300)

    // 回调应该只被调用一次，使用最后的关键词
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('pikachu')
  })

  it('should use custom delay when provided', () => {
    const callback = vi.fn()
    const { debouncedSearch } = useDebouncedSearch(callback, { delay: 500 })

    debouncedSearch('test')

    // 300ms后不应该被调用
    vi.advanceTimersByTime(300)
    expect(callback).not.toHaveBeenCalled()

    // 再快进200ms（总共500ms）后应该被调用
    vi.advanceTimersByTime(200)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('test')
  })

  it('should call immediately on first call when immediate is true', () => {
    const callback = vi.fn()
    const { debouncedSearch } = useDebouncedSearch(callback, { immediate: true })

    debouncedSearch('first')

    // 第一次调用应该立即执行
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')

    // 后续调用应该被防抖
    debouncedSearch('second')
    expect(callback).toHaveBeenCalledTimes(1) // 仍然是1次

    vi.advanceTimersByTime(300)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith('second')
  })

  it('should cancel pending search', () => {
    const callback = vi.fn()
    const { debouncedSearch, cancel } = useDebouncedSearch(callback)

    debouncedSearch('test')
    cancel()

    // 快进时间
    vi.advanceTimersByTime(300)

    // 回调不应该被调用
    expect(callback).not.toHaveBeenCalled()
  })

  it('should flush pending search immediately', () => {
    const callback = vi.fn()
    const { debouncedSearch, flush } = useDebouncedSearch(callback)

    debouncedSearch('test')

    // 立即执行
    flush()

    // 回调应该被立即调用
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('test')

    // 快进时间不应该再次调用
    vi.advanceTimersByTime(300)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple debounced calls correctly', () => {
    const callback = vi.fn()
    const { debouncedSearch } = useDebouncedSearch(callback)

    // 第一组调用
    debouncedSearch('first')
    vi.advanceTimersByTime(300)
    expect(callback).toHaveBeenCalledWith('first')

    // 第二组调用
    debouncedSearch('second')
    vi.advanceTimersByTime(300)
    expect(callback).toHaveBeenCalledWith('second')

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should reset timer on each new call', () => {
    const callback = vi.fn()
    const { debouncedSearch } = useDebouncedSearch(callback)

    debouncedSearch('first')
    vi.advanceTimersByTime(200) // 快进200ms

    debouncedSearch('second')
    vi.advanceTimersByTime(200) // 再快进200ms（总共400ms）

    // 回调不应该被调用，因为定时器被重置了
    expect(callback).not.toHaveBeenCalled()

    // 再快进100ms（从第二次调用开始总共300ms）
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('second')
  })

  it('should do nothing when cancel is called without pending search', () => {
    const callback = vi.fn()
    const { cancel } = useDebouncedSearch(callback)

    // 不应该抛出错误
    expect(() => cancel()).not.toThrow()
  })

  it('should do nothing when flush is called without pending search', () => {
    const callback = vi.fn()
    const { flush } = useDebouncedSearch(callback)

    // 不应该抛出错误或调用回调
    expect(() => flush()).not.toThrow()
    expect(callback).not.toHaveBeenCalled()
  })
})
