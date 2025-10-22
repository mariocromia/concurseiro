<script setup lang="ts">
import type { ScheduleActivity } from '~/composables/useStudySchedule'

type ViewMode = 'day' | 'week' | 'biweek' | 'month'

const props = defineProps<{
  activities: ScheduleActivity[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'create-activity': [date: string, time?: string]
  'view-activity': [activity: ScheduleActivity]
  'update-activity': [activity: ScheduleActivity, updates: any]
}>()

const viewMode = ref<ViewMode>('week')
const currentDate = ref(new Date())

const { calculateEndTime, formatDuration } = useStudySchedule()

// Navega para hoje
const goToToday = () => {
  currentDate.value = new Date()
}

// Navega para período anterior
const goToPrevious = () => {
  const date = new Date(currentDate.value)
  switch (viewMode.value) {
    case 'day':
      date.setDate(date.getDate() - 1)
      break
    case 'week':
      date.setDate(date.getDate() - 7)
      break
    case 'biweek':
      date.setDate(date.getDate() - 14)
      break
    case 'month':
      date.setMonth(date.getMonth() - 1)
      break
  }
  currentDate.value = date
}

// Navega para próximo período
const goToNext = () => {
  const date = new Date(currentDate.value)
  switch (viewMode.value) {
    case 'day':
      date.setDate(date.getDate() + 1)
      break
    case 'week':
      date.setDate(date.getDate() + 7)
      break
    case 'biweek':
      date.setDate(date.getDate() + 14)
      break
    case 'month':
      date.setMonth(date.getMonth() + 1)
      break
  }
  currentDate.value = date
}

// Formata data para exibição
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Formata data curta
const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Formata nome do dia
const formatDayName = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' })
}

// Verifica se é hoje
const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Verifica se está no passado
const isPast = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Converte Date para string YYYY-MM-DD
const dateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Obtém dias da semana atual
const getWeekDays = (startDate: Date, count: number = 7): Date[] => {
  const days: Date[] = []
  const date = new Date(startDate)

  // Ajusta para começar na segunda-feira
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  date.setDate(date.getDate() + diff)

  for (let i = 0; i < count; i++) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return days
}

// Obtém dias do mês
const getMonthDays = (): Date[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Preenche dias anteriores para completar a primeira semana
  const startDay = firstDay.getDay()
  const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1

  const days: Date[] = []

  // Dias do mês anterior
  const prevMonthLastDay = new Date(year, month, 0)
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const day = new Date(prevMonthLastDay)
    day.setDate(day.getDate() - i + 1)
    days.push(day)
  }

  // Dias do mês atual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Dias do próximo mês para completar 6 semanas
  const totalDays = days.length
  const remainingDays = 42 - totalDays
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

// Dias visíveis baseado no modo
const visibleDays = computed(() => {
  switch (viewMode.value) {
    case 'day':
      return [new Date(currentDate.value)]
    case 'week':
      return getWeekDays(currentDate.value, 7)
    case 'biweek':
      return getWeekDays(currentDate.value, 14)
    case 'month':
      return getMonthDays()
    default:
      return []
  }
})

// Filtra atividades para uma data específica
const getActivitiesForDate = (date: Date): ScheduleActivity[] => {
  const dateStr = dateToString(date)
  return props.activities.filter(a => a.scheduled_date === dateStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

// Título do período atual
const periodTitle = computed(() => {
  const date = currentDate.value
  switch (viewMode.value) {
    case 'day':
      return formatDate(date)
    case 'week':
    case 'biweek': {
      const days = visibleDays.value
      if (days.length === 0) return ''
      const first = days[0]
      const last = days[days.length - 1]
      return `${formatShortDate(first)} - ${formatShortDate(last)}`
    }
    case 'month':
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    default:
      return ''
  }
})

// Horários para visualização diária/semanal
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, '0')
  return `${hour}:00`
})

// Cor da atividade (usa cor personalizada ou cor da matéria)
const getActivityColor = (activity: ScheduleActivity): string => {
  if (activity.color) return activity.color
  if (activity.subject?.color) return activity.subject.color
  return '#8B5CF6' // Roxo padrão
}

// Calcula posição e altura da atividade no grid de horários
const getActivityPosition = (activity: ScheduleActivity) => {
  const [hours, minutes] = activity.start_time.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const top = (startMinutes / 60) * 60 // 60px por hora
  const height = (activity.duration / 60) * 60

  return {
    top: `${top}px`,
    height: `${height}px`
  }
}

// Manipuladores de eventos
const handleActivityClick = (activity: ScheduleActivity) => {
  emit('view-activity', activity)
}

const handleSlotClick = (date: Date, time?: string) => {
  emit('create-activity', dateToString(date), time)
}

const handleActivityDragStart = (event: DragEvent, activity: ScheduleActivity) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(activity))
  }
}

const handleSlotDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleSlotDrop = (event: DragEvent, date: Date, time?: string) => {
  event.preventDefault()
  const data = event.dataTransfer?.getData('application/json')
  if (data) {
    try {
      const activity = JSON.parse(data) as ScheduleActivity
      const updates: any = {
        scheduled_date: dateToString(date)
      }
      if (time) {
        updates.start_time = time
      }
      emit('update-activity', activity, updates)
    } catch (err) {
      console.error('Erro ao processar drop:', err)
    }
  }
}
</script>

<template>
  <div class="calendar-view bg-white dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden">
    <!-- Header com controles -->
    <div class="calendar-header p-4 border-b border-gray-200 dark:border-dark-700">
      <div class="flex items-center justify-between mb-4">
        <!-- Navegação -->
        <div class="flex items-center gap-2">
          <button
            @click="goToPrevious"
            class="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
            title="Anterior"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            @click="goToToday"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
          >
            Hoje
          </button>

          <button
            @click="goToNext"
            class="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
            title="Próximo"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Título do período -->
        <h2 class="text-xl font-bold text-gray-900 dark:text-white capitalize">
          {{ periodTitle }}
        </h2>

        <!-- Seletor de visualização -->
        <div class="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-lg">
          <button
            v-for="mode in [
              { value: 'day', label: 'Dia', icon: 'M3 12h18M3 6h18M3 18h18' },
              { value: 'week', label: 'Semana', icon: 'M9 12h6M9 6h6M9 18h6' },
              { value: 'biweek', label: '2 Semanas', icon: 'M4 6h16M4 12h16M4 18h16' },
              { value: 'month', label: 'Mês', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
            ]"
            :key="mode.value"
            @click="viewMode = mode.value as ViewMode"
            :class="[
              'px-3 py-2 rounded transition flex items-center gap-2 text-sm font-medium',
              viewMode === mode.value
                ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="mode.icon" />
            </svg>
            <span class="hidden sm:inline">{{ mode.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Conteúdo do calendário -->
    <div class="calendar-content overflow-auto" :class="loading ? 'opacity-50 pointer-events-none' : ''">
      <!-- Visualização Diária -->
      <div v-if="viewMode === 'day'" class="day-view">
        <div class="time-grid">
          <div class="time-labels">
            <div v-for="time in timeSlots" :key="time" class="time-label">
              {{ time }}
            </div>
          </div>
          <div class="day-column relative">
            <!-- Grid de horários -->
            <div
              v-for="time in timeSlots"
              :key="time"
              class="time-slot"
              @click="handleSlotClick(visibleDays[0], time)"
              @drop="handleSlotDrop($event, visibleDays[0], time)"
              @dragover="handleSlotDragOver"
            />

            <!-- Atividades -->
            <div
              v-for="activity in getActivitiesForDate(visibleDays[0])"
              :key="activity.id"
              class="activity-block absolute left-2 right-2 rounded-lg p-2 cursor-pointer shadow-md hover:shadow-lg transition"
              :style="{
                ...getActivityPosition(activity),
                backgroundColor: getActivityColor(activity),
                opacity: activity.is_completed ? 0.6 : 1
              }"
              draggable="true"
              @click="handleActivityClick(activity)"
              @dragstart="handleActivityDragStart($event, activity)"
            >
              <div class="text-white text-sm font-medium truncate">
                {{ activity.title }}
              </div>
              <div class="text-white text-xs opacity-90">
                {{ activity.start_time }} - {{ calculateEndTime(activity.start_time, activity.duration) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualização Semanal / Quinzenal -->
      <div v-else-if="viewMode === 'week' || viewMode === 'biweek'" class="week-view">
        <div class="week-grid">
          <!-- Header dos dias -->
          <div class="week-header">
            <div class="time-label-corner" />
            <div
              v-for="day in visibleDays"
              :key="day.toISOString()"
              class="day-header"
              :class="{
                'today': isToday(day),
                'past': isPast(day) && !isToday(day)
              }"
            >
              <div class="day-name">{{ formatDayName(day) }}</div>
              <div class="day-number">{{ day.getDate() }}</div>
            </div>
          </div>

          <!-- Grid de horários -->
          <div class="week-grid-body">
            <div class="time-labels-column">
              <div v-for="time in timeSlots" :key="time" class="time-label">
                {{ time }}
              </div>
            </div>

            <div class="days-columns">
              <div
                v-for="day in visibleDays"
                :key="day.toISOString()"
                class="day-column"
              >
                <!-- Slots de horário -->
                <div
                  v-for="time in timeSlots"
                  :key="time"
                  class="time-slot"
                  @click="handleSlotClick(day, time)"
                  @drop="handleSlotDrop($event, day, time)"
                  @dragover="handleSlotDragOver"
                />

                <!-- Atividades -->
                <div class="activities-overlay">
                  <div
                    v-for="activity in getActivitiesForDate(day)"
                    :key="activity.id"
                    class="activity-block rounded-lg p-2 cursor-pointer shadow-md hover:shadow-lg transition"
                    :style="{
                      ...getActivityPosition(activity),
                      backgroundColor: getActivityColor(activity),
                      opacity: activity.is_completed ? 0.6 : 1
                    }"
                    draggable="true"
                    @click="handleActivityClick(activity)"
                    @dragstart="handleActivityDragStart($event, activity)"
                  >
                    <div class="text-white text-xs font-medium truncate">
                      {{ activity.title }}
                    </div>
                    <div class="text-white text-xs opacity-90">
                      {{ activity.start_time }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualização Mensal -->
      <div v-else-if="viewMode === 'month'" class="month-view p-4">
        <!-- Header dos dias da semana -->
        <div class="month-weekdays grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="day in ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']"
            :key="day"
            class="text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Grid do mês -->
        <div class="month-grid grid grid-cols-7 gap-2">
          <div
            v-for="day in visibleDays"
            :key="day.toISOString()"
            class="month-day min-h-[100px] p-2 rounded-lg border cursor-pointer transition"
            :class="{
              'bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-600': day.getMonth() === currentDate.getMonth(),
              'bg-gray-50 dark:bg-dark-800 border-gray-100 dark:border-dark-700 opacity-50': day.getMonth() !== currentDate.getMonth(),
              'ring-2 ring-primary-500': isToday(day),
              'hover:bg-gray-50 dark:hover:bg-dark-600': true
            }"
            @click="handleSlotClick(day)"
            @drop="handleSlotDrop($event, day)"
            @dragover="handleSlotDragOver"
          >
            <div
              class="day-number text-sm font-semibold mb-1"
              :class="{
                'text-primary-600 dark:text-primary-400': isToday(day),
                'text-gray-900 dark:text-white': !isToday(day) && day.getMonth() === currentDate.getMonth(),
                'text-gray-400 dark:text-gray-600': day.getMonth() !== currentDate.getMonth()
              }"
            >
              {{ day.getDate() }}
            </div>

            <!-- Atividades do dia -->
            <div class="space-y-1">
              <div
                v-for="(activity, index) in getActivitiesForDate(day).slice(0, 3)"
                :key="activity.id"
                class="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition"
                :style="{
                  backgroundColor: getActivityColor(activity),
                  opacity: activity.is_completed ? 0.6 : 1
                }"
                draggable="true"
                @click.stop="handleActivityClick(activity)"
                @dragstart="handleActivityDragStart($event, activity)"
              >
                <span class="text-white font-medium">
                  {{ activity.start_time }} {{ activity.title }}
                </span>
              </div>

              <!-- Indicador de mais atividades -->
              <div
                v-if="getActivitiesForDate(day).length > 3"
                class="text-xs text-gray-500 dark:text-gray-400 px-2"
              >
                +{{ getActivitiesForDate(day).length - 3 }} mais
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Day View Styles */
.day-view {
  @apply p-4;
}

.time-grid {
  @apply flex;
}

.time-labels {
  @apply w-20 flex-shrink-0;
}

.time-label {
  @apply h-[60px] text-sm text-gray-600 dark:text-gray-400 pr-2 text-right border-r border-gray-200 dark:border-dark-700;
}

.day-column {
  @apply flex-1 ml-2;
  min-height: 1440px; /* 24 hours * 60px */
}

.time-slot {
  @apply h-[60px] border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition;
}

/* Week View Styles */
.week-view {
  @apply p-4;
}

.week-grid {
  @apply overflow-x-auto;
}

.week-header {
  @apply flex mb-2 sticky top-0 bg-white dark:bg-dark-800 z-10;
}

.time-label-corner {
  @apply w-20 flex-shrink-0;
}

.day-header {
  @apply flex-1 text-center py-2 border-b-2 border-gray-200 dark:border-dark-700;
}

.day-header.today {
  @apply border-primary-500;
}

.day-header.past {
  @apply opacity-60;
}

.day-name {
  @apply text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase;
}

.day-number {
  @apply text-lg font-bold text-gray-900 dark:text-white;
}

.day-header.today .day-number {
  @apply text-primary-600 dark:text-primary-400;
}

.week-grid-body {
  @apply flex;
}

.time-labels-column {
  @apply w-20 flex-shrink-0;
}

.days-columns {
  @apply flex flex-1 ml-2 gap-1;
}

.day-column {
  @apply flex-1 relative;
  min-height: 1440px;
}

.activities-overlay {
  @apply absolute inset-0 pointer-events-none;
}

.activity-block {
  @apply pointer-events-auto absolute left-0 right-0;
}

/* Loading state */
.calendar-content {
  @apply min-h-[400px];
}

/* Smooth transitions */
* {
  @apply transition-colors duration-200;
}
</style>
