export default defineNuxtPlugin(() => {
  console.log('Theme plugin: initializing...')
  const { initTheme } = useTheme()

  // Inicializar tema assim que o app carregar no cliente
  initTheme()
  console.log('Theme plugin: initialized')
})
