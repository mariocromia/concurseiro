<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
    <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl shadow-2xl p-8 max-w-md w-full">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white">Torne-se um Afiliado</h1>
      </div>
      <p class="text-gray-400 mb-6">Ganhe 20% de comissão recorrente sobre cada venda!</p>

      <div v-if="success" class="bg-dark-700/50 border border-primary-500/30 rounded-xl px-4 py-3 mb-4">
        <p class="font-bold text-white mb-2">Cadastro realizado com sucesso!</p>
        <p class="text-sm text-gray-300 mt-2">Seu cupom: <strong class="text-primary-400">{{ affiliate.coupon_code }}</strong></p>
        <p class="text-sm text-gray-300">Link: <a :href="affiliate.tracking_link" class="text-primary-400 hover:text-primary-300 underline" target="_blank">{{ affiliate.tracking_link }}</a></p>
        <button @click="$router.push('/afiliado')" class="mt-4 w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition text-white py-2">
          Ir para o Painel
        </button>
      </div>

      <form v-else @submit.prevent="register" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Nome do Cupom
          </label>
          <input
            v-model="form.coupon_code"
            @blur="checkCouponAvailability"
            type="text"
            placeholder="Ex: MEUCUPOM"
            class="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
            required
            :class="{ 'border-red-500/50': couponError, 'border-primary-500': couponAvailable && form.coupon_code }"
          />
          <p v-if="couponError" class="text-red-400 text-sm mt-1">{{ couponError }}</p>
          <p v-else-if="couponAvailable && form.coupon_code" class="text-primary-400 text-sm mt-1 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            Cupom disponível
          </p>
          <p class="text-gray-400 text-xs mt-1">Será usado como código de desconto para seus clientes</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            CPF
          </label>
          <input
            v-model="form.cpf"
            type="text"
            placeholder="000.000.000-00"
            maxlength="14"
            @input="formatCPF"
            class="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <p class="text-gray-400 text-xs mt-1">Necessário para receber pagamentos via PIX</p>
        </div>

        <div class="bg-dark-700/30 border border-dark-600 p-4 rounded-lg">
          <h3 class="font-semibold text-white mb-2">Como funciona:</h3>
          <ul class="text-sm text-gray-400 space-y-1">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              Seu cupom dá 20% de desconto para clientes
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              Você recebe 20% sobre o valor pago
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              Comissão recorrente a cada renovação
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              Saque mínimo de R$ 50,00
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              Pagamento via PIX
            </li>
          </ul>
        </div>

        <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading || !couponAvailable || !form.coupon_code || !form.cpf"
          class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Cadastrando...' : 'Cadastrar como Afiliado' }}
        </button>

        <p class="text-center text-sm text-gray-400">
          Já é afiliado? <NuxtLink to="/afiliado" class="text-primary-400 hover:text-primary-300 hover:underline">Acessar painel</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const form = ref({
  coupon_code: '',
  cpf: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const affiliate = ref(null)
const couponError = ref('')
const couponAvailable = ref(false)
const checkingCoupon = ref(false)

const formatCPF = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    form.value.cpf = value
  }
}

const checkCouponAvailability = async () => {
  if (!form.value.coupon_code) {
    couponError.value = ''
    couponAvailable.value = false
    return
  }

  checkingCoupon.value = true
  couponError.value = ''

  try {
    const response = await $fetch('/api/affiliates/check-coupon', {
      method: 'POST',
      body: {
        coupon_code: form.value.coupon_code
      }
    })

    if (response.available) {
      couponAvailable.value = true
      couponError.value = ''
    } else {
      couponAvailable.value = false
      couponError.value = response.message || "Este cupom ja esta em uso"
    }
  } catch (err) {
    let errorMessage = "Erro ao verificar cupom"
    if (err.data && err.data.message) {
      errorMessage = err.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    couponError.value = errorMessage
    couponAvailable.value = false
  } finally {
    checkingCoupon.value = false
  }
}

const register = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/affiliates/register', {
      method: 'POST',
      body: {
        coupon_code: form.value.coupon_code.toUpperCase(),
        cpf: form.value.cpf.replace(/\D/g, '')
      }
    })

    if (response.success) {
      success.value = true
      affiliate.value = response.affiliate
    }
  } catch (err) {
    let errorMessage = "Erro ao cadastrar afiliado"
    if (err.data && err.data.message) {
      errorMessage = err.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    error.value = errorMessage
  } finally {
    loading.value = false
  }
}
</script>
