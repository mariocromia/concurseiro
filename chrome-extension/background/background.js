// Background Service Worker - Main Logic
importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js')

const SUPABASE_URL = 'https://qpzgsqjnbvsluwdvmftu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwemdzcWpuYnZzbHV3ZHZtZnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0ODM5NjMsImV4cCI6MjA0NjA1OTk2M30.I8uw3Y-EFVDOZ_oqR8yTH4qf4p3wqD9VTsgjFm1Msco'

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
  const user = await getUser()
  if (!user) return []

  const { data } = await supabaseClient
    .from('user_block_settings')
    .select('blocked_sites, block_mode')
    .eq('user_id', user.id)
    .single()

  if (data) {
    blockedSites = data.blocked_sites || getDefaultBlockedSites(data.block_mode)
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
  if (!isStudyMode) return false
  return blockedSites.some(site => hostname.includes(site))
}

// Web Request Blocking
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url)

    if (isBlocked(url.hostname)) {
      // Inject block overlay
      if (details.type === 'main_frame') {
        chrome.tabs.sendMessage(details.tabId, {
          action: 'showBlockOverlay',
          site: url.hostname,
          sessionInfo: currentStudySession
        })
      }
      return { cancel: true }
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
)

// Study Session Monitoring
async function checkActiveSession() {
  const user = await getUser()
  if (!user) {
    isStudyMode = false
    return
  }

  const { data } = await supabaseClient
    .from('study_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (data) {
    currentStudySession = data
    isStudyMode = true
    await loadBlockedSites()
    startTracking()
  } else {
    currentStudySession = null
    isStudyMode = false
    stopTracking()
  }
}

// Check session every 30 seconds
setInterval(checkActiveSession, 30000)
checkActiveSession() // Initial check

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
  }
  return true // Required for async sendResponse
})

console.log('Concurseiro Extension background script loaded!')
