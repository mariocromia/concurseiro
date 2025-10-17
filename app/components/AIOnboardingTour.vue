<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isActive && currentStep !== null"
        class="fixed inset-0 z-[100]"
        @click.self="skipTour"
      >
        <!-- Backdrop with spotlight effect -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Spotlight highlight -->
        <div
          v-if="spotlightPosition"
          class="absolute rounded-lg ring-4 ring-primary-500/50 transition-all duration-500 pointer-events-none"
          :style="{
            top: `${spotlightPosition.top}px`,
            left: `${spotlightPosition.left}px`,
            width: `${spotlightPosition.width}px`,
            height: `${spotlightPosition.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
          }"
        ></div>

        <!-- Tour Card -->
        <div
          v-if="currentStepData"
          class="absolute bg-dark-800 border border-primary-500/30 rounded-2xl shadow-2xl max-w-md transition-all duration-500"
          :style="{
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`
          }"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="text-2xl">{{ currentStepData.icon }}</div>
                <h3 class="font-bold text-lg">{{ currentStepData.title }}</h3>
              </div>
              <button
                @click="skipTour"
                class="text-white/80 hover:text-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-2 text-sm text-primary-100">
              <span>Passo {{ currentStep + 1 }} de {{ steps.length }}</span>
              <div class="flex-1 bg-primary-900/50 rounded-full h-1.5">
                <div
                  class="bg-white rounded-full h-1.5 transition-all duration-300"
                  :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <p class="text-gray-300 leading-relaxed mb-4">
              {{ currentStepData.description }}
            </p>

            <!-- Feature highlights -->
            <ul v-if="currentStepData.features" class="space-y-2 mb-4">
              <li
                v-for="(feature, index) in currentStepData.features"
                :key="index"
                class="flex items-start gap-2 text-sm text-gray-400"
              >
                <svg class="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <!-- Pro badge if needed -->
            <div
              v-if="currentStepData.requiresPro"
              class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg mb-4"
            >
              <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-sm text-yellow-300">Recurso exclusivo do Plano Pro</span>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between gap-3">
              <button
                v-if="currentStep > 0"
                @click="previousStep"
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                ← Anterior
              </button>
              <div v-else></div>

              <div class="flex gap-2">
                <button
                  @click="skipTour"
                  class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Pular
                </button>
                <button
                  @click="nextStep"
                  class="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold"
                >
                  {{ currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo →' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * AI Onboarding Tour Component
 *
 * Interactive tour highlighting AI features for new users
 * Shows spotlight on elements and provides step-by-step guidance
 *
 * @author Claude Code
 * @date 2025-10-17
 */

interface TourStep {
  id: string
  title: string
  icon: string
  description: string
  features?: string[]
  requiresPro?: boolean
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = defineProps<{
  autoStart?: boolean
}>()

const emit = defineEmits<{
  complete: []
  skip: []
}>()

// State
const isActive = ref(false)
const currentStep = ref<number | null>(null)
const spotlightPosition = ref<{ top: number; left: number; width: number; height: number } | null>(null)
const cardPosition = ref<{ top: number; left: number }>({ top: 0, left: 0 })

// Tour steps
const steps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo à IA do PraPassar!',
    icon: '🤖',
    description: 'Descubra como a Inteligência Artificial pode revolucionar seus estudos. Vamos fazer um tour rápido pelos recursos de IA disponíveis.',
    features: [
      'Tutor de IA personalizado para tirar dúvidas',
      'Gerador de exercícios inteligente',
      'Criador de mapas mentais automáticos',
      'Flashcards gerados por IA'
    ]
  },
  {
    id: 'ai-chat',
    title: 'Tutor de IA',
    icon: '💬',
    description: 'Tire suas dúvidas em tempo real com o assistente de IA. Ele pode explicar conceitos, resolver exercícios e dar dicas de estudo.',
    features: [
      'Respostas instantâneas e contextualizadas',
      'Histórico de conversas salvo',
      'Sugestões de prompts inteligentes',
      'Explicações adaptadas ao seu nível'
    ],
    requiresPro: true,
    targetSelector: '[data-tour="ai-chat"]'
  },
  {
    id: 'ai-exercises',
    title: 'Gerador de Exercícios',
    icon: '📝',
    description: 'Crie exercícios personalizados sobre qualquer tema, com diferentes níveis de dificuldade.',
    features: [
      'Questões de múltipla escolha',
      'Questões dissertativas',
      'Feedback imediato',
      'Salvamento de resultados'
    ],
    requiresPro: true,
    targetSelector: '[data-tour="ai-exercises"]'
  },
  {
    id: 'mind-maps',
    title: 'Mapas Mentais com IA',
    icon: '🧠',
    description: 'Gere mapas mentais automáticos a partir de qualquer texto ou tema. Perfeito para revisar e organizar conhecimento.',
    features: [
      'Geração automática de estruturas',
      'Editor visual interativo',
      'Biblioteca de mapas salvos',
      'Exportação para imagem'
    ],
    requiresPro: true,
    targetSelector: '[data-tour="mind-maps"]'
  },
  {
    id: 'ai-flashcards',
    title: 'Flashcards Inteligentes',
    icon: '🎴',
    description: 'Crie flashcards automaticamente a partir dos seus resumos ou de qualquer texto.',
    features: [
      'Criação automática de perguntas e respostas',
      'Sistema de repetição espaçada',
      'Gamificação com pontos',
      'Estatísticas de desempenho'
    ],
    requiresPro: true,
    targetSelector: '[data-tour="ai-flashcards"]'
  },
  {
    id: 'get-started',
    title: 'Comece Agora!',
    icon: '🚀',
    description: 'Você está pronto para explorar todos os recursos de IA! Experimente o tutor de IA ou gere seus primeiros exercícios.',
    features: [
      'Todos os recursos disponíveis no menu',
      'Documentação completa em cada página',
      'Suporte via WhatsApp se precisar',
      '14 dias de teste grátis do Plano Pro'
    ]
  }
]

// Computed
const currentStepData = computed(() => {
  if (currentStep.value === null) return null
  return steps[currentStep.value]
})

// Methods
const startTour = () => {
  isActive.value = true
  currentStep.value = 0
  updateSpotlight()
}

const nextStep = () => {
  if (currentStep.value === null) return

  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    updateSpotlight()
  } else {
    completeTour()
  }
}

const previousStep = () => {
  if (currentStep.value === null || currentStep.value === 0) return
  currentStep.value--
  updateSpotlight()
}

const skipTour = () => {
  isActive.value = false
  currentStep.value = null
  spotlightPosition.value = null
  emit('skip')
  markTourAsCompleted()
}

const completeTour = () => {
  isActive.value = false
  currentStep.value = null
  spotlightPosition.value = null
  emit('complete')
  markTourAsCompleted()
}

const updateSpotlight = () => {
  nextTick(() => {
    if (currentStep.value === null) return

    const step = steps[currentStep.value]

    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        spotlightPosition.value = {
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        }

        // Calculate card position
        calculateCardPosition(rect)
        return
      }
    }

    // Center card if no target
    spotlightPosition.value = null
    cardPosition.value = {
      top: window.innerHeight / 2 - 200,
      left: window.innerWidth / 2 - 224 // 448px / 2 (max-w-md)
    }
  })
}

const calculateCardPosition = (targetRect: DOMRect) => {
  const cardWidth = 448 // max-w-md
  const cardHeight = 400 // approximate
  const margin = 24

  // Try to position card to the right
  if (targetRect.right + margin + cardWidth < window.innerWidth) {
    cardPosition.value = {
      top: Math.max(margin, Math.min(targetRect.top, window.innerHeight - cardHeight - margin)),
      left: targetRect.right + margin
    }
  }
  // Try to position card to the left
  else if (targetRect.left - margin - cardWidth > 0) {
    cardPosition.value = {
      top: Math.max(margin, Math.min(targetRect.top, window.innerHeight - cardHeight - margin)),
      left: targetRect.left - margin - cardWidth
    }
  }
  // Try to position card below
  else if (targetRect.bottom + margin + cardHeight < window.innerHeight) {
    cardPosition.value = {
      top: targetRect.bottom + margin,
      left: Math.max(margin, Math.min(targetRect.left, window.innerWidth - cardWidth - margin))
    }
  }
  // Position card above
  else {
    cardPosition.value = {
      top: Math.max(margin, targetRect.top - margin - cardHeight),
      left: Math.max(margin, Math.min(targetRect.left, window.innerWidth - cardWidth - margin))
    }
  }
}

const markTourAsCompleted = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('prapassar_ai_tour_completed', 'true')
  }
}

const hasTourBeenCompleted = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('prapassar_ai_tour_completed') === 'true'
  }
  return false
}

// Expose methods
defineExpose({
  startTour,
  skipTour
})

// Auto-start if prop is true and tour hasn't been completed
onMounted(() => {
  if (props.autoStart && !hasTourBeenCompleted()) {
    setTimeout(() => startTour(), 1000) // Delay to let page render
  }
})

// Cleanup
onUnmounted(() => {
  isActive.value = false
  currentStep.value = null
})
</script>
