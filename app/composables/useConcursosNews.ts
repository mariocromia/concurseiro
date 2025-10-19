interface NewsItem {
  id: string
  icon: string
  title: string
  description: string
  category: string
  date: Date
  url: string
  created_at?: string
}

export const useConcursosNews = () => {
  const supabase = useSupabaseClient()
  const news = ref<NewsItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNews = async () => {
    loading.value = true
    error.value = null

    try {
      // Buscar notícias da tabela 'news' ou 'concursos_news' no Supabase
      // Se a tabela não existir, retorna array vazio sem erro
      const { data, error: fetchError } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (fetchError) {
        // Se a tabela não existir (PGRST116), retorna array vazio
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('does not exist')) {
          console.warn('⚠️ Tabela "news" não encontrada. Retornando lista vazia.')
          news.value = []
          return
        }
        throw fetchError
      }

      // Mapear dados para o formato esperado
      news.value = (data || []).map((item: any) => ({
        id: item.id,
        icon: item.icon || '📰',
        title: item.title,
        description: item.description || '',
        category: item.category || 'geral',
        date: new Date(item.created_at || item.date),
        url: item.url || '#',
        created_at: item.created_at
      }))

    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar notícias'
      console.error('❌ Erro ao buscar notícias:', err)
      news.value = []
    } finally {
      loading.value = false
    }
  }

  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInHours < 1) {
      return 'Atualizado agora'
    } else if (diffInHours < 24) {
      return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else if (diffInDays === 1) {
      return 'Ontem'
    } else if (diffInDays < 7) {
      return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }
  }

  return {
    news,
    loading,
    error,
    fetchNews,
    getRelativeTime
  }
}
