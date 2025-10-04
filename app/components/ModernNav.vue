<template>
  <div>
    <!-- Compact Modern Header -->
    <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-dark-700/50 shadow-lg" style="background-color: #0f172a;">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Main Header Row -->
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand -->
          <NuxtLink to="/dashboard" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-all">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span class="text-base font-semibold text-white">Concurseiro</span>
          </NuxtLink>

          <!-- Quick Actions (Horizontal) -->
          <div class="hidden md:flex items-center space-x-1">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.name"
              :to="action.route"
              class="flex items-center space-x-1.5 px-4 py-2 rounded-lg hover:bg-dark-700/50 transition-all text-gray-300 hover:text-white group"
            >
              <component :is="action.icon" class="w-5 h-5" />
              <span class="text-sm font-medium">{{ action.name }}</span>
            </NuxtLink>
          </div>

          <!-- Right Section -->
          <div class="flex items-center space-x-4">
            <!-- Search Toggle -->
            <button
              @click="showSearchBar = !showSearchBar"
              class="p-2.5 rounded-lg hover:bg-dark-700/50 text-gray-400 hover:text-white transition-all"
              title="Pesquisar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <!-- User Menu -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-dark-700/50 transition-all"
              >
                <div class="w-8 h-8 bg-primary-500/20 border border-primary-500/30 rounded-full flex items-center justify-center text-xs font-semibold text-primary-400">
                  {{ userInitial }}
                </div>
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- User Dropdown -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-52 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1"
                >
                  <div class="px-3 py-2 border-b border-dark-700">
                    <p class="text-sm font-medium text-white truncate">{{ userName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
                  </div>
                  <NuxtLink
                    to="/profile"
                    @click="showUserMenu = false"
                    class="flex items-center space-x-2.5 px-4 py-2.5 hover:bg-dark-700 transition-colors text-gray-300 hover:text-white text-sm"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span>Perfil</span>
                  </NuxtLink>
                  <NuxtLink
                    to="/change-password"
                    @click="showUserMenu = false"
                    class="flex items-center space-x-2.5 px-4 py-2.5 hover:bg-dark-700 transition-colors text-gray-300 hover:text-white text-sm"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    <span>Mudar Senha</span>
                  </NuxtLink>
                  <hr class="my-1 border-dark-700"/>
                  <button
                    @click="handleLogout"
                    class="flex items-center space-x-2.5 px-4 py-2.5 hover:bg-dark-700 transition-colors text-red-400 hover:text-red-300 w-full text-sm"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>Sair</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Expandable Search Bar -->
        <Transition
          enter-active-class="transition-all ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showSearchBar" class="pb-3">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Pesquisar cadernos, capítulos..."
                class="w-full px-4 py-2 pl-10 bg-dark-800/50 border border-dark-700 text-white placeholder-gray-500 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
              <svg class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>

              <!-- Search Results -->
              <div
                v-if="searchQuery.length > 0 && searchResults.length > 0"
                class="absolute top-full mt-1 left-0 right-0 bg-dark-800 border border-dark-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
              >
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  @click="navigateToResult(result)"
                  class="flex items-center space-x-3 px-4 py-2.5 hover:bg-dark-700 cursor-pointer border-b border-dark-700 last:border-b-0 transition-colors"
                >
                  <div class="w-8 h-8 bg-primary-500/10 border border-primary-500/20 rounded flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ result.title }}</p>
                    <p class="text-sm text-gray-500">{{ result.type }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </nav>

    <!-- Spacer -->
    <div class="h-16"></div>
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

// UI state
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showUserMenu = ref(false)
const showSearchBar = ref(false)

// Quick actions
const quickActions = [
  { name: 'Calendário', route: '/calendar', icon: 'IconCalendar' },
  { name: 'Relatórios', route: '/reports', icon: 'IconChart' },
  { name: 'Meta', route: '/study', icon: 'IconTarget' },
  { name: 'Matérias', route: '/subjects', icon: 'IconBook' },
  { name: 'Estudo', route: '/study', icon: 'IconClock' },
  { name: 'Caderno', route: '/notebook', icon: 'IconNotebook' }
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

    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', `%${searchQuery.value}%`)
      .limit(5)

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
        route: '/notebook'
      })))
    }

    if (chapters) {
      results.push(...chapters.map(c => ({
        id: `chapter-${c.id}`,
        title: c.title,
        type: 'Capítulo',
        route: '/notebook'
      })))
    }

    searchResults.value = results
  } catch (error) {
    console.error('Erro na pesquisa:', error)
  }
}

const navigateToResult = (result: any) => {
  showSearchBar.value = false
  searchQuery.value = ''
  router.push(result.route)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
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
// Icon components (monocromáticos)
const IconCalendar = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  `
}

const IconChart = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
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
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
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

