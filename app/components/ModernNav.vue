<template>
  <div>
    <!-- Top Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-dark-700 shadow-2xl backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V9h7V2.99c3.85.81 6.84 3.97 7.41 7.83L12 10.99z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">Concurseiro</h1>
              <p class="text-xs text-gray-400">Sua jornada de estudos</p>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- User Avatar -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-dark-700 transition-colors"
              >
                <div class="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {{ userInitial }}
                </div>
                <div class="text-left hidden md:block">
                  <p class="text-sm font-medium text-white">{{ userName }}</p>
                  <p class="text-xs text-gray-400">{{ userEmail }}</p>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- User Dropdown -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl py-2"
              >
                <NuxtLink
                  to="/profile"
                  @click="showUserMenu = false"
                  class="flex items-center space-x-3 px-4 py-3 hover:bg-dark-700 transition-colors text-gray-300 hover:text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>Perfil</span>
                </NuxtLink>
                <NuxtLink
                  to="/change-password"
                  @click="showUserMenu = false"
                  class="flex items-center space-x-3 px-4 py-3 hover:bg-dark-700 transition-colors text-gray-300 hover:text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  <span>Mudar Senha</span>
                </NuxtLink>
                <hr class="my-2 border-dark-600"/>
                <button
                  @click="handleLogout"
                  class="flex items-center space-x-3 px-4 py-3 hover:bg-dark-700 transition-colors text-red-400 hover:text-red-300 w-full"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="border-t border-dark-700 bg-dark-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center space-x-2 py-3 overflow-x-auto scrollbar-hide">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.name"
              :to="action.route"
              class="flex flex-col items-center justify-center min-w-[140px] p-4 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:border-primary-500/50 group"
            >
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:from-primary-500/30 group-hover:to-primary-600/30 transition-all">
                <component :is="action.icon" class="w-6 h-6 text-primary-400" />
              </div>
              <span class="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{{ action.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Search Bar (Below Menu) -->
      <div class="border-t border-dark-700 bg-dark-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="relative max-w-3xl mx-auto">
            <input
              v-model="searchQuery"
              @focus="showSearchResults = true"
              @input="handleSearch"
              type="text"
              placeholder="Pesquisar em todo o sistema..."
              class="w-full px-4 py-3 pl-12 bg-dark-700/50 border border-dark-600 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>

            <!-- Search Results Dropdown -->
            <div
              v-if="showSearchResults && searchQuery.length > 0"
              class="absolute top-full mt-2 left-0 right-0 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
            >
              <div v-if="searchResults.length === 0" class="p-4 text-center text-gray-400">
                Nenhum resultado encontrado
              </div>
              <div v-else>
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  @click="navigateToResult(result)"
                  class="p-3 hover:bg-dark-700 cursor-pointer border-b border-dark-700 last:border-b-0 transition-colors"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-white">{{ result.title }}</p>
                      <p class="text-xs text-gray-400">{{ result.type }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Spacer to prevent content from being hidden under fixed nav -->
    <div class="h-64"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const supabase = useSupabaseClient()
const router = useRouter()

// User data
const userName = ref('Usuário')
const userEmail = ref('')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

// Search
const searchQuery = ref('')
const showSearchResults = ref(false)
const searchResults = ref<any[]>([])

// User menu
const showUserMenu = ref(false)

// Quick actions with icon components
const quickActions = [
  {
    name: 'Calendário',
    route: '/calendar',
    icon: 'IconCalendar'
  },
  {
    name: 'Relatórios',
    route: '/reports',
    icon: 'IconChart'
  },
  {
    name: 'Configurar Meta',
    route: '/study',
    icon: 'IconTarget'
  },
  {
    name: 'Gerenciar Matérias',
    route: '/subjects',
    icon: 'IconBook'
  },
  {
    name: 'Iniciar Estudo',
    route: '/study',
    icon: 'IconClock'
  },
  {
    name: 'Caderno Virtual',
    route: '/notebook',
    icon: 'IconNotebook'
  }
]

// Load user data
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userName.value = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
    userEmail.value = user.email || ''
  }
})

// Handle search
const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Search in subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', `%${searchQuery.value}%`)
      .limit(5)

    // Search in chapters
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, title, subject_id')
      .ilike('title', `%${searchQuery.value}%`)
      .limit(5)

    const results = []

    if (subjects) {
      results.push(...subjects.map(s => ({
        id: `subject-${s.id}`,
        title: s.name,
        type: 'Caderno',
        route: '/notebook',
        data: s
      })))
    }

    if (chapters) {
      results.push(...chapters.map(c => ({
        id: `chapter-${c.id}`,
        title: c.title,
        type: 'Capítulo',
        route: '/notebook',
        data: c
      })))
    }

    searchResults.value = results
  } catch (error) {
    console.error('Erro na pesquisa:', error)
  }
}

// Navigate to search result
const navigateToResult = (result: any) => {
  showSearchResults.value = false
  searchQuery.value = ''
  router.push(result.route)
}

// Handle logout
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

// Close dropdowns when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
    showSearchResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<script lang="ts">
// Icon components
const IconCalendar = {
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
    </svg>
  `
}

const IconChart = {
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
    </svg>
  `
}

const IconTarget = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `
}

const IconBook = {
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
  `
}

const IconClock = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `
}

const IconNotebook = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  `
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
