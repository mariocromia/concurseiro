<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
    <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-claude-text dark:text-white p-6">
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class="w-8 h-8 bg-white/20 rounded-claude-md"></div>
          <h1 class="text-3xl font-bold">Bem-vindo ao PraPassar!</h1>
        </div>
        <p class="text-center text-primary-100 mt-2">Configure sua meta de estudo e suas primeiras matérias</p>

        <!-- Progress Bar -->
        <div class="mt-6">
          <div class="flex justify-between text-sm mb-2">
            <span>Passo {{ step }} de 3</span>
            <span>{{ Math.round((step / 3) * 100) }}%</span>
          </div>
          <div class="w-full bg-primary-900/50 rounded-full h-2">
            <div
              class="bg-white rounded-full h-2 transition-all duration-300"
              :style="{ width: `${(step / 3) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">

        <!-- Step 1: Meta -->
        <div v-if="step === 1" class="space-y-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-claude-primary/20 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-claude-text dark:text-white mb-2">Defina sua meta de estudo</h2>
            <p class="text-claude-text-secondary dark:text-gray-400">Qual é o seu objetivo principal?</p>
          </div>

          <!-- Mensagem de erro -->
          <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/50 rounded-claude-md text-red-400 text-sm">
            {{ error }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Nome da meta</label>
              <input
                v-model="goalName"
                type="text"
                placeholder="Ex: Concurso Público Federal"
                class="w-full px-4 py-3 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 text-claude-text dark:text-white placeholder-gray-500 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Descrição (opcional)</label>
              <textarea
                v-model="goalDescription"
                placeholder="Descreva brevemente sua meta de estudo..."
                rows="3"
                class="w-full px-4 py-3 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 text-claude-text dark:text-white placeholder-gray-500 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Data objetivo (opcional)</label>
              <input
                v-model="targetDate"
                type="date"
                class="w-full px-4 py-3 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 text-claude-text dark:text-white rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Step 2: Matérias -->
        <div v-else-if="step === 2" class="space-y-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-claude-primary/20 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-claude-text dark:text-white mb-2">Adicione suas matérias</h2>
            <p class="text-claude-text-secondary dark:text-gray-400">Quais matérias você vai estudar?</p>
          </div>

          <!-- Mensagem de erro -->
          <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/50 rounded-claude-md text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- Add Subject Form -->
          <div class="bg-dark-900/50 border border-dark-700 p-4 rounded-claude-md">
            <div class="flex gap-3">
              <input
                v-model="newSubject.name"
                type="text"
                placeholder="Nome da matéria"
                class="flex-1 px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 text-claude-text dark:text-white placeholder-gray-500 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @keyup.enter="addSubject"
              />
              <select
                v-model="newSubject.color"
                class="px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 text-claude-text dark:text-white rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="#22C55E">🟢 Verde</option>
                <option value="#ca643f">🔵 Azul</option>
                <option value="#10B981">🟢 Verde Escuro</option>
                <option value="#EF4444">🔴 Vermelho</option>
                <option value="#F59E0B">🟡 Amarelo</option>
                <option value="#8B5CF6">🟣 Roxo</option>
                <option value="#EC4899">🩷 Rosa</option>
                <option value="#F97316">🟠 Laranja</option>
                <option value="#6B7280">⚫ Cinza</option>
              </select>
              <button
                @click="addSubject"
                :disabled="!newSubject.name.trim() || loading"
                class="px-4 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Adicionar
              </button>
            </div>
          </div>

          <!-- Subjects List -->
          <div v-if="subjects.length > 0" class="space-y-3">
            <h3 class="font-medium text-claude-text-secondary dark:text-gray-300">Matérias adicionadas:</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(subject, index) in subjects"
                :key="subject.id || index"
                class="flex items-center justify-between p-3 border border-dark-700 rounded-claude-md bg-dark-900/50 hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500/50 transition"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="w-4 h-4 rounded-full"
                    :style="{ backgroundColor: subject.color || '#22C55E' }"
                  ></span>
                  <span class="font-medium text-claude-text dark:text-white">{{ subject.name }}</span>
                </div>
                <button
                  @click="removeSubject(subject.id || index)"
                  class="text-red-400 hover:text-red-300"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-claude-text-secondary dark:text-gray-400">Nenhuma matéria adicionada ainda</p>
            <p class="text-sm text-gray-600 dark:text-gray-500 mt-2">Adicione pelo menos uma matéria para continuar</p>
          </div>
        </div>

        <!-- Step 3: Conclusão -->
        <div v-else-if="step === 3" class="text-center space-y-6">
          <div class="w-16 h-16 bg-claude-primary/20 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-claude-text dark:text-white mb-2">Tudo pronto!</h2>
          <p class="text-claude-text-secondary dark:text-gray-400">Sua configuração inicial foi salva com sucesso.</p>

          <div class="bg-primary-500/10 border border-claude-primary dark:border-primary-500/30 p-6 rounded-claude-md">
            <h3 class="font-medium text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mb-4">Resumo da configuração:</h3>
            <div class="text-left space-y-2">
              <p class="text-claude-text-secondary dark:text-gray-300"><strong class="text-claude-text dark:text-white">Meta:</strong> {{ goalName }}</p>
              <p class="text-claude-text-secondary dark:text-gray-300" v-if="goalDescription"><strong class="text-claude-text dark:text-white">Descrição:</strong> {{ goalDescription }}</p>
              <p class="text-claude-text-secondary dark:text-gray-300" v-if="targetDate"><strong class="text-claude-text dark:text-white">Data objetivo:</strong> {{ new Date(targetDate).toLocaleDateString('pt-BR') }}</p>
              <p class="text-claude-text-secondary dark:text-gray-300"><strong class="text-claude-text dark:text-white">Matérias:</strong> {{ subjects.length }} adicionadas</p>
            </div>
          </div>

          <button
            @click="$router.push('/dashboard')"
            class="w-full px-6 py-3 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-colors font-semibold"
          >
            Começar a estudar 🚀
          </button>
        </div>

        <!-- Navigation Buttons -->
        <div v-if="step < 3" class="flex justify-between mt-8 pt-6 border-t border-dark-700">
          <button
            v-if="step > 1"
            @click="step--"
            class="px-4 py-2 border border-dark-700 rounded-claude-md text-claude-text-secondary dark:text-gray-300 hover:bg-dark-700 transition-colors"
          >
            Voltar
          </button>
          <div v-else></div>

          <button
            @click="nextStep"
            :disabled="!canProceed || loading"
            class="px-6 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Salvando...' : (step === 2 ? 'Finalizar' : 'Continuar') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const step = ref(1)
const loading = ref(false)
const error = ref('')
const goalName = ref('')
const goalDescription = ref('')
const targetDate = ref<string>('')

const subjects = ref<Array<{ id: string, name: string, color?: string }>>([])
const newSubject = ref<{ name: string, color?: string }>({ name: '', color: '#22C55E' })

// Computed properties
const canProceed = computed(() => {
  if (step.value === 1) {
    return goalName.value.trim().length > 0
  }
  if (step.value === 2) {
    return subjects.value.length > 0
  }
  return true
})

// Methods
const nextStep = async () => {
  if (step.value === 1) {
    await saveGoal()
  } else if (step.value === 2) {
    step.value = 3
  }
}

const saveGoal = async () => {
  try {
    error.value = ''

    console.log('=== DEBUG ONBOARDING ===')
    console.log('user.value:', user.value)
    console.log('user.value?.id:', user.value?.id)

    // Tentar obter a sessão atual
    const { data: sessionData } = await supabase.auth.getSession()
    console.log('Sessão atual:', sessionData)
    console.log('Usuário da sessão:', sessionData?.session?.user)
    console.log('ID da sessão:', sessionData?.session?.user?.id)

    const userId = user.value?.id || sessionData?.session?.user?.id

    if (!userId) {
      error.value = 'ID do usuário não encontrado. Faça logout e login novamente.'
      console.error('Não foi possível obter o ID do usuário')
      return
    }

    loading.value = true
    console.log('Salvando meta:', {
      user_id: userId,
      goal_name: goalName.value,
      description: goalDescription.value,
      target_date: targetDate.value
    })

    const { data, error: err } = await supabase.from('study_goals').insert({
      user_id: userId,
      goal_name: goalName.value,
      description: goalDescription.value || null,
      target_date: targetDate.value || null,
    }).select()

    if (err) {
      console.error('Erro do Supabase:', err)
      throw err
    }

    console.log('Meta salva com sucesso:', data)
    step.value = 2
  } catch (err: any) {
    console.error('Erro ao salvar meta', err)
    error.value = err.message || 'Erro ao salvar meta. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const addSubject = async () => {
  try {
    error.value = ''

    // Obter userId da sessão
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = user.value?.id || sessionData?.session?.user?.id

    if (!userId) {
      error.value = 'ID do usuário não encontrado. Faça logout e login novamente.'
      return
    }

    if (!newSubject.value.name.trim()) {
      error.value = 'Digite o nome da matéria'
      return
    }

    loading.value = true

    console.log('Adicionando matéria:', {
      user_id: userId,
      name: newSubject.value.name.trim(),
      color: newSubject.value.color
    })

    const { data, error: err } = await supabase.from('subjects').insert({
      user_id: userId,
      name: newSubject.value.name.trim(),
      color: newSubject.value.color || '#22C55E',
    }).select('*').single()

    if (err) {
      console.error('Erro do Supabase:', err)
      throw err
    }

    console.log('Matéria adicionada:', data)
    subjects.value.push({ id: data.id, name: data.name, color: data.color })
    newSubject.value = { name: '', color: '#22C55E' }
  } catch (err: any) {
    console.error('Erro ao adicionar matéria', err)
    error.value = err.message || 'Erro ao adicionar matéria. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const removeSubject = async (id: string | number) => {
  try {
    loading.value = true

    // Se for um número, é um índice local
    if (typeof id === 'number') {
      subjects.value.splice(id, 1)
      loading.value = false
      return
    }

    // Se for string, é um ID do banco
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) throw error
    subjects.value = subjects.value.filter(s => s.id !== id)
  } catch (err) {
    console.error('Erro ao remover matéria', err)
  } finally {
    loading.value = false
  }
}
</script>