<template>
  <div class="rich-content-editor">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2 mb-2 bg-white border border-gray-200 rounded-lg px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div class="flex items-center gap-1">
        <!-- Basic Formatting -->
        <button
          v-for="tool in formatTools"
          :key="tool.command"
          @click="toggleFormat(tool.command, tool.value)"
          :title="tool.label"
          :class="[
            'p-2 rounded transition-colors',
            isFormatActive(tool.command)
              ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" v-html="tool.icon"></svg>
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <!-- Font Size -->
        <select
          @change="changeFontSize(($event.target as HTMLSelectElement).value)"
          class="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          title="Tamanho da fonte"
        >
          <option value="">Tamanho</option>
          <option value="1">Pequeno</option>
          <option value="3">Normal</option>
          <option value="5">Grande</option>
          <option value="7">Muito grande</option>
        </select>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <!-- Highlight -->
        <button
          @click="toggleHighlight"
          title="Marca-texto amarelo"
          :class="[
            'p-2 rounded transition-colors',
            isHighlightActive
              ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29a.9959.9959 0 00-1.41 0L15 2.25 18.75 6l1.96-1.96z"/>
            <path fill="#FCD34D" d="M0 20h24v4H0v-4z"/>
          </svg>
        </button>

        <!-- Insert Link -->
        <button
          @click="insertLink"
          title="Inserir link"
          class="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </button>

        <!-- Clear Formatting -->
        <button
          @click="clearFormatting"
          title="Remover formatação"
          class="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6zm14 14l-1.41-1.41-2.85-2.85L3.27 2.27 2 3.55l6.09 6.09L6.27 16h3.24L12 13.27l6.18 6.18L19.73 21 20 20.73z"/>
          </svg>
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <!-- Add Comment -->
        <button
          @click="toggleCommentMode"
          title="Inserir comentário - Clique no editor onde deseja adicionar"
          :class="[
            'p-2 rounded transition-colors',
            commentMode
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>

        <!-- Text Box -->
        <button
          @click="toggleTextBoxMode"
          title="Inserir caixa de texto - Clique no editor para posicionar"
          :class="[
            'p-2 rounded transition-colors',
            textBoxMode
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H3V6h18v13zM7 8h2v8H7zm4 0h2v8h-2zm4 0h2v8h-2z"/>
          </svg>
        </button>

        <!-- Image Upload -->
        <button
          @click="triggerImageUpload"
          title="Inserir imagem"
          class="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </button>
        <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />

        <!-- YouTube Video -->
        <button
          @click="insertYouTubeVideo"
          title="Inserir vídeo do YouTube"
          class="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </button>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <button
          v-if="isPro"
          @click="showAIMenu"
          class="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1"
          type="button"
        >
          <span>✨</span>
          <span>IA</span>
        </button>
        <span v-else class="text-xs text-gray-500">Seleção + IA = PRO</span>
      </div>
    </div>

    <!-- Editor Area -->
    <div
      ref="editorRef"
      contenteditable="true"
      @input="handleInput"
      @mouseup="handleTextSelection"
      @keyup="handleTextSelection"
      @keydown="handleKeyDown"
      @click="handleEditorClick"
      @mousemove="handleMouseMove"
      @focus="updateActiveFormats"
      class="min-h-[500px] p-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 prose prose-sm max-w-none text-gray-900 shadow-sm relative"
      :class="{
        'cursor-text': !isSelecting && !commentMode,
        'cursor-crosshair': commentMode
      }"
      @paste="handlePaste"
    ></div>

    <!-- Comment Cursor Icon -->
    <div
      v-if="commentMode && commentCursorPosition"
      class="fixed pointer-events-none z-50"
      :style="{
        left: commentCursorPosition.x + 'px',
        top: commentCursorPosition.y + 'px',
        transform: 'translate(-50%, -100%)'
      }"
    >
      <div class="bg-red-600 text-white rounded-full p-2 shadow-lg animate-pulse">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>
    </div>

    <!-- Selection AI Menu -->
    <AIPopupMenu
      :is-visible="showSelectionMenu"
      :position="menuPosition"
      :is-pro="isPro"
      context="selection"
      @close="showSelectionMenu = false"
      @select="handleAIMenuSelect"
      @upgrade="$emit('upgrade')"
    />

    <!-- Comment Modal -->
    <Teleport to="body">
      <div
        v-if="showCommentModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="showCommentModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Adicionar Comentário</h3>
            <textarea
              v-model="commentText"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 resize-none"
              rows="4"
              placeholder="Digite seu comentário aqui..."
              @keydown.esc="showCommentModal = false"
            ></textarea>
            <div class="flex gap-3 mt-4">
              <button
                @click="saveComment"
                class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
              >
                Salvar
              </button>
              <button
                @click="showCommentModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Comment View Modal -->
    <Teleport to="body">
      <div
        v-if="showCommentView"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="showCommentView = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">Comentário</h3>
              <button
                @click="deleteComment"
                class="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Excluir
              </button>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
              {{ currentCommentText }}
            </div>
            <div class="mt-4">
              <button
                @click="showCommentView = false"
                class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  isPro: boolean
}

interface Emits {
  'update:modelValue': [value: string]
  'ai-action': [action: string, selectedText: string]
  upgrade: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorRef = ref<HTMLElement | null>(null)
const showSelectionMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const isSelecting = ref(false)
const selectedText = ref('')
const showCommentModal = ref(false)
const showCommentView = ref(false)
const commentText = ref('')
const currentCommentText = ref('')
const currentCommentId = ref('')
const commentMode = ref(false)
const commentCursorPosition = ref<{ x: number, y: number } | null>(null)
const isHighlightActive = ref(false)
const activeFormats = ref<Set<string>>(new Set())
const textBoxMode = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)

const formatTools = [
  {
    command: 'bold',
    label: 'Negrito (Ctrl+B)',
    icon: '<path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>'
  },
  {
    command: 'italic',
    label: 'Itálico (Ctrl+I)',
    icon: '<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>'
  },
  {
    command: 'underline',
    label: 'Sublinhado (Ctrl+U)',
    icon: '<path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>'
  },
  {
    command: 'insertUnorderedList',
    label: 'Lista com marcadores',
    icon: '<path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>'
  },
  {
    command: 'insertOrderedList',
    label: 'Lista numerada',
    icon: '<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>'
  }
]

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  updateActiveFormats()
}

const toggleFormat = (command: string, value?: string) => {
  execCommand(command, value)
}

const isFormatActive = (command: string): boolean => {
  try {
    // Trigger reactivity check
    if (activeFormats.value.size >= 0) {
      return document.queryCommandState(command)
    }
    return false
  } catch {
    return false
  }
}

const updateActiveFormats = () => {
  // Trigger reactivity by updating Set
  const newFormats = new Set<string>()

  formatTools.forEach(tool => {
    try {
      if (document.queryCommandState(tool.command)) {
        newFormats.add(tool.command)
      }
    } catch {}
  })

  activeFormats.value = newFormats

  // Update highlight state
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const element = container.nodeType === 3 ? container.parentElement : container as HTMLElement

    if (element) {
      const bgColor = window.getComputedStyle(element).backgroundColor
      isHighlightActive.value = bgColor === 'rgb(254, 240, 138)' ||
                                bgColor === 'rgb(255, 255, 0)' ||
                                element.style.backgroundColor === 'yellow' ||
                                element.tagName === 'MARK'
    }
  }
}

const changeFontSize = (size: string) => {
  if (size) {
    execCommand('fontSize', size)
  }
}

const toggleHighlight = () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  if (isHighlightActive.value) {
    // Remove highlight
    document.execCommand('hiliteColor', false, 'transparent')
    document.execCommand('removeFormat')
  } else {
    // Add highlight
    document.execCommand('hiliteColor', false, 'yellow')
  }

  // Update state after a delay to ensure DOM updated
  setTimeout(() => {
    updateActiveFormats()
  }, 100)

  editorRef.value?.focus()
}

const clearFormatting = () => {
  const selection = window.getSelection()
  if (!selection || !selection.toString()) {
    alert('Selecione o texto que deseja remover a formatação')
    return
  }

  document.execCommand('removeFormat')
  document.execCommand('hiliteColor', false, 'transparent')
  isHighlightActive.value = false
  updateActiveFormats()
  editorRef.value?.focus()
}

const insertLink = () => {
  const url = prompt('Digite a URL:')
  if (url) {
    execCommand('createLink', url)
  }
}

const toggleCommentMode = () => {
  commentMode.value = !commentMode.value
  textBoxMode.value = false
  if (!commentMode.value) {
    commentCursorPosition.value = null
  }
}

const toggleTextBoxMode = () => {
  textBoxMode.value = !textBoxMode.value
  commentMode.value = false
  if (!textBoxMode.value) {
    commentCursorPosition.value = null
  }
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const insertYouTubeVideo = () => {
  const url = prompt('Cole a URL do vídeo do YouTube:')
  if (!url) return

  // Extract video ID
  let videoId = ''
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  videoId = (match && match[7].length === 11) ? match[7] : ''

  if (!videoId) {
    alert('URL inválida do YouTube')
    return
  }

  // Ask for time range
  const startTime = prompt('Tempo inicial (formato: 1:30 ou deixe em branco):', '')
  const endTime = prompt('Tempo final (formato: 2:45 ou deixe em branco):', '')

  let startSeconds = 0
  let endSeconds = 0

  if (startTime) {
    const parts = startTime.split(':')
    startSeconds = parseInt(parts[0]) * 60 + (parts[1] ? parseInt(parts[1]) : 0)
  }

  if (endTime) {
    const parts = endTime.split(':')
    endSeconds = parseInt(parts[0]) * 60 + (parts[1] ? parseInt(parts[1]) : 0)
  }

  // Build embed URL
  let embedUrl = `https://www.youtube.com/embed/${videoId}?`
  if (startSeconds) embedUrl += `start=${startSeconds}&`
  if (endSeconds) embedUrl += `end=${endSeconds}&`

  // Create iframe
  const iframe = document.createElement('div')
  iframe.className = 'youtube-embed'
  iframe.innerHTML = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.insertNode(iframe)
    range.collapse(false)
  }

  handleInput()
}

const handleMouseMove = (event: MouseEvent) => {
  if (commentMode.value || textBoxMode.value) {
    commentCursorPosition.value = {
      x: event.clientX,
      y: event.clientY - 50
    }
  }
}

const saveComment = () => {
  if (!commentText.value.trim()) return

  const commentId = 'comment-' + Date.now()
  const commentDot = document.createElement('span')
  commentDot.className = 'comment-dot'
  commentDot.setAttribute('data-comment-id', commentId)
  commentDot.setAttribute('data-comment-text', commentText.value)
  commentDot.innerHTML = '●'
  commentDot.title = 'Clique para ver o comentário'

  // Insert at saved cursor position
  if (editorRef.value && commentInsertRange.value) {
    commentInsertRange.value.insertNode(commentDot)
    commentInsertRange.value.collapse(false)
  }

  showCommentModal.value = false
  commentMode.value = false
  commentCursorPosition.value = null
  handleInput()
}

const commentInsertRange = ref<Range | null>(null)

const handleEditorClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // Check if clicking on comment dot
  if (target.classList.contains('comment-dot')) {
    event.preventDefault()
    currentCommentId.value = target.getAttribute('data-comment-id') || ''
    currentCommentText.value = target.getAttribute('data-comment-text') || ''
    showCommentView.value = true
    return
  }

  // If in comment mode, save cursor position and show modal
  if (commentMode.value) {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      commentInsertRange.value = selection.getRangeAt(0).cloneRange()
    }
    commentText.value = ''
    showCommentModal.value = true
    return
  }

  // If in text box mode, insert text box at click position
  if (textBoxMode.value) {
    const textBox = document.createElement('div')
    textBox.className = 'text-box-element'
    textBox.contentEditable = 'true'
    textBox.innerHTML = 'Digite aqui...'
    textBox.style.cssText = `
      position: absolute;
      left: ${event.offsetX}px;
      top: ${event.offsetY}px;
      min-width: 150px;
      min-height: 50px;
      padding: 8px;
      border: 2px dashed #3b82f6;
      background: #eff6ff;
      border-radius: 4px;
      cursor: move;
      z-index: 10;
    `

    // Make draggable
    let isDragging = false
    let startX = 0
    let startY = 0

    textBox.addEventListener('mousedown', (e) => {
      if (e.target === textBox) {
        isDragging = true
        startX = e.clientX - textBox.offsetLeft
        startY = e.clientY - textBox.offsetTop
        e.preventDefault()
      }
    })

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        textBox.style.left = (e.clientX - startX) + 'px'
        textBox.style.top = (e.clientY - startY) + 'px'
      }
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
    })

    editorRef.value?.appendChild(textBox)
    textBoxMode.value = false
    commentCursorPosition.value = null
    handleInput()
  }
}

const deleteComment = () => {
  const commentDot = editorRef.value?.querySelector(`[data-comment-id="${currentCommentId.value}"]`)
  if (commentDot) {
    commentDot.remove()
    handleInput()
  }
  showCommentView.value = false
}

const handleInput = () => {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Update formats on keyboard shortcuts
  setTimeout(() => updateActiveFormats(), 10)
}

const handleTextSelection = () => {
  updateActiveFormats()

  const selection = window.getSelection()
  const text = selection?.toString().trim()

  if (text && text.length > 0 && props.isPro) {
    selectedText.value = text
    const range = selection!.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    menuPosition.value = {
      x: rect.left + rect.width / 2 - 112, // Center the menu (224px width / 2)
      y: rect.top - 10 + window.scrollY
    }

    isSelecting.value = true
  } else {
    isSelecting.value = false
    showSelectionMenu.value = false
  }
}

const showAIMenu = () => {
  if (selectedText.value && props.isPro) {
    showSelectionMenu.value = true
  }
}

const handleAIMenuSelect = (action: string) => {
  emit('ai-action', action, selectedText.value)
  showSelectionMenu.value = false
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Convert image to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    execCommand('insertImage', base64)
  }
  reader.readAsDataURL(file)

  // Reset input
  input.value = ''
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()

  const clipboardData = event.clipboardData
  if (!clipboardData) return

  // Check for images first
  const items = clipboardData.items
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile()
      if (blob) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          execCommand('insertImage', base64)
        }
        reader.readAsDataURL(blob)
        return
      }
    }
  }

  // If no image, paste as plain text
  const text = clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// Initialize content
watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && newValue !== editorRef.value.innerHTML) {
    editorRef.value.innerHTML = newValue
  }
}, { immediate: true })

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }

  // Add global selection change listener
  document.addEventListener('selectionchange', updateActiveFormats)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', updateActiveFormats)
})
</script>

<style>
.rich-content-editor .prose {
  max-width: none;
  color: #111827;
  line-height: 1.75;
}

.rich-content-editor .prose h1 {
  font-size: 2em;
  font-weight: bold;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  color: #111827;
}

.rich-content-editor .prose h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  color: #1f2937;
}

.rich-content-editor .prose h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 1em;
  color: #374151;
}

.rich-content-editor .prose p {
  margin-top: 1em;
  margin-bottom: 1em;
  color: #111827;
}

.rich-content-editor .prose ul,
.rich-content-editor .prose ol {
  margin-top: 1em;
  margin-bottom: 1em;
  padding-left: 40px;
  color: #111827;
}

.rich-content-editor .prose ul {
  list-style-type: disc;
}

.rich-content-editor .prose ol {
  list-style-type: decimal;
}

.rich-content-editor .prose li {
  margin: 0.5em 0;
}

.rich-content-editor .prose img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rich-content-editor .prose strong {
  font-weight: bold;
  color: #111827;
}

.rich-content-editor .prose em {
  font-style: italic;
}

.rich-content-editor .prose u {
  text-decoration: underline;
}

.rich-content-editor .prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.rich-content-editor .prose a:hover {
  color: #2563eb;
}

.rich-content-editor [contenteditable]:focus {
  outline: none;
}

/* Comment dot styling */
.rich-content-editor .comment-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  color: #dc2626;
  font-size: 20px;
  line-height: 0;
  vertical-align: middle;
  cursor: pointer;
  margin: 0 2px;
  transition: transform 0.2s;
  user-select: none;
}

.rich-content-editor .comment-dot:hover {
  transform: scale(1.3);
  filter: brightness(1.2);
}

/* Highlight styling */
.rich-content-editor [contenteditable] mark,
.rich-content-editor [contenteditable] [style*="background-color: yellow"],
.rich-content-editor [contenteditable] [style*="background: yellow"] {
  background-color: #fef08a !important;
  padding: 2px 0;
}

/* Text box styling */
.rich-content-editor .text-box-element {
  position: relative;
  display: inline-block;
}

.rich-content-editor .text-box-element:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* YouTube embed styling */
.rich-content-editor .youtube-embed {
  margin: 1.5em 0;
  max-width: 100%;
}

.rich-content-editor .youtube-embed iframe {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
