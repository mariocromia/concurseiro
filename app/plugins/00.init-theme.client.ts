/**
 * Critical Theme Initialization Plugin
 * Runs BEFORE any component renders to prevent FOUC
 *
 * Priority: 00 (runs first)
 */

export default defineNuxtPlugin({
  name: 'init-theme',
  enforce: 'pre', // Run before other plugins

  setup() {
    // Execute immediately, synchronously
    if (process.client) {
      // Get saved theme or system preference
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme = savedTheme || (prefersDark ? 'dark' : 'light')

      // Apply theme IMMEDIATELY to prevent flash
      const html = document.documentElement

      // Remove both classes first
      html.classList.remove('dark', 'light')

      // Add the correct theme
      html.classList.add(theme)

      // Add attribute for CSS targeting
      html.setAttribute('data-theme', theme)

      // Set visibility after theme is applied
      html.style.visibility = 'visible'

      console.log('🎨 Theme initialized immediately:', theme)
    }
  }
})
