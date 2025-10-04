<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎮 Flashcards Interativos</h1>
        <p class="text-gray-400">Aprenda de forma divertida e interativa!</p>
      </div>

      <!-- Subject Selection (if not playing) -->
      <div v-if="!isPlaying && !showResults" class="max-w-2xl mx-auto">
        <div class="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl">
          <h2 class="text-2xl font-bold text-white mb-6">Selecione um Caderno</h2>

          <!-- Loading -->
          <div v-if="loadingSubjects" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p class="text-gray-400 mt-4">Carregando cadernos...</p>
          </div>

          <!-- Subjects List -->
          <div v-else-if="subjects.length > 0" class="space-y-3">
            <div
              v-for="subject in subjects"
              :key="subject.id"
              @click="selectSubject(subject)"
              class="flex items-center justify-between p-4 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:border-primary-500/50 group"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-white group-hover:text-primary-400 transition-colors">{{ subject.name }}</h3>
                  <p class="text-sm text-gray-400">{{ subject.chapter_count || 0 }} capítulos</p>
                </div>
              </div>
              <svg class="w-6 h-6 text-gray-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          <!-- No Subjects -->
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-gray-400">Nenhum caderno encontrado</p>
            <NuxtLink to="/notebook" class="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Criar Caderno
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Game Area -->
      <div v-if="isPlaying && !showResults" class="max-w-4xl mx-auto">
        <!-- Progress Bar -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-400">Progresso</span>
            <span class="text-sm font-medium text-white">{{ currentCardIndex + 1 }} / {{ flashcards.length }}</span>
          </div>
          <div class="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              :style="{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Score -->
        <div class="flex items-center justify-center space-x-8 mb-6">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-2xl font-bold text-green-400">{{ correctCount }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-2xl font-bold text-red-400">{{ incorrectCount }}</span>
          </div>
        </div>

        <!-- Flashcard -->
        <div class="perspective-1000">
          <div
            class="flashcard-container relative"
            :class="{ 'flipped': isFlipped }"
            @click="flipCard"
          >
            <!-- Front -->
            <div class="flashcard flashcard-front bg-gradient-to-br from-primary-500 to-primary-600 border-4 border-primary-400">
              <div class="absolute top-4 right-4">
                <div class="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white backdrop-blur-sm">
                  Pergunta
                </div>
              </div>
              <div class="flex items-center justify-center h-full p-8">
                <p class="text-2xl font-bold text-white text-center">{{ currentCard.question }}</p>
              </div>
              <div class="absolute bottom-4 left-0 right-0 text-center">
                <p class="text-sm text-white/70">Clique para ver a resposta</p>
              </div>
            </div>

            <!-- Back -->
            <div class="flashcard flashcard-back bg-gradient-to-br from-green-500 to-green-600 border-4 border-green-400">
              <div class="absolute top-4 right-4">
                <div class="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white backdrop-blur-sm">
                  Resposta
                </div>
              </div>
              <div class="flex items-center justify-center h-full p-8">
                <p class="text-2xl font-bold text-white text-center">{{ currentCard.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="isFlipped" class="flex items-center justify-center space-x-4 mt-8">
          <button
            @click.stop="answerCard(false)"
            class="flex items-center space-x-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg hover:shadow-red-500/50"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>Errei</span>
          </button>
          <button
            @click.stop="answerCard(true)"
            class="flex items-center space-x-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg hover:shadow-green-500/50"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Acertei</span>
          </button>
        </div>

        <!-- Quit Button -->
        <div class="text-center mt-8">
          <button
            @click="quitGame"
            class="text-gray-400 hover:text-white transition-colors"
          >
            Sair do jogo
          </button>
        </div>
      </div>

      <!-- Results Screen -->
      <div v-if="showResults" class="max-w-2xl mx-auto">
        <div class="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl text-center">
          <!-- Trophy Icon -->
          <div class="mb-6">
            <div class="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          </div>

          <h2 class="text-3xl font-bold text-white mb-4">Parabéns!</h2>
          <p class="text-gray-400 mb-8">Você completou todos os flashcards!</p>

          <!-- Score Summary -->
          <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
              <div class="text-4xl font-bold text-green-400 mb-1">{{ correctCount }}</div>
              <div class="text-sm text-green-300">Acertos</div>
            </div>
            <div class="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <div class="text-4xl font-bold text-red-400 mb-1">{{ incorrectCount }}</div>
              <div class="text-sm text-red-300">Erros</div>
            </div>
          </div>

          <!-- Score Percentage -->
          <div class="mb-8">
            <div class="text-5xl font-bold text-white mb-2">{{ scorePercentage }}%</div>
            <div class="text-gray-400">Taxa de acerto</div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="restartGame"
              class="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all"
            >
              Jogar Novamente
            </button>
            <button
              @click="backToSelection"
              class="flex-1 px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-bold transition-all"
            >
              Escolher Outro Caderno
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const supabase = useSupabaseClient()

// State
const loadingSubjects = ref(true)
const subjects = ref<any[]>([])
const selectedSubject = ref<any>(null)
const isPlaying = ref(false)
const showResults = ref(false)
const flashcards = ref<any[]>([])
const currentCardIndex = ref(0)
const isFlipped = ref(false)
const correctCount = ref(0)
const incorrectCount = ref(0)

// Computed
const currentCard = computed(() => flashcards.value[currentCardIndex.value] || { question: '', answer: '' })
const scorePercentage = computed(() => {
  const total = correctCount.value + incorrectCount.value
  return total > 0 ? Math.round((correctCount.value / total) * 100) : 0
})

// Load subjects
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('subjects')
      .select('*, chapters(count)')
      .eq('user_id', user.id)
      .order('name')

    if (error) throw error

    subjects.value = data.map(s => ({
      ...s,
      chapter_count: s.chapters?.[0]?.count || 0
    }))
  } catch (error) {
    console.error('Erro ao carregar cadernos:', error)
  } finally {
    loadingSubjects.value = false
  }
})

// Select subject and generate flashcards
const selectSubject = async (subject: any) => {
  selectedSubject.value = subject

  try {
    // Get all chapters for this subject
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, title')
      .eq('subject_id', subject.id)

    if (chaptersError) throw chaptersError

    // Generate flashcards from chapters
    const cards = chapters.map(chapter => ({
      id: chapter.id,
      question: `O que você aprendeu sobre: ${chapter.title}?`,
      answer: `Revise o capítulo: ${chapter.title}`
    }))

    // Shuffle cards
    flashcards.value = cards.sort(() => Math.random() - 0.5)

    if (flashcards.value.length === 0) {
      alert('Este caderno não tem capítulos ainda!')
      return
    }

    // Start game
    isPlaying.value = true
    currentCardIndex.value = 0
    correctCount.value = 0
    incorrectCount.value = 0
  } catch (error) {
    console.error('Erro ao carregar flashcards:', error)
    alert('Erro ao carregar flashcards')
  }
}

// Flip card
const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// Answer card
const answerCard = (correct: boolean) => {
  if (correct) {
    correctCount.value++
  } else {
    incorrectCount.value++
  }

  // Move to next card or show results
  if (currentCardIndex.value < flashcards.value.length - 1) {
    currentCardIndex.value++
    isFlipped.value = false
  } else {
    // Show results
    isPlaying.value = false
    showResults.value = true
  }
}

// Quit game
const quitGame = () => {
  if (confirm('Deseja realmente sair? Seu progresso será perdido.')) {
    isPlaying.value = false
    showResults.value = false
    selectedSubject.value = null
  }
}

// Restart game
const restartGame = () => {
  currentCardIndex.value = 0
  correctCount.value = 0
  incorrectCount.value = 0
  isFlipped.value = false
  showResults.value = false
  isPlaying.value = true

  // Shuffle cards again
  flashcards.value = flashcards.value.sort(() => Math.random() - 0.5)
}

// Back to selection
const backToSelection = () => {
  isPlaying.value = false
  showResults.value = false
  selectedSubject.value = null
  flashcards.value = []
}
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.flashcard-container {
  position: relative;
  width: 100%;
  height: 400px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.flashcard-container.flipped {
  transform: rotateY(180deg);
}

.flashcard {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.flashcard-front {
  z-index: 2;
  transform: rotateY(0deg);
}

.flashcard-back {
  transform: rotateY(180deg);
}
</style>
