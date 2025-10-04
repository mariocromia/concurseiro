// Load Supabase from local file
importScripts = undefined // Prevent worker context
const script = document.createElement('script')
script.src = chrome.runtime.getURL('lib/supabase.js')
script.onload = initializePopup
document.head.appendChild(script)

const SUPABASE_URL = 'https://ubeivchkuoptmhkcglny.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

let supabaseClient = null

function initializePopup() {
  console.log('[Popup] Initializing...')

  // Create Supabase client
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Check if user is authenticated
  checkAuth()

  // Setup event listeners
  setupEventListeners()
}

async function checkAuth() {
  console.log('[Popup] Checking authentication...')

  // Get session from storage
  const { supabase_session } = await chrome.storage.local.get(['supabase_session'])

  if (supabase_session && supabase_session.access_token) {
    console.log('[Popup] User is authenticated')

    // Set session in Supabase client
    await supabaseClient.auth.setSession({
      access_token: supabase_session.access_token,
      refresh_token: supabase_session.refresh_token
    })

    showMainScreen()
    loadDashboardData()
  } else {
    console.log('[Popup] User is not authenticated')
    showLoginScreen()
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden')
  document.getElementById('main-screen').classList.add('hidden')
}

function showMainScreen() {
  document.getElementById('login-screen').classList.add('hidden')
  document.getElementById('main-screen').classList.remove('hidden')
}

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('login-form')
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin)
  }

  // Open web app button
  const openWebAppBtn = document.getElementById('open-web-app-btn')
  if (openWebAppBtn) {
    openWebAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000' })
    })
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }

  // Open app button
  const openAppBtn = document.getElementById('open-app-btn')
  if (openAppBtn) {
    openAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000/dashboard' })
    })
  }

  // Settings button
  const settingsBtn = document.getElementById('settings-btn')
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage()
    })
  }
}

async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const errorDiv = document.getElementById('login-error')
  const loginBtn = document.getElementById('login-btn')
  const loginBtnText = document.getElementById('login-btn-text')
  const loginBtnLoader = document.getElementById('login-btn-loader')

  // Show loading
  loginBtn.disabled = true
  loginBtnText.classList.add('hidden')
  loginBtnLoader.classList.remove('hidden')
  errorDiv.classList.add('hidden')

  try {
    console.log('[Popup] Attempting login...')

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    console.log('[Popup] Login successful!')

    // Save session to storage
    await chrome.storage.local.set({
      supabase_session: data.session
    })

    // Notify background script about the new session
    chrome.runtime.sendMessage({
      type: 'AUTH_SESSION_UPDATED',
      session: data.session
    })

    // Enviar sessão para o app web (se estiver aberto)
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (tab.url.includes('localhost:3000') || tab.url.includes('localhost:3001') || tab.url.includes('localhost:3002'))) {
          chrome.tabs.sendMessage(tab.id, {
            source: 'concurseiro-extension',
            type: 'AUTH_SESSION_FROM_EXTENSION',
            session: {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            }
          }).catch(() => {
            console.log('[Popup] App não está aberto ou não conseguiu enviar mensagem')
          })
        }
      })
    })

    // Show main screen
    showMainScreen()
    loadDashboardData()

  } catch (error) {
    console.error('[Popup] Login error:', error)

    let errorMessage = 'Erro ao fazer login. Tente novamente.'

    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'E-mail ou senha incorretos.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Por favor, confirme seu e-mail primeiro.'
    }

    errorDiv.textContent = errorMessage
    errorDiv.classList.remove('hidden')

  } finally {
    // Hide loading
    loginBtn.disabled = false
    loginBtnText.classList.remove('hidden')
    loginBtnLoader.classList.add('hidden')
  }
}

async function handleLogout() {
  console.log('[Popup] Logging out...')

  // Sign out from Supabase
  await supabaseClient.auth.signOut()

  // Clear storage
  await chrome.storage.local.remove(['supabase_session'])

  // Notify background script
  chrome.runtime.sendMessage({
    type: 'AUTH_LOGOUT'
  })

  // Show login screen
  showLoginScreen()
}

async function loadDashboardData() {
  await loadStatus()
  await loadStats()

  // Refresh every 10 seconds
  setInterval(async () => {
    await loadStatus()
    await loadStats()
  }, 10000)
}

async function loadStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStudySession' })

    if (response.isStudyMode && response.session) {
      document.getElementById('study-active').classList.remove('hidden')
      document.getElementById('study-inactive').classList.add('hidden')

      const typeLabels = {
        content: 'Estudo de Conteúdo',
        questions: 'Resolução de Questões',
        review: 'Revisão'
      }

      document.getElementById('study-type').textContent = typeLabels[response.session.type] || response.session.type

      const timeRemaining = calculateTimeRemaining(response.session.end_time)
      document.getElementById('time-remaining').textContent = `Tempo restante: ${timeRemaining}`

    } else {
      document.getElementById('study-active').classList.add('hidden')
      document.getElementById('study-inactive').classList.remove('hidden')
    }
  } catch (error) {
    console.error('[Popup] Error loading status:', error)
  }
}

function calculateTimeRemaining(endTime) {
  const end = new Date(endTime).getTime()
  const now = Date.now()
  const diff = end - now

  if (diff <= 0) return '0 min'

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${minutes}min`
}

async function loadStats() {
  try {
    const stats = await chrome.storage.local.get(['todayStudyTime', 'capturedCount', 'focusScore'])

    document.getElementById('today-study-time').textContent = formatTime(stats.todayStudyTime || 0)
    document.getElementById('captured-count').textContent = stats.capturedCount || 0
    document.getElementById('focus-score').textContent = `${stats.focusScore || 0}%`
  } catch (error) {
    console.error('[Popup] Error loading stats:', error)
  }
}

function formatTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000)
  const minutes = Math.floor((milliseconds % 3600000) / 60000)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

console.log('[Popup] Script loaded, waiting for Supabase...')
