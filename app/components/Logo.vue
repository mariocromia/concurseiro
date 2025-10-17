<template>
  <img
    :src="logoSrc"
    :alt="alt"
    :class="className"
  >
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

// Size mapping
const sizeClasses = {
  xs: 'h-6',
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-32'
}

const className = computed(() => {
  const baseClass = 'w-auto transition-opacity duration-300'
  const sizeClass = sizeClasses[props.size]
  return `${baseClass} ${sizeClass} ${props.className}`
})
</script>
