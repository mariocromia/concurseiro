<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <button
              @click="navigateTo('/mapa-mental')"
              class="text-gray-400 hover:text-white transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-3xl font-bold text-white">Biblioteca de Mapas</h1>
          </div>
          <p class="text-gray-400">{{ mindmaps.length }} {{ mindmaps.length === 1 ? 'mapa mental salvo' : 'mapas mentais salvos' }}</p>
        </div>
        <button
          @click="navigateTo('/mapa-mental')"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Criar Novo
        </button>
      </div>

      <!-- Barra de Busca -->
      <div class="mb-8">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar mapas mentais..."
            class="w-full bg-dark-800 border border-dark-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <!-- Lista de Mapas -->
      <div v-else-if="filteredMindmaps.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="mindmap in filteredMindmaps"
          :key="mindmap.id"
          class="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition group"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-white text-lg mb-1 group-hover:text-primary-400 transition line-clamp-2">
                {{ mindmap.title }}
              </h3>
              <p class="text-sm text-gray-400">
                {{ formatDate(mindmap.updated_at) }}
              </p>
            </div>
            <button
              @click="confirmDelete(mindmap)"
              class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <button
            @click="navigateTo(`/mapas-mentais/editor/${mindmap.id}`)"
            class="w-full py-2 bg-primary-600/10 text-primary-400 rounded-lg font-medium hover:bg-primary-600/20 transition flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar Mapa
          </button>
        </div>
      </div>

      <!-- Estado Vazio -->
      <div v-else class="text-center py-20">
        <div class="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">
          {{ searchQuery ? 'Nenhum mapa encontrado' : 'Nenhum mapa mental criado' }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ searchQuery ? 'Tente buscar com outros termos' : 'Crie seu primeiro mapa mental para começar' }}
        </p>
        <button
          v-if="!searchQuery"
          @click="navigateTo('/mapa-mental')"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Criar Primeiro Mapa
        </button>
      </div>
    </main>

    <!-- Modal de Confirmação de Delete -->
    <div v-if="mindmapToDelete" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click.self="mindmapToDelete = null">
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-8 max-w-md w-full">
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white text-center mb-2">Deletar Mapa Mental?</h3>
        <p class="text-gray-400 text-center mb-6">
          Tem certeza que deseja deletar "<span class="text-white font-semibold">{{ mindmapToDelete.title }}</span>"? Esta ação não pode ser desfeita.
        </p>
        <div class="flex gap-4">
          <button
            @click="deleteMindmap"
            :disabled="deleting"
            class="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="deleting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ deleting ? 'Deletando...' : 'Sim, Deletar' }}</span>
          </button>
          <button
            @click="mindmapToDelete = null"
            :disabled="deleting"
            class="flex-1 py-3 bg-dark-700 text-gray-300 rounded-lg font-semibold hover:bg-dark-600 transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const searchQuery = ref('')
const loading = ref(true)
const deleting = ref(false)
const mindmaps = ref<any[]>([])
const mindmapToDelete = ref<any>(null)

// Buscar mapas
const fetchMindmaps = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/api/mindmaps')
    if (data.value?.success) {
      mindmaps.value = data.value.data || []
    }
  } catch (error) {
    console.error('Erro ao buscar mapas:', error)
  } finally {
    loading.value = false
  }
}

// Mapas filtrados
const filteredMindmaps = computed(() => {
  if (!searchQuery.value.trim()) return mindmaps.value

  const query = searchQuery.value.toLowerCase()
  return mindmaps.value.filter(m =>
    m.title.toLowerCase().includes(query)
  )
})

// Confirmar delete
const confirmDelete = (mindmap: any) => {
  mindmapToDelete.value = mindmap
}

// Deletar mapa
const deleteMindmap = async () => {
  if (!mindmapToDelete.value) return

  deleting.value = true
  try {
    const { error } = await useFetch(`/api/mindmaps/${mindmapToDelete.value.id}`, {
      method: 'DELETE'
    })

    if (error.value) {
      throw new Error(error.value.message || 'Erro ao deletar')
    }

    // Remover da lista
    mindmaps.value = mindmaps.value.filter(m => m.id !== mindmapToDelete.value.id)
    mindmapToDelete.value = null
  } catch (error: any) {
    alert('Erro ao deletar mapa: ' + error.message)
  } finally {
    deleting.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchMindmaps()
})
</script>
