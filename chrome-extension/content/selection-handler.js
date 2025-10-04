// Selection Handler - Manages text selection events

let selectionTimeout = null

// Monitor text selection
document.addEventListener('mouseup', handleSelectionEnd)
document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift' || e.key === 'Control') {
    handleSelectionEnd()
  }
})

function handleSelectionEnd() {
  clearTimeout(selectionTimeout)

  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()

    if (selectedText.length > 20) {
      // Text is long enough to potentially be a question
      showQuickActions(selection)
    } else {
      hideQuickActions()
    }
  }, 300)
}

function showQuickActions(selection) {
  // Remove existing toolbar
  hideQuickActions()

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  // Create quick action toolbar
  const toolbar = document.createElement('div')
  toolbar.id = 'concurseiro-quick-toolbar'
  toolbar.className = 'concurseiro-quick-toolbar'
  toolbar.innerHTML = `
    <button class="concurseiro-quick-btn" data-action="add-notebook" title="Adicionar ao Caderno">
      📓
    </button>
    <button class="concurseiro-quick-btn" data-action="add-review" title="Salvar para Revisão">
      🔖
    </button>
    <button class="concurseiro-quick-btn" data-action="create-flashcard" title="Criar Flashcard">
      🃏
    </button>
    <button class="concurseiro-quick-btn" data-action="highlight" title="Destacar">
      ✨
    </button>
  `

  // Position toolbar above selection
  toolbar.style.position = 'fixed'
  toolbar.style.top = `${rect.top + window.scrollY - 50}px`
  toolbar.style.left = `${rect.left + (rect.width / 2)}px`
  toolbar.style.transform = 'translateX(-50%)'

  document.body.appendChild(toolbar)

  // Add click handlers
  toolbar.querySelectorAll('.concurseiro-quick-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()

      const action = btn.dataset.action
      await handleQuickAction(action, selection)
    })
  })

  // Hide toolbar when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', hideQuickActions, { once: true })
  }, 100)
}

function hideQuickActions() {
  const toolbar = document.getElementById('concurseiro-quick-toolbar')
  if (toolbar) toolbar.remove()
}

async function handleQuickAction(action, selection) {
  const selectedText = selection.toString()

  if (action === 'add-notebook') {
    // Trigger context menu action
    chrome.runtime.sendMessage({
      action: 'contextMenuAction',
      menuId: 'add-to-notebook',
      text: selectedText
    })
  } else if (action === 'add-review') {
    chrome.runtime.sendMessage({
      action: 'contextMenuAction',
      menuId: 'add-to-review',
      text: selectedText
    })
  } else if (action === 'create-flashcard') {
    chrome.runtime.sendMessage({
      action: 'contextMenuAction',
      menuId: 'create-flashcard',
      text: selectedText
    })
  } else if (action === 'highlight') {
    highlightSelection(selection)
  }

  hideQuickActions()
}

function highlightSelection(selection) {
  try {
    const range = selection.getRangeAt(0)
    const span = document.createElement('span')
    span.className = 'concurseiro-highlight'
    range.surroundContents(span)

    // Save highlight
    saveHighlight({
      text: selection.toString(),
      url: window.location.href,
      xpath: getXPath(span)
    })
  } catch (e) {
    console.error('Failed to highlight:', e)
  }
}

function getXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`
  }

  const parts = []
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 0
    let sibling = element.previousSibling

    while (sibling) {
      if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) {
        sibling = sibling.previousSibling
        continue
      }
      if (sibling.nodeName === element.nodeName) {
        index++
      }
      sibling = sibling.previousSibling
    }

    const tagName = element.nodeName.toLowerCase()
    const pathIndex = index ? `[${index + 1}]` : ''
    parts.unshift(tagName + pathIndex)

    element = element.parentNode
  }

  return parts.length ? `/${parts.join('/')}` : ''
}

async function saveHighlight(highlightData) {
  try {
    await chrome.runtime.sendMessage({
      action: 'saveHighlight',
      data: highlightData
    })
  } catch (e) {
    console.error('Failed to save highlight:', e)
  }
}

// Add quick toolbar styles
const toolbarStyle = document.createElement('style')
toolbarStyle.textContent = `
  .concurseiro-quick-toolbar {
    background: rgba(15, 23, 42, 0.95) !important;
    border: 1px solid #334155 !important;
    border-radius: 8px !important;
    padding: 6px !important;
    display: flex !important;
    gap: 4px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
    z-index: 2147483646 !important;
    backdrop-filter: blur(8px) !important;
  }

  .concurseiro-quick-btn {
    width: 36px !important;
    height: 36px !important;
    border: none !important;
    background: transparent !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-size: 18px !important;
    transition: all 0.2s !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .concurseiro-quick-btn:hover {
    background: rgba(51, 65, 85, 0.8) !important;
    transform: scale(1.1) !important;
  }

  .concurseiro-quick-btn:active {
    transform: scale(0.95) !important;
  }
`
document.head.appendChild(toolbarStyle)
