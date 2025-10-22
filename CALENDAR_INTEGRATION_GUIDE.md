# Guia de Integração do Calendário de Estudos

Este guia mostra como integrar o calendário criado no dashboard.

## Arquivos Criados

1. **composables/useStudySchedule.ts** - Composable com toda a lógica de gerenciamento
2. **components/CalendarView.vue** - Componente visual do calendário
3. **components/ActivityModal.vue** - Modal de cadastro/edição de atividades

## Integração no Dashboard

### Passo 1: Adicionar imports no `<script setup>` do dashboard.vue

Adicione após os imports existentes (linha ~432):

```typescript
import type { ScheduleActivity, CreateActivityPayload } from '~/composables/useStudySchedule'

// Calendário
const {
  activities: calendarActivities,
  loading: loadingCalendar,
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleCompletion,
  getWorkloadStats
} = useStudySchedule()

const showActivityModal = ref(false)
const selectedActivity = ref<ScheduleActivity | null>(null)
const initialActivityDate = ref<string>()
const initialActivityTime = ref<string>()
const calendarStats = ref<any>(null)
```

### Passo 2: Adicionar funções de manipulação

Adicione antes de `handleSignOut()` (linha ~844):

```typescript
// Funções do calendário
const handleCreateActivity = (date: string, time?: string) => {
  selectedActivity.value = null
  initialActivityDate.value = date
  initialActivityTime.value = time
  showActivityModal.value = true
}

const handleViewActivity = (activity: ScheduleActivity) => {
  selectedActivity.value = activity
  showActivityModal.value = true
}

const handleUpdateActivity = async (activity: ScheduleActivity, updates: any) => {
  if (!activity.id) return
  await updateActivity(activity.id, updates)
  await loadCalendarData()
}

const handleSaveActivity = async (payload: CreateActivityPayload) => {
  const result = await createActivity(payload)
  if (result) {
    showActivityModal.value = false
    selectedActivity.value = null
    await loadCalendarData()
  }
}

const handleUpdateExistingActivity = async (id: string, updates: Partial<CreateActivityPayload>) => {
  const success = await updateActivity(id, updates)
  if (success) {
    showActivityModal.value = false
    selectedActivity.value = null
    await loadCalendarData()
  }
}

const handleDeleteActivity = async (id: string) => {
  const success = await deleteActivity(id)
  if (success) {
    showActivityModal.value = false
    selectedActivity.value = null
    await loadCalendarData()
  }
}

const handleToggleActivityCompletion = async (id: string) => {
  await toggleCompletion(id)
  await loadCalendarData()
}

const loadCalendarData = async () => {
  // Carrega atividades da semana atual
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const startStr = weekStart.toISOString().split('T')[0]
  const endStr = weekEnd.toISOString().split('T')[0]

  await fetchActivities(startStr, endStr)

  // Atualiza estatísticas
  calendarStats.value = getWorkloadStats(startStr, endStr)
}
```

### Passo 3: Chamar loadCalendarData() no onMounted

Adicione no final do `onMounted()` existente (linha ~508):

```typescript
await loadCalendarData()
```

### Passo 4: Adicionar seção do calendário no template

Adicione após a seção "AI Quick Start" (linha ~167), ANTES de "Charts Section":

```vue
      <!-- Calendar Section -->
      <div class="bg-white dark:bg-dark-800/50 backdrop-blur-sm border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200 dark:border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendário de Estudos
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Organize seus estudos e eventos</p>
            </div>

            <button
              @click="showActivityModal = true"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-lg flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nova Atividade
            </button>
          </div>

          <!-- Estatísticas do calendário -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4" v-if="calendarStats">
            <div class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Carga Horária Semanal</p>
                  <p class="text-2xl font-bold text-primary-900 dark:text-primary-100">{{ calendarStats.totalHours }}h</p>
                </div>
                <svg class="w-10 h-10 text-primary-600 dark:text-primary-400 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Atividades Concluídas</p>
                  <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ calendarStats.completedActivities }}/{{ calendarStats.totalActivities }}</p>
                </div>
                <svg class="w-10 h-10 text-green-600 dark:text-green-400 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Taxa de Conclusão</p>
                  <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{{ calendarStats.completionRate }}%</p>
                </div>
                <svg class="w-10 h-10 text-yellow-600 dark:text-yellow-400 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendário -->
        <CalendarView
          :activities="calendarActivities"
          :loading="loadingCalendar"
          @create-activity="handleCreateActivity"
          @view-activity="handleViewActivity"
          @update-activity="handleUpdateActivity"
        />
      </div>
```

### Passo 5: Adicionar modal de atividade

Adicione antes do `</main>` (linha ~425):

```vue
    <!-- Activity Modal -->
    <ActivityModal
      :show="showActivityModal"
      :activity="selectedActivity"
      :initial-date="initialActivityDate"
      :initial-time="initialActivityTime"
      @close="showActivityModal = false; selectedActivity = null"
      @save="handleSaveActivity"
      @update="handleUpdateExistingActivity"
      @delete="handleDeleteActivity"
      @toggle-completion="handleToggleActivityCompletion"
    />
```

## Testando a Implementação

1. Acesse o dashboard (`/dashboard`)
2. Você deve ver o calendário com visualizações (Dia, Semana, 2 Semanas, Mês)
3. Clique em "Nova Atividade" para criar um agendamento
4. Teste criar tanto "Estudo" (vinculado a matéria) quanto "Evento"
5. Arraste atividades para reorganizar horários
6. Clique em atividades para visualizar/editar/excluir
7. Verifique as estatísticas (carga horária, taxa de conclusão)

## Funcionalidades Implementadas

✅ 4 visualizações (Diária, Semanal, Quinzenal, Mensal)
✅ Cadastro de Estudo (vinculado a matéria)
✅ Cadastro de Evento (sem vinculação)
✅ Criação de matérias inline
✅ Escolha de cor personalizada
✅ Drag and drop para reorganizar
✅ Detecção de conflitos de horário
✅ Estatísticas de carga horária
✅ Marcação de atividades como concluídas
✅ Dark/Light theme support
✅ Responsivo para mobile

## Estrutura de Dados

A tabela `study_schedules` já existe no banco de dados com:
- user_id, subject_id, title, description
- scheduled_date, start_time, duration
- is_completed, color
- Políticas RLS configuradas
