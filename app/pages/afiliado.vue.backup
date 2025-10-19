<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Painel do Afiliado</h1>
          <button @click="$router.push('/dashboard')" class="text-purple-600 hover:text-purple-800">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-600">Carregando...</div>
    </div>

    <div v-else-if="!isAffiliate" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-claude-md shadow p-8 text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Você ainda não é um afiliado</h2>
        <p class="text-gray-600 mb-6">Cadastre-se como afiliado e comece a ganhar comissões!</p>
        <button @click="$router.push('/afiliado-cadastro')" class="bg-purple-600 text-claude-text dark:text-white px-6 py-3 rounded-claude-md hover:bg-purple-700">
          Tornar-se Afiliado
        </button>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Cards de métricas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-claude-md shadow p-6">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-500">Saldo Disponível</h3>
          <p class="text-3xl font-bold text-green-600 mt-2">R$ {{ formatCurrency(stats.affiliate.available_balance) }}</p>
          <button
            @click="showWithdrawModal = true"
            :disabled="stats.affiliate.available_balance < 50"
            class="mt-4 w-full bg-green-600 text-claude-text dark:text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            Solicitar Saque
          </button>
        </div>

        <div class="bg-white rounded-claude-md shadow p-6">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-500">Total Ganho</h3>
          <p class="text-3xl font-bold text-purple-600 mt-2">R$ {{ formatCurrency(stats.affiliate.total_earnings) }}</p>
          <p class="text-sm text-gray-600 mt-2">Já sacou: R$ {{ formatCurrency(stats.affiliate.withdrawn_balance) }}</p>
        </div>

        <div class="bg-white rounded-claude-md shadow p-6">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-500">Clientes Ativos</h3>
          <p class="text-3xl font-bold text-[#ca643f] dark:text-blue-600 mt-2">{{ stats.stats.active_referrals }}</p>
          <p class="text-sm text-gray-600 mt-2">Em trial: {{ stats.stats.trial_referrals }}</p>
        </div>

        <div class="bg-white rounded-claude-md shadow p-6">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-500">Taxa de Conversão</h3>
          <p class="text-3xl font-bold text-orange-600 mt-2">{{ stats.stats.conversion_rate }}%</p>
          <p class="text-sm text-gray-600 mt-2">{{ stats.stats.total_clicks }} cliques</p>
        </div>
      </div>

      <!-- Cupom e Link -->
      <div class="bg-white rounded-claude-md shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Seus Links de Afiliado</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Cupom de Desconto</label>
            <div class="flex mt-2">
              <input
                :value="stats.affiliate.coupon_code"
                readonly
                class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
              />
              <button @click="copyCoupon" class="bg-purple-600 text-claude-text dark:text-white px-6 py-2 rounded-r-lg hover:bg-purple-700">
                {{ copiedCoupon ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Link de Rastreamento</label>
            <div class="flex mt-2">
              <input
                :value="stats.affiliate.tracking_link"
                readonly
                class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
              />
              <button @click="copyLink" class="bg-purple-600 text-claude-text dark:text-white px-6 py-2 rounded-r-lg hover:bg-purple-700">
                {{ copiedLink ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-claude-md shadow">
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
                  : 'border-transparent text-gray-600 dark:text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Clientes -->
          <div v-if="activeTab === 'clients'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Seus Clientes</h3>
            <div v-if="stats.referrals.length === 0" class="text-center text-gray-600 dark:text-gray-500 py-8">
              Nenhum cliente ainda
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Data</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Total Pago</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Último Pagamento</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="referral in stats.referrals" :key="referral.id">
                    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(referral.created_at) }}</td>
                    <td class="px-6 py-4">
                      <span :class="getStatusClass(referral.status)">
                        {{ getStatusText(referral.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">R$ {{ formatCurrency(referral.total_paid) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-500">
                      {{ referral.last_payment_at ? formatDate(referral.last_payment_at) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Comissões -->
          <div v-if="activeTab === 'commissions'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Histórico de Comissões</h3>
            <div v-if="stats.commissions.length === 0" class="text-center text-gray-600 dark:text-gray-500 py-8">
              Nenhuma comissão ainda
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Data</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Valor Pago</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Comissão</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="commission in stats.commissions" :key="commission.id">
                    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(commission.created_at) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">R$ {{ formatCurrency(commission.payment_amount) }}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-green-600">R$ {{ formatCurrency(commission.amount) }}</td>
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

          <!-- Saques -->
          <div v-if="activeTab === 'withdrawals'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Histórico de Saques</h3>
            <div v-if="stats.withdrawals.length === 0" class="text-center text-gray-600 dark:text-gray-500 py-8">
              Nenhum saque solicitado ainda
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Data</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Valor</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-500 uppercase">Processado</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="withdrawal in stats.withdrawals" :key="withdrawal.id">
                    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(withdrawal.created_at) }}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">R$ {{ formatCurrency(withdrawal.amount) }}</td>
                    <td class="px-6 py-4">
                      <span :class="getWithdrawalStatusClass(withdrawal.status)">
                        {{ getWithdrawalStatusText(withdrawal.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-500">
                      {{ withdrawal.paid_at ? formatDate(withdrawal.paid_at) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Saque -->
    <div v-if="showWithdrawModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-claude-md shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Solicitar Saque</h2>
        <form @submit.prevent="requestWithdraw">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              v-model.number="withdrawForm.amount"
              type="number"
              step="0.01"
              min="50"
              :max="stats.affiliate.available_balance"
              class="w-full px-4 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-purple-500"
              required
            />
            <p class="text-sm text-gray-600 dark:text-gray-500 mt-1">Mínimo: R$ 50,00 | Disponível: R$ {{ formatCurrency(stats.affiliate.available_balance) }}</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">CPF</label>
            <input
              v-model="withdrawForm.cpf"
              type="text"
              maxlength="14"
              @input="formatWithdrawCPF"
              class="w-full px-4 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Chave PIX (opcional)</label>
            <input
              v-model="withdrawForm.pix_key"
              type="text"
              placeholder="Email, telefone ou CPF"
              class="w-full px-4 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-purple-500"
            />
            <p class="text-sm text-gray-600 dark:text-gray-500 mt-1">Se não informar, usaremos o CPF como chave PIX</p>
          </div>

          <div v-if="withdrawError" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ withdrawError }}
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showWithdrawModal = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-claude-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="withdrawLoading"
              class="flex-1 bg-purple-600 text-claude-text dark:text-white py-2 rounded-claude-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              {{ withdrawLoading ? 'Enviando...' : 'Solicitar' }}
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

const loading = ref(true)
const isAffiliate = ref(false)
const stats = ref(null)
const activeTab = ref('clients')
const showWithdrawModal = ref(false)
const copiedCoupon = ref(false)
const copiedLink = ref(false)
const withdrawLoading = ref(false)
const withdrawError = ref('')

const withdrawForm = ref({
  amount: 50,
  cpf: '',
  pix_key: ''
})

const tabs = [
  { id: 'clients', name: 'Clientes' },
  { id: 'commissions', name: 'Comissões' },
  { id: 'withdrawals', name: 'Saques' }
]

const loadStats = async () => {
  try {
    const { data } = await $fetch('/api/affiliates/stats')
    stats.value = data
    isAffiliate.value = true
  } catch (err) {
    isAffiliate.value = false
  } finally {
    loading.value = false
  }
}

const copyCoupon = () => {
  navigator.clipboard.writeText(stats.value.affiliate.coupon_code)
  copiedCoupon.value = true
  setTimeout(() => copiedCoupon.value = false, 2000)
}

const copyLink = () => {
  navigator.clipboard.writeText(stats.value.affiliate.tracking_link)
  copiedLink.value = true
  setTimeout(() => copiedLink.value = false, 2000)
}

const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2).replace('.', ',')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatWithdrawCPF = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    withdrawForm.value.cpf = value
  }
}

const getStatusClass = (status) => {
  const classes = {
    trial: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    active: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    canceled: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
    expired: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.expired
}

const getStatusText = (status) => {
  const texts = {
    trial: 'Em Trial',
    active: 'Ativo',
    canceled: 'Cancelado',
    expired: 'Expirado'
  }
  return texts[status] || status
}

const getCommissionStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    available: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    withdrawn: 'px-2 py-1 text-xs rounded-full bg-[#f0e8e1] dark:bg-blue-100 text-[#ca643f] dark:text-blue-800'
  }
  return classes[status] || ''
}

const getCommissionStatusText = (status) => {
  const texts = {
    pending: 'Pendente',
    available: 'Disponível',
    withdrawn: 'Sacado'
  }
  return texts[status] || status
}

const getWithdrawalStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    approved: 'px-2 py-1 text-xs rounded-full bg-[#f0e8e1] dark:bg-blue-100 text-[#ca643f] dark:text-blue-800',
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

const requestWithdraw = async () => {
  withdrawLoading.value = true
  withdrawError.value = ''

  try {
    const { data } = await $fetch('/api/affiliates/withdraw', {
      method: 'POST',
      body: {
        amount: withdrawForm.value.amount,
        cpf: withdrawForm.value.cpf.replace(/\D/g, ''),
        pix_key: withdrawForm.value.pix_key
      }
    })

    if (data.success) {
      showWithdrawModal.value = false
      await loadStats()
      withdrawForm.value = { amount: 50, cpf: '', pix_key: '' }
    }
  } catch (err) {
    withdrawError.value = err.data?.message || 'Erro ao solicitar saque'
  } finally {
    withdrawLoading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
