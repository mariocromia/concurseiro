export type Theme = 'light' | 'dark'

export const useTheme = () => {
  // Get initial theme from DOM (already applied by inline script)
  const getInitialTheme = (): Theme => {
    if (process.client) {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
    return 'dark'
  }

  const theme = useState<Theme>('theme', getInitialTheme)

  // Inicializar tema do localStorage ou sistema
  const initTheme = () => {
    if (process.client) {
      // Theme already applied by inline script, just sync state
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      theme.value = currentTheme
      console.log('🎨 Theme synced:', currentTheme)
    }
  }

  // Aplicar tema ao documento
  const applyTheme = (newTheme: Theme) => {
    if (process.client) {
      const html = document.documentElement

      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        if (newTheme === 'dark') {
          html.classList.remove('light')
          html.classList.add('dark')
        } else {
          html.classList.remove('dark')
          html.classList.add('light')
        }
        html.setAttribute('data-theme', newTheme)
      })

      console.log('🎨 Theme applied:', newTheme)
    }
  }

  // Alternar tema
  const toggleTheme = () => {
    const newTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Definir tema específico
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    applyTheme(newTheme)

    if (process.client) {
      localStorage.setItem('theme', newTheme)
      console.log('🎨 Theme saved:', newTheme)
    }
  }

  // Verificar se é tema escuro
  const isDark = computed(() => theme.value === 'dark')

  return {
    theme: readonly(theme),
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  }
}
