<template>
  <div>
    <!-- WhatsApp Floating Button -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 scale-0"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-0"
    >
      <div
        v-if="isVisible"
        class="fixed bottom-6 right-6 z-50"
      >
        <!-- Main Button -->
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 cursor-pointer"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
        >
          <!-- WhatsApp Icon -->
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>

          <!-- Pulse Animation -->
          <span class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
        </a>

        <!-- Tooltip -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
        >
          <div
            v-if="showTooltip"
            class="absolute right-20 top-1/2 -translate-y-1/2 bg-dark-800 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap border border-dark-600"
          >
            <div class="text-sm font-medium">Fale conosco no WhatsApp!</div>
            <div class="text-xs text-gray-400 mt-0.5">Estamos online</div>
            <!-- Arrow -->
            <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div class="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-dark-800"></div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  phoneNumber: {
    type: String,
    default: '+5521997808370'
  },
  message: {
    type: String,
    default: 'Olá! Preciso de ajuda com o Concurseiro.'
  }
})

const isVisible = ref(false)
const showTooltip = ref(false)

const whatsappUrl = computed(() => {
  const encodedMessage = encodeURIComponent(props.message)
  return `https://wa.me/${props.phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
})

// Show button after a delay
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 1000)
})
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
