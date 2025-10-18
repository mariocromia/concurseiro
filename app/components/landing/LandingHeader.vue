<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0">
          <Logo size="sm" class-name="transition-transform hover:scale-105" />
        </NuxtLink>

        <!-- Login Button -->
        <NuxtLink
          to="/login"
          class="group px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold text-sm md:text-base shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105"
        >
          <span class="flex items-center gap-2">
            Entrar
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
          </span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * LandingHeader - Cabeçalho limpo e minimalista para landing page
 *
 * Contém apenas o logo e botão "Entrar"
 * Design responsivo e moderno com efeitos de hover
 */
</script>

<style scoped>
/* Garantir que o header fique fixo e responsivo */
@media (max-width: 640px) {
  header {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
