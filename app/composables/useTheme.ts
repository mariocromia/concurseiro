export type Theme = 'dark'

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')

  const applyDarkTheme = () => {
    if (process.client) {
      const html = document.documentElement

      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        html.classList.remove('light')
        html.classList.add('dark')
        html.setAttribute('data-theme', 'dark')
      })
      console.log('🎨 Theme applied: dark')
    }
  }

  // Inicializar tema (garante sincronização em todos os pontos)
  const initTheme = () => {
    theme.value = 'dark'
    applyDarkTheme()
  }

  // Alternar tema (mantém dark como único modo)
  const toggleTheme = () => {
    setTheme('dark')
  }

  // Definir tema específico (mantém assinatura prévia)
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    applyDarkTheme()
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
