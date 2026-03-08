/**
 * Logger - 统一日志工具
 * 生产环境仅输出 ERROR 级别，开发环境输出所有级别
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const currentLevel: LogLevel =
  process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG

export const Logger = {
  error(message: string, ...args: any[]) {
    if (currentLevel >= LogLevel.ERROR) {
      console.error(message, ...args)
    }
  },

  warn(message: string, ...args: any[]) {
    if (currentLevel >= LogLevel.WARN) {
      console.warn(message, ...args)
    }
  },

  info(message: string, ...args: any[]) {
    if (currentLevel >= LogLevel.INFO) {
      console.log(message, ...args)
    }
  },

  debug(message: string, ...args: any[]) {
    if (currentLevel >= LogLevel.DEBUG) {
      console.log(message, ...args)
    }
  },
}
