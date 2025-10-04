<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8">🤖 Teste de IA - Google Gemini</h1>

      <!-- Gerador de Resumo -->
      <div class="bg-dark-800 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">📝 Resumir Conteúdo</h2>
        <textarea
          v-model="contentToSummarize"
          class="w-full h-32 bg-dark-900 border border-dark-600 text-white rounded-lg p-3 mb-3"
          placeholder="Cole o texto que deseja resumir..."
        ></textarea>
        <button
          @click="testSummarize"
          :disabled="loading"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {{ loading ? 'Gerando...' : 'Resumir' }}
        </button>
        <div v-if="summary" class="mt-4 p-4 bg-dark-900 rounded-lg">
          <p class="text-sm text-gray-400 mb-2">Resumo:</p>
          <p class="text-white">{{ summary }}</p>
        </div>
      </div>

      <!-- Gerador de Questões -->
      <div class="bg-dark-800 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">❓ Gerar Questões</h2>
        <textarea
          v-model="contentForQuestions"
          class="w-full h-32 bg-dark-900 border border-dark-600 text-white rounded-lg p-3 mb-3"
          placeholder="Cole o conteúdo para gerar questões..."
        ></textarea>
        <div class="flex gap-3 mb-3">
          <input
            v-model.number="questionQuantity"
            type="number"
            min="1"
            max="10"
            class="w-20 bg-dark-900 border border-dark-600 text-white rounded-lg px-3 py-2"
            placeholder="5"
          />
          <button
            @click="testGenerateQuestions"
            :disabled="loading"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {{ loading ? 'Gerando...' : 'Gerar Questões' }}
          </button>
        </div>
        <div v-if="questions" class="mt-4 p-4 bg-dark-900 rounded-lg">
          <p class="text-sm text-gray-400 mb-2">Questões geradas:</p>
          <pre class="text-white whitespace-pre-wrap">{{ questions }}</pre>
        </div>
      </div>

      <!-- Gerador de Flashcards -->
      <div class="bg-dark-800 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">🎴 Gerar Flashcards</h2>
        <textarea
          v-model="contentForFlashcards"
          class="w-full h-32 bg-dark-900 border border-dark-600 text-white rounded-lg p-3 mb-3"
          placeholder="Cole o conteúdo para gerar flashcards..."
        ></textarea>
        <button
          @click="testGenerateFlashcards"
          :disabled="loading"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {{ loading ? 'Gerando...' : 'Gerar Flashcards' }}
        </button>
        <div v-if="flashcards" class="mt-4 p-4 bg-dark-900 rounded-lg">
          <p class="text-sm text-gray-400 mb-2">Flashcards gerados:</p>
          <div v-if="Array.isArray(flashcards)" class="space-y-3">
            <div v-for="(card, index) in flashcards" :key="index" class="border border-dark-600 rounded-lg p-3">
              <p class="text-primary-400 font-semibold mb-1">{{ card.front }}</p>
              <p class="text-gray-300">{{ card.back }}</p>
            </div>
          </div>
          <pre v-else class="text-white whitespace-pre-wrap">{{ flashcards }}</pre>
        </div>
      </div>

      <!-- Explicar Conceito -->
      <div class="bg-dark-800 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">💡 Explicar Conceito</h2>
        <input
          v-model="conceptToExplain"
          type="text"
          class="w-full bg-dark-900 border border-dark-600 text-white rounded-lg p-3 mb-3"
          placeholder="Digite o conceito que deseja entender..."
        />
        <div class="flex gap-3 mb-3">
          <select
            v-model="explanationLevel"
            class="bg-dark-900 border border-dark-600 text-white rounded-lg px-3 py-2"
          >
            <option value="simples">Simples</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
          <button
            @click="testExplainConcept"
            :disabled="loading"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {{ loading ? 'Explicando...' : 'Explicar' }}
          </button>
        </div>
        <div v-if="explanation" class="mt-4 p-4 bg-dark-900 rounded-lg">
          <p class="text-sm text-gray-400 mb-2">Explicação:</p>
          <p class="text-white">{{ explanation }}</p>
        </div>
      </div>

      <!-- Erro -->
      <div v-if="error" class="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-6">
        <p class="text-red-400">❌ {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { summarize, generateQuestions, generateFlashcards, explainConcept } = useGeminiAI()

const loading = ref(false)
const error = ref('')

// Resumo
const contentToSummarize = ref('')
const summary = ref('')

// Questões
const contentForQuestions = ref('')
const questionQuantity = ref(5)
const questions = ref('')

// Flashcards
const contentForFlashcards = ref('')
const flashcards = ref<any>(null)

// Explicação
const conceptToExplain = ref('')
const explanationLevel = ref<'simples' | 'intermediario' | 'avancado'>('intermediario')
const explanation = ref('')

const testSummarize = async () => {
  if (!contentToSummarize.value.trim()) {
    error.value = 'Digite um texto para resumir'
    return
  }

  loading.value = true
  error.value = ''
  summary.value = ''

  try {
    summary.value = await summarize(contentToSummarize.value)
  } catch (err: any) {
    error.value = err.message || 'Erro ao gerar resumo'
  } finally {
    loading.value = false
  }
}

const testGenerateQuestions = async () => {
  if (!contentForQuestions.value.trim()) {
    error.value = 'Digite um conteúdo para gerar questões'
    return
  }

  loading.value = true
  error.value = ''
  questions.value = ''

  try {
    questions.value = await generateQuestions(contentForQuestions.value, questionQuantity.value)
  } catch (err: any) {
    error.value = err.message || 'Erro ao gerar questões'
  } finally {
    loading.value = false
  }
}

const testGenerateFlashcards = async () => {
  if (!contentForFlashcards.value.trim()) {
    error.value = 'Digite um conteúdo para gerar flashcards'
    return
  }

  loading.value = true
  error.value = ''
  flashcards.value = null

  try {
    flashcards.value = await generateFlashcards(contentForFlashcards.value)
  } catch (err: any) {
    error.value = err.message || 'Erro ao gerar flashcards'
  } finally {
    loading.value = false
  }
}

const testExplainConcept = async () => {
  if (!conceptToExplain.value.trim()) {
    error.value = 'Digite um conceito para explicar'
    return
  }

  loading.value = true
  error.value = ''
  explanation.value = ''

  try {
    explanation.value = await explainConcept(conceptToExplain.value, explanationLevel.value)
  } catch (err: any) {
    error.value = err.message || 'Erro ao explicar conceito'
  } finally {
    loading.value = false
  }
}
</script>
