<script setup lang="ts">
/**
 * InstanceBlockedModal - Modal exibido quando múltiplas instâncias são detectadas
 *
 * Bloqueia a funcionalidade da aplicação e informa o usuário sobre a situação.
 */

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const closeCurrentTab = () => {
  window.close()
  // Se window.close() não funcionar (em algumas situações de segurança)
  // redireciona para uma página em branco
  setTimeout(() => {
    window.location.href = 'about:blank'
  }, 100)
}

const reloadPage = () => {
  window.location.reload()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeCurrentTab"
      >
        <div class="relative max-w-md w-full mx-4 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          <!-- Header com ícone de aviso -->
          <div class="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold">Instância Duplicada</h3>
                <p class="text-sm text-white/90 mt-1">Múltiplas janelas detectadas</p>
              </div>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="p-6 space-y-4">
            <div class="text-gray-700 dark:text-gray-300 space-y-3">
              <p class="font-medium">
                Este aplicativo já está aberto em outra janela ativa.
              </p>
              <p class="text-sm">
                Para garantir o melhor desempenho e evitar conflitos de dados, apenas uma instância do PraPassar pode estar ativa por vez.
              </p>
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Dica:</strong> Feche esta janela e retorne à janela original, ou feche todas as janelas e recarregue a página.
                </p>
              </div>
            </div>

            <!-- Ações -->
            <div class="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                @click="closeCurrentTab"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Fechar Esta Janela
              </button>
              <button
                @click="reloadPage"
                class="flex-1 px-4 py-3 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 border border-gray-300 dark:border-dark-600"
              >
                Recarregar Página
              </button>
            </div>
          </div>

          <!-- Footer com informação técnica -->
          <div class="bg-gray-50 dark:bg-dark-900/50 px-6 py-3 border-t border-gray-200 dark:border-dark-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              Caso o problema persista, limpe o cache do navegador e tente novamente
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active > div,
.fade-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fade-enter-from > div,
.fade-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
