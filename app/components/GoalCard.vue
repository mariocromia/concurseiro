<script setup lang="ts">
import type { Goal } from '~/composables/useGoals'

interface Props {
  goal: Goal
}

const props = defineProps<Props>()
const emit = defineEmits<{
  delete: []
  edit: []
  viewDetails: []
}>()

const { getStatusBadge, formatDaysRemaining } = useGoals()

const statusBadge = computed(() => getStatusBadge(props.goal.status))
const daysRemainingText = computed(() => formatDaysRemaining(props.goal.days_remaining || 0))

// Check if goal is near deadline (3 days or less)
const isNearDeadline = computed(() => {
  return props.goal.status === 'in_progress' &&
         props.goal.days_remaining !== undefined &&
         props.goal.days_remaining <= 3 &&
         props.goal.days_remaining >= 0
})

// Format target date
const formattedDate = computed(() => {
  if (!props.goal.target_date) return ''
  const date = new Date(props.goal.target_date)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

// Get first 3 checklist items for preview
const previewItems = computed(() => {
  return props.goal.checklist_items?.slice(0, 3) || []
})

const hasMoreItems = computed(() => {
  return (props.goal.checklist_items?.length || 0) > 3
})
</script>

<template>
  <div
    class="bg-white dark:bg-dark-800 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    :class="{
      'border-primary-500': goal.status === 'in_progress' && !isNearDeadline,
      'border-green-500': goal.status === 'completed',
      'border-red-500': goal.status === 'overdue',
      'border-orange-500': isNearDeadline
    }"
  >
    <!-- Card Header -->
    <div class="p-5 border-b border-gray-200 dark:border-dark-700">
      <div class="flex items-start justify-between gap-3 mb-3">
        <!-- Goal Name -->
        <h3 class="text-xl font-bold text-gray-900 dark:text-white flex-1">
          {{ goal.name }}
        </h3>

        <!-- Status Badge -->
        <span
          class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
          :class="{
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': statusBadge.color === 'blue',
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': statusBadge.color === 'green',
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': statusBadge.color === 'red'
          }"
        >
          {{ statusBadge.label }}
        </span>
      </div>

      <!-- Subject -->
      <div v-if="goal.subject" class="flex items-center gap-2 mb-3">
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: goal.subject.color }"
        ></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ goal.subject.name }}
        </span>
      </div>

      <!-- Target Date & Days Remaining -->
      <div class="flex items-center gap-2 text-sm">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-gray-600 dark:text-gray-400">
          Prazo: {{ formattedDate }}
        </span>
        <span
          class="ml-auto font-semibold"
          :class="{
            'text-red-600 dark:text-red-400': goal.status === 'overdue' || isNearDeadline,
            'text-green-600 dark:text-green-400': goal.status === 'completed',
            'text-gray-700 dark:text-gray-300': goal.status === 'in_progress' && !isNearDeadline
          }"
        >
          {{ daysRemainingText }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-5">
      <!-- Progress Bar -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso
          </span>
          <span class="text-sm font-bold text-primary-600 dark:text-primary-400">
            {{ goal.completed_items }} de {{ goal.total_items }} itens
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="{
              'bg-gradient-to-r from-primary-500 to-primary-600': goal.status === 'in_progress',
              'bg-gradient-to-r from-green-500 to-green-600': goal.status === 'completed',
              'bg-gradient-to-r from-red-500 to-red-600': goal.status === 'overdue'
            }"
            :style="{ width: `${goal.progress_percentage}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {{ goal.progress_percentage }}% concluído
        </p>
      </div>

      <!-- Checklist Preview -->
      <div class="space-y-2 mb-4">
        <div
          v-for="item in previewItems"
          :key="item.id"
          class="flex items-start gap-2 text-sm"
        >
          <div class="mt-0.5">
            <svg
              v-if="item.is_completed"
              class="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              class="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke-width="2" />
            </svg>
          </div>
          <span
            class="flex-1"
            :class="{
              'line-through text-gray-500 dark:text-gray-500': item.is_completed,
              'text-gray-700 dark:text-gray-300': !item.is_completed
            }"
          >
            {{ item.description }}
          </span>
        </div>
        <p v-if="hasMoreItems" class="text-xs text-gray-500 dark:text-gray-400 italic pl-6">
          + {{ (goal.total_items || 0) - 3 }} itens a mais
        </p>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="px-5 py-3 bg-gray-50 dark:bg-dark-700/50 rounded-b-xl flex items-center justify-between">
      <!-- View Details Button -->
      <button
        @click="emit('viewDetails')"
        class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
      >
        Ver detalhes
      </button>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <!-- Edit Button -->
        <button
          @click="emit('edit')"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors"
          title="Editar meta"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <!-- Delete Button -->
        <button
          @click="emit('delete')"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors"
          title="Deletar meta"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
