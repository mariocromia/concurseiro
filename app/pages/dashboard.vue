<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">


    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 hover:border-orange-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-claude-text-secondary dark:text-gray-400 mb-1">Tempo Hoje</p>
              <p class="text-2xl font-bold text-claude-text dark:text-white">{{ formatHM(dailyStudySeconds) }}</p>
              <p class="text-xs text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mt-1">+{{ formatHM(weeklyStudySeconds) }} esta semana</p>
            </div>
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 hover:border-orange-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-claude-text-secondary dark:text-gray-400 mb-1">Revisões Pendentes</p>
              <p class="text-2xl font-bold text-claude-text dark:text-white">{{ completedRevisions }}/{{ totalRevisions }}</p>
              <p class="text-xs text-orange-400 mt-1">{{ pendingRevisionsThisWeek }} pendentes esta semana</p>
            </div>
            <div class="w-12 h-12 bg-orange-500/20 rounded-claude-md flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 hover:border-orange-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-claude-text-secondary dark:text-gray-400 mb-1">Matérias Ativas</p>
              <p class="text-2xl font-bold text-claude-text dark:text-white">{{ subjectsCount }}</p>
              <p class="text-xs text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mt-1">{{ studyGoalsCount }} metas definidas</p>
            </div>
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 hover:border-yellow-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-claude-text-secondary dark:text-gray-400 mb-1">Sequência</p>
              <p class="text-2xl font-bold text-claude-text dark:text-white">{{ studyStreak }}</p>
              <p class="text-xs text-yellow-400 mt-1">dias consecutivos 🔥</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/20 rounded-claude-md flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Quick Start Section -->
      <div class="bg-[#f5f5ed] dark:bg-dark-800/50 border border-[#E5E5E5] dark:border-dark-700 rounded-xl p-6 mb-8">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-[#2C2C2C] dark:text-white mb-2 flex items-center gap-2">
              <span>🤖</span>
              <span>Recursos de IA</span>
              <span class="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded uppercase">PRO</span>
            </h3>
            <p class="text-[#6B6B6B] dark:text-gray-300 text-sm">Potencialize seus estudos com Inteligência Artificial</p>
          </div>
          <button
            data-tour="ai-welcome"
            class="px-4 py-2 bg-[#f0e8e1] hover:bg-[#e8ddd3] dark:bg-white/10 dark:hover:bg-white/20 text-[#2C2C2C] dark:text-white rounded-lg transition-colors text-sm"
            @click="startAITour"
          >
            📖 Ver Tour
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- AI Tutor -->
          <button
            data-tour="ai-chat"
            class="p-4 bg-[#f5e4dd] dark:bg-dark-800/50 border border-[#E5E5E5] dark:border-purple-500/30 rounded-lg hover:border-[#ca643f] dark:hover:border-purple-500 hover:bg-[#eeddd4] dark:hover:bg-purple-500/10 transition-all group text-left"
            @click="openAITutor"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <svg class="w-5 h-5 text-[#ca643f] dark:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h4 class="font-semibold text-[#2C2C2C] dark:text-white mb-1">Tutor de IA</h4>
            <p class="text-sm text-[#6B6B6B] dark:text-gray-400">Tire dúvidas em tempo real</p>
          </button>

          <!-- AI Exercises -->
          <button
            data-tour="ai-exercises"
            class="p-4 bg-[#f5e4dd] dark:bg-dark-800/50 border border-[#E5E5E5] dark:border-purple-500/30 rounded-lg hover:border-[#ca643f] dark:hover:border-purple-500 hover:bg-[#eeddd4] dark:hover:bg-purple-500/10 transition-all group text-left"
            @click="openAIExercises"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <svg class="w-5 h-5 text-[#ca643f] dark:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h4 class="font-semibold text-[#2C2C2C] dark:text-white mb-1">Gerar Exercícios</h4>
            <p class="text-sm text-[#6B6B6B] dark:text-gray-400">Crie questões personalizadas</p>
          </button>

          <!-- Mind Maps -->
          <NuxtLink
            to="/mapa-mental"
            data-tour="mind-maps"
            class="p-4 bg-[#f5e4dd] dark:bg-dark-800/50 border border-[#E5E5E5] dark:border-purple-500/30 rounded-lg hover:border-[#ca643f] dark:hover:border-purple-500 hover:bg-[#eeddd4] dark:hover:bg-purple-500/10 transition-all group"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <svg class="w-5 h-5 text-[#ca643f] dark:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h4 class="font-semibold text-[#2C2C2C] dark:text-white mb-1">Mapas Mentais</h4>
            <p class="text-sm text-[#6B6B6B] dark:text-gray-400">Crie mapas automáticos</p>
          </NuxtLink>

          <!-- AI Flashcards -->
          <NuxtLink
            to="/flashcards"
            data-tour="ai-flashcards"
            class="p-4 bg-[#f5e4dd] dark:bg-dark-800/50 border border-[#E5E5E5] dark:border-purple-500/30 rounded-lg hover:border-[#ca643f] dark:hover:border-purple-500 hover:bg-[#eeddd4] dark:hover:bg-purple-500/10 transition-all group"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <svg class="w-5 h-5 text-[#ca643f] dark:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h4 class="font-semibold text-[#2C2C2C] dark:text-white mb-1">Flashcards IA</h4>
            <p class="text-sm text-[#6B6B6B] dark:text-gray-400">Gere cards automaticamente</p>
          </NuxtLink>
        </div>

        <!-- AI Usage Tips -->
        <div class="mt-4 p-3 bg-[#eeddd4] dark:bg-dark-900/50 rounded-lg border border-[#E5E5E5] dark:border-dark-700">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-[#ca643f] dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <p class="text-[#6B6B6B] dark:text-gray-300"><strong class="text-[#2C2C2C] dark:text-white">Dica:</strong> Use o Tutor de IA diretamente no Caderno Virtual ou gere exercícios a partir de qualquer tema!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar Section -->
      <div class="bg-white dark:bg-dark-800/50 backdrop-blur-sm border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200 dark:border-dark-700">
          <div class="flex items-center justify-between flex-wrap gap-4">
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
              @click="handleCreateActivity(new Date().toISOString().split('T')[0])"
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
          @delete-activity="handleDeleteActivity"
          @toggle-completion="handleToggleActivityCompletion"
          @view-changed="handleViewChanged"
          @filtered-changed="handleFilteredChanged"
        />
      </div>

      <!-- Quick Actions -->
      <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6">
        <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4">Ações Rápidas</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <NuxtLink to="/calendar" class="p-4 border-2 border-dark-700 rounded-claude-md hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p class="font-semibold text-claude-text dark:text-white">Calendário</p>
          </NuxtLink>

          <NuxtLink to="/reports" class="p-4 border-2 border-dark-700 rounded-claude-md hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <p class="font-semibold text-claude-text dark:text-white">Relatórios</p>
          </NuxtLink>

          <NuxtLink to="/onboarding" class="p-4 border-2 border-dark-700 rounded-claude-md hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <p class="font-semibold text-claude-text dark:text-white">Configurar Meta</p>
          </NuxtLink>

          <NuxtLink to="/subjects" class="p-4 border-2 border-dark-700 rounded-claude-md hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <p class="font-semibold text-claude-text dark:text-white">Gerenciar Matérias</p>
          </NuxtLink>

          <NuxtLink to="/study" class="p-4 border-2 border-dark-700 rounded-claude-md hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="font-semibold text-claude-text dark:text-white">Iniciar Estudo</p>
          </NuxtLink>

          <NuxtLink to="/notebook" class="p-4 border-2 border-dark-700 rounded-claude-md hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <p class="font-semibold text-claude-text dark:text-white">Caderno Virtual</p>
          </NuxtLink>
        </div>
      </div>

      <!-- Task Modal -->
      <div v-if="showAddTaskModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-dark-800 border border-dark-700 rounded-claude-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4">{{ editingTask ? 'Editar Tarefa' : 'Nova Tarefa' }}</h3>

          <form @submit.prevent="saveTask">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Título</label>
                <input
                  v-model="taskForm.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite o título da tarefa"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Descrição</label>
                <textarea
                  v-model="taskForm.description"
                  rows="3"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descreva a tarefa"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Matéria</label>
                <select
                  v-model="taskForm.subject"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecione uma matéria</option>
                  <option v-for="subject in subjects" :key="subject.id" :value="subject.name">
                    {{ subject.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Data de Vencimento</label>
                <input
                  v-model="taskForm.due_date"
                  type="date"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
              </div>

              <div v-if="editingTask">
                <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Status</label>
                <select
                  v-model="taskForm.status"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todo">A Fazer</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeTaskModal"
                class="px-4 py-2 text-claude-text-secondary dark:text-gray-400 hover:text-claude-text dark:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                v-if="editingTask"
                type="button"
                @click="deleteTask"
                class="px-4 py-2 bg-red-600 text-claude-text dark:text-white rounded-claude-md hover:bg-red-700 transition"
              >
                Excluir
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition"
              >
                {{ editingTask ? 'Salvar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

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

    <!-- AI Onboarding Tour -->
    <AIOnboardingTour ref="aiTourRef" />

    <!-- AI Exercises Config Modal -->
    <AIExercisesConfigModal
      :is-open="showExercisesConfig"
      @close="showExercisesConfig = false"
      @generate="handleGenerateExercises"
    />

    <!-- AI Exercises Modal -->
    <AIExercisesModal
      :is-open="showExercisesModal"
      :content="exercisesContent"
      :chapter-title="exercisesChapter"
      :subject-id="exercisesSubjectId"
      @close="showExercisesModal = false"
    />

    <!-- AI Tutor Modal -->
    <AITutorModal
      :is-open="showTutorModal"
      @close="showTutorModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { ScheduleActivity, CreateActivityPayload } from '~/composables/useStudySchedule'

import { Chart, registerables } from 'chart.js'

definePageMeta({
  middleware: 'auth'
})

Chart.register(...registerables)

const { signOut } = useAuth()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

// Basic data
const userData = ref<any>(null)
const subscriptionType = ref('freemium')

// Enhanced statistics
const dailyStudySeconds = ref(0)
const weeklyStudySeconds = ref(0)
const subjectsCount = ref(0)
const studyGoalsCount = ref(0)
const revisionsPending = ref(0)
const urgentRevisions = ref(0)
const studyStreak = ref(0)
// ✅ Novas variáveis para revisões
const totalRevisions = ref(0) // Total de revisões no sistema
const completedRevisions = ref(0) // Total de revisões concluídas
const pendingRevisionsThisWeek = ref(0) // Revisões pendentes na semana atual

// Chart refs
const weeklyChart = ref<HTMLCanvasElement>()
const subjectChart = ref<HTMLCanvasElement>()

// Kanban data
const tasks = ref<any[]>([])
const subjects = ref<any[]>([])
const showAddTaskModal = ref(false)
const editingTask = ref<any>(null)
const taskForm = ref({
  title: '',
  description: '',
  subject: '',
  due_date: '',
  status: 'todo'
})

// Calendar
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
const filteredActivitiesFromCalendar = ref<ScheduleActivity[]>([]) // ✅ Atividades filtradas pela busca

// AI Modals
const showExercisesConfig = ref(false)
const showExercisesModal = ref(false)
const exercisesContent = ref('')
const exercisesChapter = ref('')
const exercisesSubjectId = ref('')
const showTutorModal = ref(false)


// Computed properties for Kanban columns
const todoTasks = computed(() => tasks.value.filter(task => task.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(task => task.status === 'in_progress'))
const doneTasks = computed(() => tasks.value.filter(task => task.status === 'done'))

const formatHM = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Buscar dados do usuário e estatísticas
onMounted(async () => {
  console.log('📍📍📍 === DASHBOARD MOUNTED === 📍📍📍')
  console.log('⏰ Timestamp:', new Date().toISOString())

  // ✅ CORREÇÃO: Buscar user_id da sessão ao invés de user.value
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user?.id) {
    console.warn('⚠️⚠️⚠️ Sessão não encontrada no onMounted ⚠️⚠️⚠️', sessionError)
    console.warn('⏳ Aguardando watchEffect detectar usuário...')
    console.log('🏁 === FIM: onMounted (sem sessão) ===')
    return
  }

  const userId = session.user.id
  console.log('✅ user_id da sessão disponível:', userId)

  // Buscar dados do usuário
  const { data: userData_result } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userData_result) {
    console.log('✅ Dados do usuário carregados')
    userData.value = userData_result
    subscriptionType.value = userData_result.subscription_type || 'freemium'

    // Carregar todos os dados
    console.log('📊 Carregando estatísticas...')
    await loadStats()

    console.log('📋 Carregando tarefas...')
    await loadTasks()

    console.log('📚 Carregando matérias...')
    await loadSubjects()

    console.log('📈 Inicializando gráficos...')
    await initCharts()

    console.log('✅ onMounted concluído com sucesso!')
  } else {
    console.warn('⚠️ Dados do usuário não encontrados no banco')
  }

  console.log('🏁 === FIM: onMounted ===')
})

// ✅ SOLUÇÃO DEFINITIVA: Buscar user_id diretamente da sessão do Supabase
let calendarLoaded = ref(false)
let userIdFromSession = ref<string | null>(null)

// Helper function to get user ID directly from Supabase session
const getUserIdFromSession = async () => {
  try {
    console.log('🔍 Buscando user_id da sessão Supabase...')
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Erro ao obter sessão:', error)
      return null
    }

    const userId = session?.user?.id || null
    console.log('📍 user_id da sessão:', userId)
    return userId
  } catch (err) {
    console.error('❌ Exception ao obter sessão:', err)
    return null
  }
}

watchEffect(async () => {
  console.log('⚡⚡⚡ === WATCHEFFECT DISPARADO === ⚡⚡⚡')
  console.log('👤 user.value?.id:', user.value?.id)
  console.log('👤 userIdFromSession.value:', userIdFromSession.value)
  console.log('📊 calendarLoaded:', calendarLoaded.value)

  // Tenta obter user_id da sessão se ainda não temos
  if (!userIdFromSession.value) {
    userIdFromSession.value = await getUserIdFromSession()
  }

  // Use either session user ID or reactive user.value.id
  const effectiveUserId = userIdFromSession.value || user.value?.id

  if (effectiveUserId && !calendarLoaded.value) {
    console.log('✅✅✅ USER_ID DISPONÍVEL! Carregando calendário... ✅✅✅')
    console.log('👤 effectiveUserId:', effectiveUserId)

    try {
      await loadCalendarData()
      calendarLoaded.value = true
      console.log('✅ Calendário carregado com sucesso!')
    } catch (err) {
      console.error('❌ Erro ao carregar calendário:', err)
    }
  } else if (!effectiveUserId) {
    console.log('⏳ USER_ID ainda não disponível, tentando novamente em 1 segundo...')

    // Retry once after 1 second if no user ID available
    setTimeout(async () => {
      if (!calendarLoaded.value) {
        console.log('🔄 RETRY: Buscando user_id novamente...')
        userIdFromSession.value = await getUserIdFromSession()

        const retryUserId = userIdFromSession.value || user.value?.id

        if (retryUserId) {
          console.log('✅ RETRY SUCESSO! user_id encontrado:', retryUserId)
          try {
            await loadCalendarData()
            calendarLoaded.value = true
            console.log('✅ Calendário carregado no retry!')
          } catch (err) {
            console.error('❌ Erro no retry:', err)
          }
        } else {
          console.error('❌ RETRY FALHOU: user_id ainda não disponível')
        }
      }
    }, 1000)
  }

  console.log('🏁 === FIM: watchEffect ===')
})

const loadStats = async () => {
  // Get user_id from session instead of user.value
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user?.id) {
    console.warn('[Dashboard] loadStats: No user session found', sessionError)
    return
  }

  const userId = session.user.id
  console.log('[Dashboard] loadStats: Loading statistics for user:', userId)

  try {
    // Subjects count
    const { count, error: subjectsError } = await supabase
      .from('subjects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (subjectsError) {
      console.error('[Dashboard] Error loading subjects count:', subjectsError)
    } else {
      console.log('[Dashboard] Subjects count:', count)
      subjectsCount.value = count || 0
    }

    // Study goals count
    const { count: goalsCount, error: goalsError } = await supabase
      .from('study_goals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (goalsError) {
      console.error('[Dashboard] Error loading goals count:', goalsError)
    } else {
      console.log('[Dashboard] Goals count:', goalsCount)
      studyGoalsCount.value = goalsCount || 0
    }

    // Daily study time
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    console.log('[Dashboard] Daily query range:', {
      start: today.toISOString(),
      end: tomorrow.toISOString()
    })

    const { data: dailySessions, error: dailyError } = await supabase
      .from('study_sessions')
      .select('duration, started_at')
      .eq('user_id', userId)
      .gte('started_at', today.toISOString())
      .lt('started_at', tomorrow.toISOString())

    if (dailyError) {
      console.error('[Dashboard] Error loading daily sessions:', dailyError)
    } else {
      console.log('[Dashboard] Daily sessions:', dailySessions?.length || 0, dailySessions)
      dailyStudySeconds.value = (dailySessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
      console.log('[Dashboard] Daily study seconds:', dailyStudySeconds.value)
    }

    // Weekly study time
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    console.log('[Dashboard] Weekly query start:', weekStart.toISOString())

    const { data: weeklySessions, error: weeklyError } = await supabase
      .from('study_sessions')
      .select('duration, started_at')
      .eq('user_id', userId)
      .gte('started_at', weekStart.toISOString())

    if (weeklyError) {
      console.error('[Dashboard] Error loading weekly sessions:', weeklyError)
    } else {
      console.log('[Dashboard] Weekly sessions:', weeklySessions?.length || 0)
      weeklyStudySeconds.value = (weeklySessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
      console.log('[Dashboard] Weekly study seconds:', weeklyStudySeconds.value)
    }
  } catch (err) {
    console.error('[Dashboard] Exception in loadStats:', err)
  }

  // ✅ Revisões do calendário (study_schedules com activity_type='review')
  try {
    const todayDate = new Date().toISOString().split('T')[0]
    console.log('[Dashboard] Revisions query date:', todayDate)

    // Calcular período da semana atual
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Domingo
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6) // Sábado
    weekEnd.setHours(23, 59, 59, 999)

    const weekStartDate = weekStart.toISOString().split('T')[0]
    const weekEndDate = weekEnd.toISOString().split('T')[0]

    console.log('[Dashboard] 📆 Semana atual:', {
      start: weekStartDate,
      end: weekEndDate
    })

    // ✅ Buscar revisões da tabela study_schedules
    const { data: allReviewActivities, error: reviewsError } = await supabase
      .from('study_schedules')
      .select('id, scheduled_date, status, is_completed, activity_type')
      .eq('user_id', userId)
      .eq('activity_type', 'review')
      .order('scheduled_date', { ascending: true })

    if (reviewsError) {
      console.error('[Dashboard] Error loading review activities:', reviewsError)
    } else {
      console.log('[Dashboard] 📋 TODAS as atividades de revisão:', allReviewActivities)

      // ✅ 1. Total de revisões no sistema (todas com activity_type='review')
      totalRevisions.value = allReviewActivities?.length || 0

      // ✅ 2. Total de revisões concluídas
      completedRevisions.value = allReviewActivities?.filter(r =>
        r.is_completed === true || r.status === 'completed'
      ).length || 0

      // ✅ 3. Revisões pendentes na semana atual
      pendingRevisionsThisWeek.value = allReviewActivities?.filter(r =>
        (r.is_completed === false || r.status === 'pending') &&
        r.scheduled_date >= weekStartDate &&
        r.scheduled_date <= weekEndDate
      ).length || 0

      console.log('[Dashboard] 📊 Resumo de revisões:', {
        total: totalRevisions.value,
        completed: completedRevisions.value,
        pendingThisWeek: pendingRevisionsThisWeek.value
      })
    }

    // ✅ Manter lógica antiga da tabela 'revisions' para compatibilidade (sistema R1-R7)
    const { count: pendingCount, error: revError } = await supabase
      .from('revisions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('scheduled_date', todayDate)

    if (revError) {
      console.error('[Dashboard] Error loading pending revisions:', revError)
    } else {
      console.log('[Dashboard] Pending revisions count:', pendingCount)
      revisionsPending.value = pendingCount || 0
    }

    // Urgent revisions (due today)
    const { count: urgentCount, error: urgentError } = await supabase
      .from('revisions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .eq('scheduled_date', todayDate)

    if (urgentError) {
      console.error('[Dashboard] Error loading urgent revisions:', urgentError)
    } else {
      console.log('[Dashboard] Urgent revisions count:', urgentCount)
      urgentRevisions.value = urgentCount || 0
    }
  } catch (err) {
    console.error('[Dashboard] Exception loading revisions:', err)
  }

  // Study streak calculation
  try {
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    console.log('[Dashboard] Calculating study streak starting from:', currentDate.toISOString())

    while (true) {
      const nextDay = new Date(currentDate)
      nextDay.setDate(nextDay.getDate() + 1)

      const { data: daySession, error: streakError } = await supabase
        .from('study_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('started_at', currentDate.toISOString())
        .lt('started_at', nextDay.toISOString())
        .limit(1)

      if (streakError) {
        console.error('[Dashboard] Error in streak calculation:', streakError)
        break
      }

      if (daySession && daySession.length > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }

      // Safety: prevent infinite loop
      if (streak > 365) {
        console.warn('[Dashboard] Streak exceeded 365 days, breaking loop')
        break
      }
    }

    console.log('[Dashboard] Final study streak:', streak)
    studyStreak.value = streak
  } catch (err) {
    console.error('[Dashboard] Exception in streak calculation:', err)
  }
}

const loadTasks = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  tasks.value = data || []
}

const loadSubjects = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return

  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('name')

  subjects.value = data || []
}

const initCharts = async () => {
  await nextTick()

  // Weekly Progress Chart
  if (weeklyChart.value) {
    const weeklyData = await getWeeklyStudyData()
    new Chart(weeklyChart.value, {
      type: 'line',
      data: {
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [{
          label: 'Horas de Estudo',
          data: weeklyData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                return value + 'h'
              }
            },
            grid: {
              color: '#374151'
            }
          },
          x: {
            ticks: {
              color: '#9CA3AF'
            },
            grid: {
              color: '#374151'
            }
          }
        }
      }
    })
  }

  // Subject Distribution Chart
  if (subjectChart.value) {
    const subjectData = await getSubjectStudyData()
    new Chart(subjectChart.value, {
      type: 'doughnut',
      data: {
        labels: subjectData.labels,
        datasets: [{
          data: subjectData.data,
          backgroundColor: [
            '#22C55E', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9CA3AF'
            }
          }
        }
      }
    })
  }
}

const getWeeklyStudyData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return Array(7).fill(0)

  const userId = session.user.id
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  console.log('[Dashboard] getWeeklyStudyData: Week start:', weekStart.toISOString())

  const weeklyData = []

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    console.log(`[Dashboard] Day ${i} (${dayStart.toLocaleDateString()}):`, {
      start: dayStart.toISOString(),
      end: dayEnd.toISOString()
    })

    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('duration, started_at')
      .eq('user_id', userId)
      .gte('started_at', dayStart.toISOString())
      .lt('started_at', dayEnd.toISOString())

    if (error) {
      console.error(`[Dashboard] Error loading day ${i}:`, error)
    } else {
      console.log(`[Dashboard] Day ${i} sessions found:`, sessions?.length || 0, sessions)
    }

    const totalSeconds = (sessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
    const hours = Math.round(totalSeconds / 3600 * 10) / 10
    console.log(`[Dashboard] Day ${i} total hours:`, hours)
    weeklyData.push(hours)
  }

  console.log('[Dashboard] Final weekly data:', weeklyData)
  return weeklyData
}

const getSubjectStudyData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return { labels: [], data: [] }

  const userId = session.user.id
  console.log('[Dashboard] getSubjectStudyData: Loading ALL sessions for user:', userId)

  const { data: sessions, error } = await supabase
    .from('study_sessions')
    .select('duration, subject_id, started_at, subjects(name)')
    .eq('user_id', userId)
    .not('subject_id', 'is', null)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('[Dashboard] Error loading subject sessions:', error)
    return { labels: [], data: [] }
  }

  console.log('[Dashboard] Total sessions found:', sessions?.length || 0)
  console.log('[Dashboard] First 5 sessions:', sessions?.slice(0, 5))
  console.log('[Dashboard] Last 5 sessions:', sessions?.slice(-5))

  // Log sessions after Oct 25, 2025
  const sessionsAfterOct25 = sessions?.filter((s: any) => {
    const date = new Date(s.started_at)
    const oct25 = new Date('2025-10-25T23:59:59Z')
    return date > oct25
  })
  console.log('[Dashboard] Sessions AFTER Oct 25, 2025:', sessionsAfterOct25?.length || 0, sessionsAfterOct25)

  const subjectTotals: { [key: string]: number } = {}

  sessions?.forEach((session: any) => {
    const subjectName = session.subjects?.name || 'Sem matéria'
    subjectTotals[subjectName] = (subjectTotals[subjectName] || 0) + (session.duration || 0)
  })

  const labels = Object.keys(subjectTotals)
  const data = Object.values(subjectTotals).map(seconds => Math.round(seconds / 3600 * 10) / 10)

  console.log('[Dashboard] Subject totals:', { labels, data })
  return { labels, data }
}

// Task management functions
const editTask = (task: any) => {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    subject: task.subject || '',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    status: task.status
  }
  showAddTaskModal.value = true
}

const closeTaskModal = () => {
  showAddTaskModal.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    subject: '',
    due_date: '',
    status: 'todo'
  }
}

const saveTask = async () => {
  if (!user.value || !taskForm.value.title.trim()) return

  const taskData = {
    title: taskForm.value.title.trim(),
    description: taskForm.value.description.trim(),
    subject: taskForm.value.subject,
    due_date: taskForm.value.due_date || null,
    status: taskForm.value.status,
    user_id: user.value.id
  }

  if (editingTask.value) {
    // Update existing task
    const { error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', editingTask.value.id)

    if (!error) {
      const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
      if (index !== -1) {
        tasks.value[index] = { ...editingTask.value, ...taskData }
      }
    }
  } else {
    // Create new task
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()

    if (!error && data) {
      tasks.value.unshift(data)
    }
  }

  closeTaskModal()
}

const deleteTask = async () => {
  if (!editingTask.value) return

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', editingTask.value.id)

  if (!error) {
    tasks.value = tasks.value.filter(t => t.id !== editingTask.value.id)
  }

  closeTaskModal()
}

// Calendar functions
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
  console.log('🌟🌟🌟 === INÍCIO: handleSaveActivity (Dashboard) === 🌟🌟🌟')
  console.log('📦 Payload recebido do modal:', JSON.stringify(payload, null, 2))

  try {
    console.log('📞 Chamando createActivity do composable...')
    const result = await createActivity(payload)

    console.log('📬 Resposta de createActivity:', result ? 'SUCESSO' : 'FALHA (null)')

    if (result) {
      console.log('✅✅✅ Atividade criada com sucesso! ✅✅✅')
      console.log('🎉 Dados da atividade criada:', JSON.stringify(result, null, 2))

      console.log('🚪 Fechando modal...')
      showActivityModal.value = false

      console.log('🧹 Limpando selectedActivity...')
      selectedActivity.value = null

      console.log('🔄 Recarregando dados do calendário...')
      await loadCalendarData()

      console.log('✅ Calendário recarregado com sucesso')
      console.log('🏁 === FIM: handleSaveActivity (SUCESSO) ===')
    } else {
      console.error('❌❌❌ createActivity retornou NULL ❌❌❌')
      console.error('Isso indica que houve um erro no composable')
      console.error('Verifique os logs acima para detalhes do erro')
      alert('Não foi possível salvar a atividade. Verifique o console para mais detalhes.')
      console.log('🏁 === FIM: handleSaveActivity (FALHA) ===')
    }
  } catch (err: any) {
    console.error('❌❌❌ EXCEPTION em handleSaveActivity ❌❌❌')
    console.error('Tipo:', typeof err)
    console.error('Mensagem:', err.message)
    console.error('Stack:', err.stack)
    alert(`Erro ao salvar atividade: ${err.message || 'Erro desconhecido'}`)
    console.log('🏁 === FIM: handleSaveActivity (EXCEPTION) ===')
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

const handleDeleteActivity = async (activityOrId: ScheduleActivity | string) => {
  const id = typeof activityOrId === 'string' ? activityOrId : activityOrId.id
  if (!id) return

  const success = await deleteActivity(id)
  if (success) {
    showActivityModal.value = false
    selectedActivity.value = null
    await loadCalendarData()
  }
}

const handleToggleActivityCompletion = async (activityOrId: ScheduleActivity | string) => {
  const id = typeof activityOrId === 'string' ? activityOrId : activityOrId.id
  if (!id) return

  await toggleCompletion(id)
  await loadCalendarData()
}

// Função para calcular período baseado no viewMode
type ViewMode = 'day' | 'week' | 'biweek' | 'month' | 'list'

const calculatePeriod = (viewMode: ViewMode, currentDate: Date): { start: string, end: string } => {
  const date = new Date(currentDate)
  date.setHours(0, 0, 0, 0)

  let startDate: Date
  let endDate: Date

  switch (viewMode) {
    case 'day':
      startDate = new Date(date)
      endDate = new Date(date)
      break

    case 'week':
      startDate = new Date(date)
      startDate.setDate(date.getDate() - date.getDay()) // Domingo
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // Sábado
      break

    case 'biweek':
      startDate = new Date(date)
      startDate.setDate(date.getDate() - date.getDay()) // Domingo
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 13) // 14 dias
      break

    case 'month':
      startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      break

    case 'list':
      // ✅ Lista mostra TUDO (passado e futuro)
      // Usar range muito amplo para incluir todas as atividades
      startDate = new Date('1900-01-01') // Data muito antiga
      endDate = new Date('2100-12-31')   // Data muito futura
      break

    default:
      startDate = new Date(date)
      endDate = new Date(date)
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  }
}

// ✅ Estado para armazenar o modo/data do calendário
const currentCalendarView = ref<{ viewMode: ViewMode; currentDate: Date }>({
  viewMode: 'week',
  currentDate: new Date()
})

// ✅ Função para recalcular estatísticas baseado em atividades filtradas + período
const recalculateStats = () => {
  const { viewMode, currentDate } = currentCalendarView.value
  const filtered = filteredActivitiesFromCalendar.value

  console.log(`📊 Recalculando stats - Modo: ${viewMode}, Filtradas: ${filtered.length}`)

  // Modo lista: usar TODAS as atividades filtradas (sem restrição de período)
  if (viewMode === 'list') {
    const totalMinutes = filtered.reduce((sum, a) => sum + a.duration, 0)
    const completedActivities = filtered.filter(a => a.is_completed).length

    calendarStats.value = {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      totalActivities: filtered.length,
      completedActivities,
      completionRate: filtered.length > 0
        ? Math.round((completedActivities / filtered.length) * 100)
        : 0
    }
    console.log('📈 Stats (lista - todas filtradas):', calendarStats.value)
    return
  }

  // Outros modos: filtrar pelo período visível
  const period = calculatePeriod(viewMode, currentDate)
  const visibleActivities = filtered.filter(a =>
    a.scheduled_date >= period.start && a.scheduled_date <= period.end
  )

  const totalMinutes = visibleActivities.reduce((sum, a) => sum + a.duration, 0)
  const completedActivities = visibleActivities.filter(a => a.is_completed).length

  calendarStats.value = {
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    totalActivities: visibleActivities.length,
    completedActivities,
    completionRate: visibleActivities.length > 0
      ? Math.round((completedActivities / visibleActivities.length) * 100)
      : 0
  }

  console.log(`📈 Stats (${viewMode} - período ${period.start} a ${period.end}):`, calendarStats.value)
}

// Handler para mudanças nas atividades filtradas (tipo/busca)
const handleFilteredChanged = (filtered: ScheduleActivity[]) => {
  console.log('🔍 Filtros mudaram:', filtered.length)
  filteredActivitiesFromCalendar.value = filtered
  recalculateStats() // ✅ Recalcular sempre que filtro muda
}

// Handler para mudanças de visualização (modo/data)
const handleViewChanged = (viewMode: ViewMode, currentDate: Date) => {
  console.log('🔄 View mudou:', viewMode, currentDate)
  currentCalendarView.value = { viewMode, currentDate }
  recalculateStats() // ✅ Recalcular sempre que período muda
}

const loadCalendarData = async () => {
  console.log('📅📅📅 === INÍCIO: loadCalendarData (Dashboard) === 📅📅📅')

  // ✅ CORREÇÃO: Carregar TODAS as atividades (passado, presente e futuro)
  // SEM filtro de data - o filtro será aplicado apenas na VISUALIZAÇÃO
  console.log('📆 Carregando TODAS as atividades (passado, presente e futuro)...')
  console.log('🔄 Chamando fetchActivities SEM filtros de data...')

  await fetchActivities() // Sem parâmetros = carrega TUDO

  // Aguardar Vue atualizar o DOM/refs
  await nextTick()

  console.log('✅ Atividades carregadas:', calendarActivities.value.length)

  // Calcular estatísticas para a semana atual (padrão é week view)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const period = calculatePeriod('week', today)

  console.log('📊 Calculando estatísticas iniciais (semana atual)...')
  console.log('📅 Período:', period)

  calendarStats.value = getWorkloadStats(period.start, period.end)

  console.log('📈 Estatísticas calculadas:', JSON.stringify(calendarStats.value, null, 2))
  console.log('✅ loadCalendarData concluído')

  // Debug: mostrar datas das atividades
  const uniqueDates = [...new Set(calendarActivities.value.map((a: any) => a.scheduled_date))].sort()
  console.log('📆 Datas com atividades:', uniqueDates)
  console.log(`📊 Range de datas: ${uniqueDates[0] || 'N/A'} até ${uniqueDates[uniqueDates.length - 1] || 'N/A'}`)
  console.log('🏁 === FIM: loadCalendarData ===')
}

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Erro ao sair:', error)
  }
}

// AI Tour
const aiTourRef = ref<any>(null)

const startAITour = () => {
  if (aiTourRef.value) {
    aiTourRef.value.startTour()
  }
}

const openAIExercises = () => {
  showExercisesConfig.value = true
}

const handleGenerateExercises = (config: any) => {
  exercisesContent.value = config.content
  exercisesChapter.value = config.subjectName
  exercisesSubjectId.value = config.subjectId
  showExercisesModal.value = true
}

const openAITutor = () => {
  showTutorModal.value = true
}
</script>
