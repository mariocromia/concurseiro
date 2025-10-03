<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold text-gray-900">🔍 Busca Inteligente</h3>
            <button
              @click="$emit('close')"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @input="performSearch"
              type="text"
              placeholder="Digite sua busca... Ex: altura, fórmula de bhaskara, teorema"
              class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              autofocus
            />
          </div>

          <!-- Search Parameters -->
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              @click="toggleFilter('all')"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                activeFilters.includes('all')
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              📚 Todos
            </button>
            <button
              @click="toggleFilter('subjects')"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                activeFilters.includes('subjects')
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              📖 Cadernos
            </button>
            <button
              @click="toggleFilter('chapters')"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                activeFilters.includes('chapters')
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              📄 Capítulos
            </button>
            <button
              @click="toggleFilter('content')"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                activeFilters.includes('content')
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              📝 Conteúdo
            </button>
            <button
              @click="toggleFilter('reminders')"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                activeFilters.includes('reminders')
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              📌 Lembretes
            </button>

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-300 mx-1"></div>

            <!-- Match Type -->
            <button
              @click="matchType = 'exact'"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                matchType === 'exact'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              Exato
            </button>
            <button
              @click="matchType = 'partial'"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                matchType === 'partial'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              Parcial
            </button>
          </div>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Loading -->
          <div v-if="searching" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p class="text-gray-600 mt-4">Buscando...</p>
          </div>

          <!-- No Search Yet -->
          <div v-else-if="!searchQuery && results.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-lg font-medium">Digite algo para começar a buscar</p>
            <p class="text-sm mt-2">Use os filtros para refinar sua busca</p>
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery && results.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-6xl mb-4">😔</div>
            <p class="text-lg font-medium">Nenhum resultado encontrado</p>
            <p class="text-sm mt-2">Tente buscar por outros termos ou ajustar os filtros</p>
          </div>

          <!-- Results List -->
          <div v-else class="space-y-6">
            <div class="mb-2 text-sm text-gray-600 border-b border-gray-200 pb-2">
              Aproximadamente <span class="font-medium">{{ results.length }}</span> resultado(s)
            </div>

            <div
              v-for="result in results"
              :key="result.id"
              @click="handleResultClick(result)"
              class="cursor-pointer group"
            >
              <!-- Title with Subject > Chapter format -->
              <h3 class="text-xl mb-1">
                <span class="text-blue-800 underline group-hover:no-underline" v-html="getSubjectName(result)"></span>
                <span v-if="getChapterName(result)" class="text-blue-800"> › </span>
                <span v-if="getChapterName(result)" class="text-blue-800 group-hover:underline" v-html="getChapterName(result)"></span>
              </h3>

              <!-- URL-like line -->
              <div class="flex items-center gap-2 text-sm mb-2">
                <span class="text-green-700">{{ formatDate(result.date) }}</span>
                <span v-if="result.matchCount > 1" class="text-gray-400">•</span>
                <span v-if="result.matchCount > 1" class="text-gray-600">{{ result.matchCount }} ocorrência(s)</span>
              </div>

              <!-- Result Snippet with context -->
              <div class="text-sm text-gray-700 leading-relaxed" v-html="highlightText(result.snippet)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

interface Emits {
  close: []
  select: [result: SearchResult]
}

interface SearchResult {
  id: string
  type: 'subject' | 'chapter' | 'content' | 'reminder'
  title: string
  snippet: string
  breadcrumb: string
  relevance: number
  matchCount: number
  date: Date
  data: any
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const searchQuery = ref('')
const searching = ref(false)
const results = ref<SearchResult[]>([])
const activeFilters = ref(['all'])
const matchType = ref<'exact' | 'partial'>('partial')

const toggleFilter = (filter: string) => {
  if (filter === 'all') {
    activeFilters.value = ['all']
  } else {
    // Remove 'all' if selecting specific filter
    activeFilters.value = activeFilters.value.filter(f => f !== 'all')

    if (activeFilters.value.includes(filter)) {
      activeFilters.value = activeFilters.value.filter(f => f !== filter)
      if (activeFilters.value.length === 0) {
        activeFilters.value = ['all']
      }
    } else {
      activeFilters.value.push(filter)
    }
  }

  if (searchQuery.value) {
    performSearch()
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }

  searching.value = true
  const allResults: SearchResult[] = []

  try {
    const query = searchQuery.value.toLowerCase().trim()

    // Search in subjects
    if (activeFilters.value.includes('all') || activeFilters.value.includes('subjects')) {
      const { data: subjects } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.value?.id)

      subjects?.forEach((subject: any) => {
        const relevance = calculateRelevance(query, subject.name.toLowerCase())
        if (relevance > 0) {
          allResults.push({
            id: `subject-${subject.id}`,
            type: 'subject',
            title: subject.name,
            snippet: `Caderno: ${subject.name}`,
            breadcrumb: 'Caderno',
            relevance,
            matchCount: countMatches(query, subject.name.toLowerCase()),
            date: new Date(subject.created_at),
            data: subject
          })
        }
      })
    }

    // Search in chapters
    if (activeFilters.value.includes('all') || activeFilters.value.includes('chapters')) {
      const { data: chapters } = await supabase
        .from('chapters')
        .select('*, subjects(name)')
        .in('subject_id', (await supabase
          .from('subjects')
          .select('id')
          .eq('user_id', user.value?.id)).data?.map((s: any) => s.id) || [])

      chapters?.forEach((chapter: any) => {
        const relevance = calculateRelevance(query, chapter.title.toLowerCase())
        if (relevance > 0) {
          allResults.push({
            id: `chapter-${chapter.id}`,
            type: 'chapter',
            title: chapter.title,
            snippet: `Capítulo do caderno "${chapter.subjects?.name}"`,
            breadcrumb: `${chapter.subjects?.name} > ${chapter.title}`,
            relevance,
            matchCount: countMatches(query, chapter.title.toLowerCase()),
            date: new Date(chapter.created_at),
            data: chapter
          })
        }
      })
    }

    // Search in content
    if (activeFilters.value.includes('all') || activeFilters.value.includes('content')) {
      const { data: pages } = await supabase
        .from('pages')
        .select('*, chapters(title, subject_id, subjects(name))')

      pages?.forEach((page: any) => {
        const contentText = stripHtml(page.content).toLowerCase()
        const relevance = calculateRelevance(query, contentText)

        if (relevance > 0) {
          const snippet = extractSnippet(contentText, query)
          allResults.push({
            id: `content-${page.id}`,
            type: 'content',
            title: page.chapters?.title || 'Sem título',
            snippet: snippet || contentText.substring(0, 150) + '...',
            breadcrumb: `${page.chapters?.subjects?.name} > ${page.chapters?.title}`,
            relevance,
            matchCount: countMatches(query, contentText),
            date: new Date(page.created_at),
            data: page
          })
        }
      })
    }

    // Search in reminders
    if (activeFilters.value.includes('all') || activeFilters.value.includes('reminders')) {
      const reminders = JSON.parse(localStorage.getItem('study-reminders') || '[]')

      reminders.forEach((reminder: any) => {
        const contentText = reminder.content.toLowerCase()
        const relevance = calculateRelevance(query, contentText)

        if (relevance > 0) {
          allResults.push({
            id: `reminder-${reminder.id}`,
            type: 'reminder',
            title: reminder.content.substring(0, 50) + '...',
            snippet: reminder.content,
            breadcrumb: `Lembrete > ${getCategoryLabel(reminder.category)}`,
            relevance,
            matchCount: countMatches(query, contentText),
            date: new Date(reminder.createdAt),
            data: reminder
          })
        }
      })
    }

    // Sort by relevance
    results.value = allResults.sort((a, b) => b.relevance - a.relevance)

  } catch (error) {
    console.error('Erro na busca:', error)
  } finally {
    searching.value = false
  }
}

const calculateRelevance = (query: string, text: string): number => {
  if (!text) return 0

  let score = 0
  const queryWords = query.split(' ').filter(w => w.length > 0)

  if (matchType.value === 'exact') {
    // Exact match
    if (text.includes(query)) {
      score = 100
    }
  } else {
    // Partial match - calculate based on word matches
    queryWords.forEach(word => {
      if (text.includes(word)) {
        // Full word match
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          score += matches.length * 30
        }

        // Partial word match
        const partialMatches = text.split(word).length - 1
        score += partialMatches * 10
      }
    })

    // Bonus for multiple words matching
    const matchingWords = queryWords.filter(word => text.includes(word))
    if (matchingWords.length > 1) {
      score += matchingWords.length * 20
    }
  }

  return Math.min(score, 100)
}

const countMatches = (query: string, text: string): number => {
  if (!text) return 0

  if (matchType.value === 'exact') {
    return (text.split(query).length - 1)
  } else {
    const queryWords = query.split(' ').filter(w => w.length > 0)
    let total = 0
    queryWords.forEach(word => {
      total += (text.split(word).length - 1)
    })
    return total
  }
}

const extractSnippet = (text: string, query: string): string => {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(' ').filter(w => w.length > 0)

  // Find the first occurrence of any query word
  let index = -1
  let foundWord = ''

  for (const word of queryWords) {
    const wordIndex = text.indexOf(word)
    if (wordIndex !== -1 && (index === -1 || wordIndex < index)) {
      index = wordIndex
      foundWord = word
    }
  }

  if (index === -1) {
    // No match found, return beginning
    return text.substring(0, 200) + (text.length > 200 ? '...' : '')
  }

  // Get context around the match (more context for better readability)
  const contextBefore = 80
  const contextAfter = 120

  const start = Math.max(0, index - contextBefore)
  const end = Math.min(text.length, index + foundWord.length + contextAfter)

  let snippet = text.substring(start, end)

  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

const stripHtml = (html: string): string => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const highlightText = (text: string): string => {
  if (!searchQuery.value) return text

  const query = searchQuery.value.trim()
  const queryWords = query.split(' ').filter(w => w.length > 0)

  let highlighted = text

  if (matchType.value === 'exact') {
    const regex = new RegExp(`(${query})`, 'gi')
    highlighted = highlighted.replace(regex, '<strong>$1</strong>')
  } else {
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlighted = highlighted.replace(regex, '<strong>$1</strong>')
    })
  }

  return highlighted
}

const getTypeIcon = (type: string): string => {
  const icons = {
    subject: '📚',
    chapter: '📄',
    content: '📝',
    reminder: '📌'
  }
  return icons[type as keyof typeof icons] || '📄'
}

const getTypeLabel = (type: string): string => {
  const labels = {
    subject: 'Caderno',
    chapter: 'Capítulo',
    content: 'Conteúdo',
    reminder: 'Lembrete'
  }
  return labels[type as keyof typeof labels] || 'Item'
}

const getCategoryLabel = (category: string): string => {
  const categories: Record<string, string> = {
    formula: 'Fórmula',
    definition: 'Definição',
    theorem: 'Teorema',
    law: 'Lei',
    concept: 'Conceito',
    other: 'Outro'
  }
  return categories[category] || 'Outro'
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getSubjectName = (result: SearchResult): string => {
  // Extract subject name from breadcrumb
  const parts = result.breadcrumb.split(' > ')
  return highlightText(parts[0] || result.breadcrumb)
}

const getChapterName = (result: SearchResult): string => {
  // Extract chapter name from breadcrumb
  const parts = result.breadcrumb.split(' > ')
  if (parts.length > 1) {
    return highlightText(parts[1])
  }
  // If it's a chapter result, use the title
  if (result.type === 'chapter' || result.type === 'content') {
    return highlightText(result.title)
  }
  return ''
}

const handleResultClick = (result: SearchResult) => {
  emit('select', result)
  emit('close')
}

// Clear results when modal closes
watch(() => props.isVisible, (isVisible) => {
  if (!isVisible) {
    searchQuery.value = ''
    results.value = []
    activeFilters.value = ['all']
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Google-like highlight - bold text only */
:deep(strong) {
  font-weight: 700;
  color: inherit;
}
</style>
