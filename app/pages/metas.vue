<template>
  <div class="min-h-screen bg-[#faf9f5] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-claude-text dark:text-white mb-2">Metas de Estudo</h1>
        <p class="text-claude-text-secondary dark:text-gray-400">Defina e acompanhe suas metas de estudo</p>
      </div>

      <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-8 text-center">
        <div class="w-20 h-20 bg-claude-primary/20 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-claude-text dark:text-white mb-2">Em breve</h2>
        <p class="text-claude-text-secondary dark:text-gray-400">Esta funcionalidade está em desenvolvimento</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
