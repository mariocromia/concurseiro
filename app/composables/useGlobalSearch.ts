// Composable para usar a busca global em qualquer página
export const useGlobalSearch = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
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

  // Função de busca principal com Supabase
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    if (!user.value) {
      console.warn('⚠️ Usuário não autenticado')
      searchResults.value = []
      return
    }

    isSearching.value = true

    try {
      const results: any[] = []
      const searchPattern = `%${query}%`

      // Buscar em subjects (matérias)
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, color, icon')
        .eq('user_id', user.value.id)
        .ilike('name', searchPattern)
        .limit(5)

      if (subjects) {
        results.push(...subjects.map((s: any) => ({ ...s, type: 'subject' })))
      }

      const subjectIds = subjects?.map((s: any) => s.id) || []

      // Buscar em capítulos
      if (subjectIds.length > 0) {
        const { data: chaptersData } = await supabase
          .from('chapters')
          .select('id, title, subject_id')
          .in('subject_id', subjectIds)
          .ilike('title', searchPattern)
          .limit(8)

        if (chaptersData) {
          results.push(...chaptersData.map((c: any) => ({ ...c, type: 'chapter' })))
        }

        // Buscar páginas de capítulos (conteúdo do caderno)
        const { data: pagesData, error: pagesError } = await supabase
          .from('pages')
          .select('id, title, content, chapter_id, chapters(subject_id, title)')
          .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .in('chapters.subject_id', subjectIds)
          .limit(12)

        if (pagesError) {
          console.error('❌ Erro ao buscar páginas do caderno:', pagesError)
        }

        if (pagesData) {
          results.push(...pagesData.map((p: any) => ({
            ...p,
            type: 'page',
            chapter_title: p.chapters?.title || null,
            subject_id: p.chapters?.subject_id || null
          })))
        }
      }

      // Buscar em tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, description, status')
        .eq('user_id', user.value.id)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(5)

      if (tasks) {
        results.push(...tasks.map((t: any) => ({ ...t, type: 'task' })))
      }

      // Buscar em reminders
      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, title, message')
        .eq('user_id', user.value.id)
        .or(`title.ilike.${searchPattern},message.ilike.${searchPattern}`)
        .limit(5)

      if (reminders) {
        results.push(...reminders.map((r: any) => ({ ...r, type: 'reminder' })))
      }

      searchResults.value = results

    } catch (error: any) {
      console.error('❌ Erro ao buscar:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
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
