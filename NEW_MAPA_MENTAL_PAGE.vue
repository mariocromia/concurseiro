<template>
  <div class="min-h-screen theme-gradient">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold theme-text-primary mb-3">Mapas Mentais</h1>
        <p class="text-lg theme-text-secondary">Visualize e organize seus conhecimentos de forma intuitiva</p>
      </div>

      <!-- Two Main Options -->
      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <!-- Opção A: Mapa Mental com IA -->
        <div
          @click="openAIModal"
          class="relative theme-bg-secondary border-2 theme-border-primary rounded-claude-lg p-8 cursor-pointer hover:border-primary-500 transition-all group hover:shadow-2xl hover:scale-[1.02]"
        >
          <!-- Badge PRO -->
          <div class="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-lg">
            PRO
          </div>

          <!-- Icon -->
          <div class="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          <!-- Título -->
          <h2 class="text-2xl font-bold theme-text-primary mb-3 text-center">Criar com IA</h2>

          <!-- Descrição -->
          <p class="theme-text-secondary text-center mb-6">
            Deixe a IA criar um mapa mental completo e organizado baseado no conteúdo do seu caderno
          </p>

          <!-- Features -->
          <ul class="space-y-2 text-sm theme-text-tertiary mb-6">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Estrutura hierárquica automática
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Conceitos principais destacados
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Conexões lógicas entre tópicos
            </li>
          </ul>

          <!-- CTA -->
          <button class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-claude-md font-semibold hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2 group-hover:shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Gerar com IA
          </button>
        </div>

        <!-- Opção B: Mapa Mental em Branco -->
        <div
          @click="createBlankMindmap"
          class="theme-bg-secondary border-2 theme-border-primary rounded-claude-lg p-8 cursor-pointer hover:border-primary-500 transition-all group hover:shadow-2xl hover:scale-[1.02]"
        >
          <!-- Icon -->
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>

          <!-- Título -->
          <h2 class="text-2xl font-bold theme-text-primary mb-3 text-center">Criar do Zero</h2>

          <!-- Descrição -->
          <p class="theme-text-secondary text-center mb-6">
            Comece com um mapa em branco e construa sua própria estrutura de conhecimento
          </p>

          <!-- Features -->
          <ul class="space-y-2 text-sm theme-text-tertiary mb-6">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Controle total da organização
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Arraste e solte elementos
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Personalize cores e estilos
            </li>
          </ul>

          <!-- CTA -->
          <button class="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-claude-md font-semibold hover:from-blue-600 hover:to-cyan-600 transition flex items-center justify-center gap-2 group-hover:shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Começar do Zero
          </button>
        </div>
      </div>

      <!-- Biblioteca de Mapas Salvos -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold theme-text-primary">Meus Mapas Mentais</h2>
          <NuxtLink
            to="/mapas-mentais/biblioteca"
            class="text-sm theme-text-link hover:theme-text-hover flex items-center gap-1"
          >
            Ver todos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>

        <!-- Lista de Mapas (primeiros 6) -->
        <div v-else-if="mindmaps.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="mindmap in mindmaps.slice(0, 6)"
            :key="mindmap.id"
            @click="navigateTo(`/mapas-mentais/editor/${mindmap.id}`)"
            class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-6 cursor-pointer hover:border-primary-500 transition-all group"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-lg font-semibold theme-text-primary group-hover:text-primary-500 transition-colors line-clamp-2 flex-1">
                {{ mindmap.title }}
              </h3>
              <button
                @click.stop="deleteMindmap(mindmap.id)"
                class="p-2 hover:bg-red-500/20 rounded-claude-md transition-colors flex-shrink-0"
              >
                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <p class="text-xs theme-text-tertiary">
              Atualizado em {{ formatDate(mindmap.updated_at) }}
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 theme-bg-secondary border theme-border-primary rounded-claude-lg">
          <div class="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p class="theme-text-secondary">Você ainda não criou nenhum mapa mental</p>
        </div>
      </div>
    </main>

    <!-- Modal de Criação com IA -->
    <div
      v-if="showAIModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showAIModal = false"
    >
      <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button
          @click="showAIModal = false"
          class="absolute top-4 right-4 p-2 hover:bg-dark-700 rounded-claude-md transition-colors"
        >
          <svg class="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold theme-text-primary mb-2">Gerar Mapa Mental com IA</h2>
          <p class="theme-text-secondary">Escolha o conteúdo que você quer transformar em mapa mental</p>
        </div>

        <!-- Form -->
        <div class="space-y-6">
          <!-- Matéria -->
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-2">Matéria</label>
            <select
              v-model="selectedSubjectId"
              @change="loadNotebooks"
              class="w-full theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione uma matéria...</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>

          <!-- Caderno/Seção -->
          <div v-if="selectedSubjectId">
            <label class="block text-sm font-medium theme-text-secondary mb-2">Seção do Caderno</label>
            <select
              v-model="selectedSectionId"
              class="w-full theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione uma seção...</option>
              <option v-for="section in sections" :key="section.id" :value="section.id">
                {{ section.name }}
              </option>
            </select>
          </div>

          <!-- Nome do Mapa -->
          <div v-if="selectedSectionId">
            <label class="block text-sm font-medium theme-text-secondary mb-2">Nome do Mapa Mental</label>
            <input
              v-model="mapTitle"
              type="text"
              class="w-full theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              :placeholder="suggestedTitle"
            />
            <p class="text-xs theme-text-tertiary mt-1">Deixe em branco para usar o nome sugerido</p>
          </div>

          <!-- Botões -->
          <div class="flex gap-4 pt-4">
            <button
              @click="generateWithAI"
              :disabled="!selectedSectionId || generating"
              class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-claude-md font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="generating" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ generating ? 'Gerando...' : 'Gerar Mapa Mental' }}
            </button>
            <button
              @click="showAIModal = false"
              :disabled="generating"
              class="px-6 py-3 theme-bg-tertiary theme-text-secondary hover:bg-dark-700 rounded-claude-md transition disabled:opacity-50"
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

const mindmaps = ref<any[]>([])
const subjects = ref<any[]>([])
const sections = ref<any[]>([])
const loading = ref(true)
const showAIModal = ref(false)
const generating = ref(false)

const selectedSubjectId = ref('')
const selectedSectionId = ref('')
const mapTitle = ref('')

const supabase = useSupabaseClient()

// Título sugerido
const suggestedTitle = computed(() => {
  const subject = subjects.value.find(s => s.id === selectedSubjectId.value)
  const section = sections.value.find(s => s.id === selectedSectionId.value)

  if (subject && section) {
    return `${subject.name} - ${section.name}`
  }
  return 'Meu Mapa Mental'
})

// Carregar mapas mentais
const loadMindmaps = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/mindmaps')
    if (data) {
      mindmaps.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar mapas:', error)
  } finally {
    loading.value = false
  }
}

// Carregar matérias
const loadSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (!error && data) {
      subjects.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar matérias:', error)
  }
}

// Carregar cadernos/seções
const loadNotebooks = async () => {
  if (!selectedSubjectId.value) return

  sections.value = []
  selectedSectionId.value = ''

  try {
    const { data: notebooks, error: notebooksError } = await supabase
      .from('notebooks')
      .select('id')
      .eq('subject_id', selectedSubjectId.value)

    if (notebooksError || !notebooks || notebooks.length === 0) {
      console.log('Nenhum caderno encontrado')
      return
    }

    const notebookIds = notebooks.map(n => n.id)

    const { data: sectionsData, error: sectionsError } = await supabase
      .from('notebook_sections')
      .select('*')
      .in('notebook_id', notebookIds)
      .order('order_index')

    if (!sectionsError && sectionsData) {
      sections.value = sectionsData
    }
  } catch (error) {
    console.error('Erro ao carregar seções:', error)
  }
}

// Abrir modal IA
const openAIModal = () => {
  showAIModal.value = true
  loadSubjects()
}

// Criar mapa em branco
const createBlankMindmap = async () => {
  try {
    const { data } = await $fetch('/api/mindmaps', {
      method: 'POST',
      body: {
        title: 'Novo Mapa Mental',
        description: '',
        nodes: []
      }
    })

    if (data?.id) {
      navigateTo(`/mapas-mentais/editor/${data.id}`)
    }
  } catch (error: any) {
    alert('Erro ao criar mapa: ' + (error.message || 'Erro desconhecido'))
  }
}

// Gerar com IA
const generateWithAI = async () => {
  if (!selectedSubjectId.value || !selectedSectionId.value) return

  generating.value = true

  try {
    const { data } = await $fetch('/api/mindmaps/generate-ai', {
      method: 'POST',
      body: {
        subject_id: selectedSubjectId.value,
        section_id: selectedSectionId.value,
        title: mapTitle.value || suggestedTitle.value
      }
    })

    if (data?.id) {
      showAIModal.value = false
      navigateTo(`/mapas-mentais/editor/${data.id}`)
    }
  } catch (error: any) {
    alert('Erro ao gerar mapa: ' + (error.message || 'Erro desconhecido'))
  } finally {
    generating.value = false
  }
}

// Deletar mapa
const deleteMindmap = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este mapa mental?')) return

  try {
    await $fetch(`/api/mindmaps/${id}`, { method: 'DELETE' })
    await loadMindmaps()
  } catch (error) {
    alert('Erro ao deletar mapa mental')
  }
}

// Formatar data
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadMindmaps()
})
</script>
