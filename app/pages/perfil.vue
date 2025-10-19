<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-900">
    <!-- Header -->
    <div class="bg-white dark:bg-dark-800 shadow">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-[#2C2C2C] dark:text-white">Meu Perfil</h1>
          <NuxtLink
            to="/dashboard"
            class="text-[#b85635] dark:text-primary-400 hover:text-[#A65738] dark:hover:text-primary-300 text-sm font-medium"
          >
            Voltar ao Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SkeletonLoader type="card" />
    </div>

    <!-- Content -->
    <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Personal Information -->
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
        <h2 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#b85635] dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informações Pessoais
        </h2>

        <form @submit.prevent="updateProfile" class="space-y-4">
          <!-- Avatar -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <div
                v-if="profileForm.avatar_url"
                class="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E5E5E5] dark:border-dark-700"
              >
                <img :src="profileForm.avatar_url" alt="Avatar" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-2xl font-bold"
              >
                {{ userInitial }}
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
                URL do Avatar (opcional)
              </label>
              <input
                v-model="profileForm.avatar_url"
                type="url"
                placeholder="https://exemplo.com/avatar.jpg"
                class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400 focus:border-transparent"
              />
              <p class="text-xs text-[#999999] dark:text-gray-400 mt-1">
                Cole a URL de uma imagem pública para usar como avatar
              </p>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
              Nome Completo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="profileForm.full_name"
              type="text"
              required
              minlength="3"
              maxlength="100"
              class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400 focus:border-transparent"
            />
          </div>

          <!-- Email (read-only) -->
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              :value="user?.email"
              type="email"
              readonly
              disabled
              class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-gray-50 dark:bg-dark-900/50 text-[#999999] dark:text-gray-500 cursor-not-allowed"
            />
          </div>

          <!-- Registration Date & Plan -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
                Data de Cadastro
              </label>
              <input
                :value="formatDate(user?.created_at)"
                type="text"
                readonly
                disabled
                class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-gray-50 dark:bg-dark-900/50 text-[#999999] dark:text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
                Plano Atual
              </label>
              <div class="px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-gray-50 dark:bg-dark-900/50">
                <span :class="getPlanBadgeClass(userPlan)">
                  {{ userPlan }}
                </span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="profileLoading"
              class="px-6 py-2 bg-[#b85635] dark:bg-primary-500 text-white rounded-claude-md hover:bg-[#A65738] dark:hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ profileLoading ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password -->
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
        <h2 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#b85635] dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Alterar Senha
        </h2>

        <form @submit.prevent="changePassword" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
              Senha Atual <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="passwordForm.current_password"
                :type="showCurrentPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                minlength="8"
                class="w-full px-4 py-2 pr-10 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400 focus:border-transparent"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] dark:text-gray-400 hover:text-[#6B6B6B] dark:hover:text-gray-300"
              >
                <svg v-if="showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
              Nova Senha <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="passwordForm.new_password"
                autocomplete="new-password"
                :type="showNewPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-2 pr-10 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400 focus:border-transparent"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] dark:text-gray-400 hover:text-[#6B6B6B] dark:hover:text-gray-300"
              >
                <svg v-if="showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-[#999999] dark:text-gray-400 mt-1">
              Mínimo de 8 caracteres
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-1">
              Confirmar Nova Senha <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="passwordForm.confirm_password"
                autocomplete="new-password"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-2 pr-10 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400 focus:border-transparent"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] dark:text-gray-400 hover:text-[#6B6B6B] dark:hover:text-gray-300"
              >
                <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="passwordLoading"
              class="px-6 py-2 bg-[#b85635] dark:bg-primary-500 text-white rounded-claude-md hover:bg-[#A65738] dark:hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ passwordLoading ? 'Alterando...' : 'Alterar Senha' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Preferences -->
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
        <h2 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#b85635] dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configurações
        </h2>

        <div class="space-y-4">
          <!-- Theme -->
          <div class="flex items-center justify-between py-3 border-b border-[#E5E5E5] dark:border-dark-700">
            <div>
              <p class="text-sm font-medium text-[#2C2C2C] dark:text-white">Tema</p>
              <p class="text-xs text-[#999999] dark:text-gray-400">Escolha entre claro ou escuro</p>
            </div>
            <button
              @click="toggleTheme"
              class="px-4 py-2 bg-[#f0e8e1] dark:bg-dark-900 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md hover:bg-[#E5DDD6] dark:hover:bg-dark-700 transition-colors flex items-center gap-2"
            >
              <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span class="text-sm font-medium text-[#2C2C2C] dark:text-white">
                {{ isDark ? 'Claro' : 'Escuro' }}
              </span>
            </button>
          </div>

          <!-- Push Notifications -->
          <div class="flex items-center justify-between py-3 border-b border-[#E5E5E5] dark:border-dark-700">
            <div>
              <p class="text-sm font-medium text-[#2C2C2C] dark:text-white">Notificações Push</p>
              <p class="text-xs text-[#999999] dark:text-gray-400">Receba lembretes de revisões R1-R7</p>
            </div>
            <button
              @click="togglePushNotifications"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                preferencesForm.push_notifications_enabled
                  ? 'bg-[#b85635] dark:bg-primary-500'
                  : 'bg-gray-300 dark:bg-dark-700'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  preferencesForm.push_notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <!-- Email Notifications -->
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-[#2C2C2C] dark:text-white">Notificações por Email</p>
              <p class="text-xs text-[#999999] dark:text-gray-400">Receba resumos semanais de estudo</p>
            </div>
            <button
              @click="toggleEmailNotifications"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                preferencesForm.email_notifications_enabled
                  ? 'bg-[#b85635] dark:bg-primary-500'
                  : 'bg-gray-300 dark:bg-dark-700'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  preferencesForm.email_notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { isDark, toggleTheme: toggleThemeComposable } = useTheme()
const toast = useToast()

// State
const loading = ref(true)
const profileLoading = ref(false)
const passwordLoading = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const userPlan = ref('Freemium')

// Forms
const profileForm = ref({
  full_name: '',
  avatar_url: ''
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const preferencesForm = ref({
  push_notifications_enabled: false,
  email_notifications_enabled: false
})

// Computed
const userInitial = computed(() => {
  const name = profileForm.value.full_name || user.value?.user_metadata?.name || 'U'
  return name.charAt(0).toUpperCase()
})

// Methods
const loadUserData = async () => {
  try {
    // Load user metadata
    profileForm.value.full_name = user.value?.user_metadata?.name || ''
    profileForm.value.avatar_url = user.value?.user_metadata?.avatar_url || ''

    // Load subscription info
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_type, push_notifications_enabled, email_notifications_enabled')
      .eq('id', user.value?.id)
      .single()

    if (userData) {
      userPlan.value = userData.subscription_type === 'pro' ? 'Pro' :
                      userData.subscription_type === 'plus' ? 'Plus' : 'Freemium'
      preferencesForm.value.push_notifications_enabled = userData.push_notifications_enabled ?? false
      preferencesForm.value.email_notifications_enabled = userData.email_notifications_enabled ?? false
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  profileLoading.value = true
  try {
    await $fetch('/api/user/update-profile', {
      method: 'POST',
      body: profileForm.value
    })

    toast.success('Perfil atualizado com sucesso!')
  } catch (error: any) {
    toast.error(error.data?.message || 'Erro ao atualizar perfil')
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    toast.error('As senhas não coincidem')
    return
  }

  passwordLoading.value = true
  try {
    await $fetch('/api/user/change-password', {
      method: 'POST',
      body: passwordForm.value
    })

    toast.success('Senha alterada com sucesso!')
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  } catch (error: any) {
    toast.error(error.data?.message || 'Erro ao alterar senha')
  } finally {
    passwordLoading.value = false
  }
}

const togglePushNotifications = async () => {
  preferencesForm.value.push_notifications_enabled = !preferencesForm.value.push_notifications_enabled
  await updatePreferences()
}

const toggleEmailNotifications = async () => {
  preferencesForm.value.email_notifications_enabled = !preferencesForm.value.email_notifications_enabled
  await updatePreferences()
}

const updatePreferences = async () => {
  try {
    await $fetch('/api/user/update-preferences', {
      method: 'POST',
      body: preferencesForm.value
    })
    toast.success('Preferências atualizadas!')
  } catch (error: any) {
    toast.error(error.data?.message || 'Erro ao atualizar preferências')
  }
}

const toggleTheme = () => {
  toggleThemeComposable()
  toast.success(`Tema ${isDark.value ? 'escuro' : 'claro'} ativado`)
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const getPlanBadgeClass = (plan: string) => {
  const classes = {
    'Pro': 'px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'Plus': 'px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Freemium': 'px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return classes[plan as keyof typeof classes] || classes.Freemium
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>
