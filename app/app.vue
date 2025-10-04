<template>
  <div>
    <ClientOnly>
      <ModernNav v-if="showNav" />
      <FloatingTimer />
      <WhatsAppButton />
    </ClientOnly>
    <NuxtPage />
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
