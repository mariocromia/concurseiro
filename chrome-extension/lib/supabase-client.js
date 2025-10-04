// Supabase Client for Chrome Extension
// Import from CDN since extensions can't use npm packages directly

const SUPABASE_URL = 'https://qpzgsqjnbvsluwdvmftu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwemdzcWpuYnZzbHV3ZHZtZnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0ODM5NjMsImV4cCI6MjA0NjA1OTk2M30.I8uw3Y-EFVDOZ_oqR8yTH4qf4p3wqD9VTsgjFm1Msco'

// Load Supabase from CDN
if (typeof window !== 'undefined' && !window.supabase) {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
  script.onload = () => {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  document.head.appendChild(script)
}

// For background script (service worker)
if (typeof importScripts === 'function') {
  importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')
}

// Export client creation function
function createSupabaseClient() {
  if (typeof supabase !== 'undefined') {
    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return null
}

// Storage helpers
const storage = {
  async get(key) {
    const result = await chrome.storage.local.get([key])
    return result[key]
  },

  async set(key, value) {
    return await chrome.storage.local.set({ [key]: value })
  },

  async remove(key) {
    return await chrome.storage.local.remove([key])
  },

  async clear() {
    return await chrome.storage.local.clear()
  }
}

// Auth helpers
const auth = {
  async getSession() {
    return await storage.get('supabase_session')
  },

  async setSession(session) {
    return await storage.set('supabase_session', session)
  },

  async clearSession() {
    return await storage.remove('supabase_session')
  },

  async getUser() {
    const session = await this.getSession()
    return session?.user || null
  }
}
