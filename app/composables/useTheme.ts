export type Theme = 'light' | 'dark'

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')

  // Inicializar tema do localStorage ou sistema
  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme') as Theme | null

      if (savedTheme) {
        theme.value = savedTheme
      } else {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.value = prefersDark ? 'dark' : 'light'
      }

      applyTheme(theme.value)
    }
  }

  // Aplicar tema ao documento
  const applyTheme = (newTheme: Theme) => {
    if (process.client) {
      const html = document.documentElement

      if (newTheme === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
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
