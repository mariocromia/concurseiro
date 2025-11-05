<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-900">
    <!-- Header -->
    <div class="bg-white dark:bg-dark-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-[#2C2C2C] dark:text-white">Painel do Afiliado</h1>
          <NuxtLink
            to="/dashboard"
            class="text-[#b85635] dark:text-primary-400 hover:text-[#A65738] dark:hover:text-primary-300 text-sm font-medium"
          >
            Voltar ao Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonLoader v-for="i in 4" :key="i" type="card" />
      </div>
    </div>

    <!-- Not Affiliate -->
    <div v-else-if="!isAffiliate" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-[#b85635] dark:text-primary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-[#2C2C2C] dark:text-white mb-4">Programa de afiliados indisponível</h2>
        <p class="text-[#6B6B6B] dark:text-gray-400">
          No momento não estamos aceitando novos afiliados. Se você já faz parte do programa e precisa de ajuda,
          entre em contato com nosso suporte pelo chat dentro da plataforma.
        </p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-[#999999] dark:text-gray-400 uppercase">Total Cadastros</p>
              <p class="text-2xl font-bold text-[#2C2C2C] dark:text-white mt-1">{{ stats?.totals?.total_referrals || 0 }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-[#999999] dark:text-gray-400 uppercase">Cadastros Ativos</p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ stats?.totals?.active_referrals || 0 }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-[#999999] dark:text-gray-400 uppercase">Cadastros Pagos</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ stats?.totals?.paid_referrals || 0 }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-[#999999] dark:text-gray-400 uppercase">Comissão Acum.</p>
              <p class="text-2xl font-bold text-[#b85635] dark:text-primary-400 mt-1">R$ {{ formatCurrency(stats?.totals?.total_commission || 0) }}</p>
            </div>
            <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-[#b85635] dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-claude-md shadow-lg p-6 text-white">
          <div>
            <p class="text-xs font-medium text-green-100 uppercase">Saldo Disponível</p>
            <p class="text-3xl font-bold mt-1">R$ {{ formatCurrency(stats?.totals?.available_balance || 0) }}</p>
            <button
              @click="showWithdrawModal = true"
              :disabled="(stats?.totals?.available_balance || 0) < 50"
              class="mt-4 w-full bg-white text-green-600 py-2 rounded-claude-md hover:bg-green-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {{ (stats?.totals?.available_balance || 0) < 50 ? 'Mínimo R$ 50' : 'Solicitar Saque' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Period Filter -->
          <div>
            <label class="block text-xs font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Período</label>
            <select
              v-model="filters.period"
              @change="loadStats"
              class="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
            >
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <!-- Start Date (for custom) -->
          <div v-if="filters.period === 'custom'">
            <label class="block text-xs font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Data Início</label>
            <input
              v-model="filters.start_date"
              type="date"
              @change="loadStats"
              class="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
            />
          </div>

          <!-- End Date (for custom) -->
          <div v-if="filters.period === 'custom'">
            <label class="block text-xs font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Data Fim</label>
            <input
              v-model="filters.end_date"
              type="date"
              @change="loadStats"
              class="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-xs font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Status</label>
            <select
              v-model="filters.status"
              @change="loadStats"
              class="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
            >
              <option value="all">Todos</option>
              <option value="trial">Em Trial</option>
              <option value="active">Ativo</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-xs font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Buscar</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Email ou nome..."
              class="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
            />
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Conversions Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
          <h3 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4">Conversões (Últimos 30 Dias)</h3>
          <Line v-if="lineChartData" :data="lineChartData" :options="lineChartOptions" class="max-h-64" />
        </div>

        <!-- Status Distribution Chart -->
        <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
          <h3 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4">Distribuição por Status</h3>
          <Doughnut v-if="doughnutChartData" :data="doughnutChartData" :options="doughnutChartOptions" class="max-h-64" />
        </div>
      </div>

      <!-- Affiliate Links -->
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700 p-6">
        <h2 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4">Seus Links de Afiliado</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Cupom de Desconto</label>
            <div class="flex">
              <input
                :value="stats?.affiliate?.coupon_code"
                readonly
                class="flex-1 px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-l-claude-md bg-gray-50 dark:bg-dark-900 text-[#2C2C2C] dark:text-white"
              />
              <button
                @click="copyCoupon"
                class="bg-[#b85635] dark:bg-primary-500 text-white px-6 py-2 rounded-r-claude-md hover:bg-[#A65738] dark:hover:bg-primary-600 transition-colors"
              >
                {{ copiedCoupon ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Link de Rastreamento</label>
            <div class="flex">
              <input
                :value="stats?.affiliate?.tracking_link"
                readonly
                class="flex-1 px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-l-claude-md bg-gray-50 dark:bg-dark-900 text-[#2C2C2C] dark:text-white text-sm"
              />
              <button
                @click="copyLink"
                class="bg-[#b85635] dark:bg-primary-500 text-white px-6 py-2 rounded-r-claude-md hover:bg-[#A65738] dark:hover:bg-primary-600 transition-colors"
              >
                {{ copiedLink ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-sm border border-[#E5E5E5] dark:border-dark-700">
        <div class="border-b border-[#E5E5E5] dark:border-dark-700">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-[#b85635] dark:border-primary-400 text-[#b85635] dark:text-primary-400'
                  : 'border-transparent text-[#6B6B6B] dark:text-gray-400 hover:text-[#2C2C2C] dark:hover:text-white hover:border-[#E5E5E5] dark:hover:border-dark-700'
              ]"
            >
              {{ tab.name }}
              <span v-if="tab.count !== undefined" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-dark-700">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Conversions Tab -->
          <div v-if="activeTab === 'conversions'">
            <h3 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4">Conversões Detalhadas</h3>
            <div v-if="filteredReferrals.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-[#999999] dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-[#6B6B6B] dark:text-gray-400">Nenhuma conversão encontrada</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[#E5E5E5] dark:divide-dark-700">
                <thead class="bg-gray-50 dark:bg-dark-900/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Data Cadastro</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Plano</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Comissão</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Data Pgto</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-dark-800 divide-y divide-[#E5E5E5] dark:divide-dark-700">
                  <tr v-for="referral in filteredReferrals" :key="referral.id" class="hover:bg-gray-50 dark:hover:bg-dark-900/30">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-[#2C2C2C] dark:text-white">{{ referral.users?.full_name || 'N/A' }}</div>
                      <div class="text-xs text-[#999999] dark:text-gray-400">{{ referral.users?.email || 'N/A' }}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-[#6B6B6B] dark:text-gray-300">
                      {{ formatDate(referral.created_at) }}
                    </td>
                    <td class="px-6 py-4">
                      <span :class="getStatusClass(referral.status)">
                        {{ getStatusText(referral.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-[#6B6B6B] dark:text-gray-300">
                      {{ referral.subscriptions?.subscription_plans?.name || '-' }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                      R$ {{ formatCurrency(referral.total_paid * 0.2) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-[#999999] dark:text-gray-400">
                      {{ referral.last_payment_at ? formatDate(referral.last_payment_at) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Commissions Tab -->
          <div v-if="activeTab === 'commissions'">
            <h3 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4">Histórico de Comissões</h3>
            <div v-if="!stats?.commissions || stats.commissions.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-[#999999] dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-[#6B6B6B] dark:text-gray-400">Nenhuma comissão ainda</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[#E5E5E5] dark:divide-dark-700">
                <thead class="bg-gray-50 dark:bg-dark-900/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Data</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Valor Pago</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Comissão</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-dark-800 divide-y divide-[#E5E5E5] dark:divide-dark-700">
                  <tr v-for="commission in stats.commissions" :key="commission.id" class="hover:bg-gray-50 dark:hover:bg-dark-900/30">
                    <td class="px-6 py-4 text-sm text-[#6B6B6B] dark:text-gray-300">
                      {{ formatDate(commission.created_at) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-[#2C2C2C] dark:text-white font-medium">
                      R$ {{ formatCurrency(commission.payment_amount) }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                      R$ {{ formatCurrency(commission.amount) }}
                    </td>
                    <td class="px-6 py-4">
                      <span :class="getCommissionStatusClass(commission.status)">
                        {{ getCommissionStatusText(commission.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Withdrawals Tab -->
          <div v-if="activeTab === 'withdrawals'">
            <h3 class="text-lg font-semibold text-[#2C2C2C] dark:text-white mb-4">Histórico de Saques</h3>
            <div v-if="!stats?.withdrawals || stats.withdrawals.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-[#999999] dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-[#6B6B6B] dark:text-gray-400">Nenhum saque solicitado ainda</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[#E5E5E5] dark:divide-dark-700">
                <thead class="bg-gray-50 dark:bg-dark-900/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Data Solicitação</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Valor</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Data Pgto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[#6B6B6B] dark:text-gray-400 uppercase tracking-wider">Observações</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-dark-800 divide-y divide-[#E5E5E5] dark:divide-dark-700">
                  <tr v-for="withdrawal in stats.withdrawals" :key="withdrawal.id" class="hover:bg-gray-50 dark:hover:bg-dark-900/30">
                    <td class="px-6 py-4 text-sm text-[#6B6B6B] dark:text-gray-300">
                      {{ formatDate(withdrawal.created_at) }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-[#2C2C2C] dark:text-white">
                      R$ {{ formatCurrency(withdrawal.amount) }}
                    </td>
                    <td class="px-6 py-4">
                      <span :class="getWithdrawalStatusClass(withdrawal.status)">
                        {{ getWithdrawalStatusText(withdrawal.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-[#999999] dark:text-gray-400">
                      {{ withdrawal.paid_at ? formatDate(withdrawal.paid_at) : '-' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-[#6B6B6B] dark:text-gray-300">
                      {{ withdrawal.admin_notes || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div v-if="showWithdrawModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showWithdrawModal = false">
      <div class="bg-white dark:bg-dark-800 rounded-claude-md shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4">Solicitar Saque</h2>
        <form @submit.prevent="requestWithdraw">
          <div class="mb-4">
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">
              Valor <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="withdrawForm.amount"
              type="number"
              step="0.01"
              min="50"
              :max="stats?.totals?.available_balance"
              class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
              required
            />
            <p class="text-sm text-[#999999] dark:text-gray-400 mt-1">
              Mínimo: R$ 50,00 | Disponível: R$ {{ formatCurrency(stats?.totals?.available_balance || 0) }}
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">
              CPF <span class="text-red-500">*</span>
            </label>
            <input
              v-model="withdrawForm.cpf"
              type="text"
              maxlength="14"
              @input="formatWithdrawCPF"
              class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-[#6B6B6B] dark:text-gray-300 mb-2">Chave PIX</label>
            <input
              v-model="withdrawForm.pix_key"
              type="text"
              placeholder="Email, telefone ou CPF"
              class="w-full px-4 py-2 border border-[#E5E5E5] dark:border-dark-700 rounded-claude-md bg-white dark:bg-dark-900 text-[#2C2C2C] dark:text-white focus:ring-2 focus:ring-[#b85635] dark:focus:ring-primary-400"
            />
            <p class="text-sm text-[#999999] dark:text-gray-400 mt-1">Se não informar, usaremos o CPF como chave PIX</p>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showWithdrawModal = false"
              class="flex-1 bg-gray-200 dark:bg-dark-700 text-[#2C2C2C] dark:text-white py-2 rounded-claude-md hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="withdrawLoading"
              class="flex-1 bg-[#b85635] dark:bg-primary-500 text-white py-2 rounded-claude-md hover:bg-[#A65738] dark:hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ withdrawLoading ? 'Enviando...' : 'Solicitar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()

// State
const loading = ref(true)
const isAffiliate = ref(false)
const stats = ref<any>(null)
const activeTab = ref('conversions')
const showWithdrawModal = ref(false)
const copiedCoupon = ref(false)
const copiedLink = ref(false)
const withdrawLoading = ref(false)
const searchQuery = ref('')

const filters = ref({
  period: 'month',
  status: 'all',
  start_date: '',
  end_date: ''
})

const withdrawForm = ref({
  amount: 50,
  cpf: '',
  pix_key: ''
})

const tabs = computed(() => [
  { id: 'conversions', name: 'Conversões', count: stats.value?.referrals?.length || 0 },
  { id: 'commissions', name: 'Comissões', count: stats.value?.commissions?.length || 0 },
  { id: 'withdrawals', name: 'Saques', count: stats.value?.withdrawals?.length || 0 }
])

// Filtered referrals based on search query
const filteredReferrals = computed(() => {
  if (!stats.value?.referrals) return []
  if (!searchQuery.value) return stats.value.referrals

  const query = searchQuery.value.toLowerCase()
  return stats.value.referrals.filter((r: any) => {
    const email = r.users?.email?.toLowerCase() || ''
    const name = r.users?.full_name?.toLowerCase() || ''
    return email.includes(query) || name.includes(query)
  })
})

// Chart data
const lineChartData = computed(() => {
  if (!stats.value?.chart_data?.daily_conversions) return null

  return {
    labels: stats.value.chart_data.daily_conversions.map((d: any) =>
      new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    ),
    datasets: [
      {
        label: 'Conversões',
        data: stats.value.chart_data.daily_conversions.map((d: any) => d.conversions),
        borderColor: '#b85635',
        backgroundColor: 'rgba(184, 86, 53, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const lineChartOptions = {
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
        stepSize: 1
      }
    }
  }
}

const doughnutChartData = computed(() => {
  if (!stats.value?.chart_data?.status_distribution) return null

  const dist = stats.value.chart_data.status_distribution
  return {
    labels: ['Pendente', 'Ativo', 'Pago', 'Cancelado'],
    datasets: [
      {
        data: [dist.pending, dist.active, dist.paid, dist.canceled],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }
})

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

// Methods
const loadStats = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('period', filters.value.period)
    params.append('status', filters.value.status)
    if (filters.value.start_date) params.append('start_date', filters.value.start_date)
    if (filters.value.end_date) params.append('end_date', filters.value.end_date)

    const { data } = await $fetch(`/api/affiliates/stats?${params.toString()}`)
    stats.value = data
    isAffiliate.value = true
  } catch (err: any) {
    if (err.statusCode === 404) {
      isAffiliate.value = false
    } else {
      toast.error('Erro ao carregar estatísticas')
    }
  } finally {
    loading.value = false
  }
}

const copyCoupon = () => {
  navigator.clipboard.writeText(stats.value.affiliate.coupon_code)
  copiedCoupon.value = true
  toast.success('Cupom copiado!')
  setTimeout(() => copiedCoupon.value = false, 2000)
}

const copyLink = () => {
  navigator.clipboard.writeText(stats.value.affiliate.tracking_link)
  copiedLink.value = true
  toast.success('Link copiado!')
  setTimeout(() => copiedLink.value = false, 2000)
}

const formatCurrency = (value: number | string) => {
  return parseFloat(value?.toString() || '0').toFixed(2).replace('.', ',')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatWithdrawCPF = (e: any) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    withdrawForm.value.cpf = value
  }
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    trial: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    active: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    canceled: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    expired: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return classes[status] || classes.expired
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    trial: 'Em Trial',
    active: 'Ativo',
    canceled: 'Cancelado',
    expired: 'Expirado'
  }
  return texts[status] || status
}

const getCommissionStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    available: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    withdrawn: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return classes[status] || ''
}

const getCommissionStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'Pendente',
    available: 'Disponível',
    withdrawn: 'Sacado',
    paid: 'Pago'
  }
  return texts[status] || status
}

const getWithdrawalStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    rejected: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return classes[status] || ''
}

const getWithdrawalStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    paid: 'Pago'
  }
  return texts[status] || status
}

const requestWithdraw = async () => {
  withdrawLoading.value = true
  try {
    await $fetch('/api/affiliates/withdraw', {
      method: 'POST',
      body: {
        amount: withdrawForm.value.amount,
        cpf: withdrawForm.value.cpf.replace(/\D/g, ''),
        pix_key: withdrawForm.value.pix_key || withdrawForm.value.cpf.replace(/\D/g, '')
      }
    })

    toast.success('Saque solicitado com sucesso!')
    showWithdrawModal.value = false
    await loadStats()
    withdrawForm.value = { amount: 50, cpf: '', pix_key: '' }
  } catch (err: any) {
    toast.error(err.data?.message || 'Erro ao solicitar saque')
  } finally {
    withdrawLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
})
</script>
