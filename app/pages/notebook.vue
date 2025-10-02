<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">📝</div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Caderno Virtual</h1>
              <p class="text-gray-600">Organize suas anotações e conhecimento</p>
            </div>
          </div>
          <NuxtLink 
            to="/dashboard" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Voltar
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar - Notebooks and Sections -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Notebooks -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Cadernos</h3>
                <button 
                  @click="showNotebookForm = !showNotebookForm"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Novo
                </button>
              </div>
              
              <!-- New Notebook Form -->
              <div v-if="showNotebookForm" class="mb-3 p-3 bg-gray-50 rounded-lg">
                <form @submit.prevent="createNotebook" class="space-y-2">
                  <input 
                    v-model="notebookForm.name" 
                    type="text" 
                    placeholder="Nome do caderno"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <select 
                    v-model="notebookForm.subject_id" 
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sem matéria específica</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                  <div class="flex gap-2">
                    <button 
                      type="submit" 
                      :disabled="loading"
                      class="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Criar
                    </button>
                    <button 
                      type="button" 
                      @click="showNotebookForm = false"
                      class="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              <!-- Notebooks List -->
              <div class="space-y-1">
                <div 
                  v-for="notebook in notebooks" 
                  :key="notebook.id"
                  @click="selectNotebook(notebook)"
                  class="p-2 rounded-lg cursor-pointer transition-colors"
                  :class="selectedNotebook?.id === notebook.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'"
                >
                  <div class="text-sm font-medium text-gray-900">{{ notebook.name }}</div>
                  <div v-if="notebook.subject_name" class="text-xs text-gray-500">{{ notebook.subject_name }}</div>
                </div>
              </div>
            </div>

            <!-- Sections -->
            <div v-if="selectedNotebook" class="p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Seções</h3>
                <button 
                  @click="showSectionForm = !showSectionForm"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Nova
                </button>
              </div>

              <!-- New Section Form -->
              <div v-if="showSectionForm" class="mb-3 p-3 bg-gray-50 rounded-lg">
                <form @submit.prevent="createSection" class="space-y-2">
                  <input 
                    v-model="sectionForm.name" 
                    type="text" 
                    placeholder="Nome da seção"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div class="flex gap-2">
                    <button 
                      type="submit" 
                      :disabled="loading"
                      class="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Criar
                    </button>
                    <button 
                      type="button" 
                      @click="showSectionForm = false"
                      class="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              <!-- Sections List -->
              <div class="space-y-1">
                <div 
                  v-for="section in sections" 
                  :key="section.id"
                  @click="selectSection(section)"
                  class="p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                  :class="selectedSection?.id === section.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'"
                >
                  <span class="text-sm text-gray-900">{{ section.name }}</span>
                  <button 
                    @click.stop="deleteSection(section.id)"
                    class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content - Pages -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Pages Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ selectedSection ? `${selectedSection.name} - Páginas` : 'Selecione uma seção' }}
                  </h2>
                  <p v-if="selectedNotebook && selectedSection" class="text-sm text-gray-600">
                    {{ selectedNotebook.name }} > {{ selectedSection.name }}
                  </p>
                </div>
                <button 
                  v-if="selectedSection"
                  @click="showPageForm = !showPageForm"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Nova Página
                </button>
              </div>
            </div>

            <!-- New Page Form -->
            <div v-if="showPageForm && selectedSection" class="p-6 border-b border-gray-200 bg-gray-50">
              <form @submit.prevent="createPage" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Título da página</label>
                  <input 
                    v-model="pageForm.title" 
                    type="text" 
                    placeholder="Ex: Aula 01 - Introdução ao Direito Constitucional"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                  <textarea 
                    v-model="pageForm.content" 
                    rows="8" 
                    placeholder="Digite suas anotações aqui..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  ></textarea>
                </div>
                <div class="flex gap-3">
                  <button 
                    type="submit" 
                    :disabled="loading || !pageForm.title"
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Salvar Página
                  </button>
                  <button 
                    type="button" 
                    @click="cancelPageForm"
                    class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>

            <!-- Pages List -->
            <div class="p-6">
              <div v-if="!selectedSection" class="text-center py-12">
                <div class="text-6xl mb-4">📚</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Selecione uma seção</h3>
                <p class="text-gray-600">Escolha um caderno e uma seção para ver suas páginas</p>
              </div>

              <div v-else-if="pages.length === 0" class="text-center py-12">
                <div class="text-6xl mb-4">📄</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma página ainda</h3>
                <p class="text-gray-600 mb-4">Crie sua primeira página de anotações</p>
                <button 
                  @click="showPageForm = true"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Criar Primeira Página
                </button>
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="page in pages" 
                  :key="page.id"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  @click="selectPage(page)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-lg font-medium text-gray-900 mb-2">{{ page.title }}</h4>
                      <p v-if="page.content" class="text-gray-600 text-sm line-clamp-3">
                        {{ page.content.substring(0, 150) }}{{ page.content.length > 150 ? '...' : '' }}
                      </p>
                      <div class="flex items-center mt-3 text-xs text-gray-500">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                        </svg>
                        {{ formatDate(page.created_at) }}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                      <button 
                        @click.stop="editPage(page)"
                        class="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        @click.stop="deletePage(page.id)"
                        class="text-red-600 hover:text-red-700 p-1"
                        title="Excluir"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div v-if="error || success" class="px-6 pb-6">
              <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="text-red-800">{{ error }}</span>
              </div>
              
              <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-green-800">{{ success }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)
const error = ref('')
const success = ref('')

const notebookId = ref('')
const sectionId = ref('')

const pages = ref([])
const pageForm = ref({ title: '', content: '' })

onMounted(async () => {
  await ensureNotebookAndSection()
  await loadPages()
})

const ensureNotebookAndSection = async () => {
  error.value = ''
  try {
    if (!user.value) return
    // Notebook
    let { data: notebooks, error: nErr } = await supabase.from('notebooks').select('id').eq('user_id', user.value.id).limit(1)
    if (nErr) throw nErr
    if (!notebooks || notebooks.length === 0) {
      const { data: ins, error: iErr } = await supabase.from('notebooks').insert({ user_id: user.value.id, title: 'Meu Caderno' }).select('id').single()
      if (iErr) throw iErr
      notebookId.value = ins?.id || ''
    } else {
      notebookId.value = notebooks[0].id
    }
    // Section
    let { data: sections, error: sErr } = await supabase.from('notebook_sections').select('id').eq('notebook_id', notebookId.value).limit(1)
    if (sErr) throw sErr
    if (!sections || sections.length === 0) {
      const { data: sIns, error: sIErr } = await supabase.from('notebook_sections').insert({ notebook_id: notebookId.value, title: 'Geral' }).select('id').single()
      if (sIErr) throw sIErr
      sectionId.value = sIns?.id || ''
    } else {
      sectionId.value = sections[0].id
    }
  } catch (e) {
    error.value = e?.message || 'Erro ao preparar caderno'
  }
}

const loadPages = async () => {
  try {
    if (!sectionId.value) return
    const { data, error: err } = await supabase.from('notebook_pages').select('id, title, created_at').eq('notebook_section_id', sectionId.value).order('created_at', { ascending: false })
    if (err) throw err
    pages.value = data || []
  } catch (e) {
    error.value = e?.message || 'Erro ao carregar páginas'
  }
}

const createPage = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = ''
    if (!user.value || !sectionId.value) return
    const { data, error: err } = await supabase.from('notebook_pages').insert({ notebook_section_id: sectionId.value, title: pageForm.value.title, content: pageForm.value.content }).select('id, title, created_at').single()
    if (err) throw err
    pages.value.unshift(data)
    pageForm.value = { title: '', content: '' }
    success.value = 'Página criada com sucesso!'
  } catch (e) {
    error.value = e?.message || 'Erro ao criar página'
  } finally {
    loading.value = false
  }
}

const deletePage = async (id) => {
  try {
    loading.value = true
    error.value = ''
    success.value = ''
    const { error: err } = await supabase.from('notebook_pages').delete().eq('id', id)
    if (err) throw err
    pages.value = pages.value.filter(p => p.id !== id)
  } catch (e) {
    error.value = e?.message || 'Erro ao excluir página'
  } finally {
    loading.value = false
  }
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString()
}
</script>