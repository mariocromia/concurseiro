<template>
  <section class="py-20 bg-dark-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Tudo que você precisa em <span class="text-primary-400">um só lugar</span>
        </h2>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          Pare de usar 5 aplicativos diferentes. PraPassar reúne as melhores ferramentas para sua aprovação.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1: Organization -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
            📚
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Caderno Digital Infinito</h3>
          <p class="text-gray-400 mb-4">
            Anote tudo sem limite. Organize por matérias, adicione imagens, destaque importante. Acesse de qualquer lugar.
          </p>
          <div class="text-primary-400 font-semibold">→ Fim das anotações perdidas</div>
        </div>

        <!-- Feature 2: Spaced Repetition -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-green-500/20 hover:border-green-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
            🧠
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Sistema R1-R7 Automático</h3>
          <p class="text-gray-400 mb-4">
            Revisões espaçadas cientificamente comprovadas. O sistema avisa quando revisar cada matéria. Retenção garantida.
          </p>
          <div class="text-green-400 font-semibold">→ 90%+ de retenção do conteúdo</div>
        </div>

        <!-- Feature 3: AI Tutor -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-blue-500/20 hover:border-blue-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
            🤖
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Tutor IA 24/7</h3>
          <p class="text-gray-400 mb-4">
            Dúvida às 3h da manhã? A IA responde instantaneamente. Explica conceitos complexos de forma simples. Sempre disponível.
          </p>
          <div class="text-blue-400 font-semibold">→ Nunca mais fique travado</div>
        </div>

        <!-- Feature 4: Flashcards -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
            🎴
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Flashcards Gamificados</h3>
          <p class="text-gray-400 mb-4">
            Memorize conceitos difíceis de forma divertida. Sistema de pontuação e streak para manter motivação alta.
          </p>
          <div class="text-purple-400 font-semibold">→ Aprendizado eficiente e divertido</div>
        </div>

        <!-- Feature 5: Simulations -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-orange-500/20 hover:border-orange-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
            ✍️
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Simulados Reais</h3>
          <p class="text-gray-400 mb-4">
            Pratique com questões estilo banca. Cronômetro, pontuação automática, análise de desempenho. Chegue preparado.
          </p>
          <div class="text-orange-400 font-semibold">→ Confiança no dia da prova</div>
        </div>

        <!-- Feature 6: Mind Maps -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-pink-500/20 hover:border-pink-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
            🗺️
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Mapas Mentais com IA</h3>
          <p class="text-gray-400 mb-4">
            IA gera mapas mentais completos em segundos. Visualize conexões, entenda melhor. Transforme texto em conhecimento.
          </p>
          <div class="text-pink-400 font-semibold">→ Compreensão profunda em minutos</div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center mt-16">
        <NuxtLink
          to="/register"
          class="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-primary-500/50 transform hover:scale-105 transition-all"
        >
          Experimentar Todas as Ferramentas Grátis
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </NuxtLink>
        <p class="text-gray-400 mt-4">14 dias grátis • Sem cartão de crédito • Cancele quando quiser</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Features as benefits, not technical specs
</script>
