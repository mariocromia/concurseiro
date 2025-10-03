<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Header -->
    <header class="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">Gestão de Matérias</h1>
              <p class="text-sm text-gray-400">Organize e gerencie suas matérias de estudo</p>
            </div>
          </div>
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center px-4 py-2 border border-dark-700 rounded-lg text-gray-300 bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Voltar
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Add/Edit Form -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 mb-8">
        <h2 class="text-lg font-semibold text-white mb-4">
          {{ form.id ? 'Editar Matéria' : 'Adicionar Nova Matéria' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-2">Nome da matéria</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Direito Administrativo"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Cor</label>
            <select
              v-model="form.color"
              class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="#22C55E">🟢 Verde</option>
              <option value="#3B82F6">🔵 Azul</option>
              <option value="#10B981">🟢 Verde Escuro</option>
              <option value="#EF4444">🔴 Vermelho</option>
              <option value="#F59E0B">🟡 Amarelo</option>
              <option value="#8B5CF6">🟣 Roxo</option>
              <option value="#EC4899">🩷 Rosa</option>
              <option value="#F97316">🟠 Laranja</option>
              <option value="#6B7280">⚫ Cinza</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              type="submit"
              :disabled="loading"
              class="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Salvando...' : (form.id ? 'Atualizar' : 'Adicionar') }}
            </button>
          </div>
        </form>

        <div v-if="form.id" class="mt-4 flex justify-end">
          <button
            @click="cancelEdit"
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancelar edição
          </button>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {{ error }}
        </div>

        <div v-if="loading" class="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg text-primary-400 text-sm">
          Salvando matéria...
        </div>
      </div>

      <!-- Subjects List -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-dark-700">
          <h2 class="text-lg font-semibold text-white">Suas Matérias</h2>
          <p class="text-sm text-gray-400 mt-1">{{ subjects.length }} matéria(s) cadastrada(s)</p>
        </div>

        <div v-if="subjects.length === 0" class="p-8 text-center">
          <div class="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-white mb-2">Nenhuma matéria cadastrada</h3>
          <p class="text-gray-400">Adicione sua primeira matéria usando o formulário acima.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-dark-700">
            <thead class="bg-dark-900/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button @click="toggleSort('name')" class="flex items-center gap-1 hover:text-white transition">
                    Matéria
                    <svg v-if="sortField === 'name'" class="w-4 h-4" :class="{ 'rotate-180': sortOrder === 'desc' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </button>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button @click="toggleSort('time')" class="flex items-center gap-1 hover:text-white transition">
                    Tempo Total
                    <svg v-if="sortField === 'time'" class="w-4 h-4" :class="{ 'rotate-180': sortOrder === 'desc' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </button>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button @click="toggleSort('sessions')" class="flex items-center gap-1 hover:text-white transition">
                    Sessões
                    <svg v-if="sortField === 'sessions'" class="w-4 h-4" :class="{ 'rotate-180': sortOrder === 'desc' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </button>
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-700">
              <tr v-for="subject in sortedSubjects" :key="subject.id" class="hover:bg-dark-700/50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span
                      class="w-4 h-4 rounded-full mr-3"
                      :style="{ backgroundColor: subject.color || '#22C55E' }"
                    ></span>
                    <div>
                      <div class="text-sm font-medium text-white">{{ subject.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDuration(subject.total_study_time) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ sessionsCountBySubject[subject.id] || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editSubject(subject)"
                    class="text-primary-400 hover:text-primary-300 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(subject)"
                    class="text-red-400 hover:text-red-300"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal de Confirmação de Exclusão -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="cancelDelete"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Confirmar Exclusão</h3>
            <p class="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        <p class="text-gray-300 mb-6">
          Tem certeza que deseja excluir a matéria
          <span class="font-semibold text-white">"{{ subjectToDelete?.name }}"</span>?
        </p>

        <div class="flex gap-3">
          <button
            @click="cancelDelete"
            class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="deleteSubject"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Excluindo...' : 'Excluir' }}
          </button>
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
            'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border flex items-center gap-3 min-w-[300px]',
            toast.type === 'success'
              ? 'bg-primary-500/20 border-primary-500/50 text-primary-100'
              : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5 text-primary-400 flex-shrink-0"
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
definePageMeta({ middleware: 'auth' })
import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const subjects = ref<Array<{ id: string, name: string, color?: string, total_study_time: number }>>([])
const sessionsCountBySubject = reactive<Record<string, number>>({})
const form = ref<{ id?: string, name: string, color?: string }>({ name: '', color: '#22C55E' })
const loading = ref(false)
const error = ref('')

// Sorting
const sortField = ref<'name' | 'time' | 'sessions'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Modal de confirmação de exclusão
const showDeleteModal = ref(false)
const subjectToDelete = ref<{ id: string, name: string } | null>(null)

// Sistema de notificações toast
const toasts = ref<Array<{ id: number, message: string, type: 'success' | 'error' }>>([])
let toastIdCounter = 0

// Computed sorted subjects
const sortedSubjects = computed(() => {
  const sorted = [...subjects.value]

  sorted.sort((a, b) => {
    let compareA: any, compareB: any

    if (sortField.value === 'name') {
      compareA = a.name.toLowerCase()
      compareB = b.name.toLowerCase()
    } else if (sortField.value === 'time') {
      compareA = a.total_study_time || 0
      compareB = b.total_study_time || 0
    } else if (sortField.value === 'sessions') {
      compareA = sessionsCountBySubject[a.id] || 0
      compareB = sessionsCountBySubject[b.id] || 0
    }

    if (sortOrder.value === 'asc') {
      return compareA > compareB ? 1 : -1
    } else {
      return compareA < compareB ? 1 : -1
    }
  })

  return sorted
})

const toggleSort = (field: 'name' | 'time' | 'sessions') => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

onMounted(async () => {
  await loadSubjects()
})

const loadSubjects = async () => {
  try {
    // Obter userId da sessão
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = user.value?.id || sessionData?.session?.user?.id

    console.log('=== DEBUG LOAD SUBJECTS ===')
    console.log('user.value:', user.value)
    console.log('userId:', userId)

    if (!userId) {
      console.warn('Nenhum usuário autenticado ao carregar matérias')
      return
    }

    const { data, error: err } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (err) throw err
    subjects.value = data || []

    // Carregar contagem de sessões por matéria
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('subject_id')
      .eq('user_id', userId)

    const counts: Record<string, number> = {}
    ;(sessions || []).forEach((s: any) => {
      const sid = s.subject_id || 'none'
      counts[sid] = (counts[sid] || 0) + 1
    })
    // Mapear apenas ids válidos
    subjects.value.forEach(s => { sessionsCountBySubject[s.id] = counts[s.id] || 0 })
  } catch (e: any) {
    console.error('Erro ao carregar matérias:', e)
    error.value = e.message || 'Erro ao carregar matérias'
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    // Obter userId da sessão
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = user.value?.id || sessionData?.session?.user?.id

    console.log('=== DEBUG SUBJECTS ===')
    console.log('user.value:', user.value)
    console.log('userId final:', userId)

    if (!userId) {
      error.value = 'ID do usuário não encontrado. Faça logout e login novamente.'
      return
    }

    if (!form.value.name.trim()) {
      error.value = 'Nome da matéria é obrigatório'
      return
    }

    console.log('Salvando matéria:', {
      user_id: userId,
      name: form.value.name,
      color: form.value.color
    })

    if (form.value.id) {
      const { error: err } = await supabase
        .from('subjects')
        .update({ name: form.value.name, color: form.value.color })
        .eq('id', form.value.id)
      if (err) {
        console.error('Erro ao atualizar:', err)
        throw err
      }
    } else {
      const { data, error: err } = await supabase
        .from('subjects')
        .insert({
          user_id: userId,
          name: form.value.name.trim(),
          color: form.value.color || '#22C55E'
        })
        .select()

      if (err) {
        console.error('Erro ao inserir:', err)
        throw err
      }
      console.log('Matéria criada:', data)
    }

    form.value = { name: '', color: '#22C55E' }
    await loadSubjects()
    showToast(form.value.id ? 'Matéria atualizada com sucesso!' : 'Matéria adicionada com sucesso!', 'success')
  } catch (e: any) {
    console.error('Erro completo:', e)
    error.value = e.message || 'Erro ao salvar matéria'
    showToast(e.message || 'Erro ao salvar matéria', 'error')
  } finally {
    loading.value = false
  }
}

const editSubject = (s: any) => {
  form.value = { id: s.id, name: s.name, color: s.color }
}

const cancelEdit = () => {
  form.value = { name: '', color: '#22C55E' }
}

const confirmDelete = (subject: any) => {
  subjectToDelete.value = { id: subject.id, name: subject.name }
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  subjectToDelete.value = null
}

const deleteSubject = async () => {
  if (!subjectToDelete.value) return

  try {
    loading.value = true
    error.value = ''
    const { error: err } = await supabase.from('subjects').delete().eq('id', subjectToDelete.value.id)
    if (err) throw err
    await loadSubjects()
    showToast('Matéria excluída com sucesso!', 'success')
    showDeleteModal.value = false
    subjectToDelete.value = null
  } catch (e: any) {
    error.value = e.message || 'Erro ao excluir matéria'
    showToast(e.message || 'Erro ao excluir matéria', 'error')
  } finally {
    loading.value = false
  }
}

const showToast = (message: string, type: 'success' | 'error') => {
  const id = toastIdCounter++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}
</script>

<style scoped>
/* Animação do modal */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

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