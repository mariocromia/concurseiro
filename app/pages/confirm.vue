<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-lg shadow-xl p-8 text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
        <h2 class="text-xl font-semibold text-white">Confirmando autenticação...</h2>
        <p class="text-gray-400">Por favor, aguarde um momento.</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="text-red-400 text-5xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-white">Erro na autenticação</h2>
        <p class="text-gray-400">{{ error }}</p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition"
        >
          Voltar ao Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // Aguardar um momento para o Supabase processar o callback
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = useSupabaseUser()

    if (user.value) {
      // Usuário autenticado com sucesso
      await router.push('/dashboard')
    } else {
      error.value = 'Não foi possível confirmar a autenticação. Tente novamente.'
      loading.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao processar autenticação.'
    loading.value = false
  }
})
</script>
