<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const debugInfo = ref<any>({})
const loading = ref(false)

const runDebug = async () => {
  loading.value = true
  debugInfo.value = {}

  try {
    // Aguardar usuário estar disponível
    if (!user.value) {
      console.log('Aguardando usuário...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!user.value?.id) {
      debugInfo.value.error = 'Usuário não autenticado'
      loading.value = false
      return
    }

    // 1. Verificar usuário
    debugInfo.value.user = {
      id: user.value.id,
      email: user.value.email,
    }

    // 2. Buscar sessões
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.value!.id)
      .order('created_at', { ascending: false })
      .limit(10)

    debugInfo.value.sessions = {
      count: sessions?.length || 0,
      data: sessions,
      error: sessionsError?.message
    }

    // 3. Calcular totais
    if (sessions && sessions.length > 0) {
      const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      debugInfo.value.totals = {
        totalSeconds,
        totalMinutes: Math.floor(totalSeconds / 60),
        totalHours: (totalSeconds / 3600).toFixed(2)
      }
    }

    // 4. Buscar matérias
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, color')
      .eq('user_id', user.value!.id)

    debugInfo.value.subjects = subjects

    // 5. Buscar question_attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', user.value!.id)
      .limit(10)

    debugInfo.value.questionAttempts = {
      count: attempts?.length || 0,
      data: attempts,
      error: attemptsError?.message
    }

    // 6. Testar query do useReports
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentSessions } = await supabase
      .from('study_sessions')
      .select('*, subjects(name, color)')
      .eq('user_id', user.value!.id)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .order('started_at', { ascending: true })

    debugInfo.value.recentSessions = {
      count: recentSessions?.length || 0,
      data: recentSessions
    }

  } catch (e: any) {
    debugInfo.value.error = e.message
  } finally {
    loading.value = false
  }
}

// Aguardar usuário estar disponível antes de executar
watchEffect(() => {
  if (user.value?.id && !debugInfo.value.user) {
    console.log('✅ Usuário disponível, executando debug...')
    runDebug()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔍 Debug de Relatórios
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Diagnóstico completo do sistema de relatórios
            </p>
          </div>
          <button
            @click="runDebug"
            :disabled="loading"
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">🔄 Atualizando...</span>
            <span v-else>🔄 Atualizar</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
      </div>

      <!-- Resultados -->
      <div v-else-if="Object.keys(debugInfo).length > 0" class="space-y-6">
        <!-- Usuário -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">👤</span> Usuário Logado
          </h2>
          <div class="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 font-mono text-sm">
            <div><strong>ID:</strong> {{ debugInfo.user?.id }}</div>
            <div><strong>Email:</strong> {{ debugInfo.user?.email }}</div>
          </div>
        </div>

        <!-- Sessões de Estudo -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">⏱️</span> Sessões de Estudo
          </h2>

          <div v-if="debugInfo.sessions?.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            ❌ Erro: {{ debugInfo.sessions.error }}
          </div>

          <div v-else-if="debugInfo.sessions?.count === 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400">
            ⚠️ Nenhuma sessão encontrada! Use o cronômetro em /study e tente novamente.
          </div>

          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ debugInfo.sessions?.count }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Total de sessões</div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ debugInfo.totals?.totalMinutes }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Minutos totais</div>
              </div>
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ debugInfo.totals?.totalHours }}h</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Horas totais</div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-200 dark:border-dark-600">
                  <tr class="text-left">
                    <th class="pb-2 font-semibold">Data</th>
                    <th class="pb-2 font-semibold">Duração</th>
                    <th class="pb-2 font-semibold">Segundos</th>
                    <th class="pb-2 font-semibold">Subject ID</th>
                  </tr>
                </thead>
                <tbody class="font-mono text-xs">
                  <tr v-for="session in debugInfo.sessions?.data" :key="session.id" class="border-b border-gray-100 dark:border-dark-600">
                    <td class="py-2">{{ new Date(session.started_at).toLocaleString('pt-BR') }}</td>
                    <td class="py-2">{{ Math.floor(session.duration / 60) }} min</td>
                    <td class="py-2 text-gray-500">{{ session.duration }}s</td>
                    <td class="py-2 text-gray-500 truncate max-w-xs">{{ session.subject_id || 'null' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Query do useReports (últimos 30 dias) -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">📊</span> Query useReports (30 dias)
          </h2>

          <div v-if="debugInfo.recentSessions?.count === 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400">
            ⚠️ Nenhuma sessão nos últimos 30 dias
          </div>

          <div v-else class="space-y-4">
            <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ debugInfo.recentSessions?.count }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Sessões encontradas (query do relatório)</div>
            </div>

            <div class="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
              <div v-for="session in debugInfo.recentSessions?.data" :key="session.id" class="border-b border-gray-200 dark:border-dark-600 pb-2">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-semibold">{{ new Date(session.started_at).toLocaleDateString('pt-BR') }}</span>
                    <span class="text-gray-500 text-sm ml-2">{{ new Date(session.started_at).toLocaleTimeString('pt-BR') }}</span>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-primary-600">{{ Math.floor(session.duration / 60) }} min</div>
                    <div class="text-xs text-gray-500">{{ session.subjects?.name || 'Sem matéria' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questões -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">📝</span> Tentativas de Questões
          </h2>

          <div v-if="debugInfo.questionAttempts?.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            ❌ Erro: {{ debugInfo.questionAttempts.error }}
            <div class="mt-2 text-sm">Provavelmente a tabela question_attempts não existe. Execute FIX_ALL_TABLES.sql</div>
          </div>

          <div v-else-if="debugInfo.questionAttempts?.count === 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400">
            ⚠️ Nenhuma questão respondida ainda
          </div>

          <div v-else class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ debugInfo.questionAttempts?.count }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Questões respondidas</div>
          </div>
        </div>

        <!-- Matérias -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">📚</span> Matérias Cadastradas
          </h2>

          <div v-if="!debugInfo.subjects || debugInfo.subjects.length === 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400">
            ⚠️ Nenhuma matéria cadastrada
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="subject in debugInfo.subjects" :key="subject.id" class="flex items-center gap-3 bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
              <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: subject.color }"></div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white">{{ subject.name }}</div>
                <div class="text-xs text-gray-500 font-mono">{{ subject.id }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- JSON Raw -->
        <details class="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6">
          <summary class="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600">
            🔍 Ver JSON Completo
          </summary>
          <pre class="mt-4 bg-gray-50 dark:bg-dark-700 rounded-lg p-4 overflow-x-auto text-xs font-mono">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
        </details>

        <!-- Ações -->
        <div class="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <h3 class="text-xl font-bold mb-4">✅ Próximos Passos</h3>
          <div class="space-y-2 text-sm">
            <div v-if="debugInfo.sessions?.count === 0">
              <strong>1.</strong> Use o cronômetro em <NuxtLink to="/study" class="underline">/study</NuxtLink> por pelo menos 1 minuto
            </div>
            <div v-if="debugInfo.sessions?.count > 0 && debugInfo.recentSessions?.count === 0">
              <strong>2.</strong> Suas sessões são antigas! Crie uma sessão nova nos últimos 30 dias
            </div>
            <div v-if="debugInfo.recentSessions?.count > 0">
              <strong>3.</strong> Você tem {{ debugInfo.recentSessions.count }} sessões! Vá para <NuxtLink to="/reports" class="underline">/reports</NuxtLink> e selecione "Todo período"
            </div>
            <div v-if="debugInfo.questionAttempts?.error">
              <strong>4.</strong> Execute o script SQL <code class="bg-white/20 px-2 py-1 rounded">FIX_ALL_TABLES.sql</code> no Supabase
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
