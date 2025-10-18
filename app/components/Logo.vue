<template>
  <div :class="containerClass">
    <!-- Logo image - always visible, no skeleton needed for critical branding -->
    <img
      :src="logoSrc"
      :alt="alt"
      :class="imageClass"
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

// Select logo based on theme
const logoSrc = computed(() => {
  return isDark.value ? '/img/prapassar_logo1.png' : '/img/prapassar_logo2.png'
})

// Size mapping with consistent aspect ratio (12:1)
const sizeClasses = {
  xs: { height: 'h-7', width: 'w-[84px]' },   // 7 * 12 = 84px
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

// Image class with object-fit to prevent distortion
const imageClass = computed(() => {
  const { height, width } = sizeClasses[props.size]
  return `${height} ${width} object-contain transition-opacity duration-300`
})

// Handle image load (for potential future use)
const handleLoad = () => {
  // Image loaded successfully
}

// Handle image error
const handleError = () => {
  console.warn(`Failed to load logo: ${logoSrc.value}`)
}
</script>

<style scoped>
/* Ensure crisp logo rendering */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
</style>
