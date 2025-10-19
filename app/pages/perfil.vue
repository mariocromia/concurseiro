<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Meu Perfil</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- SEÇÃO 1: Informações Pessoais -->
        <div class="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-dark-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-primary-500/20 rounded-lg">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Informações Pessoais</h2>
          </div>

          <form @submit.prevent="updateProfile" class="space-y-6">
            <!-- Avatar Upload -->
            <div class="flex items-center gap-6">
              <div class="relative">
                <div
                  class="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary-500/30 dark:border-primary-500/40 cursor-pointer group transition-all hover:border-primary-500"
                  @click="triggerAvatarUpload"
                >
                  <img
                    v-if="profileForm.avatar_url"
                    :src="profileForm.avatar_url"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white text-3xl font-bold"
                  >
                    {{ userInitial }}
                  </div>

                  <!-- Hover Overlay -->
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  <!-- Loading Spinner -->
                  <div v-if="uploadingAvatar" class="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                  </div>
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </div>
              <div>
                <button
                  type="button"
                  @click="triggerAvatarUpload"
                  class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
                  :disabled="uploadingAvatar"
                >
                  {{ uploadingAvatar ? 'Enviando...' : 'Alterar Foto' }}
                </button>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  JPG, PNG, GIF ou WEBP. Máximo 2MB.
                </p>
              </div>
            </div>

            <!-- Nome Completo -->
            <div>
              <label for="full_name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nome Completo
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="full_name"
                  v-model="profileForm.full_name"
                  type="text"
                  class="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Seu nome completo"
                  required
                  minlength="3"
                />
              </div>
            </div>

            <!-- Telefone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Telefone
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  class="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="(XX) XXXXX-XXXX"
                  maxlength="15"
                  @input="formatPhone"
                />
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Formato: (XX) XXXXX-XXXX</p>
            </div>

            <!-- Email (read-only) -->
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-mail
              </label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                class="block w-full px-3 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-100 dark:bg-dark-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                disabled
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">O e-mail não pode ser alterado</p>
            </div>

            <!-- Plano Atual -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Plano Atual
                </label>
                <div class="px-4 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-900">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': profileForm.subscription_type === 'plus',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': profileForm.subscription_type === 'pro',
                      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300': profileForm.subscription_type === 'freemium'
                    }"
                  >
                    {{ profileForm.subscription_type === 'freemium' ? 'Gratuito' : profileForm.subscription_type?.toUpperCase() }}
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Membro desde
                </label>
                <div class="px-4 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-900 text-slate-700 dark:text-slate-300">
                  {{ formatDate(profileForm.created_at) }}
                </div>
              </div>
            </div>

            <!-- Botão Salvar -->
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="savingProfile"
                class="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg v-if="savingProfile" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ savingProfile ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
            </div>
          </form>
        </div>

        <!-- SEÇÃO 2: Alterar Senha -->
        <div class="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-dark-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-orange-500/20 rounded-lg">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Alterar Senha</h2>
          </div>

          <form @submit.prevent="changePassword" class="space-y-6">
            <!-- Senha Atual -->
            <div>
              <label for="current_password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha Atual
              </label>
              <input
                id="current_password"
                v-model="passwordForm.current_password"
                type="password"
                autocomplete="current-password"
                class="block w-full px-3 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <!-- Nova Senha -->
            <div>
              <label for="new_password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nova Senha
              </label>
              <input
                id="new_password"
                v-model="passwordForm.new_password"
                type="password"
                autocomplete="new-password"
                class="block w-full px-3 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
                minlength="6"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Mínimo 6 caracteres</p>
            </div>

            <!-- Confirmar Nova Senha -->
            <div>
              <label for="confirm_password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirmar Nova Senha
              </label>
              <input
                id="confirm_password"
                v-model="passwordForm.confirm_password"
                type="password"
                autocomplete="new-password"
                class="block w-full px-3 py-3 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
                minlength="6"
              />
            </div>

            <!-- Botão Alterar Senha -->
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="changingPassword"
                class="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg v-if="changingPassword" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ changingPassword ? 'Alterando...' : 'Alterar Senha' }}
              </button>
            </div>
          </form>
        </div>

        <!-- SEÇÃO 3: Preferências -->
        <div class="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-dark-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-green-500/20 rounded-lg">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Preferências</h2>
          </div>

          <form @submit.prevent="updatePreferences" class="space-y-6">
            <!-- Notificações Push -->
            <div class="flex items-center justify-between p-4 border border-slate-200 dark:border-dark-600 rounded-lg">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Notificações Push</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Receba lembretes de revisões no navegador</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="preferencesForm.push_notifications_enabled"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 dark:bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <!-- Notificações por E-mail -->
            <div class="flex items-center justify-between p-4 border border-slate-200 dark:border-dark-600 rounded-lg">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Notificações por E-mail</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Receba atualizações e lembretes por e-mail</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="preferencesForm.email_notifications_enabled"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 dark:bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <!-- Botão Salvar Preferências -->
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="savingPreferences"
                class="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg v-if="savingPreferences" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ savingPreferences ? 'Salvando...' : 'Salvar Preferências' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
const client = useSupabaseClient()
const toast = useToast()

// Refs
const avatarInput = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)
const savingProfile = ref(false)
const changingPassword = ref(false)
const savingPreferences = ref(false)

// Forms
const profileForm = ref({
  full_name: '',
  phone: '',
  email: '',
  avatar_url: '',
  subscription_type: 'freemium',
  created_at: ''
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const preferencesForm = ref({
  push_notifications_enabled: true,
  email_notifications_enabled: true
})

// Computed
const userInitial = computed(() => {
  return profileForm.value.full_name ? profileForm.value.full_name.charAt(0).toUpperCase() : 'U'
})

// Load user data
const loadUserData = async () => {
  console.log('\n=== [FRONTEND PERFIL] Carregando dados do usuário ===')
  console.log('[FRONTEND PERFIL] User object COMPLETO:', user.value)

  // O Supabase retorna user.id como user.sub (padrão JWT)
  const userId = user.value?.id || user.value?.sub

  console.log('[FRONTEND PERFIL] User object resumo:', {
    exists: !!user.value,
    id: user.value?.id || 'UNDEFINED',
    sub: user.value?.sub || 'UNDEFINED',
    userId: userId || 'UNDEFINED',
    email: user.value?.email || 'UNDEFINED',
    type: typeof user.value,
    keys: user.value ? Object.keys(user.value) : []
  })

  try {
    console.log('[FRONTEND PERFIL] 🔄 Buscando dados no Supabase...')

    if (!user.value || !userId) {
      console.error('[FRONTEND PERFIL] ❌ Usuário não autenticado ou ID ausente')
      console.error('[FRONTEND PERFIL] User value:', user.value)
      toast.error('Você precisa estar logado para acessar esta página')
      return
    }

    console.log('[FRONTEND PERFIL] 🔍 Usando userId:', userId)

    const { data, error } = await client
      .from('users')
      .select('id, full_name, phone, email, avatar_url, subscription_type, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[FRONTEND PERFIL] ❌ Erro ao buscar dados:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    if (!data) {
      console.error('[FRONTEND PERFIL] ❌ Nenhum dado retornado do banco')
      throw new Error('Dados do usuário não encontrados')
    }

    console.log('[FRONTEND PERFIL] ✅ Dados recebidos do banco:', {
      id: data.id,
      full_name: data.full_name || 'NULL',
      phone: data.phone || 'NULL',
      email: data.email || 'NULL',
      avatar_url: data.avatar_url ? data.avatar_url.substring(0, 50) + '...' : 'NULL',
      subscription_type: data.subscription_type || 'NULL'
    })

    profileForm.value = {
      full_name: data.full_name || '',
      phone: data.phone || '',
      email: user.value?.email || data.email || '',
      avatar_url: data.avatar_url || '',
      subscription_type: data.subscription_type || 'freemium',
      created_at: data.created_at || ''
    }

    // TODO: Adicionar colunas push_notifications_enabled e email_notifications_enabled na tabela users
    // Por enquanto, usar valores padrão
    preferencesForm.value = {
      push_notifications_enabled: true,
      email_notifications_enabled: true
    }

    console.log('[FRONTEND PERFIL] ✅ Formulário populado com sucesso!')
  } catch (error: any) {
    console.error('[FRONTEND PERFIL] ❌❌❌ ERRO:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    })
    toast.error('Erro ao carregar dados do perfil: ' + (error.message || 'Erro desconhecido'))
  }
}

// Format phone number
const formatPhone = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '') // Remove non-digits

  if (value.length > 0) {
    if (value.length <= 2) {
      value = `(${value}`
    } else if (value.length <= 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
    }
  }

  profileForm.value.phone = value
}

// Trigger avatar upload
const triggerAvatarUpload = () => {
  if (uploadingAvatar.value) return
  avatarInput.value?.click()
}

// Handle avatar upload
const handleAvatarUpload = async (event: Event) => {
  console.log('\n=== [FRONTEND PERFIL] Upload de Avatar ===')

  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  console.log('[FRONTEND PERFIL] Arquivo selecionado:', {
    exists: !!file,
    name: file?.name,
    type: file?.type,
    size: file?.size,
    sizeInMB: file ? (file.size / (1024 * 1024)).toFixed(2) + 'MB' : 'N/A'
  })

  if (!file) {
    console.log('[FRONTEND PERFIL] ⚠️ Nenhum arquivo selecionado')
    return
  }

  // Validate file size (2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    console.error('[FRONTEND PERFIL] ❌ Arquivo muito grande:', sizeMB, 'MB')
    toast.error(`Imagem muito grande (${sizeMB}MB). O tamanho máximo é 2MB.`)
    input.value = ''
    return
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    console.error('[FRONTEND PERFIL] ❌ Tipo de arquivo inválido:', file.type)
    toast.error('Formato inválido. Use JPG, PNG, GIF ou WEBP.')
    input.value = ''
    return
  }

  console.log('[FRONTEND PERFIL] ✅ Validações passaram')
  console.log('[FRONTEND PERFIL] 🚀 Iniciando upload...')

  uploadingAvatar.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    console.log('[FRONTEND PERFIL] FormData criado, fazendo requisição para /api/user/upload-avatar')

    const response = await $fetch('/api/user/upload-avatar', {
      method: 'POST',
      body: formData
    })

    console.log('[FRONTEND PERFIL] ✅ Resposta recebida:', {
      success: response.success,
      avatar_url: response.avatar_url?.substring(0, 50) + '...',
      file_name: response.file_name,
      file_size: response.file_size,
      file_type: response.file_type
    })

    if (response.success && response.avatar_url) {
      profileForm.value.avatar_url = response.avatar_url
      console.log('[FRONTEND PERFIL] ✅ Avatar URL atualizado no formulário')
      toast.success('Avatar atualizado com sucesso!')
    }
  } catch (error: any) {
    console.error('[FRONTEND PERFIL] ❌❌❌ ERRO no upload:', {
      message: error.message,
      data: error.data,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      fullError: error
    })
    toast.error(error.data?.message || 'Erro ao fazer upload do avatar')
  } finally {
    uploadingAvatar.value = false
    input.value = ''
    console.log('[FRONTEND PERFIL] Upload finalizado')
  }
}

// Update profile
const updateProfile = async () => {
  console.log('\n=== [FRONTEND PERFIL] Salvando Perfil ===')

  // Validate name
  console.log('[FRONTEND PERFIL] Validando nome:', {
    exists: !!profileForm.value.full_name,
    value: profileForm.value.full_name,
    length: profileForm.value.full_name?.length
  })

  if (!profileForm.value.full_name || profileForm.value.full_name.trim().length < 3) {
    console.error('[FRONTEND PERFIL] ❌ Nome inválido (menos de 3 caracteres)')
    toast.error('Nome completo deve ter no mínimo 3 caracteres')
    return
  }

  console.log('[FRONTEND PERFIL] ✅ Validações passaram')
  console.log('[FRONTEND PERFIL] Dados que serão enviados:', {
    full_name: profileForm.value.full_name,
    phone: profileForm.value.phone || 'NULL',
    avatar_url: profileForm.value.avatar_url?.substring(0, 50) + '...' || 'NULL'
  })

  savingProfile.value = true

  try {
    console.log('[FRONTEND PERFIL] 🚀 Enviando requisição para /api/user/update-profile')

    const response = await $fetch('/api/user/update-profile', {
      method: 'POST',
      body: {
        full_name: profileForm.value.full_name,
        phone: profileForm.value.phone || null,
        avatar_url: profileForm.value.avatar_url || null
      }
    })

    console.log('[FRONTEND PERFIL] ✅ Resposta recebida:', {
      success: response.success,
      message: response.message,
      data: response.data
    })

    if (response.success) {
      toast.success('Perfil atualizado com sucesso!')
      console.log('[FRONTEND PERFIL] ✅ Perfil salvo com sucesso!')
    }
  } catch (error: any) {
    console.error('[FRONTEND PERFIL] ❌❌❌ ERRO ao salvar perfil:', {
      message: error.message,
      data: error.data,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      fullError: error
    })
    toast.error(error.data?.message || 'Erro ao atualizar perfil')
  } finally {
    savingProfile.value = false
    console.log('[FRONTEND PERFIL] Salvamento finalizado')
  }
}

// Change password
const changePassword = async () => {
  // Validate passwords match
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    toast.error('As senhas não coincidem')
    return
  }

  // Validate password length
  if (passwordForm.value.new_password.length < 6) {
    toast.error('A nova senha deve ter no mínimo 6 caracteres')
    return
  }

  changingPassword.value = true

  try {
    const response = await $fetch('/api/user/change-password', {
      method: 'POST',
      body: {
        current_password: passwordForm.value.current_password,
        new_password: passwordForm.value.new_password
      }
    })

    if (response.success) {
      toast.success('Senha alterada com sucesso!')
      passwordForm.value = {
        current_password: '',
        new_password: '',
        confirm_password: ''
      }
    }
  } catch (error: any) {
    console.error('Error changing password:', error)
    toast.error(error.data?.message || 'Erro ao alterar senha')
  } finally {
    changingPassword.value = false
  }
}

// Update preferences
const updatePreferences = async () => {
  savingPreferences.value = true

  try {
    const response = await $fetch('/api/user/update-preferences', {
      method: 'POST',
      body: preferencesForm.value
    })

    if (response.success) {
      toast.success('Preferências atualizadas com sucesso!')
    }
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    toast.error(error.data?.message || 'Erro ao atualizar preferências')
  } finally {
    savingPreferences.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Load data on mount
onMounted(async () => {
  console.log('[FRONTEND PERFIL] onMounted - Esperando usuário carregar...')

  // Esperar o usuário estar disponível (máximo 3 segundos)
  let attempts = 0
  const maxAttempts = 30 // 30 x 100ms = 3 segundos

  while (!user.value && attempts < maxAttempts) {
    console.log(`[FRONTEND PERFIL] Tentativa ${attempts + 1}/${maxAttempts} - aguardando user...`)
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  if (user.value) {
    console.log('[FRONTEND PERFIL] ✅ Usuário carregado, buscando dados...')
    await loadUserData()
  } else {
    console.error('[FRONTEND PERFIL] ❌ Timeout: Usuário não carregou após 3 segundos')
    toast.error('Erro ao carregar sessão. Por favor, faça login novamente.')
  }
})

// Watch for user changes (backup method)
watch(user, (newUser) => {
  console.log('[FRONTEND PERFIL] Watch: User mudou:', {
    exists: !!newUser,
    id: newUser?.id
  })

  if (newUser && !profileForm.value.full_name) {
    console.log('[FRONTEND PERFIL] Watch: Carregando dados do usuário...')
    loadUserData()
  }
})
</script>
