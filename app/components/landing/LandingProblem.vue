<template>
  <section class="py-20 bg-gradient-to-b from-dark-900 to-dark-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Problem Agitation -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Cansado de estudar <span class="text-red-400">sem resultado</span>?
        </h2>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          Você não está sozinho. A maioria dos concurseiros enfrenta os mesmos desafios...
        </p>
      </div>

      <!-- Pain Points -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <!-- Pain 1 -->
        <div class="bg-dark-700/50 border-2 border-red-500/30 rounded-2xl p-8 hover:border-red-500/50 transition-all">
          <div class="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-4xl">
            😰
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Desorganização Total</h3>
          <p class="text-gray-400">
            Cadernos perdidos, anotações espalhadas, sem saber o que estudar hoje.
            <span class="text-red-400 font-semibold">Você estuda muito mas não evolui.</span>
          </p>
        </div>

        <!-- Pain 2 -->
        <div class="bg-dark-700/50 border-2 border-red-500/30 rounded-2xl p-8 hover:border-red-500/50 transition-all">
          <div class="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-4xl">
            😔
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Esquece Tudo</h3>
          <p class="text-gray-400">
            Estudou ontem mas já esqueceu hoje. Sem método de revisão,
            <span class="text-red-400 font-semibold">seu esforço vai pelo ralo.</span>
          </p>
        </div>

        <!-- Pain 3 -->
        <div class="bg-dark-700/50 border-2 border-red-500/30 rounded-2xl p-8 hover:border-red-500/50 transition-all">
          <div class="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-4xl">
            😩
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Dúvidas Sem Fim</h3>
          <p class="text-gray-400">
            Fica travado em dúvidas, não tem quem te ajudar 24/7.
            <span class="text-red-400 font-semibold">Perde tempo precioso.</span>
          </p>
        </div>
      </div>

      <!-- Transition -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary-500/20 to-primary-400/20 rounded-full border border-primary-500/30">
          <svg class="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
          <span class="text-xl font-semibold text-white">Mas e se existisse uma solução?</span>
          <svg class="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </div>

      <!-- Solution -->
      <div class="bg-gradient-to-br from-primary-900/40 to-primary-800/40 border-2 border-primary-500/50 rounded-3xl p-12">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Solution copy -->
          <div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6">
              <span class="text-white">Apresentamos o</span>
              <br>
              <span class="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                PraPassar
              </span>
            </h2>
            <p class="text-xl text-gray-300 mb-8">
              A plataforma completa que transforma <span class="text-primary-400 font-semibold">caos em organização</span>,
              <span class="text-primary-400 font-semibold">esquecimento em retenção</span> e
              <span class="text-primary-400 font-semibold">dúvidas em certezas</span>.
            </p>

            <div class="space-y-4">
              <!-- Benefit 1 -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white mb-1">Sistema Completo de Organização</h4>
                  <p class="text-gray-400">Cadernos digitais, cronômetro Pomodoro, calendário inteligente e Kanban - tudo integrado</p>
                </div>
              </div>

              <!-- Benefit 2 -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white mb-1">Método Científico R1-R7</h4>
                  <p class="text-gray-400">Revisões automatizadas baseadas em repetição espaçada - você NUNCA mais esquece</p>
                </div>
              </div>

              <!-- Benefit 3 -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-white mb-1">Inteligência Artificial 24/7</h4>
                  <p class="text-gray-400">Tutor IA que responde dúvidas, cria exercícios personalizados e gera mapas mentais instantaneamente</p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <NuxtLink
                to="/register"
                class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Quero Transformar Meus Estudos
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </NuxtLink>
            </div>
          </div>

          <!-- Right: Visual comparison -->
          <div class="space-y-6">
            <!-- Before -->
            <div class="bg-dark-700/50 rounded-2xl p-6 border-2 border-red-500/30">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">😰</span>
                <h4 class="text-xl font-bold text-white">Antes</h4>
              </div>
              <ul class="space-y-2 text-gray-400">
                <li class="flex items-start gap-2">
                  <span class="text-red-500 mt-1">✗</span>
                  <span>Estudando 8h/dia sem método</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500 mt-1">✗</span>
                  <span>Esquecendo tudo em 2 semanas</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500 mt-1">✗</span>
                  <span>Dúvidas acumulando sem fim</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500 mt-1">✗</span>
                  <span>Ansiedade e frustração constante</span>
                </li>
              </ul>
            </div>

            <!-- After -->
            <div class="bg-gradient-to-br from-primary-900/30 to-primary-800/20 rounded-2xl p-6 border-2 border-primary-500/50">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🎯</span>
                <h4 class="text-xl font-bold text-white">Com PraPassar</h4>
              </div>
              <ul class="space-y-2 text-gray-300">
                <li class="flex items-start gap-2">
                  <span class="text-primary-300 mt-1">✓</span>
                  <span><strong>4h/dia focado</strong> com método comprovado</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-300 mt-1">✓</span>
                  <span><strong>Retenção de 90%+</strong> com R1-R7</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-300 mt-1">✓</span>
                  <span><strong>IA tira dúvidas</strong> em segundos 24/7</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-300 mt-1">✓</span>
                  <span><strong>Confiança e progresso</strong> visíveis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Problem → Solution section with emotional agitation
</script>
