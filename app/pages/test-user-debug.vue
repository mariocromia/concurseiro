<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const debugInfo = ref<any>({})

const runDebug = async () => {
  console.log('🔍 Iniciando debug completo...')

  const info: any = {
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Teste 1: useSupabaseUser
  info.tests.push({
    name: 'useSupabaseUser()',
    user_value: user.value,
    user_id: user.value?.id,
    user_email: user.value?.email
  })

  // Teste 2: getSession
  const { data: sessionData } = await supabase.auth.getSession()
  info.tests.push({
    name: 'getSession()',
    session: sessionData?.session,
    user_from_session: sessionData?.session?.user,
    user_id_from_session: sessionData?.session?.user?.id
  })

  // Teste 3: getUser
  const { data: userData } = await supabase.auth.getUser()
  info.tests.push({
    name: 'getUser()',
    user: userData?.user,
    user_id_from_getUser: userData?.user?.id
  })

  // Teste 4: Tentar buscar sessões com ID da getSession
  if (sessionData?.session?.user?.id) {
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', sessionData.session.user.id)
      .limit(5)

    info.tests.push({
      name: 'Query com session.user.id',
      user_id_usado: sessionData.session.user.id,
      sessoes_encontradas: sessions?.length || 0,
      erro: error?.message || null
    })
  }

  debugInfo.value = info
  console.log('📊 Debug completo:', info)
}

onMounted(() => {
  console.log('✅ Página montada, executando debug...')
  runDebug()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-dark-900 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        🔍 Debug de Autenticação
      </h1>

      <div class="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6">
        <button
          @click="runDebug"
          class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium mb-6"
        >
          🔄 Executar Debug Novamente
        </button>

        <div v-if="debugInfo.tests" class="space-y-6">
          <div v-for="(test, index) in debugInfo.tests" :key="index" class="border-b border-gray-200 dark:border-dark-700 pb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ test.name }}
            </h3>
            <pre class="bg-gray-50 dark:bg-dark-900 p-4 rounded-lg text-xs overflow-auto">{{ JSON.stringify(test, null, 2) }}</pre>
          </div>
        </div>

        <div v-else class="text-gray-600 dark:text-gray-400">
          Executando debug...
        </div>
      </div>

      <div class="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 class="text-blue-400 font-semibold mb-2">ℹ️ Informações</h3>
        <ul class="text-sm text-blue-300 space-y-1">
          <li>• Esta página testa 4 formas diferentes de obter o user_id</li>
          <li>• Abra o Console (F12) para ver logs detalhados</li>
          <li>• Se algum teste retornar user_id, usaremos esse método</li>
        </ul>
      </div>

      <div class="mt-4 text-center">
        <NuxtLink
          to="/test-reports-simple"
          class="text-primary-400 hover:text-primary-300 underline"
        >
          ← Voltar para teste de relatórios
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
