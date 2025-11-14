<template>
  <div class="min-h-screen bg-dark-900">
    <!-- Admin Menu -->
    <AdminMenu />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
        <p class="text-gray-400">Visão geral e gerenciamento do sistema PraPassar</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Total de Usuários</p>
              <p class="text-3xl font-bold text-white">{{ stats.totalUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Subscriptions -->
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Assinaturas Ativas</p>
              <p class="text-3xl font-bold text-white">{{ stats.activeSubscriptions }}</p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Revenue (MRR) -->
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">MRR (Receita Mensal)</p>
              <p class="text-3xl font-bold text-white">R$ {{ stats.mrr }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- AI Requests -->
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Requisições IA (Hoje)</p>
              <p class="text-3xl font-bold text-white">{{ stats.aiRequests }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NuxtLink
          to="/admin/users"
          class="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:bg-dark-700 transition-colors group"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Gerenciar Usuários</h3>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">Visualizar, editar e remover usuários do sistema</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/subscriptions"
          class="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:bg-dark-700 transition-colors group"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Assinaturas</h3>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">Gerenciar planos, pagamentos e renovações</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/analytics"
          class="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:bg-dark-700 transition-colors group"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Analytics</h3>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">Métricas detalhadas e relatórios de uso</p>
        </NuxtLink>
      </div>

      <!-- Recent Activity -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-dark-700">
          <h3 class="text-lg font-semibold text-white">Atividade Recente</h3>
        </div>
        <div class="divide-y divide-dark-700">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="px-6 py-4 hover:bg-dark-700/50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  :class="activity.iconBg"
                >
                  <component :is="activity.icon" class="w-5 h-5" :class="activity.iconColor" />
                </div>
                <div>
                  <p class="text-sm text-white">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
                </div>
              </div>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="activity.badgeClass"
              >
                {{ activity.badge }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

definePageMeta({ middleware: 'admin' })

const stats = ref({
  totalUsers: 0,
  activeSubscriptions: 0,
  mrr: '0',
  aiRequests: 0
})

const recentActivity = ref([
  {
    id: 1,
    description: 'Nova assinatura Pro criada',
    time: 'Há 5 minutos',
    badge: 'Pagamento',
    badgeClass: 'bg-green-500/20 text-green-400',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 20 20' }, [
      h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', 'clip-rule': 'evenodd' })
    ]),
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400'
  },
  {
    id: 2,
    description: 'Novo usuário registrado',
    time: 'Há 15 minutos',
    badge: 'Cadastro',
    badgeClass: 'bg-blue-500/20 text-blue-400',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 20 20' }, [
      h('path', { d: 'M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z' })
    ]),
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400'
  },
  {
    id: 3,
    description: '150 requisições IA processadas',
    time: 'Há 1 hora',
    badge: 'IA',
    badgeClass: 'bg-purple-500/20 text-purple-400',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
    ]),
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400'
  }
])

// Carregar estatísticas
onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  try {
    const supabase = useSupabaseClient()

    // Total de usuários
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    stats.value.totalUsers = usersCount || 0

    // Assinaturas ativas
    const { count: subsCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    stats.value.activeSubscriptions = subsCount || 0

    // Calcular MRR (simplificado)
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('subscription_plans(price)')
      .eq('status', 'active')

    let mrr = 0
    if (activeSubs) {
      activeSubs.forEach((sub: any) => {
        if (sub.subscription_plans?.price) {
          mrr += parseFloat(sub.subscription_plans.price)
        }
      })
    }
    stats.value.mrr = mrr.toFixed(2)

    // Requisições IA (mock - implementar com tabela de logs se necessário)
    stats.value.aiRequests = Math.floor(Math.random() * 500) + 100

  } catch (err) {
    console.error('[admin/dashboard] Erro ao carregar estatísticas:', err)
  }
}
</script>
