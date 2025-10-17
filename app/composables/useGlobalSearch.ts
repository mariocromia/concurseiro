// Composable para usar a busca global em qualquer página
export const useGlobalSearch = () => {
  const searchQuery = ref('')
  const searchResults = ref<any[]>([])
  const isSearching = ref(false)

  // Listener para evento de busca global
  onMounted(() => {
    const handleGlobalSearch = (event: CustomEvent) => {
      searchQuery.value = event.detail.query
      performSearch(event.detail.query)
    }

    const handleGlobalSearchInput = (event: CustomEvent) => {
      searchQuery.value = event.detail.query
      debouncedSearch(event.detail.query)
    }

    window.addEventListener('global-search', handleGlobalSearch as EventListener)
    window.addEventListener('global-search-input', handleGlobalSearchInput as EventListener)

    onUnmounted(() => {
      window.removeEventListener('global-search', handleGlobalSearch as EventListener)
      window.removeEventListener('global-search-input', handleGlobalSearchInput as EventListener)
    })
  })

  // Função de busca principal
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    isSearching.value = true
    // Implementar lógica de busca aqui
    // Por exemplo: chamar API, filtrar dados locais, etc.

    // Simulação
    await new Promise(resolve => setTimeout(resolve, 300))

    isSearching.value = false
  }

  // Busca com debounce (para input em tempo real)
  let debounceTimeout: NodeJS.Timeout
  const debouncedSearch = (query: string) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      performSearch(query)
    }, 300)
  }

  // Limpar busca
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
  }

  return {
    searchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
  }
}
