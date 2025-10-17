<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Header/Navigation -->
    <nav class="border-b border-dark-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="flex items-center">
          <img src="/img/prapassar_logo1.png" alt="PraPassar Logo" class="h-10 w-auto">
        </NuxtLink>
        <div class="flex gap-4">
          <NuxtLink
            to="/login"
            class="px-4 py-2 text-claude-text-secondary dark:text-gray-300 hover:text-claude-text dark:text-white transition"
          >
            Entrar
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="px-4 py-2 bg-primary-600 text-claude-text dark:text-white rounded-claude-md hover:bg-primary-500 transition"
          >
            Começar Grátis
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          <span class="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Escolha seu
          </span>
          <span class="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Plano
          </span>
        </h1>
        <p class="text-xl text-claude-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
          Invista na sua aprovação. Escolha o plano ideal para seus estudos.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        <!-- Plano Plus -->
        <div class="bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500/50 transition-all">
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-claude-text dark:text-white mb-2">Plano Plus</h3>
            <p class="text-claude-text-secondary dark:text-gray-400">Acesso completo à plataforma</p>
          </div>

          <div class="mb-8">
            <div class="flex items-baseline gap-2">
              <span class="text-5xl font-bold text-claude-text dark:text-white">R$ 24,90</span>
              <span class="text-claude-text-secondary dark:text-gray-400">/mês</span>
            </div>
          </div>

          <NuxtLink
            to="/checkout?plan=plus"
            class="block w-full py-4 bg-dark-700 text-claude-text dark:text-white rounded-claude-md font-semibold hover:bg-dark-600 transition-all text-center border border-dark-600"
          >
            Assinar Agora
          </NuxtLink>

          <div class="mt-8 space-y-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Acesso completo à plataforma</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Caderno de estudos ilimitado</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Timer Pomodoro</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Calendário de estudos</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Flashcards</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Relatórios de desempenho</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text-secondary dark:text-gray-300">Suporte por email</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="text-gray-600 dark:text-gray-500 line-through">Recursos de IA</span>
            </div>
          </div>
        </div>

        <!-- Plano Pro (Recomendado) -->
        <div class="bg-gradient-to-br from-primary-900/50 to-primary-800/30 border-2 border-claude-primary dark:border-primary-500 rounded-2xl p-8 relative transform hover:scale-105 transition-all shadow-2xl shadow-primary-500/20">
          <!-- Badge Recomendado -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              RECOMENDADO
            </span>
          </div>

          <div class="mb-6 mt-4">
            <h3 class="text-2xl font-bold text-claude-text dark:text-white mb-2">Plano Pro</h3>
            <p class="text-primary-200">Tudo do Plus + IA completa</p>
          </div>

          <div class="mb-8">
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-5xl font-bold text-claude-text dark:text-white">R$ 44,90</span>
              <span class="text-primary-200">/mês</span>
            </div>
            <div class="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold border border-green-500/30">
              ✨ 14 DIAS GRÁTIS
            </div>
          </div>

          <NuxtLink
            to="/checkout?plan=pro"
            class="block w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-claude-text dark:text-white rounded-claude-md font-semibold hover:from-primary-500 hover:to-primary-400 transition-all text-center shadow-lg shadow-primary-500/30"
          >
            Começar Grátis
          </NuxtLink>

          <div class="mt-8 space-y-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-claude-text dark:text-white font-semibold">Tudo do Plano Plus, mais:</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-primary-100">Assistente de IA contextualizado</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-primary-100">Gerador de resumos com IA</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-primary-100">Gerador infinito de questões personalizadas</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-primary-100">Gerador de flashcards com IA</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-primary-100">Chat IA para tirar dúvidas</span>
            </div>
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-primary-100">Análises preditivas com IA</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-claude-text dark:text-white mb-12">Perguntas Frequentes</h2>

        <div class="space-y-4">
          <details class="bg-dark-800 border border-dark-700 rounded-claude-md p-6 group">
            <summary class="cursor-pointer font-semibold text-claude-text dark:text-white flex justify-between items-center">
              Como funciona o trial de 14 dias?
              <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <p class="mt-4 text-claude-text-secondary dark:text-gray-400">
              Ao escolher o Plano Pro, você tem 14 dias para testar todas as funcionalidades sem custo algum. Não é necessário cartão de crédito para iniciar o trial. Após os 14 dias, se desejar continuar, basta inserir os dados de pagamento.
            </p>
          </details>

          <details class="bg-dark-800 border border-dark-700 rounded-claude-md p-6 group">
            <summary class="cursor-pointer font-semibold text-claude-text dark:text-white flex justify-between items-center">
              Posso cancelar a qualquer momento?
              <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <p class="mt-4 text-claude-text-secondary dark:text-gray-400">
              Sim! Você pode cancelar sua assinatura a qualquer momento pelo painel de controle. Ao cancelar, você continuará tendo acesso até o final do período pago.
            </p>
          </details>

          <details class="bg-dark-800 border border-dark-700 rounded-claude-md p-6 group">
            <summary class="cursor-pointer font-semibold text-claude-text dark:text-white flex justify-between items-center">
              Posso fazer upgrade do Plus para o Pro?
              <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <p class="mt-4 text-claude-text-secondary dark:text-gray-400">
              Com certeza! Você pode fazer upgrade ou downgrade entre os planos a qualquer momento. O ajuste será feito na próxima cobrança.
            </p>
          </details>

          <details class="bg-dark-800 border border-dark-700 rounded-claude-md p-6 group">
            <summary class="cursor-pointer font-semibold text-claude-text dark:text-white flex justify-between items-center">
              Quais formas de pagamento são aceitas?
              <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <p class="mt-4 text-claude-text-secondary dark:text-gray-400">
              Aceitamos cartão de crédito, PIX e boleto bancário. Todas as transações são processadas de forma segura através do Asaas.
            </p>
          </details>

          <details class="bg-dark-800 border border-dark-700 rounded-claude-md p-6 group">
            <summary class="cursor-pointer font-semibold text-claude-text dark:text-white flex justify-between items-center">
              Meus dados estão seguros?
              <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <p class="mt-4 text-claude-text-secondary dark:text-gray-400">
              Sim! Utilizamos criptografia de ponta a ponta e nosso sistema de pagamento é certificado PCI DSS. Seus dados pessoais e de pagamento estão completamente seguros.
            </p>
          </details>
        </div>
      </div>

      <!-- Final CTA -->
      <div class="mt-20 text-center bg-dark-800 border border-dark-700 rounded-2xl p-12">
        <h3 class="text-3xl font-bold text-claude-text dark:text-white mb-4">
          Ainda tem dúvidas?
        </h3>
        <p class="text-claude-text-secondary dark:text-gray-400 mb-6">
          Entre em contato conosco pelo email contato@concurseiro.com
        </p>
        <NuxtLink
          to="/register"
          class="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-claude-text dark:text-white rounded-claude-md font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/30"
        >
          Começar Agora
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-dark-700 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p class="text-gray-600 dark:text-gray-500 text-sm">&copy; 2025 PraPassar. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// SEO
useHead({
  title: 'Planos e Preços - PraPassar',
  meta: [
    {
      name: 'description',
      content: 'Escolha o plano ideal para seus estudos. Plano Plus a partir de R$ 24,90/mês ou Plano Pro com IA por R$ 44,90/mês com 14 dias grátis.'
    }
  ]
})
</script>
