<template>
  <div class="min-h-screen theme-gradient">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold theme-text-primary mb-2">Mapas Mentais</h1>
        <p class="theme-text-secondary">Organize seus conhecimentos visualmente com inteligência artificial</p>
      </div>

      <!-- Two Cards: AI Creation + Manual Creation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Card 1: Criar com IA (PRO) -->
        <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-8 hover:border-primary-500 transition-all cursor-pointer group" @click="openAIModal">
          <div class="flex items-start justify-between mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-claude-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span class="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
              GRÁTIS
            </span>
          </div>

          <h3 class="text-2xl font-bold theme-text-primary mb-3 group-hover:text-primary-500 transition-colors">
            Criar com IA
          </h3>

          <p class="theme-text-secondary mb-6 leading-relaxed">
            Deixe a inteligência artificial analisar seu caderno e gerar automaticamente um mapa mental completo e estruturado.
          </p>

          <ul class="space-y-2 mb-6">
            <li class="flex items-start gap-2 text-sm theme-text-tertiary">
              <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Análise automática do conteúdo
            </li>
            <li class="flex items-start gap-2 text-sm theme-text-tertiary">
              <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Estrutura hierárquica inteligente
            </li>
            <li class="flex items-start gap-2 text-sm theme-text-tertiary">
              <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Cores e conexões automáticas
            </li>
          </ul>

          <button class="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-claude-md transition-all font-semibold flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Gerar com IA
          </button>
        </div>

        <!-- Card 2: Criar do Zero -->
        <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-8 hover:border-primary-500 transition-all cursor-pointer group" @click="createManualMindmap">
          <div class="flex items-start justify-between mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-claude-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span class="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
              GRÁTIS
            </span>
          </div>

          <h3 class="text-2xl font-bold theme-text-primary mb-3 group-hover:text-primary-500 transition-colors">
            Criar do Zero
          </h3>

          <p class="theme-text-secondary mb-6 leading-relaxed">
            Crie seu mapa mental manualmente com total controle sobre a estrutura, cores e organização dos conceitos.
          </p>

          <ul class="space-y-2 mb-6">
            <li class="flex items-start gap-2 text-sm theme-text-tertiary">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Editor visual interativo
            </li>
            <li class="flex items-start gap-2 text-sm theme-text-tertiary">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Personalização completa
            </li>
            <li class="flex items-start gap-2 text-sm theme-text-tertiary">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Arrastar e soltar nós
            </li>
          </ul>

          <button class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-claude-md transition-all font-semibold flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Criar Mapa Mental
          </button>
        </div>
      </div>

      <!-- Biblioteca de Mapas Mentais -->
      <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold theme-text-primary">Meus Mapas Mentais</h2>
          <button @click="loadMindmaps" class="p-2 hover:bg-primary-500/20 rounded-claude-md transition-colors">
            <svg class="w-5 h-5 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
          <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="theme-text-secondary mb-4">{{ error }}</p>
          <button @click="loadMindmaps" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-claude-md transition-colors">
            Tentar Novamente
          </button>
        </div>

        <!-- Grid de Mapas -->
        <div v-else-if="mindmaps.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="mindmap in mindmaps"
            :key="mindmap.id"
            class="theme-bg-tertiary border theme-border-primary rounded-claude-lg p-6 cursor-pointer hover:border-primary-500 transition-all group"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1" @click="navigateToEditor(mindmap.id)">
                <h3 class="text-lg font-semibold theme-text-primary group-hover:text-primary-500 transition-colors mb-1">
                  {{ mindmap.title }}
                </h3>
                <p class="text-sm theme-text-tertiary">
                  {{ mindmap.description || 'Sem descrição' }}
                </p>
              </div>
              <button
                @click.stop="deleteMindmap(mindmap.id)"
                class="p-2 hover:bg-red-500/20 rounded-claude-md transition-colors"
              >
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div class="text-xs theme-text-tertiary">
              Atualizado em {{ formatDate(mindmap.updated_at) }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold theme-text-primary mb-2">Nenhum mapa mental criado</h3>
          <p class="theme-text-secondary">Crie seu primeiro mapa mental usando IA ou do zero</p>
        </div>
      </div>
    </main>

    <!-- Modal: Configuração de IA -->
    <div v-if="showAIModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeAIModal">
      <div @click.stop class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-primary-500">🚀 NOVA VERSÃO - Configurar Geração com IA</h3>
          <button @click="closeAIModal" class="p-2 hover:bg-dark-700 rounded-claude-md transition-colors">
            <svg class="w-6 h-6 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading de configurações -->
        <div v-if="loadingConfig" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>

        <!-- Formulário -->
        <div v-else class="space-y-6">
          <!-- Caderno (Subject) -->
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-2">
              Caderno <span class="text-red-400">*</span>
            </label>
            <select
              v-model="aiConfig.subjectId"
              @change="onSubjectChange"
              class="w-full px-4 py-3 theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione um caderno</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
            <p class="text-xs theme-text-tertiary mt-1">Selecione o caderno que contém o capítulo desejado</p>
          </div>

          <!-- Capítulo (Chapter) -->
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-2">
              Capítulo <span class="text-red-400">*</span>
            </label>
            <select
              v-model="aiConfig.chapterId"
              :disabled="!aiConfig.subjectId || loadingChapters"
              class="w-full px-4 py-3 theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="">{{ loadingChapters ? 'Carregando...' : 'Selecione um capítulo' }}</option>
              <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                {{ chapter.title }}
              </option>
            </select>
            <p class="text-xs theme-text-tertiary mt-1">O mapa mental será gerado a partir do conteúdo deste capítulo</p>
          </div>

          <!-- Título do Mapa -->
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-2">
              Título do Mapa Mental <span class="text-red-400">*</span>
            </label>
            <input
              v-model="aiConfig.title"
              type="text"
              class="w-full px-4 py-3 theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Estruturas de Dados - Árvores"
            />
          </div>

          <!-- Botões -->
          <div class="flex gap-3 pt-4">
            <button
              @click="generateWithAI"
              :disabled="!canGenerate || generatingAI"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-claude-md transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="generatingAI" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ generatingAI ? 'Gerando...' : 'Gerar Mapa Mental' }}
            </button>
            <button
              @click="closeAIModal"
              class="px-6 py-3 theme-bg-tertiary theme-text-secondary hover:bg-dark-700 rounded-claude-md transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const client = useSupabaseClient()

// State
const mindmaps = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// AI Modal
const showAIModal = ref(false)
const loadingConfig = ref(false)
const loadingChapters = ref(false)
const generatingAI = ref(false)

const subjects = ref<any[]>([])
const chapters = ref<any[]>([])

const aiConfig = ref({
  subjectId: '',
  chapterId: '',
  title: ''
})

// Computed
const canGenerate = computed(() => {
  return aiConfig.value.subjectId && aiConfig.value.chapterId && aiConfig.value.title.trim()
})

// Carregar mapas mentais
const loadMindmaps = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/mindmaps')
    mindmaps.value = response.data || []
  } catch (err: any) {
    console.error('Erro ao carregar mapas mentais:', err)
    error.value = err.message || 'Erro ao carregar mapas mentais'
  } finally {
    loading.value = false
  }
}

// Abrir modal de IA
const openAIModal = async () => {
  showAIModal.value = true
  loadingConfig.value = true

  try {
    // Carregar todas as matérias (subjects)
    const { data: subjectsData } = await client
      .from('subjects')
      .select('id, name')
      .order('name')

    subjects.value = subjectsData || []
    console.log('[FRONTEND] Matérias carregadas:', subjects.value.length)
  } catch (err) {
    console.error('Erro ao carregar matérias:', err)
  } finally {
    loadingConfig.value = false
  }
}

// Fechar modal de IA
const closeAIModal = () => {
  showAIModal.value = false
  aiConfig.value = {
    subjectId: '',
    chapterId: '',
    title: ''
  }
  chapters.value = []
}

// Quando mudar matéria (subject)
const onSubjectChange = async () => {
  console.log('[FRONTEND] === onSubjectChange CHAMADO ===')
  console.log('[FRONTEND] Matéria selecionada ID:', aiConfig.value.subjectId)

  aiConfig.value.chapterId = ''
  chapters.value = []

  if (!aiConfig.value.subjectId) {
    console.warn('[FRONTEND] subjectId está vazio, retornando...')
    return
  }

  loadingChapters.value = true
  try {
    console.log('[FRONTEND] Buscando capítulos da matéria:', aiConfig.value.subjectId)
    const { data, error } = await client
      .from('chapters')
      .select('id, title')
      .eq('subject_id', aiConfig.value.subjectId)
      .order('title')

    console.log('[FRONTEND] Resultado da busca:')
    console.log('[FRONTEND] - data:', data)
    console.log('[FRONTEND] - error:', error)
    console.log('[FRONTEND] - Quantidade de capítulos:', data?.length || 0)

    chapters.value = data || []

    if (data && data.length > 0) {
      console.log('[FRONTEND] Capítulos encontrados:', data.map((c: any) => ({ id: c.id, title: c.title })))
    } else {
      console.warn('[FRONTEND] Nenhum capítulo encontrado para esta matéria')
    }
  } catch (err) {
    console.error('[FRONTEND] Erro ao carregar capítulos:', err)
  } finally {
    loadingChapters.value = false
    console.log('[FRONTEND] === FIM onSubjectChange ===')
  }
}

// Gerar com IA
const generateWithAI = async () => {
  console.log('[FRONTEND] === INICIANDO GERAÇÃO COM IA ===')
  console.log('[FRONTEND] canGenerate:', canGenerate.value)
  console.log('[FRONTEND] aiConfig completo:', JSON.stringify(aiConfig.value, null, 2))

  if (!canGenerate.value) {
    console.error('[FRONTEND] ❌ Validação falhou! canGenerate = false')
    alert('Por favor, preencha todos os campos obrigatórios:\n- Caderno\n- Capítulo\n- Título')
    return
  }

  generatingAI.value = true
  try {
    // Verificar se o capítulo tem conteúdo antes de enviar
    console.log('[FRONTEND] Verificando se o capítulo tem páginas com conteúdo...')

    if (!aiConfig.value.chapterId) {
      alert('⚠️ Por favor, selecione um capítulo antes de gerar o mapa mental.')
      return
    }

    const { data: pages, error: pagesError } = await client
      .from('pages')
      .select('id, title, content')
      .eq('chapter_id', aiConfig.value.chapterId)

    if (pagesError) {
      console.error('[FRONTEND] Erro ao verificar páginas:', pagesError)
      throw new Error(`Erro ao verificar o conteúdo do capítulo: ${pagesError.message}`)
    }

    console.log('[FRONTEND] Páginas encontradas:', pages?.length || 0)

    if (!pages || pages.length === 0) {
      alert('⚠️ O capítulo selecionado não possui páginas.\n\nPor favor, adicione conteúdo ao capítulo antes de gerar o mapa mental.')
      return
    }

    // Verificar se as páginas têm conteúdo
    const pagesWithContent = pages.filter((p: any) => p.content && p.content.trim().length > 0)
    console.log('[FRONTEND] Páginas com conteúdo:', pagesWithContent.length)

    if (pagesWithContent.length === 0) {
      alert('⚠️ O capítulo selecionado não possui conteúdo de texto.\n\nPor favor, adicione texto às páginas do capítulo antes de gerar o mapa mental.')
      return
    }

    // Verificar tamanho do conteúdo
    const totalContent = pagesWithContent.map((p: any) => p.content).join('\n\n')
    console.log('[FRONTEND] Tamanho total do conteúdo:', totalContent.length, 'caracteres')

    if (totalContent.length < 50) {
      alert('⚠️ O capítulo selecionado possui muito pouco conteúdo.\n\nAdicione mais texto (pelo menos 50 caracteres) para gerar um mapa mental útil.')
      return
    }

    console.log('[FRONTEND] ✅ Validação de conteúdo OK! Enviando para API...')
    console.log('[FRONTEND] Chamando API /api/mindmaps/generate-ai...')

    const response = await $fetch('/api/mindmaps/generate-ai', {
      method: 'POST',
      body: {
        chapter_id: aiConfig.value.chapterId,
        title: aiConfig.value.title
      }
    })

    console.log('[FRONTEND] Resposta recebida:', response)

    if (response.data?.id) {
      console.log('[FRONTEND] ✅ Mapa mental criado com sucesso! ID:', response.data.id)
      alert('🎉 Mapa mental gerado com sucesso!')
      closeAIModal()
      await loadMindmaps()
      navigateToEditor(response.data.id)
    } else {
      console.error('[FRONTEND] Resposta sem ID:', response)
      alert('Erro: Resposta inválida da API')
    }
  } catch (err: any) {
    console.error('[FRONTEND] === ERRO AO GERAR MAPA MENTAL ===')
    console.error('[FRONTEND] Erro completo:', err)
    console.error('[FRONTEND] Status:', err.statusCode)
    console.error('[FRONTEND] Message:', err.message)
    console.error('[FRONTEND] Data:', err.data)

    const errorMessage = err.data?.message || err.message || 'Erro ao gerar mapa mental com IA'
    alert(`❌ Erro: ${errorMessage}`)
  } finally {
    generatingAI.value = false
    console.log('[FRONTEND] === FIM DA GERAÇÃO ===')
  }
}

// Criar mapa manual
const createManualMindmap = async () => {
  try {
    const response = await $fetch('/api/mindmaps', {
      method: 'POST',
      body: {
        title: 'Novo Mapa Mental'
      }
    })

    if (response.data?.id) {
      navigateToEditor(response.data.id)
    }
  } catch (err: any) {
    console.error('Erro ao criar mapa mental:', err)
    alert(err.data?.message || 'Erro ao criar mapa mental')
  }
}

// Navegar para editor
const navigateToEditor = (id: string) => {
  router.push(`/mapas-mentais/editor/${id}`)
}

// Deletar mapa mental
const deleteMindmap = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este mapa mental?')) return

  try {
    await $fetch(`/api/mindmaps/${id}`, { method: 'DELETE' })
    await loadMindmaps()
  } catch (err: any) {
    console.error('Erro ao deletar mapa mental:', err)
    alert('Erro ao deletar mapa mental')
  }
}

// Formatar data
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Carregar ao montar
onMounted(() => {
  loadMindmaps()
})
</script>
