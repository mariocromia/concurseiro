<template>
  <div class="bg-gradient-to-r from-red-600 to-orange-600 border-b border-red-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <!-- Admin Badge + Email -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-semibold text-white">ADMIN</span>
          </div>
          <span class="text-sm text-white/90 font-medium hidden sm:block">{{ adminEmail }}</span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex items-center space-x-1">
          <NuxtLink
            v-for="link in adminLinks"
            :key="link.path"
            :to="link.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="isActive(link.path)
              ? 'bg-white/30 text-white'
              : 'text-white/80 hover:bg-white/20 hover:text-white'"
          >
            <div class="flex items-center space-x-2">
              <component :is="link.icon" class="w-4 h-4" />
              <span class="hidden md:inline">{{ link.label }}</span>
            </div>
          </NuxtLink>

          <!-- Exit Admin Mode -->
          <button
            @click="exitAdmin"
            class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            title="Sair do modo admin"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const route = useRoute()
const router = useRouter()
const { adminEmail } = useAdmin()

// Links do menu administrativo
const adminLinks = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: () => h('svg', {
      class: 'w-4 h-4',
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        d: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'
      })
    ])
  },
  {
    path: '/admin/users',
    label: 'Usuários',
    icon: () => h('svg', {
      class: 'w-4 h-4',
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        d: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z'
      })
    ])
  },
  {
    path: '/admin/subscriptions',
    label: 'Assinaturas',
    icon: () => h('svg', {
      class: 'w-4 h-4',
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        'fill-rule': 'evenodd',
        d: 'M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z',
        'clip-rule': 'evenodd'
      })
    ])
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    icon: () => h('svg', {
      class: 'w-4 h-4',
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        d: 'M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z'
      })
    ])
  },
  {
    path: '/test-ai',
    label: 'Test IA',
    icon: () => h('svg', {
      class: 'w-4 h-4',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      })
    ])
  }
]

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const exitAdmin = () => {
  router.push('/dashboard')
}
</script>
