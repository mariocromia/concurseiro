// Background Service Worker - Main Logic
importScripts('supabase.js')

const SUPABASE_URL = 'https://ubeivchkuoptmhkcglny.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// State management
let currentStudySession = null
let blockedSites = []
let trackingData = {}
let isStudyMode = false

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Concurseiro Extension installed!')

  // Create context menus
  createContextMenus()

  // Set default settings
  chrome.storage.local.set({
    blockMode: 'moderate',
    trackingEnabled: true,
    notificationsEnabled: true
  })
})

// Restore session on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Extension] Extension starting up...')

  // Try to restore Supabase session from storage
  const { supabase_session, currentStudySession: savedSession, isStudyMode: savedStudyMode } = await chrome.storage.local.get(['supabase_session', 'currentStudySession', 'isStudyMode'])

  if (supabase_session) {
    console.log('[Extension] Restoring Supabase session from storage...')
    try {
      await supabaseClient.auth.setSession(supabase_session)
      console.log('[Extension] ✅ Session restored successfully!')
    } catch (error) {
      console.error('[Extension] ❌ Error restoring session:', error)
    }
  } else {
    console.log('[Extension] ℹ️ No stored session found')
  }

  // Restore study session state
  if (savedSession && savedStudyMode) {
    console.log('[Extension] ✅ Restoring study session:', savedSession)
    currentStudySession = savedSession
    isStudyMode = savedStudyMode
    chrome.action.setBadgeText({ text: '📚' })
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' })
    loadBlockedSites()
  }
})

// Also listen for messages from web app (auth sync)
chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'AUTH_SESSION') {
    console.log('[Extension] 🔐 Session received from web app!')

    // Save session
    await chrome.storage.local.set({
      supabase_session: request.session
    })

    // Authenticate Supabase
    await supabaseClient.auth.setSession(request.session)

    // Check for active session immediately
    await checkActiveSession()

    // Setup Realtime
    await setupRealtimeSubscription()

    sendResponse({ success: true })
  }
  return true
})

// Create Context Menus
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'add-to-notebook',
      title: 'Adicionar ao Caderno Concurseiro',
      contexts: ['selection']
    })

    chrome.contextMenus.create({
      id: 'add-to-review',
      title: 'Salvar para Revisão',
      contexts: ['selection']
    })

    chrome.contextMenus.create({
      id: 'create-flashcard',
      title: 'Criar Flashcard',
      contexts: ['selection']
    })

    chrome.contextMenus.create({
      id: 'mark-as-error',
      title: 'Adicionar aos Erros',
      contexts: ['selection']
    })
  })
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'add-to-notebook') {
    await handleAddToNotebook(info, tab)
  } else if (info.menuItemId === 'add-to-review') {
    await handleAddToReview(info, tab)
  } else if (info.menuItemId === 'create-flashcard') {
    await handleCreateFlashcard(info, tab)
  } else if (info.menuItemId === 'mark-as-error') {
    await handleMarkAsError(info, tab)
  }
})

async function handleAddToNotebook(info, tab) {
  // Send message to content script to analyze selection
  const response = await chrome.tabs.sendMessage(tab.id, {
    action: 'analyzeSelection',
    text: info.selectionText
  })

  // Store captured content temporarily
  await chrome.storage.local.set({
    capturedContent: {
      ...response,
      sourceUrl: tab.url,
      sourceTitle: tab.title,
      capturedAt: new Date().toISOString()
    }
  })

  // Open capture popup
  chrome.windows.create({
    url: 'popup/popup-capture.html',
    type: 'popup',
    width: 600,
    height: 700
  })
}

async function handleAddToReview(info, tab) {
  const user = await getUser()
  if (!user) {
    showNotification('Erro', 'Você precisa estar logado no app web primeiro!')
    return
  }

  // Save directly to review list
  const { data, error } = await supabaseClient
    .from('review_items')
    .insert([{
      user_id: user.id,
      content: info.selectionText,
      source_url: tab.url,
      source_title: tab.title,
      type: 'review'
    }])

  if (error) {
    showNotification('Erro', 'Falha ao salvar para revisão')
  } else {
    showNotification('Sucesso', 'Conteúdo salvo para revisão!')
  }
}

async function handleCreateFlashcard(info, tab) {
  // Store and open flashcard creator
  await chrome.storage.local.set({
    flashcardContent: {
      text: info.selectionText,
      sourceUrl: tab.url
    }
  })

  chrome.windows.create({
    url: 'popup/popup-flashcard.html',
    type: 'popup',
    width: 500,
    height: 400
  })
}

async function handleMarkAsError(info, tab) {
  const user = await getUser()
  if (!user) {
    showNotification('Erro', 'Você precisa estar logado!')
    return
  }

  const { error } = await supabaseClient
    .from('error_log')
    .insert([{
      user_id: user.id,
      content: info.selectionText,
      source_url: tab.url,
      source_title: tab.title
    }])

  if (!error) {
    showNotification('Sucesso', 'Erro adicionado à lista de revisão!')
  }
}

// Site Blocking System
async function loadBlockedSites() {
  console.log('[Extension] 🔍 Loading blocked sites...')
  const user = await getUser()
  if (!user) {
    console.log('[Extension] ⚠️ No user, usando sites padrão')
    blockedSites = getDefaultBlockedSites('moderate')
    console.log('[Extension] 📋 Sites bloqueados:', blockedSites)
    return blockedSites
  }

  const { data, error } = await supabaseClient
    .from('user_block_settings')
    .select('blocked_sites, block_mode')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.log('[Extension] ⚠️ Erro ao buscar configurações, usando padrão:', error)
    blockedSites = getDefaultBlockedSites('moderate')
  } else if (data) {
    blockedSites = data.blocked_sites || getDefaultBlockedSites(data.block_mode)
    console.log('[Extension] 📋 Sites bloqueados carregados:', blockedSites.length, 'sites')
    console.log('[Extension] 🚫 Lista:', blockedSites)
  }

  return blockedSites
}

function getDefaultBlockedSites(mode = 'moderate') {
  const sites = {
    strict: [
      'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
      'netflix.com', 'primevideo.com', 'youtube.com', 'reddit.com',
      'twitch.tv', 'discord.com', 'whatsapp.com', 'telegram.org'
    ],
    moderate: [
      'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
      'netflix.com', 'primevideo.com'
    ],
    custom: []
  }

  return sites[mode] || sites.moderate
}

function isBlocked(hostname) {
  if (!isStudyMode) {
    console.log('[Extension] ℹ️ Not in study mode, not blocking:', hostname)
    return false
  }
  const blocked = blockedSites.some(site => hostname.includes(site))
  console.log('[Extension] 🔍 Checking', hostname, '→', blocked ? '🚫 BLOCKED' : '✅ ALLOWED')
  return blocked
}

// Site Blocking usando chrome.tabs (compatível com Manifest V3)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Só verificar quando a URL mudar
  if (changeInfo.url) {
    console.log('[Extension] 📍 URL changed:', changeInfo.url, '| Study mode:', isStudyMode, '| Blocked sites:', blockedSites.length)

    if (isStudyMode) {
      try {
        const url = new URL(changeInfo.url)

        if (isBlocked(url.hostname)) {
          console.log('[Extension] 🚫 BLOQUEANDO SITE:', url.hostname)

          // Redirecionar para página de bloqueio
          chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL('assets/block-overlay.html') + '?site=' + encodeURIComponent(url.hostname)
          })
        }
      } catch (error) {
        // URL inválida, ignorar
        console.log('[Extension] ⚠️ Invalid URL:', error)
      }
    }
  }
})

// Study Session Monitoring - Improved with Realtime
let realtimeChannel = null

async function setupRealtimeSubscription() {
  const user = await getUser()
  if (!user) {
    console.log('[Extension] Cannot setup realtime - no user')
    return
  }

  // Remove existing channel
  if (realtimeChannel) {
    await supabaseClient.removeChannel(realtimeChannel)
  }

  console.log('[Extension] ✅ Setting up Realtime subscription for user:', user.id)

  // Subscribe to study_sessions changes
  realtimeChannel = supabaseClient
    .channel('study-sessions-extension')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'study_sessions',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('[Extension] 🔥 Realtime event received:', payload.eventType)

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const session = payload.new

          if (session.status === 'active') {
            console.log('[Extension] ✅ Session ACTIVE via Realtime!')
            handleSessionStarted(session)
          } else {
            console.log('[Extension] ⏸️ Session INACTIVE via Realtime')
            handleSessionEnded()
          }
        } else if (payload.eventType === 'DELETE') {
          console.log('[Extension] 🗑️ Session DELETED via Realtime')
          handleSessionEnded()
        }
      }
    )
    .subscribe((status) => {
      console.log('[Extension] Realtime connection status:', status)

      if (status === 'SUBSCRIBED') {
        console.log('[Extension] ✅ Realtime successfully connected!')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Extension] ❌ Realtime connection error!')
      }
    })
}

function handleSessionStarted(session) {
  currentStudySession = session
  isStudyMode = true

  loadBlockedSites()
  startTracking()

  // Update badge
  chrome.action.setBadgeText({ text: '🔥' })
  chrome.action.setBadgeBackgroundColor({ color: '#22d3ee' })

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title: 'Sessão de Estudo Iniciada! 🔥',
    message: 'Modo foco ativado. Sites de distração serão bloqueados.',
    priority: 2
  })

  console.log('[Extension] Session started successfully!')
}

function handleSessionEnded() {
  console.log('[Extension] ⛔ handleSessionEnded() chamado - DESATIVANDO isStudyMode')
  console.trace('[Extension] Stack trace:')
  currentStudySession = null
  isStudyMode = false

  stopTracking()

  // Clear badge
  chrome.action.setBadgeText({ text: '' })

  console.log('[Extension] Session ended')
}

async function checkActiveSession() {
  console.log('[Extension] 🔍 Checking for active session...')

  const user = await getUser()
  if (!user) {
    console.log('[Extension] ❌ No user authenticated - DESATIVANDO isStudyMode (checkActiveSession)')
    isStudyMode = false
    return
  }

  console.log('[Extension] ✅ User authenticated:', user.id)

  // A sessão ativa será recebida via mensagem do app web
  // Não precisamos consultar o banco aqui
  console.log('[Extension] ℹ️ Aguardando informação de sessão do app web')
}

// Check session on authentication (called from handleAuthSessionUpdate)

// Setup Realtime subscription after initial check
setTimeout(() => {
  setupRealtimeSubscription()
}, 2000)

// Time Tracking
let currentTab = null
let sessionStartTime = null

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (currentTab) {
    await recordTimeSpent(currentTab)
  }

  const tab = await chrome.tabs.get(activeInfo.tabId)
  currentTab = {
    url: tab.url,
    startTime: Date.now(),
    tabId: tab.id
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentTab && currentTab.tabId === tabId) {
    recordTimeSpent(currentTab)
    currentTab = {
      url: changeInfo.url,
      startTime: Date.now(),
      tabId: tabId
    }
  }
})

async function recordTimeSpent(tab) {
  if (!isStudyMode || !currentStudySession) return

  const timeSpent = Date.now() - tab.startTime
  if (timeSpent < 1000) return // Ignore very short visits

  try {
    const url = new URL(tab.url)
    const domain = url.hostname

    // Categorize site
    const category = categorizeSite(domain)

    // Store in tracking data
    if (!trackingData[domain]) {
      trackingData[domain] = { time: 0, category }
    }
    trackingData[domain].time += timeSpent

    // Sync to Supabase every 5 minutes
    const shouldSync = Math.random() < 0.1 // 10% chance each time
    if (shouldSync) {
      await syncTrackingData()
    }
  } catch (e) {
    console.error('Error recording time:', e)
  }
}

function categorizeSite(domain) {
  const educational = [
    'qconcursos.com', 'tecconcursos.com.br', 'grancursosonline.com.br',
    'estrategiaconcursos.com.br', 'planalto.gov.br', 'stf.jus.br',
    'google.com', 'wikipedia.org', 'youtube.com'
  ]

  const distraction = [
    'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
    'netflix.com', 'primevideo.com', 'reddit.com', 'twitch.tv'
  ]

  if (educational.some(site => domain.includes(site))) return 'educational'
  if (distraction.some(site => domain.includes(site))) return 'distraction'
  return 'neutral'
}

async function syncTrackingData() {
  const user = await getUser()
  if (!user || !currentStudySession) return

  const entries = []
  for (const [domain, data] of Object.entries(trackingData)) {
    entries.push({
      user_id: user.id,
      session_id: currentStudySession.id,
      site_domain: domain,
      time_spent: Math.floor(data.time / 1000), // Convert to seconds
      site_category: data.category,
      visited_at: new Date().toISOString()
    })
  }

  if (entries.length > 0) {
    const { error } = await supabaseClient
      .from('browsing_statistics')
      .insert(entries)

    if (!error) {
      trackingData = {} // Clear after successful sync
    }
  }
}

function startTracking() {
  console.log('Started tracking for session:', currentStudySession.id)
}

function stopTracking() {
  if (Object.keys(trackingData).length > 0) {
    syncTrackingData()
  }
  console.log('Stopped tracking')
}

// Notifications
function showNotification(title, message, buttons = []) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title: title,
    message: message,
    priority: 2,
    buttons: buttons
  })
}

// Pomodoro Timer Notifications
function checkPomodoroTimer() {
  if (!currentStudySession) return

  const endTime = new Date(currentStudySession.end_time).getTime()
  const now = Date.now()
  const remaining = endTime - now
  const minutes = Math.floor(remaining / 60000)

  // 5-minute warning
  if (minutes === 5 && !currentStudySession.notified5min) {
    showNotification(
      'Sessão terminando',
      'Faltam 5 minutos para o fim da sua sessão de estudo!'
    )
    currentStudySession.notified5min = true
  }

  // Session ended
  if (remaining <= 0 && !currentStudySession.notifiedEnd) {
    showNotification(
      'Sessão finalizada! 🎉',
      'Hora de fazer uma pausa!',
      [
        { title: 'Iniciar Pausa' },
        { title: 'Continuar Estudando' }
      ]
    )
    currentStudySession.notifiedEnd = true
    isStudyMode = false
  }
}

setInterval(checkPomodoroTimer, 30000) // Check every 30 seconds

// Helper functions
async function getUser() {
  const session = await chrome.storage.local.get(['supabase_session'])
  return session.supabase_session?.user || null
}

// Message handling from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStudySession') {
    sendResponse({ session: currentStudySession, isStudyMode })
  } else if (request.action === 'endSession') {
    isStudyMode = false
    currentStudySession = null
    sendResponse({ success: true })
  } else if (request.type === 'AUTH_SESSION_UPDATED') {
    console.log('[Extension] 🔐 Auth session updated')
    handleAuthSessionUpdate(request.session)
    sendResponse({ success: true })
  } else if (request.type === 'STUDY_SESSION_STARTED') {
    console.log('[Extension] ▶️ Study session STARTED', request.data)
    currentStudySession = request.data
    isStudyMode = true

    // Salvar no storage para persistir
    chrome.storage.local.set({
      currentStudySession: request.data,
      isStudyMode: true
    })

    chrome.action.setBadgeText({ text: '📚' })
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' })

    // Carregar sites bloqueados
    loadBlockedSites()

    sendResponse({ success: true })
  } else if (request.type === 'STUDY_SESSION_PAUSED') {
    console.log('[Extension] ⏸️ Study session PAUSED')
    isStudyMode = false
    chrome.storage.local.set({ isStudyMode: false })
    chrome.action.setBadgeText({ text: '⏸️' })
    sendResponse({ success: true })
  } else if (request.type === 'STUDY_SESSION_RESUMED') {
    console.log('[Extension] ▶️ Study session RESUMED')
    isStudyMode = true
    chrome.storage.local.set({ isStudyMode: true })
    chrome.action.setBadgeText({ text: '📚' })
    sendResponse({ success: true })
  } else if (request.type === 'STUDY_SESSION_STOPPED') {
    console.log('[Extension] ⏹️ Study session STOPPED', request.data)
    isStudyMode = false
    currentStudySession = null
    chrome.storage.local.set({
      isStudyMode: false,
      currentStudySession: null
    })
    chrome.action.setBadgeText({ text: '' })
    sendResponse({ success: true })
  } else if (request.type === 'AUTH_LOGOUT') {
    console.log('[Extension] 👋 User logged out')
    handleAuthLogout()
    sendResponse({ success: true })
  }
  return true // Required for async sendResponse
})

async function handleAuthSessionUpdate(session) {
  console.log('[Extension] 🔐 New session received!')

  // Set session in Supabase client
  await supabaseClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  })

  // Check for active session immediately
  await checkActiveSession()

  // Setup Realtime
  await setupRealtimeSubscription()
}

function handleAuthLogout() {
  console.log('[Extension] 👋 User logged out - DESATIVANDO isStudyMode (logout)')

  // Clear session
  currentStudySession = null
  isStudyMode = false

  // Clear badge
  chrome.action.setBadgeText({ text: '' })

  // Remove realtime subscription
  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
}

console.log('Concurseiro Extension background script loaded!')
