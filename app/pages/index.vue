<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#2b3544] to-[#1a2332]">
    <!-- Header Navigation -->
    <header class="fixed top-0 w-full bg-[#1a2332]/95 backdrop-blur-sm border-b border-teal-500/20 z-50">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">
              Pra<span class="text-teal-400">Passar</span>
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/login" class="text-gray-300 hover:text-teal-400 transition-colors">
              Entrar
            </NuxtLink>
            <NuxtLink to="/register" class="px-6 py-2 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all">
              Começar Grátis
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section with VSL -->
    <section class="pt-32 pb-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-12">
          <!-- Headline Principal -->
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Passe no seu <span class="bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">Concurso</span><br/>
            em <span class="text-amber-400">2025</span>
          </h1>

          <!-- Sub-headline -->
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A única plataforma que combina <span class="text-teal-400 font-semibold">Inteligência Artificial</span>,
            <span class="text-blue-400 font-semibold">Método Científico R1-R7</span> e
            <span class="text-amber-400 font-semibold">Organização Inteligente</span> para garantir sua aprovação.
          </p>

          <!-- Trust Badge -->
          <div class="flex items-center justify-center space-x-4 mb-8">
            <div class="flex -space-x-2">
              <div class="w-10 h-10 bg-teal-500 rounded-full border-2 border-[#1a2332]"></div>
              <div class="w-10 h-10 bg-blue-500 rounded-full border-2 border-[#1a2332]"></div>
              <div class="w-10 h-10 bg-green-500 rounded-full border-2 border-[#1a2332]"></div>
            </div>
            <p class="text-gray-400">
              <span class="text-white font-bold">10.247</span> aprovados em 2024
            </p>
          </div>
        </div>

        <!-- VSL Video Player -->
        <div class="max-w-4xl mx-auto mb-12">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl shadow-teal-500/20 border border-teal-500/10">
            <!-- YouTube Embed -->
            <div class="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/zJ2hbbUc6rM?autoplay=0&rel=0&modestbranding=1"
                title="PraPassar - Sua aprovação em 2025"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                class="w-full h-full"
              ></iframe>
            </div>
          </div>
          <!-- Video Caption -->
          <div class="text-center mt-4">
            <p class="text-white text-lg font-semibold mb-2">Assista ao vídeo de 2 minutos</p>
            <p class="text-gray-400">Descubra o método que já aprovou milhares de concurseiros</p>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="text-center space-y-4">
          <NuxtLink to="/register" class="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white text-lg font-bold rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transform hover:scale-105 transition-all">
            Começar 14 Dias Grátis
          </NuxtLink>
          <p class="text-gray-400 text-sm">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>

    <!-- Benefícios Section -->
    <section class="py-20 px-4 bg-[#2b3544]/30">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          Por que o <span class="text-teal-400">PraPassar</span> funciona?
        </h2>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Benefício 1 -->
          <div class="bg-[#1a2332]/80 backdrop-blur-sm rounded-xl p-6 border border-teal-500/20 hover:border-teal-500/40 transition-all hover:shadow-lg hover:shadow-teal-500/10">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">IA Personalizada</h3>
            <p class="text-gray-400">
              Tutor pessoal 24h que conhece suas dificuldades e cria exercícios sob medida para você.
            </p>
          </div>

          <!-- Benefício 2 -->
          <div class="bg-[#1a2332]/80 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Método R1-R7</h3>
            <p class="text-gray-400">
              Sistema científico de revisões espaçadas que faz você memorizar 7x mais conteúdo.
            </p>
          </div>

          <!-- Benefício 3 -->
          <div class="bg-[#1a2332]/80 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/10">
            <div class="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Relatórios Detalhados</h3>
            <p class="text-gray-400">
              Acompanhe seu progresso em tempo real e saiba exatamente onde focar seus estudos.
            </p>
          </div>

          <!-- Benefício 4 -->
          <div class="bg-[#1a2332]/80 backdrop-blur-sm rounded-xl p-6 border border-teal-500/20 hover:border-teal-500/40 transition-all hover:shadow-lg hover:shadow-teal-500/10">
            <div class="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Calendário Inteligente</h3>
            <p class="text-gray-400">
              Organize seus estudos com nosso calendário que se adapta à sua rotina e metas.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demonstração do App -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
              Veja o <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">PraPassar</span> em ação
            </h2>
            <p class="text-xl text-gray-300 mb-8">
              Uma plataforma completa que transforma sua preparação em aprovação garantida.
            </p>

            <div class="space-y-4">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-1">Cadernos Virtuais Ilimitados</h3>
                  <p class="text-gray-400">Organize todo seu material de estudo em um só lugar.</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-1">Simulados Personalizados</h3>
                  <p class="text-gray-400">Pratique com questões específicas do seu concurso.</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-1">Timer Pomodoro Integrado</h3>
                  <p class="text-gray-400">Estude com foco total usando técnicas cientificamente comprovadas.</p>
                </div>
              </div>
            </div>

            <NuxtLink to="/register" class="inline-block mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Experimentar Grátis →
            </NuxtLink>
          </div>

          <div class="relative">
            <!-- App Screenshot/Demo -->
            <div class="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/20">
              <img
                src="/tela.JPG"
                alt="Dashboard do PraPassar - Sistema de Estudos"
                class="w-full h-auto object-cover"
              />
            </div>

            <!-- Floating Elements -->
            <div class="absolute -top-4 -right-4 bg-gradient-to-br from-teal-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
              100% Online
            </div>
            <div class="absolute -bottom-4 -left-4 bg-gradient-to-br from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
              Acesso Vitalício
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 px-4 bg-[#2b3544]/30">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          Histórias de <span class="text-teal-400">Sucesso</span>
        </h2>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Testimonial 1 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-4"></div>
              <div>
                <p class="font-semibold text-white">Maria Silva</p>
                <p class="text-sm text-gray-400">Aprovada - Banco do Brasil</p>
              </div>
            </div>
            <p class="text-gray-300 italic">
              "O sistema R1-R7 mudou completamente minha forma de estudar. Em 8 meses consegui minha aprovação!"
            </p>
            <div class="flex mt-4 text-yellow-400">
              ⭐⭐⭐⭐⭐
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mr-4"></div>
              <div>
                <p class="font-semibold text-white">João Pedro</p>
                <p class="text-sm text-gray-400">Aprovado - Polícia Federal</p>
              </div>
            </div>
            <p class="text-gray-300 italic">
              "A IA me ajudou a identificar meus pontos fracos e criar um plano de estudos perfeito. Recomendo!"
            </p>
            <div class="flex mt-4 text-yellow-400">
              ⭐⭐⭐⭐⭐
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mr-4"></div>
              <div>
                <p class="font-semibold text-white">Ana Carolina</p>
                <p class="text-sm text-gray-400">Aprovada - TRF</p>
              </div>
            </div>
            <p class="text-gray-300 italic">
              "Os simulados e o calendário inteligente me mantiveram focada. Passei em 3º lugar!"
            </p>
            <div class="flex mt-4 text-yellow-400">
              ⭐⭐⭐⭐⭐
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl md:text-5xl font-bold text-center text-white mb-6">
          Escolha seu <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Plano</span>
        </h2>
        <p class="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Comece grátis e evolua conforme sua necessidade. Cancele quando quiser.
        </p>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Free Plan -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 class="text-2xl font-bold text-white mb-2">Grátis</h3>
            <div class="mb-6">
              <span class="text-4xl font-bold text-white">R$ 0</span>
              <span class="text-gray-400">/mês</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                3 Cadernos virtuais
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Timer básico
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Relatórios simples
              </li>
            </ul>
            <button class="w-full py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-all">
              Começar Agora
            </button>
          </div>

          <!-- Plus Plan (Destacado) -->
          <div class="bg-gradient-to-br from-teal-900/30 to-green-900/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-teal-500 relative transform scale-105">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              MAIS POPULAR
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Plus</h3>
            <div class="mb-6">
              <span class="text-4xl font-bold text-white">R$ 24</span>
              <span class="text-gray-400">,90/mês</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Cadernos ilimitados
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Sistema R1-R7 completo
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Calendário inteligente
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Timer Pomodoro
              </li>
            </ul>
            <button class="w-full py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all">
              Começar 14 Dias Grátis
            </button>
          </div>

          <!-- Pro Plan -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-700">
            <h3 class="text-2xl font-bold text-white mb-2">Pro</h3>
            <div class="mb-6">
              <span class="text-4xl font-bold text-white">R$ 39</span>
              <span class="text-gray-400">,90/mês</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Tudo do Plus
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="font-semibold">IA Tutor 24h</span>
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Mapas mentais IA
              </li>
              <li class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Questões ilimitadas
              </li>
            </ul>
            <button class="w-full py-3 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-900/20 transition-all">
              Começar 14 Dias Grátis
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-20 px-4 bg-[#2b3544]/30">
      <div class="container mx-auto max-w-4xl">
        <h2 class="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          Perguntas <span class="text-teal-400">Frequentes</span>
        </h2>

        <div class="space-y-6">
          <!-- FAQ Item 1 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 class="text-xl font-semibold text-white mb-3">
              Posso cancelar a qualquer momento?
            </h3>
            <p class="text-gray-400">
              Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. O acesso continua até o final do período pago.
            </p>
          </div>

          <!-- FAQ Item 2 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
            <h3 class="text-xl font-semibold text-white mb-3">
              O que é o método R1-R7?
            </h3>
            <p class="text-gray-400">
              É um sistema científico de revisões espaçadas baseado na curva do esquecimento. Você revisa o conteúdo em 1, 7, 14, 30, 60, 120 e 240 dias, garantindo memorização de longo prazo.
            </p>
          </div>

          <!-- FAQ Item 3 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
            <h3 class="text-xl font-semibold text-white mb-3">
              Preciso de cartão de crédito para testar?
            </h3>
            <p class="text-gray-400">
              Não! Você pode começar seu teste grátis de 14 dias sem precisar informar dados de pagamento. Só será cobrado se decidir continuar após o período de teste.
            </p>
          </div>

          <!-- FAQ Item 4 -->
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <h3 class="text-xl font-semibold text-white mb-3">
              Funciona para qualquer concurso?
            </h3>
            <p class="text-gray-400">
              Sim! O PraPassar é adaptável para qualquer concurso público, vestibular ou certificação. Você personaliza completamente de acordo com seu objetivo.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-4xl text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Sua aprovação começa <span class="text-teal-400">agora</span>
        </h2>
        <p class="text-xl text-gray-300 mb-8">
          Junte-se a mais de 10.000 concurseiros que já estão transformando seus estudos com o PraPassar.
        </p>

        <div class="space-y-4">
          <NuxtLink to="/register" class="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white text-lg font-bold rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transform hover:scale-105 transition-all">
            Começar Teste Grátis de 14 Dias
          </NuxtLink>
          <p class="text-gray-400">
            Não pedimos cartão de crédito • Cancele quando quiser
          </p>
        </div>

        <!-- Trust Badges -->
        <div class="flex flex-wrap justify-center items-center gap-8 mt-12">
          <div class="flex items-center space-x-2 text-gray-400">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>100% Seguro</span>
          </div>
          <div class="flex items-center space-x-2 text-gray-400">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
            <span>Garantia de 7 dias</span>
          </div>
          <div class="flex items-center space-x-2 text-gray-400">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <span>Suporte 24/7</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 border-t border-white/10">
      <div class="container mx-auto max-w-6xl">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <!-- Logo e Descrição -->
          <div class="md:col-span-2">
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-2xl font-bold text-white">
                Pra<span class="text-teal-400">Passar</span>
              </span>
            </div>
            <p class="text-gray-400">
              A plataforma completa para sua aprovação em concursos públicos e vestibulares.
            </p>
          </div>

          <!-- Links Úteis -->
          <div>
            <h3 class="text-white font-semibold mb-4">Links Úteis</h3>
            <ul class="space-y-2">
              <li><a href="/precos" class="text-gray-400 hover:text-white transition-colors">Preços</a></li>
              <li><a href="/login" class="text-gray-400 hover:text-white transition-colors">Entrar</a></li>
              <li><a href="/register" class="text-gray-400 hover:text-white transition-colors">Cadastrar</a></li>
            </ul>
          </div>

          <!-- Contato -->
          <div>
            <h3 class="text-white font-semibold mb-4">Contato</h3>
            <ul class="space-y-2">
              <li class="text-gray-400">contato@prapassar.com</li>
              <li class="text-gray-400">WhatsApp: (11) 99999-9999</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-white/10 pt-8 text-center text-gray-400">
          <p>&copy; 2025 PraPassar. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/5511999999999" target="_blank" class="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all">
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
      <span class="font-semibold">WhatsApp</span>
    </a>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
useHead({
  title: 'PraPassar - Passe no seu Concurso em 2025 | Plataforma com IA',
  meta: [
    {
      name: 'description',
      content: 'A única plataforma que une organização inteligente, método científico R1-R7 e Inteligência Artificial para sua aprovação. Teste grátis por 14 dias!'
    },
    {
      property: 'og:title',
      content: 'PraPassar - Sua Aprovação em 2025'
    },
    {
      property: 'og:description',
      content: 'Organização + Ciência + IA = Aprovação. Mais de 10.000 aprovados.'
    },
    {
      property: 'og:image',
      content: '/og-image.png'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})

// Check if user is logged in and redirect
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) {
    navigateTo('/dashboard')
  }
})

// Smooth scroll for anchor links
onMounted(() => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
})
</script>

<style scoped>
/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: .5; }
  100% { opacity: 1; }
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Gradient text animation */
.bg-clip-text {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-5xl {
    font-size: 2.5rem;
  }

  .text-7xl {
    font-size: 3rem;
  }
}
</style>