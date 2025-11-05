<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-6">
    <div class="max-w-lg w-full bg-dark-800/70 border border-dark-700 rounded-2xl shadow-2xl p-10 text-center space-y-6">
      <div class="mx-auto w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center">
        <svg class="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-white">Programa de afiliados indisponível</h1>
        <p class="text-gray-300">
          No momento não estamos aceitando novos afiliados. Se você já faz parte do programa, continue acessando normalmente pelo painel.
          Em caso de dúvidas, fale com nosso suporte.
        </p>
      </div>

      <NuxtLink
        to="/dashboard"
        class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold transition"
      >
        Voltar ao dashboard
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
