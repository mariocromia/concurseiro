<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-dark-800 border border-dark-700 rounded-2xl p-8">
        <h1 class="text-3xl font-bold text-white mb-6">🔧 Admin - Atualizar Usuário Premium</h1>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email do Usuário</label>
            <input
              v-model="email"
              type="email"
              placeholder="usuario@email.com"
              class="w-full px-4 py-3 bg-dark-900 border border-dark-600 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Tipo de Assinatura</label>
            <select
              v-model="subscriptionType"
              class="w-full px-4 py-3 bg-dark-900 border border-dark-600 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="plus">Plus</option>
            </select>
          </div>

          <button
            @click="updateUser"
            :disabled="loading || !email"
            class="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
          >
            {{ loading ? 'Atualizando...' : 'Atualizar Usuário' }}
          </button>
        </div>

        <!-- Result -->
        <div v-if="result" class="mt-6 p-4 rounded-xl" :class="result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'">
          <p :class="result.success ? 'text-green-400' : 'text-red-400'" class="font-medium">
            {{ result.message }}
          </p>
        </div>

        <!-- User Info -->
        <div v-if="userInfo" class="mt-6 p-4 bg-dark-900 border border-dark-600 rounded-xl">
          <h3 class="text-white font-medium mb-2">Informações do Usuário:</h3>
          <div class="space-y-1 text-sm">
            <p class="text-gray-400">ID: <span class="text-gray-300">{{ userInfo.id }}</span></p>
            <p class="text-gray-400">Email: <span class="text-gray-300">{{ userInfo.email }}</span></p>
            <p class="text-gray-400">Assinatura: <span class="text-primary-400 font-medium">{{ userInfo.subscription_type }}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('netsacolas@gmail.com')
const subscriptionType = ref('pro')
const loading = ref(false)
const result = ref<{ success: boolean; message: string } | null>(null)
const userInfo = ref<any>(null)

const updateUser = async () => {
  loading.value = true
  result.value = null
  userInfo.value = null

  try {
    // Pegar o usuário atual logado
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      result.value = { success: false, message: 'Você precisa estar logado' }
      loading.value = false
      return
    }

    // Verificar se o email é o mesmo do usuário logado
    if (currentUser.email !== email.value) {
      result.value = {
        success: false,
        message: `⚠️ Você só pode atualizar sua própria conta. Faça login como ${email.value} primeiro.`
      }
      loading.value = false
      return
    }

    // Verificar se existe na tabela users
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    // Inserir ou atualizar
    if (existingUser) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_type: subscriptionType.value })
        .eq('id', currentUser.id)

      if (updateError) {
        result.value = { success: false, message: `Erro ao atualizar: ${updateError.message}` }
        loading.value = false
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: currentUser.id, subscription_type: subscriptionType.value })

      if (insertError) {
        result.value = { success: false, message: `Erro ao inserir: ${insertError.message}` }
        loading.value = false
        return
      }
    }

    // Buscar resultado final
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (finalError) {
      result.value = { success: false, message: `Erro ao verificar: ${finalError.message}` }
      loading.value = false
      return
    }

    userInfo.value = {
      id: currentUser.id,
      email: currentUser.email,
      subscription_type: finalUser.subscription_type
    }

    result.value = {
      success: true,
      message: `✅ Usuário ${email.value} atualizado para ${subscriptionType.value.toUpperCase()}! Recarregue a página para ver as mudanças.`
    }

  } catch (err: any) {
    result.value = { success: false, message: `Erro: ${err.message}` }
  } finally {
    loading.value = false
  }
}
</script>
