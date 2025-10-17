// Options Page Script

// Load saved settings
async function loadSettings() {
  const settings = await chrome.storage.local.get([
    'blockMode',
    'blockOnlyStudy',
    'blockedSites',
    'allowedSites',
    'trackingEnabled',
    'categorizationEnabled',
    'notificationsEnabled',
    'pomodoroNotifications',
    'captureNotifications',
    'autoDetect',
    'quickToolbar',
    'captureImages'
  ])

  // Block settings
  document.getElementById('block-mode').value = settings.blockMode || 'moderate'
  document.getElementById('block-only-study').checked = settings.blockOnlyStudy !== false
  document.getElementById('blocked-sites').value = (settings.blockedSites || []).join('\n')
  document.getElementById('allowed-sites').value = (settings.allowedSites || []).join('\n')

  // Tracking
  document.getElementById('tracking-enabled').checked = settings.trackingEnabled !== false
  document.getElementById('categorization-enabled').checked = settings.categorizationEnabled !== false

  // Notifications
  document.getElementById('notifications-enabled').checked = settings.notificationsEnabled !== false
  document.getElementById('pomodoro-notifications').checked = settings.pomodoroNotifications !== false
  document.getElementById('capture-notifications').checked = settings.captureNotifications !== false

  // Capture
  document.getElementById('auto-detect').checked = settings.autoDetect || false
  document.getElementById('quick-toolbar').checked = settings.quickToolbar !== false
  document.getElementById('capture-images').checked = settings.captureImages !== false
}

// Save settings
async function saveSettings() {
  const settings = {
    blockMode: document.getElementById('block-mode').value,
    blockOnlyStudy: document.getElementById('block-only-study').checked,
    blockedSites: document.getElementById('blocked-sites').value.split('\n').filter(s => s.trim()),
    allowedSites: document.getElementById('allowed-sites').value.split('\n').filter(s => s.trim()),
    trackingEnabled: document.getElementById('tracking-enabled').checked,
    categorizationEnabled: document.getElementById('categorization-enabled').checked,
    notificationsEnabled: document.getElementById('notifications-enabled').checked,
    pomodoroNotifications: document.getElementById('pomodoro-notifications').checked,
    captureNotifications: document.getElementById('capture-notifications').checked,
    autoDetect: document.getElementById('auto-detect').checked,
    quickToolbar: document.getElementById('quick-toolbar').checked,
    captureImages: document.getElementById('capture-images').checked
  }

  await chrome.storage.local.set(settings)

  // Show toast
  showToast('Configurações salvas com sucesso!')

  // Notify background script to reload settings
  chrome.runtime.sendMessage({ action: 'settingsUpdated' })
}

// Clear cache
async function clearCache() {
  if (confirm('Tem certeza que deseja limpar o cache local? Isso não afetará suas questões salvas no servidor.')) {
    const keysToKeep = ['blockMode', 'blockedSites', 'allowedSites']
    const all = await chrome.storage.local.get(null)
    const toRemove = Object.keys(all).filter(key => !keysToKeep.includes(key))

    await chrome.storage.local.remove(toRemove)
    showToast('Cache limpo com sucesso!')
  }
}

// Export data
async function exportData() {
  const data = await chrome.storage.local.get(null)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `concurseiro-extension-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()

  URL.revokeObjectURL(url)
  showToast('Dados exportados!')
}

// Reset settings
async function resetSettings() {
  if (confirm('Tem certeza que deseja restaurar todas as configurações padrão? Esta ação não pode ser desfeita.')) {
    await chrome.storage.local.clear()

    // Set defaults
    await chrome.storage.local.set({
      blockMode: 'moderate',
      blockOnlyStudy: true,
      trackingEnabled: true,
      categorizationEnabled: true,
      notificationsEnabled: true,
      pomodoroNotifications: true,
      captureNotifications: true,
      quickToolbar: true,
      captureImages: true
    })

    await loadSettings()
    showToast('Configurações restauradas!')
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.remove('hidden')
  toast.classList.add('show')

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.classList.add('hidden'), 300)
  }, 3000)
}

// Event listeners
document.getElementById('save-btn').addEventListener('click', saveSettings)
document.getElementById('clear-cache-btn').addEventListener('click', clearCache)
document.getElementById('export-data-btn').addEventListener('click', exportData)
document.getElementById('reset-settings-btn').addEventListener('click', resetSettings)

// Load settings on page load
loadSettings()
