<template>
  <div class="min-h-screen bg-dark-900 text-white p-8">
    <h1 class="text-2xl font-bold mb-8">Teste de Drag and Drop</h1>
    
    <div class="max-w-md">
      <h2 class="text-lg mb-4">Lista Simples</h2>
      <draggable
        v-model="items"
        @start="onStart"
        @end="onEnd"
        @change="onChange"
        item-key="id"
        handle=".handle"
        :forceFallback="true"
        class="space-y-2"
      >
        <template #item="{ element: item }">
          <div class="flex items-center p-3 bg-dark-800 rounded border">
            <div class="handle cursor-move mr-3 text-gray-400">
              ⋮⋮
            </div>
            <span>{{ item.name }}</span>
          </div>
        </template>
      </draggable>
    </div>

    <div class="mt-8">
      <h3 class="text-lg mb-2">Logs:</h3>
      <div class="bg-dark-800 p-4 rounded max-h-40 overflow-y-auto">
        <div v-for="log in logs" :key="log.id" class="text-sm text-gray-300">
          {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
  { id: 4, name: 'Item 4' }
])

const logs = ref<Array<{ id: number, message: string }>>([])
let logId = 0

const addLog = (message: string) => {
  logs.value.unshift({
    id: logId++,
    message: `${new Date().toLocaleTimeString()}: ${message}`
  })
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const onStart = () => {
  addLog('🚀 Drag iniciado')
}

const onEnd = () => {
  addLog('✅ Drag finalizado')
  addLog(`📋 Nova ordem: ${items.value.map(i => i.name).join(', ')}`)
}

const onChange = (evt: any) => {
  addLog(`📝 Mudança detectada: ${JSON.stringify(evt)}`)
}

onMounted(() => {
  addLog('🎯 Página carregada - teste de drag disponível')
})
</script>