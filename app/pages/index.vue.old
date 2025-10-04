<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">


    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          <span class="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Estude com
          </span>
          <span class="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Inteligência
          </span>
        </h1>
        <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          A plataforma definitiva para quem quer ser aprovado em concursos e vestibulares. Organização, revisão científica e IA em um só lugar.
        </p>
        <NuxtLink
          to="/register"
          class="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
        >
          Começar Gratuitamente
        </NuxtLink>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-3 gap-8 mt-20">
        <div class="bg-dark-800 border border-dark-700 p-8 rounded-xl hover:border-primary-500/50 transition-all group">
          <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-xl mb-3 text-white">Organização Visual</h3>
          <p class="text-gray-400">Planejamento estruturado com caderno virtual, cronômetro de foco e dashboard intuitivo</p>
        </div>

        <div class="bg-dark-800 border border-dark-700 p-8 rounded-xl hover:border-primary-500/50 transition-all group">
          <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-xl mb-3 text-white">Retenção Científica</h3>
          <p class="text-gray-400">Sistema de revisão automatizada (R1, R2, R3...) baseado em repetição espaçada</p>
        </div>

        <div class="bg-dark-800 border border-dark-700 p-8 rounded-xl hover:border-primary-500/50 transition-all group">
          <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-xl mb-3 text-white">IA Ativa</h3>
          <p class="text-gray-400">Tutor inteligente contextualizado e banco infinito de questões personalizadas</p>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-20 grid grid-cols-3 gap-8 p-8 bg-dark-800/50 border border-dark-700 rounded-xl">
        <div class="text-center">
          <div class="text-4xl font-bold text-primary-500 mb-2">∞</div>
          <div class="text-gray-400">Questões Geradas</div>
        </div>
        <div class="text-center border-l border-r border-dark-700">
          <div class="text-4xl font-bold text-primary-500 mb-2">R1→R7</div>
          <div class="text-gray-400">Sistema de Revisões</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-primary-500 mb-2">24/7</div>
          <div class="text-gray-400">Tutor IA Disponível</div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-dark-700 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500">
        <p>&copy; 2025 Concurseiro. Desenvolvido para aprovação.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

// Redirecionar para dashboard se já estiver logado
watchEffect(() => {
  if (user.value) {
    navigateTo('/dashboard')
  }
})
</script>
