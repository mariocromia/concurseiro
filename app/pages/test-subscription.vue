<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🔍 Teste de Subscription</h1>

      <button
        @click="runTest"
        :disabled="loading"
        class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold mb-6 disabled:opacity-50"
      >
        {{ loading ? 'Testando...' : '▶️ Executar Teste' }}
      </button>

      <div v-if="result" class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Resultado:</h2>

        <div class="space-y-4">
          <!-- Status -->
          <div class="border-l-4 pl-4" :class="result.validation?.hasAccess ? 'border-green-500' : 'border-red-500'">
            <p class="text-2xl font-bold">
              {{ result.validation?.hasAccess ? '✅ Usuário TEM ACESSO' : '❌ Usuário NÃO TEM ACESSO' }}
            </p>
          </div>

          <!-- User Info -->
          <div>
            <h3 class="font-bold mb-2">👤 Usuário:</h3>
            <pre class="bg-gray-900 p-4 rounded text-sm overflow-x-auto">{{ JSON.stringify(result.user, null, 2) }}</pre>
          </div>

          <!-- User Data -->
          <div>
            <h3 class="font-bold mb-2">📊 Dados do Banco:</h3>
            <pre class="bg-gray-900 p-4 rounded text-sm overflow-x-auto">{{ JSON.stringify(result.userData, null, 2) }}</pre>
          </div>

          <!-- Validation -->
          <div>
            <h3 class="font-bold mb-2">✅ Validação:</h3>
            <div class="bg-gray-900 p-4 rounded space-y-2">
              <p>• subscription_type: <code class="text-yellow-400">{{ result.validation?.subscriptionType || 'NULL' }}</code></p>
              <p>• isPro: <code :class="result.validation?.isPro ? 'text-green-400' : 'text-red-400'">{{ result.validation?.isPro }}</code></p>
              <p>• isPlus: <code :class="result.validation?.isPlus ? 'text-green-400' : 'text-red-400'">{{ result.validation?.isPlus }}</code></p>
              <p>• isTrial: <code :class="result.validation?.isTrial ? 'text-green-400' : 'text-red-400'">{{ result.validation?.isTrial }}</code></p>
            </div>
          </div>

          <!-- Available Columns -->
          <div>
            <h3 class="font-bold mb-2">🗂️ Colunas Disponíveis:</h3>
            <div class="bg-gray-900 p-4 rounded">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="col in result.availableColumns"
                  :key="col"
                  class="px-3 py-1 bg-gray-700 rounded text-sm"
                  :class="{
                    'bg-green-700': col === 'subscription_type' || col === 'trial_ends_at'
                  }"
                >
                  {{ col }}
                </span>
              </div>
            </div>
          </div>

          <!-- Recommendation -->
          <div v-if="result.recommendation" class="border-l-4 border-yellow-500 pl-4">
            <h3 class="font-bold mb-2">💡 Recomendação:</h3>
            <p>{{ result.recommendation }}</p>
          </div>

          <!-- SQL if user not found -->
          <div v-if="result.sql" class="border-l-4 border-red-500 pl-4">
            <h3 class="font-bold mb-2">🔧 Execute este SQL no Supabase:</h3>
            <pre class="bg-gray-900 p-4 rounded text-sm overflow-x-auto">{{ result.sql }}</pre>
          </div>

          <!-- Error -->
          <div v-if="result.error" class="border-l-4 border-red-500 pl-4">
            <h3 class="font-bold mb-2 text-red-400">❌ Erro:</h3>
            <p class="text-red-300">{{ result.error }}</p>
            <p class="text-sm text-gray-400 mt-2">{{ result.message }}</p>
            <pre v-if="result.details" class="bg-gray-900 p-4 rounded text-sm overflow-x-auto mt-2">{{ JSON.stringify(result.details, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Console Logs -->
      <div v-if="logs.length > 0" class="mt-6 bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">📋 Console Logs (Backend):</h2>
        <div class="bg-gray-900 p-4 rounded text-sm space-y-1 max-h-96 overflow-y-auto">
          <p class="text-gray-400">Verifique o terminal do servidor para ver os logs detalhados.</p>
          <p class="text-yellow-400">Os logs aparecem no terminal onde você executou "npm run dev"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const loading = ref(false)
const result = ref<any>(null)
const logs = ref<string[]>([])

const runTest = async () => {
  loading.value = true
  result.value = null
  logs.value = []

  try {
    console.log('🔍 Executando teste de subscription...')
    const response = await $fetch('/api/test-subscription')
    result.value = response
    console.log('✅ Teste concluído:', response)
  } catch (error: any) {
    console.error('❌ Erro no teste:', error)
    result.value = {
      success: false,
      error: 'Erro ao executar teste',
      message: error.message || 'Erro desconhecido',
      details: error.data || error
    }
  } finally {
    loading.value = false
  }
}
</script>
