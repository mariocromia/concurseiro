<template>
  <div>
    <!-- App Loader - Shows during initialization -->
    <AppLoader
      :is-loading="!isAppReady"
      :stage="loadingStage"
    />

    <!-- Main App - Only shown when ready -->
    <div v-show="isAppReady" class="min-h-screen theme-gradient">
      <ClientOnly>
        <template #fallback>
          <!-- Placeholder do menu para evitar flash -->
          <div v-if="showNav" class="fixed top-0 left-0 right-0 z-50 bg-[#f5f5ed] dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-[#E5E5E5] dark:border-slate-700 h-16"></div>
        </template>
        <ModernNav v-if="showNav" />
        <FloatingTimer />
        <WhatsAppButton />
        <ToastContainer />
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

// Hide nav on login/register pages
watch(() => route.path, (newPath) => {
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/confirm']
  showNav.value = !hiddenPaths.includes(newPath)
}, { immediate: true })
</script>
