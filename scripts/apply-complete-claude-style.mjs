// Script para aplicar composição visual COMPLETA do Claude.ai no tema claro
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function getAllVueFiles(dir, fileList = []) {
  const files = readdirSync(dir)

  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      getAllVueFiles(filePath, fileList)
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

const pagesDir = 'app/pages'
const componentsDir = 'app/components'
const files = [
  ...getAllVueFiles(pagesDir),
  ...getAllVueFiles(componentsDir)
]

console.log(`🎨 Aplicando estilo COMPLETO Claude.ai em ${files.length} arquivos\n`)

const replacements = [
  // ===== CARDS E CONTAINERS =====
  {
    from: /class="([^"]*)bg-white\/90 dark:bg-dark-800\/50 backdrop-blur-sm border border-claude-border dark:border-dark-700([^"]*)"/g,
    to: 'class="$1bg-claude-bg dark:bg-dark-800/50 border border-claude-border dark:border-dark-700 shadow-claude-sm dark:shadow-none$2"',
    desc: 'Cards com backdrop-blur'
  },
  {
    from: /class="([^"]*)bg-white\/90 dark:bg-dark-800\/50([^"]*)"/g,
    to: 'class="$1bg-claude-bg dark:bg-dark-800/50$2"',
    desc: 'Backgrounds de cards'
  },
  {
    from: /class="([^"]*)bg-claude-bg dark:bg-dark-800([^"]*)"/g,
    to: 'class="$1bg-claude-bg dark:bg-dark-800$2"',
    desc: 'Backgrounds principais'
  },

  // ===== INPUTS E FORMS =====
  {
    from: /class="([^"]*)bg-claude-bg dark:bg-dark-900 border border-claude-border-input dark:border-dark-700([^"]*)"/g,
    to: 'class="$1bg-claude-bg-input dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 focus:border-claude-primary dark:focus:border-primary-500 focus:ring-1 focus:ring-claude-primary\/20 dark:focus:ring-primary-500/20$2"',
    desc: 'Inputs com foco estilo Claude'
  },
  {
    from: /class="([^"]*)border border-claude-border-input dark:border-dark-700([^"]*)placeholder-claude-text-tertiary([^"]*)"/g,
    to: 'class="$1border border-claude-border-input dark:border-dark-700 focus:border-claude-primary dark:focus:border-primary-500$2placeholder-claude-text-placeholder dark:placeholder-gray-500$3"',
    desc: 'Borders e placeholders de inputs'
  },

  // ===== BACKGROUNDS SECUNDÁRIOS =====
  {
    from: /class="([^"]*)bg-claude-bg-secondary dark:bg-dark-900\/50([^"]*)"/g,
    to: 'class="$1bg-claude-bg-secondary dark:bg-dark-900/50$2"',
    desc: 'Backgrounds secundários'
  },
  {
    from: /class="([^"]*)bg-claude-bg-secondary dark:bg-dark-900([^"]*)"/g,
    to: 'class="$1bg-claude-bg-secondary dark:bg-dark-900$2"',
    desc: 'Backgrounds secundários sólidos'
  },

  // ===== BORDERS =====
  {
    from: /class="([^"]*)border-claude-border dark:border-dark-700([^"]*)"/g,
    to: 'class="$1border-claude-border dark:border-dark-700$2"',
    desc: 'Bordas principais'
  },

  // ===== HOVER STATES =====
  {
    from: /class="([^"]*)hover:bg-claude-bg-secondary dark:hover:bg-dark-700([^"]*)"/g,
    to: 'class="$1hover:bg-claude-bg-hover dark:hover:bg-dark-700 transition-colors duration-150$2"',
    desc: 'Hover backgrounds'
  },
  {
    from: /class="([^"]*)hover:bg-claude-bg-secondary\/50 dark:hover:bg-dark-800([^"]*)"/g,
    to: 'class="$1hover:bg-claude-bg-hover dark:hover:bg-dark-800 transition-colors duration-150$2"',
    desc: 'Hover backgrounds suaves'
  },

  // ===== BOTÕES PRIMÁRIOS =====
  {
    from: /class="([^"]*)bg-gradient-to-r from-claude-primary to-claude-hover dark:from-primary-500 dark:to-primary-600([^"]*)"/g,
    to: 'class="$1bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md$2"',
    desc: 'Botões primários com sombras'
  },

  // ===== ROUNDED CORNERS (estilo Claude) =====
  {
    from: /class="([^"]*)rounded-xl([^"]*)"/g,
    to: 'class="$1rounded-claude-lg$2"',
    desc: 'Border radius XL -> Claude LG'
  },
  {
    from: /class="([^"]*)rounded-lg([^"]*)"/g,
    to: 'class="$1rounded-claude-md$2"',
    desc: 'Border radius LG -> Claude MD'
  },

  // ===== TEXTO LINKS =====
  {
    from: /class="([^"]*)text-claude-primary dark:text-primary-400([^"]*)"/g,
    to: 'class="$1text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors$2"',
    desc: 'Links com hover'
  },

  // ===== DIVISORES =====
  {
    from: /class="([^"]*)divide-claude-border dark:divide-dark-700([^"]*)"/g,
    to: 'class="$1divide-claude-border dark:divide-dark-700$2"',
    desc: 'Divisores'
  },

  // ===== PLACEHOLDERS =====
  {
    from: /placeholder-claude-text-tertiary dark:placeholder-gray-500/g,
    to: 'placeholder-claude-text-placeholder dark:placeholder-gray-500',
    desc: 'Placeholders atualizados'
  },
]

let totalChanges = 0
let filesChanged = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8')
    const originalContent = content
    let fileChanges = 0

    for (const { from, to, desc } of replacements) {
      const matches = (content.match(from) || []).length
      if (matches > 0) {
        content = content.replace(from, to)
        fileChanges += matches
      }
    }

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8')
      const shortPath = file.replace(/^.*[\\\/](app[\\\/])/, '$1')
      console.log(`✅ ${shortPath} - ${fileChanges} alterações`)
      filesChanged++
      totalChanges += fileChanges
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n${'='.repeat(70)}`)
console.log(`🎉 COMPOSIÇÃO VISUAL CLAUDE.AI APLICADA`)
console.log(`${'='.repeat(70)}`)
console.log(`📄 Arquivos modificados: ${filesChanged}`)
console.log(`🔄 Total de alterações: ${totalChanges}`)
console.log(`\n✨ Estilos aplicados no tema claro:`)
console.log(`   • Cards com sombras sutis`)
console.log(`   • Inputs com foco highlight terracota`)
console.log(`   • Botões com transições suaves`)
console.log(`   • Border radius consistente (6px, 8px, 12px)`)
console.log(`   • Hover states com feedback visual`)
console.log(`   • Placeholders com cor adequada`)
console.log(`   • Links com hover transition`)
console.log(`\n🌙 Tema escuro permanece com estilo original (verde)`)
