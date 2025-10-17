// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  css: ['~/assets/css/theme.css'],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/register', '/login', '/forgot-password', '/precos', '/checkout'],
    }
  },

  runtimeConfig: {
    asaasApiKey: process.env.ASAAS_API_KEY,
    asaasBaseUrl: process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3',
    asaasWebhookSecret: process.env.ASAAS_WEBHOOK_SECRET,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    }
  },

  app: {
    head: {
      title: 'PraPassar - Plataforma de Estudos',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plataforma de estudos para concursos e vestibulares com IA' }
      ]
    }
  }
})
