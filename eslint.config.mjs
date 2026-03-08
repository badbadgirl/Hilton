import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  // 忽略目录
  {
    ignores: ['dist/**', 'node_modules/**', 'unpackage/**'],
  },

  // JS 基础推荐规则
  js.configs.recommended,

  // TypeScript 推荐规则
  ...tseslint.configs.recommended,

  // Vue 3 推荐规则
  ...pluginVue.configs['flat/recommended'],

  // Vue 文件使用 TypeScript 解析器
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 项目自定义规则
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Vue — 小程序模板中 <text>内容</text> 单行写法很常见，关闭强制换行
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-html-element-is': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',

      // 通用
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
    },
  },

  // 类型声明文件放宽规则
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // 测试文件放宽规则
  {
    files: ['**/*.test.ts', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // 全局变量（wx、uni 等小程序 API）
  {
    languageOptions: {
      globals: {
        wx: 'readonly',
        uni: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
      },
    },
  },
]
