<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 border-b border-slate-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <NuxtLink to="/dashboard" class="flex items-center gap-3 group">
          <div class="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center group-hover:from-slate-600 group-hover:to-slate-700 transition-all duration-300">
            <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span class="text-slate-100 font-semibold tracking-tight hidden sm:block">Concurseiro</span>
        </NuxtLink>

        <!-- Menu Items -->
        <div class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            :class="{ 'menu-item-active': isActive(item.path) }"
          >
            <component :is="() => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-4 h-4', innerHTML: item.iconPath })" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- User Menu -->
        <div class="flex items-center gap-2">
          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- User Avatar -->
          <div class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                <span class="text-xs font-semibold text-slate-300">{{ userInitial }}</span>
              </div>
              <svg class="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- User Dropdown -->
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-if="userMenuOpen" ref="dropdownRef" class="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-800">
                  <p class="text-sm font-medium text-slate-200">{{ userName }}</p>
                  <p class="text-xs text-slate-500 truncate mt-0.5">{{ userEmail }}</p>
                </div>
                <div class="py-1">
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-slate-800/50 bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950">
        <div class="px-2 py-3 space-y-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            class="mobile-menu-item"
            :class="{ 'mobile-menu-item-active': isActive(item.path) }"
          >
            <component :is="() => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5', innerHTML: item.iconPath })" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { onClickOutside } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const dropdownRef = ref(null)

// Fechar dropdown ao clicar fora
onClickOutside(dropdownRef, () => {
  userMenuOpen.value = false
})

// Menu items na ordem solicitada
const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />'
  },
  {
    label: 'Matérias',
    path: '/subjects',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />'
  },
  {
    label: 'Meta',
    path: '/metas',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />'
  },
  {
    label: 'Estudo',
    path: '/study',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />'
  },
  {
    label: 'Caderno',
    path: '/notebook',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />'
  },
  {
    label: 'Mapa Mental',
    path: '/mapa-mental',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />'
  },
  {
    label: 'Flashcard',
    path: '/flashcards',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />'
  },
  {
    label: 'Relatórios',
    path: '/reports',
    iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />'
  }
]

const userName = computed(() => user.value?.user_metadata?.name || 'Usuário')
const userEmail = computed(() => user.value?.email || '')
const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

const isActive = (path: string) => {
  return route.path === path
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
  userMenuOpen.value = false
}
</script>

<style scoped>
.menu-item {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium;
  @apply text-slate-400 hover:text-slate-200 hover:bg-slate-800/50;
  @apply transition-all duration-200;
}

.menu-item-active {
  @apply text-slate-100 bg-slate-800;
}

.mobile-menu-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium;
  @apply text-slate-400 hover:text-slate-200 hover:bg-slate-800/50;
  @apply transition-all duration-200;
}

.mobile-menu-item-active {
  @apply text-slate-100 bg-slate-800;
}
</style>
