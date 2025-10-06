<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Admin - Sistema de Afiliados</h1>
          <button @click="$router.push('/dashboard')" class="text-purple-600 hover:text-purple-800">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-600">Carregando...</div>
    </div>

    <div v-else-if="!isAdmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Acesso negado. Apenas administradores podem acessar esta página.
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-6 py-3 text-sm font-medium border-b-2 transition',
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
              <span v-if="tab.badge" class="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {{ tab.badge }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Lista de Afiliados -->
      <div v-if="activeTab === 'affiliates'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Todos os Afiliados</h2>
        <div v-if="affiliates.length === 0" class="text-center text-gray-500 py-8">
          Nenhum afiliado cadastrado ainda
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cupom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clientes</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversão</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Ganho</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponível</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="affiliate in affiliates" :key="affiliate.id">
                <td class="px-6 py-4 text-sm text-gray-900">{{ affiliate.users?.email || 'N/A' }}</td>
                <td class="px-6 py-4 text-sm font-mono text-purple-600">{{ affiliate.coupon_code }}</td>
                <td class="px-6 py-4">
                  <span :class="getAffiliateStatusClass(affiliate.status)">
                    {{ affiliate.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div>Total: {{ affiliate.stats.total_referrals }}</div>
                  <div class="text-xs text-gray-500">
                    Ativos: {{ affiliate.stats.active_referrals }} | Trial: {{ affiliate.stats.trial_referrals }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ affiliate.stats.conversion_rate }}%
                  <div class="text-xs text-gray-500">{{ affiliate.stats.total_clicks }} cliques</div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-green-600">
                  R$ {{ formatCurrency(affiliate.total_earnings) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  R$ {{ formatCurrency(affiliate.available_balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Solicitações de Saque -->
      <div v-if="activeTab === 'withdrawals'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Solicitações de Saque</h2>
        <div v-if="withdrawals.length === 0" class="text-center text-gray-500 py-8">
          Nenhuma solicitação de saque
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Afiliado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chave PIX</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="withdrawal in withdrawals" :key="withdrawal.id">
                <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(withdrawal.created_at) }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div>{{ withdrawal.affiliates?.coupon_code }}</div>
                  <div class="text-xs text-gray-500">{{ withdrawal.affiliates?.users?.email }}</div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                  R$ {{ formatCurrency(withdrawal.amount) }}
                </td>
                <td class="px-6 py-4 text-sm font-mono text-gray-700">{{ withdrawal.cpf }}</td>
                <td class="px-6 py-4 text-sm font-mono text-gray-700">{{ withdrawal.pix_key || withdrawal.cpf }}</td>
                <td class="px-6 py-4">
                  <span :class="getWithdrawalStatusClass(withdrawal.status)">
                    {{ getWithdrawalStatusText(withdrawal.status) }}
                  </span>
                  <div v-if="withdrawal.rejection_reason" class="text-xs text-red-600 mt-1">
                    {{ withdrawal.rejection_reason }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex gap-2">
                    <button
                      v-if="withdrawal.status === 'pending'"
                      @click="approveWithdrawal(withdrawal.id)"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Aprovar
                    </button>
                    <button
                      v-if="withdrawal.status === 'pending'"
                      @click="openRejectModal(withdrawal.id)"
                      class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Rejeitar
                    </button>
                    <button
                      v-if="withdrawal.status === 'approved'"
                      @click="markAsPaid(withdrawal.id)"
                      class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Marcar Pago
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estatísticas Gerais -->
      <div v-if="activeTab === 'stats'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500">Total de Afiliados</h3>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ affiliates.length }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Pago em Comissões</h3>
            <p class="text-3xl font-bold text-green-600 mt-2">
              R$ {{ formatCurrency(totalPaidCommissions) }}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-500">Saques Pendentes</h3>
            <p class="text-3xl font-bold text-orange-600 mt-2">{{ pendingWithdrawalsCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Rejeição -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Rejeitar Saque</h2>
        <form @submit.prevent="rejectWithdrawal">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Motivo da Rejeição</label>
            <textarea
              v-model="rejectForm.reason"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            ></textarea>
          </div>

          <div v-if="rejectError" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ rejectError }}
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showRejectModal = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="rejectLoading"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {{ rejectLoading ? 'Rejeitando...' : 'Rejeitar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(true)
const isAdmin = ref(false)
const activeTab = ref('withdrawals')
const affiliates = ref([])
const withdrawals = ref([])
const showRejectModal = ref(false)
const rejectLoading = ref(false)
const rejectError = ref('')
const rejectForm = ref({
  withdrawal_id: null,
  reason: ''
})

const tabs = computed(() => [
  { id: 'affiliates', name: 'Afiliados' },
  { id: 'withdrawals', name: 'Saques', badge: pendingWithdrawalsCount.value },
  { id: 'stats', name: 'Estatísticas' }
])

const pendingWithdrawalsCount = computed(() => {
  return withdrawals.value.filter(w => w.status === 'pending').length
})

const totalPaidCommissions = computed(() => {
  return affiliates.value.reduce((sum, a) => sum + parseFloat(a.total_earnings || 0), 0)
})

const loadData = async () => {
  try {
    // Verificar se é admin
    if (user.value?.email !== 'mariocromia@gmail.com') {
      isAdmin.value = false
      loading.value = false
      return
    }

    isAdmin.value = true

    // Carregar afiliados
    const { data: affiliatesData } = await $fetch('/api/admin/affiliates/list')
    affiliates.value = affiliatesData.affiliates || []

    // Carregar saques
    const { data: withdrawalsData } = await $fetch('/api/admin/affiliates/withdrawals')
    withdrawals.value = withdrawalsData.withdrawals || []

  } catch (err) {
    console.error('Erro ao carregar dados:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2).replace('.', ',')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAffiliateStatusClass = (status) => {
  const classes = {
    active: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    suspended: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    canceled: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'
  }
  return classes[status] || ''
}

const getWithdrawalStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    approved: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
    rejected: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
    paid: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
  }
  return classes[status] || ''
}

const getWithdrawalStatusText = (status) => {
  const texts = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    paid: 'Pago'
  }
  return texts[status] || status
}

const approveWithdrawal = async (withdrawalId) => {
  if (!confirm('Deseja aprovar este saque?')) return

  try {
    await $fetch('/api/admin/affiliates/withdraw-approve', {
      method: 'POST',
      body: {
        withdrawal_id: withdrawalId,
        action: 'approve'
      }
    })

    await loadData()
  } catch (err) {
    alert('Erro ao aprovar saque: ' + (err.data?.message || err.message))
  }
}

const openRejectModal = (withdrawalId) => {
  rejectForm.value.withdrawal_id = withdrawalId
  rejectForm.value.reason = ''
  showRejectModal.value = true
}

const rejectWithdrawal = async () => {
  rejectLoading.value = true
  rejectError.value = ''

  try {
    await $fetch('/api/admin/affiliates/withdraw-approve', {
      method: 'POST',
      body: {
        withdrawal_id: rejectForm.value.withdrawal_id,
        action: 'reject',
        rejection_reason: rejectForm.value.reason
      }
    })

    showRejectModal.value = false
    await loadData()
  } catch (err) {
    rejectError.value = err.data?.message || 'Erro ao rejeitar saque'
  } finally {
    rejectLoading.value = false
  }
}

const markAsPaid = async (withdrawalId) => {
  if (!confirm('Confirma que o PIX foi enviado e deseja marcar como pago?')) return

  try {
    await $fetch('/api/admin/affiliates/withdraw-approve', {
      method: 'POST',
      body: {
        withdrawal_id: withdrawalId,
        action: 'mark_paid'
      }
    })

    await loadData()
  } catch (err) {
    alert('Erro ao marcar como pago: ' + (err.data?.message || err.message))
  }
}

onMounted(() => {
  loadData()
})
</script>
