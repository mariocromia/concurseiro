<template>
  <div class="min-h-screen theme-gradient">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold theme-text-primary mb-2">Mapas Mentais</h1>
        <p class="theme-text-secondary">Organize seus conhecimentos visualmente</p>
      </div>

      <!-- Aviso de Setup -->
      <div v-if="showSetupWarning" class="mb-6 theme-bg-secondary border border-yellow-500/50 rounded-claude-lg p-6">
        <div class="flex items-start gap-4">
          <svg class="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-yellow-500 mb-2">Configuração Necessária</h3>
            <p class="theme-text-secondary text-sm mb-4">
              As tabelas do banco de dados precisam ser criadas. Execute o script SQL no Supabase:
            </p>
            <div class="bg-dark-900/50 rounded-claude-md p-4 mb-4 overflow-x-auto">
              <code class="text-xs text-claude-text-secondary dark:text-gray-300 whitespace-pre">scripts/create-mindmaps-tables.sql</code>
            </div>
            <button
              @click="showSetupWarning = false"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-dark-900 rounded-claude-md transition-colors text-sm font-medium"
            >
              Já executei o script
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-primary dark:border-primary-500"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="theme-bg-secondary border border-red-500/50 rounded-claude-lg p-8 text-center">
        <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-red-400 mb-2">Erro ao carregar</h3>
        <p class="theme-text-secondary mb-4">{{ error }}</p>
        <button
          @click="loadMindmaps"
          class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-claude-text dark:text-white rounded-claude-md transition-colors inline-flex items-center gap-2"
        >
          Tentar Novamente
        </button>
      </div>

      <!-- Lista de Mapas Mentais -->
      <div v-else-if="!selectedMindmap">
        <div class="mb-6 flex justify-end">
          <button
            @click="createNewMindmap"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-claude-text dark:text-white rounded-claude-md transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Mapa Mental
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="mindmap in mindmaps"
            :key="mindmap.id"
            @click="openMindmap(mindmap.id)"
            class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-6 cursor-pointer hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 transition-all group"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold theme-text-primary group-hover:text-primary-500 transition-colors">
                  {{ mindmap.title }}
                </h3>
                <p class="text-sm theme-text-tertiary mt-1">
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

          <!-- Empty State -->
          <div v-if="mindmaps.length === 0" class="col-span-full">
            <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-12 text-center">
              <div class="w-20 h-20 bg-claude-primary/20 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold theme-text-primary mb-2">Nenhum mapa mental criado</h3>
              <p class="theme-text-secondary mb-4">Crie seu primeiro mapa mental para começar a organizar suas ideias</p>
              <button
                @click="createNewMindmap"
                class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-claude-text dark:text-white rounded-claude-md transition-colors inline-flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Criar Mapa Mental
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor do Mapa Mental (versão simplificada) -->
      <div v-else class="space-y-4">
        <!-- Toolbar -->
        <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="closeMindmap"
              class="p-2 hover:bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md transition-colors"
            >
              <svg class="w-5 h-5 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <input
              v-model="currentMindmapData.title"
              @blur="saveMindmapInfo"
              class="text-xl font-bold theme-text-primary bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              placeholder="Título do mapa mental"
            />
          </div>
          <div class="flex items-center gap-2">
            <span v-if="saving" class="text-sm theme-text-tertiary flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Salvando...
            </span>
            <span v-else class="text-sm theme-text-tertiary">✓ Salvo</span>
          </div>
        </div>

        <!-- Lista de Nós -->
        <div class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold theme-text-primary">Nós do Mapa Mental</h3>
            <button
              @click="addNode"
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-claude-text dark:text-white rounded-claude-md transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Nó
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="node in nodes"
              :key="node.id"
              class="flex items-center gap-3 p-4 rounded-claude-md border theme-border-primary hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 transition-colors"
            >
              <div
                class="w-4 h-4 rounded-full flex-shrink-0"
                :style="{ backgroundColor: node.color }"
              ></div>
              <div class="flex-1">
                <p class="theme-text-primary">{{ node.text }}</p>
              </div>
              <button
                @click="editNode(node)"
                class="p-2 hover:bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md transition-colors"
              >
                <svg class="w-4 h-4 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteNodeConfirm(node.id)"
                class="p-2 hover:bg-red-500/20 rounded-claude-md transition-colors"
              >
                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div v-if="nodes.length === 0" class="text-center py-8 theme-text-tertiary">
              Nenhum nó criado. Clique em "Adicionar Nó" para começar.
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal para Adicionar/Editar Nó -->
    <div v-if="showNodeEditor" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" @click="showNodeEditor = false">
      <div @click.stop class="theme-bg-secondary border theme-border-primary rounded-claude-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold theme-text-primary mb-4">
          {{ editingNode.id ? 'Editar Nó' : 'Novo Nó' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-2">Texto</label>
            <input
              v-model="editingNode.text"
              class="w-full px-4 py-2 theme-bg-tertiary theme-text-primary border theme-border-primary rounded-claude-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Digite o texto do nó"
            />
          </div>
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-2">Cor</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in colors"
                :key="color"
                @click="editingNode.color = color"
                class="w-10 h-10 rounded-claude-md border-2 transition-all"
                :class="editingNode.color === color ? 'border-white scale-110' : 'border-transparent'"
                :style="{ backgroundColor: color }"
              />
            </div>
          </div>
          <div class="flex gap-2 pt-4">
            <button
              @click="saveNode"
              class="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-claude-text dark:text-white rounded-claude-md transition-colors"
            >
              Salvar
            </button>
            <button
              @click="showNodeEditor = false"
              class="px-4 py-2 theme-bg-tertiary theme-text-secondary hover:bg-dark-700 rounded-claude-md transition-colors"
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
const selectedMindmap = ref<string | null>(null)
const currentMindmapData = ref<any>({})
const nodes = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const showNodeEditor = ref(false)
const editingNode = ref<any>({})
const showSetupWarning = ref(true)

const colors = ['#ca643f', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

// Carregar mapas mentais
const loadMindmaps = async () => {
  try {
    loading.value = true
    error.value = null
    const { data } = await $fetch('/api/mindmaps')
    mindmaps.value = data || []
    showSetupWarning.value = false
  } catch (err: any) {
    console.error('Erro ao carregar mapas mentais:', err)
    error.value = err.message || 'Erro ao carregar mapas mentais. Verifique se as tabelas foram criadas no Supabase.'
  } finally {
    loading.value = false
  }
}

// Criar novo mapa mental
const createNewMindmap = async () => {
  try {
    const { data } = await $fetch('/api/mindmaps', {
      method: 'POST',
      body: {
        title: 'Novo Mapa Mental',
        description: ''
      }
    })

    if (data) {
      await openMindmap(data.id)
      await loadMindmaps()
    }
  } catch (err: any) {
    console.error('Erro ao criar mapa mental:', err)
    error.value = err.message || 'Erro ao criar mapa mental'
  }
}

// Abrir mapa mental
const openMindmap = async (id: string) => {
  try {
    loading.value = true
    error.value = null
    const { data } = await $fetch(`/api/mindmaps/${id}`)

    selectedMindmap.value = id
    currentMindmapData.value = data
    nodes.value = data.nodes || []
  } catch (err: any) {
    console.error('Erro ao abrir mapa mental:', err)
    error.value = err.message || 'Erro ao abrir mapa mental'
  } finally {
    loading.value = false
  }
}

// Fechar mapa mental
const closeMindmap = () => {
  selectedMindmap.value = null
  currentMindmapData.value = {}
  nodes.value = []
}

// Deletar mapa mental
const deleteMindmap = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este mapa mental?')) return

  try {
    await $fetch(`/api/mindmaps/${id}`, { method: 'DELETE' })
    await loadMindmaps()
  } catch (err: any) {
    console.error('Erro ao deletar mapa mental:', err)
    error.value = err.message || 'Erro ao deletar mapa mental'
  }
}

// Salvar informações do mapa mental
const saveMindmapInfo = async () => {
  if (!selectedMindmap.value) return

  try {
    saving.value = true
    await $fetch(`/api/mindmaps/${selectedMindmap.value}`, {
      method: 'PUT',
      body: {
        title: currentMindmapData.value.title,
        description: currentMindmapData.value.description
      }
    })
  } catch (err: any) {
    console.error('Erro ao salvar informações:', err)
  } finally {
    setTimeout(() => {
      saving.value = false
    }, 500)
  }
}

// Adicionar novo nó
const addNode = () => {
  editingNode.value = {
    text: '',
    color: colors[0]
  }
  showNodeEditor.value = true
}

// Editar nó
const editNode = (node: any) => {
  editingNode.value = { ...node }
  showNodeEditor.value = true
}

// Salvar nó
const saveNode = async () => {
  if (!editingNode.value.text.trim()) {
    alert('Digite um texto para o nó')
    return
  }

  try {
    if (editingNode.value.id) {
      // Atualizar nó existente
      await $fetch(`/api/mindmap-nodes/${editingNode.value.id}`, {
        method: 'PUT',
        body: {
          text: editingNode.value.text,
          color: editingNode.value.color
        }
      })

      // Atualizar na lista
      const index = nodes.value.findIndex(n => n.id === editingNode.value.id)
      if (index !== -1) {
        nodes.value[index] = { ...editingNode.value }
      }
    } else {
      // Criar novo nó
      const { data } = await $fetch('/api/mindmap-nodes', {
        method: 'POST',
        body: {
          mindmap_id: selectedMindmap.value,
          text: editingNode.value.text,
          color: editingNode.value.color
        }
      })

      if (data) {
        nodes.value.push(data)
      }
    }

    showNodeEditor.value = false
    editingNode.value = {}
  } catch (err: any) {
    console.error('Erro ao salvar nó:', err)
    alert('Erro ao salvar nó')
  }
}

// Deletar nó
const deleteNodeConfirm = async (nodeId: string) => {
  if (!confirm('Tem certeza que deseja excluir este nó?')) return

  try {
    await $fetch(`/api/mindmap-nodes/${nodeId}`, {
      method: 'DELETE'
    })

    nodes.value = nodes.value.filter(n => n.id !== nodeId)
  } catch (err: any) {
    console.error('Erro ao deletar nó:', err)
    alert('Erro ao deletar nó')
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
