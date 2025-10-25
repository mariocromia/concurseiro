<template>
  <div>
    <!-- Instance Blocked Modal - Highest priority -->
    <ClientOnly>
      <InstanceBlockedModal :show="isInstanceBlocked" />
    </ClientOnly>

    <!-- App Loader - Shows during initialization -->
    <ClientOnly>
      <AppLoader
        :is-loading="!isAppReady"
        :stage="loadingStage"
      />
    </ClientOnly>

    <!-- Main App - Only shown when ready and not blocked -->
    <div v-show="isAppReady && !isInstanceBlocked" class="min-h-screen theme-gradient">
      <ClientOnly>
        <template #fallback>
          <!-- Placeholder do menu para evitar flash -->
          <div v-if="showNav" class="fixed top-0 left-0 right-0 z-50 bg-[#f5f5ed] dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-[#E5E5E5] dark:border-slate-700 h-16"></div>
        </template>
        <ModernNav v-if="showNav" />
        <FloatingTimer />
        <WhatsAppButton />
        <ToastContainer />

        <!-- Modal Global: Alarme Pomodoro -->
        <div
          v-if="pomodoro.showAlarmModal"
          class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
        >
          <div class="bg-dark-800 border-2 border-primary-500 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-in">
            <!-- Ícone de Alarme Animado -->
            <div class="flex justify-center mb-6">
              <div class="relative">
                <div class="absolute inset-0 bg-primary-500/30 rounded-full animate-ping"></div>
                <div class="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-white animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Título -->
            <h3 class="text-2xl font-bold text-white text-center mb-2">
              {{ pomodoro.isFocusPhase ? '⏰ Tempo de Pausa!' : '🎯 Hora de Voltar!' }}
            </h3>

            <!-- Mensagem -->
            <p class="text-gray-300 text-center mb-8">
              <template v-if="pomodoro.isFocusPhase">
                Você completou <span class="font-bold text-primary-400">{{ pomodoro.focusMinutes }} minutos</span> de foco intenso!<br>
                Deseja fazer uma pausa de <span class="font-bold text-yellow-400">{{ pomodoro.breakMinutes }} minutos</span>?<br>
                <span class="text-sm text-gray-400">(O timer de estudo será pausado automaticamente)</span>
              </template>
              <template v-else>
                Sua pausa de <span class="font-bold text-yellow-400">{{ pomodoro.breakMinutes }} minutos</span> terminou!<br>
                Pronto para voltar aos estudos?<br>
                <span class="text-sm text-gray-400">(O timer de estudo será retomado automaticamente)</span>
              </template>
            </p>

            <!-- Botões -->
            <div class="flex gap-3">
              <button
                @click="handleAlarmResponse(false)"
                class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all"
              >
                {{ pomodoro.isFocusPhase ? 'Não, Continuar' : 'Mais Pausa' }}
              </button>
              <button
                @click="handleAlarmResponse(true)"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold shadow-lg shadow-primary-500/30 transition-all"
              >
                {{ pomodoro.isFocusPhase ? 'Sim, Pausar' : 'Sim, Voltar' }}
              </button>
            </div>
          </div>
        </div>
      </ClientOnly>
      <div :class="{ 'pt-16': showNav }">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = ref(true)

// Get app ready state from preload plugin
const isAppReady = useState('app-ready', () => false)
const loadingStage = useState<'init' | 'auth' | 'theme' | 'ready'>('loading-stage', () => 'init')

// Instance lock system - prevents multiple tabs/windows
const { isBlocked: isInstanceBlocked } = useInstanceLock()

// Pomodoro global (modal de alarme)
const { pomodoro, handleAlarmResponse } = useStudyTimer()

// Hide nav on login/register/landing pages
watch(() => route.path, (newPath) => {
  const hiddenPaths = ['/', '/login', '/register', '/forgot-password', '/confirm']
  showNav.value = !hiddenPaths.includes(newPath)
}, { immediate: true })
</script>

<style scoped>
/* Animações do Modal de Despertar */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

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

@keyframes wiggle {
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.animate-wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}
</style>
