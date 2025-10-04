// Popup Script
console.log('Popup loaded!')

// Get study session status
async function loadStatus() {
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

// Load stats
async function loadStats() {
  const stats = await chrome.storage.local.get(['todayStudyTime', 'capturedCount', 'focusScore'])

  document.getElementById('today-study-time').textContent = formatTime(stats.todayStudyTime || 0)
  document.getElementById('captured-count').textContent = stats.capturedCount || 0
  document.getElementById('focus-score').textContent = `${stats.focusScore || 0}%`
}

function formatTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000)
  const minutes = Math.floor((milliseconds % 3600000) / 60000)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Button actions
document.getElementById('open-app-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' })
})

document.getElementById('settings-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage()
})

// Initialize
loadStatus()
loadStats()

// Refresh every 10 seconds
setInterval(() => {
  loadStatus()
  loadStats()
}, 10000)
