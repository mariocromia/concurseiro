// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  css: ['~/assets/css/theme.css', '~/assets/css/z-index-layers.css'],

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
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  },

  app: {
    head: {
      title: 'PraPassar - Plataforma de Estudos',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plataforma de estudos para concursos e vestibulares com IA' },
        { name: 'color-scheme', content: 'dark light' }
      ],
      script: [
        {
          children: `
            // Critical: Apply theme IMMEDIATELY before any render
            (function() {
              try {
                const theme = localStorage.getItem('theme') ||
                             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            })();
          `,
          type: 'text/javascript',
          tagPosition: 'head'
        }
      ],
      style: [
        {
          children: `
            html { visibility: hidden; }
            html.dark, html.light { visibility: visible; }
          `,
          type: 'text/css'
        }
      ]
    }
  }
})
