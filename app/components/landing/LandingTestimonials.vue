<template>
  <section class="py-20 bg-dark-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Quem usa <span class="text-primary-400">aprova</span>
        </h2>
        <p class="text-xl text-gray-300">Veja o que concurseiros aprovados falam sobre o PraPassar</p>
      </div>

      <!-- Stats -->
      <div class="grid md:grid-cols-4 gap-8 mb-16">
        <div class="text-center">
          <div class="text-5xl font-bold text-primary-400 mb-2">10k+</div>
          <div class="text-gray-400">Usuários Ativos</div>
        </div>
        <div class="text-center">
          <div class="text-5xl font-bold text-green-400 mb-2">2.5k+</div>
          <div class="text-gray-400">Aprovados em 2024</div>
        </div>
        <div class="text-center">
          <div class="text-5xl font-bold text-blue-400 mb-2">4.9/5</div>
          <div class="text-gray-400">Avaliação Média</div>
        </div>
        <div class="text-center">
          <div class="text-5xl font-bold text-purple-400 mb-2">92%</div>
          <div class="text-gray-400">Taxa de Retenção</div>
        </div>
      </div>

      <!-- Testimonials -->
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border border-primary-500/20">
          <div class="flex items-center gap-1 text-yellow-400 mb-4">
            <span class="text-2xl">⭐⭐⭐⭐⭐</span>
          </div>
          <p class="text-gray-300 mb-6 italic">
            "Passei no TRT depois de 2 anos tentando. O sistema R1-R7 mudou tudo! Antes eu esquecia, agora fixo de verdade."
          </p>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">MC</div>
            <div>
              <div class="text-white font-semibold">Maria Clara</div>
              <div class="text-gray-400 text-sm">Aprovada TRT-SP</div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border border-green-500/20">
          <div class="flex items-center gap-1 text-yellow-400 mb-4">
            <span class="text-2xl">⭐⭐⭐⭐⭐</span>
          </div>
          <p class="text-gray-300 mb-6 italic">
            "A IA é sensacional! Tiro dúvidas de madrugada, gero exercícios personalizados. É como ter um professor particular 24/7."
          </p>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">RS</div>
            <div>
              <div class="text-white font-semibold">Rafael Santos</div>
              <div class="text-gray-400 text-sm">Aprovado INSS</div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl p-8 border border-blue-500/20">
          <div class="flex items-center gap-1 text-yellow-400 mb-4">
            <span class="text-2xl">⭐⭐⭐⭐⭐</span>
          </div>
          <p class="text-gray-300 mb-6 italic">
            "Finalmente consigo me organizar! Antes usava 5 apps. Agora está tudo aqui: caderno, cronômetro, simulados, revisões."
          </p>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">JP</div>
            <div>
              <div class="text-white font-semibold">Juliana Pereira</div>
              <div class="text-gray-400 text-sm">Aprovada PC-RJ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Social proof with real testimonials (placeholders)
</script>
