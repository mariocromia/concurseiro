<template>
  <div class="animate-pulse">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
      <div class="h-6 bg-dark-700 rounded w-3/4 mb-4"></div>
      <div class="space-y-3">
        <div class="h-4 bg-dark-700 rounded w-full"></div>
        <div class="h-4 bg-dark-700 rounded w-5/6"></div>
        <div class="h-4 bg-dark-700 rounded w-4/6"></div>
      </div>
    </div>

    <!-- Table Row Skeleton -->
    <div v-else-if="type === 'table-row'" class="flex items-center gap-4 py-4 border-b border-dark-700">
      <div class="w-12 h-12 bg-dark-700 rounded-full flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-dark-700 rounded w-1/3"></div>
        <div class="h-3 bg-dark-700 rounded w-1/2"></div>
      </div>
      <div class="h-8 bg-dark-700 rounded w-20"></div>
    </div>

    <!-- List Item Skeleton -->
    <div v-else-if="type === 'list-item'" class="flex items-center gap-3 p-4 bg-dark-800/50 border border-dark-700 rounded-lg">
      <div class="w-10 h-10 bg-dark-700 rounded-lg flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-dark-700 rounded w-2/3"></div>
        <div class="h-3 bg-dark-700 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Text Skeleton -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div v-for="i in lines" :key="i" class="h-4 bg-dark-700 rounded" :class="i === lines ? 'w-2/3' : 'w-full'"></div>
    </div>

    <!-- Avatar + Text Skeleton -->
    <div v-else-if="type === 'avatar-text'" class="flex items-center gap-3">
      <div class="w-12 h-12 bg-dark-700 rounded-full flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-dark-700 rounded w-1/4"></div>
        <div class="h-3 bg-dark-700 rounded w-1/3"></div>
      </div>
    </div>

    <!-- Button Skeleton -->
    <div v-else-if="type === 'button'" class="h-10 bg-dark-700 rounded-lg w-32"></div>

    <!-- Stat Card Skeleton -->
    <div v-else-if="type === 'stat'" class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div class="space-y-2 flex-1">
          <div class="h-3 bg-dark-700 rounded w-1/2"></div>
          <div class="h-8 bg-dark-700 rounded w-1/3"></div>
          <div class="h-3 bg-dark-700 rounded w-2/3"></div>
        </div>
        <div class="w-12 h-12 bg-dark-700 rounded-lg"></div>
      </div>
    </div>

    <!-- Chart Skeleton -->
    <div v-else-if="type === 'chart'" class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
      <div class="h-6 bg-dark-700 rounded w-1/3 mb-6"></div>
      <div class="h-64 bg-dark-700 rounded"></div>
    </div>

    <!-- Custom Height -->
    <div v-else class="bg-dark-700 rounded" :style="{ height: customHeight || '100px' }"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * Skeleton Loader Component
 *
 * Provides skeleton screens for different content types
 * Improves perceived performance during data loading
 *
 * @author Claude Code
 * @date 2025-10-17
 */

interface Props {
  type?: 'card' | 'table-row' | 'list-item' | 'text' | 'avatar-text' | 'button' | 'stat' | 'chart' | 'custom'
  lines?: number
  customHeight?: string
}

withDefaults(defineProps<Props>(), {
  type: 'card',
  lines: 3
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
