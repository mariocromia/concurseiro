#!/usr/bin/env python3
"""
Script para integrar o calendário de estudos no dashboard.
"""

import re

# Lê o arquivo dashboard.vue
with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# ========== PARTE 1: Adicionar imports no script ==========

# Procura pelo início do script setup
script_pattern = r'(<script setup lang="ts">)'
match = re.search(script_pattern, content)

if match:
    insert_pos = match.end()

    # Adiciona import das types
    new_imports = '''
import type { ScheduleActivity, CreateActivityPayload } from '~/composables/useStudySchedule'
'''

    content = content[:insert_pos] + new_imports + content[insert_pos:]
    print("✅ Imports adicionados")

# ========== PARTE 2: Adicionar state do calendário ==========

# Procura pela linha "const taskForm = ref"
task_form_pattern = r"(const taskForm = ref\({[^}]+}\))"
match = re.search(task_form_pattern, content, re.DOTALL)

if match:
    insert_pos = match.end()

    calendar_state = '''

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
'''

    content = content[:insert_pos] + calendar_state + content[insert_pos:]
    print("✅ State do calendário adicionado")

# ========== PARTE 3: Adicionar funções do calendário ==========

# Procura pela função handleSignOut
sign_out_pattern = r'(const handleSignOut = async \(\) => \{[^}]+}\s*})'
match = re.search(sign_out_pattern, content, re.DOTALL)

if match:
    insert_pos = match.end()

    calendar_functions = '''

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
'''

    content = content[:insert_pos] + calendar_functions + content[insert_pos:]
    print("✅ Funções do calendário adicionadas")

# ========== PARTE 4: Adicionar loadCalendarData() no onMounted ==========

# Procura pelo final do onMounted (antes do último })
on_mounted_pattern = r"(await initCharts\(\)\s+}\s+}\s+})"
match = re.search(on_mounted_pattern, content)

if match:
    # Adiciona antes do último }
    insert_pos = match.start() + len("await initCharts()\n    ")

    load_calendar_call = "await loadCalendarData()\n    "

    content = content[:insert_pos] + load_calendar_call + content[insert_pos:]
    print("✅ loadCalendarData() adicionado ao onMounted")

# ========== PARTE 5: Adicionar seção do calendário no template ==========

# Procura pela seção "Charts Section"
charts_section_pattern = r'(\s+<!-- Charts Section -->)'
match = re.search(charts_section_pattern, content)

if match:
    insert_pos = match.start()

    calendar_section = '''
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

'''

    content = content[:insert_pos] + calendar_section + content[insert_pos:]
    print("✅ Seção do calendário adicionada ao template")

# ========== PARTE 6: Adicionar modal de atividade ==========

# Procura por "</main>"
main_end_pattern = r'(\s+</main>)'
match = re.search(main_end_pattern, content)

if match:
    insert_pos = match.start()

    activity_modal = '''
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
'''

    content = content[:insert_pos] + activity_modal + content[insert_pos:]
    print("✅ Modal de atividade adicionado")

# Salva o arquivo modificado
with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Integração do calendário concluída com sucesso!")
print("\nPróximos passos:")
print("1. Abra o dashboard em http://localhost:3000/dashboard")
print("2. Teste criar uma nova atividade")
print("3. Teste as diferentes visualizações (Dia, Semana, 2 Semanas, Mês)")
print("4. Teste arrastar e soltar atividades")
