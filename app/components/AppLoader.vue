<template>
  <Transition name="fade">
    <div v-if="isLoading" class="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center">
      <div class="text-center">
        <!-- Logo/Icon -->
        <div class="mb-8 animate-pulse">
          <div class="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <!-- Loading Text -->
        <h2 class="text-2xl font-bold text-white mb-3">
          PraPassar
        </h2>
        <p class="text-white/80 mb-8">
          {{ loadingMessage }}
        </p>

        <!-- Spinner -->
        <div class="flex justify-center">
          <div class="relative">
            <div class="w-12 h-12 border-4 border-white/30 rounded-full"></div>
            <div class="absolute top-0 left-0 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Progress dots -->
        <div class="flex justify-center gap-2 mt-8">
          <div v-for="i in 3" :key="i"
               class="w-2 h-2 bg-white/40 rounded-full animate-pulse"
               :style="{ animationDelay: `${i * 0.15}s` }">
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  isLoading: boolean
  stage?: 'init' | 'auth' | 'theme' | 'ready'
}>()

const loadingMessage = computed(() => {
  switch (props.stage) {
    case 'auth':
      return 'Verificando autenticação...'
    case 'theme':
      return 'Carregando preferências...'
    case 'ready':
      return 'Preparando interface...'
    default:
      return 'Carregando...'
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
