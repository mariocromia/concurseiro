<template>
  <section class="relative py-24 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900">
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Urgency badge -->
      <div class="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 backdrop-blur-sm rounded-full mb-8 border border-red-500/50 animate-pulse">
        <span class="text-2xl">🔥</span>
        <span class="text-white font-semibold">Vagas limitadas para o trial gratuito!</span>
      </div>

      <h2 class="text-5xl md:text-6xl font-bold text-white mb-6">
        Comece Sua Jornada Agora
      </h2>

      <p class="text-2xl text-white/90 mb-4">
        Junte-se a mais de <span class="font-bold text-primary-200">10.000 concurseiros</span> que já estudam com método
      </p>

      <p class="text-xl text-white/80 mb-12">
        14 dias grátis • Cancele quando quiser • Sem compromisso
      </p>

      <!-- Main CTA -->
      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
        <NuxtLink
          to="/register"
          class="group relative px-12 py-6 bg-white text-primary-900 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-110 transition-all duration-300 overflow-hidden"
        >
          <span class="relative z-10 flex items-center gap-3">
            COMEÇAR GRÁTIS AGORA
            <svg class="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </span>
          <div class="absolute inset-0 bg-primary-200 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </NuxtLink>
      </div>

      <!-- Trust indicators -->
      <div class="flex flex-wrap justify-center gap-8 text-white/80">
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">Acesso imediato</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">Sem burocracia</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">Suporte 24/7</span>
        </div>
      </div>

      <!-- Guarantee -->
      <div class="mt-16 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
        <div class="flex items-center justify-center gap-4 mb-4">
          <svg class="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <div class="text-left">
            <div class="text-white font-bold text-2xl">Garantia de 14 Dias</div>
            <div class="text-white/80">Se não gostar, cancele sem perguntas. Simples assim.</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Final CTA with urgency and guarantee
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
