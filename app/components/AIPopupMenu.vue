<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      class="fixed z-50 bg-dark-800 rounded-xl shadow-2xl border-2 border-primary-500/50 overflow-hidden animate-fadeIn backdrop-blur-xl"
      @click.stop
    >
      <div class="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2.5 border-b border-gray-700">
        <div class="flex items-center space-x-2 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-sm font-semibold">Assistente IA</span>
          <span v-if="!isPro" class="text-xs bg-gray-600 px-2 py-0.5 rounded-full font-bold">PRO</span>
        </div>
      </div>

      <div class="p-2 w-64">
        <button
          v-for="option in menuOptions"
          :key="option.id"
          @click="handleOptionClick(option.id)"
          :disabled="!isPro && option.requiresPro"
          class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-dark-700 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div class="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700 group-hover:border-gray-500 group-hover:bg-gray-700 transition-all group-hover:shadow-lg group-hover:shadow-gray-900/50 group-hover:scale-105">
            <component :is="option.iconComponent" class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{{ option.label }}</div>
            <div class="text-xs text-gray-400">{{ option.description }}</div>
          </div>
          <svg v-if="!isPro && option.requiresPro" class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div v-if="!isPro" class="border-t border-gray-700 bg-gray-800/50 px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-white">Desbloqueie recursos IA</p>
            <p class="text-xs text-gray-400">Assine o plano PRO</p>
          </div>
          <button
            @click="$emit('upgrade')"
            class="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs font-bold rounded-full hover:shadow-lg hover:shadow-gray-900/50 hover:from-gray-500 hover:to-gray-600 transition-all"
          >
            Assinar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { h } from 'vue'

interface MenuOption {
  id: string
  iconComponent: any
  label: string
  description: string
  requiresPro: boolean
}

// Ícones SVG monocromáticos
const SummaryIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
])

const ExplainIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' })
])

const ExercisesIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
])

const FlashcardsIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' })
])

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
      iconComponent: SummaryIcon,
      label: 'Resumo',
      description: 'Gerar resumo do conteúdo',
      requiresPro: true
    },
    {
      id: 'explain',
      iconComponent: ExplainIcon,
      label: 'Explicar',
      description: 'Explicação detalhada',
      requiresPro: true
    },
    {
      id: 'exercises',
      iconComponent: ExercisesIcon,
      label: 'Exercícios',
      description: 'Criar questões',
      requiresPro: true
    },
    {
      id: 'flashcards',
      iconComponent: FlashcardsIcon,
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
