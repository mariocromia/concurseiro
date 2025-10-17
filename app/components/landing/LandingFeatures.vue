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
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Caderno Digital Infinito</h3>
          <p class="text-gray-400 mb-4">
            Anote tudo sem limite. Organize por matérias, adicione imagens, destaque importante. Acesse de qualquer lugar.
          </p>
          <div class="text-primary-400 font-semibold">→ Fim das anotações perdidas</div>
        </div>

        <!-- Feature 2: Spaced Repetition -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Sistema R1-R7 Automático</h3>
          <p class="text-gray-400 mb-4">
            Revisões espaçadas cientificamente comprovadas. O sistema avisa quando revisar cada matéria. Retenção garantida.
          </p>
          <div class="text-primary-400 font-semibold">→ 90%+ de retenção do conteúdo</div>
        </div>

        <!-- Feature 3: AI Tutor -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Tutor IA 24/7</h3>
          <p class="text-gray-400 mb-4">
            Dúvida às 3h da manhã? A IA responde instantaneamente. Explica conceitos complexos de forma simples. Sempre disponível.
          </p>
          <div class="text-primary-400 font-semibold">→ Nunca mais fique travado</div>
        </div>

        <!-- Feature 4: Flashcards -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Flashcards Gamificados</h3>
          <p class="text-gray-400 mb-4">
            Memorize conceitos difíceis de forma divertida. Sistema de pontuação e streak para manter motivação alta.
          </p>
          <div class="text-primary-400 font-semibold">→ Aprendizado eficiente e divertido</div>
        </div>

        <!-- Feature 5: Simulations -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Simulados Reais</h3>
          <p class="text-gray-400 mb-4">
            Pratique com questões estilo banca. Cronômetro, pontuação automática, análise de desempenho. Chegue preparado.
          </p>
          <div class="text-primary-400 font-semibold">→ Confiança no dia da prova</div>
        </div>

        <!-- Feature 6: Mind Maps -->
        <div class="group bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Mapas Mentais com IA</h3>
          <p class="text-gray-400 mb-4">
            IA gera mapas mentais completos em segundos. Visualize conexões, entenda melhor. Transforme texto em conhecimento.
          </p>
          <div class="text-primary-400 font-semibold">→ Compreensão profunda em minutos</div>
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
