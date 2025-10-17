<script setup lang="ts">
/**
 * Nova Questão Page
 *
 * Formulário para adicionar questão manualmente
 *
 * @author Claude Code
 * @date 2025-10-17
 */

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const loading = ref(false)
const subjects = ref([])
const form = ref({
  subject_id: '',
  exam_source: '',
  year: new Date().getFullYear(),
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  option_e: '',
  correct_answer: 'A',
  explanation: '',
  difficulty: 'medium'
})

// Carregar matérias
const loadSubjects = async () => {
  const { data } = await client
    .from('subjects')
    .select('id, name, color, icon')
    .eq('user_id', user.value?.id)
    .order('name')

  subjects.value = data || []
}

// Submeter formulário
const submit = async () => {
  // Validações
  if (!form.value.subject_id || !form.value.question_text ||
      !form.value.option_a || !form.value.option_b ||
      !form.value.option_c || !form.value.option_d) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  loading.value = true

  try {
    const { error } = await client
      .from('questions')
      .insert({
        user_id: user.value?.id,
        subject_id: form.value.subject_id,
        exam_source: form.value.exam_source || null,
        year: form.value.year || null,
        question_text: form.value.question_text,
        option_a: form.value.option_a,
        option_b: form.value.option_b,
        option_c: form.value.option_c,
        option_d: form.value.option_d,
        option_e: form.value.option_e || null,
        correct_answer: form.value.correct_answer,
        explanation: form.value.explanation || null,
        difficulty: form.value.difficulty
      })

    if (error) throw error

    router.push('/questoes')

  } catch (error) {
    console.error('Erro ao criar questão:', error)
    alert('Erro ao salvar questão')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadSubjects()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span>←</span>
          <span>Voltar</span>
        </button>

        <h1 class="text-3xl font-bold text-white mb-2">➕ Nova Questão</h1>
        <p class="text-gray-400">Adicione uma questão ao seu banco</p>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="submit" class="space-y-6">
        <!-- Metadados -->
        <div class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700">
          <h2 class="text-xl font-semibold text-white mb-4">Informações Básicas</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Matéria -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Matéria *</label>
              <select
                v-model="form.subject_id"
                required
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Selecione...</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.icon }} {{ subject.name }}
                </option>
              </select>
            </div>

            <!-- Banca -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Banca</label>
              <input
                v-model="form.exam_source"
                type="text"
                placeholder="Ex: CESPE/CEBRASPE"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
              >
            </div>

            <!-- Ano -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Ano</label>
              <input
                v-model.number="form.year"
                type="number"
                min="2000"
                max="2025"
                placeholder="2024"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
              >
            </div>

            <!-- Dificuldade -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Dificuldade</label>
              <select
                v-model="form.difficulty"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Enunciado -->
        <div class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700">
          <h2 class="text-xl font-semibold text-white mb-4">Enunciado</h2>
          <textarea
            v-model="form.question_text"
            required
            rows="6"
            placeholder="Digite o texto da questão..."
            class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
          ></textarea>
        </div>

        <!-- Alternativas -->
        <div class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700">
          <h2 class="text-xl font-semibold text-white mb-4">Alternativas</h2>

          <div class="space-y-4">
            <!-- Opção A -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">A) *</label>
              <textarea
                v-model="form.option_a"
                required
                rows="2"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <!-- Opção B -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">B) *</label>
              <textarea
                v-model="form.option_b"
                required
                rows="2"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <!-- Opção C -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">C) *</label>
              <textarea
                v-model="form.option_c"
                required
                rows="2"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <!-- Opção D -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">D) *</label>
              <textarea
                v-model="form.option_d"
                required
                rows="2"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <!-- Opção E (opcional) -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">E) (opcional)</label>
              <textarea
                v-model="form.option_e"
                rows="2"
                class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Resposta Correta -->
          <div class="mt-6">
            <label class="block text-sm text-gray-400 mb-2">Resposta Correta *</label>
            <div class="flex gap-2">
              <button
                v-for="option in ['A', 'B', 'C', 'D', 'E']"
                :key="option"
                type="button"
                @click="form.correct_answer = option"
                class="flex-1 px-4 py-3 rounded-lg border transition-colors"
                :class="form.correct_answer === option
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-dark-900 border-dark-700 text-gray-400 hover:border-dark-600'"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <!-- Explicação -->
        <div class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700">
          <h2 class="text-xl font-semibold text-white mb-4">Explicação (opcional)</h2>
          <textarea
            v-model="form.explanation"
            rows="4"
            placeholder="Explique por que a resposta está correta..."
            class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none resize-none"
          ></textarea>
        </div>

        <!-- Botões -->
        <div class="flex gap-4">
          <button
            type="button"
            @click="router.back()"
            class="flex-1 px-6 py-4 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-6 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Salvando...' : 'Salvar Questão' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
