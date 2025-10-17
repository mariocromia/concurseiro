// Composable para gerenciar assinatura do usuário
export const useSubscription = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const currentSubscription = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Buscar assinatura atual
  const fetchCurrentSubscription = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch('/api/subscriptions/current')

      if (fetchError.value) {
        throw new Error(fetchError.value.message)
      }

      currentSubscription.value = data.value?.data?.subscription || null
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar assinatura:', e)
    } finally {
      loading.value = false
    }
  }

  // Verificar se tem assinatura ativa
  const hasActiveSubscription = computed(() => {
    if (!currentSubscription.value) return false
    return ['active', 'trial'].includes(currentSubscription.value.status)
  })

  // Verificar se tem acesso a IA
  const hasAiAccess = computed(() => {
    if (!currentSubscription.value?.plan) return false
    return currentSubscription.value.plan.ai_enabled === true
  })

  // Verificar se está em trial
  const isInTrial = computed(() => {
    return currentSubscription.value?.status === 'trial'
  })

  // Dias restantes do trial
  const trialDaysRemaining = computed(() => {
    if (!isInTrial.value || !currentSubscription.value?.trial_end) return 0

    const trialEnd = new Date(currentSubscription.value.trial_end)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  })

  // Nome do plano atual
  const currentPlanName = computed(() => {
    return currentSubscription.value?.plan?.display_name || 'Nenhum'
  })

  // Status da assinatura
  const subscriptionStatus = computed(() => {
    return currentSubscription.value?.status || 'inactive'
  })

  // Próxima data de cobrança
  const nextBillingDate = computed(() => {
    if (!currentSubscription.value?.current_period_end) return null
    return new Date(currentSubscription.value.current_period_end)
  })

  // Bloquear acesso a recursos de IA
  const requireAiAccess = () => {
    if (!hasAiAccess.value) {
      throw new Error('Você precisa do Plano Pro para acessar recursos de IA')
    }
  }

  // Bloquear acesso sem assinatura ativa
  const requireActiveSubscription = () => {
    if (!hasActiveSubscription.value) {
      throw new Error('Você precisa de uma assinatura ativa para acessar este recurso')
    }
  }

  // Criar assinatura
  const createSubscription = async (planId: string, customerData: any, paymentMethod?: string, creditCardData?: any) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await useFetch('/api/subscriptions/create', {
        method: 'POST',
        body: {
          planId,
          customerData,
          paymentMethod,
          creditCardData
        }
      })

      if (createError.value) {
        throw new Error(createError.value.message)
      }

      await fetchCurrentSubscription()
      return data.value
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Cancelar assinatura
  const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd = true, reason?: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: cancelError } = await useFetch('/api/subscriptions/cancel', {
        method: 'POST',
        body: {
          subscriptionId,
          cancelAtPeriodEnd,
          reason
        }
      })

      if (cancelError.value) {
        throw new Error(cancelError.value.message)
      }

      await fetchCurrentSubscription()
      return data.value
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Mudar plano
  const changePlan = async (newPlanId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: changeError } = await useFetch('/api/subscriptions/change-plan', {
        method: 'POST',
        body: { newPlanId }
      })

      if (changeError.value) {
        throw new Error(changeError.value.message)
      }

      await fetchCurrentSubscription()
      return data.value
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Inicializar
  onMounted(() => {
    if (user.value) {
      fetchCurrentSubscription()
    }
  })

  watch(user, (newUser) => {
    if (newUser) {
      fetchCurrentSubscription()
    } else {
      currentSubscription.value = null
    }
  })

  return {
    currentSubscription,
    loading,
    error,
    hasActiveSubscription,
    hasAiAccess,
    isInTrial,
    trialDaysRemaining,
    currentPlanName,
    subscriptionStatus,
    nextBillingDate,
    fetchCurrentSubscription,
    requireAiAccess,
    requireActiveSubscription,
    createSubscription,
    cancelSubscription,
    changePlan
  }
}
