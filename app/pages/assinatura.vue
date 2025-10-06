<template>
  <div class="min-h-screen bg-dark-900 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Minha Assinatura</h1>
        <p class="text-gray-400">Gerencie seu plano e pagamentos</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="grid md:grid-cols-3 gap-8">
        <!-- Plano Atual -->
        <div class="md:col-span-2 space-y-6">
          <!-- Card do Plano -->
          <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-2xl font-bold text-white mb-2">
                  {{ currentSubscription?.plan?.display_name || 'Nenhum Plano Ativo' }}
                </h2>
                <div v-if="currentSubscription" class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(subscriptionStatus)
                    ]"
                  >
                    {{ getStatusText(subscriptionStatus) }}
                  </span>
                  <span v-if="isInTrial" class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                    {{ trialDaysRemaining }} dias de trial restantes
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold text-primary-500">
                  R$ {{ currentSubscription?.plan?.price.toFixed(2) || '0,00' }}
                </p>
                <p class="text-sm text-gray-400">por mês</p>
              </div>
            </div>

            <!-- Informações da Assinatura -->
            <div v-if="currentSubscription" class="space-y-4">
              <div class="flex justify-between items-center py-3 border-t border-dark-700">
                <span class="text-gray-400">Próxima cobrança</span>
                <span class="text-white font-semibold">
                  {{ nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('pt-BR') : '-' }}
                </span>
              </div>
              <div class="flex justify-between items-center py-3 border-t border-dark-700">
                <span class="text-gray-400">Recursos de IA</span>
                <span :class="hasAiAccess ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                  {{ hasAiAccess ? 'Habilitado' : 'Desabilitado' }}
                </span>
              </div>
            </div>

            <!-- Ações -->
            <div v-if="currentSubscription" class="flex gap-4 mt-6 pt-6 border-t border-dark-700">
              <button
                @click="showChangePlanModal = true"
                class="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition"
              >
                Alterar Plano
              </button>
              <button
                @click="showCancelModal = true"
                class="flex-1 py-3 bg-dark-700 text-red-400 rounded-lg font-semibold hover:bg-dark-600 transition border border-red-500/30"
              >
                Cancelar Assinatura
              </button>
            </div>

            <!-- Sem Assinatura -->
            <div v-else class="text-center py-8">
              <p class="text-gray-400 mb-6">Você ainda não possui uma assinatura ativa</p>
              <NuxtLink
                to="/precos"
                class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition"
              >
                Ver Planos Disponíveis
              </NuxtLink>
            </div>
          </div>

          <!-- Recursos do Plano -->
          <div v-if="currentSubscription?.plan?.features" class="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Recursos Incluídos</h3>
            <div class="grid md:grid-cols-2 gap-3">
              <div
                v-for="feature in currentSubscription.plan.features"
                :key="feature"
                class="flex items-start gap-2"
              >
                <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-300 text-sm">{{ feature }}</span>
              </div>
            </div>
          </div>

          <!-- Histórico de Pagamentos -->
          <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Histórico de Pagamentos</h3>

            <div v-if="payments.length > 0" class="space-y-3">
              <div
                v-for="payment in payments"
                :key="payment.id"
                class="flex justify-between items-center p-4 bg-dark-700 rounded-lg"
              >
                <div class="flex items-center gap-4">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      payment.status === 'received' ? 'bg-green-500/20' : 'bg-gray-500/20'
                    ]"
                  >
                    <svg v-if="payment.status === 'received'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-white font-semibold">R$ {{ payment.amount.toFixed(2) }}</p>
                    <p class="text-sm text-gray-400">
                      {{ new Date(payment.due_date).toLocaleDateString('pt-BR') }}
                    </p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    payment.status === 'received' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  ]"
                >
                  {{ getPaymentStatusText(payment.status) }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-400">
              Nenhum pagamento registrado
            </div>
          </div>
        </div>

        <!-- Sidebar com Informações -->
        <div class="md:col-span-1 space-y-6">
          <!-- Suporte -->
          <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Precisa de Ajuda?</h3>
            <p class="text-gray-400 text-sm mb-4">
              Entre em contato com nosso suporte para qualquer dúvida sobre sua assinatura.
            </p>
            <a
              href="mailto:contato@concurseiro.com"
              class="block w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition text-center"
            >
              Falar com Suporte
            </a>
          </div>

          <!-- Segurança -->
          <div class="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Pagamentos Seguros</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm text-gray-400">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Criptografia SSL
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-400">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Certificado PCI DSS
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-400">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Dados protegidos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Cancelar Assinatura -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold text-white mb-4">Cancelar Assinatura</h3>
        <p class="text-gray-400 mb-6">
          Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período pago.
        </p>
        <div class="flex gap-4">
          <button
            @click="handleCancelSubscription"
            :disabled="cancelLoading"
            class="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition disabled:opacity-50"
          >
            {{ cancelLoading ? 'Cancelando...' : 'Sim, Cancelar' }}
          </button>
          <button
            @click="showCancelModal = false"
            class="flex-1 py-3 bg-dark-700 text-white rounded-lg font-semibold hover:bg-dark-600 transition"
          >
            Não, Manter
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Alterar Plano -->
    <div v-if="showChangePlanModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-8 max-w-2xl w-full">
        <h3 class="text-2xl font-bold text-white mb-6">Alterar Plano</h3>

        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div
            v-for="plan in availablePlans"
            :key="plan.id"
            @click="selectedNewPlan = plan.id"
            :class="[
              'p-6 rounded-lg border-2 cursor-pointer transition',
              selectedNewPlan === plan.id
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 bg-dark-700 hover:border-dark-500'
            ]"
          >
            <h4 class="text-xl font-bold text-white mb-2">{{ plan.display_name }}</h4>
            <p class="text-3xl font-bold text-primary-500 mb-2">R$ {{ plan.price.toFixed(2) }}</p>
            <p class="text-sm text-gray-400">por mês</p>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            @click="handleChangePlan"
            :disabled="!selectedNewPlan || changePlanLoading"
            class="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition disabled:opacity-50"
          >
            {{ changePlanLoading ? 'Alterando...' : 'Confirmar Alteração' }}
          </button>
          <button
            @click="showChangePlanModal = false"
            class="flex-1 py-3 bg-dark-700 text-white rounded-lg font-semibold hover:bg-dark-600 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  currentSubscription,
  loading,
  hasActiveSubscription,
  hasAiAccess,
  isInTrial,
  trialDaysRemaining,
  subscriptionStatus,
  nextBillingDate,
  cancelSubscription,
  changePlan
} = useSubscription()

const showCancelModal = ref(false)
const showChangePlanModal = ref(false)
const cancelLoading = ref(false)
const changePlanLoading = ref(false)
const selectedNewPlan = ref<string | null>(null)
const availablePlans = ref<any[]>([])
const payments = ref<any[]>([])

// Buscar planos disponíveis
onMounted(async () => {
  const { data: plansData } = await useFetch('/api/subscriptions/plans')
  availablePlans.value = plansData.value?.data || []

  // Buscar histórico de pagamentos
  const { data: paymentsData } = await useFetch('/api/subscriptions/payments')
  payments.value = paymentsData.value?.data || []
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    trial: 'bg-blue-500/20 text-blue-400',
    past_due: 'bg-yellow-500/20 text-yellow-400',
    canceled: 'bg-red-500/20 text-red-400',
    expired: 'bg-gray-500/20 text-gray-400'
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: 'Ativo',
    trial: 'Em Trial',
    past_due: 'Pagamento Pendente',
    canceled: 'Cancelado',
    expired: 'Expirado'
  }
  return texts[status] || status
}

const getPaymentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    received: 'Recebido',
    overdue: 'Vencido',
    refunded: 'Reembolsado'
  }
  return texts[status] || status
}

const handleCancelSubscription = async () => {
  if (!currentSubscription.value) return

  cancelLoading.value = true
  try {
    await cancelSubscription(currentSubscription.value.id, true)
    showCancelModal.value = false
    alert('Assinatura cancelada com sucesso')
  } catch (error) {
    alert('Erro ao cancelar assinatura')
  } finally {
    cancelLoading.value = false
  }
}

const handleChangePlan = async () => {
  if (!selectedNewPlan.value) return

  changePlanLoading.value = true
  try {
    await changePlan(selectedNewPlan.value)
    showChangePlanModal.value = false
    alert('Plano alterado com sucesso')
  } catch (error) {
    alert('Erro ao alterar plano')
  } finally {
    changePlanLoading.value = false
  }
}

definePageMeta({
  middleware: 'auth'
})
</script>
