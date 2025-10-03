<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Header -->
    <header class="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-[1920px] mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-xl">
              📚
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">
                Caderno Inteligente
              </h1>
              <p class="text-xs text-gray-400">Seus estudos potencializados por IA</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div v-if="!isPro" @click="handleUpgrade" class="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-xs font-semibold cursor-pointer hover:shadow-lg transition-shadow">
              ⭐ Upgrade PRO
            </div>
            <NuxtLink
              to="/dashboard"
              class="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
            >
              ← Voltar
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-73px)]">
      <!-- Sidebar - Matérias e Capítulos -->
      <aside class="w-80 bg-dark-800/50 border-r border-dark-700 overflow-y-auto flex-shrink-0 backdrop-blur-sm">
        <div class="p-4 border-b border-dark-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wide">Cadernos</h3>
            <button
              @click="showSubjectForm = !showSubjectForm"
              class="p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              title="Adicionar caderno"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- New Subject Form -->
          <div v-if="showSubjectForm" class="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
            <form @submit.prevent="createSubject" class="space-y-2">
              <input
                v-model="subjectForm.name"
                type="text"
                placeholder="Nome do caderno"
                class="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-3 py-2 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium"
                >
                  Criar
                </button>
                <button
                  type="button"
                  @click="cancelSubjectForm"
                  class="px-3 py-2 text-xs border border-dark-600 text-gray-400 rounded-lg hover:bg-dark-700 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Subjects Tree -->
        <div class="p-2">
          <div v-if="subjects.length === 0 && !showSubjectForm" class="text-center py-8 px-4">
            <div class="text-4xl mb-3">📚</div>
            <p class="text-sm text-gray-400 mb-3">Nenhum caderno ainda</p>
            <button
              @click="showSubjectForm = true"
              class="text-xs text-primary-400 hover:text-primary-300"
            >
              Clique no + para criar
            </button>
          </div>

          <draggable
            v-model="subjects"
            @end="onSubjectDragEnd"
            item-key="id"
            handle=".drag-handle"
            ghost-class="opacity-50"
            class="space-y-1"
          >
            <template #item="{ element: subject }">
              <div class="mb-1">
                <div
                  class="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-dark-700/50 transition-colors group"
                  :class="{ 'bg-dark-700 border border-primary-500/30': selectedSubject?.id === subject.id }"
                >
                  <div class="flex items-center space-x-2 flex-1">
                    <!-- Drag Handle -->
                    <svg
                      class="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-move drag-handle"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      title="Arrastar para reordenar"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>

                    <svg
                      @click.stop="toggleSubject(subject.id)"
                      class="w-4 h-4 text-gray-500 transition-transform cursor-pointer"
                      :class="{ 'rotate-90': expandedSubjects[subject.id] }"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>

                    <!-- Nome ou Input de Edição -->
                    <input
                      v-if="editingSubjectId === subject.id"
                      v-model="editingSubjectName"
                      @blur="saveSubjectEdit(subject.id)"
                      @keyup.enter="saveSubjectEdit(subject.id)"
                      @keyup.esc="cancelSubjectEdit"
                      :data-subject-id="subject.id"
                      class="subject-edit-input flex-1 px-2 py-1 text-sm bg-dark-900 border border-primary-500 text-white rounded focus:outline-none"
                      @click.stop
                    />
                    <span
                      v-else
                      @click.stop="toggleSubject(subject.id)"
                      @dblclick.stop="startEditSubject(subject)"
                      class="text-sm font-medium text-white cursor-pointer hover:text-primary-400 transition-colors flex-1"
                      title="Duplo clique para editar"
                    >
                      {{ subject.name }}
                    </span>
                  </div>

                  <div class="flex items-center space-x-1">
                    <button
                      @click.stop="openChapterMenu(subject)"
                      class="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary-500/20 rounded transition-all"
                      title="Adicionar capítulo"
                    >
                      <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button
                      @click.stop="confirmDeleteSubject(subject)"
                      class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                      title="Excluir matéria"
                    >
                      <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Chapters -->
                <div v-if="expandedSubjects[subject.id]" class="ml-6 mt-1 space-y-1">
                  <draggable
                    :model-value="getChaptersBySubject(subject.id)"
                    @update:model-value="(newChapters) => updateChapters(subject.id, newChapters)"
                    @end="onChapterDragEnd"
                    item-key="id"
                    handle=".chapter-drag-handle"
                    ghost-class="opacity-50"
                  >
                    <template #item="{ element: chapter }">
                      <div
                        class="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-dark-700/50 transition-colors group"
                        :class="{ 'bg-primary-500/20 border border-primary-500/50': selectedChapter?.id === chapter.id }"
                      >
                        <div class="flex items-center space-x-2 flex-1">
                          <svg
                            class="w-3 h-3 text-gray-600 hover:text-gray-400 cursor-move chapter-drag-handle"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            title="Arrastar para reordenar"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>

                          <!-- Título ou Input de Edição -->
                          <input
                            v-if="editingChapterId === chapter.id"
                            v-model="editingChapterTitle"
                            @blur="saveChapterEdit(chapter.id)"
                            @keyup.enter="saveChapterEdit(chapter.id)"
                            @keyup.esc="cancelChapterEdit"
                            :data-chapter-id="chapter.id"
                            class="chapter-edit-input flex-1 px-2 py-1 text-sm bg-dark-900 border border-primary-500 text-white rounded focus:outline-none"
                            @click.stop
                          />
                          <span
                            v-else
                            @click.stop="selectChapter(chapter)"
                            @dblclick.stop="startEditChapter(chapter)"
                            class="text-sm text-gray-300 cursor-pointer hover:text-primary-400 transition-colors flex-1"
                            title="Duplo clique para editar"
                          >
                            {{ chapter.title }}
                          </span>
                        </div>

                        <div class="flex items-center space-x-1">
                          <button
                            v-if="isPro"
                            @click.stop="showAIMenuForChapter($event, chapter)"
                            class="opacity-0 group-hover:opacity-100 p-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:shadow-md transition-all"
                          >
                            <span class="text-xs">✨</span>
                          </button>
                          <button
                            @click.stop="confirmDeleteChapter(chapter)"
                            class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                            title="Excluir capítulo"
                          >
                            <svg class="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </template>
                  </draggable>

                  <!-- Add Chapter Button -->
                  <button
                    @click.stop="openChapterForm(subject)"
                    class="w-full text-left p-2 text-xs text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Adicionar capítulo</span>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto">
        <!-- Debug Info -->
        <div v-if="false" class="p-4 bg-red-900 text-white text-xs font-mono">
          <div>✅ selectedChapter: {{ selectedChapter?.title || 'NULL' }}</div>
          <div>✅ selectedChapter ID: {{ selectedChapter?.id || 'NULL' }}</div>
          <div>✅ selectedSubject: {{ selectedSubject?.name || 'NULL' }}</div>
          <div>✅ chapterContent length: {{ chapterContent?.length || 0 }}</div>
          <div>✅ chapters total: {{ chapters.length }}</div>
        </div>

        <!-- Empty State -->
        <div v-if="!selectedChapter" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-8xl mb-6">📖</div>
            <h3 class="text-2xl font-bold text-white mb-2">Selecione um capítulo</h3>
            <p class="text-gray-400">Escolha um caderno e um capítulo para começar a estudar</p>
          </div>
        </div>

        <!-- Chapter Content -->
        <div v-else-if="selectedChapter" class="p-8 max-w-5xl mx-auto">
          <div class="mb-6 flex items-start justify-between">
            <div>
              <div class="text-sm text-primary-400 font-medium mb-1">{{ selectedSubject?.name }}</div>
              <h2 class="text-3xl font-bold text-white mb-2">{{ selectedChapter.title }}</h2>
              <p class="text-sm text-gray-500">Última atualização: {{ formatDate(selectedChapter.updated_at || selectedChapter.created_at) }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                v-if="isPro"
                @click="showAIMenuForChapter($event, selectedChapter)"
                class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center space-x-2"
              >
                <span>✨</span>
                <span>Assistente IA</span>
              </button>
              <button
                @click="saveChapterContent"
                :disabled="saving"
                class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
              >
                {{ saving ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </div>

          <!-- Rich Content Editor -->
          <RichContentEditor
            v-model="chapterContent"
            :is-pro="isPro"
            @ai-action="handleAIAction"
            @upgrade="handleUpgrade"
          />
        </div>
      </main>
    </div>

    <!-- AI Popup Menu -->
    <AIPopupMenu
      :is-visible="showAIPopup"
      :position="aiMenuPosition"
      :is-pro="isPro"
      :context="aiMenuContext"
      @close="showAIPopup = false"
      @select="handleAIMenuSelect"
      @upgrade="handleUpgrade"
    />

    <!-- AI Chat Modal -->
    <AIChatModal
      :is-open="showChatModal"
      :title="chatModalTitle"
      :subtitle="chatModalSubtitle"
      :initial-content="chatInitialContent"
      :context="chatContext"
      @close="showChatModal = false"
    />

    <!-- AI Exercises Modal -->
    <AIExercisesModal
      :is-open="showExercisesModal"
      :content="exercisesContent"
      :chapter-title="selectedChapter?.title"
      @close="showExercisesModal = false"
    />

    <!-- AI Flashcards Modal -->
    <AIFlashcardsModal
      :is-open="showFlashcardsModal"
      :content="flashcardsContent"
      :chapter-title="selectedChapter?.title"
      @close="showFlashcardsModal = false"
    />

    <!-- Chapter Form Modal -->
    <Teleport to="body">
      <div
        v-if="showChapterFormModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
        @click.self="cancelChapterForm"
      >
        <div class="bg-dark-800 border border-dark-700 rounded-xl shadow-2xl w-full max-w-md" @click.stop>
          <div class="p-6">
            <h3 class="text-lg font-bold text-white mb-4">Novo Capítulo</h3>
            <form @submit.prevent="createChapter" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Título do capítulo</label>
                <input
                  ref="chapterTitleInput"
                  v-model="chapterForm.title"
                  type="text"
                  placeholder="Ex: Capítulo 1 - Introdução"
                  class="w-full px-4 py-2 bg-dark-900 border border-dark-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  autofocus
                />
              </div>
              <div class="flex gap-3">
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium"
                >
                  Criar Capítulo
                </button>
                <button
                  type="button"
                  @click="cancelChapterForm"
                  class="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-lg hover:bg-dark-700 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-dark-800 border border-red-500/50 rounded-xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Confirmar Exclusão</h3>
                <p class="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div class="bg-dark-900/50 rounded-lg p-4 mb-6">
              <p class="text-sm text-gray-300 mb-2">
                Você está prestes a excluir {{ deleteTarget?.type === 'subject' ? 'o caderno' : 'o capítulo' }}:
              </p>
              <p class="text-white font-semibold">"{{ deleteTarget?.name }}"</p>
              <p v-if="deleteTarget?.type === 'subject'" class="text-xs text-red-400 mt-2">
                ⚠️ Todos os capítulos e conteúdos deste caderno também serão excluídos!
              </p>
            </div>

            <div class="flex gap-3">
              <button
                @click="executeDelete"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ loading ? 'Excluindo...' : 'Sim, excluir' }}</span>
              </button>
              <button
                @click="showDeleteModal = false"
                :disabled="loading"
                class="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-lg hover:bg-dark-700 font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { generateSummary, explainSelection } = useGemini()

// State
const loading = ref(false)
const saving = ref(false)
const isPro = ref(false)

// Subjects & Chapters
const subjects = ref<any[]>([])
const chapters = ref<any[]>([])
const expandedSubjects = ref<Record<string, boolean>>({})
const selectedSubject = ref<any>(null)
const selectedChapter = ref<any>(null)
const chapterContent = ref('')

// Debug user state
watch(() => user.value, (newUser) => {
  console.log('👤 User mudou:', newUser)
  console.log('User ID:', newUser?.id)
  console.log('User Email:', newUser?.email)
}, { immediate: true })

// Debug selected chapter
watch(() => selectedChapter.value, (newChapter) => {
  console.log('📚 selectedChapter mudou:', newChapter?.title || 'null')
  console.log('📚 selectedChapter value:', newChapter)
}, { immediate: true })

// Forms
const showSubjectForm = ref(false)
const showChapterFormModal = ref(false)
const subjectForm = ref({ name: '' })
const chapterForm = ref({ title: '', subject_id: '' })

// Edit inline
const editingSubjectId = ref<string | null>(null)
const editingSubjectName = ref('')
const editingChapterId = ref<string | null>(null)
const editingChapterTitle = ref('')

// Delete confirmation
const showDeleteModal = ref(false)
const deleteTarget = ref<{ type: 'subject' | 'chapter', id: string, name: string } | null>(null)

// AI Modals
const showAIPopup = ref(false)
const aiMenuPosition = ref({ x: 0, y: 0 })
const aiMenuContext = ref<'chapter' | 'selection'>('chapter')
const showChatModal = ref(false)
const chatModalTitle = ref('')
const chatModalSubtitle = ref('')
const chatInitialContent = ref('')
const chatContext = ref('')
const showExercisesModal = ref(false)
const exercisesContent = ref('')
const showFlashcardsModal = ref(false)
const flashcardsContent = ref('')

// Check user subscription
const checkSubscription = async () => {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = user.value?.id || currentUser?.id

    if (!userId) {
      console.log('⏳ Aguardando usuário para verificar assinatura...')
      return
    }

    console.log('🔍 Verificando assinatura para user:', userId)

    const { data, error } = await supabase
      .from('users')
      .select('subscription_type')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Erro ao verificar assinatura:', error)
      return
    }

    if (data) {
      isPro.value = data.subscription_type === 'pro' || data.subscription_type === 'plus'
      console.log('✅ Tipo de assinatura:', data.subscription_type)
      console.log('✅ isPro:', isPro.value)
    }
  } catch (err) {
    console.error('❌ Erro ao verificar assinatura:', err)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 ===== NOTEBOOK MONTADO =====')
  console.log('🚀 User inicial:', user.value?.email || 'null')
  console.log('🚀 URL:', window.location.href)

  // Esperar o usuário estar disponível
  if (!user.value) {
    console.log('⏳ Aguardando usuário...')
    const checkUser = setInterval(() => {
      if (user.value) {
        console.log('✅ Usuário encontrado:', user.value.email)
        clearInterval(checkUser)
        loadSubjects()
        loadChapters()
        checkSubscription()
      }
    }, 100)

    // Timeout após 5 segundos
    setTimeout(() => {
      clearInterval(checkUser)
      if (!user.value) {
        console.error('❌ Usuário não autenticado após timeout')
        console.error('❌ Redirecionando para login...')
      }
    }, 5000)
  } else {
    console.log('✅ Usuário já disponível:', user.value.email)
    await loadSubjects()
    await loadChapters()
    await checkSubscription()
  }

  console.log('🚀 ===== FIM MONTAGEM NOTEBOOK =====')
})

// Methods
const loadSubjects = async () => {
  try {
    // Tentar pegar o usuário atual
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = user.value?.id || currentUser?.id

    if (!userId) {
      console.log('⏳ Aguardando autenticação do usuário...')
      return
    }

    console.log('🔍 Carregando cadernos para user:', userId)

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('❌ Erro Supabase ao carregar cadernos:', error)
      throw error
    }

    subjects.value = data || []
    console.log('✅ Cadernos carregados:', subjects.value.length, data)
  } catch (err) {
    console.error('❌ Erro ao carregar cadernos:', err)
  }
}

const loadChapters = async () => {
  try {
    // Tentar pegar o usuário atual
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = user.value?.id || currentUser?.id

    if (!userId) {
      console.log('⏳ Aguardando autenticação do usuário...')
      return
    }

    console.log('🔍 Carregando capítulos para user:', userId)

    // Primeiro, pegar todos os subject_ids do usuário
    const { data: userSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id')
      .eq('user_id', userId)

    if (subjectsError) {
      console.error('❌ Erro ao carregar subjects para chapters:', subjectsError)
      throw subjectsError
    }

    if (!userSubjects || userSubjects.length === 0) {
      chapters.value = []
      console.log('⚠️ Nenhum caderno encontrado')
      return
    }

    const subjectIds = userSubjects.map(s => s.id)
    console.log('📚 Cadernos encontrados:', subjectIds.length)

    // Agora buscar os capítulos desses subjects
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .in('subject_id', subjectIds)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('❌ Erro Supabase ao carregar capítulos:', error)
      throw error
    }

    chapters.value = data || []
    console.log('✅ Capítulos carregados:', chapters.value.length, data)
  } catch (err) {
    console.error('❌ Erro ao carregar capítulos:', err)
  }
}

const createSubject = async () => {
  try {
    loading.value = true

    console.log('=== Iniciando criação de caderno ===')
    console.log('User ref:', user.value)
    console.log('User ID:', user.value?.id)
    console.log('Nome do caderno:', subjectForm.value.name)

    // Verificar usuário via Supabase diretamente
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    console.log('Current user via getUser():', currentUser)
    console.log('User error:', userError)

    const userId = user.value?.id || currentUser?.id

    if (!userId) {
      console.error('❌ Usuário não autenticado')
      console.error('user.value:', user.value)
      console.error('currentUser:', currentUser)
      alert('Você precisa estar autenticado para criar um caderno')
      return
    }

    console.log('✅ User ID encontrado:', userId)

    const insertData = {
      user_id: userId,
      name: subjectForm.value.name
    }

    console.log('📤 Dados para inserir:', insertData)

    const { data, error } = await supabase
      .from('subjects')
      .insert(insertData)
      .select()
      .single()

    console.log('📥 Resposta do Supabase:')
    console.log('Data:', data)
    console.log('Error:', error)

    if (error) {
      console.error('❌ Erro ao criar caderno:', error)
      console.error('Código:', error.code)
      console.error('Mensagem:', error.message)
      console.error('Detalhes:', error.details)
      throw error
    }

    if (data) {
      console.log('✅ Caderno criado com sucesso:', data)
      console.log('ID do caderno criado:', data.id)
      console.log('Total de cadernos antes:', subjects.value.length)
      subjects.value.push(data)
      console.log('Total de cadernos depois:', subjects.value.length)
      subjectForm.value.name = ''
      showSubjectForm.value = false

      // Recarregar cadernos para confirmar
      await loadSubjects()
    }
  } catch (err: any) {
    console.error('❌ Erro ao criar caderno (catch):', err)
    alert('Erro ao criar caderno: ' + (err.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
    console.log('=== Fim da criação de caderno ===')
  }
}

const cancelSubjectForm = () => {
  subjectForm.value.name = ''
  showSubjectForm.value = false
}

const toggleSubject = (subjectId: string) => {
  console.log('🔄 toggleSubject chamado:', subjectId)
  expandedSubjects.value[subjectId] = !expandedSubjects.value[subjectId]
  console.log('📂 Expandido?', expandedSubjects.value[subjectId])
  if (expandedSubjects.value[subjectId]) {
    const subject = subjects.value.find(s => s.id === subjectId)
    selectedSubject.value = subject
    console.log('✅ Subject selecionado:', subject?.name)
  }
}

const getChaptersBySubject = (subjectId: string) => {
  return chapters.value.filter(c => c.subject_id === subjectId)
}

const chapterTitleInput = ref<HTMLInputElement | null>(null)

const openChapterForm = (subject: any) => {
  console.log('🔵 openChapterForm chamado para:', subject.name, 'ID:', subject.id)
  chapterForm.value.subject_id = subject.id
  chapterForm.value.title = ''
  selectedSubject.value = subject
  showChapterFormModal.value = true
  console.log('✅ Modal deve estar aberto:', showChapterFormModal.value)
  console.log('✅ Subject ID no form:', chapterForm.value.subject_id)

  // Focus input after modal opens
  nextTick(() => {
    chapterTitleInput.value?.focus()
  })
}

const createChapter = async () => {
  try {
    loading.value = true

    console.log('=== Iniciando criação de capítulo ===')
    console.log('Subject ID:', chapterForm.value.subject_id)
    console.log('Título:', chapterForm.value.title)

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        subject_id: chapterForm.value.subject_id,
        title: chapterForm.value.title,
        order_index: getChaptersBySubject(chapterForm.value.subject_id).length
      })
      .select()
      .single()

    console.log('Resposta do Supabase:')
    console.log('Data:', data)
    console.log('Error:', error)

    if (error) throw error

    if (data) {
      console.log('✅ Capítulo criado:', data)
      chapters.value.push(data)
      chapterForm.value = { title: '', subject_id: '' }
      showChapterFormModal.value = false

      // Recarregar capítulos
      await loadChapters()
    }
  } catch (err: any) {
    console.error('❌ Erro ao criar capítulo:', err)
    alert('Erro ao criar capítulo: ' + (err.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
  }
}

const cancelChapterForm = () => {
  chapterForm.value = { title: '', subject_id: '' }
  showChapterFormModal.value = false
}

const selectChapter = async (chapter: any) => {
  console.log('📖 selectChapter chamado:', chapter.title, 'ID:', chapter.id)
  selectedChapter.value = chapter
  selectedSubject.value = subjects.value.find(s => s.id === chapter.subject_id)
  console.log('✅ Capítulo selecionado:', chapter.title)
  console.log('✅ Caderno do capítulo:', selectedSubject.value?.name)

  // Load chapter pages/content
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('chapter_id', chapter.id)
      .order('order_index', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar página:', error)
      throw error
    }

    if (data) {
      console.log('✅ Página encontrada, carregando conteúdo...')
      chapterContent.value = data.content || ''
    } else {
      console.log('⚠️ Nenhuma página encontrada, criando nova...')
      // Create first page for chapter
      const { data: newPage, error: createError } = await supabase
        .from('pages')
        .insert({
          chapter_id: chapter.id,
          title: 'Conteúdo',
          content: '',
          order_index: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Erro ao criar página:', createError)
        throw createError
      }
      console.log('✅ Página criada com sucesso')
      chapterContent.value = ''
    }
  } catch (err) {
    console.error('❌ Erro ao carregar conteúdo:', err)
  }
}

const saveChapterContent = async () => {
  if (!selectedChapter.value) return

  try {
    saving.value = true

    // Get or create page for chapter
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id')
      .eq('chapter_id', selectedChapter.value.id)
      .limit(1)
      .single()

    if (existingPage) {
      const { error } = await supabase
        .from('pages')
        .update({ content: chapterContent.value })
        .eq('id', existingPage.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('pages')
        .insert({
          chapter_id: selectedChapter.value.id,
          title: 'Conteúdo',
          content: chapterContent.value,
          order_index: 0
        })

      if (error) throw error
    }
  } catch (err) {
    console.error('Erro ao salvar:', err)
  } finally {
    saving.value = false
  }
}

const showAIMenuForChapter = (event: MouseEvent, chapter: any) => {
  if (!isPro.value) {
    handleUpgrade()
    return
  }

  aiMenuContext.value = 'chapter'
  aiMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  showAIPopup.value = true
}

const handleAIAction = async (action: string, selectedText: string) => {
  if (!isPro.value) {
    handleUpgrade()
    return
  }

  switch (action) {
    case 'summary':
      await handleSummary(selectedText)
      break
    case 'explain':
      await handleExplain(selectedText)
      break
    case 'exercises':
      handleExercises(selectedText)
      break
  }
}

const handleAIMenuSelect = async (action: string) => {
  switch (action) {
    case 'summary':
      await handleSummary(chapterContent.value)
      break
    case 'explain':
      await handleExplain(chapterContent.value)
      break
    case 'exercises':
      handleExercises(chapterContent.value)
      break
    case 'flashcards':
      handleFlashcards(chapterContent.value)
      break
  }
}

const handleSummary = async (content: string) => {
  try {
    chatModalTitle.value = 'Resumo do Conteúdo'
    chatModalSubtitle.value = 'Gerado por IA'
    chatContext.value = content

    const summary = await generateSummary(content, selectedChapter.value?.title)
    chatInitialContent.value = summary

    showChatModal.value = true
  } catch (err) {
    console.error('Erro ao gerar resumo:', err)
  }
}

const handleExplain = async (content: string) => {
  try {
    chatModalTitle.value = 'Explicação Detalhada'
    chatModalSubtitle.value = 'Gerado por IA'
    chatContext.value = chapterContent.value

    const explanation = await explainSelection(content, chapterContent.value)
    chatInitialContent.value = explanation

    showChatModal.value = true
  } catch (err) {
    console.error('Erro ao gerar explicação:', err)
  }
}

const handleExercises = (content: string) => {
  exercisesContent.value = content
  showExercisesModal.value = true
}

const handleFlashcards = (content: string) => {
  flashcardsContent.value = content
  showFlashcardsModal.value = true
}

const handleUpgrade = () => {
  // TODO: Redirecionar para página de assinatura
  alert('Upgrade para o plano PRO para acessar recursos de IA!')
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openChapterMenu = (subject: any) => {
  openChapterForm(subject)
}

const showChapterContextMenu = (event: MouseEvent, chapter: any) => {
  // TODO: Implementar menu de contexto para capítulo (deletar, renomear, etc)
}

// Edit Functions
const startEditSubject = (subject: any) => {
  console.log('📝 Iniciando edição de caderno:', subject.name, 'ID:', subject.id)
  editingSubjectId.value = subject.id
  editingSubjectName.value = subject.name

  nextTick(() => {
    setTimeout(() => {
      const input = document.querySelector(`.subject-edit-input[data-subject-id="${subject.id}"]`) as HTMLInputElement
      console.log('🔍 Procurando input com data-subject-id:', subject.id)
      console.log('Input encontrado:', input)

      if (input) {
        console.log('✅ Input encontrado, focando...')
        input.focus()
        input.select()
      } else {
        console.error('❌ Input de edição não encontrado')
        console.log('editingSubjectId.value:', editingSubjectId.value)
        console.log('Todos os inputs:', document.querySelectorAll('.subject-edit-input'))
      }
    }, 50)
  })
}

const saveSubjectEdit = async (subjectId: string) => {
  console.log('💾 Salvando edição de caderno:', subjectId, editingSubjectName.value)

  if (!editingSubjectName.value.trim()) {
    console.log('⚠️ Nome vazio, cancelando')
    cancelSubjectEdit()
    return
  }

  try {
    const newName = editingSubjectName.value.trim()
    console.log('Atualizando para:', newName)

    const { error } = await supabase
      .from('subjects')
      .update({ name: newName })
      .eq('id', subjectId)

    console.log('Resposta do update:', error)

    if (error) throw error

    // Atualizar localmente
    const subject = subjects.value.find(s => s.id === subjectId)
    if (subject) {
      subject.name = newName
      console.log('✅ Caderno atualizado localmente:', subject)
    }

    console.log('✅ Caderno renomeado com sucesso no banco')
  } catch (err) {
    console.error('❌ Erro ao renomear caderno:', err)
    alert('Erro ao renomear caderno')
  } finally {
    cancelSubjectEdit()
  }
}

const cancelSubjectEdit = () => {
  editingSubjectId.value = null
  editingSubjectName.value = ''
}

const startEditChapter = (chapter: any) => {
  console.log('📝 Iniciando edição de capítulo:', chapter.title, 'ID:', chapter.id)
  editingChapterId.value = chapter.id
  editingChapterTitle.value = chapter.title

  nextTick(() => {
    setTimeout(() => {
      const input = document.querySelector(`.chapter-edit-input[data-chapter-id="${chapter.id}"]`) as HTMLInputElement
      console.log('🔍 Procurando input com data-chapter-id:', chapter.id)
      console.log('Input encontrado:', input)

      if (input) {
        console.log('✅ Input encontrado, focando...')
        input.focus()
        input.select()
      } else {
        console.error('❌ Input de edição não encontrado')
        console.log('editingChapterId.value:', editingChapterId.value)
        console.log('Todos os inputs:', document.querySelectorAll('.chapter-edit-input'))
      }
    }, 50)
  })
}

const saveChapterEdit = async (chapterId: string) => {
  console.log('💾 Salvando edição de capítulo:', chapterId, editingChapterTitle.value)

  if (!editingChapterTitle.value.trim()) {
    console.log('⚠️ Título vazio, cancelando')
    cancelChapterEdit()
    return
  }

  try {
    const newTitle = editingChapterTitle.value.trim()
    console.log('Atualizando para:', newTitle)

    const { error } = await supabase
      .from('chapters')
      .update({ title: newTitle })
      .eq('id', chapterId)

    console.log('Resposta do update:', error)

    if (error) throw error

    // Atualizar localmente
    const chapter = chapters.value.find(c => c.id === chapterId)
    if (chapter) {
      chapter.title = newTitle
      console.log('✅ Capítulo atualizado localmente:', chapter)
    }

    console.log('✅ Capítulo renomeado com sucesso no banco')
  } catch (err) {
    console.error('❌ Erro ao renomear capítulo:', err)
    alert('Erro ao renomear capítulo')
  } finally {
    cancelChapterEdit()
  }
}

const cancelChapterEdit = () => {
  editingChapterId.value = null
  editingChapterTitle.value = ''
}

// Delete Functions
const confirmDeleteSubject = (subject: any) => {
  deleteTarget.value = {
    type: 'subject',
    id: subject.id,
    name: subject.name
  }
  showDeleteModal.value = true
}

const confirmDeleteChapter = (chapter: any) => {
  deleteTarget.value = {
    type: 'chapter',
    id: chapter.id,
    name: chapter.title
  }
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!deleteTarget.value) return

  try {
    loading.value = true

    if (deleteTarget.value.type === 'subject') {
      // Excluir caderno (cascade vai excluir capítulos e páginas)
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', deleteTarget.value.id)

      if (error) throw error

      // Remover da lista local
      subjects.value = subjects.value.filter(s => s.id !== deleteTarget.value!.id)

      // Remover capítulos desse caderno da lista local
      chapters.value = chapters.value.filter(c => c.subject_id !== deleteTarget.value!.id)

      // Se estava selecionado, limpar seleção
      if (selectedSubject.value?.id === deleteTarget.value.id) {
        selectedSubject.value = null
        selectedChapter.value = null
        chapterContent.value = ''
      }

      console.log('✅ Caderno excluído com sucesso')
    } else {
      // Excluir capítulo
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', deleteTarget.value.id)

      if (error) throw error

      // Remover da lista local
      chapters.value = chapters.value.filter(c => c.id !== deleteTarget.value!.id)

      // Se estava selecionado, limpar seleção
      if (selectedChapter.value?.id === deleteTarget.value.id) {
        selectedChapter.value = null
        chapterContent.value = ''
      }

      console.log('✅ Capítulo excluído com sucesso')
    }

    showDeleteModal.value = false
    deleteTarget.value = null
  } catch (err) {
    console.error('❌ Erro ao excluir:', err)
    alert('Erro ao excluir')
  } finally {
    loading.value = false
  }
}

// Drag and Drop functions
const onSubjectDragEnd = async () => {
  console.log('📦 Reordenando cadernos...')

  // Atualizar order_index de todos os cadernos
  const updates = subjects.value.map((subject, index) => ({
    id: subject.id,
    order_index: index
  }))

  try {
    for (const update of updates) {
      await supabase
        .from('subjects')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
    }
    console.log('✅ Cadernos reordenados com sucesso')
  } catch (err) {
    console.error('❌ Erro ao reordenar cadernos:', err)
  }
}

const updateChapters = (subjectId: string, newChapters: any[]) => {
  // Atualizar a lista de capítulos localmente
  const otherChapters = chapters.value.filter(c => c.subject_id !== subjectId)
  chapters.value = [...otherChapters, ...newChapters]
}

const onChapterDragEnd = async () => {
  console.log('📦 Reordenando capítulos...')

  // Atualizar order_index de todos os capítulos
  const updates = chapters.value.map((chapter, index) => ({
    id: chapter.id,
    order_index: index
  }))

  try {
    for (const update of updates) {
      await supabase
        .from('chapters')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
    }
    console.log('✅ Capítulos reordenados com sucesso')
  } catch (err) {
    console.error('❌ Erro ao reordenar capítulos:', err)
  }
}
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}
</style>