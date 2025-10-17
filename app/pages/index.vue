<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Hero Section -->
    <LandingHero />

    <!-- Problem → Solution Section -->
    <LandingProblem />

    <!-- Features as Benefits -->
    <LandingFeatures />

    <!-- How It Works -->
    <LandingHowItWorks />

    <!-- Social Proof -->
    <LandingTestimonials />

    <!-- FAQ -->
    <LandingFAQ />

    <!-- Final CTA -->
    <LandingCTA />

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags for Conversion
useHead({
  title: 'PraPassar - Passe no seu Concurso em 2025 | Plataforma de Estudos com IA',
  meta: [
    {
      name: 'description',
      content: 'A única plataforma que une organização inteligente, método científico R1-R7 e Inteligência Artificial para sua aprovação em concursos e vestibulares. Comece grátis por 14 dias!'
    },
    {
      property: 'og:title',
      content: 'PraPassar - Passe no seu Concurso em 2025'
    },
    {
      property: 'og:description',
      content: 'Organização + Método Científico + IA = Sua Aprovação. 10.000+ aprovados confiam no PraPassar.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'PraPassar - Passe no seu Concurso em 2025'
    },
    {
      name: 'twitter:description',
      content: 'A única plataforma que une organização, ciência e IA para sua aprovação.'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://prapassar.com'
    }
  ]
})

// Redirect if already logged in
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) {
    navigateTo('/dashboard')
  }
})

// Track page view for analytics (ready for future integration)
onMounted(() => {
  if (process.client) {
    console.log('🎯 Landing page loaded - Conversion optimized')
  }
})
</script>

<style scoped>
/* Smooth scroll behavior for anchor links */
html {
  scroll-behavior: smooth;
}

/* Optimize animations for performance */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
