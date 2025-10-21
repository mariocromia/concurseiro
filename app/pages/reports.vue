<template>
  <div class="min-h-screen bg-[#faf9f5] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-claude-text dark:text-white mb-2">Relatórios de Estudos</h1>
        <p class="text-claude-text-secondary dark:text-gray-400">Acompanhe seu progresso e desempenho em detalhes</p>
      </div>

      <!-- Filtros e Ações -->
      <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-3 flex-wrap">
            <button
              v-for="period in periods"
              :key="period.value"
              @click="changePeriod(period.value)"
              :class="[
                'px-4 py-2 rounded-claude-md font-medium transition-all',
                selectedPeriod === period.value
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-dark-700/50 text-claude-text-secondary dark:text-gray-400 hover:bg-dark-700 hover:text-white'
              ]"
            >
              {{ period.label }}
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="refreshData"
              :disabled="isLoading"
              class="p-2 rounded-claude-md bg-dark-700/50 hover:bg-dark-700 text-gray-400 hover:text-white transition-all disabled:opacity-50"
              title="Atualizar dados"
            >
              <svg class="w-5 h-5" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>

            <button
              @click="handleExport"
              :disabled="isLoading || !reportData"
              class="px-4 py-2 rounded-claude-md bg-green-600 hover:bg-green-700 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>

        <!-- Filtro por Matéria -->
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-claude-text dark:text-gray-300">
            Filtrar por matéria:
            <span class="text-xs text-gray-500">({{ subjects.length }} matérias)</span>
          </label>
          <div class="relative">
            <select
              v-model="selectedSubjectId"
              @change="handleSubjectChange"
              class="px-4 py-2 rounded-claude-md bg-dark-700/50 text-claude-text dark:text-white border border-dark-600 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none pr-10"
            >
              <option value="">Todas as Matérias</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
            <svg class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <span v-if="selectedSubjectId" class="text-xs text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full">
            Filtrando por: {{ subjects.find(s => s.id === selectedSubjectId)?.name }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !reportData" class="space-y-6">
        <SkeletonLoader type="stat" />
        <SkeletonLoader type="chart" />
        <SkeletonLoader type="card" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-500/10 border border-red-500/30 rounded-claude-lg p-6 text-center">
        <svg class="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-red-400 mb-2">Erro ao carregar relatórios</h3>
        <p class="text-red-300 mb-4">{{ error }}</p>
        <button @click="refreshData" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-claude-md font-medium transition-all">
          Tentar Novamente
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="reportData">
        <!-- Aviso quando não há dados para a matéria filtrada -->
        <div v-if="selectedSubjectId && reportData.stats.totalMinutes === 0 && reportData.stats.totalQuestions === 0" class="bg-yellow-500/10 border border-yellow-500/30 rounded-claude-lg p-6 mb-6">
          <div class="flex items-start gap-4">
            <svg class="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-yellow-400 mb-2">Nenhum dado encontrado para esta matéria</h3>
              <p class="text-yellow-300 mb-3">
                Não foram encontrados dados de estudo ou exercícios para a matéria "{{ subjects.find(s => s.id === selectedSubjectId)?.name }}" no período selecionado.
              </p>
              <ul class="text-sm text-yellow-200 space-y-1 list-disc list-inside">
                <li>Verifique se você já estudou ou resolveu exercícios desta matéria</li>
                <li>Tente selecionar um período maior (ex: "Todo período")</li>
                <li>Ao gerar exercícios IA, selecione a matéria correspondente</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Cards de Estatísticas Gerais -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <!-- Tempo Total -->
          <div class="bg-gradient-to-br from-primary-500/10 to-primary-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-primary-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-primary-500/10 transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-claude-text-secondary dark:text-gray-400 text-sm font-medium">Tempo Total</span>
              <div class="w-12 h-12 bg-primary-500/20 rounded-claude-md flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-claude-text dark:text-white mb-2">{{ reportData.stats.totalHours }}</div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600 dark:text-gray-500">{{ reportData.stats.totalMinutes }} minutos</span>
              <span v-if="reportData.stats.weeklyTrend !== 0" :class="reportData.stats.weeklyTrend > 0 ? 'text-green-400' : 'text-red-400'" class="flex items-center gap-1">
                <svg v-if="reportData.stats.weeklyTrend > 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                {{ Math.abs(reportData.stats.weeklyTrend) }}%
              </span>
            </div>
          </div>

          <!-- Média Diária -->
          <div class="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-green-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-claude-text-secondary dark:text-gray-400 text-sm font-medium">Média Diária</span>
              <div class="w-12 h-12 bg-green-500/20 rounded-claude-md flex items-center justify-center">
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-claude-text dark:text-white mb-2">{{ reportData.stats.dailyAverage }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-500">por dia</div>
          </div>

          <!-- Total de Questões -->
          <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-blue-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-claude-text-secondary dark:text-gray-400 text-sm font-medium">Total de Questões</span>
              <div class="w-12 h-12 bg-blue-500/20 rounded-claude-md flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-claude-text dark:text-white mb-2">{{ reportData.stats.totalQuestions }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-500">questões resolvidas</div>
          </div>

          <!-- Taxa de Acerto -->
          <div class="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-yellow-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-claude-text-secondary dark:text-gray-400 text-sm font-medium">Taxa de Acerto</span>
              <div class="w-12 h-12 bg-yellow-500/20 rounded-claude-md flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-claude-text dark:text-white mb-2">{{ reportData.stats.successRate }}%</div>
            <div class="text-sm text-gray-600 dark:text-gray-500">média geral</div>
          </div>
        </div>

        <!-- Progresso da Meta e Revisões -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Progresso da Meta -->
          <div v-if="reportData.stats.goalProgress > 0" class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6">
            <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Progresso da Meta Diária
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-claude-text-secondary dark:text-gray-400">Atingido</span>
                <span class="text-2xl font-bold" :class="reportData.stats.goalProgress >= 100 ? 'text-green-400' : 'text-yellow-400'">
                  {{ reportData.stats.goalProgress }}%
                </span>
              </div>
              <div class="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
                <div
                  class="h-3 rounded-full transition-all duration-500"
                  :class="reportData.stats.goalProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-400'"
                  :style="{ width: `${Math.min(reportData.stats.goalProgress, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tipos de Estudo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-purple-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-purple-500/20 rounded-claude-md flex items-center justify-center">
                <span class="text-2xl">📖</span>
              </div>
              <h3 class="text-lg font-semibold text-claude-text dark:text-white">Conteúdo</h3>
            </div>
            <div class="text-4xl font-bold text-primary-400 mb-2">{{ formatHours(reportData.studyTypes.conteudo) }}</div>
            <div class="text-sm text-claude-text-secondary dark:text-gray-400">{{ reportData.studyTypes.conteudoSessions }} sessões</div>
          </div>

          <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-blue-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-blue-500/20 rounded-claude-md flex items-center justify-center">
                <span class="text-2xl">📝</span>
              </div>
              <h3 class="text-lg font-semibold text-claude-text dark:text-white">Questões</h3>
            </div>
            <div class="text-4xl font-bold text-primary-400 mb-2">{{ formatHours(reportData.studyTypes.questoes) }}</div>
            <div class="text-sm text-claude-text-secondary dark:text-gray-400">{{ reportData.studyTypes.questoesSessions }} sessões</div>
          </div>

          <div class="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-green-500/20 dark:border-dark-700 rounded-claude-lg p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-green-500/20 rounded-claude-md flex items-center justify-center">
                <span class="text-2xl">🔄</span>
              </div>
              <h3 class="text-lg font-semibold text-claude-text dark:text-white">Revisão</h3>
            </div>
            <div class="text-4xl font-bold text-primary-400 mb-2">{{ formatHours(reportData.studyTypes.revisao) }}</div>
            <div class="text-sm text-claude-text-secondary dark:text-gray-400">{{ reportData.studyTypes.revisaoSessions }} sessões</div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Gráfico de Evolução Diária -->
          <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6">
            <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
              Evolução Diária de Estudos
            </h3>
            <div class="h-64">
              <Line v-if="dailyChartData" :data="dailyChartData" :options="lineChartOptions" />
            </div>
          </div>

          <!-- Gráfico de Distribuição por Matéria ou Taxa de Acerto -->
          <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6">
            <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
              <svg v-if="!selectedSubjectId" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ selectedSubjectId ? 'Taxa de Acerto ao Longo do Tempo' : 'Distribuição por Matéria' }}
            </h3>
            <div class="h-64 flex items-center justify-center">
              <Doughnut v-if="!selectedSubjectId && subjectChartData" :data="subjectChartData" :options="doughnutChartOptions" />
              <Line v-else-if="selectedSubjectId && accuracyChartData" :data="accuracyChartData" :options="accuracyChartOptions" />
              <div v-else class="text-center text-gray-500 dark:text-gray-400">
                <p>Sem dados suficientes para exibir</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tempo por Matéria (Detalhado) -->
        <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 mb-6">
          <h2 class="text-xl font-bold text-claude-text dark:text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            Tempo por Matéria
          </h2>

          <div v-if="reportData.bySubject.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-600 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-claude-text-secondary dark:text-gray-400 mb-2">Nenhum dado disponível</h3>
            <p class="text-sm text-gray-600 dark:text-gray-500">Nenhuma sessão de estudo encontrada no período selecionado</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="item in reportData.bySubject"
              :key="item.subject"
              class="bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md p-4 hover:shadow-lg transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded-full shadow-lg"
                    :style="{ backgroundColor: item.color }"
                  ></div>
                  <span class="font-semibold text-claude-text dark:text-white">{{ item.subject }}</span>
                  <span class="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 rounded-full">{{ item.percentage }}%</span>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-primary-400">{{ formatHours(item.minutes) }}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-500">{{ item.sessions }} sessões</div>
                </div>
              </div>

              <!-- Barra de progresso -->
              <div class="w-full bg-dark-800 rounded-full h-2.5">
                <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :style="{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desempenho em Questões -->
        <div v-if="reportData.questionsBySubject.length > 0" class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6 mb-6">
          <h2 class="text-xl font-bold text-claude-text dark:text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            Desempenho em Questões por Matéria
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in reportData.questionsBySubject"
              :key="item.subject"
              class="bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md p-5 hover:shadow-lg transition-all"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded-full shadow-lg"
                    :style="{ backgroundColor: item.color }"
                  ></div>
                  <span class="font-semibold text-claude-text dark:text-white">{{ item.subject }}</span>
                </div>
                <div
                  class="text-3xl font-bold px-3 py-1 rounded-md"
                  :class="item.rate >= 70 ? 'text-green-400 bg-green-500/10' : item.rate >= 50 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'"
                >
                  {{ item.rate }}%
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3 text-sm">
                <div class="bg-dark-800/50 rounded-md p-3 text-center">
                  <div class="text-xs text-claude-text-secondary dark:text-gray-400 mb-1">Total</div>
                  <div class="text-lg font-bold text-claude-text dark:text-white">{{ item.total }}</div>
                </div>
                <div class="bg-green-500/10 border border-green-500/20 rounded-md p-3 text-center">
                  <div class="text-xs text-green-400 mb-1">Acertos</div>
                  <div class="text-lg font-bold text-green-300">{{ item.correct }}</div>
                </div>
                <div class="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-center">
                  <div class="text-xs text-red-400 mb-1">Erros</div>
                  <div class="text-lg font-bold text-red-300">{{ item.wrong }}</div>
                </div>
              </div>

              <!-- Mini barra de progresso -->
              <div class="mt-3 w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="item.rate >= 70 ? 'bg-green-500' : item.rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                  :style="{ width: `${item.rate}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exercícios IA Salvos com Paginação -->
        <div v-if="reportData.exercisesBySubject.length > 0" class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:bg-dark-800/50 backdrop-blur-sm border border-purple-500/20 dark:border-dark-700 rounded-claude-lg p-6 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-claude-text dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Exercícios IA Salvos
              <span class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">PRO</span>
            </h2>
            <div class="flex items-center gap-3">
              <select
                v-model="exercisesPerPage"
                class="px-3 py-1.5 text-sm rounded-claude-md bg-dark-700/50 text-purple-400 border border-purple-500/20 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option :value="5">Últimos 5</option>
                <option :value="10">Últimos 10</option>
                <option :value="25">Últimos 25</option>
                <option :value="50">Últimos 50</option>
              </select>
              <span class="text-sm text-purple-400 font-medium">{{ displayedExercises.length }} de {{ reportData.exercisesBySubject.length }}</span>
            </div>
          </div>

          <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="(exercise, index) in displayedExercises"
              :key="index"
              class="bg-white dark:bg-dark-900 border border-purple-500/20 dark:border-dark-700 rounded-claude-md p-5 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div
                      class="w-3 h-3 rounded-full shadow-lg"
                      :style="{ backgroundColor: exercise.color }"
                    ></div>
                    <span class="text-xs text-purple-400 font-medium uppercase tracking-wider">{{ exercise.subject }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">•</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ new Date(exercise.createdAt).toLocaleDateString('pt-BR') }}</span>
                  </div>
                  <h3 class="font-semibold text-claude-text dark:text-white">{{ exercise.title }}</h3>
                </div>
                <div
                  class="text-2xl font-bold px-3 py-1 rounded-md ml-4"
                  :class="exercise.score >= 70 ? 'text-green-400 bg-green-500/10' : exercise.score >= 50 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'"
                >
                  {{ Math.round(exercise.score) }}%
                </div>
              </div>

              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span class="text-gray-600 dark:text-gray-400">{{ exercise.totalQuestions }} questões</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-green-400">{{ exercise.correctAnswers }} acertos</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span class="text-red-400">{{ exercise.totalQuestions - exercise.correctAnswers }} erros</span>
                </div>
              </div>

              <!-- Barra de progresso -->
              <div class="mt-3 w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                <div
                  class="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                  :style="{ width: `${exercise.score}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <svg class="w-20 h-20 mx-auto text-gray-600 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-xl font-semibold text-claude-text-secondary dark:text-gray-400 mb-2">Nenhum dado disponível</h3>
        <p class="text-sm text-gray-600 dark:text-gray-500 mb-6">Comece a estudar para ver seus relatórios aqui!</p>
        <NuxtLink
          to="/study"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-claude-lg transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Iniciar Estudo
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const { isLoading, error, formatHours, loadReportData, exportToCSV } = useReports()
const { success, error: showError } = useToast()

const selectedPeriod = ref('all') // Mudado de '30days' para 'all' para mostrar todos os exercícios
const selectedSubjectId = ref('')
const reportData = ref<any>(null)
const subjects = ref<any[]>([])
const exercisesPerPage = ref(5)

// Fetch user's subjects
const fetchSubjects = async () => {
  console.log('[Reports] 🔍 Buscando matérias...')
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id

  console.log('[Reports] 🔍 userId:', userId)
  if (!userId) {
    console.warn('[Reports] ⚠️ Sem userId, não pode buscar matérias')
    return
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, color')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  console.log('[Reports] 📚 Matérias encontradas:', data?.length || 0)
  console.log('[Reports] 📚 Dados brutos:', data)
  if (error) {
    console.error('[Reports] ❌ Erro ao buscar matérias:', error)
  }

  if (!error && data) {
    subjects.value = data
    console.log('[Reports] ✅ Matérias carregadas no ref:', subjects.value)
  } else if (error) {
    console.error('[Reports] ❌ Detalhes do erro:', JSON.stringify(error, null, 2))
  }
}

const periods = [
  { label: '7 dias', value: '7days' },
  { label: '15 dias', value: '15days' },
  { label: '30 dias', value: '30days' },
  { label: '60 dias', value: '60days' },
  { label: '90 dias', value: '90days' },
  { label: 'Todo período', value: 'all' }
]

// Configurações dos gráficos
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      callbacks: {
        label: (context: any) => {
          const minutes = context.parsed.y
          const hours = Math.floor(minutes / 60)
          const mins = minutes % 60
          return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#9CA3AF',
        callback: (value: any) => {
          const hours = Math.floor(value / 60)
          return hours > 0 ? `${hours}h` : `${value}m`
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9CA3AF'
      }
    }
  }
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#9CA3AF',
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const hours = Math.floor(value / 60)
          const mins = value % 60
          const time = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
          return `${label}: ${time} (${context.formattedValue}%)`
        }
      }
    }
  }
}

const accuracyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      callbacks: {
        label: (context: any) => `Taxa de Acerto: ${context.parsed.y}%`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#9CA3AF',
        callback: (value: any) => `${value}%`
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9CA3AF'
      }
    }
  }
}

// Dados para gráfico de evolução diária
const dailyChartData = computed(() => {
  if (!reportData.value?.dailyData) return null

  const labels = reportData.value.dailyData.map((d: any) => {
    const date = new Date(d.date)
    return `${date.getDate()}/${date.getMonth() + 1}`
  })

  const data = reportData.value.dailyData.map((d: any) => d.minutes)

  return {
    labels,
    datasets: [
      {
        label: 'Tempo de Estudo',
        data,
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(124, 58, 237)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }
})

// Dados para gráfico de pizza (matérias)
const subjectChartData = computed(() => {
  if (!reportData.value?.bySubject || reportData.value.bySubject.length === 0) return null

  const labels = reportData.value.bySubject.map((s: any) => s.subject)
  const data = reportData.value.bySubject.map((s: any) => s.minutes)
  const backgroundColor = reportData.value.bySubject.map((s: any) => s.color)

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#1f2937',
        hoverOffset: 10
      }
    ]
  }
})

// Dados para gráfico de taxa de acerto ao longo do tempo
const accuracyChartData = computed(() => {
  if (!reportData.value?.exercisesBySubject || reportData.value.exercisesBySubject.length === 0) return null

  // Sort exercises by date
  const sortedExercises = [...reportData.value.exercisesBySubject].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const labels = sortedExercises.map((e: any) => {
    const date = new Date(e.createdAt)
    return `${date.getDate()}/${date.getMonth() + 1}`
  })

  const data = sortedExercises.map((e: any) => Math.round(e.score))

  return {
    labels,
    datasets: [
      {
        label: 'Taxa de Acerto',
        data,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }
})

// Computed for displayed exercises with pagination
const displayedExercises = computed(() => {
  if (!reportData.value?.exercisesBySubject) return []
  return reportData.value.exercisesBySubject.slice(0, exercisesPerPage.value)
})

const changePeriod = async (period: string) => {
  selectedPeriod.value = period
  await refreshData()
}

const handleSubjectChange = async () => {
  await refreshData()
}

const refreshData = async () => {
  const subjectId = selectedSubjectId.value || undefined
  const data = await loadReportData(selectedPeriod.value, subjectId)
  reportData.value = data

  // Extrair matérias únicas dos dados do relatório (apenas quando não há filtro)
  if (!subjectId && data?.bySubject && data.bySubject.length > 0 && subjects.value.length === 0) {
    // Buscar IDs reais das matérias do banco
    const subjectNames = data.bySubject.map((s: any) => s.subject)
    const { data: realSubjects } = await supabase
      .from('subjects')
      .select('id, name, color')
      .in('name', subjectNames)

    if (realSubjects) {
      subjects.value = realSubjects
      console.log('[Reports] ✅ Matérias carregadas dos dados:', subjects.value)
    }
  }
}

const handleExport = () => {
  if (!reportData.value) return

  try {
    exportToCSV(reportData.value)
    success('Relatório exportado com sucesso!')
  } catch (err) {
    showError('Erro ao exportar relatório')
  }
}

// Carregar dados ao montar
const user = useSupabaseUser()
let dataLoaded = false

// Aguardar usuário estar disponível antes de carregar dados
watchEffect(async () => {
  if (user.value?.id && !dataLoaded) {
    console.log('✅ [Reports] Usuário disponível, carregando dados...')
    dataLoaded = true

    // Carregar matérias primeiro
    await fetchSubjects()

    // Depois carregar relatório
    await refreshData()
  }
})
</script>

<style scoped>
/* Animações suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-claude-bg,
.bg-gradient-to-br {
  animation: fadeIn 0.3s ease-out;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(124, 58, 237, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}
</style>
