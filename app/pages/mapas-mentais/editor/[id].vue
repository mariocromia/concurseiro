<template>
  <div class="h-screen bg-dark-900 flex flex-col">
    <!-- Toolbar -->
    <div class="bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="navigateTo('/mapas-mentais/biblioteca')"
          class="text-claude-text-secondary dark:text-gray-400 hover:text-claude-text dark:text-white transition p-2 hover:bg-dark-700 rounded-claude-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          v-model="title"
          @blur="saveTitle"
          type="text"
          class="bg-transparent text-claude-text dark:text-white font-semibold text-lg border-none focus:outline-none focus:ring-0 px-2 py-1 hover:bg-dark-700 rounded transition"
          placeholder="Título do mapa..."
        >
        <div v-if="saving" class="flex items-center gap-2 text-sm text-claude-text-secondary dark:text-gray-400">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Salvando...</span>
        </div>
        <div v-else-if="lastSaved" class="text-sm text-gray-600 dark:text-gray-500">
          Salvo {{ lastSaved }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="saveNodes"
          :disabled="saving"
          class="px-4 py-2 bg-green-600 text-white rounded-claude-md hover:bg-green-500 transition flex items-center gap-2 disabled:opacity-50"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
        <button
          @click="addNode"
          class="px-4 py-2 bg-primary-600 text-claude-text dark:text-white rounded-claude-md hover:bg-primary-500 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Nó
        </button>
        <button
          v-if="selectedNode"
          @click="deleteSelectedNode"
          class="px-4 py-2 bg-red-600 text-claude-text dark:text-white rounded-claude-md hover:bg-red-500 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Deletar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-primary dark:border-primary-500 mx-auto mb-4"></div>
        <p class="text-claude-text-secondary dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>

    <!-- Vue Flow Canvas -->
    <div v-else class="flex-1 relative">
      <VueFlow
        v-model="elements"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
        @nodes-change="handleNodesChange"
        @edges-change="handleEdgesChange"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
        class="bg-dark-800"
      >
        <Background pattern-color="#374151" :gap="16" />
        <Controls />
        <MiniMap />

        <template #node-custom="{ data }">
          <div
            :style="{ backgroundColor: data.color || '#ca643f' }"
            class="px-4 py-3 rounded-claude-md shadow-lg border-2 border-white/20 min-w-[150px] cursor-pointer hover:shadow-xl transition"
          >
            <div
              v-if="editingNodeId === data.id"
              class="relative"
            >
              <input
                ref="nodeInput"
                v-model="data.text"
                @blur="stopEditing"
                @keyup.enter="stopEditing"
                class="w-full bg-white/20 text-claude-text dark:text-white font-medium text-center border-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
                @click.stop
              >
            </div>
            <div v-else @dblclick="startEditing(data.id)" class="text-claude-text dark:text-white font-medium text-center">
              {{ data.text }}
            </div>
          </div>
        </template>
      </VueFlow>

      <!-- Panel Lateral (quando nó selecionado) -->
      <div
        v-if="selectedNode"
        class="absolute right-4 top-4 w-80 bg-dark-800 border border-dark-700 rounded-claude-lg p-6 shadow-2xl"
      >
        <h3 class="font-bold text-claude-text dark:text-white mb-4">Propriedades do Nó</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-400 mb-2">Texto</label>
            <input
              v-model="selectedNode.data.text"
              @input="debouncedSave"
              type="text"
              class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-3 py-2 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-400 mb-2">Cor</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="color in colors"
                :key="color"
                @click="changeNodeColor(color)"
                :style="{ backgroundColor: color }"
                :class="[
                  'w-8 h-8 rounded-claude-md border-2 transition',
                  selectedNode.data.color === color ? 'border-white scale-110' : 'border-transparent'
                ]"
              ></button>
            </div>
          </div>

          <div class="space-y-2">
            <button
              @click="addChildNode"
              class="w-full py-2 bg-primary-600 text-claude-text dark:text-white rounded-claude-md hover:bg-primary-500 transition flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Filho
            </button>
            <p class="text-xs text-center theme-text-tertiary">💡 Lembre-se de clicar em "Salvar" após fazer alterações</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-claude-md shadow-lg backdrop-blur-sm border flex items-center gap-3 min-w-[300px]',
            toast.type === 'success'
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 border-claude-primary dark:border-primary-500/50 text-primary-100'
              : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="flex-1 font-medium">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const loading = ref(true)
const saving = ref(false)
const title = ref('')
const lastSaved = ref('')
const elements = ref([])
const selectedNode = ref<any>(null)
const editingNodeId = ref<string | null>(null)
const nodeInput = ref<HTMLInputElement | null>(null)
const saveTimeout = ref<any>(null)

// Sistema de notificações toast
const toasts = ref<Array<{ id: number, message: string, type: 'success' | 'error' }>>([])
let toastIdCounter = 0

const colors = [
  '#ca643f', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#84cc16',
  '#f97316', '#14b8a6', '#a855f7', '#ef4444'
]

const { onNodeClick: onVueFlowNodeClick, onPaneClick: onVueFlowPaneClick, addNodes, addEdges, removeNodes, updateNode } = useVueFlow()

// Carregar mapa
const loadMindmap = async () => {
  console.log('[EDITOR] === INICIANDO CARREGAMENTO DO MAPA ===')
  console.log('[EDITOR] ID do mapa:', id)

  loading.value = true
  try {
    const { data, error } = await useFetch(`/api/mindmaps/${id}`)

    console.log('[EDITOR] Resposta recebida:')
    console.log('[EDITOR] - error:', error.value)
    console.log('[EDITOR] - data:', data.value)

    if (error.value) {
      console.error('[EDITOR] Erro na requisição:', error.value)
      throw new Error(error.value.message || 'Erro ao carregar')
    }

    if (data.value?.success) {
      const mindmap = data.value.data
      console.log('[EDITOR] Mindmap data:', mindmap)
      console.log('[EDITOR] Título:', mindmap.title)
      console.log('[EDITOR] Quantidade de nós:', mindmap.nodes?.length || 0)

      title.value = mindmap.title

      if (!mindmap.nodes || mindmap.nodes.length === 0) {
        console.warn('[EDITOR] ⚠️ Nenhum nó encontrado no mapa mental!')
        elements.value = []
        return
      }

      // Converter nós para formato Vue Flow
      console.log('[EDITOR] Convertendo nós para Vue Flow...')
      const nodes = mindmap.nodes.map((node: any) => {
        console.log('[EDITOR] Nó:', { id: node.id, text: node.text, position_x: node.position_x, position_y: node.position_y })
        return {
          id: node.id,
          type: 'custom',
          position: { x: node.position_x || 0, y: node.position_y || 0 },
          data: {
            id: node.id,
            text: node.text,
            color: node.color || '#ca643f',
            parent_id: node.parent_id
          }
        }
      })

      console.log('[EDITOR] Nós convertidos:', nodes.length)

      // Criar edges (conexões entre nós)
      const edges = mindmap.nodes
        .filter((node: any) => node.parent_id)
        .map((node: any) => ({
          id: `e-${node.parent_id}-${node.id}`,
          source: node.parent_id,
          target: node.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }))

      console.log('[EDITOR] Edges criadas:', edges.length)

      elements.value = [...nodes, ...edges] as any
      console.log('[EDITOR] Elements total:', elements.value.length)
      console.log('[EDITOR] ✅ Mapa carregado com sucesso!')
    }
  } catch (error: any) {
    console.error('[EDITOR] === ERRO AO CARREGAR MAPA ===')
    console.error('[EDITOR]', error)
    alert('Erro ao carregar mapa mental')
  } finally {
    loading.value = false
    console.log('[EDITOR] === FIM DO CARREGAMENTO ===')
  }
}

// Salvar título
const saveTitle = async () => {
  try {
    await $fetch(`/api/mindmaps/${id}`, {
      method: 'PUT',
      body: { title: title.value }
    })
  } catch (error) {
    console.error('Erro ao salvar título:', error)
  }
}

// Salvar nós
const saveNodes = async () => {
  console.log('[EDITOR] === SALVANDO MAPA MENTAL ===')
  saving.value = true
  try {
    const nodes = elements.value
      .filter((el: any) => el.type === 'custom')
      .map((node: any) => ({
        id: node.id,
        text: node.data.text,
        parent_id: node.data.parent_id || null,
        position_x: node.position.x,
        position_y: node.position.y,
        color: node.data.color
      }))

    console.log('[EDITOR] Salvando', nodes.length, 'nós...')

    await $fetch(`/api/mindmaps/${id}/nodes`, {
      method: 'POST',
      body: { nodes }
    })

    console.log('[EDITOR] ✅ Mapa salvo com sucesso!')
    lastSaved.value = 'agora mesmo'
    setTimeout(() => { lastSaved.value = '' }, 3000)

    showToast('Mapa mental salvo!', 'success')
  } catch (error: any) {
    console.error('[EDITOR] ❌ Erro ao salvar:', error)
    showToast(error.message || 'Erro ao salvar o mapa mental', 'error')
  } finally {
    saving.value = false
  }
}

// Debounced save
const debouncedSave = () => {
  if (saveTimeout.value) clearTimeout(saveTimeout.value)
  saveTimeout.value = setTimeout(() => {
    saveNodes()
  }, 2000)
}

// Adicionar nó
const addNode = () => {
  const newNode = {
    id: `node-${Date.now()}`,
    type: 'custom',
    position: {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    },
    data: {
      id: `node-${Date.now()}`,
      text: 'Nova Ideia',
      color: '#ca643f',
      parent_id: null
    }
  }

  addNodes([newNode])
  // Auto-save desabilitado - use o botão Salvar
}

// Adicionar nó filho
const addChildNode = () => {
  if (!selectedNode.value) return

  const parentPos = selectedNode.value.position
  const newNode = {
    id: `node-${Date.now()}`,
    type: 'custom',
    position: {
      x: parentPos.x + 250,
      y: parentPos.y + (Math.random() * 100 - 50)
    },
    data: {
      id: `node-${Date.now()}`,
      text: 'Subtópico',
      color: selectedNode.value.data.color,
      parent_id: selectedNode.value.id
    }
  }

  const newEdge = {
    id: `e-${selectedNode.value.id}-${newNode.id}`,
    source: selectedNode.value.id,
    target: newNode.id,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6366f1', strokeWidth: 2 }
  }

  addNodes([newNode])
  addEdges([newEdge])
  // Auto-save desabilitado - use o botão Salvar
}

// Deletar nó selecionado
const deleteSelectedNode = () => {
  if (!selectedNode.value) return

  removeNodes([selectedNode.value.id])
  selectedNode.value = null
  // Auto-save desabilitado - use o botão Salvar
}

// Mudar cor do nó
const changeNodeColor = (color: string) => {
  if (!selectedNode.value) return

  selectedNode.value.data.color = color
  updateNode(selectedNode.value.id, { data: selectedNode.value.data })
  // Auto-save desabilitado - use o botão Salvar
}

// Edição inline
const startEditing = (nodeId: string) => {
  editingNodeId.value = nodeId
  nextTick(() => {
    nodeInput.value?.focus()
  })
}

const stopEditing = () => {
  editingNodeId.value = null
  // Auto-save desabilitado - use o botão Salvar
}

// Eventos
const onNodeClick = (event: any) => {
  selectedNode.value = event.node
}

const onPaneClick = () => {
  selectedNode.value = null
}

const handleNodesChange = (changes: any) => {
  // Auto-save desabilitado - use o botão Salvar
}

const handleEdgesChange = (changes: any) => {
  // Edges changes handled automatically
}

// Toast
const showToast = (message: string, type: 'success' | 'error') => {
  const id = toastIdCounter++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Lifecycle
onMounted(() => {
  loadMindmap()
})

onBeforeUnmount(() => {
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value)
    saveNodes()
  }
})
</script>

<style scoped>
/* Animações dos toasts */
.toast-enter-active {
  animation: slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
