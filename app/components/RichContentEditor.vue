<template>
  <div class="rich-content-editor">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2 mb-2 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-claude-md px-4 py-3 sticky top-0 z-10 shadow-sm">
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
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" v-html="tool.icon"></svg>
        </button>

        <div class="w-px h-6 bg-dark-700 mx-1"></div>

        <!-- Font Family -->
        <div class="flex items-center gap-1">
          <select
            v-model="currentFontFamily"
            @change="changeFontFamily"
            class="px-3 py-1 bg-dark-700 border border-dark-700 text-gray-300 rounded text-sm hover:bg-dark-700/50 focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500 min-w-[140px]"
            title="Tipo de fonte"
          >
            <option value="">Fonte Padrão</option>
            <option v-for="font in googleFonts" :key="font.value" :value="font.value" :style="{ fontFamily: font.value }">
              {{ font.label }}
            </option>
          </select>
          <button
            v-if="currentFontFamily"
            @click="resetFontFamily"
            title="Resetar fonte padrão"
            class="p-1 text-gray-400 hover:text-gray-300 hover:bg-dark-700 rounded transition-colors"
            type="button"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Font Size -->
        <div class="flex items-center gap-1">
          <select
            v-model="currentFontSize"
            @change="changeFontSizeNew"
            class="px-3 py-1 bg-dark-700 border border-dark-700 text-gray-300 rounded text-sm hover:bg-dark-700/50 focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500 min-w-[80px]"
            title="Tamanho da fonte"
          >
            <option value="">Tamanho Padrão</option>
            <option value="10px">10</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="36px">36</option>
            <option value="42px">42</option>
            <option value="48px">48</option>
          </select>
          <button
            v-if="currentFontSize"
            @click="resetFontSize"
            title="Resetar tamanho padrão"
            class="p-1 text-gray-400 hover:text-gray-300 hover:bg-dark-700 rounded transition-colors"
            type="button"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="w-px h-6 bg-dark-700 mx-1"></div>

        <!-- Font Color -->
        <div class="relative">
          <button
            @click="showColorPicker = !showColorPicker"
            title="Cor da fonte"
            class="p-2 rounded transition-colors text-gray-400 hover:bg-dark-700/50 relative"
            type="button"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.62 12L12 5.67 14.38 12H9.62zM11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2z"/>
            </svg>
            <div
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded"
              :style="{ backgroundColor: currentFontColor }"
            ></div>
          </button>
          <div
            v-if="showColorPicker"
            class="absolute top-full mt-2 z-20 bg-dark-800 border border-dark-700 rounded-claude-md p-2 shadow-xl"
            @click.stop
          >
            <div class="grid grid-cols-6 gap-1">
              <button
                v-for="color in fontColors"
                :key="color"
                @click="changeFontColor(color)"
                :title="color"
                class="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                :class="currentFontColor === color ? 'border-white' : 'border-dark-600'"
                :style="{ backgroundColor: color }"
                type="button"
              />
            </div>
          </div>
        </div>

        <!-- Highlight -->
        <button
          @click="toggleHighlight"
          title="Marca-texto amarelo"
          :class="[
            'p-2 rounded transition-colors',
            isHighlightActive
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29a.9959.9959 0 00-1.41 0L15 2.25 18.75 6l1.96-1.96z"/>
            <path fill="#FCD34D" d="M0 20h24v4H0v-4z"/>
          </svg>
        </button>

        <!-- Check Mark Tool -->
        <button
          @click="insertCheckMark"
          title="Inserir check verde ✓"
          class="p-2 rounded transition-colors text-gray-400 hover:bg-dark-700/50"
          type="button"
        >
          <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </button>

        <div class="w-px h-6 bg-dark-700 mx-1"></div>

        <!-- AI Assistant Tool -->
        <button
          @click="toggleAIAssistantMode"
          title="Assistente IA - Ative e selecione texto para usar"
          :class="[
            'p-2 rounded transition-colors relative',
            aiAssistantMode
              ? 'bg-purple-500/20 text-purple-400 ring-2 ring-purple-500/50'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
          </svg>
          <div
            v-if="aiAssistantMode"
            class="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"
          ></div>
        </button>

        <!-- Insert Link -->
        <button
          @click="showLinkModal = true"
          title="Inserir link"
          class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </button>

        <div class="w-px h-6 bg-dark-700 mx-1"></div>

        <!-- Add Comment -->
        <button
          @click="showCommentModal = true"
          title="Inserir comentário"
          class="p-2 rounded transition-colors text-gray-400 hover:bg-dark-700/50"
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
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
              : 'text-gray-400 hover:bg-dark-700/50'
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
          class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400"
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
          class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </button>

        <!-- Page Break -->
        <button
          @click="togglePageBreakMode"
          title="Inserir quebra de página - Clique no editor para posicionar"
          :class="[
            'p-2 rounded transition-colors',
            pageBreakMode
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors hover:bg-primary-500/30'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9V5a2 2 0 012-2h8a2 2 0 012 2v4M6 9h12M6 9l-2 10h16l-2-10"/>
          </svg>
        </button>

        <!-- Toggle Notebook Lines -->
        <button
          @click="showNotebookLines = !showNotebookLines"
          title="Mostrar/Ocultar linhas do caderno"
          :class="[
            'p-2 rounded transition-colors',
            showNotebookLines
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Page Navigation -->
        <div class="flex items-center gap-1">
          <button
            @click="goToPreviousPage"
            :disabled="currentPage <= 1"
            title="Página Anterior"
            class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
            type="button"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span class="text-xs text-gray-400 px-2">Página {{ currentPage }} de {{ totalPages }}</span>
          <button
            @click="goToNextPage"
            :disabled="currentPage >= totalPages"
            title="Próxima Página"
            class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
            type="button"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="w-px h-6 bg-dark-700 mx-1"></div>

        <!-- Screenshot/Capture Tool -->
        <button
          @click="toggleScreenshotMode"
          title="Capturar área para IA - Selecione uma área do conteúdo"
          :class="[
            'p-2 rounded transition-colors',
            screenshotMode
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H3V8h3v2H5v8h14V8h-2V6h4v14H3V6h3.17L8 4h8l1.83 2zM12 9c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        </button>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <!-- Calculator Button -->
        <button
          @click="showCalculator = true"
          class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400"
          title="Calculadora"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM6.25 7.72h11.5v1.5H6.25zM6 11h2v2H6zm3 0h2v2H9zm3 0h2v2h-2zm3 0h2v2h-2zM6 15h2v2H6zm3 0h2v2H9zm3 0h2v2h-2zm3 0h2v2h-2z"/>
          </svg>
        </button>

        <!-- Reminders Button -->
        <button
          @click="showReminders = true"
          class="p-2 hover:bg-dark-700/50 rounded transition-colors text-gray-400"
          title="Lembretes e Fórmulas"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>

        <!-- Geometry Tools Toggle -->
        <button
          @click="showGeometryTools = !showGeometryTools"
          :class="[
            'p-2 rounded transition-colors',
            showGeometryTools
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
              : 'text-gray-400 hover:bg-dark-700/50'
          ]"
          title="Ferramentas de Geometria"
          type="button"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.09 4.56c-.7-1.03-1.5-1.99-2.4-2.85-.35-.34-.94-.02-.94.49v1.51c0 .98-.51 1.88-1.34 2.39-3.23 1.97-6.75 4.13-8.87 6.74C1.61 15.28 1 17.74 1 19.79c0 .38.31.69.69.69h20.62c.38 0 .69-.31.69-.69 0-8.08-3.03-11.77-5.91-15.23zm-5.98 3.81c.4-.24.85-.42 1.33-.52l1.56 1.56c-.22.46-.68.79-1.22.79-.74 0-1.35-.61-1.35-1.35 0-.27.08-.52.22-.73l-.54-.54zm-3.54 9.37l-1.42 1.42c-.2.2-.51.2-.71 0-.2-.2-.2-.51 0-.71l1.42-1.42c.2-.2.51-.2.71 0 .19.2.19.51 0 .71z"/>
          </svg>
        </button>

      </div>
    </div>

    <!-- Geometry Tools Bar -->
    <div v-if="showGeometryTools" class="flex flex-wrap items-center gap-2 mb-2 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-claude-md px-4 py-3">
      <div class="text-sm font-medium text-gray-300 mr-2">Ferramentas de Geometria:</div>
      <button
        @click="activateGeometryTool('line')"
        :class="[
          'p-2 rounded transition-colors',
          geometryTool === 'line'
            ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
            : 'text-gray-400 hover:bg-dark-700/50'
        ]"
        title="Desenhar linha"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20L20 4"/>
        </svg>
      </button>
      <button
        @click="activateGeometryTool('circle')"
        :class="[
          'p-2 rounded transition-colors',
          geometryTool === 'circle'
            ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
            : 'text-gray-400 hover:bg-dark-700/50'
        ]"
        title="Desenhar círculo"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" stroke-width="2"/>
        </svg>
      </button>
      <button
        @click="activateGeometryTool('rectangle')"
        :class="[
          'p-2 rounded transition-colors',
          geometryTool === 'rectangle'
            ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
            : 'text-gray-400 hover:bg-dark-700/50'
        ]"
        title="Desenhar retângulo"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="6" width="16" height="12" stroke-width="2"/>
        </svg>
      </button>
      <button
        @click="activateGeometryTool('triangle')"
        :class="[
          'p-2 rounded transition-colors',
          geometryTool === 'triangle'
            ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
            : 'text-gray-400 hover:bg-dark-700/50'
        ]"
        title="Desenhar triângulo"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4L4 20h16L12 4z"/>
        </svg>
      </button>
      <button
        @click="activateGeometryTool('angle')"
        :class="[
          'p-2 rounded transition-colors',
          geometryTool === 'angle'
            ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
            : 'text-gray-400 hover:bg-dark-700/50'
        ]"
        title="Desenhar ângulo"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20L4 4L20 20"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20a6 6 0 006-6"/>
        </svg>
      </button>

      <div class="w-px h-6 bg-dark-700 mx-1"></div>

      <!-- Polygon Tool with Sides Configuration -->
      <button
        @click="showPolygonConfig = !showPolygonConfig"
        :class="[
          'p-2 rounded transition-colors',
          geometryTool === 'polygon'
            ? 'bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors'
            : 'text-gray-400 hover:bg-dark-700/50'
        ]"
        title="Desenhar polígono"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </button>

      <div v-if="showPolygonConfig" class="flex items-center gap-2 bg-dark-700/50 rounded px-3 py-1">
        <label class="text-xs text-gray-400">Lados:</label>
        <input
          v-model.number="polygonSides"
          type="number"
          min="3"
          max="12"
          class="w-16 px-2 py-1 bg-dark-700 border border-dark-600 text-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500"
        />
        <button
          @click="activateGeometryTool('polygon')"
          class="px-2 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600"
        >
          OK
        </button>
      </div>
    </div>

    <!-- Editor Area -->
    <div
      ref="editorRef"
      contenteditable="true"
      @input="handleInput"
      @mouseup="handleTextSelection"
      @mousedown="handleEditorMouseDown"
      @keyup="handleTextSelection"
      @keydown="handleKeyDown"
      @click="handleEditorClick"
      @mousemove="(e) => { handleMouseMove(e); handleEditorMouseMove(e) }"
      @focus="updateActiveFormats"
      class="min-h-[500px] w-full p-8 bg-white border border-gray-200 rounded-claude-md focus:outline-none focus:ring-2 focus:ring-primary-500 prose prose-sm max-w-none text-gray-900 shadow-sm relative"
      :class="{
        'cursor-text': !isSelecting && !commentMode && !geometryTool && !screenshotMode && !pageBreakMode,
        'cursor-crosshair': commentMode || geometryTool || screenshotMode,
        'page-break-cursor': pageBreakMode,
        'notebook-lines': showNotebookLines
      }"
      @paste="handlePaste"
      @mouseup.capture="handleEditorMouseUp"
    >
      <!-- Screenshot Selection Overlay -->
      <div
        v-if="screenshotSelection && isDrawingSelection"
        class="absolute border-2 border-claude-primary dark:border-primary-500 bg-claude-primary/20 dark:bg-primary-500/20 pointer-events-none z-50"
        :style="{
          left: Math.min(screenshotSelection.startX, screenshotSelection.endX) + 'px',
          top: Math.min(screenshotSelection.startY, screenshotSelection.endY) + 'px',
          width: Math.abs(screenshotSelection.endX - screenshotSelection.startX) + 'px',
          height: Math.abs(screenshotSelection.endY - screenshotSelection.startY) + 'px'
        }"
      >
        <!-- Corner markers -->
        <div class="absolute -top-1 -left-1 w-3 h-3 bg-primary-500 border border-white"></div>
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 border border-white"></div>
        <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 border border-white"></div>
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 border border-white"></div>

        <!-- Dimension label -->
        <div
          v-if="Math.abs(screenshotSelection.endX - screenshotSelection.startX) > 50 && Math.abs(screenshotSelection.endY - screenshotSelection.startY) > 50"
          class="absolute top-0 left-0 -translate-y-full mb-1 bg-primary-600 text-white text-xs px-2 py-1 rounded shadow-lg"
        >
          {{ Math.round(Math.abs(screenshotSelection.endX - screenshotSelection.startX)) }} × {{ Math.round(Math.abs(screenshotSelection.endY - screenshotSelection.startY)) }}
        </div>
      </div>

      <!-- Screenshot mode darkened overlay -->
      <div
        v-if="screenshotMode && !isDrawingSelection"
        class="fixed inset-0 bg-black/40 pointer-events-none z-40"
      ></div>
    </div>

    <!-- Screenshot Mode Indicator -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="screenshotMode"
        class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
      >
        <div class="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-claude-lg shadow-2xl flex items-center space-x-3">
          <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H3V8h3v2H5v8h14V8h-2V6h4v14H3V6h3.17L8 4h8l1.83 2zM12 9c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
          <div>
            <div class="font-semibold">Modo Captura Ativo</div>
            <div class="text-xs text-primary-100">Arraste para selecionar a área desejada</div>
          </div>
        </div>
      </div>
    </Transition>

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

    <!-- Screenshot AI Menu -->
    <AIPopupMenu
      :is-visible="showScreenshotAIMenu"
      :position="menuPosition"
      :is-pro="isPro"
      context="screenshot"
      @close="showScreenshotAIMenu = false"
      @select="handleScreenshotAIAction"
      @upgrade="$emit('upgrade')"
    />

    <!-- Comment Modal -->
    <Teleport to="body">
      <div
        v-if="showCommentModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="showCommentModal = false"
      >
        <div class="bg-white rounded-claude-lg shadow-2xl w-full max-w-md">
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Adicionar Comentário</h3>
            <textarea
              v-model="commentText"
              class="w-full px-4 py-3 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500 text-gray-900 resize-none"
              rows="4"
              placeholder="Digite seu comentário aqui..."
              @keydown.esc="showCommentModal = false"
            ></textarea>
            <div class="flex gap-3 mt-4">
              <button
                @click="saveComment"
                class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-claude-md hover:bg-primary-600 font-medium"
              >
                Salvar
              </button>
              <button
                @click="showCommentModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-claude-md hover:bg-gray-50 font-medium"
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
        <div class="bg-white rounded-claude-lg shadow-2xl w-full max-w-md">
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
            <div class="bg-gray-50 rounded-claude-md p-4 text-gray-700 whitespace-pre-wrap">
              {{ currentCommentText }}
            </div>
            <div class="mt-4">
              <button
                @click="showCommentView = false"
                class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-claude-md hover:bg-gray-200 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Calculator Modal -->
    <Calculator :is-visible="showCalculator" @close="showCalculator = false" />

    <!-- Reminders Modal -->
    <RemindersManager
      :is-visible="showReminders"
      :subject-id="subjectId || ''"
      :subject-name="subjectName || 'Caderno'"
      @close="showReminders = false"
    />

    <!-- YouTube Video Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showYouTubeModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="closeYouTubeModal"
        >
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showYouTubeModal"
              class="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg"
              @click.stop
            >
              <!-- Header -->
              <div class="p-6 border-b border-gray-700">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-claude-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-white">Inserir Vídeo do YouTube</h3>
                      <p class="text-sm text-gray-400">Cole o link e defina o intervalo do vídeo</p>
                    </div>
                  </div>
                  <button
                    @click="closeYouTubeModal"
                    class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-claude-md transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div class="p-6 space-y-5">
                <!-- URL Input -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    🔗 URL do Vídeo
                  </label>
                  <input
                    v-model="youtubeUrl"
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    class="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-claude-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    @keyup.enter="confirmYouTubeInsert"
                  />
                  <p class="mt-2 text-xs text-gray-500">Cole o link completo do YouTube ou o link curto (youtu.be)</p>
                </div>

                <!-- Time Interval -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      ⏱️ Tempo Inicial
                    </label>
                    <input
                      v-model="youtubeStartTime"
                      type="text"
                      placeholder="0:00"
                      class="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-claude-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    />
                    <p class="mt-1 text-xs text-gray-500">Ex: 1:30</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      ⏱️ Tempo Final
                    </label>
                    <input
                      v-model="youtubeEndTime"
                      type="text"
                      placeholder="0:00"
                      class="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-claude-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    />
                    <p class="mt-1 text-xs text-gray-500">Ex: 5:20</p>
                  </div>
                </div>

                <!-- Info Box -->
                <div class="p-4 bg-[var(--info)]/10 dark:bg-blue-500/10 border border-[var(--info)]/30 dark:border-blue-500/30 rounded-claude-lg">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-[var(--info)] dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <div class="text-sm text-[var(--primary-hover)] dark:text-blue-300">
                      <p class="font-medium mb-1">💡 Dica:</p>
                      <p class="text-[var(--info)] dark:text-blue-400">O intervalo é opcional. Deixe em branco para inserir o vídeo completo.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-6 border-t border-gray-700 flex gap-3">
                <button
                  @click="closeYouTubeModal"
                  class="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-claude-lg hover:bg-gray-700 font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmYouTubeInsert"
                  :disabled="!youtubeUrl.trim()"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-claude-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-red-500/30"
                >
                  Inserir Vídeo
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Link Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showLinkModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="closeLinkModal"
        >
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showLinkModal"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              @click.stop
            >
              <!-- Header -->
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-claude-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                      </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">Inserir Link</h3>
                  </div>
                  <button
                    @click="closeLinkModal"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-claude-md transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    v-model="linkUrl"
                    type="url"
                    placeholder="https://exemplo.com"
                    class="w-full px-4 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500"
                    @keydown.enter="confirmLinkInsert"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Link (opcional)
                  </label>
                  <input
                    v-model="linkText"
                    type="text"
                    placeholder="Clique aqui"
                    class="w-full px-4 py-2 border border-gray-300 rounded-claude-md focus:ring-2 focus:ring-primary-500 focus:border-claude-primary dark:border-primary-500"
                    @keydown.enter="confirmLinkInsert"
                  />
                  <p class="mt-1 text-xs text-gray-500">Se vazio, a URL será usada como texto</p>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-6 border-t border-gray-200 flex gap-3">
                <button
                  @click="closeLinkModal"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-claude-md hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmLinkInsert"
                  :disabled="!linkUrl.trim()"
                  class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-claude-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Inserir
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import Calculator from './Calculator.vue'
import RemindersManager from './RemindersManager.vue'

// Load Google Fonts
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&family=Raleway:wght@300;400;600;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;700&family=Source+Code+Pro:wght@400;600&family=Indie+Flower&display=swap'
    }
  ]
})

interface Props {
  modelValue: string
  isPro: boolean
  subjectId?: string
  subjectName?: string
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

// Screenshot/Capture mode
const screenshotMode = ref(false)
const screenshotSelection = ref<{ startX: number, startY: number, endX: number, endY: number } | null>(null)
const isDrawingSelection = ref(false)
const capturedImage = ref<string | null>(null)
const showScreenshotAIMenu = ref(false)

// Page Break Mode
const pageBreakMode = ref(false)

// New tools
const showCalculator = ref(false)
const showReminders = ref(false)
const showGeometryTools = ref(false)
const geometryTool = ref<'line' | 'circle' | 'rectangle' | 'triangle' | 'angle' | 'polygon' | null>(null)
const showPolygonConfig = ref(false)
const polygonSides = ref(5)

// Notebook lines
const showNotebookLines = ref(true)

// Page navigation
const currentPage = ref(1)
const totalPages = ref(1)

// YouTube modal
const showYouTubeModal = ref(false)
const youtubeUrl = ref('')
const youtubeStartTime = ref('')
const youtubeEndTime = ref('')

// Link modal
const showLinkModal = ref(false)
const linkUrl = ref('')
const linkText = ref('')

// Font color
const showColorPicker = ref(false)
const currentFontColor = ref('#ffffff')
const fontColors = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

// AI Assistant mode
const aiAssistantMode = ref(false)

// Font family and size
const currentFontFamily = ref('')
const currentFontSize = ref('')

// Google Fonts list - popular fonts for study notes
const googleFonts = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Raleway', value: 'Raleway, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { label: 'Indie Flower', value: '"Indie Flower", cursive' }
]

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
    command: 'strikeThrough',
    label: 'Tachado',
    icon: '<path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>'
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
    const selection = window.getSelection()
    if (!selection || !selection.toString()) {
      alert('Selecione o texto para alterar o tamanho')
      return
    }
    document.execCommand('fontSize', false, size)
    editorRef.value?.focus()
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

const changeFontColor = (color: string) => {
  const selection = window.getSelection()
  if (!selection || !selection.toString()) {
    alert('Selecione o texto para alterar a cor')
    return
  }

  currentFontColor.value = color
  document.execCommand('foreColor', false, color)
  showColorPicker.value = false
  editorRef.value?.focus()
}

const insertCheckMark = () => {
  const checkMark = '<span style="color: #22c55e; font-size: 1.2em; font-weight: bold;">✓</span>&nbsp;'
  document.execCommand('insertHTML', false, checkMark)
  editorRef.value?.focus()
}

// Função auxiliar para extrair texto puro mantendo estrutura de quebras de linha
const extractTextContent = (node: Node): string => {
  let text = ''

  const processNode = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      text += n.textContent || ''
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as Element
      // Preserva quebras de linha
      if (el.tagName === 'BR') {
        text += '\n'
      } else if (el.tagName === 'DIV' || el.tagName === 'P') {
        if (text && !text.endsWith('\n')) text += '\n'
        n.childNodes.forEach(processNode)
        if (!text.endsWith('\n')) text += '\n'
      } else {
        n.childNodes.forEach(processNode)
      }
    }
  }

  processNode(node)
  return text
}

// Função para alterar a família da fonte
const changeFontFamily = () => {
  if (!currentFontFamily.value || !editorRef.value) {
    return
  }

  const selection = window.getSelection()

  if (selection && !selection.isCollapsed) {
    const range = selection.getRangeAt(0)
    const selectedContent = range.cloneContents()

    // Extrai apenas o texto puro
    const textContent = extractTextContent(selectedContent)

    // Remove o conteúdo selecionado
    range.deleteContents()

    // Cria um span com a fonte desejada e o texto puro
    const span = document.createElement('span')
    span.style.fontFamily = currentFontFamily.value
    span.textContent = textContent

    // Insere o span no lugar do texto selecionado
    range.insertNode(span)

    // Reseleciona o texto formatado
    range.selectNodeContents(span)
    selection.removeAllRanges()
    selection.addRange(range)

    handleInput()
  }

  // Sempre foca o editor
  editorRef.value.focus()
}

const changeFontSizeNew = () => {
  if (!currentFontSize.value || !editorRef.value) {
    return
  }

  const selection = window.getSelection()

  if (selection && !selection.isCollapsed) {
    const range = selection.getRangeAt(0)
    const selectedContent = range.cloneContents()

    // Extrai apenas o texto puro
    const textContent = extractTextContent(selectedContent)

    // Remove o conteúdo selecionado
    range.deleteContents()

    // Cria um span com o tamanho desejado e o texto puro
    const span = document.createElement('span')
    span.style.fontSize = currentFontSize.value
    span.textContent = textContent

    // Insere o span no lugar do texto selecionado
    range.insertNode(span)

    // Reseleciona o texto formatado
    range.selectNodeContents(span)
    selection.removeAllRanges()
    selection.addRange(range)

    handleInput()
  }

  editorRef.value.focus()
}

const resetFontFamily = () => {
  currentFontFamily.value = ''
  editorRef.value?.focus()
}

const resetFontSize = () => {
  currentFontSize.value = ''
  editorRef.value?.focus()
}

const toggleAIAssistantMode = () => {
  aiAssistantMode.value = !aiAssistantMode.value

  // Fechar o menu se desativar o modo
  if (!aiAssistantMode.value) {
    showSelectionMenu.value = false
  }

  // Desativar outros modos ao ativar IA
  if (aiAssistantMode.value) {
    textBoxMode.value = false
    commentMode.value = false
    screenshotMode.value = false
    pageBreakMode.value = false

    // Verificar se há texto já selecionado
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 0 && props.isPro) {
      selectedText.value = text
      const range = selection!.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      menuPosition.value = {
        x: rect.left + rect.width / 2 - 128,
        y: rect.top - 10 + window.scrollY
      }

      isSelecting.value = true
      // Abrir menu imediatamente se já houver seleção
      setTimeout(() => {
        showSelectionMenu.value = true
      }, 100)
    }
  }
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
  const selection = window.getSelection()
  if (selection && selection.toString()) {
    linkText.value = selection.toString()
  }
  showLinkModal.value = true
}

const confirmLinkInsert = () => {
  if (!linkUrl.value) return

  if (linkText.value) {
    // Se houver texto, cria um link com o texto
    const link = `<a href="${linkUrl.value}" target="_blank" rel="noopener noreferrer">${linkText.value}</a>`
    document.execCommand('insertHTML', false, link)
  } else {
    // Se não houver texto, usa a URL como texto
    const link = `<a href="${linkUrl.value}" target="_blank" rel="noopener noreferrer">${linkUrl.value}</a>`
    document.execCommand('insertHTML', false, link)
  }

  closeLinkModal()
  editorRef.value?.focus()
}

const closeLinkModal = () => {
  showLinkModal.value = false
  linkUrl.value = ''
  linkText.value = ''
}

const toggleCommentMode = () => {
  // Salvar a posição do cursor
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    commentInsertRange.value = selection.getRangeAt(0).cloneRange()
  }

  // Abrir modal diretamente
  showCommentModal.value = true
  commentText.value = ''
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
  showYouTubeModal.value = true
}

const confirmYouTubeInsert = () => {
  const url = youtubeUrl.value.trim()
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

  let startSeconds = 0
  let endSeconds = 0

  if (youtubeStartTime.value) {
    const parts = youtubeStartTime.value.split(':')
    startSeconds = parseInt(parts[0]) * 60 + (parts[1] ? parseInt(parts[1]) : 0)
  }

  if (youtubeEndTime.value) {
    const parts = youtubeEndTime.value.split(':')
    endSeconds = parseInt(parts[0]) * 60 + (parts[1] ? parseInt(parts[1]) : 0)
  }

  // Build embed URL
  let embedUrl = `https://www.youtube.com/embed/${videoId}?`
  if (startSeconds) embedUrl += `start=${startSeconds}&`
  if (endSeconds) embedUrl += `end=${endSeconds}&`

  // Create iframe wrapper
  const wrapper = document.createElement('div')
  wrapper.className = 'youtube-embed-wrapper'
  wrapper.style.cssText = `
    position: relative;
    width: 560px;
    height: 315px;
    margin: 10px 0;
    border: 2px solid #ca643f;
    border-radius: 8px;
    overflow: hidden;
    resize: both;
    display: inline-block;
  `

  const iframe = document.createElement('iframe')
  iframe.src = embedUrl
  iframe.frameBorder = '0'
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  iframe.allowFullscreen = true
  iframe.style.cssText = 'width: 100%; height: 100%; display: block;'

  wrapper.appendChild(iframe)

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.insertNode(wrapper)
    range.collapse(false)
  }

  handleInput()

  // Close modal and reset
  closeYouTubeModal()
}

const closeYouTubeModal = () => {
  showYouTubeModal.value = false
  youtubeUrl.value = ''
  youtubeStartTime.value = ''
  youtubeEndTime.value = ''
}

// Insert page break
const togglePageBreakMode = () => {
  pageBreakMode.value = !pageBreakMode.value
  if (pageBreakMode.value) {
    // Desativa outros modos
    commentMode.value = false
    textBoxMode.value = false
    screenshotMode.value = false
  }
}

const insertPageBreak = (event?: MouseEvent) => {
  // Criar elemento de quebra de página
  const pageBreak = document.createElement('div')
  pageBreak.className = 'page-break-wrapper'
  pageBreak.contentEditable = 'false'

  const breakId = `page-break-${Date.now()}`
  pageBreak.setAttribute('data-break-id', breakId)

  // HTML da quebra de página com linha e botão excluir
  pageBreak.innerHTML = `
    <div style="position: relative; width: 100%; height: 30px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 100%; height: 2px; background: repeating-linear-gradient(to right, #ef4444 0, #ef4444 8px, transparent 8px, transparent 16px);"></div>
      <button class="page-break-delete" style="position: absolute; right: 0; width: 24px; height: 24px; background: #ef4444; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; z-index: 10;">
        <svg style="width: 14px; height: 14px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <span style="position: absolute; left: 50%; transform: translateX(-50%); background: #1f2937; color: #9ca3af; padding: 2px 8px; border-radius: 4px; font-size: 11px; opacity: 0; transition: opacity 0.2s; pointer-events: none;">Quebra de Página</span>
    </div>
  `

  // Adicionar event listeners
  setTimeout(() => {
    const deleteBtn = pageBreak.querySelector('.page-break-delete')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        pageBreak.remove()
        handleInput()
        updatePageCount()
      })
    }

    // Mostrar botão e label ao passar o mouse
    pageBreak.addEventListener('mouseenter', () => {
      const btn = pageBreak.querySelector('.page-break-delete') as HTMLElement
      const label = pageBreak.querySelector('span') as HTMLElement
      if (btn) btn.style.opacity = '1'
      if (label) label.style.opacity = '1'
    })

    pageBreak.addEventListener('mouseleave', () => {
      const btn = pageBreak.querySelector('.page-break-delete') as HTMLElement
      const label = pageBreak.querySelector('span') as HTMLElement
      if (btn) btn.style.opacity = '0'
      if (label) label.style.opacity = '0'
    })
  }, 0)

  if (event && pageBreakMode.value) {
    // Inserir na posição do clique, ajustando para ficar entre linhas
    const editorRect = editorRef.value?.getBoundingClientRect()
    if (editorRect) {
      // Calcular qual linha está mais próxima (cada linha tem 30px)
      const relativeY = event.clientY - editorRect.top
      const lineHeight = 30
      const nearestLine = Math.round(relativeY / lineHeight) * lineHeight

      // Criar um parágrafo vazio se necessário para manter o espaçamento
      const wrapper = document.createElement('div')
      wrapper.appendChild(pageBreak)

      // Inserir no final do editor
      if (editorRef.value) {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(pageBreak)

          // Adicionar um parágrafo vazio depois para continuar escrevendo
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          pageBreak.after(p)

          // Posicionar cursor no novo parágrafo
          const newRange = document.createRange()
          newRange.setStart(p, 0)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        } else {
          editorRef.value.appendChild(pageBreak)
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          editorRef.value.appendChild(p)
        }
      }
    }
    pageBreakMode.value = false
  } else {
    // Inserir na posição do cursor
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(pageBreak)

      // Adicionar parágrafo vazio depois
      const p = document.createElement('p')
      p.innerHTML = '<br>'
      pageBreak.after(p)

      range.collapse(false)
    } else if (editorRef.value) {
      editorRef.value.appendChild(pageBreak)
      const p = document.createElement('p')
      p.innerHTML = '<br>'
      editorRef.value.appendChild(p)
    }
  }

  handleInput()
  updatePageCount()
  editorRef.value?.focus()
}

// Page navigation functions
const updatePageCount = () => {
  if (!editorRef.value) return
  const pageBreaks = editorRef.value.querySelectorAll('.page-break')
  totalPages.value = pageBreaks.length + 1
}

const goToPreviousPage = () => {
  if (currentPage.value <= 1) return
  currentPage.value--
  scrollToPage(currentPage.value)
}

const goToNextPage = () => {
  if (currentPage.value >= totalPages.value) return
  currentPage.value++
  scrollToPage(currentPage.value)
}

const scrollToPage = (pageNumber: number) => {
  if (!editorRef.value) return
  const pageBreaks = editorRef.value.querySelectorAll('.page-break')

  if (pageNumber === 1) {
    editorRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (pageNumber <= pageBreaks.length + 1) {
    const targetBreak = pageBreaks[pageNumber - 2]
    if (targetBreak) {
      targetBreak.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// Screenshot/Capture functions
const toggleScreenshotMode = () => {
  screenshotMode.value = !screenshotMode.value
  if (!screenshotMode.value) {
    screenshotSelection.value = null
    isDrawingSelection.value = false
  }
}

const handleEditorMouseDown = (event: MouseEvent) => {
  if (!screenshotMode.value || !editorRef.value) return

  isDrawingSelection.value = true
  const rect = editorRef.value.getBoundingClientRect()

  screenshotSelection.value = {
    startX: event.clientX - rect.left,
    startY: event.clientY - rect.top,
    endX: event.clientX - rect.left,
    endY: event.clientY - rect.top
  }
}

const handleEditorMouseMove = (event: MouseEvent) => {
  if (!screenshotMode.value || !isDrawingSelection.value || !screenshotSelection.value || !editorRef.value) return

  const rect = editorRef.value.getBoundingClientRect()
  screenshotSelection.value.endX = event.clientX - rect.left
  screenshotSelection.value.endY = event.clientY - rect.top
}

const handleEditorMouseUp = async (event: MouseEvent) => {
  if (!screenshotMode.value || !isDrawingSelection.value || !screenshotSelection.value || !editorRef.value) return

  isDrawingSelection.value = false

  const selection = screenshotSelection.value
  const width = Math.abs(selection.endX - selection.startX)
  const height = Math.abs(selection.endY - selection.startY)

  // Verificar se a seleção é grande o suficiente
  if (width < 50 || height < 50) {
    screenshotSelection.value = null
    return
  }

  // Capturar a área selecionada usando html2canvas
  try {
    // Importar html2canvas dinamicamente
    const html2canvas = (await import('html2canvas')).default

    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)

    const canvas = await html2canvas(editorRef.value, {
      x,
      y,
      width,
      height,
      backgroundColor: '#1f2937',
      scale: 2,
      logging: false
    })

    capturedImage.value = canvas.toDataURL('image/png')

    // Copiar para área de transferência
    canvas.toBlob((blob) => {
      if (blob) {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
          console.log('✅ Imagem copiada para área de transferência')
        })
      }
    })

    // Mostrar menu de IA
    menuPosition.value = {
      x: event.clientX,
      y: event.clientY - 10
    }
    showScreenshotAIMenu.value = true

  } catch (error) {
    console.error('Erro ao capturar área:', error)
  }

  screenshotSelection.value = null
  screenshotMode.value = false
}

const handleScreenshotAIAction = (action: string) => {
  if (capturedImage.value) {
    // Emitir ação com a imagem capturada
    emit('ai-action', action, capturedImage.value)
    showScreenshotAIMenu.value = false
    capturedImage.value = null
  }
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

  // If in page break mode, insert page break at click position
  if (pageBreakMode.value) {
    insertPageBreak(event)
    return
  }

  // If in geometry tool mode, draw shape
  if (geometryTool.value) {
    drawGeometryShape(event)
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
    textBox.setAttribute('data-placeholder', 'true')
    textBox.style.cssText = `
      position: absolute;
      left: ${event.offsetX}px;
      top: ${event.offsetY}px;
      width: 200px;
      height: 100px;
      min-width: 150px;
      min-height: 50px;
      padding: 8px;
      padding-top: 20px;
      border: 2px dashed #ca643f;
      background: #eff6ff;
      border-radius: 4px;
      z-index: 10;
      resize: both;
      overflow: auto;
    `

    // Create drag handle
    const dragHandle = document.createElement('div')
    dragHandle.className = 'text-box-drag-handle'
    dragHandle.innerHTML = '⋮⋮'
    dragHandle.title = 'Arraste para mover'
    dragHandle.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      background: #ca643f;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;
      font-size: 12px;
      font-weight: bold;
      user-select: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 11;
    `

    // Create delete button
    const deleteBtn = document.createElement('div')
    deleteBtn.className = 'text-box-delete-btn'
    deleteBtn.innerHTML = '×'
    deleteBtn.title = 'Excluir caixa de texto'
    deleteBtn.style.cssText = `
      position: absolute;
      top: -8px;
      left: -8px;
      width: 24px;
      height: 24px;
      background: #dc2626;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      user-select: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 11;
    `

    textBox.appendChild(dragHandle)
    textBox.appendChild(deleteBtn)

    // Delete button handler
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      textBox.remove()
      handleInput()
    })

    // Clear placeholder on first focus
    textBox.addEventListener('focus', (e) => {
      if (textBox.getAttribute('data-placeholder') === 'true') {
        textBox.innerHTML = ''
        textBox.removeAttribute('data-placeholder')
      }
    })

    // Make draggable only by handle
    let isDragging = false
    let offsetX = 0
    let offsetY = 0

    const handleDragStart = (e: MouseEvent) => {
      isDragging = true
      const rect = textBox.getBoundingClientRect()
      offsetX = e.clientX - rect.left
      offsetY = e.clientY - rect.top
      textBox.style.cursor = 'move'
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return

      const parentRect = editorRef.value!.getBoundingClientRect()
      let newLeft = e.clientX - parentRect.left - offsetX
      let newTop = e.clientY - parentRect.top - offsetY

      // Keep within bounds
      newLeft = Math.max(0, Math.min(newLeft, parentRect.width - textBox.offsetWidth))
      newTop = Math.max(0, Math.min(newTop, parentRect.height - textBox.offsetHeight))

      textBox.style.left = newLeft + 'px'
      textBox.style.top = newTop + 'px'
    }

    const handleDragEnd = () => {
      if (isDragging) {
        isDragging = false
        textBox.style.cursor = 'text'
        handleInput()
      }
    }

    dragHandle.addEventListener('mousedown', handleDragStart)
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)

    // Allow editing on input
    textBox.addEventListener('input', () => {
      handleInput()
    })

    // Handle backspace/delete when text box is empty
    textBox.addEventListener('keydown', (e) => {
      const isEmpty = textBox.textContent?.trim() === '' || textBox.textContent?.trim() === 'Digite aqui...'
      if ((e.key === 'Backspace' || e.key === 'Delete') && isEmpty) {
        e.preventDefault()
        textBox.remove()
        handleInput()
        return
      }

      // Handle Enter key to create line breaks
      if (e.key === 'Enter') {
        e.stopPropagation()
        // Allow default behavior (insert line break)
        setTimeout(() => handleInput(), 0)
      }
    })

    editorRef.value?.appendChild(textBox)
    textBoxMode.value = false
    commentCursorPosition.value = null
    handleInput()

    // Auto-focus and select placeholder text
    setTimeout(() => {
      textBox.focus()
      const range = document.createRange()
      range.selectNodeContents(textBox)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }, 0)
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
    console.log('📝 Editor content changed, emitting update:', editorRef.value.innerHTML.substring(0, 50) + '...')
    emit('update:modelValue', editorRef.value.innerHTML)
    updatePageCount()
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

  if (text && text.length > 0 && props.isPro && aiAssistantMode.value) {
    selectedText.value = text
    const range = selection!.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    menuPosition.value = {
      x: rect.left + rect.width / 2 - 128, // Center the menu (256px width / 2)
      y: rect.top - 10 + window.scrollY
    }

    isSelecting.value = true
    // Mostrar menu automaticamente após seleção (somente se modo IA estiver ativo)
    setTimeout(() => {
      showSelectionMenu.value = true
    }, 100)
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

    // Wrap image in resizable container after insertion
    setTimeout(() => {
      wrapImagesWithResizeHandles()
    }, 100)
  }
  reader.readAsDataURL(file)

  // Reset input
  input.value = ''
}

// Function to wrap images with resize handles
const wrapImagesWithResizeHandles = () => {
  if (!editorRef.value) return

  const images = editorRef.value.querySelectorAll('img:not(.wrapped)')

  images.forEach((img: Element) => {
    const imgElement = img as HTMLImageElement

    // Skip if already wrapped
    if (imgElement.parentElement?.classList.contains('image-wrapper')) return

    // Mark as wrapped
    imgElement.classList.add('wrapped')

    // Create wrapper
    const wrapper = document.createElement('div')
    wrapper.className = 'image-wrapper'
    wrapper.contentEditable = 'false'

    // Get current image dimensions
    const currentWidth = imgElement.width || imgElement.naturalWidth
    const currentHeight = imgElement.height || imgElement.naturalHeight

    // Set initial size
    wrapper.style.width = currentWidth + 'px'
    wrapper.style.height = currentHeight + 'px'

    // Wrap image
    imgElement.parentNode?.insertBefore(wrapper, imgElement)
    wrapper.appendChild(imgElement)

    // Create resize handles
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    handles.forEach(position => {
      const handle = document.createElement('div')
      handle.className = `image-resize-handle ${position}`
      handle.addEventListener('mousedown', (e) => startImageResize(e, wrapper, position, imgElement))
      wrapper.appendChild(handle)
    })
  })
}

// Image resize logic
const startImageResize = (e: MouseEvent, wrapper: HTMLElement, position: string, img: HTMLImageElement) => {
  e.preventDefault()
  e.stopPropagation()

  const startX = e.clientX
  const startY = e.clientY
  const startWidth = wrapper.offsetWidth
  const startHeight = wrapper.offsetHeight
  const aspectRatio = startWidth / startHeight

  const handleMouseMove = (moveEvent: MouseEvent) => {
    let deltaX = moveEvent.clientX - startX
    let deltaY = moveEvent.clientY - startY

    let newWidth = startWidth
    let newHeight = startHeight

    // Calculate new dimensions based on handle position
    switch (position) {
      case 'bottom-right':
        newWidth = startWidth + deltaX
        newHeight = newWidth / aspectRatio
        break
      case 'bottom-left':
        newWidth = startWidth - deltaX
        newHeight = newWidth / aspectRatio
        break
      case 'top-right':
        newWidth = startWidth + deltaX
        newHeight = newWidth / aspectRatio
        break
      case 'top-left':
        newWidth = startWidth - deltaX
        newHeight = newWidth / aspectRatio
        break
    }

    // Set minimum size
    if (newWidth < 50) newWidth = 50
    if (newHeight < 50) newHeight = 50

    // Apply new size
    wrapper.style.width = newWidth + 'px'
    wrapper.style.height = newHeight + 'px'
    img.style.width = newWidth + 'px'
    img.style.height = newHeight + 'px'
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    handleInput()
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
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

          // Wrap image in resizable container after insertion
          setTimeout(() => {
            wrapImagesWithResizeHandles()
          }, 100)
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

// Geometry tools functions
const activateGeometryTool = (tool: 'line' | 'circle' | 'rectangle' | 'triangle' | 'angle' | 'polygon') => {
  geometryTool.value = geometryTool.value === tool ? null : tool
  commentMode.value = false
  textBoxMode.value = false
  if (tool === 'polygon') {
    showPolygonConfig.value = false
  }
}

const drawGeometryShape = (event: MouseEvent) => {
  if (!geometryTool.value) return

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '200')
  svg.setAttribute('height', '200')
  svg.setAttribute('viewBox', '0 0 200 200')
  svg.style.cssText = `
    position: absolute;
    left: ${event.offsetX}px;
    top: ${event.offsetY}px;
    cursor: move;
  `
  svg.classList.add('geometry-shape')

  let shape: SVGElement

  switch (geometryTool.value) {
    case 'line':
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      shape.setAttribute('x1', '20')
      shape.setAttribute('y1', '20')
      shape.setAttribute('x2', '180')
      shape.setAttribute('y2', '180')
      shape.setAttribute('stroke', '#ca643f')
      shape.setAttribute('stroke-width', '3')
      break
    case 'circle':
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      shape.setAttribute('cx', '100')
      shape.setAttribute('cy', '100')
      shape.setAttribute('r', '80')
      shape.setAttribute('stroke', '#ca643f')
      shape.setAttribute('stroke-width', '3')
      shape.setAttribute('fill', 'none')
      break
    case 'rectangle':
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      shape.setAttribute('x', '20')
      shape.setAttribute('y', '40')
      shape.setAttribute('width', '160')
      shape.setAttribute('height', '120')
      shape.setAttribute('stroke', '#ca643f')
      shape.setAttribute('stroke-width', '3')
      shape.setAttribute('fill', 'none')
      break
    case 'triangle':
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      shape.setAttribute('points', '100,20 20,180 180,180')
      shape.setAttribute('stroke', '#ca643f')
      shape.setAttribute('stroke-width', '3')
      shape.setAttribute('fill', 'none')
      break
    case 'angle':
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line1.setAttribute('x1', '40')
      line1.setAttribute('y1', '160')
      line1.setAttribute('x2', '40')
      line1.setAttribute('y2', '40')
      line1.setAttribute('stroke', '#ca643f')
      line1.setAttribute('stroke-width', '3')
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line2.setAttribute('x1', '40')
      line2.setAttribute('y1', '160')
      line2.setAttribute('x2', '160')
      line2.setAttribute('y2', '160')
      line2.setAttribute('stroke', '#ca643f')
      line2.setAttribute('stroke-width', '3')
      const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      arc.setAttribute('d', 'M 80 160 A 40 40 0 0 1 40 120')
      arc.setAttribute('stroke', '#ca643f')
      arc.setAttribute('stroke-width', '2')
      arc.setAttribute('fill', 'none')
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', '70')
      text.setAttribute('y', '145')
      text.setAttribute('fill', '#ca643f')
      text.setAttribute('font-size', '16')
      text.textContent = '90°'
      g.appendChild(line1)
      g.appendChild(line2)
      g.appendChild(arc)
      g.appendChild(text)
      shape = g
      break
    case 'polygon':
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      // Calcular pontos do polígono regular
      const sides = polygonSides.value
      const centerX = 100
      const centerY = 100
      const radius = 80
      const points: string[] = []
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      shape.setAttribute('points', points.join(' '))
      shape.setAttribute('stroke', '#ca643f')
      shape.setAttribute('stroke-width', '3')
      shape.setAttribute('fill', 'none')
      break
    default:
      return
  }

  svg.appendChild(shape)
  editorRef.value?.appendChild(svg)
  geometryTool.value = null
  handleInput()
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

  // Close color picker when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative') || !target.closest('button[title="Cor da fonte"]')) {
      showColorPicker.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  // Wrap existing images with resize handles
  setTimeout(() => {
    wrapImagesWithResizeHandles()
    updatePageCount()
  }, 200)
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
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s;
}

.rich-content-editor .prose img:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.rich-content-editor .image-wrapper {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin: 1.5em 0;
}

.rich-content-editor .image-wrapper img {
  display: block;
  margin: 0;
}

.rich-content-editor .image-resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ca643f;
  border: 2px solid white;
  border-radius: 50%;
  cursor: nwse-resize;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.rich-content-editor .image-wrapper:hover .image-resize-handle {
  opacity: 1;
}

.rich-content-editor .image-resize-handle.bottom-right {
  bottom: -6px;
  right: -6px;
}

.rich-content-editor .image-resize-handle.bottom-left {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}

.rich-content-editor .image-resize-handle.top-right {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}

.rich-content-editor .image-resize-handle.top-left {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
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
  color: #ca643f;
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
  cursor: text;
  resize: both;
  overflow: auto;
}

.rich-content-editor .text-box-element:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.rich-content-editor .text-box-element:focus {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.rich-content-editor .text-box-drag-handle {
  transition: transform 0.2s, background-color 0.2s;
}

.rich-content-editor .text-box-drag-handle:hover {
  transform: scale(1.1);
  background-color: #2563eb;
}

.rich-content-editor .text-box-delete-btn {
  transition: transform 0.2s, background-color 0.2s;
}

.rich-content-editor .text-box-delete-btn:hover {
  transform: scale(1.1);
  background-color: #b91c1c;
}

/* YouTube embed styling */
.rich-content-editor .youtube-embed-wrapper {
  cursor: move;
  resize: both;
  overflow: hidden;
}

.rich-content-editor .youtube-embed-wrapper:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Page break styling */
.rich-content-editor .page-break {
  page-break-before: always;
  margin: 20px 0;
}

@media print {
  .rich-content-editor .page-break hr {
    display: none;
  }
  .rich-content-editor .page-break div {
    display: none;
  }
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

/* Notebook lines styling */
.rich-content-editor .notebook-lines {
  background: repeating-linear-gradient(
    transparent,
    transparent 29px,
    rgba(59, 130, 246, 0.25) 29px,
    rgba(59, 130, 246, 0.25) 30px
  ) !important;
  background-color: white !important;
  line-height: 30px;
}

/* Page break styling - não afeta o layout, apenas visual */
.rich-content-editor .page-break {
  margin: 2rem 0;
  border: none;
  border-top: 2px dashed rgba(59, 130, 246, 0.3);
  page-break-after: always;
  position: relative;
}

.rich-content-editor .page-break::after {
  content: '--- Quebra de Página ---';
  display: block;
  text-align: center;
  color: rgba(59, 130, 246, 0.5);
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* Page Break Mode Cursor */
.page-break-cursor {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cline x1='0' y1='12' x2='24' y2='12' stroke='%23ef4444' stroke-width='2' stroke-dasharray='4,4'/%3E%3C/svg%3E") 12 12, crosshair !important;
}

/* Page Break Wrapper Styles */
.rich-content-editor .page-break-wrapper {
  position: relative;
  width: 100%;
  user-select: none;
  page-break-after: always;
  break-after: page;
  display: block;
  margin: 0;
  padding: 0;
}

/* Ocultar a linha pontilhada na impressão, manter apenas a quebra */
@media print {
  .rich-content-editor .page-break-wrapper > div {
    display: none;
  }

  .rich-content-editor .page-break-wrapper {
    height: 0;
    margin: 0;
    padding: 0;
  }
}
</style>
