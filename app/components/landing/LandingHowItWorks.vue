<template>
  <section class="py-20 bg-gradient-to-b from-dark-800 to-dark-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Como funciona? <span class="text-primary-400">Simples demais.</span>
        </h2>
        <p class="text-xl text-gray-300">Em 3 passos você está pronto para estudar com método</p>
      </div>

      <div class="grid md:grid-cols-3 gap-12">
        <!-- Step 1 -->
        <div class="relative">
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-white shadow-2xl">
              1
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Cadastre-se Grátis</h3>
            <p class="text-gray-400">
              30 segundos. Sem cartão de crédito. 14 dias para testar tudo sem compromisso.
            </p>
          </div>
          <div class="hidden md:block absolute top-10 -right-6 text-6xl text-primary-500/30">→</div>
        </div>

        <!-- Step 2 -->
        <div class="relative">
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-white shadow-2xl">
              2
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Configure Suas Matérias</h3>
            <p class="text-gray-400">
              Adicione as disciplinas do seu concurso. O sistema já cria o cronograma de revisões.
            </p>
          </div>
          <div class="hidden md:block absolute top-10 -right-6 text-6xl text-blue-500/30">→</div>
        </div>

        <!-- Step 3 -->
        <div>
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-white shadow-2xl">
              3
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Comece a Estudar!</h3>
            <p class="text-gray-400">
              Sistema te guia: o que estudar hoje, quando revisar, exercícios personalizados. Só seguir.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center mt-16 pt-12 border-t border-white/10">
        <div class="mb-6 text-6xl">🎯</div>
        <p class="text-2xl text-white mb-8">
          Pronto para começar sua <span class="text-primary-400 font-bold">jornada rumo à aprovação</span>?
        </p>
        <NuxtLink
          to="/register"
          class="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all"
        >
          Sim, Quero Passar em 2025!
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// How it works - 3 simple steps to reduce friction
</script>
