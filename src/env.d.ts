/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// WeChat Mini Program API types
interface WxRequestOptions {
  url: string
  method: string
  header?: Record<string, string>
  data?: any
  timeout?: number
  success: (res: any) => void
  fail: (error: any) => void
}

interface WxNavigateToOptions {
  url: string
  success?: () => void
  fail?: (err: any) => void
}

declare const wx: {
  navigateTo: (options: WxNavigateToOptions) => void
  navigateBack: (options?: { delta?: number }) => void
  setStorageSync: (key: string, value: string) => void
  getStorageSync: (key: string) => string
  removeStorageSync: (key: string) => void
  request: (options: WxRequestOptions) => void
}

declare const uni: any
