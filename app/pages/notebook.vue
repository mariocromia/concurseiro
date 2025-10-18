<template>
  <div class="min-h-screen bg-[#faf9f5] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">


    <!-- Overlay for search (clicável para fechar) -->
    <div
      v-show="showInlineSearch"
      @click="showInlineSearch = false; inlineSearchQuery = ''; inlineResults = []"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-30 transition-opacity duration-200"
      :class="[
        showInlineSearch ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      ]"
      title="Clique para fechar a busca"
    ></div>

    <!-- Advanced Search Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showInlineSearch"
        class="fixed top-20 left-0 right-0 bg-dark-900/98 backdrop-blur-xl border border-dark-700 shadow-2xl max-h-[75vh] flex flex-col z-50"
      >
        <!-- Fixed Header -->
        <div class="sticky top-0 bg-dark-900/98 backdrop-blur-xl border-b border-dark-700 z-10">
          <div class="max-w-4xl mx-auto px-6 py-6">
            <div class="flex items-start gap-4">
              <!-- Search Input -->
              <div class="flex-1">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref="searchInput"
                    v-model="inlineSearchQuery"
                    @input="performInlineSearch"
                    type="text"
                    placeholder="Digite para buscar... (use + para múltiplos termos: dia+lindo)"
                    class="w-full pl-12 pr-4 py-3.5 bg-dark-800 border-2 border-dark-600 text-claude-text dark:text-white text-base placeholder-gray-500 rounded-claude-lg focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500 transition-all"
                    autofocus
                  />
                </div>
              </div>

              <!-- Close/Clear Button -->
              <button
                @click.stop="inlineSearchQuery ? (inlineSearchQuery = '', inlineResults = []) : (showInlineSearch = false)"
                class="flex-shrink-0 p-2 text-claude-text-secondary dark:text-gray-400 hover:text-claude-text dark:text-white hover:bg-dark-700 rounded-claude-md transition-colors"
                :title="inlineSearchQuery ? 'Limpar busca' : 'Fechar busca'"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                v-for="filter in searchFilters"
                :key="filter.value"
                @click="toggleInlineFilter(filter.value)"
                :class="[
                  'px-3 py-1.5 rounded-claude-md text-sm font-medium transition-all',
                  activeInlineFilters.includes(filter.value)
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-dark-800 text-claude-text-secondary dark:text-gray-400 hover:bg-dark-700 hover:text-claude-text dark:text-white'
                ]"
              >
                {{ filter.icon }} {{ filter.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-4xl mx-auto px-6 py-6">

          <!-- Initial State -->
          <div v-if="!inlineSearchQuery && !searchingInline" class="text-center py-12 text-gray-600 dark:text-gray-500">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-lg font-medium text-claude-text dark:text-white">Buscar nos Cadernos</p>
            <p class="text-sm mt-2">Digite acima para buscar em cadernos, capítulos, conteúdos e lembretes</p>
          </div>

          <!-- Loading -->
          <div v-else-if="searchingInline" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-claude-primary dark:border-primary-500"></div>
            <p class="text-claude-text-secondary dark:text-gray-400 mt-4">Buscando...</p>
          </div>

          <!-- No Results -->
          <div v-else-if="inlineSearchQuery && inlineResults.length === 0" class="text-center py-12 text-gray-600 dark:text-gray-500">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-lg font-medium">Nenhum resultado encontrado</p>
            <p class="text-sm mt-2">Tente buscar por outros termos</p>
          </div>

          <!-- Results -->
          <div v-else-if="inlineResults.length > 0" class="space-y-5">
            <div class="text-sm text-claude-text-secondary dark:text-gray-400 mb-4">
              <span class="font-medium text-claude-text dark:text-white">{{ inlineResults.length }}</span> resultado(s) encontrado(s)
            </div>

            <div
              v-for="result in inlineResults"
              :key="result.id"
              @click="handleInlineResultClick(result)"
              class="group cursor-pointer p-4 rounded-claude-lg bg-dark-800/50 hover:bg-dark-700/70 border border-dark-600 hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
            >
              <!-- Title -->
              <h3 class="text-lg mb-1.5">
                <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" v-html="getSubjectNameInline(result)"></span>
                <span v-if="getChapterNameInline(result)" class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors"> › </span>
                <span v-if="getChapterNameInline(result)" class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" v-html="getChapterNameInline(result)"></span>
              </h3>

              <!-- Meta -->
              <div class="flex items-center gap-3 text-xs mb-2">
                <span class="text-green-600">{{ formatDateInline(result.date) }}</span>
                <span v-if="result.matchCount > 1" class="text-gray-600 dark:text-gray-500">•</span>
                <span v-if="result.matchCount > 1" class="text-claude-text-secondary dark:text-gray-400">{{ result.matchCount }} ocorrência(s)</span>
              </div>

              <!-- Snippet -->
              <div class="text-sm text-claude-text-secondary dark:text-gray-400 leading-relaxed" v-html="highlightTextInline(result.snippet)"></div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Transition>


    <div class="flex h-[calc(100vh-73px)]">
      <!-- Modern Compact Sidebar -->
      <aside class="w-80 bg-dark-900/50 border-r border-dark-700/50 overflow-y-auto flex-shrink-0">
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-dark-700/50 bg-dark-800/30">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-claude-text-secondary dark:text-gray-400 uppercase tracking-wider">Meus Cadernos</h3>
            <button
              @click="showSubjectForm = !showSubjectForm"
              class="p-1 hover:bg-dark-700 rounded transition-colors"
              title="Adicionar caderno"
            >
              <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400 hover:text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>

          <!-- Compact Subject Form -->
          <Transition
            enter-active-class="transition-all ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="showSubjectForm" class="mt-2">
              <form @submit.prevent="createSubject" class="space-y-2">
                <input
                  v-model="subjectForm.name"
                  type="text"
                  placeholder="Nome do caderno..."
                  class="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-700 text-claude-text dark:text-white placeholder-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500"
                  required
                />
                <div class="flex gap-1.5">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="flex-1 px-3 py-1.5 text-sm bg-claude-primary/20 dark:bg-primary-500/20 border border-claude-primary dark:border-primary-500/30 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors rounded hover:bg-primary-500/30 disabled:opacity-50 font-medium transition-all"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    @click="cancelSubjectForm"
                    class="px-3 py-1.5 text-sm border border-dark-700 text-gray-600 dark:text-gray-500 rounded hover:bg-dark-700 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>

        <!-- Subjects Tree -->
        <div class="p-3">
          <div v-if="subjects.length === 0 && !showSubjectForm" class="text-center py-12 px-3">
            <svg class="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <p class="text-sm text-gray-600 dark:text-gray-500 mb-2">Nenhum caderno</p>
            <button
              @click="showSubjectForm = true"
              class="text-sm text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors hover:text-primary-300 transition-colors"
            >
              Criar primeiro caderno
            </button>
          </div>

          <draggable
            v-model="subjects"
            @end="onSubjectDragEnd"
            item-key="id"
            handle=".drag-handle"
            ghost-class="opacity-50 bg-claude-primary/20 dark:bg-primary-500/20"
            chosen-class="shadow-lg shadow-primary-500/50 scale-105"
            drag-class="opacity-0"
            class="space-y-1"
          >
            <template #item="{ element: subject }">
              <div class="mb-0.5">
                <div
                  class="flex items-center justify-between px-3 py-2 rounded hover:bg-dark-800/50 transition-colors group"
                  :class="{ 'bg-dark-800/70 border-l-2 border-claude-primary dark:border-primary-500': selectedSubject?.id === subject.id }"
                >
                  <div class="flex items-center space-x-1.5 flex-1 min-w-0">
                    <!-- Drag Handle -->
                    <svg
                      class="w-4 h-4 text-gray-700 hover:text-gray-600 dark:text-gray-500 cursor-move drag-handle flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      title="Arrastar"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>

                    <svg
                      @click.stop="toggleSubject(subject.id)"
                      class="w-4 h-4 text-gray-600 transition-transform cursor-pointer flex-shrink-0"
                      :class="{ 'rotate-90': expandedSubjects[subject.id] }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>

                    <!-- Nome ou Input de Edição -->
                    <input
                      v-if="editingSubjectId === subject.id"
                      v-model="editingSubjectName"
                      @blur="saveSubjectEdit(subject.id)"
                      @keyup.enter="saveSubjectEdit(subject.id)"
                      @keyup.esc="cancelSubjectEdit"
                      :data-subject-id="subject.id"
                      class="subject-edit-input flex-1 px-2 py-1 text-sm bg-dark-900 border border-claude-primary dark:border-primary-500 text-claude-text dark:text-white rounded focus:outline-none"
                      @click.stop
                    />
                    <span
                      v-else
                      @click.stop="toggleSubject(subject.id)"
                      @dblclick.stop="startEditSubject(subject)"
                      class="text-sm font-medium text-claude-text-secondary dark:text-gray-300 cursor-pointer hover:text-claude-text dark:text-white transition-colors flex-1 truncate"
                      title="Duplo clique para editar"
                    >
                      {{ subject.name }}
                    </span>
                  </div>

                  <div class="flex items-center space-x-0.5 flex-shrink-0">
                    <button
                      @click.stop="openChapterMenu(subject)"
                      class="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-claude-primary/20 dark:bg-primary-500/20 rounded transition-all"
                      title="Adicionar capítulo"
                    >
                      <svg class="w-4 h-4 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                    <button
                      @click.stop="confirmDeleteSubject(subject)"
                      class="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition-all"
                      title="Excluir caderno"
                    >
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Chapters -->
                <div v-if="expandedSubjects[subject.id]" class="ml-6 mt-1 space-y-1 relative">
                  <!-- Vertical Line -->
                  <div class="absolute left-4 top-0 bottom-0 w-px bg-primary-500/30"></div>

                  <draggable
                    :model-value="getChaptersBySubject(subject.id)"
                    @update:model-value="(newChapters) => updateChapters(subject.id, newChapters)"
                    @end="onChapterDragEnd"
                    item-key="id"
                    handle=".chapter-drag-handle"
                    ghost-class="opacity-50 bg-claude-primary/20 dark:bg-primary-500/20"
                    chosen-class="shadow-lg shadow-primary-500/50 scale-105"
                    drag-class="opacity-0"
                    class="space-y-1"
                  >
                    <template #item="{ element: chapter }">
                      <div
                        class="flex items-center justify-between p-2 rounded-claude-md cursor-pointer hover:bg-dark-700/50 transition-colors group relative"
                        :class="{ 'bg-claude-primary/20 dark:bg-primary-500/20 border border-claude-primary dark:border-primary-500/50': selectedChapter?.id === chapter.id }"
                      >
                        <!-- Connection Dot / Drag Icon -->
                        <div class="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                          <!-- Bolinha (visível por padrão) -->
                          <div class="w-2 h-2 rounded-full bg-primary-400 border-2 border-dark-800 group-hover:hidden"></div>
                          <!-- Ícone de arrastar (visível no hover) -->
                          <svg class="hidden group-hover:block chapter-drag-handle cursor-move w-4 h-4 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors hover:text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                          </svg>
                        </div>
                        <div class="flex items-center space-x-2 flex-1 pl-8">
                          <!-- Título ou Input de Edição -->
                          <input
                            v-if="editingChapterId === chapter.id"
                            v-model="editingChapterTitle"
                            @blur="handleChapterBlur(chapter.id)"
                            @keydown.enter="(e) => { e.preventDefault(); handleChapterEnter(chapter.id); }"
                            @keydown.esc="handleChapterEsc(chapter.id)"
                            :data-chapter-id="chapter.id"
                            class="chapter-edit-input flex-1 px-2 py-1 text-sm bg-dark-900 border border-claude-primary dark:border-primary-500 text-claude-text dark:text-white rounded focus:outline-none"
                            @click.stop
                          />
                          <span
                            v-else
                            @click.stop="selectChapter(chapter)"
                            @dblclick.stop="startEditChapter(chapter)"
                            class="text-sm text-claude-text-secondary dark:text-gray-300 cursor-pointer hover:text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors transition-colors flex-1"
                            title="Duplo clique para editar"
                          >
                            {{ chapter.title }}
                          </span>
                        </div>

                        <div class="flex items-center space-x-1">
                          <button
                            v-if="isPro"
                            @click.stop="showAIMenuForChapter($event, chapter)"
                            class="opacity-0 group-hover:opacity-100 px-2 py-1 hover:bg-purple-500/20 rounded transition-all flex items-center space-x-1"
                            title="Assistente IA"
                          >
                            <svg class="w-3.5 h-3.5 text-purple-400 hover:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-xs text-purple-400">IA</span>
                          </button>
                          <button
                            @click.stop="confirmDeleteChapter(chapter)"
                            class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                            title="Excluir capítulo"
                          >
                            <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
                    class="w-full text-left p-2 pl-8 text-sm text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors hover:bg-dark-700/50 rounded-claude-md transition-colors flex items-center space-x-1"
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
        <div v-if="false" class="p-4 bg-red-900 text-claude-text dark:text-white text-xs font-mono">
          <div>✅ selectedChapter: {{ selectedChapter?.title || 'NULL' }}</div>
          <div>✅ selectedChapter ID: {{ selectedChapter?.id || 'NULL' }}</div>
          <div>✅ selectedSubject: {{ selectedSubject?.name || 'NULL' }}</div>
          <div>✅ chapterContent length: {{ chapterContent?.length || 0 }}</div>
          <div>✅ chapters total: {{ chapters.length }}</div>
        </div>

        <!-- News Feed (quando nenhum capítulo está selecionado) -->
        <div v-if="!selectedChapter" class="p-8 max-w-7xl ml-0 mr-auto">
          <div class="mb-6">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-sm text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors font-medium mb-1 flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                  </svg>
                  <span>Central de Estudos</span>
                </div>
                <h2 class="text-3xl font-bold text-claude-text dark:text-white mb-2">Notícias</h2>
                <p class="text-sm text-gray-600 dark:text-gray-500">Fique por dentro das principais notícias sobre educação e concursos públicos</p>
              </div>
            </div>

            <!-- Search Button -->
            <div class="mt-4 flex items-center justify-end">
              <button
                @click="showInlineSearch = true"
                class="px-3 py-2 bg-dark-800 border border-dark-600 text-claude-text dark:text-white rounded-claude-md hover:bg-dark-700 transition-colors flex items-center space-x-2"
                title="Buscar nos cadernos"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Buscar</span>
              </button>
            </div>
          </div>

          <!-- Loading News -->
          <div v-if="loadingNews" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-claude-primary dark:border-primary-500"></div>
            <p class="text-claude-text-secondary dark:text-gray-400 mt-4">Carregando notícias...</p>
          </div>

          <!-- News Cards Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              v-for="newsItem in concursosNews.slice(0, 6)"
              :key="newsItem.id"
              class="bg-dark-800/50 border border-dark-600 rounded-claude-lg p-6 hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer"
            >
              <div class="mb-4">
                <svg class="w-12 h-12 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-claude-text dark:text-white mb-2">{{ newsItem.title }}</h3>
              <p class="text-claude-text-secondary dark:text-gray-400 text-sm mb-4">{{ newsItem.description }}</p>
              <div class="text-sm text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex items-center space-x-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>{{ getRelativeTime(newsItem.date) }}</span>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="mt-8 p-8 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-claude-primary dark:border-primary-500/30 rounded-claude-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-claude-text dark:text-white mb-1 flex items-center space-x-2">
                  <svg class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  <span>Comece a Estudar</span>
                </h3>
                <p class="text-claude-text-secondary dark:text-gray-400 text-sm">Selecione um caderno ao lado para começar seus estudos</p>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500">
                <span>← Criar ou selecionar caderno</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter Content -->
        <div v-else-if="selectedChapter" class="flex flex-col h-full">
          <!-- Fixed Header Area -->
          <div class="flex-shrink-0 px-8 pt-4 pb-2 bg-[#faf9f5] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
            <div class="mb-3 flex items-start justify-between max-w-7xl ml-0 mr-auto">
              <div>
                <div class="text-sm text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors font-medium mb-1">{{ selectedSubject?.name }}</div>
                <h2 class="text-3xl font-bold text-claude-text dark:text-white mb-2">{{ selectedChapter.title }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-500">Última atualização: {{ formatDate(selectedChapter.updated_at || selectedChapter.created_at) }}</p>
              </div>
            </div>

            <!-- Action Buttons (Buscar, Autosave, Salvar, Exportar PDF) -->
            <div class="mb-2 flex items-center justify-end space-x-2 max-w-7xl ml-0 mr-auto">
            <!-- Search Button -->
            <button
              @click="showInlineSearch = true"
              class="px-3 py-2 bg-dark-800 border border-dark-600 text-claude-text dark:text-white rounded-claude-md hover:bg-dark-700 transition-colors flex items-center space-x-2"
              title="Buscar nos cadernos"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <!-- Autosave Toggle -->
            <button
              @click="toggleAutosave"
              :class="[
                'px-3 py-2 rounded-claude-md transition-all font-medium flex items-center space-x-2 text-sm',
                autoSaveEnabled
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                  : 'bg-dark-800 border border-dark-600 text-claude-text-secondary dark:text-gray-400 hover:bg-dark-700'
              ]"
              :title="autoSaveEnabled ? 'Autosave ativado' : 'Autosave desativado'"
            >
              <span>{{ autoSaveEnabled ? '✓' : '○' }}</span>
              <span>{{ autoSaveEnabled ? 'Autosave ON' : 'Autosave OFF' }}</span>
            </button>

            <!-- Save Button (só aparece quando autosave está OFF) -->
            <button
              v-if="!autoSaveEnabled"
              @click="saveChapterContent"
              :disabled="saving"
              class="px-4 py-2 bg-claude-primary/20 dark:bg-primary-500/20 border border-claude-primary/30 text-primary-300 rounded-claude-md hover:bg-primary-500/30 hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500/50 transition-all font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span>
            </button>

            <!-- Exportar PDF Button -->
            <button
              v-if="selectedChapter"
              @click="exportToPDF"
              class="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-claude-md hover:bg-red-600/30 hover:border-red-500/50 transition-all font-medium flex items-center space-x-2"
              title="Exportar capítulo para PDF"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <span>Exportar PDF</span>
            </button>
            </div>
          </div>

          <!-- Scrollable Editor Area -->
          <div class="flex-1 overflow-y-auto px-8 pb-8">
            <div class="max-w-7xl ml-0 mr-auto">
              <!-- Rich Content Editor -->
              <RichContentEditor
                v-model="chapterContent"
                :is-pro="isPro"
                :subject-id="selectedSubject?.id"
                :subject-name="selectedSubject?.name"
                @ai-action="handleAIAction"
                @upgrade="handleUpgrade"
              />
            </div>
          </div>
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
        <div class="bg-dark-800 border border-dark-700 rounded-claude-lg shadow-2xl w-full max-w-md" @click.stop>
          <div class="p-6">
            <h3 class="text-lg font-bold text-claude-text dark:text-white mb-4">Novo Capítulo</h3>
            <form @submit.prevent="createChapter" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Título do capítulo</label>
                <input
                  ref="chapterTitleInput"
                  v-model="chapterForm.title"
                  type="text"
                  placeholder="Ex: Capítulo 1 - Introdução"
                  class="w-full px-4 py-2 bg-dark-900 border border-dark-600 text-claude-text dark:text-white placeholder-gray-500 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500"
                  required
                  autofocus
                />
              </div>
              <div class="flex gap-3">
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex-1 px-4 py-2 bg-primary-500 text-claude-text dark:text-white rounded-claude-md hover:bg-primary-600 disabled:opacity-50 font-medium"
                >
                  Criar Capítulo
                </button>
                <button
                  type="button"
                  @click="cancelChapterForm"
                  class="flex-1 px-4 py-2 border border-dark-600 text-claude-text-secondary dark:text-gray-400 rounded-claude-md hover:bg-dark-700 font-medium"
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
        <div class="bg-dark-800 border border-red-500/50 rounded-claude-lg shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-claude-text dark:text-white">Confirmar Exclusão</h3>
                <p class="text-sm text-claude-text-secondary dark:text-gray-400">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div class="bg-dark-900/50 rounded-claude-md p-4 mb-6">
              <p class="text-sm text-claude-text-secondary dark:text-gray-300 mb-2">
                Você está prestes a excluir {{ deleteTarget?.type === 'subject' ? 'o caderno' : 'o capítulo' }}:
              </p>
              <p class="text-claude-text dark:text-white font-semibold">"{{ deleteTarget?.name }}"</p>
              <p v-if="deleteTarget?.type === 'subject'" class="text-xs text-red-400 mt-2">
                ⚠️ Todos os capítulos e conteúdos deste caderno também serão excluídos!
              </p>
            </div>

            <div class="flex gap-3">
              <button
                @click="executeDelete"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-red-600 text-claude-text dark:text-white rounded-claude-md hover:bg-red-700 disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ loading ? 'Excluindo...' : 'Sim, excluir' }}</span>
              </button>
              <button
                @click="showDeleteModal = false"
                :disabled="loading"
                class="flex-1 px-4 py-2 border border-dark-600 text-claude-text-secondary dark:text-gray-400 rounded-claude-md hover:bg-dark-700 font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Smart Search Modal -->
    <SmartSearch
      :is-visible="showSmartSearch"
      @close="showSmartSearch = false"
      @select="handleSearchResult"
    />
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { generateSummary, explainSelection } = useGemini()
const { news: concursosNews, loading: loadingNews, fetchNews, getRelativeTime } = useConcursosNews()

// State
const loading = ref(false)
const saving = ref(false)
const isPro = ref(false)

// Carregar estado do autosave do localStorage (SSR-safe)
// IMPORTANTE: localStorage só existe no browser, não no servidor (SSR)
const autoSaveEnabled = ref(false)
let autoSaveInterval: NodeJS.Timeout | null = null

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

// Save content when changing chapters
const previousChapter = ref<any>(null)

watch(() => selectedChapter.value, async (newChapter, oldChapter) => {
  console.log('📚 selectedChapter mudou:', newChapter?.title || 'null')
  console.log('📚 selectedChapter value:', newChapter)

  // Save previous chapter content before switching
  if (oldChapter && chapterContent.value && previousChapter.value) {
    console.log('💾 Salvando capítulo anterior antes de trocar:', oldChapter.title)
    await saveChapterContentSilently(oldChapter.id)
  }

  previousChapter.value = newChapter
}, { immediate: true })

// Debug chapter content changes
watch(() => chapterContent.value, (newContent) => {
  console.log('💾 chapterContent mudou! Tamanho:', newContent?.length || 0, 'Primeiros 50 chars:', newContent?.substring(0, 50))
})

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

// Smart Search
const showSmartSearch = ref(false)

// Inline Search
const inlineSearchQuery = ref('')
const showInlineSearch = ref(false)
const searchingInline = ref(false)
const inlineResults = ref<any[]>([])
const activeInlineFilters = ref(['all'])
const searchInput = ref<HTMLInputElement | null>(null)
const searchFilters = [
  { value: 'all', label: 'Todos', icon: '' },
  { value: 'subjects', label: 'Cadernos', icon: '' },
  { value: 'chapters', label: 'Capítulos', icon: '' },
  { value: 'content', label: 'Conteúdo', icon: '' },
  { value: 'reminders', label: 'Lembretes', icon: '' }
]

// Watch for search modal opening to focus input
watch(() => showInlineSearch.value, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

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

  // SSR-safe: window/localStorage só existem no cliente
  if (process.client && typeof window !== 'undefined') {
    console.log('🚀 URL:', window.location.href)

    // Restaurar estado do autosave do localStorage
    const savedAutosave = localStorage.getItem('autosave-enabled')
    if (savedAutosave !== null) {
      autoSaveEnabled.value = savedAutosave === 'true'
    }
  }

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

  // Carregar notícias
  await fetchNews()

  // Inicializar autosave se estiver ativado
  if (autoSaveEnabled.value) {
    autoSaveInterval = setInterval(() => {
      if (selectedChapter.value && chapterContent.value) {
        console.log('💾 Autosave executado')
        saveChapterContent()
      }
    }, 30000) // 30 segundos
    console.log('✅ Autosave INICIADO automaticamente (30s)')
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

const openChapterForm = async (subject: any) => {
  console.log('🔵 openChapterForm chamado para:', subject.name, 'ID:', subject.id)

  try {
    loading.value = true

    // Criar capítulo com título padrão
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        subject_id: subject.id,
        title: 'Novo Capítulo',
        order_index: getChaptersBySubject(subject.id).length
      })
      .select()
      .single()

    if (error) throw error

    if (data) {
      console.log('✅ Capítulo criado:', data)
      chapters.value.push(data)

      // Expandir o subject se não estiver expandido
      expandedSubjects.value[subject.id] = true

      // Entrar em modo de edição imediatamente
      editingChapterId.value = data.id
      editingChapterTitle.value = data.title

      // Focar no input após um pequeno delay
      nextTick(() => {
        setTimeout(() => {
          const input = document.querySelector(`.chapter-edit-input[data-chapter-id="${data.id}"]`) as HTMLInputElement
          if (input) {
            input.focus()
            input.select()
          }
        }, 100)
      })
    }
  } catch (err: any) {
    console.error('❌ Erro ao criar capítulo:', err)
    alert('Erro ao criar capítulo: ' + (err.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
  }
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

  console.log('💾 Salvando conteúdo do capítulo:', selectedChapter.value.title)
  console.log('💾 Conteúdo a salvar (tamanho):', chapterContent.value?.length || 0)
  console.log('💾 Primeiros 100 chars:', chapterContent.value?.substring(0, 100))

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
      console.log('💾 Atualizando página existente, ID:', existingPage.id)
      const { error } = await supabase
        .from('pages')
        .update({ content: chapterContent.value })
        .eq('id', existingPage.id)

      if (error) throw error
      console.log('✅ Conteúdo atualizado com sucesso!')
    } else {
      console.log('💾 Criando nova página para o capítulo')
      const { error } = await supabase
        .from('pages')
        .insert({
          chapter_id: selectedChapter.value.id,
          title: 'Conteúdo',
          content: chapterContent.value,
          order_index: 0
        })

      if (error) throw error
      console.log('✅ Nova página criada com sucesso!')
    }

    // Update chapter's updated_at timestamp
    const { error: chapterError } = await supabase
      .from('chapters')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', selectedChapter.value.id)

    if (chapterError) {
      console.error('⚠️ Erro ao atualizar timestamp do capítulo:', chapterError)
    } else {
      console.log('✅ Timestamp do capítulo atualizado')
      // Update local chapter object
      selectedChapter.value.updated_at = new Date().toISOString()
      const chapterIndex = chapters.value.findIndex(c => c.id === selectedChapter.value.id)
      if (chapterIndex !== -1) {
        chapters.value[chapterIndex].updated_at = selectedChapter.value.updated_at
      }
    }
  } catch (err) {
    console.error('❌ Erro ao salvar:', err)
  } finally {
    saving.value = false
  }
}

// Silent save function (without loading state)
const saveChapterContentSilently = async (chapterId: string) => {
  if (!chapterId || !chapterContent.value) return

  try {
    console.log('🔇 Salvamento silencioso do capítulo:', chapterId)

    const { data: existingPage } = await supabase
      .from('pages')
      .select('id')
      .eq('chapter_id', chapterId)
      .limit(1)
      .single()

    if (existingPage) {
      await supabase
        .from('pages')
        .update({ content: chapterContent.value })
        .eq('id', existingPage.id)
    } else {
      await supabase
        .from('pages')
        .insert({
          chapter_id: chapterId,
          title: 'Conteúdo',
          content: chapterContent.value,
          order_index: 0
        })
    }

    // Update chapter's updated_at timestamp
    await supabase
      .from('chapters')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chapterId)

    // Update local chapter object if it's the selected one
    if (selectedChapter.value?.id === chapterId) {
      selectedChapter.value.updated_at = new Date().toISOString()
    }
    const chapterIndex = chapters.value.findIndex(c => c.id === chapterId)
    if (chapterIndex !== -1) {
      chapters.value[chapterIndex].updated_at = new Date().toISOString()
    }

    console.log('✅ Salvamento silencioso concluído')
  } catch (err) {
    console.error('❌ Erro no salvamento silencioso:', err)
  }
}

// Export to PDF function
const exportToPDF = () => {
  if (!selectedChapter.value || !chapterContent.value) {
    alert('Nenhum conteúdo para exportar')
    return
  }

  // Create a new window with the content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Permita pop-ups para exportar PDF')
    return
  }

  // Build the HTML content for printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${selectedChapter.value.title}</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          .page-break { page-break-before: always; }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: #000;
        }
        p { margin: 0.5em 0; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 8px; text-align: left; }
        blockquote {
          margin: 1em 0;
          padding: 10px 20px;
          background: #f5f5f5;
          border-left: 4px solid #666;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
        pre {
          background: #f4f4f4;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>${selectedChapter.value.title}</h1>
      <hr>
      ${chapterContent.value}
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
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

const toggleAutosave = () => {
  autoSaveEnabled.value = !autoSaveEnabled.value

  // Salvar estado no localStorage (SSR-safe)
  if (process.client && typeof window !== 'undefined') {
    localStorage.setItem('autosave-enabled', autoSaveEnabled.value.toString())
  }

  if (autoSaveEnabled.value) {
    // Salvar imediatamente
    saveChapterContent()

    // Configurar autosave a cada 30 segundos
    autoSaveInterval = setInterval(() => {
      if (selectedChapter.value && chapterContent.value) {
        console.log('💾 Autosave executado')
        saveChapterContent()
      }
    }, 30000) // 30 segundos

    console.log('✅ Autosave ATIVADO (30s)')
  } else {
    // Desativar autosave
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
    console.log('❌ Autosave DESATIVADO')
  }
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

const handleSearchResult = async (result: any) => {
  console.log('🔍 Resultado selecionado:', result)

  if (result.type === 'subject') {
    // Navigate to subject
    const subject = subjects.value.find(s => s.id === result.data.id)
    if (subject) {
      expandedSubjects.value[subject.id] = true
      selectedSubject.value = subject
      selectedChapter.value = null
      chapterContent.value = ''
    }
  } else if (result.type === 'chapter') {
    // Navigate to chapter
    const subject = subjects.value.find(s => s.id === result.data.subject_id)
    if (subject) {
      expandedSubjects.value[subject.id] = true
      selectedSubject.value = subject

      // Load chapter
      await selectChapter(result.data)
    }
  } else if (result.type === 'content') {
    // Navigate to chapter with content
    const subject = subjects.value.find(s => s.id === result.data.chapters?.subject_id)
    if (subject) {
      expandedSubjects.value[subject.id] = true
      selectedSubject.value = subject

      // Load chapter
      const chapter = chapters.value.find(c => c.id === result.data.chapter_id)
      if (chapter) {
        await selectChapter(chapter)
      }
    }
  } else if (result.type === 'reminder') {
    // Find subject by ID from reminder
    const subject = subjects.value.find(s => s.id === result.data.subjectId)
    if (subject) {
      expandedSubjects.value[subject.id] = true
      selectedSubject.value = subject
      alert(`Lembrete encontrado no caderno "${subject.name}":\n\n${result.data.content}`)
    }
  }
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

const isSavingChapter = ref(false)
const isEnterPressed = ref(false)

const saveChapterEdit = async (chapterId: string) => {
  // Evitar múltiplas chamadas simultâneas
  if (isSavingChapter.value) {
    console.log('⏸️ Já está salvando, ignorando...')
    return
  }

  isSavingChapter.value = true

  console.log('💾 Salvando edição de capítulo:', chapterId, editingChapterTitle.value)

  try {
    const newTitle = editingChapterTitle.value.trim() || 'Novo Capítulo'
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
    isSavingChapter.value = false
  }
}

const cancelChapterEdit = () => {
  editingChapterId.value = null
  editingChapterTitle.value = ''
}

const handleChapterEnter = async (chapterId: string) => {
  console.log('🎯 handleChapterEnter CHAMADO!')
  console.log('🔵 Enter pressionado, salvando:', editingChapterTitle.value)
  console.log('🔵 Chapter ID:', chapterId)

  // Marcar que Enter foi pressionado para evitar que blur execute novamente
  isEnterPressed.value = true

  await saveChapterEdit(chapterId)

  // Resetar flag após salvar
  setTimeout(() => {
    isEnterPressed.value = false
  }, 100)
}

const handleChapterBlur = async (chapterId: string) => {
  // Só executar blur se não estiver salvando e Enter não foi pressionado
  if (!isSavingChapter.value && !isEnterPressed.value) {
    console.log('🔵 Blur executado')
    await saveChapterEdit(chapterId)
  } else {
    console.log('🔵 Blur ignorado (Enter foi pressionado ou já está salvando)')
  }
}

const handleChapterEsc = async (chapterId: string) => {
  console.log('🔵 ESC pressionado, cancelando edição')
  cancelChapterEdit()
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
  // Atualizar a lista de capítulos localmente com os novos índices
  const otherChapters = chapters.value.filter(c => c.subject_id !== subjectId)

  // Atualizar order_index para cada capítulo reordenado
  const updatedChapters = newChapters.map((chapter, index) => ({
    ...chapter,
    order_index: index
  }))

  chapters.value = [...otherChapters, ...updatedChapters]
}

const onChapterDragEnd = async () => {
  console.log('📦 Reordenando capítulos...')

  // Agrupar capítulos por caderno e atualizar order_index
  const chaptersBySubject = chapters.value.reduce((acc, chapter) => {
    if (!acc[chapter.subject_id]) {
      acc[chapter.subject_id] = []
    }
    acc[chapter.subject_id].push(chapter)
    return acc
  }, {} as Record<string, any[]>)

  try {
    // Atualizar order_index para cada grupo de capítulos
    for (const subjectId in chaptersBySubject) {
      const subjectChapters = chaptersBySubject[subjectId]
      for (let i = 0; i < subjectChapters.length; i++) {
        await supabase
          .from('chapters')
          .update({ order_index: i })
          .eq('id', subjectChapters[i].id)
      }
    }
    console.log('✅ Capítulos reordenados com sucesso')
  } catch (err) {
    console.error('❌ Erro ao reordenar capítulos:', err)
  }
}

// Save before leaving page
onBeforeUnmount(async () => {
  if (selectedChapter.value && chapterContent.value) {
    console.log('🚪 Salvando antes de sair da página...')
    await saveChapterContentSilently(selectedChapter.value.id)
  }
})

// Save before navigating away
if (process.client) {
  window.addEventListener('beforeunload', async (e) => {
    if (selectedChapter.value && chapterContent.value) {
      e.preventDefault()
      await saveChapterContentSilently(selectedChapter.value.id)
    }
  })
}

// Inline Search Functions

// Helper function to check if multiple terms are within proximity (100 chars)
const checkTermsProximity = (text: string, terms: string[], maxDistance: number = 100): boolean => {
  const lowerText = text.toLowerCase()
  const lowerTerms = terms.map(t => t.toLowerCase())

  // Find all positions of all terms
  const positions: { term: string, index: number }[] = []

  lowerTerms.forEach(term => {
    let index = lowerText.indexOf(term)
    while (index !== -1) {
      positions.push({ term, index })
      index = lowerText.indexOf(term, index + 1)
    }
  })

  // Check if we have all terms
  const foundTerms = new Set(positions.map(p => p.term))
  if (foundTerms.size !== lowerTerms.length) {
    return false
  }

  // Sort positions by index
  positions.sort((a, b) => a.index - b.index)

  // Check if all terms appear within maxDistance characters
  for (let i = 0; i < positions.length; i++) {
    const group = [positions[i]]
    const termsInGroup = new Set([positions[i].term])

    for (let j = i + 1; j < positions.length; j++) {
      if (positions[j].index - positions[i].index <= maxDistance) {
        group.push(positions[j])
        termsInGroup.add(positions[j].term)

        // If we found all terms within distance, return true
        if (termsInGroup.size === lowerTerms.length) {
          return true
        }
      }
    }
  }

  return false
}

// Helper function to extract snippet with all terms highlighted
const extractMultiTermSnippet = (text: string, terms: string[]): string => {
  const lowerText = text.toLowerCase()
  const lowerTerms = terms.map(t => t.toLowerCase())

  // Find first occurrence where all terms are within 100 chars
  const positions: { term: string, index: number }[] = []

  lowerTerms.forEach(term => {
    let index = lowerText.indexOf(term)
    while (index !== -1) {
      positions.push({ term, index })
      index = lowerText.indexOf(term, index + 1)
    }
  })

  positions.sort((a, b) => a.index - b.index)

  // Find the best group of terms
  let bestStart = 0
  let bestEnd = 0

  for (let i = 0; i < positions.length; i++) {
    const termsInGroup = new Set([positions[i].term])
    let groupEnd = positions[i].index

    for (let j = i + 1; j < positions.length; j++) {
      if (positions[j].index - positions[i].index <= 100) {
        termsInGroup.add(positions[j].term)
        groupEnd = positions[j].index + positions[j].term.length

        if (termsInGroup.size === lowerTerms.length) {
          bestStart = positions[i].index
          bestEnd = groupEnd
          break
        }
      }
    }

    if (bestEnd > 0) break
  }

  // Extract snippet around the found terms
  const snippetStart = Math.max(0, bestStart - 80)
  const snippetEnd = Math.min(text.length, bestEnd + 120)
  let snippet = text.substring(snippetStart, snippetEnd)

  if (snippetStart > 0) snippet = '...' + snippet
  if (snippetEnd < text.length) snippet = snippet + '...'

  return snippet
}

const performInlineSearch = async () => {
  const query = inlineSearchQuery.value.trim()

  if (!query) {
    inlineResults.value = []
    return
  }

  searchingInline.value = true
  const results: any[] = []

  try {
    // Check if query uses + operator for multiple terms
    const hasMultipleTerms = query.includes('+')
    const searchTerms = hasMultipleTerms
      ? query.split('+').map(t => t.trim()).filter(t => t.length > 0)
      : [query]

    const isSubjectsOnly = activeInlineFilters.value.includes('subjects') &&
                           activeInlineFilters.value.length === 1
    const isChaptersOnly = activeInlineFilters.value.includes('chapters') &&
                           activeInlineFilters.value.length === 1
    const isContentOnly = activeInlineFilters.value.includes('content') &&
                          activeInlineFilters.value.length === 1
    const isRemindersOnly = activeInlineFilters.value.includes('reminders') &&
                            activeInlineFilters.value.length === 1

    // Search subjects (only if 'subjects' filter is explicitly selected)
    if (isSubjectsOnly) {
      for (const subject of subjects.value) {
        if (subject.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: `subject-${subject.id}`,
            type: 'subject',
            data: subject,
            snippet: subject.name,
            date: subject.created_at,
            matchCount: 1,
            relevance: 10
          })

          // Return only first result
          break
        }
      }
    }

    // Search chapters (if 'all' or 'chapters' is active)
    if (activeInlineFilters.value.includes('all') || isChaptersOnly) {
      for (const chapter of chapters.value) {
        if (chapter.title.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: `chapter-${chapter.id}`,
            type: 'chapter',
            data: chapter,
            snippet: chapter.title,
            date: chapter.created_at,
            matchCount: 1,
            relevance: 8
          })

          // If filtering only by chapters, return only first result
          if (isChaptersOnly) {
            break
          }
        }
      }
    }

    // Search content (if 'all' or 'content' is active)
    if (activeInlineFilters.value.includes('all') || isContentOnly) {
      // For multiple terms, search for first term and filter locally
      const searchQuery = hasMultipleTerms ? searchTerms[0] : query

      const { data: pages } = await supabase
        .from('pages')
        .select('*, chapters!inner(id, title, subject_id)')
        .ilike('content', `%${searchQuery}%`)
        .limit(isContentOnly ? 10 : 1000)

      if (pages) {
        for (const page of pages) {
          // If multiple terms, check proximity
          if (hasMultipleTerms) {
            if (!checkTermsProximity(page.content, searchTerms)) {
              continue
            }
            // Use multi-term snippet extraction
            const snippet = extractMultiTermSnippet(page.content, searchTerms)
            const matchCount = searchTerms.length

            results.push({
              id: `content-${page.id}`,
              type: 'content',
              data: page,
              snippet,
              date: page.updated_at || page.created_at,
              matchCount,
              relevance: 6
            })
          } else {
            // Single term search
            const snippet = extractSnippetInline(page.content, query)
            const matchCount = (page.content.match(new RegExp(query, 'gi')) || []).length

            results.push({
              id: `content-${page.id}`,
              type: 'content',
              data: page,
              snippet,
              date: page.updated_at || page.created_at,
              matchCount,
              relevance: 6
            })
          }

          // If filtering only by content, return only first result
          if (isContentOnly && results.length > 0) {
            break
          }
        }
      }
    }

    // Search reminders (if 'all' or 'reminders' is active)
    if (activeInlineFilters.value.includes('all') || isRemindersOnly) {
      // SSR-safe: localStorage só existe no cliente
      const allReminders = process.client && typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('study-reminders') || '[]')
        : []
      for (const reminder of allReminders) {
        // For multiple terms, check proximity
        if (hasMultipleTerms) {
          if (!checkTermsProximity(reminder.content, searchTerms)) {
            continue
          }
          const snippet = extractMultiTermSnippet(reminder.content, searchTerms)
          const matchCount = searchTerms.length

          results.push({
            id: `reminder-${reminder.id}`,
            type: 'reminder',
            data: reminder,
            snippet,
            date: reminder.createdAt,
            matchCount,
            relevance: 5
          })
        } else {
          // Single term search
          if (reminder.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              id: `reminder-${reminder.id}`,
              type: 'reminder',
              data: reminder,
              snippet: reminder.content.substring(0, 150) + (reminder.content.length > 150 ? '...' : ''),
              date: reminder.createdAt,
              matchCount: 1,
              relevance: 5
            })
          }
        }

        // If filtering only by reminders, return only first result
        if (isRemindersOnly && results.length > 0) {
          break
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)
    inlineResults.value = results

  } catch (err) {
    console.error('Erro ao buscar:', err)
  } finally {
    searchingInline.value = false
  }
}

const clearInlineSearch = () => {
  inlineSearchQuery.value = ''
  inlineResults.value = []
  showInlineSearch.value = false
}

const toggleInlineFilter = (filterValue: string) => {
  if (filterValue === 'all') {
    activeInlineFilters.value = ['all']
  } else {
    // Remove 'all' if present
    const hasAll = activeInlineFilters.value.includes('all')

    if (hasAll) {
      // If 'all' is active, switch to only the clicked filter
      activeInlineFilters.value = [filterValue]
    } else {
      // Toggle the clicked filter
      const index = activeInlineFilters.value.indexOf(filterValue)
      if (index > -1) {
        activeInlineFilters.value.splice(index, 1)
      } else {
        activeInlineFilters.value.push(filterValue)
      }

      // If no filters remain, set to 'all'
      if (activeInlineFilters.value.length === 0) {
        activeInlineFilters.value = ['all']
      }
    }
  }

  // Re-run search
  performInlineSearch()
}

const handleInlineResultClick = async (result: any) => {
  // Close search
  showInlineSearch.value = false

  // Use the same navigation logic as smart search
  await handleSearchResult(result)
}

const getSubjectNameInline = (result: any): string => {
  let subjectName = ''

  if (result.type === 'subject') {
    subjectName = result.data.name
  } else if (result.type === 'chapter') {
    const subject = subjects.value.find(s => s.id === result.data.subject_id)
    subjectName = subject?.name || 'Caderno'
  } else if (result.type === 'content') {
    const subject = subjects.value.find(s => s.id === result.data.chapters?.subject_id)
    subjectName = subject?.name || 'Caderno'
  } else if (result.type === 'reminder') {
    const subject = subjects.value.find(s => s.id === result.data.subjectId)
    subjectName = subject?.name || 'Caderno'
  }

  return highlightTextInline(subjectName)
}

const getChapterNameInline = (result: any): string => {
  if (result.type === 'chapter') {
    return highlightTextInline(result.data.title)
  } else if (result.type === 'content') {
    return highlightTextInline(result.data.chapters?.title || '')
  }
  return ''
}

const highlightTextInline = (text: string): string => {
  if (!text || !inlineSearchQuery.value) return text

  const query = inlineSearchQuery.value.trim()
  const hasMultipleTerms = query.includes('+')

  if (hasMultipleTerms) {
    const terms = query.split('+').map(t => t.trim()).filter(t => t.length > 0)
    let result = text
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      result = result.replace(regex, '<strong>$1</strong>')
    })
    return result
  } else {
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<strong>$1</strong>')
  }
}

const extractSnippetInline = (text: string, query: string): string => {
  if (!text) return ''

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text.substring(0, 200) + '...'

  const contextBefore = 80
  const contextAfter = 120
  const start = Math.max(0, index - contextBefore)
  const end = Math.min(text.length, index + query.length + contextAfter)

  let snippet = text.substring(start, end)

  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

const formatDateInline = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}
</style>
