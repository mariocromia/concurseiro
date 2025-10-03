<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      class="fixed z-50 bg-dark-800 rounded-xl shadow-2xl border-2 border-primary-500/50 overflow-hidden animate-fadeIn backdrop-blur-xl"
      @click.stop
    >
      <div class="bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-2.5">
        <div class="flex items-center space-x-2 text-white">
          <span class="text-lg">✨</span>
          <span class="text-sm font-semibold">Assistente IA</span>
          <span v-if="!isPro" class="text-xs bg-yellow-500 px-2 py-0.5 rounded-full font-bold">PRO</span>
        </div>
      </div>

      <div class="p-2 w-64">
        <button
          v-for="option in menuOptions"
          :key="option.id"
          @click="handleOptionClick(option.id)"
          :disabled="!isPro && option.requiresPro"
          class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-dark-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span class="text-2xl">{{ option.icon }}</span>
          <div class="flex-1">
            <div class="text-sm font-medium text-white">{{ option.label }}</div>
            <div class="text-xs text-gray-400">{{ option.description }}</div>
          </div>
          <svg v-if="!isPro && option.requiresPro" class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div v-if="!isPro" class="border-t border-dark-600 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-white">Desbloqueie recursos IA</p>
            <p class="text-xs text-gray-400">Assine o plano PRO</p>
          </div>
          <button
            @click="$emit('upgrade')"
            class="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
          >
            Assinar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface MenuOption {
  id: string
  icon: string
  label: string
  description: string
  requiresPro: boolean
}

interface Props {
  isVisible: boolean
  position: { x: number; y: number }
  isPro: boolean
  context?: 'chapter' | 'selection'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  select: [optionId: string]
  upgrade: []
}>()

const menuOptions = computed<MenuOption[]>(() => {
  const baseOptions: MenuOption[] = [
    {
      id: 'summary',
      icon: '📝',
      label: 'Resumo',
      description: 'Gerar resumo do conteúdo',
      requiresPro: true
    },
    {
      id: 'explain',
      icon: '💡',
      label: 'Explicar',
      description: 'Explicação detalhada',
      requiresPro: true
    },
    {
      id: 'exercises',
      icon: '📚',
      label: 'Exercícios',
      description: 'Criar questões',
      requiresPro: true
    },
    {
      id: 'flashcards',
      icon: '🎴',
      label: 'Flashcards',
      description: 'Criar cartões de estudo',
      requiresPro: true
    }
  ]

  if (props.context === 'selection') {
    return baseOptions.filter(opt => ['explain', 'summary', 'exercises'].includes(opt.id))
  }

  return baseOptions
})

const handleOptionClick = (optionId: string) => {
  if (!props.isPro) {
    emit('upgrade')
    return
  }
  emit('select', optionId)
  emit('close')
}

// Fechar ao clicar fora
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (props.isVisible) {
      emit('close')
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
