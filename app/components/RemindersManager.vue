<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-claude-lg shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">📌 Lembretes e Fórmulas</h3>
              <p class="text-sm text-gray-600 mt-1">{{ subjectName }}</p>
            </div>
            <button
              @click="$emit('close')"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Add New Reminder -->
          <div class="mb-6 bg-primary-50 rounded-claude-md p-4">
            <h4 class="text-sm font-bold text-primary-900 mb-3">Adicionar Novo Lembrete</h4>
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  v-model="newReminder.category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500"
                >
                  <option value="formula">Fórmula</option>
                  <option value="definition">Definição</option>
                  <option value="theorem">Teorema</option>
                  <option value="law">Lei</option>
                  <option value="concept">Conceito</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  v-model="newReminder.content"
                  rows="4"
                  placeholder="Ex: x = (-b ± √(b² - 4ac)) / 2a"
                  class="w-full px-3 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500 resize-none"
                ></textarea>
              </div>
              <button
                @click="addReminder"
                :disabled="!newReminder.content"
                class="px-4 py-2 bg-primary-500 text-white rounded-claude-md hover:bg-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Adicionar Lembrete
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="mb-4 flex flex-wrap gap-2">
            <button
              @click="filterCategory = null"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filterCategory === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              Todos ({{ reminders.length }})
            </button>
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="filterCategory = cat.value"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filterCategory === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ cat.emoji }} {{ cat.label }} ({{ reminders.filter(r => r.category === cat.value).length }})
            </button>
          </div>

          <!-- Reminders List -->
          <div class="space-y-3">
            <div
              v-for="reminder in filteredReminders"
              :key="reminder.id"
              class="bg-white border-2 border-gray-200 rounded-claude-md p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ getCategoryEmoji(reminder.category) }}</span>
                  <span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                    {{ getCategoryLabel(reminder.category) }}
                  </span>
                </div>
                <button
                  @click="deleteReminder(reminder.id)"
                  class="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Excluir
                </button>
              </div>
              <div class="bg-gray-50 rounded-claude-md p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                {{ reminder.content }}
              </div>
              <div class="mt-2 text-xs text-gray-500">
                Criado em: {{ formatDate(reminder.createdAt) }}
              </div>
            </div>
          </div>

          <div v-if="filteredReminders.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-5xl mb-4">📋</div>
            <p class="text-lg font-medium">Nenhum lembrete encontrado</p>
            <p class="text-sm">Adicione lembretes importantes para consultar durante os estudos</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  subjectId: string
  subjectName: string
}

interface Emits {
  close: []
}

interface Reminder {
  id: string
  subjectId: string
  category: string
  content: string
  createdAt: Date
}

const props = defineProps<Props>()
defineEmits<Emits>()

const reminders = ref<Reminder[]>([])
const filterCategory = ref<string | null>(null)
const newReminder = ref({
  category: 'formula',
  content: ''
})

const categories = [
  { value: 'formula', label: 'Fórmulas', emoji: '🔢' },
  { value: 'definition', label: 'Definições', emoji: '📖' },
  { value: 'theorem', label: 'Teoremas', emoji: '📐' },
  { value: 'law', label: 'Leis', emoji: '⚖️' },
  { value: 'concept', label: 'Conceitos', emoji: '💡' },
  { value: 'other', label: 'Outros', emoji: '📌' }
]

const filteredReminders = computed(() => {
  if (filterCategory.value === null) {
    return reminders.value
  }
  return reminders.value.filter(r => r.category === filterCategory.value)
})

const addReminder = () => {
  if (!newReminder.value.content) return

  reminders.value.unshift({
    id: Date.now().toString(),
    subjectId: props.subjectId,
    category: newReminder.value.category,
    content: newReminder.value.content,
    createdAt: new Date()
  })

  // Save to localStorage
  saveToLocalStorage()

  // Reset form
  newReminder.value = {
    category: 'formula',
    content: ''
  }
}

const deleteReminder = (id: string) => {
  reminders.value = reminders.value.filter(r => r.id !== id)
  saveToLocalStorage()
}

const saveToLocalStorage = () => {
  const allReminders = JSON.parse(localStorage.getItem('study-reminders') || '[]')
  // Remove old reminders from this subject
  const otherReminders = allReminders.filter((r: Reminder) => r.subjectId !== props.subjectId)
  // Add current reminders
  const updated = [...otherReminders, ...reminders.value]
  localStorage.setItem('study-reminders', JSON.stringify(updated))
}

const getCategoryEmoji = (category: string) => {
  return categories.find(c => c.value === category)?.emoji || '📌'
}

const getCategoryLabel = (category: string) => {
  return categories.find(c => c.value === category)?.label || 'Outro'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadReminders = () => {
  const allReminders = JSON.parse(localStorage.getItem('study-reminders') || '[]')
  reminders.value = allReminders
    .filter((r: Reminder) => r.subjectId === props.subjectId)
    .map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt)
    }))
}

// Load reminders when component is visible
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    loadReminders()
  }
})

// Load on mount
onMounted(() => {
  if (props.isVisible) {
    loadReminders()
  }
})
</script>
