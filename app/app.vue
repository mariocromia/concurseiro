<template>
  <div class="min-h-screen theme-gradient">
    <ClientOnly>
      <template #fallback>
        <!-- Placeholder do menu para evitar flash -->
        <div v-if="showNav" class="fixed top-0 left-0 right-0 z-50 theme-nav-gradient border-b theme-nav-border h-16"></div>
      </template>
      <ModernNav v-if="showNav" />
      <FloatingTimer />
      <WhatsAppButton />
    </ClientOnly>
    <div :class="{ 'pt-16': showNav }">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = ref(true)

// Hide nav on login/register pages
watch(() => route.path, (newPath) => {
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/confirm']
  showNav.value = !hiddenPaths.includes(newPath)
}, { immediate: true })
</script>
