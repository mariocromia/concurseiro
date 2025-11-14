<template>
  <div class="min-h-screen bg-dark-900">
    <AdminMenu />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <h1 class="text-3xl font-bold mb-8">🧪 Teste de Configuração da IA</h1>

      <!-- Status da API Key -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">1. Configuração Runtime</h2>
        <div class="space-y-2 font-mono text-sm">
          <div>
            <span class="text-gray-400">googleAiApiKey (public):</span>
            <span :class="config.public.googleAiApiKey ? 'text-green-400' : 'text-red-400'">
              {{ config.public.googleAiApiKey ? config.public.googleAiApiKey.substring(0, 20) + '...' : '❌ NÃO ENCONTRADA' }}
            </span>
          </div>
          <div>
            <span class="text-gray-400">Status:</span>
            <span :class="config.public.googleAiApiKey ? 'text-green-400' : 'text-red-400'">
              {{ config.public.googleAiApiKey ? '✅ Configurada' : '❌ Não configurada' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Teste do Composable -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">2. Teste do useGemini()</h2>
        <div class="space-y-4">
          <div class="font-mono text-sm">
            <div>
              <span class="text-gray-400">genAI inicializado:</span>
              <span :class="genAIStatus.initialized ? 'text-green-400' : 'text-red-400'">
                {{ genAIStatus.initialized ? '✅ SIM' : '❌ NÃO' }}
              </span>
            </div>
            <div v-if="genAIStatus.error" class="text-red-400 mt-2">
              Erro: {{ genAIStatus.error }}
            </div>
          </div>

          <button
            @click="testGeneration"
            :disabled="loading"
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Testando...' : 'Testar Geração de Conteúdo' }}
          </button>

          <div v-if="testResult" class="mt-4 p-4 bg-dark-900 border border-dark-600 rounded">
            <h3 class="font-semibold mb-2">Resultado:</h3>
            <p class="text-sm" :class="testResult.success ? 'text-green-400' : 'text-red-400'">
              {{ testResult.message }}
            </p>
            <pre v-if="testResult.data" class="mt-2 text-xs text-gray-400 overflow-x-auto">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">3. Console Logs</h2>
        <div class="bg-dark-900 border border-dark-600 rounded p-4 font-mono text-xs space-y-1">
          <div v-for="(log, i) in logs" :key="i" :class="log.type === 'error' ? 'text-red-400' : 'text-gray-300'">
            [{{ log.timestamp }}] {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const config = useRuntimeConfig()
const { generateContent } = useGemini()

const loading = ref(false)
const testResult = ref<any>(null)
const logs = ref<Array<{ timestamp: string, message: string, type: string }>>([])

const addLog = (message: string, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, message, type })
  console.log(`[${timestamp}] ${message}`)
}

const genAIStatus = computed(() => {
  try {
    if (!config.public.googleAiApiKey) {
      return {
        initialized: false,
        error: 'API key não encontrada em config.public.googleAiApiKey'
      }
    }
    return {
      initialized: true,
      error: null
    }
  } catch (err: any) {
    return {
      initialized: false,
      error: err.message
    }
  }
})

const testGeneration = async () => {
  loading.value = true
  testResult.value = null
  logs.value = []

  addLog('Iniciando teste de geração...')

  try {
    addLog('Verificando API key...')
    if (!config.public.googleAiApiKey) {
      throw new Error('API key não configurada')
    }
    addLog('✓ API key encontrada')

    addLog('Chamando generateContent()...')
    const response = await generateContent('Diga apenas "Olá" em português')
    addLog('✓ Resposta recebida')

    testResult.value = {
      success: true,
      message: 'Teste bem-sucedido!',
      data: { response }
    }
    addLog('✅ TESTE CONCLUÍDO COM SUCESSO')
  } catch (err: any) {
    addLog(`❌ ERRO: ${err.message}`, 'error')
    testResult.value = {
      success: false,
      message: err.message || 'Erro desconhecido',
      data: { stack: err.stack }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  addLog('Página de teste carregada')
  addLog(`API key (public): ${config.public.googleAiApiKey ? 'PRESENTE' : 'AUSENTE'}`)
})
</script>
