<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-lg shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg"></div>
          <span class="text-2xl font-bold text-white">Concurseiro</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Esqueceu a senha?</h1>
        <p class="text-gray-400">Digite seu email para recuperar o acesso</p>
      </div>

      <div v-if="success" class="mb-4 p-3 bg-primary-500/10 border border-primary-500/50 rounded-lg text-primary-400 text-sm">
        Email enviado! Verifique sua caixa de entrada.
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-400">
        Lembrou a senha?
        <NuxtLink to="/login" class="text-primary-400 hover:text-primary-300 font-semibold">
          Voltar ao login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { resetPassword } = useAuth()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleReset = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = false

    await resetPassword(email.value)
    success.value = true
  } catch (err: any) {
    error.value = err.message || 'Erro ao enviar email de recuperação.'
  } finally {
    loading.value = false
  }
}
</script>
