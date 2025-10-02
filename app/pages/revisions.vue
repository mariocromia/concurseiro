<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Header -->
    <header class="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-white">Revisões</h1>
        <NuxtLink to="/dashboard" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Voltar ao Dashboard</NuxtLink>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Matéria</label>
            <select v-model="filterSubjectId" @change="loadRevisions" class="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white">
              <option value="all">Todas</option>
              <option v-for="(name, id) in subjectsMap" :key="id" :value="id">{{ name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Status</label>
            <select v-model="filterStatus" @change="loadRevisions" class="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white">
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
              <option value="skipped">Puladas</option>
              <option value="all">Todas</option>
            </select>
          </div>
          <div class="md:col-span-2 flex items-end">
            <label class="inline-flex items-center">
              <input type="checkbox" v-model="onlyUntilToday" @change="loadRevisions" class="mr-2" />
              <span class="text-gray-300">Mostrar apenas até hoje</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <p class="text-sm text-gray-400 mb-1">Pendentes</p>
          <p class="text-3xl font-bold text-white">{{ stats.pending }}</p>
        </div>
        <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <p class="text-sm text-gray-400 mb-1">Concluídas</p>
          <p class="text-3xl font-bold text-white">{{ stats.completed }}</p>
        </div>
        <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <p class="text-sm text-gray-400 mb-1">Puladas</p>
          <p class="text-3xl font-bold text-white">{{ stats.skipped }}</p>
        </div>
      </div>

      <!-- List -->
      <div class="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div class="p-4 border-b border-dark-700 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-white">Revisões</h2>
          <div v-if="loading" class="text-gray-400">Carregando...</div>
        </div>
        <div v-if="error" class="p-4 text-red-400">{{ error }}</div>
        <table class="min-w-full">
          <thead>
            <tr class="bg-dark-900">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Matéria</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revisão</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-700">
            <tr v-for="rev in revisions" :key="rev.id" class="hover:bg-dark-900/50">
              <td class="px-4 py-3 text-gray-200">{{ formatDate(rev.scheduled_date) }}</td>
              <td class="px-4 py-3 text-gray-200">{{ subjectsMap[rev.subject_id] || '—' }}</td>
              <td class="px-4 py-3 text-gray-200">R{{ rev.revision_number }}</td>
              <td class="px-4 py-3">
                <span :class="statusClass(rev.status)" class="px-2 py-1 rounded text-xs font-medium">{{ statusLabel(rev.status) }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="markCompleted(rev)" :disabled="rev.status !== 'pending'" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50">Concluir</button>
                  <button @click="skipRevision(rev)" :disabled="rev.status !== 'pending'" class="px-3 py-1 border border-dark-700 text-gray-200 rounded hover:bg-dark-700 disabled:opacity-50">Pular</button>
                  <button @click="postponeOneDay(rev)" :disabled="rev.status !== 'pending'" class="px-3 py-1 border border-dark-700 text-gray-200 rounded hover:bg-dark-700 disabled:opacity-50">Adiar +1 dia</button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && revisions.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-gray-400">Nenhuma revisão encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

// State
const revisions = ref<Array<{ id: string, subject_id: string, revision_number: number, scheduled_date: string, status: 'pending' | 'completed' | 'skipped', completed_at?: string | null }>>([])
const subjectsMap = reactive<Record<string, string>>({})
const filterSubjectId = ref<string>('all')
const filterStatus = ref<'pending' | 'completed' | 'skipped' | 'all'>('pending')
const onlyUntilToday = ref(true)
const loading = ref(false)
const error = ref('')

const stats = reactive({ pending: 0, completed: 0, skipped: 0 })

onMounted(async () => {
  await loadSubjectsMap()
  await loadRevisions()
})

const loadSubjectsMap = async () => {
  if (!user.value) return
  const { data } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('user_id', user.value.id)
  ;(data || []).forEach((s: any) => { subjectsMap[s.id] = s.name })
}

const loadRevisions = async () => {
  try {
    loading.value = true
    error.value = ''
    if (!user.value) return

    let query = supabase
      .from('revisions')
      .select('id, subject_id, revision_number, scheduled_date, status, completed_at')
      .eq('user_id', user.value.id)

    if (filterStatus.value !== 'all') query = query.eq('status', filterStatus.value)
    if (filterSubjectId.value !== 'all') query = query.eq('subject_id', filterSubjectId.value)
    if (onlyUntilToday.value) query = query.lte('scheduled_date', new Date().toISOString())

    const { data, error: err } = await query.order('scheduled_date', { ascending: true })
    if (err) throw err
    revisions.value = data || []

    // Atualizar estatísticas rápidas
    stats.pending = revisions.value.filter(r => r.status === 'pending').length
    stats.completed = revisions.value.filter(r => r.status === 'completed').length
    stats.skipped = revisions.value.filter(r => r.status === 'skipped').length
  } catch (e: any) {
    error.value = e.message || 'Erro ao carregar revisões.'
  } finally {
    loading.value = false
  }
}

const markCompleted = async (rev: any) => {
  try {
    await supabase
      .from('revisions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', rev.id)
    await loadRevisions()
  } catch (e: any) {
    error.value = e.message || 'Erro ao concluir revisão.'
  }
}

const skipRevision = async (rev: any) => {
  try {
    await supabase
      .from('revisions')
      .update({ status: 'skipped' })
      .eq('id', rev.id)
    await loadRevisions()
  } catch (e: any) {
    error.value = e.message || 'Erro ao pular revisão.'
  }
}

const postponeOneDay = async (rev: any) => {
  try {
    const newDate = new Date(rev.scheduled_date)
    newDate.setDate(newDate.getDate() + 1)
    await supabase
      .from('revisions')
      .update({ scheduled_date: newDate.toISOString() })
      .eq('id', rev.id)
    await loadRevisions()
  } catch (e: any) {
    error.value = e.message || 'Erro ao adiar revisão.'
  }
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusLabel = (s: 'pending' | 'completed' | 'skipped') => {
  return s === 'pending' ? 'Pendente' : s === 'completed' ? 'Concluída' : 'Pulada'
}

const statusClass = (s: 'pending' | 'completed' | 'skipped') => {
  return s === 'pending'
    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
    : s === 'completed'
    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
    : 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
}
</script>