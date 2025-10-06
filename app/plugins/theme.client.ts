export default defineNuxtPlugin(() => {
  const { initTheme } = useTheme()

  // Inicializar tema assim que o app carregar no cliente
  initTheme()
})
