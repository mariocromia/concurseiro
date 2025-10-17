<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <NuxtLink to="/" class="inline-block text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-6">
          Concurseiro
        </NuxtLink>
        <h1 class="text-4xl font-bold text-claude-text dark:text-white mb-2">Finalizar Assinatura</h1>
        <p class="text-claude-text-secondary dark:text-gray-400">Complete seus dados para começar</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Formulário -->
        <div class="md:col-span-2">
          <div class="bg-dark-800 border border-dark-700 rounded-claude-lg p-8">
            <!-- Alerta de Erro -->
            <div v-if="error" class="mb-6 bg-red-500/10 border border-red-500/50 rounded-claude-md p-4">
              <p class="text-red-400 text-sm">{{ error }}</p>
            </div>

            <!-- Alerta de Sucesso -->
            <div v-if="success" class="mb-6 bg-green-500/10 border border-green-500/50 rounded-claude-md p-4">
              <p class="text-green-400 text-sm">{{ success }}</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-8">
              <!-- Dados Pessoais -->
              <div>
                <h3 class="text-xl font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Dados Pessoais
                </h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Nome Completo</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Seu nome completo"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Email</label>
                    <input
                      v-model="formData.email"
                      type="email"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="seu@email.com"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">CPF/CNPJ</label>
                    <input
                      v-model="formData.cpfCnpj"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="000.000.000-00"
                      @input="formatCpfCnpj"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Telefone</label>
                    <input
                      v-model="formData.phone"
                      type="tel"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="(00) 00000-0000"
                      @input="formatPhone"
                    >
                  </div>
                </div>
              </div>

              <!-- Cupom de Desconto -->
              <div>
                <h3 class="text-xl font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  Cupom de Desconto
                </h3>
                <div class="flex gap-2">
                  <input
                    v-model="couponCode"
                    type="text"
                    placeholder="Digite seu cupom"
                    class="flex-1 bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                  <button
                    type="button"
                    @click="validateCoupon"
                    :disabled="validatingCoupon || !couponCode"
                    class="px-6 py-3 bg-primary-600 text-claude-text dark:text-white rounded-claude-md font-semibold hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {{ validatingCoupon ? 'Validando...' : 'Aplicar' }}
                  </button>
                </div>
                <div v-if="couponValid" class="mt-2 bg-green-500/10 border border-green-500/30 rounded-claude-md p-3">
                  <p class="text-green-400 text-sm">✓ Cupom aplicado! Desconto de 20%</p>
                </div>
                <div v-if="couponError" class="mt-2 bg-red-500/10 border border-red-500/30 rounded-claude-md p-3">
                  <p class="text-red-400 text-sm">{{ couponError }}</p>
                </div>
              </div>

              <!-- Endereço -->
              <div>
                <h3 class="text-xl font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Endereço
                </h3>
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Endereço</label>
                    <input
                      v-model="formData.address"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Rua, Avenida..."
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Número</label>
                    <input
                      v-model="formData.addressNumber"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="123"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Bairro</label>
                    <input
                      v-model="formData.province"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Centro"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">CEP</label>
                    <input
                      v-model="formData.postalCode"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="00000-000"
                      @input="formatCep"
                    >
                  </div>
                </div>
              </div>

              <!-- Método de Pagamento (somente se não for trial) -->
              <div v-if="!isProPlan">
                <h3 class="text-xl font-semibold text-claude-text dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  Método de Pagamento
                </h3>

                <!-- Tabs de Método -->
                <div class="flex gap-2 mb-4">
                  <button
                    type="button"
                    @click="paymentMethod = 'CREDIT_CARD'"
                    :class="[
                      'flex-1 py-3 rounded-claude-md font-semibold transition-all',
                      paymentMethod === 'CREDIT_CARD'
                        ? 'bg-primary-600 text-claude-text dark:text-white'
                        : 'bg-dark-700 text-claude-text-secondary dark:text-gray-400 hover:bg-dark-600'
                    ]"
                  >
                    Cartão de Crédito
                  </button>
                  <button
                    type="button"
                    @click="paymentMethod = 'BOLETO'"
                    :class="[
                      'flex-1 py-3 rounded-claude-md font-semibold transition-all',
                      paymentMethod === 'BOLETO'
                        ? 'bg-primary-600 text-claude-text dark:text-white'
                        : 'bg-dark-700 text-claude-text-secondary dark:text-gray-400 hover:bg-dark-600'
                    ]"
                  >
                    Boleto
                  </button>
                  <button
                    type="button"
                    @click="paymentMethod = 'PIX'"
                    :class="[
                      'flex-1 py-3 rounded-claude-md font-semibold transition-all',
                      paymentMethod === 'PIX'
                        ? 'bg-primary-600 text-claude-text dark:text-white'
                        : 'bg-dark-700 text-claude-text-secondary dark:text-gray-400 hover:bg-dark-600'
                    ]"
                  >
                    PIX
                  </button>
                </div>

                <!-- Dados do Cartão -->
                <div v-if="paymentMethod === 'CREDIT_CARD'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Número do Cartão</label>
                    <input
                      v-model="formData.cardNumber"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0000 0000 0000 0000"
                      @input="formatCardNumber"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Nome no Cartão</label>
                    <input
                      v-model="formData.cardHolderName"
                      type="text"
                      required
                      class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nome como está no cartão"
                    >
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Mês</label>
                      <input
                        v-model="formData.cardExpiryMonth"
                        type="text"
                        required
                        maxlength="2"
                        class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="MM"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Ano</label>
                      <input
                        v-model="formData.cardExpiryYear"
                        type="text"
                        required
                        maxlength="4"
                        class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="AAAA"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">CVV</label>
                      <input
                        v-model="formData.cardCvv"
                        type="text"
                        required
                        maxlength="4"
                        class="w-full bg-dark-700 border border-dark-600 rounded-claude-md px-4 py-3 text-claude-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="123"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Termos -->
              <div class="flex items-start gap-3">
                <input
                  v-model="acceptTerms"
                  type="checkbox"
                  required
                  class="mt-1 w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                >
                <label class="text-sm text-claude-text-secondary dark:text-gray-400">
                  Li e aceito os <a href="#" class="text-primary-500 hover:text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors">Termos de Uso</a> e a
                  <a href="#" class="text-primary-500 hover:text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors">Política de Privacidade</a>
                </label>
              </div>

              <!-- Botão de Submit -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-claude-text dark:text-white rounded-claude-md font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading">Processando...</span>
                <span v-else-if="isProPlan">Iniciar 14 Dias Grátis</span>
                <span v-else>Finalizar Assinatura</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Resumo do Pedido -->
        <div class="md:col-span-1">
          <div class="bg-dark-800 border border-dark-700 rounded-claude-lg p-6 sticky top-8">
            <h3 class="text-xl font-semibold text-claude-text dark:text-white mb-6">Resumo do Pedido</h3>

            <div v-if="selectedPlan" class="space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-claude-text dark:text-white">{{ selectedPlan.display_name }}</p>
                  <p class="text-sm text-claude-text-secondary dark:text-gray-400">Cobrança mensal</p>
                </div>
                <p class="text-xl font-bold text-claude-text dark:text-white">R$ {{ selectedPlan.price.toFixed(2) }}</p>
              </div>

              <div v-if="isProPlan" class="bg-green-500/10 border border-green-500/30 rounded-claude-md p-4">
                <p class="text-green-400 font-semibold text-sm">✨ 14 dias grátis</p>
                <p class="text-green-300 text-xs mt-1">
                  Você não será cobrado até {{ trialEndDate }}
                </p>
              </div>

              <div class="border-t border-dark-600 pt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-claude-text-secondary dark:text-gray-400">Subtotal</span>
                  <span class="text-claude-text dark:text-white">R$ {{ selectedPlan.price.toFixed(2) }}</span>
                </div>
                <div v-if="couponValid" class="flex justify-between items-center mb-2">
                  <span class="text-claude-text-secondary dark:text-gray-400">Desconto (Cupom 20%)</span>
                  <span class="text-green-400">- R$ {{ (selectedPlan.price * 0.20).toFixed(2) }}</span>
                </div>
                <div v-if="isProPlan" class="flex justify-between items-center mb-2">
                  <span class="text-claude-text-secondary dark:text-gray-400">Desconto (Trial)</span>
                  <span class="text-green-400">- R$ {{ finalPrice.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center text-lg font-bold pt-2 border-t border-dark-600">
                  <span class="text-claude-text dark:text-white">Total hoje</span>
                  <span class="text-primary-500">{{ isProPlan ? 'R$ 0,00' : `R$ ${finalPrice.toFixed(2)}` }}</span>
                </div>
              </div>

              <!-- Recursos Incluídos -->
              <div class="border-t border-dark-600 pt-4">
                <p class="text-sm font-semibold text-claude-text dark:text-white mb-3">Recursos incluídos:</p>
                <ul class="space-y-2">
                  <li v-for="feature in selectedPlan.features.slice(0, 5)" :key="feature" class="flex items-start gap-2 text-sm text-claude-text-secondary dark:text-gray-400">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ feature }}
                  </li>
                  <li v-if="selectedPlan.features.length > 5" class="text-sm text-primary-500">
                    + {{ selectedPlan.features.length - 5 }} recursos adicionais
                  </li>
                </ul>
              </div>

              <!-- Segurança -->
              <div class="border-t border-dark-600 pt-4">
                <div class="flex items-center gap-2 text-sm text-claude-text-secondary dark:text-gray-400">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Pagamento 100% seguro
                </div>
              </div>
            </div>

            <div v-else class="text-center text-claude-text-secondary dark:text-gray-400 py-8">
              Carregando plano...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const planType = ref(route.query.plan as string || 'plus')
const selectedPlan = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const acceptTerms = ref(false)
const paymentMethod = ref('CREDIT_CARD')
const couponCode = ref('')
const validatingCoupon = ref(false)
const couponValid = ref(false)
const couponError = ref('')
const appliedCoupon = ref<any>(null)

const formData = ref({
  name: '',
  email: '',
  cpfCnpj: '',
  phone: '',
  address: '',
  addressNumber: '',
  province: '',
  postalCode: '',
  cardNumber: '',
  cardHolderName: '',
  cardExpiryMonth: '',
  cardExpiryYear: '',
  cardCvv: ''
})

const isProPlan = computed(() => planType.value === 'pro')

const finalPrice = computed(() => {
  if (!selectedPlan.value) return 0
  const basePrice = selectedPlan.value.price
  if (couponValid.value) {
    return basePrice * 0.80 // 20% de desconto
  }
  return basePrice
})

const trialEndDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toLocaleDateString('pt-BR')
})

// Função para validar cupom
const validateCoupon = async () => {
  if (!couponCode.value) return

  validatingCoupon.value = true
  couponError.value = ''
  couponValid.value = false

  try {
    const response = await $fetch('/api/affiliates/validate-coupon', {
      method: 'POST',
      body: {
        coupon_code: couponCode.value
      }
    })

    if (response.valid) {
      couponValid.value = true
      appliedCoupon.value = response.coupon
      couponError.value = ''
    } else {
      couponValid.value = false
      const errorMsg = response.message ? response.message : "Cupom invalido"
      couponError.value = errorMsg
    }
  } catch (e: any) {
    let errorMessage = "Erro ao validar cupom"
    if (e.data && e.data.message) {
      errorMessage = e.data.message
    } else if (e.message) {
      errorMessage = e.message
    }
    couponError.value = errorMessage
    couponValid.value = false
  } finally {
    validatingCoupon.value = false
  }
}

// Verificar se veio com cupom na URL
onMounted(async () => {
  const refCode = route.query.ref as string
  if (refCode) {
    couponCode.value = refCode
    await validateCoupon()
  }
})

// Buscar plano selecionado
onMounted(async () => {
  try {
    const { data } = await useFetch('/api/subscriptions/plans')
    const plans = data.value?.data || []
    selectedPlan.value = plans.find((p: any) => p.name === planType.value)
  } catch (e) {
    error.value = 'Erro ao carregar plano'
  }
})

// Formatações
const formatCpfCnpj = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  formData.value.cpfCnpj = value
}

const formatPhone = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  formData.value.phone = value
}

const formatCep = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.replace(/(\d{5})(\d{3})/, '$1-$2')
  formData.value.postalCode = value
}

const formatCardNumber = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  formData.value.cardNumber = value
}

const handleSubmit = async () => {
  error.value = null
  success.value = null
  loading.value = true

  try {
    const customerData = {
      name: formData.value.name,
      email: formData.value.email,
      cpfCnpj: formData.value.cpfCnpj.replace(/\D/g, ''),
      phone: formData.value.phone.replace(/\D/g, ''),
      address: formData.value.address,
      addressNumber: formData.value.addressNumber,
      province: formData.value.province,
      postalCode: formData.value.postalCode.replace(/\D/g, '')
    }

    let creditCardData = null
    if (paymentMethod.value === 'CREDIT_CARD' && !isProPlan.value) {
      creditCardData = {
        holderName: formData.value.cardHolderName,
        number: formData.value.cardNumber.replace(/\s/g, ''),
        expiryMonth: formData.value.cardExpiryMonth,
        expiryYear: formData.value.cardExpiryYear,
        ccv: formData.value.cardCvv
      }
    }

    const { data: result } = await useFetch('/api/subscriptions/create', {
      method: 'POST',
      body: {
        planId: selectedPlan.value.id,
        customerData,
        paymentMethod: paymentMethod.value,
        creditCardData,
        couponCode: couponValid.value ? couponCode.value : null,
        affiliateId: appliedCoupon.value?.affiliate_id
      }
    })

    if (result.value?.success) {
      success.value = 'Assinatura criada com sucesso! Redirecionando...'
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  } catch (e: any) {
    error.value = e.message || 'Erro ao processar assinatura'
  } finally {
    loading.value = false
  }
}
</script>
