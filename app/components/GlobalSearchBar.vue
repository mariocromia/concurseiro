<template>
  <div class="global-search-bar" :class="{ 'search-active': isSearchActive }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="search-container">
        <!-- Ícone de busca -->
        <div class="search-icon">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Input de busca -->
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          class="search-input"
          @focus="isSearchActive = true"
          @blur="handleBlur"
          @keydown.enter="handleSearch"
          @input="handleInput"
        />

        <!-- Botão de limpar -->
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Filtros personalizados (slot) -->
        <div v-if="$slots.filters" class="filters-container">
          <slot name="filters"></slot>
        </div>

        <!-- Botão de busca avançada (opcional) -->
        <button
          v-if="showAdvanced"
          @click="toggleAdvanced"
          class="advanced-button"
          :class="{ 'active': showAdvancedOptions }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span class="ml-2 hidden sm:inline">Filtros</span>
        </button>
      </div>

      <!-- Opções avançadas -->
      <Transition name="slide-down">
        <div v-if="showAdvancedOptions" class="advanced-options">
          <slot name="advanced"></slot>
        </div>
      </Transition>

      <!-- Resultados rápidos -->
      <Transition name="fade">
        <div v-if="isSearchActive && searchQuery && showQuickResults" class="quick-results">
          <slot name="results" :query="searchQuery">
            <div class="text-center py-4 text-gray-500">
              Digite para buscar...
            </div>
          </slot>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  placeholder?: string
  showAdvanced?: boolean
  showQuickResults?: boolean
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'input': [query: string]
}>()

const searchQuery = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value)
})

const isSearchActive = ref(false)
const showAdvancedOptions = ref(false)

const handleBlur = () => {
  setTimeout(() => {
    isSearchActive.value = false
  }, 200)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}

const handleInput = () => {
  emit('input', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

const toggleAdvanced = () => {
  showAdvancedOptions.value = !showAdvancedOptions.value
}
</script>

<style scoped>
.global-search-bar {
  @apply bg-white border-b border-gray-200 py-3 sticky top-16 z-40;
  transition: all 0.3s ease;
}

.global-search-bar.search-active {
  @apply shadow-md;
}

.search-container {
  @apply flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  @apply bg-white border-primary-500 ring-2 ring-primary-200;
}

.search-icon {
  @apply flex-shrink-0;
}

.search-input {
  @apply flex-1 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400;
  @apply text-sm sm:text-base;
}

.clear-button {
  @apply flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.filters-container {
  @apply flex-shrink-0 flex items-center gap-2 border-l border-gray-200 pl-3;
}

.advanced-button {
  @apply flex-shrink-0 flex items-center px-3 py-1.5 text-sm font-medium;
  @apply text-gray-600 hover:text-primary-600 transition-colors rounded-md;
  @apply hover:bg-gray-100;
}

.advanced-button.active {
  @apply text-primary-600 bg-primary-50;
}

.advanced-options {
  @apply mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200;
}

.quick-results {
  @apply mt-3 bg-white rounded-lg border border-gray-200 shadow-lg max-h-96 overflow-y-auto;
}

/* Animações */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsivo */
@media (max-width: 640px) {
  .filters-container {
    @apply hidden;
  }

  .advanced-button span {
    @apply hidden;
  }
}
</style>
