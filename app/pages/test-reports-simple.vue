<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)
const sessions = ref<any[]>([])
const error = ref<string>('')
const userId = ref<string | null>(null)

const loadSessions = async () => {
  console.log('🚀 [DEBUG] loadSessions iniciado')

  // ✅ CORREÇÃO: Usar getSession() ao invés de user.value.id
  const { data: sessionData } = await supabase.auth.getSession()
  const sessionUserId = sessionData?.session?.user?.id

  console.log('👤 [DEBUG] user from getSession:', sessionData?.session?.user)
  console.log('🆔 [DEBUG] userId from session:', sessionUserId)

  if (!sessionUserId) {
    console.error('❌ [DEBUG] Usuário não encontrado!')
    error.value = 'Usuário não encontrado'
    return
  }

  userId.value = sessionUserId
  loading.value = true
  error.value = ''

  try {
    console.log('🔍 Buscando sessões para user:', sessionUserId)

    // Buscar sessões do usuário
    const { data, error: dbError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', sessionUserId)
      .order('created_at', { ascending: false })

    console.log('📊 [DEBUG] Sessões do usuário:', data?.length || 0)

    if (dbError) {
      console.error('❌ Erro:', dbError)
      error.value = dbError.message
      return
    }

    console.log('✅ Sessões encontradas:', data?.length || 0)
    console.log('📊 Dados:', data)

    sessions.value = data || []

    // Calcular total
    if (data && data.length > 0) {
      const totalSeconds = data.reduce((sum, s) => sum + (s.duration || 0), 0)
      const totalMinutes = Math.floor(totalSeconds / 60)
      console.log(`⏱️ Total: ${totalSeconds}s = ${totalMinutes} minutos`)
    }
  } catch (e: any) {
    console.error('💥 Exceção:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Carregar ao montar
onMounted(async () => {
  console.log('✅ Página montada, carregando dados...')
  await loadSessions()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-dark-900 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-6">🧪 Teste Simples de Relatórios</h1>

        <!-- User Info -->
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">Usuário:</p>
          <p class="font-mono text-sm">{{ user?.email }}</p>
          <p class="font-mono text-xs text-gray-500">ID: {{ user?.id }}</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p class="text-red-700 dark:text-red-400">❌ Erro: {{ error }}</p>
        </div>

        <!-- No Data -->
        <div v-else-if="sessions.length === 0" class="p-8 text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p class="text-xl mb-2">⚠️ Nenhuma sessão encontrada</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Use o cronômetro em /study para criar uma sessão
          </p>
          <button
            @click="loadSessions"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            🔄 Tentar novamente
          </button>
        </div>

        <!-- Data -->
        <div v-else>
          <div class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p class="text-xl font-bold text-green-700 dark:text-green-400">
              ✅ {{ sessions.length }} sessões encontradas!
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {{ Math.floor(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60) }} minutos
            </p>
          </div>

          <div class="space-y-3">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">
                    {{ new Date(session.started_at).toLocaleString('pt-BR') }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    Subject ID: {{ session.subject_id || 'null' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-primary-600">
                    {{ Math.floor(session.duration / 60) }} min
                  </p>
                  <p class="text-xs text-gray-500">{{ session.duration }}s</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <p class="text-sm font-semibold mb-2">JSON Raw (primeira sessão):</p>
            <pre class="text-xs overflow-x-auto">{{ JSON.stringify(sessions[0], null, 2) }}</pre>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex gap-3">
          <NuxtLink
            to="/reports"
            class="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-center font-semibold"
          >
            📊 Ir para Relatórios Completos
          </NuxtLink>
          <button
            @click="loadSessions"
            class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
          >
            🔄 Recarregar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
