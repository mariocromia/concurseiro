<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900">
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Copy -->
        <div class="text-center lg:text-left">
          <!-- Trust badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-white/90 text-sm font-medium">Usado por +10.000 aprovados</span>
          </div>

          <!-- Headline -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span class="text-white">Passe no seu</span>
            <br>
            <span class="bg-gradient-to-r from-primary-400 via-primary-300 to-blue-400 bg-clip-text text-transparent">
              Concurso
            </span>
            <br>
            <span class="text-white">em 2025</span>
          </h1>

          <!-- Subheadline -->
          <p class="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0">
            A única plataforma que une <span class="text-primary-300 font-semibold">organização inteligente</span>,
            <span class="text-primary-300 font-semibold">método científico comprovado</span> e
            <span class="text-primary-300 font-semibold">Inteligência Artificial</span> para sua aprovação.
          </p>

          <!-- CTA Primary -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
            <NuxtLink
              to="/register"
              class="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg shadow-2xl shadow-primary-500/50 hover:shadow-primary-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                Começar Grátis Agora
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </NuxtLink>

            <NuxtLink
              to="/precos"
              class="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              Ver Planos
            </NuxtLink>
          </div>

          <!-- Trust indicators -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/60 text-sm">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>14 dias grátis</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Sem cartão de crédito</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>

        <!-- Right: Visual / Mockup -->
        <div class="relative lg:block hidden">
          <div class="relative">
            <!-- Main device mockup -->
            <div class="relative z-10 transform hover:scale-105 transition-transform duration-500">
              <div class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <!-- Simulated dashboard -->
                <div class="space-y-4">
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full"></div>
                      <div>
                        <div class="h-3 w-24 bg-white/20 rounded mb-2"></div>
                        <div class="h-2 w-16 bg-white/10 rounded"></div>
                      </div>
                    </div>
                    <div class="w-8 h-8 bg-white/10 rounded-full"></div>
                  </div>

                  <!-- Stats cards -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gradient-to-br from-primary-500/20 to-primary-600/10 p-4 rounded-xl border border-primary-400/30">
                      <div class="h-2 w-16 bg-white/20 rounded mb-2"></div>
                      <div class="h-6 w-20 bg-white/30 rounded"></div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4 rounded-xl border border-blue-400/30">
                      <div class="h-2 w-16 bg-white/20 rounded mb-2"></div>
                      <div class="h-6 w-20 bg-white/30 rounded"></div>
                    </div>
                  </div>

                  <!-- Chart simulation -->
                  <div class="bg-white/5 p-4 rounded-xl">
                    <div class="h-32 flex items-end gap-2">
                      <div class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t" style="height: 60%"></div>
                      <div class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t" style="height: 80%"></div>
                      <div class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t" style="height: 100%"></div>
                      <div class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t" style="height: 75%"></div>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div class="space-y-2">
                    <div class="h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg opacity-80"></div>
                    <div class="h-10 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating elements -->
            <div class="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-80 animate-bounce" style="animation-duration: 3s">
              <div class="flex items-center justify-center h-full text-4xl">🎯</div>
            </div>
            <div class="absolute -bottom-6 -left-6 w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl opacity-80 animate-bounce" style="animation-duration: 3s; animation-delay: 0.5s">
              <div class="flex items-center justify-center h-full text-4xl">✅</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Hero section - above the fold conversion optimized
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 3s ease-in-out infinite;
}
</style>
