// Content Script - Runs on all pages
console.log('Concurseiro Extension content script loaded!')

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeSelection') {
    const result = analyzeCurrentSelection()
    sendResponse(result)
  } else if (request.action === 'showBlockOverlay') {
    showBlockOverlay(request.site, request.sessionInfo)
    sendResponse({ success: true })
  }
  return true
})

// Analyze current text selection
function analyzeCurrentSelection() {
  try {
    const selection = window.getSelection()
    const selectedText = selection.toString()

    if (!selectedText) {
      return { error: 'No text selected' }
    }

    // Get HTML of selection
    const range = selection.getRangeAt(0)
    const container = document.createElement('div')
    container.appendChild(range.cloneContents())
    const selectedHTML = container.innerHTML

    // Use QuestionDetector
    const detector = new QuestionDetector(selectedText, selectedHTML)
    const analysis = detector.analyze()

    return analysis
  } catch (error) {
    console.error('Error analyzing selection:', error)
    return { error: error.message }
  }
}

// Show block overlay when site is blocked
function showBlockOverlay(siteName, sessionInfo) {
  // Remove any existing overlay
  const existing = document.getElementById('concurseiro-block-overlay')
  if (existing) existing.remove()

  // Create overlay
  const overlay = document.createElement('div')
  overlay.id = 'concurseiro-block-overlay'
  overlay.className = 'concurseiro-block-overlay'

  const timeRemaining = sessionInfo ? calculateTimeRemaining(sessionInfo.end_time) : 'N/A'

  overlay.innerHTML = `
    <div class="concurseiro-block-content">
      <div class="concurseiro-block-icon">🚫</div>
      <h1 class="concurseiro-block-title">Site Bloqueado</h1>
      <p class="concurseiro-block-message">
        Você está em uma sessão de estudo ativa.
      </p>
      <div class="concurseiro-session-info">
        ${sessionInfo ? `
          <p><strong>Tipo:</strong> ${getStudyTypeLabel(sessionInfo.type)}</p>
          <p><strong>Tempo restante:</strong> ${timeRemaining}</p>
        ` : ''}
      </div>
      <div class="concurseiro-block-actions">
        <button id="concurseiro-end-session-btn" class="concurseiro-btn-secondary">
          Encerrar Sessão
        </button>
        <button id="concurseiro-close-tab-btn" class="concurseiro-btn-primary">
          Fechar Aba
        </button>
      </div>
      <p class="concurseiro-block-footer">
        Mantenha o foco nos seus estudos! 📚
      </p>
    </div>
  `

  document.body.appendChild(overlay)

  // Add event listeners
  document.getElementById('concurseiro-end-session-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'endSession' }, (response) => {
      if (response.success) {
        overlay.remove()
        location.reload()
      }
    })
  })

  document.getElementById('concurseiro-close-tab-btn').addEventListener('click', () => {
    window.close()
  })
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

function getStudyTypeLabel(type) {
  const labels = {
    content: 'Estudo de Conteúdo',
    questions: 'Resolução de Questões',
    review: 'Revisão'
  }
  return labels[type] || type
}

// Inject custom styles
const style = document.createElement('style')
style.textContent = `
  /* Concurseiro Extension Styles */
  .concurseiro-highlight {
    background-color: #fef08a !important;
    padding: 2px 4px !important;
    border-radius: 2px !important;
  }

  .concurseiro-block-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: system-ui, -apple-system, sans-serif !important;
  }

  .concurseiro-block-content {
    background: rgba(30, 41, 59, 0.95) !important;
    border: 2px solid #475569 !important;
    border-radius: 16px !important;
    padding: 48px !important;
    max-width: 500px !important;
    text-align: center !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  }

  .concurseiro-block-icon {
    font-size: 64px !important;
    margin-bottom: 24px !important;
  }

  .concurseiro-block-title {
    font-size: 32px !important;
    font-weight: 700 !important;
    color: #f1f5f9 !important;
    margin: 0 0 16px 0 !important;
  }

  .concurseiro-block-message {
    font-size: 18px !important;
    color: #cbd5e1 !important;
    margin: 0 0 24px 0 !important;
    line-height: 1.6 !important;
  }

  .concurseiro-session-info {
    background: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid #334155 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    margin: 24px 0 !important;
  }

  .concurseiro-session-info p {
    font-size: 16px !important;
    color: #e2e8f0 !important;
    margin: 8px 0 !important;
  }

  .concurseiro-session-info strong {
    color: #22d3ee !important;
  }

  .concurseiro-block-actions {
    display: flex !important;
    gap: 12px !important;
    margin-top: 32px !important;
    justify-content: center !important;
  }

  .concurseiro-btn-primary,
  .concurseiro-btn-secondary {
    padding: 12px 24px !important;
    border-radius: 8px !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    border: none !important;
  }

  .concurseiro-btn-primary {
    background: #22d3ee !important;
    color: #0f172a !important;
  }

  .concurseiro-btn-primary:hover {
    background: #06b6d4 !important;
    transform: translateY(-2px) !important;
  }

  .concurseiro-btn-secondary {
    background: transparent !important;
    border: 2px solid #475569 !important;
    color: #cbd5e1 !important;
  }

  .concurseiro-btn-secondary:hover {
    background: #334155 !important;
    border-color: #64748b !important;
  }

  .concurseiro-block-footer {
    font-size: 14px !important;
    color: #94a3b8 !important;
    margin-top: 24px !important;
    font-style: italic !important;
  }
`
document.head.appendChild(style)
