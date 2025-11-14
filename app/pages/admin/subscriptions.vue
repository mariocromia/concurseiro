<template>
  <div class="min-h-screen bg-dark-900">
    <AdminMenu />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Assinaturas</h1>
        <p class="text-gray-400">Gerencie assinaturas e pagamentos dos usuários</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <p class="text-sm text-gray-400 mb-1">Assinaturas Ativas</p>
          <p class="text-3xl font-bold text-white">{{ stats.active }}</p>
        </div>
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <p class="text-sm text-gray-400 mb-1">Canceladas</p>
          <p class="text-3xl font-bold text-white">{{ stats.canceled }}</p>
        </div>
        <div class="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <p class="text-sm text-gray-400 mb-1">MRR Total</p>
          <p class="text-3xl font-bold text-white">R$ {{ stats.mrr }}</p>
        </div>
      </div>

      <!-- Subscriptions Table -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-dark-700">
            <thead class="bg-dark-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plano</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Início</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-700">
              <tr v-for="sub in subscriptions" :key="sub.id" class="hover:bg-dark-700/50">
                <td class="px-6 py-4 text-sm text-gray-300">{{ sub.user_email }}</td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-primary-500/20 text-primary-400">
                    {{ sub.plan_type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusBadge(sub.status)"
                  >
                    {{ sub.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-400">{{ formatDate(sub.created_at) }}</td>
                <td class="px-6 py-4 text-sm text-white">R$ {{ sub.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="loading" class="px-6 py-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()

const subscriptions = ref<any[]>([])
const loading = ref(false)
const stats = ref({
  active: 0,
  canceled: 0,
  mrr: '0'
})

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    canceled: 'bg-red-500/20 text-red-400',
    expired: 'bg-gray-500/20 text-gray-400'
  }
  return badges[status] || badges.active
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users(email),
        subscription_plans(name, price)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    subscriptions.value = (data || []).map((sub: any) => ({
      ...sub,
      user_email: sub.users?.email || 'N/A',
      price: sub.subscription_plans?.price || '0'
    }))

    // Calculate stats
    stats.value.active = subscriptions.value.filter(s => s.status === 'active').length
    stats.value.canceled = subscriptions.value.filter(s => s.status === 'canceled').length

    const mrr = subscriptions.value
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
    stats.value.mrr = mrr.toFixed(2)

  } catch (err) {
    console.error('[admin/subscriptions] Erro:', err)
  } finally {
    loading.value = false
  }
})
</script>
