/**
 * 应用配置
 * 集中管理 API 端点、超时等配置项
 */

interface AppConfig {
  /** GraphQL API 端点 */
  apiBaseUrl: string
  /** 请求超时时间（毫秒） */
  requestTimeout: number
  /** 默认每页数量 */
  pageSize: number
  /** 最大重试次数 */
  maxRetries: number
}

const config: AppConfig = {
  apiBaseUrl: 'https://beta.pokeapi.co/graphql/v1beta',
  requestTimeout: 10000,
  pageSize: 20,
  maxRetries: 2,
}

export { config }
export type { AppConfig }
