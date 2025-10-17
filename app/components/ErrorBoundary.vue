<template>
  <div v-if="error" class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-6">
    <div class="bg-dark-800/50 backdrop-blur border border-red-500/30 rounded-2xl p-8 max-w-2xl w-full">
      <!-- Error Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <!-- Error Message -->
      <h2 class="text-2xl font-bold text-white text-center mb-4">
        Ops! Algo deu errado
      </h2>
      <p class="text-gray-300 text-center mb-6">
        {{ friendlyMessage }}
      </p>

      <!-- Error Details (in development) -->
      <div v-if="showDetails" class="mb-6">
        <button
          @click="detailsExpanded = !detailsExpanded"
          class="w-full flex items-center justify-between px-4 py-3 bg-dark-900/50 rounded-lg text-left hover:bg-dark-900/70 transition-colors"
        >
          <span class="text-sm text-gray-400">Detalhes técnicos</span>
          <svg
            class="w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': detailsExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="detailsExpanded" class="mt-3 p-4 bg-dark-900/50 rounded-lg">
            <p class="text-xs text-red-400 font-mono mb-2">{{ error.message }}</p>
            <pre v-if="error.stack" class="text-xs text-gray-500 overflow-x-auto">{{ error.stack }}</pre>
          </div>
        </Transition>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          @click="retry"
          class="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
        >
          🔄 Tentar Novamente
        </button>
        <button
          @click="goHome"
          class="flex-1 px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
        >
          🏠 Ir para Dashboard
        </button>
      </div>

      <!-- Support -->
      <div class="mt-6 pt-6 border-t border-dark-700 text-center">
        <p class="text-sm text-gray-400 mb-3">
          Se o problema persistir, entre em contato com o suporte
        </p>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          class="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Contatar Suporte via WhatsApp</span>
        </a>
      </div>
    </div>
  </div>

  <slot v-else></slot>
</template>

<script setup lang="ts">
/**
 * Error Boundary Component
 *
 * Catches and displays errors gracefully
 * Provides recovery options
 *
 * @author Claude Code
 * @date 2025-10-17
 */

interface Props {
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
})

const router = useRouter()
const error = ref<Error | null>(null)
const detailsExpanded = ref(false)

const showDetails = computed(() => {
  return process.dev || import.meta.env.DEV
})

const friendlyMessage = computed(() => {
  if (!error.value) return props.fallbackMessage

  // Map common errors to friendly messages
  const message = error.value.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Sua sessão expirou. Por favor, faça login novamente.'
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return 'Você não tem permissão para acessar este recurso.'
  }

  if (message.includes('not found') || message.includes('404')) {
    return 'O conteúdo solicitado não foi encontrado.'
  }

  if (message.includes('timeout')) {
    return 'A operação demorou muito tempo. Tente novamente.'
  }

  return props.fallbackMessage
})

// Catch errors from child components
onErrorCaptured((err) => {
  error.value = err
  console.error('[ErrorBoundary] Caught error:', err)
  return false // Prevent error from propagating
})

const retry = () => {
  error.value = null
  // Force component re-render
  nextTick(() => {
    window.location.reload()
  })
}

const goHome = () => {
  error.value = null
  router.push('/dashboard')
}
</script>
