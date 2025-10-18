<template>
  <Transition name="fade">
    <div v-if="isLoading" class="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center">
      <div class="text-center">
        <!-- Logo/Icon -->
        <div class="mb-8">
          <div class="w-[230px] h-[230px] mx-auto flex items-center justify-center">
            <Logo size="xl" class-name="animate-pulse scale-[1.8]" />
          </div>
        </div>

        <!-- Loading Text (removed title, logo is self-explanatory) -->
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
