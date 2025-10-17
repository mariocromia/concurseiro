export type Theme = 'light' | 'dark'

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')

  // Inicializar tema do localStorage ou sistema
  const initTheme = () => {
    console.log('initTheme: called')
    if (process.client) {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      console.log('initTheme: savedTheme from localStorage:', savedTheme)

      if (savedTheme) {
        theme.value = savedTheme
        console.log('initTheme: using saved theme:', savedTheme)
      } else {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.value = prefersDark ? 'dark' : 'light'
        console.log('initTheme: using system preference:', theme.value)
      }

      console.log('initTheme: final theme.value:', theme.value)
      applyTheme(theme.value)
    }
  }

  // Aplicar tema ao documento
  const applyTheme = (newTheme: Theme) => {
    if (process.client) {
      const html = document.documentElement
      console.log('applyTheme: applying theme', newTheme, 'to', html)

      if (newTheme === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
        console.log('applyTheme: added dark, removed light. Classes:', html.classList.toString())
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
        console.log('applyTheme: added light, removed dark. Classes:', html.classList.toString())
      }
    }
  }

  // Alternar tema
  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme.value)
    const newTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
    console.log('setting new theme to:', newTheme)
    setTheme(newTheme)
  }

  // Definir tema específico
  const setTheme = (newTheme: Theme) => {
    console.log('setTheme called with:', newTheme)
    theme.value = newTheme
    console.log('theme.value updated to:', theme.value)
    applyTheme(newTheme)

    if (process.client) {
      localStorage.setItem('theme', newTheme)
      console.log('saved to localStorage:', newTheme)
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
