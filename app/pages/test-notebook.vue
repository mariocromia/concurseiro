<template>
  <div class="min-h-screen bg-dark-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-white mb-6">🔍 Diagnóstico do Caderno</h1>

      <div class="space-y-4">
        <!-- User Info -->
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <h2 class="text-lg font-semibold text-white mb-2">👤 Usuário</h2>
          <pre class="text-xs text-gray-300">{{ JSON.stringify(user, null, 2) }}</pre>
        </div>

        <!-- Test Results -->
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <h2 class="text-lg font-semibold text-white mb-4">📊 Resultados dos Testes</h2>

          <div class="space-y-3">
            <div v-for="test in tests" :key="test.name" class="border-l-4 pl-3 py-2"
              :class="test.status === 'success' ? 'border-green-500' : test.status === 'error' ? 'border-red-500' : 'border-yellow-500'">
              <div class="flex items-center justify-between">
                <span class="text-white font-medium">{{ test.name }}</span>
                <span class="text-xs px-2 py-1 rounded"
                  :class="test.status === 'success' ? 'bg-green-500/20 text-green-400' : test.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'">
                  {{ test.status }}
                </span>
              </div>
              <p class="text-sm text-gray-400 mt-1">{{ test.message }}</p>
              <pre v-if="test.data" class="text-xs text-gray-500 mt-2 bg-dark-900 p-2 rounded overflow-auto max-h-40">{{ JSON.stringify(test.data, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="runTests"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            :disabled="testing"
          >
            {{ testing ? 'Testando...' : '🔄 Executar Testes' }}
          </button>

          <button
            @click="createTestSubject"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            :disabled="testing"
          >
            ➕ Criar Matéria de Teste
          </button>

          <NuxtLink
            to="/notebook"
            class="px-4 py-2 border border-dark-600 text-gray-400 rounded-lg hover:bg-dark-700 transition-colors"
          >
            ← Voltar para o Caderno
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const testing = ref(false)
const tests = ref<any[]>([])

const runTests = async () => {
  testing.value = true
  tests.value = []

  // Test 1: Verificar autenticação
  try {
    const { data: { user: currentUser }, error } = await supabase.auth.getUser()
    tests.value.push({
      name: 'Autenticação',
      status: currentUser ? 'success' : 'error',
      message: currentUser ? `Usuário autenticado: ${currentUser.email}` : 'Usuário não autenticado',
      data: currentUser
    })
  } catch (err: any) {
    tests.value.push({
      name: 'Autenticação',
      status: 'error',
      message: err.message,
      data: err
    })
  }

  // Test 2: Verificar se a tabela subjects existe
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('count')
      .limit(0)

    tests.value.push({
      name: 'Tabela subjects existe',
      status: error ? 'error' : 'success',
      message: error ? error.message : 'Tabela existe e está acessível',
      data: error
    })
  } catch (err: any) {
    tests.value.push({
      name: 'Tabela subjects existe',
      status: 'error',
      message: err.message,
      data: err
    })
  }

  // Test 3: Listar matérias do usuário
  try {
    if (!user.value?.id) {
      tests.value.push({
        name: 'Listar matérias',
        status: 'error',
        message: 'Usuário não está disponível',
        data: null
      })
    } else {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.value.id)

      tests.value.push({
        name: 'Listar matérias',
        status: error ? 'error' : 'success',
        message: error ? error.message : `${data?.length || 0} matéria(s) encontrada(s)`,
        data: data || error
      })
    }
  } catch (err: any) {
    tests.value.push({
      name: 'Listar matérias',
      status: 'error',
      message: err.message,
      data: err
    })
  }

  // Test 4: Verificar RLS policies
  try {
    const { data, error } = await supabase
      .rpc('has_table_privilege', {
        table_name: 'subjects',
        privilege: 'SELECT'
      })

    tests.value.push({
      name: 'Permissões RLS',
      status: error ? 'warning' : 'success',
      message: error ? 'Não foi possível verificar' : 'Permissões OK',
      data: data
    })
  } catch (err: any) {
    tests.value.push({
      name: 'Permissões RLS',
      status: 'warning',
      message: 'Teste não executado (normal)',
      data: null
    })
  }

  testing.value = false
}

const createTestSubject = async () => {
  testing.value = true

  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      tests.value.push({
        name: 'Criar matéria de teste',
        status: 'error',
        message: 'Usuário não autenticado',
        data: null
      })
      return
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: currentUser.id,
        name: `Teste ${new Date().toLocaleTimeString()}`
      })
      .select()
      .single()

    tests.value.push({
      name: 'Criar matéria de teste',
      status: error ? 'error' : 'success',
      message: error ? error.message : 'Matéria criada com sucesso!',
      data: data || error
    })

    // Recarregar lista de matérias
    await runTests()
  } catch (err: any) {
    tests.value.push({
      name: 'Criar matéria de teste',
      status: 'error',
      message: err.message,
      data: err
    })
  } finally {
    testing.value = false
  }
}

// Executar testes automaticamente ao montar
onMounted(() => {
  runTests()
})
</script>
