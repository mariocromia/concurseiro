<template>
  <div class="min-h-screen bg-dark-900">
    <AdminMenu />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Gerenciar Usuários</h1>
        <p class="text-gray-400">Visualize e gerencie todos os usuários do sistema</p>
      </div>

      <!-- Filters -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome ou email..."
            class="flex-1 px-4 py-2 bg-dark-900 border border-dark-600 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            v-model="filterType"
            class="px-4 py-2 bg-dark-900 border border-dark-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos</option>
            <option value="freemium">Freemium</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-dark-700">
            <thead class="bg-dark-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plano
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cadastro
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-700">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-dark-700/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ user.name || 'Sem nome' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-400">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getPlanBadge(user.subscription_type)"
                  >
                    {{ user.subscription_type || 'freemium' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="viewUser(user.id)"
                    class="text-primary-400 hover:text-primary-300 mr-3"
                  >
                    Ver
                  </button>
                  <button
                    @click="editUser(user.id)"
                    class="text-blue-400 hover:text-blue-300"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="px-6 py-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p class="text-gray-400 mt-2">Carregando usuários...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredUsers.length === 0" class="px-6 py-12 text-center">
          <p class="text-gray-400">Nenhum usuário encontrado</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-400">
          Mostrando {{ filteredUsers.length }} de {{ users.length }} usuários
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()
const router = useRouter()

const users = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterType = ref('')

const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  }

  // Filter by subscription type
  if (filterType.value) {
    filtered = filtered.filter(user =>
      (user.subscription_type || 'freemium') === filterType.value
    )
  }

  return filtered
})

const getPlanBadge = (plan: string) => {
  const badges: Record<string, string> = {
    freemium: 'bg-gray-500/20 text-gray-400',
    plus: 'bg-blue-500/20 text-blue-400',
    pro: 'bg-purple-500/20 text-purple-400'
  }
  return badges[plan] || badges.freemium
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const viewUser = (userId: string) => {
  router.push(`/admin/users/${userId}`)
}

const editUser = (userId: string) => {
  router.push(`/admin/users/${userId}/edit`)
}

onMounted(async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    users.value = data || []
  } catch (err) {
    console.error('[admin/users] Erro ao carregar usuários:', err)
  } finally {
    loading.value = false
  }
})
</script>
