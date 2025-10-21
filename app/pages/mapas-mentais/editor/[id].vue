<template>
  <div class="h-screen bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 flex flex-col relative overflow-hidden">
    <!-- Efeito de fundo animado -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
    </div>

    <!-- Toolbar -->
    <div class="bg-dark-800/80 backdrop-blur-xl border-b border-dark-700/50 px-4 py-3 flex items-center justify-between shadow-xl z-10">
      <div class="flex items-center gap-4">
        <button
          @click="navigateTo('/mapas-mentais/biblioteca')"
          class="text-claude-text-secondary dark:text-gray-400 hover:text-claude-text dark:text-white transition p-2 hover:bg-dark-700 rounded-claude-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          v-model="title"
          @blur="saveTitle"
          type="text"
          class="bg-transparent text-claude-text dark:text-white font-semibold text-lg border-none focus:outline-none focus:ring-0 px-2 py-1 hover:bg-dark-700 rounded transition"
          placeholder="Título do mapa..."
        >
        <div v-if="saving" class="flex items-center gap-2 text-sm text-claude-text-secondary dark:text-gray-400">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Salvando...</span>
        </div>
        <div v-else-if="lastSaved" class="text-sm text-gray-600 dark:text-gray-500">
          Salvo {{ lastSaved }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Undo/Redo -->
        <div class="flex gap-1 mr-2">
          <button
            @click="undo"
            :disabled="!canUndo"
            class="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Desfazer (Ctrl+Z)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            @click="redo"
            :disabled="!canRedo"
            class="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Refazer (Ctrl+Y)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        <!-- Auto-layout -->
        <div class="relative" ref="layoutMenuRef">
          <button
            @click="layoutMenuOpen = !layoutMenuOpen"
            class="px-4 py-2 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition flex items-center gap-2 shadow-lg hover:shadow-primary-500/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Layout
          </button>

          <div v-if="layoutMenuOpen" class="absolute top-full mt-2 right-0 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-20 min-w-[200px]">
            <button @click="applyLayout('tree')" class="w-full px-4 py-3 text-left text-white hover:bg-dark-700 transition flex items-center gap-3">
              <span>🌳</span>
              <span>Árvore Vertical</span>
            </button>
            <button @click="applyLayout('horizontal')" class="w-full px-4 py-3 text-left text-white hover:bg-dark-700 transition flex items-center gap-3">
              <span>➡️</span>
              <span>Árvore Horizontal</span>
            </button>
            <button @click="applyLayout('radial')" class="w-full px-4 py-3 text-left text-white hover:bg-dark-700 transition flex items-center gap-3">
              <span>⭕</span>
              <span>Radial (Circular)</span>
            </button>
            <button @click="applyLayout('force')" class="w-full px-4 py-3 text-left text-white hover:bg-dark-700 transition flex items-center gap-3">
              <span>🎯</span>
              <span>Organizado</span>
            </button>
          </div>
        </div>

        <!-- Buscar -->
        <div class="relative" ref="searchMenuRef">
          <button
            @click="searchOpen = !searchOpen"
            class="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
            title="Buscar (Ctrl+F)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <div v-if="searchOpen" class="absolute top-full mt-2 right-0 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl p-3 z-20 w-64">
            <input
              v-model="searchQuery"
              @input="searchNodes"
              type="text"
              placeholder="Buscar nós..."
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
            <div v-if="searchResults.length > 0" class="mt-2 max-h-60 overflow-y-auto space-y-1">
              <button
                v-for="node in searchResults"
                :key="node.id"
                @click="focusNode(node)"
                class="w-full px-3 py-2 text-left text-white hover:bg-dark-700 rounded-lg transition text-sm"
              >
                {{ node.data.text }}
              </button>
            </div>
          </div>
        </div>

        <!-- Exportar -->
        <button
          @click="exportImage"
          class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition flex items-center gap-2 shadow-lg hover:shadow-purple-500/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Exportar PNG
        </button>

        <!-- Salvar -->
        <button
          @click="saveNodes"
          :disabled="saving"
          class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-400 transition flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-green-500/20"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>

        <!-- Adicionar -->
        <button
          @click="addNode"
          class="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-500 hover:to-primary-400 transition flex items-center gap-2 shadow-lg hover:shadow-primary-500/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar
        </button>

        <!-- Deletar -->
        <button
          v-if="selectedNode"
          @click="deleteSelectedNode"
          class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-400 transition flex items-center gap-2 shadow-lg hover:shadow-red-500/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Deletar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-primary dark:border-primary-500 mx-auto mb-4"></div>
        <p class="text-claude-text-secondary dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>

    <!-- Vue Flow Canvas -->
    <div v-else class="flex-1 relative">
      <VueFlow
        v-model="elements"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
        @nodes-change="handleNodesChange"
        @edges-change="handleEdgesChange"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @pane-click="onPaneClick"
        class="bg-dark-800"
      >
        <Background pattern-color="#374151" :gap="16" />
        <Controls />
        <MiniMap />

        <template #node-custom="{ data, id }">
          <div
            @mouseenter="onNodeHoverStart(id)"
            @mouseleave="onNodeHoverEnd"
            :style="{
              backgroundColor: data.color || '#ca643f',
              transform: selectedNode?.id === id ? 'scale(1.05)' : 'scale(1)'
            }"
            :class="[
              'group relative px-5 py-4 rounded-2xl shadow-2xl border-2 min-w-[180px] cursor-pointer transition-all duration-300',
              connectingFrom === id && isDragging
                ? 'border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.6)] ring-4 ring-blue-400/50 scale-105'
                : selectedNode?.id === id
                ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] ring-4 ring-white/30 animate-pulse-slow'
                : hoveredNodeId === id && isDragging
                ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.6)] ring-4 ring-green-400/50 scale-105'
                : 'border-white/20 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            ]"
          >
            <!-- Handles para conexões - 4 direções -->
            <!-- Handle TOP -->
            <div
              @mousedown.stop="startConnection(id, $event, 'top')"
              @click.stop="(e) => console.log('[HANDLE CLICK] TOP clicado do nó:', id)"
              :class="[
                'handle-top absolute left-1/2 -translate-x-1/2 -top-2.5 w-5 h-5 rounded-full border-2 transition-all cursor-crosshair shadow-lg',
                connectingFrom === id && connectingFromHandle === 'top' && isDragging
                  ? 'bg-blue-400 border-blue-500 scale-150 opacity-100 ring-4 ring-blue-400/50 z-50'
                  : hoveredNodeId === id && hoveredHandle === 'top' && isDragging
                  ? 'bg-green-400 border-green-500 scale-150 opacity-100 ring-4 ring-green-400/50 z-50'
                  : 'bg-white border-primary-500 opacity-0 group-hover:opacity-100 hover:scale-125 hover:bg-primary-100 z-20'
              ]"
              :data-node-id="id"
              :data-handle="'top'"
              title="Arraste para conectar (TOPO)"
            ></div>

            <!-- Handle BOTTOM -->
            <div
              @mousedown.stop="startConnection(id, $event, 'bottom')"
              @click.stop="(e) => console.log('[HANDLE CLICK] BOTTOM clicado do nó:', id)"
              :class="[
                'handle-bottom absolute left-1/2 -translate-x-1/2 -bottom-2.5 w-5 h-5 rounded-full border-2 transition-all cursor-crosshair shadow-lg',
                connectingFrom === id && connectingFromHandle === 'bottom' && isDragging
                  ? 'bg-blue-400 border-blue-500 scale-150 opacity-100 ring-4 ring-blue-400/50 z-50'
                  : hoveredNodeId === id && hoveredHandle === 'bottom' && isDragging
                  ? 'bg-green-400 border-green-500 scale-150 opacity-100 ring-4 ring-green-400/50 z-50'
                  : 'bg-white border-primary-500 opacity-0 group-hover:opacity-100 hover:scale-125 hover:bg-primary-100 z-20'
              ]"
              :data-node-id="id"
              :data-handle="'bottom'"
              title="Arraste para conectar (BAIXO)"
            ></div>

            <!-- Handle LEFT -->
            <div
              @mousedown.stop="startConnection(id, $event, 'left')"
              @click.stop="(e) => console.log('[HANDLE CLICK] LEFT clicado do nó:', id)"
              :class="[
                'handle-left absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-all cursor-crosshair shadow-lg',
                connectingFrom === id && connectingFromHandle === 'left' && isDragging
                  ? 'bg-blue-400 border-blue-500 scale-150 opacity-100 ring-4 ring-blue-400/50 z-50'
                  : hoveredNodeId === id && hoveredHandle === 'left' && isDragging
                  ? 'bg-green-400 border-green-500 scale-150 opacity-100 ring-4 ring-green-400/50 z-50'
                  : 'bg-white border-primary-500 opacity-0 group-hover:opacity-100 hover:scale-125 hover:bg-primary-100 z-20'
              ]"
              :data-node-id="id"
              :data-handle="'left'"
              title="Arraste para conectar (ESQUERDA)"
            ></div>

            <!-- Handle RIGHT -->
            <div
              @mousedown.stop="startConnection(id, $event, 'right')"
              @click.stop="(e) => console.log('[HANDLE CLICK] RIGHT clicado do nó:', id)"
              :class="[
                'handle-right absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-all cursor-crosshair shadow-lg',
                connectingFrom === id && connectingFromHandle === 'right' && isDragging
                  ? 'bg-blue-400 border-blue-500 scale-150 opacity-100 ring-4 ring-blue-400/50 z-50'
                  : hoveredNodeId === id && hoveredHandle === 'right' && isDragging
                  ? 'bg-green-400 border-green-500 scale-150 opacity-100 ring-4 ring-green-400/50 z-50'
                  : 'bg-white border-primary-500 opacity-0 group-hover:opacity-100 hover:scale-125 hover:bg-primary-100 z-20'
              ]"
              :data-node-id="id"
              :data-handle="'right'"
              title="Arraste para conectar (DIREITA)"
            ></div>

            <!-- Ícone baseado no conteúdo -->
            <div class="flex items-center gap-3">
              <span v-if="getNodeIcon(data.text) !== '📌'" class="text-2xl flex-shrink-0 filter drop-shadow-lg">{{ getNodeIcon(data.text) }}</span>

              <div class="flex-1">
                <div v-if="editingNodeId === data.id" class="relative">
                  <input
                    ref="nodeInput"
                    v-model="data.text"
                    @blur="stopEditing"
                    @keyup.enter="stopEditing"
                    @keyup.esc="stopEditing"
                    class="w-full bg-white/20 text-white font-semibold text-center border-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-3 py-2 backdrop-blur-sm"
                    @click.stop
                  >
                </div>
                <div
                  v-else
                  @dblclick="startEditing(data.id)"
                  class="text-white font-semibold text-center leading-tight hover:text-white/90 transition"
                >
                  {{ data.text }}
                </div>

                <!-- Nota/descrição preview -->
                <div v-if="data.note && !editingNodeId" class="mt-2 text-xs text-white/70 text-center italic line-clamp-2">
                  {{ data.note }}
                </div>
              </div>
            </div>

            <!-- Botão de expandir/colapsar (se tiver filhos) -->
            <button
              v-if="getChildrenCount(id) > 0"
              @click.stop="toggleNodeCollapse(id)"
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              <svg v-if="!isNodeCollapsed(id)" class="w-3 h-3 text-dark-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else class="w-3 h-3 text-dark-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <!-- Glow effect no hover -->
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </template>
      </VueFlow>

      <!-- Botão X para deletar edge selecionada - DIRETAMENTE NA LINHA -->
      <div
        v-if="selectedEdge && edgeDeleteButtonPosition"
        @click.stop="deleteSelectedEdge"
        :style="{
          position: 'fixed',
          left: edgeDeleteButtonPosition.x + 'px',
          top: edgeDeleteButtonPosition.y + 'px',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }"
        class="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all hover:scale-110 border-2 border-white"
        title="Deletar conexão"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <!-- Instrução de conexão -->
      <div
        v-if="isDragging && connectingFrom"
        class="absolute top-20 left-1/2 -translate-x-1/2 bg-dark-800/95 backdrop-blur-xl border border-primary-500/50 rounded-2xl px-6 py-3 shadow-2xl z-50 flex items-center gap-3 animate-bounce-slow"
      >
        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span class="text-white font-medium">Arraste até outro nó para conectar</span>
      </div>

      <!-- Linha de conexão removida - não mostrar durante arraste -->

      <!-- Panel Lateral (quando nó selecionado) -->
      <Transition name="slide-panel">
        <div
          v-if="selectedNode"
          class="absolute right-4 top-4 w-96 bg-dark-800/95 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 shadow-2xl z-20"
        >
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-white text-lg flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Propriedades
            </h3>
            <button
              @click="selectedNode = null"
              class="text-gray-400 hover:text-white transition p-1 hover:bg-dark-700 rounded-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <!-- Texto -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Título
              </label>
              <input
                v-model="selectedNode.data.text"
                @input="debouncedSave"
                type="text"
                class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                placeholder="Digite o título..."
              >
            </div>

            <!-- Nota/Descrição -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Nota/Descrição
              </label>
              <textarea
                v-model="selectedNode.data.note"
                @input="debouncedSave"
                rows="4"
                class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                placeholder="Adicione uma descrição ou nota..."
              ></textarea>
            </div>

            <!-- Cor -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Cor do Nó
              </label>
              <div class="grid grid-cols-6 gap-2.5">
                <button
                  v-for="color in colors"
                  :key="color"
                  @click="changeNodeColor(color)"
                  :style="{ backgroundColor: color }"
                  :class="[
                    'w-10 h-10 rounded-xl border-3 transition-all duration-200 shadow-lg hover:scale-110',
                    selectedNode.data.color === color
                      ? 'border-white scale-110 ring-4 ring-white/30'
                      : 'border-white/20 hover:border-white/50'
                  ]"
                  :title="color"
                ></button>
              </div>
            </div>

            <!-- Ações -->
            <div class="space-y-2 pt-2 border-t border-dark-700">
              <button
                @click="addChildNode"
                class="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-500 hover:to-primary-400 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-500/20"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Nó Filho
              </button>

              <button
                @click="duplicateNode"
                class="w-full py-3 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicar Nó
              </button>

              <div class="text-xs text-gray-500 text-center pt-2 flex items-center justify-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lembre-se de clicar em "Salvar" após fazer alterações
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Tutorial/Ajuda rápida -->
    <Transition name="slide-panel">
      <div
        v-if="showHelp"
        class="fixed bottom-4 left-24 w-96 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-6 shadow-2xl z-30 text-white"
      >
        <button
          @click="showHelp = false"
          class="absolute top-3 right-3 text-white/80 hover:text-white transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="font-bold text-xl mb-3 flex items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Dicas Rápidas
        </h3>

        <div class="space-y-3 text-sm">
          <div class="flex items-start gap-2">
            <span class="text-lg">🖱️</span>
            <div>
              <strong>Duplo clique:</strong> editar texto do nó
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-lg">⌨️</span>
            <div>
              <strong>Ctrl+Z / Ctrl+Y:</strong> desfazer/refazer
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-lg">🔍</span>
            <div>
              <strong>Ctrl+F:</strong> buscar nós
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-lg">🎨</span>
            <div>
              <strong>Clique no nó:</strong> abrir painel de propriedades
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-lg">📐</span>
            <div>
              <strong>Layout:</strong> organize automaticamente seu mapa
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-lg">💾</span>
            <div>
              <strong>Importante:</strong> sempre clique em "Salvar" após editar!
            </div>
          </div>
        </div>

        <button
          @click="showHelp = false"
          class="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl transition font-medium"
        >
          Entendi!
        </button>
      </div>
    </Transition>

    <!-- Botão flutuante de ajuda -->
    <button
      v-if="!showHelp"
      @click="showHelp = true"
      class="fixed bottom-4 left-24 w-14 h-14 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-30"
      title="Ajuda"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-claude-md shadow-lg backdrop-blur-sm border flex items-center gap-3 min-w-[300px]',
            toast.type === 'success'
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 border-claude-primary dark:border-primary-500/50 text-primary-100'
              : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="flex-1 font-medium">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const loading = ref(true)
const saving = ref(false)
const title = ref('')
const lastSaved = ref('')
const elements = ref([])
const selectedNode = ref<any>(null)
const editingNodeId = ref<string | null>(null)
const nodeInput = ref<HTMLInputElement | null>(null)
const saveTimeout = ref<any>(null)

// Sistema de notificações toast
const toasts = ref<Array<{ id: number, message: string, type: 'success' | 'error' }>>([])
let toastIdCounter = 0

// Undo/Redo
const history = ref<any[]>([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// Layout menu
const layoutMenuOpen = ref(false)
const layoutMenuRef = ref<HTMLElement | null>(null)

// Search
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchMenuRef = ref<HTMLElement | null>(null)

// Collapsed nodes
const collapsedNodes = ref<Set<string>>(new Set())

// Help panel
const showHelp = ref(false)

// Connection dragging
const connectingFrom = ref<string | null>(null)
const connectingFromHandle = ref<'top' | 'bottom' | 'left' | 'right' | null>(null)
const connectingFromPos = ref<{ x: number, y: number } | null>(null)
const connectionLine = ref<{ x: number, y: number } | null>(null)
const isDragging = ref(false)
const hoveredNodeId = ref<string | null>(null)
const hoveredHandle = ref<'top' | 'bottom' | 'left' | 'right' | null>(null)

// Edge selection
const selectedEdge = ref<any>(null)

// Posição do botão X na edge selecionada (ponto médio da linha)
const edgeDeleteButtonPosition = computed(() => {
  if (!selectedEdge.value) return null

  // Encontrar nós de origem e destino
  const sourceNode = elements.value.find((el: any) => el.id === selectedEdge.value.source && el.type === 'custom')
  const targetNode = elements.value.find((el: any) => el.id === selectedEdge.value.target && el.type === 'custom')

  if (!sourceNode || !targetNode) return null

  // Pegar elementos DOM dos nós para obter posição na tela
  const sourceElement = document.querySelector(`[data-id="${sourceNode.id}"]`)
  const targetElement = document.querySelector(`[data-id="${targetNode.id}"]`)

  if (!sourceElement || !targetElement) return null

  const sourceRect = sourceElement.getBoundingClientRect()
  const targetRect = targetElement.getBoundingClientRect()

  // Calcular o ponto médio entre os centros dos dois nós
  const sourceCenterX = sourceRect.left + sourceRect.width / 2
  const sourceCenterY = sourceRect.top + sourceRect.height / 2
  const targetCenterX = targetRect.left + targetRect.width / 2
  const targetCenterY = targetRect.top + targetRect.height / 2

  return {
    x: (sourceCenterX + targetCenterX) / 2,
    y: (sourceCenterY + targetCenterY) / 2
  }
})

const colors = [
  '#ca643f', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#84cc16',
  '#f97316', '#14b8a6', '#a855f7', '#ef4444'
]

const { onNodeClick: onVueFlowNodeClick, onPaneClick: onVueFlowPaneClick, addNodes, addEdges, removeNodes, updateNode, fitView, setViewport } = useVueFlow()

// Carregar mapa
const loadMindmap = async () => {
  console.log('[EDITOR] === INICIANDO CARREGAMENTO DO MAPA ===')
  console.log('[EDITOR] ID do mapa:', id)

  loading.value = true
  try {
    const { data, error } = await useFetch(`/api/mindmaps/${id}`)

    console.log('[EDITOR] Resposta recebida:')
    console.log('[EDITOR] - error:', error.value)
    console.log('[EDITOR] - data:', data.value)

    if (error.value) {
      console.error('[EDITOR] Erro na requisição:', error.value)
      throw new Error(error.value.message || 'Erro ao carregar')
    }

    if (data.value?.success) {
      const mindmap = data.value.data
      console.log('[EDITOR] Mindmap data:', mindmap)
      console.log('[EDITOR] Título:', mindmap.title)
      console.log('[EDITOR] Quantidade de nós:', mindmap.nodes?.length || 0)

      title.value = mindmap.title

      if (!mindmap.nodes || mindmap.nodes.length === 0) {
        console.warn('[EDITOR] ⚠️ Nenhum nó encontrado no mapa mental!')
        elements.value = []
        return
      }

      // Converter nós para formato Vue Flow
      console.log('[EDITOR] Convertendo nós para Vue Flow...')
      const nodes = mindmap.nodes.map((node: any) => {
        console.log('[EDITOR] Nó:', { id: node.id, text: node.text, position_x: node.position_x, position_y: node.position_y })
        return {
          id: node.id,
          type: 'custom',
          position: { x: node.position_x || 0, y: node.position_y || 0 },
          data: {
            id: node.id,
            text: node.text,
            color: node.color || '#ca643f',
            parent_id: node.parent_id
          }
        }
      })

      console.log('[EDITOR] Nós convertidos:', nodes.length)

      // Criar edges (conexões entre nós) - linhas curvas elegantes
      const edges = mindmap.nodes
        .filter((node: any) => node.parent_id)
        .map((node: any) => ({
          id: `e-${node.parent_id}-${node.id}`,
          source: node.parent_id,
          target: node.id,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#8b5cf6',
            strokeWidth: 2
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#8b5cf6'
          }
        }))

      console.log('[EDITOR] Edges criadas:', edges.length)

      elements.value = [...nodes, ...edges] as any
      console.log('[EDITOR] Elements total:', elements.value.length)
      console.log('[EDITOR] ✅ Mapa carregado com sucesso!')
    }
  } catch (error: any) {
    console.error('[EDITOR] === ERRO AO CARREGAR MAPA ===')
    console.error('[EDITOR]', error)
    alert('Erro ao carregar mapa mental')
  } finally {
    loading.value = false
    console.log('[EDITOR] === FIM DO CARREGAMENTO ===')
  }
}

// Salvar título
const saveTitle = async () => {
  try {
    await $fetch(`/api/mindmaps/${id}`, {
      method: 'PUT',
      body: { title: title.value }
    })
  } catch (error) {
    console.error('Erro ao salvar título:', error)
  }
}

// Salvar nós
const saveNodes = async () => {
  console.log('[EDITOR] === SALVANDO MAPA MENTAL ===')
  console.log('[EDITOR] Elements.value:', elements.value)

  saving.value = true
  try {
    const nodes = elements.value
      .filter((el: any) => el.type === 'custom')
      .map((node: any) => {
        console.log('[EDITOR] Processando nó:', {
          id: node.id,
          text: node.data.text,
          parent_id: node.data.parent_id,
          position: node.position,
          color: node.data.color
        })

        return {
          id: node.id,
          text: node.data.text,
          parent_id: node.data.parent_id || null,
          position_x: node.position.x,
          position_y: node.position.y,
          color: node.data.color
        }
      })

    console.log('[EDITOR] === NÓS A SEREM SALVOS ===')
    console.log('[EDITOR] Total de nós:', nodes.length)
    nodes.forEach((node, idx) => {
      console.log(`[EDITOR] Nó ${idx + 1}:`, {
        id: node.id,
        text: node.text,
        parent_id: node.parent_id,
        has_parent: !!node.parent_id
      })
    })

    const nodesWithParent = nodes.filter(n => n.parent_id)
    console.log('[EDITOR] 🔗 Nós COM parent_id (com conexões):', nodesWithParent.length)
    if (nodesWithParent.length > 0) {
      console.log('[EDITOR] Conexões que serão salvas:', nodesWithParent.map(n => ({
        from: n.parent_id,
        to: n.id,
        text: n.text
      })))
    }

    await $fetch(`/api/mindmaps/${id}/nodes`, {
      method: 'POST',
      body: { nodes }
    })

    console.log('[EDITOR] ✅ Mapa salvo com sucesso!')
    lastSaved.value = 'agora mesmo'
    setTimeout(() => { lastSaved.value = '' }, 3000)

    showToast('Mapa mental salvo!', 'success')
  } catch (error: any) {
    console.error('[EDITOR] ❌ Erro ao salvar:', error)
    showToast(error.message || 'Erro ao salvar o mapa mental', 'error')
  } finally {
    saving.value = false
  }
}

// Debounced save
const debouncedSave = () => {
  if (saveTimeout.value) clearTimeout(saveTimeout.value)
  saveTimeout.value = setTimeout(() => {
    saveNodes()
  }, 2000)
}

// Adicionar nó
const addNode = () => {
  const newNode = {
    id: `node-${Date.now()}`,
    type: 'custom',
    position: {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    },
    data: {
      id: `node-${Date.now()}`,
      text: 'Nova Ideia',
      color: '#ca643f',
      parent_id: null
    }
  }

  addNodes([newNode])
  // Auto-save desabilitado - use o botão Salvar
}

// Adicionar nó filho
const addChildNode = () => {
  if (!selectedNode.value) return

  const parentPos = selectedNode.value.position
  const newNode = {
    id: `node-${Date.now()}`,
    type: 'custom',
    position: {
      x: parentPos.x + 250,
      y: parentPos.y + (Math.random() * 100 - 50)
    },
    data: {
      id: `node-${Date.now()}`,
      text: 'Subtópico',
      color: selectedNode.value.data.color,
      parent_id: selectedNode.value.id
    }
  }

  const newEdge = {
    id: `e-${selectedNode.value.id}-${newNode.id}`,
    source: selectedNode.value.id,
    target: newNode.id,
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#8b5cf6',
      strokeWidth: 2
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#8b5cf6'
    }
  }

  addNodes([newNode])
  addEdges([newEdge])
  // Auto-save desabilitado - use o botão Salvar
}

// Deletar nó selecionado
const deleteSelectedNode = () => {
  if (!selectedNode.value) return

  removeNodes([selectedNode.value.id])
  selectedNode.value = null
  // Auto-save desabilitado - use o botão Salvar
}

// Mudar cor do nó
const changeNodeColor = (color: string) => {
  if (!selectedNode.value) return

  selectedNode.value.data.color = color
  updateNode(selectedNode.value.id, { data: selectedNode.value.data })
  // Auto-save desabilitado - use o botão Salvar
}

// Edição inline
const startEditing = (nodeId: string) => {
  editingNodeId.value = nodeId
  nextTick(() => {
    nodeInput.value?.focus()
  })
}

const stopEditing = () => {
  editingNodeId.value = null
  // Auto-save desabilitado - use o botão Salvar
}

// Eventos
const onNodeClick = (event: any) => {
  selectedNode.value = event.node
  selectedEdge.value = null // Desselecionar edge ao clicar em nó
}

const onEdgeClick = (event: any) => {
  console.log('[EDGE CLICK]', event.edge)

  // TOGGLE: Se clicar na mesma edge, desseleciona
  if (selectedEdge.value && selectedEdge.value.id === event.edge.id) {
    selectedEdge.value = null
    console.log('[EDGE CLICK] Edge desselecionada')
  } else {
    selectedEdge.value = event.edge
    selectedNode.value = null // Desselecionar nó ao clicar em edge
    console.log('[EDGE CLICK] Edge selecionada:', event.edge.id)
  }

  // Atualizar estilo da edge selecionada
  updateEdgeStyles()
}

const onPaneClick = () => {
  selectedNode.value = null
  selectedEdge.value = null
  updateEdgeStyles()
}

const handleNodesChange = (changes: any) => {
  // Auto-save desabilitado - use o botão Salvar
}

const handleEdgesChange = (changes: any) => {
  // Edges changes handled automatically
}

// Toast
const showToast = (message: string, type: 'success' | 'error') => {
  const id = toastIdCounter++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Ícones baseados no conteúdo
const getNodeIcon = (text: string) => {
  const lower = text.toLowerCase()

  if (lower.includes('história') || lower.includes('historia')) return '📚'
  if (lower.includes('geografia')) return '🌍'
  if (lower.includes('matemática') || lower.includes('matematica')) return '🔢'
  if (lower.includes('ciência') || lower.includes('ciencia')) return '🔬'
  if (lower.includes('português') || lower.includes('portugues')) return '📝'
  if (lower.includes('inglês') || lower.includes('ingles')) return '🇬🇧'
  if (lower.includes('física') || lower.includes('fisica')) return '⚡'
  if (lower.includes('química') || lower.includes('quimica')) return '⚗️'
  if (lower.includes('biologia')) return '🧬'
  if (lower.includes('arte')) return '🎨'
  if (lower.includes('música') || lower.includes('musica')) return '🎵'
  if (lower.includes('educação física') || lower.includes('educacao fisica')) return '⚽'
  if (lower.includes('informática') || lower.includes('informatica')) return '💻'
  if (lower.includes('filosofia')) return '🤔'
  if (lower.includes('sociologia')) return '👥'
  if (lower.includes('literatura')) return '📖'
  if (lower.includes('redação') || lower.includes('redacao')) return '✍️'
  if (lower.includes('direito')) return '⚖️'
  if (lower.includes('economia')) return '💰'
  if (lower.includes('administração') || lower.includes('administracao')) return '📊'

  // Por tipo de conteúdo
  if (lower.includes('resumo')) return '📄'
  if (lower.includes('exemplo')) return '💡'
  if (lower.includes('exercício') || lower.includes('exercicio')) return '✏️'
  if (lower.includes('prova')) return '📝'
  if (lower.includes('conceito')) return '🎯'
  if (lower.includes('fórmula') || lower.includes('formula')) return '📐'
  if (lower.includes('teoria')) return '🔍'
  if (lower.includes('prática') || lower.includes('pratica')) return '🛠️'
  if (lower.includes('importante')) return '⭐'
  if (lower.includes('atenção') || lower.includes('atencao')) return '⚠️'
  if (lower.includes('dica')) return '💡'
  if (lower.includes('conclusão') || lower.includes('conclusao')) return '✅'

  return '📌'
}

// Contador de filhos
const getChildrenCount = (nodeId: string) => {
  return elements.value.filter((el: any) => el.data?.parent_id === nodeId).length
}

// Collapse/Expand
const isNodeCollapsed = (nodeId: string) => {
  return collapsedNodes.value.has(nodeId)
}

const toggleNodeCollapse = (nodeId: string) => {
  if (collapsedNodes.value.has(nodeId)) {
    collapsedNodes.value.delete(nodeId)
  } else {
    collapsedNodes.value.add(nodeId)
  }
  // Aqui você pode adicionar lógica para esconder/mostrar filhos
  saveHistory()
}

// Undo/Redo
const saveHistory = () => {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(JSON.parse(JSON.stringify(elements.value)))
  historyIndex.value++
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    showToast('Desfeito', 'success')
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    showToast('Refeito', 'success')
  }
}

// Buscar nós
const searchNodes = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = elements.value
    .filter((el: any) => el.type === 'custom' && el.data.text.toLowerCase().includes(query))
    .slice(0, 10)
}

const focusNode = (node: any) => {
  selectedNode.value = node
  setViewport({ x: -node.position.x + 400, y: -node.position.y + 300, zoom: 1.5 }, { duration: 500 })
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  showToast(`Focando em: ${node.data.text}`, 'success')
}

// Layouts automáticos
const applyLayout = (type: string) => {
  const nodes = elements.value.filter((el: any) => el.type === 'custom')
  const edges = elements.value.filter((el: any) => el.type !== 'custom')

  let newNodes = []

  switch (type) {
    case 'tree':
      newNodes = applyTreeLayout(nodes, 'vertical')
      break
    case 'horizontal':
      newNodes = applyTreeLayout(nodes, 'horizontal')
      break
    case 'radial':
      newNodes = applyRadialLayout(nodes)
      break
    case 'force':
      newNodes = applyForceLayout(nodes)
      break
  }

  elements.value = [...newNodes, ...edges] as any
  layoutMenuOpen.value = false
  saveHistory()
  showToast(`Layout "${type}" aplicado!`, 'success')
}

const applyTreeLayout = (nodes: any[], direction: 'vertical' | 'horizontal') => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const rootNodes = nodes.filter(n => !n.data.parent_id)

  const levelGap = direction === 'vertical' ? 150 : 250
  const siblingGap = direction === 'vertical' ? 250 : 150

  const positioned = new Set()
  let result: any[] = []

  const positionNode = (node: any, x: number, y: number, level: number) => {
    if (positioned.has(node.id)) return

    node.position = { x, y }
    positioned.add(node.id)
    result.push(node)

    const children = nodes.filter(n => n.data.parent_id === node.id)
    children.forEach((child, idx) => {
      const childX = direction === 'vertical' ? x + (idx - children.length / 2) * siblingGap : x + levelGap
      const childY = direction === 'vertical' ? y + levelGap : y + (idx - children.length / 2) * siblingGap
      positionNode(child, childX, childY, level + 1)
    })
  }

  rootNodes.forEach((root, idx) => {
    positionNode(root, idx * 400, 50, 0)
  })

  return result
}

const applyRadialLayout = (nodes: any[]) => {
  const centerX = 400
  const centerY = 300
  const radius = 250

  return nodes.map((node, idx) => {
    const angle = (idx / nodes.length) * Math.PI * 2
    return {
      ...node,
      position: {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      }
    }
  })
}

const applyForceLayout = (nodes: any[]) => {
  // Simples grid layout
  const cols = Math.ceil(Math.sqrt(nodes.length))
  return nodes.map((node, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    return {
      ...node,
      position: {
        x: col * 250 + 100,
        y: row * 200 + 100
      }
    }
  })
}

// Exportar para PNG
const exportImage = async () => {
  try {
    // Usar html2canvas ou similar
    const { default: html2canvas } = await import('html2canvas')
    const canvas = document.querySelector('.vue-flow') as HTMLElement

    if (!canvas) {
      showToast('Erro ao exportar imagem', 'error')
      return
    }

    const canvasImg = await html2canvas(canvas, {
      backgroundColor: '#1a1d29',
      scale: 2
    })

    const link = document.createElement('a')
    link.download = `mapa-mental-${title.value || 'sem-titulo'}.png`
    link.href = canvasImg.toDataURL('image/png')
    link.click()

    showToast('Imagem exportada!', 'success')
  } catch (error) {
    console.error('Erro ao exportar:', error)
    showToast('Erro ao exportar imagem', 'error')
  }
}

// Duplicar nó
const duplicateNode = () => {
  if (!selectedNode.value) return

  const newNode = {
    id: `node-${Date.now()}`,
    type: 'custom',
    position: {
      x: selectedNode.value.position.x + 50,
      y: selectedNode.value.position.y + 50
    },
    data: {
      id: `node-${Date.now()}`,
      text: selectedNode.value.data.text + ' (cópia)',
      color: selectedNode.value.data.color,
      note: selectedNode.value.data.note,
      parent_id: selectedNode.value.data.parent_id
    }
  }

  addNodes([newNode])
  saveHistory()
  showToast('Nó duplicado!', 'success')
}

// Click outside handlers
const handleClickOutside = (event: MouseEvent) => {
  if (layoutMenuRef.value && !layoutMenuRef.value.contains(event.target as Node)) {
    layoutMenuOpen.value = false
  }
  if (searchMenuRef.value && !searchMenuRef.value.contains(event.target as Node)) {
    searchOpen.value = false
  }
}

// Atualizar estilos das edges - SEM mudar cor/espessura quando selecionada
const updateEdgeStyles = () => {
  console.log('[UPDATE EDGE STYLES] Atualizando estilos das edges...')

  // IMPORTANTE: Não recriar os elements, apenas atualizar as edges existentes
  elements.value.forEach((el: any) => {
    if (el.source && el.target) { // É uma edge
      // Manter estilo normal para todas as edges
      el.style = {
        stroke: '#8b5cf6',
        strokeWidth: 2
      }
      el.animated = true
    }
  })

  console.log('[UPDATE EDGE STYLES] Estilos atualizados!')
}

// Deletar edge selecionada - SEM CONFIRMAÇÃO
const deleteSelectedEdge = () => {
  if (!selectedEdge.value) return

  const edgeToDelete = selectedEdge.value

  // Remover a edge
  elements.value = elements.value.filter((el: any) => el.id !== edgeToDelete.id)

  // Limpar parent_id do nó alvo
  const target = elements.value.find((el: any) => el.id === edgeToDelete.target)
  if (target && target.data) {
    target.data.parent_id = null
  }

  selectedEdge.value = null
  saveHistory()
  showToast('🗑️ Conexão deletada!', 'success')
}

// Keyboard shortcuts
const handleKeyboard = (event: KeyboardEvent) => {
  // Delete para edge selecionada
  if (event.key === 'Delete' && selectedEdge.value) {
    event.preventDefault()
    deleteSelectedEdge()
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }
  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    searchOpen.value = !searchOpen.value
  }
}

// Hover de nós durante drag
const onNodeHoverStart = (nodeId: string) => {
  if (isDragging.value && connectingFrom.value && nodeId !== connectingFrom.value) {
    hoveredNodeId.value = nodeId
  }
}

const onNodeHoverEnd = () => {
  if (isDragging.value) {
    hoveredNodeId.value = null
    hoveredHandle.value = null
  }
}

// Obter posição EXATA do centro da bolinha - VERSÃO CORRIGIDA
const getHandlePosition = (nodeId: string, handleSide: 'top' | 'bottom' | 'left' | 'right') => {
  console.log('[GET HANDLE POS] Buscando posição do handle:', handleSide, 'do nó:', nodeId)

  const nodeElement = document.querySelector(`[data-id="${nodeId}"]`)
  if (!nodeElement) {
    console.error('[GET HANDLE POS] Nó não encontrado:', nodeId)
    return { x: 0, y: 0 }
  }

  // SEMPRE usar a posição real do handle DOM
  const handleElement = nodeElement.querySelector(`.handle-${handleSide}`) as HTMLElement

  if (handleElement) {
    // MÉTODO 1: Usar getBoundingClientRect do handle real
    const handleRect = handleElement.getBoundingClientRect()
    const centerX = handleRect.left + handleRect.width / 2
    const centerY = handleRect.top + handleRect.height / 2

    console.log('[GET HANDLE POS] Posição encontrada (método 1 - handle real):', { x: centerX, y: centerY })
    return { x: centerX, y: centerY }
  } else {
    // MÉTODO 2: Calcular baseado no nó (fallback)
    const rect = nodeElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let position = { x: centerX, y: centerY }

    switch (handleSide) {
      case 'top':
        position = { x: centerX, y: rect.top }
        break
      case 'bottom':
        position = { x: centerX, y: rect.bottom }
        break
      case 'left':
        position = { x: rect.left, y: centerY }
        break
      case 'right':
        position = { x: rect.right, y: centerY }
        break
    }

    console.log('[GET HANDLE POS] Posição calculada (método 2 - fallback):', position)
    return position
  }
}

// Sistema de conexão arrastando - VERSÃO CORRIGIDA (4 DIREÇÕES)
const startConnection = (nodeId: string, event: MouseEvent, handleSide: 'top' | 'bottom' | 'left' | 'right') => {
  console.log('[START CONNECTION] ====================')
  console.log('[START CONNECTION] Iniciando conexão do nó:', nodeId)
  console.log('[START CONNECTION] Handle clicado:', handleSide)
  console.log('[START CONNECTION] Posição do mouse:', { x: event.clientX, y: event.clientY })

  event.preventDefault()
  event.stopPropagation()

  const node = elements.value.find((el: any) => el.id === nodeId)
  if (!node) {
    console.error('[START CONNECTION] Nó não encontrado nos elements!')
    return
  }

  // PASSO 1: Obter posição EXATA do centro da bolinha clicada
  const handlePos = getHandlePosition(nodeId, handleSide)
  console.log('[START CONNECTION] Posição EXATA da bolinha:', handlePos)

  // PASSO 2: Armazenar estados
  connectingFrom.value = nodeId
  connectingFromHandle.value = handleSide
  connectingFromPos.value = handlePos  // Esta é a posição de onde a linha VAI COMEÇAR
  connectionLine.value = { x: event.clientX, y: event.clientY }  // Onde o mouse está agora
  isDragging.value = true

  console.log('[START CONNECTION] Estados configurados:')
  console.log('  - connectingFrom:', connectingFrom.value)
  console.log('  - connectingFromHandle:', connectingFromHandle.value)
  console.log('  - connectingFromPos:', connectingFromPos.value)
  console.log('  - isDragging:', isDragging.value)

  // PASSO 3: Adicionar listeners
  document.addEventListener('mousemove', updateConnectionLine)
  document.addEventListener('mouseup', finishConnection)

  console.log('[START CONNECTION] Listeners adicionados. Pronto para arrastar!')
}

const updateConnectionLine = (event: MouseEvent) => {
  if (connectingFrom.value && isDragging.value) {
    // Detectar handle sob o cursor - TODOS OS 4 HANDLES
    const element = document.elementFromPoint(event.clientX, event.clientY)
    const isHandle = element?.classList.contains('handle-top') ||
                    element?.classList.contains('handle-bottom') ||
                    element?.classList.contains('handle-left') ||
                    element?.classList.contains('handle-right')

    if (isHandle && element) {
      const nodeId = element.getAttribute('data-node-id')
      const handle = element.getAttribute('data-handle') as 'top' | 'bottom' | 'left' | 'right'

      if (nodeId && nodeId !== connectingFrom.value) {
        console.log('[UPDATE LINE] 🎯 Handle alvo detectado:', handle, 'do nó:', nodeId)
        hoveredNodeId.value = nodeId
        hoveredHandle.value = handle

        // Snap magnético para o handle alvo
        const targetHandlePos = getHandlePosition(nodeId, handle)
        connectionLine.value = targetHandlePos
        console.log('[UPDATE LINE] 🧲 Snap ativado! Linha grudando em:', targetHandlePos)
        return
      }
    }

    // Caso contrário, seguir o mouse livremente
    hoveredNodeId.value = null
    hoveredHandle.value = null
    connectionLine.value = { x: event.clientX, y: event.clientY }
  }
}

const finishConnection = (event: MouseEvent) => {
  if (!connectingFrom.value || !isDragging.value) {
    resetConnection()
    return
  }

  // Usar o hoveredNodeId se disponível
  const targetNodeId = hoveredNodeId.value

  if (targetNodeId && targetNodeId !== connectingFrom.value) {
    // Verificar se já existe conexão
    const existingEdge = elements.value.find(
      (el: any) =>
        el.source === connectingFrom.value &&
        el.target === targetNodeId
    )

    if (existingEdge) {
      showToast('Conexão já existe!', 'error')
      resetConnection()
      return
    }

    // Criar nova conexão
    const newEdge = {
      id: `e-${connectingFrom.value}-${targetNodeId}`,
      source: connectingFrom.value,
      target: targetNodeId,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#8b5cf6',
        strokeWidth: 2
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#8b5cf6'
      }
    }

    console.log('[FINISH CONNECTION] 🔗 Criando nova edge:', newEdge)

    // Atualizar parent_id do nó alvo
    const targetNodeData = elements.value.find((el: any) => el.id === targetNodeId)
    console.log('[FINISH CONNECTION] 📍 Nó alvo encontrado:', targetNodeData)

    if (targetNodeData && targetNodeData.type === 'custom') {
      console.log('[FINISH CONNECTION] 🔄 Atualizando parent_id de', targetNodeId, 'para', connectingFrom.value)
      console.log('[FINISH CONNECTION] 🔄 parent_id ANTES:', targetNodeData.data.parent_id)

      targetNodeData.data.parent_id = connectingFrom.value

      console.log('[FINISH CONNECTION] 🔄 parent_id DEPOIS:', targetNodeData.data.parent_id)
      console.log('[FINISH CONNECTION] ✅ parent_id atualizado com sucesso!')
    } else {
      console.error('[FINISH CONNECTION] ❌ ERRO: Nó alvo não encontrado ou não é custom!')
    }

    addEdges([newEdge])
    saveHistory()

    console.log('[FINISH CONNECTION] 📊 Elements.value atualizado. Total de elements:', elements.value.length)
    const nodesWithParent = elements.value.filter((el: any) => el.type === 'custom' && el.data.parent_id)
    console.log('[FINISH CONNECTION] 🔗 Total de nós COM parent_id:', nodesWithParent.length)

    // Animação de sucesso
    setTimeout(() => {
      const createdEdge = elements.value.find((el: any) => el.id === newEdge.id)
      if (createdEdge) {
        createdEdge.class = 'success-animation'
        setTimeout(() => {
          createdEdge.class = ''
        }, 600)
      }
    }, 100)

    showToast('✅ Conexão criada com sucesso!', 'success')
  } else if (targetNodeId === connectingFrom.value) {
    showToast('❌ Não é possível conectar um nó a ele mesmo!', 'error')
  }

  resetConnection()
}

const resetConnection = () => {
  connectingFrom.value = null
  connectingFromHandle.value = null
  connectingFromPos.value = null
  connectionLine.value = null
  isDragging.value = false
  hoveredNodeId.value = null
  hoveredHandle.value = null
  document.removeEventListener('mousemove', updateConnectionLine)
  document.removeEventListener('mouseup', finishConnection)
}

const getNodeScreenPosition = (nodeId: string) => {
  if (connectingFromPos.value) {
    return connectingFromPos.value
  }

  // Usar a posição do handle se disponível
  if (connectingFromHandle.value) {
    return getHandlePosition(nodeId, connectingFromHandle.value)
  }

  const nodeElement = document.querySelector(`[data-id="${nodeId}"]`)
  if (!nodeElement) return { x: 0, y: 0 }

  const rect = nodeElement.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

// Lifecycle
onMounted(() => {
  loadMindmap()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyboard)

  // Salvar histórico inicial
  watch(elements, () => {
    if (elements.value.length > 0 && history.value.length === 0) {
      saveHistory()
    }
  }, { immediate: true })
})

onBeforeUnmount(() => {
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value)
    saveNodes()
  }
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
/* Animações dos toasts */
.toast-enter-active {
  animation: slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Animação do painel lateral */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-panel-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Pulse lento para nós selecionados */
@keyframes pulse-slow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.6);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Bounce lento para instrução */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* Scrollbar customizada */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Line clamp para notas */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Delay para animação */
.delay-1000 {
  animation-delay: 1s;
}

/* Estilo do fundo dark-850 */
:global(.bg-dark-850) {
  background-color: #151821;
}

/* VueFlow customizado - Edges */
:deep(.vue-flow__edge-path) {
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4));
  transition: all 0.2s ease;
  cursor: pointer;
}

/* Hover nas edges */
:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.7));
}

/* Setas mais atraentes */
:deep(.vue-flow__edge .vue-flow__edge-path) {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Marcadores (setas) */
:deep(marker polygon),
:deep(marker path) {
  fill: #8b5cf6;
  filter: drop-shadow(0 0 2px rgba(139, 92, 246, 0.5));
  transition: fill 0.2s ease;
}

/* Animação de sucesso ao criar conexão */
@keyframes connection-success {
  0% {
    stroke-width: 2px;
    filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4));
  }
  50% {
    stroke-width: 6px;
    filter: drop-shadow(0 0 20px rgba(74, 222, 128, 1));
  }
  100% {
    stroke-width: 2px;
    filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4));
  }
}

:deep(.vue-flow__edge.success-animation .vue-flow__edge-path) {
  animation: connection-success 0.6s ease-out;
}

:deep(.vue-flow__minimap) {
  background-color: rgba(26, 29, 41, 0.95) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px);
}

:deep(.vue-flow__controls) {
  background-color: rgba(26, 29, 41, 0.95) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px);
}

:deep(.vue-flow__controls button) {
  background-color: rgba(139, 92, 246, 0.1) !important;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2) !important;
  color: #e5e7eb !important;
  transition: all 0.2s;
}

:deep(.vue-flow__controls button:hover) {
  background-color: rgba(139, 92, 246, 0.3) !important;
  transform: scale(1.1);
}

/* Fundo do canvas */
:deep(.vue-flow__background) {
  background-color: #1a1d29 !important;
}

/* Animação de entrada para novos nós */
@keyframes node-appear {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

:deep(.vue-flow__node) {
  animation: node-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Glow nas edges quando conectadas */
:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
  stroke-dasharray: 5;
  animation: dash 0.5s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}
</style>
