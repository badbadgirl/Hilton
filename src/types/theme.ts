/**
 * Theme related type definitions
 * Validates: Requirements 8.2, 8.3
 */

/**
 * Theme colors interface
 */
export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  accent: string
  error: string
  success: string
  warning: string
}

/**
 * Theme interface
 */
export interface Theme {
  name: string
  displayName: string
  colors: ThemeColors
}
