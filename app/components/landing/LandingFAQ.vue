<template>
  <section class="py-20 bg-dark-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Perguntas <span class="text-primary-400">Frequentes</span>
        </h2>
        <p class="text-xl text-gray-300">Tudo que você precisa saber antes de começar</p>
      </div>

      <div class="space-y-4">
        <details class="group bg-dark-800 rounded-xl border border-primary-500/20 hover:border-primary-500/50 transition-all" open>
          <summary class="cursor-pointer p-6 font-semibold text-lg text-white flex items-center justify-between">
            <span>💰 Preciso pagar para experimentar?</span>
            <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="px-6 pb-6 text-gray-400">
            <strong class="text-white">Não!</strong> Oferecemos 14 dias GRÁTIS com acesso completo. Sem pedir cartão de crédito. Teste tudo antes de decidir.
          </div>
        </details>

        <details class="group bg-dark-800 rounded-xl border border-primary-500/20 hover:border-primary-500/50 transition-all">
          <summary class="cursor-pointer p-6 font-semibold text-lg text-white flex items-center justify-between">
            <span>🎓 Funciona para qualquer concurso?</span>
            <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="px-6 pb-6 text-gray-400">
            <strong class="text-white">Sim!</strong> Federal, estadual, municipal, tribunais, polícia, vestibulares. Você personaliza as matérias do seu edital.
          </div>
        </details>

        <details class="group bg-dark-800 rounded-xl border border-primary-500/20 hover:border-primary-500/50 transition-all">
          <summary class="cursor-pointer p-6 font-semibold text-lg text-white flex items-center justify-between">
            <span>⏱️ Quanto tempo preciso dedicar por dia?</span>
            <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="px-6 pb-6 text-gray-400">
            O ideal são <strong class="text-white">3-4 horas focadas</strong> com nosso método. Melhor que 8h desorganizado. O sistema otimiza seu tempo.
          </div>
        </details>

        <details class="group bg-dark-800 rounded-xl border border-primary-500/20 hover:border-primary-500/50 transition-all">
          <summary class="cursor-pointer p-6 font-semibold text-lg text-white flex items-center justify-between">
            <span>📱 Funciona no celular?</span>
            <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="px-6 pb-6 text-gray-400">
            <strong class="text-white">Perfeitamente!</strong> Responsivo total. Estude no celular, tablet ou computador. Sincroniza automaticamente.
          </div>
        </details>

        <details class="group bg-dark-800 rounded-xl border border-primary-500/20 hover:border-primary-500/50 transition-all">
          <summary class="cursor-pointer p-6 font-semibold text-lg text-white flex items-center justify-between">
            <span>🤖 A IA realmente funciona bem?</span>
            <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="px-6 pb-6 text-gray-400">
            Usamos <strong class="text-white">Google Gemini</strong>, IA de última geração. Explica qualquer conceito, cria exercícios personalizados, gera mapas mentais. Responde em segundos.
          </div>
        </details>

        <details class="group bg-dark-800 rounded-xl border border-primary-500/20 hover:border-primary-500/50 transition-all">
          <summary class="cursor-pointer p-6 font-semibold text-lg text-white flex items-center justify-between">
            <span>❌ E se eu não gostar?</span>
            <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="px-6 pb-6 text-gray-400">
            <strong class="text-white">Cancele com 1 clique</strong>. Sem burocracias, sem perguntas, sem taxas. Seu dinheiro, sua decisão.
          </div>
        </details>
      </div>

      <!-- Final CTA -->
      <div class="text-center mt-12 pt-8 border-t border-white/10">
        <p class="text-gray-400 mb-6">Ainda tem dúvidas? Fale conosco no WhatsApp!</p>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          class="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Falar no WhatsApp
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// FAQ with objection handling
</script>
