<template>
  <div class="min-h-screen bg-dark-900">
    <AdminMenu />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p class="text-gray-400">Métricas e análises de uso da plataforma</p>
      </div>

      <!-- Coming Soon -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg p-12 text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="text-2xl font-bold text-white mb-2">Em Breve</h3>
        <p class="text-gray-400 mb-6">Estamos trabalhando em métricas detalhadas de uso</p>
        <div class="inline-flex items-center space-x-2 text-sm text-primary-400">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Implementação em progresso</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
</script>
