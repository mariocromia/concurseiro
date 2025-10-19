<template>
  <Teleport to="body">
    <div
      v-if="timer.isRunning || timer.isPaused"
      ref="timerWidget"
      class="fixed z-50 cursor-move"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="bg-dark-800/95 backdrop-blur-md border border-dark-700 rounded-2xl shadow-2xl overflow-hidden min-w-[280px]">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div :class="['w-2 h-2 rounded-full', timer.isRunning ? 'bg-white animate-pulse' : 'bg-yellow-300']"></div>
            <span class="text-white text-sm font-semibold">
              {{ timer.isRunning ? 'Estudando' : 'Pausado' }}
            </span>
          </div>
          <button
            @click.stop="toggleMinimize"
            class="text-white/80 hover:text-white transition-colors"
          >
            <svg v-if="!isMinimized" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div v-show="!isMinimized" class="p-4">
          <!-- Subject -->
          <div class="mb-3">
            <div class="text-xs text-gray-400 mb-1">Matéria</div>
            <div class="text-white font-medium text-sm truncate">{{ subjectName || 'Carregando...' }}</div>
          </div>

          <!-- Timer Display -->
          <div class="mb-4">
            <div class="text-3xl font-mono font-bold text-primary-400 text-center tracking-tight">
              {{ formattedTime }}
            </div>
          </div>

          <!-- Controls -->
          <div class="flex gap-2">
            <button
              v-if="timer.isRunning && !timer.isPaused"
              @click.stop="handlePause"
              class="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Pausar
            </button>

            <button
              v-if="timer.isPaused"
              @click.stop="handleResume"
              class="flex-1 px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              Retomar
            </button>

            <button
              @click.stop="confirmStop"
              class="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
              </svg>
              Encerrar
            </button>
          </div>

          <!-- Quick link to study page -->
          <NuxtLink
            to="/study"
            class="mt-3 block text-center text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Ir para página de estudo →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div
      v-if="showStopModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      @click.self="cancelStop"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Encerrar Sessão</h3>
            <p class="text-sm text-gray-400">Salvar progresso de estudo</p>
          </div>
        </div>

        <div class="bg-dark-900 border border-dark-700 rounded-lg p-4 mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-400 text-sm">Matéria:</span>
            <span class="text-white font-medium">{{ subjectName }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400 text-sm">Tempo estudado:</span>
            <span class="text-primary-400 font-mono font-semibold text-lg">{{ formattedTime }}</span>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Anotações (opcional)</label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="O que você estudou hoje?"
            class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            @click="cancelStop"
            class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleStop"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-[70] space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border flex items-center gap-3 min-w-[300px]',
            toast.type === 'success'
              ? 'bg-primary-500/20 border-primary-500/50 text-primary-100'
              : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5 text-primary-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="flex-1 font-medium">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const { timer, formattedTime, pauseTimer, resumeTimer, stopTimer } = useStudyTimer()

// Widget state
const isMinimized = ref(false)
const position = ref({ x: 0, y: 80 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const timerWidget = ref<HTMLElement | null>(null)

// Modal state
const showStopModal = ref(false)
const notes = ref('')
const loading = ref(false)

// Subject name
const subjectName = ref('')

// Toast system
const toasts = ref<Array<{ id: number, message: string, type: 'success' | 'error' }>>([])
let toastIdCounter = 0

// Initialize position on client side
onMounted(() => {
  if (typeof window !== 'undefined') {
    position.value = { x: window.innerWidth - 320, y: 80 }
  }
  console.log('🕐 FloatingTimer montado. Estado do timer:', {
    isRunning: timer.value.isRunning,
    isPaused: timer.value.isPaused,
    subjectId: timer.value.subjectId
  })
})

// Watch timer state changes for debugging
watch(() => [timer.value.isRunning, timer.value.isPaused], ([running, paused]) => {
  console.log('🕐 Timer state changed:', { running, paused })
})

// Load subject name when timer is running
watch(() => timer.value.subjectId, async (subjectId) => {
  console.log('📚 Carregando nome da matéria para:', subjectId)
  if (!subjectId) {
    subjectName.value = ''
    return
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = user.value?.id || sessionData?.session?.user?.id
    if (!userId) {
      console.warn('❌ UserId não encontrado')
      return
    }

    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single()

    if (error) {
      console.error('❌ Erro ao carregar matéria:', error)
      return
    }

    if (data) {
      subjectName.value = data.name
      console.log('✅ Nome da matéria carregado:', data.name)
    }
  } catch (e) {
    console.error('❌ Erro ao carregar nome da matéria:', e)
  }
}, { immediate: true })

// Drag functionality
const startDrag = (e: MouseEvent | TouchEvent) => {
  if ((e.target as HTMLElement).tagName === 'BUTTON') return

  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  const newX = clientX - dragOffset.value.x
  const newY = clientY - dragOffset.value.y

  // Keep widget within viewport
  const maxX = window.innerWidth - (timerWidget.value?.offsetWidth || 280)
  const maxY = window.innerHeight - (timerWidget.value?.offsetHeight || 200)

  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const handlePause = () => {
  pauseTimer()
  showToast('Sessão pausada', 'success')
}

const handleResume = () => {
  resumeTimer()
  showToast('Sessão retomada!', 'success')
}

const confirmStop = () => {
  showStopModal.value = true
}

const cancelStop = () => {
  showStopModal.value = false
  notes.value = ''
}

const handleStop = async () => {
  try {
    loading.value = true
    console.log('🛑 Encerrando sessão com notas:', notes.value)

    const result = await stopTimer(notes.value)
    console.log('✅ Resultado do stopTimer:', result)

    if (result?.duration !== undefined) {
      const minutes = Math.floor(result.duration / 60)
      showToast(`Sessão salva! Duração: ${minutes} minutos`, 'success')
      notes.value = ''
      showStopModal.value = false
    } else {
      console.warn('⚠️ stopTimer retornou sem duration')
    }
  } catch (e: any) {
    console.error('❌ Erro ao encerrar sessão:', e)
    showToast(e.message || 'Erro ao salvar sessão', 'error')
  } finally {
    loading.value = false
  }
}

const showToast = (message: string, type: 'success' | 'error') => {
  const id = toastIdCounter++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.cursor-move {
  cursor: move;
}

/* Animação do modal */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

/* Animações dos toasts */
.toast-enter-active {
  animation: slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
