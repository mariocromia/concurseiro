// Supabase Client for Chrome Extension
// Import from CDN since extensions can't use npm packages directly

const SUPABASE_URL = 'https://ubeivchkuoptmhkcglny.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

// Load Supabase from local file
if (typeof window !== 'undefined' && !window.supabase) {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('lib/supabase.js')
  script.onload = () => {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  document.head.appendChild(script)
}

// For background script (service worker)
if (typeof importScripts === 'function') {
  importScripts('lib/supabase.js')
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
