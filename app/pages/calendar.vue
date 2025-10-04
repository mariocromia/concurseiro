<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">


    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Calendar Navigation -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
              @click="previousMonth"
              class="p-2 hover:bg-dark-700 rounded-lg transition"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <h2 class="text-2xl font-bold text-white min-w-[200px] text-center">
              {{ monthName }} {{ currentYear }}
            </h2>

            <button
              @click="nextMonth"
              class="p-2 hover:bg-dark-700 rounded-lg transition"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button
              @click="goToToday"
              class="ml-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition text-sm"
            >
              Hoje
            </button>
          </div>

          <div class="flex items-center gap-4">
            <!-- Toggle Modo -->
            <div class="flex bg-dark-700 rounded-lg p-1">
              <button
                @click="viewMode = 'schedule'"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition',
                  viewMode === 'schedule' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                ]"
              >
                📅 Lançamento
              </button>
              <button
                @click="viewMode = 'report'"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition',
                  viewMode === 'report' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                ]"
              >
                📊 Relatório
              </button>
            </div>

            <button
              v-if="viewMode === 'schedule'"
              @click="openRecurringModal"
              class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Agendar Recorrente
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <!-- Day headers -->
          <div v-for="day in weekDays" :key="day" class="text-center text-sm font-medium text-gray-400 py-2">
            {{ day }}
          </div>

          <!-- Calendar days -->
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            @click="day.date ? handleDayClick(day.date) : null"
            :class="[
              'min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer',
              day.date ? 'border-dark-700 bg-dark-900/50 hover:border-primary-500/50' : 'border-transparent bg-dark-800/20',
              day.isToday ? 'ring-2 ring-primary-500' : '',
              day.date && isSelected(day.date) ? 'bg-primary-500/20 border-primary-500' : ''
            ]"
          >
            <div v-if="day.date" class="h-full flex flex-col">
              <div :class="['text-sm font-medium mb-1', day.isToday ? 'text-primary-400' : day.isCurrentMonth ? 'text-white' : 'text-gray-600']">
                {{ day.dayNumber }}
              </div>

              <!-- Scheduled items -->
              <div class="flex-1 space-y-1 overflow-y-auto">
                <div
                  v-for="schedule in getSchedulesForDay(day.date)"
                  :key="schedule.id"
                  @click.stop="viewSchedule(schedule)"
                  :class="[
                    'text-xs px-2 py-1 rounded truncate',
                    schedule.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    schedule.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-primary-500/20 text-primary-400'
                  ]"
                >
                  {{ schedule.subjects?.name }} - {{ schedule.planned_duration }}min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4">
        <div class="flex items-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-primary-500/20 border border-primary-500"></div>
            <span class="text-gray-400">Pendente</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-green-500/20 border border-green-500"></div>
            <span class="text-gray-400">Concluído</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-red-500/20 border border-red-500"></div>
            <span class="text-gray-400">Cancelado</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal: Single Day Schedule -->
    <div
      v-if="showDayModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeDayModal"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">
          Agendar Estudo - {{ formatDate(selectedDate) }}
        </h3>

        <form @submit.prevent="saveSchedule">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Matéria</label>
              <select
                v-model="scheduleForm.subject_id"
                required
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma matéria</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Tipo de Estudo</label>
              <select
                v-model="scheduleForm.study_type"
                required
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="conteudo">📖 Conteúdo</option>
                <option value="questoes">📝 Questões</option>
                <option value="revisao">🔄 Revisão</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Horário</label>
                <input
                  v-model="scheduleForm.scheduled_time"
                  type="time"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Duração (min)</label>
                <input
                  v-model.number="scheduleForm.planned_duration"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="60"
                >
              </div>
            </div>

            <div v-if="scheduleForm.study_type === 'questoes'">
              <label class="block text-sm font-medium text-gray-300 mb-2">Quantidade de Questões</label>
              <input
                v-model.number="scheduleForm.planned_questions"
                type="number"
                min="1"
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                placeholder="50"
              >
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="closeDayModal"
              class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition"
            >
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Recurring Schedule -->
    <div
      v-if="showRecurringModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="closeRecurringModal"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-xl max-w-lg w-full p-6 shadow-2xl my-8">
        <h3 class="text-xl font-bold text-white mb-4">Agendar Estudo Recorrente</h3>

        <form @submit.prevent="saveRecurringSchedule">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Matéria</label>
              <select
                v-model="recurringForm.subject_id"
                required
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma matéria</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Tipo de Estudo</label>
              <select
                v-model="recurringForm.study_type"
                required
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="conteudo">📖 Conteúdo</option>
                <option value="questoes">📝 Questões</option>
                <option value="revisao">🔄 Revisão</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Recorrência</label>
              <select
                v-model="recurringForm.recurrence_type"
                required
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Todos os dias</option>
                <option value="weekly">Semanal (escolher dias)</option>
              </select>
            </div>

            <div v-if="recurringForm.recurrence_type === 'weekly'" class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">Dias da Semana</label>
              <div class="grid grid-cols-7 gap-2">
                <button
                  v-for="(day, index) in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']"
                  :key="index"
                  type="button"
                  @click="toggleWeekDay(index)"
                  :class="[
                    'p-2 rounded-lg text-sm font-medium transition',
                    recurringForm.recurrence_days.includes(index)
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  ]"
                >
                  {{ day }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Data Início</label>
                <input
                  v-model="recurringForm.start_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Data Fim</label>
                <input
                  v-model="recurringForm.end_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Horário</label>
                <input
                  v-model="recurringForm.scheduled_time"
                  type="time"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Duração (min)</label>
                <input
                  v-model.number="recurringForm.planned_duration"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="60"
                >
              </div>
            </div>

            <div v-if="recurringForm.study_type === 'questoes'">
              <label class="block text-sm font-medium text-gray-300 mb-2">Quantidade de Questões (por dia)</label>
              <input
                v-model.number="recurringForm.planned_questions"
                type="number"
                min="1"
                class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                placeholder="50"
              >
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="closeRecurringModal"
              class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition"
            >
              {{ loading ? 'Criando...' : 'Criar Agendamentos' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: View/Complete Schedule -->
    <div
      v-if="showViewModal && viewingSchedule"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeViewModal"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">Detalhes do Agendamento</h3>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium',
              viewingSchedule.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              viewingSchedule.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
              'bg-primary-500/20 text-primary-400'
            ]"
          >
            {{ viewingSchedule.status === 'completed' ? 'Concluído' : viewingSchedule.status === 'cancelled' ? 'Cancelado' : 'Pendente' }}
          </span>
        </div>

        <div class="space-y-3 mb-6">
          <div class="flex justify-between">
            <span class="text-gray-400">Matéria:</span>
            <span class="text-white font-medium">{{ viewingSchedule.subjects?.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Tipo:</span>
            <span class="text-white">
              {{ viewingSchedule.study_type === 'conteudo' ? '📖 Conteúdo' :
                 viewingSchedule.study_type === 'questoes' ? '📝 Questões' : '🔄 Revisão' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Data:</span>
            <span class="text-white">{{ formatDate(viewingSchedule.scheduled_date) }}</span>
          </div>
          <div v-if="viewingSchedule.scheduled_time" class="flex justify-between">
            <span class="text-gray-400">Horário:</span>
            <span class="text-white">{{ viewingSchedule.scheduled_time }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Duração Planejada:</span>
            <span class="text-white">{{ viewingSchedule.planned_duration }} min</span>
          </div>
          <div v-if="viewingSchedule.planned_questions" class="flex justify-between">
            <span class="text-gray-400">Questões Planejadas:</span>
            <span class="text-white">{{ viewingSchedule.planned_questions }}</span>
          </div>
        </div>

        <div v-if="viewingSchedule.status === 'pending'" class="space-y-4">
          <div class="border-t border-dark-700 pt-4">
            <h4 class="text-sm font-medium text-white mb-3">Marcar como Concluído</h4>

            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Tempo Real (min)</label>
                <input
                  v-model.number="completionForm.actual_duration"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  :placeholder="String(viewingSchedule.planned_duration)"
                >
              </div>

              <div v-if="viewingSchedule.study_type === 'questoes'">
                <label class="block text-sm text-gray-400 mb-1">Questões Feitas</label>
                <input
                  v-model.number="completionForm.completed_questions"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  :placeholder="String(viewingSchedule.planned_questions || 0)"
                >
              </div>

              <div v-if="viewingSchedule.study_type === 'questoes' && completionForm.completed_questions > 0">
                <label class="block text-sm text-gray-400 mb-1">Questões Corretas</label>
                <input
                  v-model.number="completionForm.correct_questions"
                  type="number"
                  min="0"
                  :max="completionForm.completed_questions"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                >
                <div v-if="completionForm.correct_questions !== null && completionForm.completed_questions > 0" class="mt-1 text-sm">
                  <span class="text-gray-400">Taxa de acerto: </span>
                  <span class="text-primary-400 font-semibold">
                    {{ Math.round((completionForm.correct_questions / completionForm.completed_questions) * 100) }}%
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm text-gray-400 mb-1">Observações</label>
                <textarea
                  v-model="completionForm.notes"
                  rows="2"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Como foi o estudo?"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="viewingSchedule.status === 'completed'" class="border-t border-dark-700 pt-4">
          <h4 class="text-sm font-medium text-white mb-3">Resultado</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Tempo Real:</span>
              <span class="text-white">{{ viewingSchedule.actual_duration }} min</span>
            </div>
            <div v-if="viewingSchedule.completed_questions" class="flex justify-between">
              <span class="text-gray-400">Questões Feitas:</span>
              <span class="text-white">{{ viewingSchedule.completed_questions }}</span>
            </div>
            <div v-if="viewingSchedule.correct_questions !== null && viewingSchedule.correct_questions !== undefined">
              <div class="flex justify-between mb-1">
                <span class="text-gray-400">Questões Corretas:</span>
                <span class="text-white">{{ viewingSchedule.correct_questions }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Taxa de Acerto:</span>
                <span class="text-primary-400 font-semibold">
                  {{ Math.round((viewingSchedule.correct_questions / viewingSchedule.completed_questions) * 100) }}%
                </span>
              </div>
            </div>
            <div v-if="viewingSchedule.notes">
              <span class="text-gray-400 block mb-1">Observações:</span>
              <p class="text-white text-sm">{{ viewingSchedule.notes }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            v-if="viewingSchedule.status === 'pending'"
            @click="cancelSchedule"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition disabled:opacity-50"
          >
            Cancelar Agendamento
          </button>
          <button
            type="button"
            @click="closeViewModal"
            class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
          >
            Fechar
          </button>
          <button
            v-if="viewingSchedule.status === 'pending'"
            @click="completeSchedule"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
          >
            {{ loading ? 'Salvando...' : 'Concluir' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Relatório Diário -->
    <div
      v-if="showDayReportModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="closeDayReportModal"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <h3 class="text-2xl font-bold text-white mb-2">
          Relatório do Dia - {{ formatDate(selectedDate) }}
        </h3>
        <p class="text-gray-400 text-sm mb-6">Resumo completo das atividades</p>

        <div v-if="dayReport.sessions.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p class="text-gray-400">Nenhuma atividade registrada neste dia</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Resumo Geral -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-dark-900 border border-dark-700 rounded-lg p-4">
              <div class="text-xs text-gray-400 mb-1">Tempo Total</div>
              <div class="text-2xl font-bold text-primary-400">{{ formatMinutes(dayReport.totalMinutes) }}</div>
            </div>
            <div class="bg-dark-900 border border-dark-700 rounded-lg p-4">
              <div class="text-xs text-gray-400 mb-1">Sessões</div>
              <div class="text-2xl font-bold text-white">{{ dayReport.sessions.length }}</div>
            </div>
            <div class="bg-dark-900 border border-dark-700 rounded-lg p-4">
              <div class="text-xs text-gray-400 mb-1">Questões</div>
              <div class="text-2xl font-bold text-white">{{ dayReport.totalQuestions }}</div>
            </div>
            <div class="bg-dark-900 border border-dark-700 rounded-lg p-4">
              <div class="text-xs text-gray-400 mb-1">Taxa Acerto</div>
              <div class="text-2xl font-bold text-green-400">{{ dayReport.successRate }}%</div>
            </div>
          </div>

          <!-- Sessões Detalhadas -->
          <div>
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Sessões de Estudo
            </h4>
            <div class="space-y-3">
              <div
                v-for="session in dayReport.sessions"
                :key="session.id"
                class="bg-dark-900 border border-dark-700 rounded-lg p-4 hover:border-primary-500/50 transition"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-3 h-3 rounded-full"
                      :style="{ backgroundColor: session.subjects?.color || '#22C55E' }"
                    ></div>
                    <div>
                      <div class="font-medium text-white">{{ session.subjects?.name }}</div>
                      <div class="text-xs text-gray-400">
                        {{ session.scheduled_time || 'Sem horário' }} • {{ formatMinutes(session.actual_duration || session.planned_duration) }}
                      </div>
                    </div>
                  </div>
                  <span class="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                    {{ session.study_type === 'conteudo' ? '📖 Conteúdo' :
                       session.study_type === 'questoes' ? '📝 Questões' : '🔄 Revisão' }}
                  </span>
                </div>

                <div v-if="session.study_type === 'questoes' && session.completed_questions" class="grid grid-cols-3 gap-2 text-sm">
                  <div class="bg-dark-800 rounded p-2">
                    <div class="text-xs text-gray-400">Questões</div>
                    <div class="font-semibold text-white">{{ session.completed_questions }}</div>
                  </div>
                  <div class="bg-dark-800 rounded p-2">
                    <div class="text-xs text-gray-400">Acertos</div>
                    <div class="font-semibold text-green-400">{{ session.correct_questions || 0 }}</div>
                  </div>
                  <div class="bg-dark-800 rounded p-2">
                    <div class="text-xs text-gray-400">Taxa</div>
                    <div class="font-semibold text-green-400">
                      {{ session.correct_questions ? Math.round((session.correct_questions / session.completed_questions) * 100) : 0 }}%
                    </div>
                  </div>
                </div>

                <div v-if="session.notes" class="mt-3 text-sm text-gray-400 italic border-t border-dark-700 pt-3">
                  "{{ session.notes }}"
                </div>
              </div>
            </div>
          </div>

          <!-- Por Matéria -->
          <div v-if="dayReport.bySubject.length > 0">
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Tempo por Matéria
            </h4>
            <div class="space-y-2">
              <div
                v-for="item in dayReport.bySubject"
                :key="item.subject"
                class="flex items-center justify-between bg-dark-900 border border-dark-700 rounded-lg p-3"
              >
                <span class="text-white font-medium">{{ item.subject }}</span>
                <span class="text-primary-400 font-mono">{{ formatMinutes(item.minutes) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="closeDayReportModal"
            class="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border flex items-center gap-3 min-w-[300px]',
            toast.type === 'success' ? 'bg-primary-500/20 border-primary-500/50 text-primary-100' : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <span class="flex-1 font-medium">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedDate = ref<Date | null>(null)
const subjects = ref<any[]>([])
const schedules = ref<any[]>([])
const loading = ref(false)

const viewMode = ref<'schedule' | 'report'>('schedule')
const showDayModal = ref(false)
const showRecurringModal = ref(false)
const showViewModal = ref(false)
const showDayReportModal = ref(false)
const viewingSchedule = ref<any>(null)
const dayReport = ref<any>({
  sessions: [],
  totalMinutes: 0,
  totalQuestions: 0,
  successRate: 0,
  bySubject: []
})

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const scheduleForm = ref({
  subject_id: '',
  study_type: 'conteudo' as 'conteudo' | 'questoes' | 'revisao',
  scheduled_time: '',
  planned_duration: 60,
  planned_questions: null as number | null
})

const recurringForm = ref({
  subject_id: '',
  study_type: 'conteudo' as 'conteudo' | 'questoes' | 'revisao',
  recurrence_type: 'weekly' as 'daily' | 'weekly',
  recurrence_days: [] as number[],
  start_date: '',
  end_date: '',
  scheduled_time: '',
  planned_duration: 60,
  planned_questions: null as number | null
})

const completionForm = ref({
  actual_duration: null as number | null,
  completed_questions: null as number | null,
  correct_questions: null as number | null,
  notes: ''
})

const toasts = ref<Array<{ id: number, message: string, type: 'success' | 'error' }>>([])
let toastIdCounter = 0

const monthName = computed(() => monthNames[currentMonth.value])

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month days
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: null, dayNumber: '', isCurrentMonth: false, isToday: false })
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    date.setHours(0, 0, 0, 0)
    const isToday = date.getTime() === today.getTime()
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: true,
      isToday
    })
  }

  return days
})

const getSchedulesForDay = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return schedules.value.filter(s => s.scheduled_date === dateStr)
}

const isSelected = (date: Date) => {
  if (!selectedDate.value) return false
  return date.toISOString().split('T')[0] === selectedDate.value.toISOString().split('T')[0]
}

const formatDate = (dateInput: any) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatMinutes = (minutes: number) => {
  if (!minutes) return '0min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadSchedules()
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadSchedules()
}

const goToToday = () => {
  const today = new Date()
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
  loadSchedules()
}

const handleDayClick = (date: Date) => {
  selectedDate.value = date
  if (viewMode.value === 'schedule') {
    showDayModal.value = true
  } else {
    openDayReport(date)
  }
}

const selectDay = (date: Date) => {
  selectedDate.value = date
  showDayModal.value = true
}

const openDayReport = (date: Date) => {
  selectedDate.value = date
  const dateStr = date.toISOString().split('T')[0]
  const daySessions = schedules.value.filter(s => s.scheduled_date === dateStr)

  // Calcular estatísticas
  let totalMinutes = 0
  let totalQuestions = 0
  let totalCorrect = 0
  const bySubject: Record<string, number> = {}

  daySessions.forEach(session => {
    const minutes = session.actual_duration || session.planned_duration || 0
    totalMinutes += minutes

    if (session.study_type === 'questoes') {
      totalQuestions += session.completed_questions || 0
      totalCorrect += session.correct_questions || 0
    }

    const subjectName = session.subjects?.name || 'Sem matéria'
    bySubject[subjectName] = (bySubject[subjectName] || 0) + minutes
  })

  const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  dayReport.value = {
    sessions: daySessions,
    totalMinutes,
    totalQuestions,
    successRate,
    bySubject: Object.entries(bySubject).map(([subject, minutes]) => ({ subject, minutes }))
  }

  showDayReportModal.value = true
}

const closeDayReportModal = () => {
  showDayReportModal.value = false
}

const closeDayModal = () => {
  showDayModal.value = false
  scheduleForm.value = {
    subject_id: '',
    study_type: 'conteudo',
    scheduled_time: '',
    planned_duration: 60,
    planned_questions: null
  }
}

const openRecurringModal = () => {
  const today = new Date()
  recurringForm.value.start_date = today.toISOString().split('T')[0]
  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 1)
  recurringForm.value.end_date = endDate.toISOString().split('T')[0]
  showRecurringModal.value = true
}

const closeRecurringModal = () => {
  showRecurringModal.value = false
  recurringForm.value = {
    subject_id: '',
    study_type: 'conteudo',
    recurrence_type: 'weekly',
    recurrence_days: [],
    start_date: '',
    end_date: '',
    scheduled_time: '',
    planned_duration: 60,
    planned_questions: null
  }
}

const toggleWeekDay = (day: number) => {
  const index = recurringForm.value.recurrence_days.indexOf(day)
  if (index > -1) {
    recurringForm.value.recurrence_days.splice(index, 1)
  } else {
    recurringForm.value.recurrence_days.push(day)
  }
}

const viewSchedule = (schedule: any) => {
  viewingSchedule.value = schedule
  completionForm.value = {
    actual_duration: schedule.actual_duration || schedule.planned_duration,
    completed_questions: schedule.completed_questions || schedule.planned_questions,
    correct_questions: schedule.correct_questions || null,
    notes: schedule.notes || ''
  }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingSchedule.value = null
  completionForm.value = {
    actual_duration: null,
    completed_questions: null,
    correct_questions: null,
    notes: ''
  }
}

const saveSchedule = async () => {
  if (!user.value || !selectedDate.value) return

  try {
    loading.value = true
    const { error } = await supabase.from('study_schedules').insert({
      user_id: user.value.id,
      subject_id: scheduleForm.value.subject_id,
      scheduled_date: selectedDate.value.toISOString().split('T')[0],
      scheduled_time: scheduleForm.value.scheduled_time || null,
      planned_duration: scheduleForm.value.planned_duration,
      study_type: scheduleForm.value.study_type,
      planned_questions: scheduleForm.value.planned_questions,
      is_recurring: false
    })

    if (error) throw error

    showToast('Agendamento criado com sucesso!', 'success')
    closeDayModal()
    await loadSchedules()
  } catch (e: any) {
    showToast(e.message || 'Erro ao criar agendamento', 'error')
  } finally {
    loading.value = false
  }
}

const saveRecurringSchedule = async () => {
  if (!user.value) return

  try {
    loading.value = true

    const startDate = new Date(recurringForm.value.start_date + 'T00:00:00')
    const endDate = new Date(recurringForm.value.end_date + 'T00:00:00')
    const schedules = []

    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const shouldInclude = recurringForm.value.recurrence_type === 'daily' ||
        (recurringForm.value.recurrence_type === 'weekly' && recurringForm.value.recurrence_days.includes(currentDate.getDay()))

      if (shouldInclude) {
        schedules.push({
          user_id: user.value.id,
          subject_id: recurringForm.value.subject_id,
          scheduled_date: currentDate.toISOString().split('T')[0],
          scheduled_time: recurringForm.value.scheduled_time || null,
          planned_duration: recurringForm.value.planned_duration,
          study_type: recurringForm.value.study_type,
          planned_questions: recurringForm.value.planned_questions,
          is_recurring: true,
          recurrence_type: recurringForm.value.recurrence_type,
          recurrence_days: recurringForm.value.recurrence_type === 'weekly' ? recurringForm.value.recurrence_days : null,
          recurrence_end_date: endDate.toISOString().split('T')[0]
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (schedules.length === 0) {
      showToast('Nenhum agendamento será criado com essas configurações', 'error')
      return
    }

    const { error } = await supabase.from('study_schedules').insert(schedules)
    if (error) throw error

    showToast(`${schedules.length} agendamento(s) criado(s) com sucesso!`, 'success')
    closeRecurringModal()
    await loadSchedules()
  } catch (e: any) {
    showToast(e.message || 'Erro ao criar agendamentos', 'error')
  } finally {
    loading.value = false
  }
}

const completeSchedule = async () => {
  if (!viewingSchedule.value) return

  try {
    loading.value = true
    const { error } = await supabase
      .from('study_schedules')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_duration: completionForm.value.actual_duration || viewingSchedule.value.planned_duration,
        completed_questions: completionForm.value.completed_questions,
        correct_questions: completionForm.value.correct_questions,
        notes: completionForm.value.notes
      })
      .eq('id', viewingSchedule.value.id)

    if (error) throw error

    showToast('Agendamento marcado como concluído!', 'success')
    closeViewModal()
    await loadSchedules()
  } catch (e: any) {
    showToast(e.message || 'Erro ao concluir agendamento', 'error')
  } finally {
    loading.value = false
  }
}

const cancelSchedule = async () => {
  if (!viewingSchedule.value) return

  try {
    loading.value = true
    const { error } = await supabase
      .from('study_schedules')
      .update({ status: 'cancelled' })
      .eq('id', viewingSchedule.value.id)

    if (error) throw error

    showToast('Agendamento cancelado', 'success')
    closeViewModal()
    await loadSchedules()
  } catch (e: any) {
    showToast(e.message || 'Erro ao cancelar agendamento', 'error')
  } finally {
    loading.value = false
  }
}

const loadSubjects = async () => {
  if (!user.value) return

  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.value.id)
    .order('name')

  subjects.value = data || []
}

const loadSchedules = async () => {
  if (!user.value) return

  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)

  console.log('📅 Carregando agendamentos de', firstDay.toISOString().split('T')[0], 'até', lastDay.toISOString().split('T')[0])

  const { data, error } = await supabase
    .from('study_schedules')
    .select('*, subjects(name, color)')
    .eq('user_id', user.value.id)
    .gte('scheduled_date', firstDay.toISOString().split('T')[0])
    .lte('scheduled_date', lastDay.toISOString().split('T')[0])
    .order('scheduled_date')
    .order('scheduled_time')

  if (error) {
    console.error('❌ Erro ao carregar agendamentos:', error)
  } else {
    console.log('✅ Agendamentos carregados:', data)
  }

  schedules.value = data || []
}

const showToast = (message: string, type: 'success' | 'error') => {
  const id = toastIdCounter++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

onMounted(async () => {
  await loadSubjects()
  await loadSchedules()
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
