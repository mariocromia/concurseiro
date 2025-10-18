<template>
  <div :class="containerClass">
    <!-- Skeleton placeholder -->
    <div
      v-if="!isLoaded"
      :class="skeletonClass"
      class="animate-pulse bg-gray-300 dark:bg-gray-700 rounded"
    ></div>

    <!-- Logo image -->
    <img
      v-show="isLoaded"
      :src="logoSrc"
      :alt="alt"
      :class="imageClass"
      loading="lazy"
      @load="handleLoad"
      @error="handleError"
    >
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  alt: 'PraPassar Logo',
  className: ''
})

const { isDark } = useTheme()
const isLoaded = ref(false)
const hasError = ref(false)

// Select logo based on theme
const logoSrc = computed(() => {
  return isDark.value ? '/img/prapassar_logo1.png' : '/img/prapassar_logo2.png'
})

// Size mapping with consistent aspect ratio
const sizeClasses = {
  xs: { height: 'h-7', width: 'w-[84px]' },   // 7 * 12 = 84px (12:1 ratio)
  sm: { height: 'h-11', width: 'w-[132px]' },  // 11 * 12 = 132px
  md: { height: 'h-14', width: 'w-[168px]' },  // 14 * 12 = 168px
  lg: { height: 'h-20', width: 'w-[240px]' },  // 20 * 12 = 240px
  xl: { height: 'h-40', width: 'w-[480px]' }   // 40 * 12 = 480px
}

// Container class with aspect ratio
const containerClass = computed(() => {
  const { height, width } = sizeClasses[props.size]
  return `inline-block relative ${height} ${width} ${props.className}`
})

// Skeleton placeholder class
const skeletonClass = computed(() => {
  const { height, width } = sizeClasses[props.size]
  return `absolute inset-0 ${height} ${width}`
})

// Image class with object-fit to prevent distortion
const imageClass = computed(() => {
  const { height, width } = sizeClasses[props.size]
  return `${height} ${width} object-contain transition-opacity duration-300`
})

// Handle image load
const handleLoad = () => {
  isLoaded.value = true
}

// Handle image error
const handleError = () => {
  hasError.value = true
  isLoaded.value = true // Still show the broken image state
  console.warn(`Failed to load logo: ${logoSrc.value}`)
}

// Reset loaded state when logo changes
watch(logoSrc, () => {
  isLoaded.value = false
  hasError.value = false
})
</script>

<style scoped>
/* Ensure smooth loading transition */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Animation for skeleton */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
