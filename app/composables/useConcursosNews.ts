export const useConcursosNews = () => {
  const news = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Notícias simuladas - em produção, substituir por API real
  const mockNews = [
    {
      id: 1,
      icon: '🎓',
      title: 'Dicas de Estudo',
      description: 'Técnicas comprovadas de memorização e organização para concursos públicos. Aprenda métodos como Pomodoro, flashcards e mapas mentais.',
      category: 'dicas',
      date: new Date(),
      url: '#'
    },
    {
      id: 2,
      icon: '📚',
      title: 'Concurso Público Nacional - 5.000 vagas',
      description: 'Edital publicado com mais de 5.000 vagas para diversos cargos de nível médio e superior. Inscrições abertas até o dia 15.',
      category: 'edital',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      url: '#'
    },
    {
      id: 3,
      icon: '✍️',
      title: 'Questões Comentadas - Direito Constitucional',
      description: 'Resolução detalhada das questões mais cobradas em provas recentes. Análise completa com dicas e jurisprudência atualizada.',
      category: 'questoes',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      url: '#'
    },
    {
      id: 4,
      icon: '🏆',
      title: 'Aprovado em 1º lugar conta sua estratégia',
      description: 'Conheça a rotina de estudos e as estratégias do candidato que conquistou o 1º lugar no concurso da Receita Federal.',
      category: 'sucesso',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      url: '#'
    },
    {
      id: 5,
      icon: '🧠',
      title: 'Saúde Mental nos Estudos',
      description: 'Como manter o equilíbrio emocional durante a jornada de estudos. Técnicas de mindfulness e gestão de ansiedade pré-prova.',
      category: 'saude',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      url: '#'
    },
    {
      id: 6,
      icon: '💡',
      title: 'IA para Concurseiros',
      description: 'Como usar inteligência artificial para potencializar seus estudos: ChatGPT, resumos automáticos e questões personalizadas.',
      category: 'tecnologia',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
      url: '#'
    },
    {
      id: 7,
      icon: '📋',
      title: 'Banco do Brasil - 6.000 vagas previstas',
      description: 'Autorizado novo concurso com salário inicial de R$ 3.622,23. Edital deve sair em dezembro de 2025.',
      category: 'previsto',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      url: '#'
    },
    {
      id: 8,
      icon: '⚖️',
      title: 'Mudanças na Legislação Tributária',
      description: 'Reforma tributária aprovada: entenda as principais mudanças e como isso impacta as provas de concursos.',
      category: 'atualizacao',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      url: '#'
    },
    {
      id: 9,
      icon: '📖',
      title: 'Cronograma de Estudos Personalizado',
      description: 'Monte seu plano de estudos de acordo com o tempo disponível e disciplinas do edital. Ferramenta gratuita disponível.',
      category: 'ferramenta',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      url: '#'
    }
  ]

  const fetchNews = async () => {
    loading.value = true
    error.value = null

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))

      news.value = mockNews
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar notícias'
      console.error('Erro ao buscar notícias:', err)
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
