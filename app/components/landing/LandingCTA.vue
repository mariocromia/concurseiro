<template>
  <section class="relative py-24 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Urgency badge -->
      <div class="inline-flex items-center gap-2 px-6 py-3 bg-primary-400/20 backdrop-blur-sm rounded-full mb-8 border border-primary-400/50 animate-pulse">
        <svg class="w-6 h-6 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
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
          <svg class="w-6 h-6 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">Acesso imediato</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">Sem burocracia</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-semibold">Suporte 24/7</span>
        </div>
      </div>

      <!-- Guarantee -->
      <div class="mt-16 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
        <div class="flex items-center justify-center gap-4 mb-4">
          <svg class="w-16 h-16 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
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
