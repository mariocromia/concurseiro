<template>
  <div class="min-h-screen bg-dark-900 text-white p-8">
    <h1 class="text-3xl font-bold mb-8">🧪 Teste de Drag & Drop</h1>

    <div class="mb-8 p-4 bg-dark-800 rounded-lg">
      <h2 class="text-xl font-bold mb-4">Status:</h2>
      <div class="space-y-2 text-sm font-mono">
        <div>✅ Sortable disponível: {{ isSortableAvailable }}</div>
        <div>✅ Items totais: {{ items.length }}</div>
        <div>✅ Lista ref: {{ listRef ? 'OK' : 'NULL' }}</div>
      </div>
    </div>

    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">📋 Lista Arrastável</h2>
      <p class="text-sm text-gray-400 mb-4">
        Clique e arraste os ícones de 3 pontos para reordenar
      </p>
    </div>

    <!-- Lista com Sortable -->
    <div ref="listRef" class="space-y-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 p-4 bg-dark-800 border border-dark-700 rounded-lg hover:border-primary-500 transition-all group"
      >
        <!-- Drag Handle -->
        <svg
          class="w-5 h-5 text-gray-500 hover:text-primary-400 cursor-grab active:cursor-grabbing drag-handle transition-all hover:scale-110"
          fill="currentColor"
          viewBox="0 0 20 20"
          title="Arrastar para reordenar"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>

        <!-- Content -->
        <div class="flex-1">
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-sm text-gray-500">ID: {{ item.id }}</div>
        </div>

        <!-- Order -->
        <div class="text-sm text-primary-400 font-mono">
          #{{ item.order }}
        </div>
      </div>
    </div>

    <!-- Console Log -->
    <div class="mt-8 p-4 bg-dark-800 rounded-lg">
      <h3 class="text-lg font-bold mb-2">📝 Log de Eventos:</h3>
      <div class="space-y-1 text-xs font-mono text-gray-400 max-h-64 overflow-y-auto">
        <div v-for="(log, i) in logs" :key="i">{{ log }}</div>
        <div v-if="logs.length === 0" class="text-gray-600">Nenhum evento ainda...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSortable } from '~/composables/useSortable'

const logs = ref<string[]>([])

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  if (logs.value.length > 20) logs.value.pop()
  console.log(message)
}

// Sample items
const items = ref([
  { id: 1, name: 'Item 1', order: 1 },
  { id: 2, name: 'Item 2', order: 2 },
  { id: 3, name: 'Item 3', order: 3 },
  { id: 4, name: 'Item 4', order: 4 },
  { id: 5, name: 'Item 5', order: 5 }
])

const onDragStart = () => {
  addLog('🎯 Drag iniciado!')
}

const onDragEnd = () => {
  addLog('✅ Drag finalizado!')
  // Update order
  items.value.forEach((item, index) => {
    item.order = index + 1
  })
  addLog(`📋 Nova ordem: ${items.value.map(i => i.name).join(', ')}`)
}

// Initialize sortable
const listRef = ref<HTMLElement | null>(null)
const isSortableAvailable = ref(false)

onMounted(() => {
  addLog('✅ Página carregada')
  addLog(`✅ Lista ref: ${listRef.value ? 'OK' : 'NULL'}`)

  // Verificar se sortable foi inicializado
  setTimeout(() => {
    isSortableAvailable.value = !!listRef.value
    addLog(`✅ Sortable disponível: ${isSortableAvailable.value}`)
  }, 100)
})

useSortable(listRef, items, {
  handle: '.drag-handle',
  animation: 200,
  ghostClass: 'opacity-50 bg-primary-500/30',
  chosenClass: 'shadow-2xl scale-105',
  onStart: onDragStart,
  onEnd: onDragEnd
})
</script>

<style scoped>
.drag-handle {
  cursor: grab !important;
}

.drag-handle:active {
  cursor: grabbing !important;
}

.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  transform: scale(1.05);
}
</style>
