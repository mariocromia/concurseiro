<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Header -->
    <header class="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">Relatórios de Estudo</h1>
              <p class="text-sm text-gray-400">Análise completa do seu desempenho</p>
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
      <!-- Filtro de Período -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 mb-6">
        <div class="flex items-center gap-4 flex-wrap">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              selectedPeriod === period.value
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            ]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Cards de Estatísticas Gerais -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-400 text-sm">Tempo Total</span>
            <div class="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ stats.totalHours }}</div>
          <div class="text-xs text-gray-500">{{ stats.totalMinutes }} minutos</div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-400 text-sm">Média Diária</span>
            <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ stats.dailyAverage }}</div>
          <div class="text-xs text-gray-500">horas por dia</div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-400 text-sm">Total de Questões</span>
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ stats.totalQuestions }}</div>
          <div class="text-xs text-gray-500">questões resolvidas</div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-400 text-sm">Taxa de Acerto</span>
            <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ stats.successRate }}%</div>
          <div class="text-xs text-gray-500">média geral</div>
        </div>
      </div>

      <!-- Tempo por Matéria -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          Tempo por Matéria
        </h2>

        <div v-if="bySubject.length === 0" class="text-center py-8 text-gray-400">
          Nenhum dado disponível para o período selecionado
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in bySubject"
            :key="item.subject"
            class="bg-dark-900 border border-dark-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: item.color || '#22C55E' }"
                ></div>
                <span class="font-medium text-white">{{ item.subject }}</span>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-primary-400">{{ formatHours(item.minutes) }}</div>
                <div class="text-xs text-gray-500">{{ item.sessions }} sessões</div>
              </div>
            </div>

            <!-- Barra de progresso -->
            <div class="w-full bg-dark-800 rounded-full h-2">
              <div
                class="bg-primary-500 h-2 rounded-full transition-all"
                :style="{ width: `${(item.minutes / maxMinutes) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desempenho em Questões -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          Desempenho em Questões por Matéria
        </h2>

        <div v-if="questionsBySubject.length === 0" class="text-center py-8 text-gray-400">
          Nenhuma questão resolvida no período selecionado
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in questionsBySubject"
            :key="item.subject"
            class="bg-dark-900 border border-dark-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: item.color || '#22C55E' }"
                ></div>
                <span class="font-medium text-white">{{ item.subject }}</span>
              </div>
              <div class="text-2xl font-bold" :class="item.rate >= 70 ? 'text-green-400' : item.rate >= 50 ? 'text-yellow-400' : 'text-red-400'">
                {{ item.rate }}%
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-sm">
              <div class="bg-dark-800 rounded p-2">
                <div class="text-xs text-gray-400">Total</div>
                <div class="font-semibold text-white">{{ item.total }}</div>
              </div>
              <div class="bg-dark-800 rounded p-2">
                <div class="text-xs text-gray-400">Acertos</div>
                <div class="font-semibold text-green-400">{{ item.correct }}</div>
              </div>
              <div class="bg-dark-800 rounded p-2">
                <div class="text-xs text-gray-400">Erros</div>
                <div class="font-semibold text-red-400">{{ item.wrong }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipos de Estudo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">📖 Conteúdo</h3>
          <div class="text-4xl font-bold text-primary-400 mb-2">{{ formatHours(studyTypes.conteudo) }}</div>
          <div class="text-sm text-gray-400">{{ studyTypes.conteudoSessions }} sessões</div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">📝 Questões</h3>
          <div class="text-4xl font-bold text-primary-400 mb-2">{{ formatHours(studyTypes.questoes) }}</div>
          <div class="text-sm text-gray-400">{{ studyTypes.questoesSessions }} sessões</div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">🔄 Revisão</h3>
          <div class="text-4xl font-bold text-primary-400 mb-2">{{ formatHours(studyTypes.revisao) }}</div>
          <div class="text-sm text-gray-400">{{ studyTypes.revisaoSessions }} sessões</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const selectedPeriod = ref('30days')
const periods = [
  { label: '7 dias', value: '7days' },
  { label: '30 dias', value: '30days' },
  { label: '90 dias', value: '90days' },
  { label: 'Todo período', value: 'all' }
]

const stats = ref({
  totalHours: '0h',
  totalMinutes: 0,
  dailyAverage: '0h',
  totalQuestions: 0,
  successRate: 0
})

const bySubject = ref<any[]>([])
const questionsBySubject = ref<any[]>([])
const studyTypes = ref({
  conteudo: 0,
  conteudoSessions: 0,
  questoes: 0,
  questoesSessions: 0,
  revisao: 0,
  revisaoSessions: 0
})

const maxMinutes = computed(() => {
  return Math.max(...bySubject.value.map(s => s.minutes), 1)
})

const formatHours = (minutes: number) => {
  if (!minutes) return '0h'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

const loadReports = async () => {
  if (!user.value) return

  const today = new Date()
  let startDate = new Date()

  if (selectedPeriod.value === '7days') {
    startDate.setDate(today.getDate() - 7)
  } else if (selectedPeriod.value === '30days') {
    startDate.setDate(today.getDate() - 30)
  } else if (selectedPeriod.value === '90days') {
    startDate.setDate(today.getDate() - 90)
  } else {
    startDate = new Date('2000-01-01')
  }

  const { data: sessions } = await supabase
    .from('study_schedules')
    .select('*, subjects(name, color)')
    .eq('user_id', user.value.id)
    .eq('status', 'completed')
    .gte('scheduled_date', startDate.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: false })

  if (!sessions || sessions.length === 0) {
    resetStats()
    return
  }

  // Estatísticas gerais
  let totalMinutes = 0
  let totalQuestions = 0
  let totalCorrect = 0

  const subjectMap = new Map<string, any>()
  const questionMap = new Map<string, any>()
  const typeMinutes = { conteudo: 0, questoes: 0, revisao: 0 }
  const typeSessions = { conteudo: 0, questoes: 0, revisao: 0 }

  sessions.forEach(session => {
    const minutes = session.actual_duration || session.planned_duration || 0
    totalMinutes += minutes

    // Por tipo
    typeMinutes[session.study_type] += minutes
    typeSessions[session.study_type]++

    // Por matéria
    const subjectName = session.subjects?.name || 'Sem matéria'
    const subjectColor = session.subjects?.color || '#22C55E'
    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, { subject: subjectName, color: subjectColor, minutes: 0, sessions: 0 })
    }
    const subjectData = subjectMap.get(subjectName)
    subjectData.minutes += minutes
    subjectData.sessions++

    // Questões
    if (session.study_type === 'questoes' && session.completed_questions) {
      totalQuestions += session.completed_questions
      totalCorrect += session.correct_questions || 0

      if (!questionMap.has(subjectName)) {
        questionMap.set(subjectName, { subject: subjectName, color: subjectColor, total: 0, correct: 0, wrong: 0, rate: 0 })
      }
      const qData = questionMap.get(subjectName)
      qData.total += session.completed_questions
      qData.correct += session.correct_questions || 0
    }
  })

  // Calcular médias
  const days = selectedPeriod.value === 'all' ? 30 : parseInt(selectedPeriod.value)
  const dailyAvg = totalMinutes / days
  const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  stats.value = {
    totalHours: formatHours(totalMinutes),
    totalMinutes,
    dailyAverage: formatHours(Math.round(dailyAvg)),
    totalQuestions,
    successRate
  }

  bySubject.value = Array.from(subjectMap.values()).sort((a, b) => b.minutes - a.minutes)

  questionsBySubject.value = Array.from(questionMap.values()).map(item => {
    item.wrong = item.total - item.correct
    item.rate = Math.round((item.correct / item.total) * 100)
    return item
  }).sort((a, b) => b.total - a.total)

  studyTypes.value = {
    conteudo: typeMinutes.conteudo,
    conteudoSessions: typeSessions.conteudo,
    questoes: typeMinutes.questoes,
    questoesSessions: typeSessions.questoes,
    revisao: typeMinutes.revisao,
    revisaoSessions: typeSessions.revisao
  }
}

const resetStats = () => {
  stats.value = { totalHours: '0h', totalMinutes: 0, dailyAverage: '0h', totalQuestions: 0, successRate: 0 }
  bySubject.value = []
  questionsBySubject.value = []
  studyTypes.value = { conteudo: 0, conteudoSessions: 0, questoes: 0, questoesSessions: 0, revisao: 0, revisaoSessions: 0 }
}

watch(selectedPeriod, () => {
  loadReports()
})

onMounted(() => {
  loadReports()
})
</script>
