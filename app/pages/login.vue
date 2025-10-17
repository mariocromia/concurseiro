<template>
  <div class="min-h-screen bg-gradient-to-br from-[#f5f5ed] to-[#f0e8e1] dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-dark-800/50 backdrop-blur-sm border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h1 class="text-3xl font-bold text-claude-text dark:text-white mb-2">Bem-vindo de volta!</h1>
        <p class="text-claude-text-secondary dark:text-gray-400">Entre na sua conta para continuar</p>
      </div>

      <!-- Login com Google - Temporariamente desabilitado -->
      <!--
      <button
        @click="handleGoogleLogin"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-claude-md font-semibold hover:bg-gray-50 transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? 'Entrando...' : 'Entrar com Google' }}
      </button>

      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-600 dark:text-gray-500">Ou entre com email</span>
        </div>
      </div>
      -->

      <!-- Mensagem de erro -->
      <div v-if="error" class="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-claude-md text-red-400 text-sm">
        {{ error }}
      </div>

      <!-- Formulário de login -->
      <form @submit.prevent="handleEmailLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-claude-md text-claude-text dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-1">
            Senha
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-claude-md text-claude-text dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" class="rounded border-dark-700 bg-dark-900/50 text-primary-600 focus:ring-primary-500" />
            <span class="ml-2 text-sm text-claude-text-secondary dark:text-gray-400">Lembrar-me</span>
          </label>
          <NuxtLink to="/forgot-password" class="text-sm text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors hover:text-primary-300">
            Esqueceu a senha?
          </NuxtLink>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-3 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-md font-semibold hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-claude-text-secondary dark:text-gray-400">
        Não tem uma conta?
        <NuxtLink to="/register" class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors hover:text-primary-300 font-semibold">
          Cadastre-se grátis
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn, signInWithGoogle } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleEmailLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await signIn(email.value, password.value)
    await router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await signInWithGoogle()
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login com Google.'
    loading.value = false
  }
}

// Prevenir acesso se já estiver logado
const user = useSupabaseUser()
watchEffect(() => {
  if (user.value) {
    router.push('/dashboard')
  }
})
</script>
