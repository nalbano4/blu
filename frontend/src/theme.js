// theme.js
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    // Exact colors from the CSS file
    dashboard: {
      bg: '#0f172a',           // Main background
      surface: '#1e293b',      // Component backgrounds
      card: '#374151',         // Card backgrounds  
      border: '#4b5563',       // Borders
      text: {
        primary: '#f1f5f9',      // Main text
        secondary: '#d1d5db',    // Secondary text
        muted: '#9ca3af',        // Muted text
        darker: '#6b7280',       // Darker muted text
      }
    }
  },
  semanticTokens: {
    colors: {
      'bg-main': { default: '#0f172a', _dark: '#0f172a' },
      'bg-surface': { default: '#1e293b', _dark: '#1e293b' },
      'bg-card': { default: '#374151', _dark: '#374151' },
      'border-main': { default: '#4b5563', _dark: '#4b5563' },
      'text-primary': { default: '#f1f5f9', _dark: '#f1f5f9' },
      'text-secondary': { default: '#d1d5db', _dark: '#d1d5db' },
      'text-muted': { default: '#9ca3af', _dark: '#9ca3af' },
      'text-darker': { default: '#6b7280', _dark: '#6b7280' },
    }
  },
  fonts: {
    heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
})

export default theme