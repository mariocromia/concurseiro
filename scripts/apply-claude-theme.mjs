// Script para aplicar paleta Claude.ai no tema claro
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

console.log(`🎨 Aplicando paleta Claude.ai em ${files.length} arquivos\n`)

const replacements = [
  // Backgrounds - tema claro usa #FFFFFF e #F5F5F5
  {
    from: /class="([^"]*)bg-white dark:bg-dark-800([^"]*)"/g,
    to: 'class="$1bg-claude-bg dark:bg-dark-800$2"',
    desc: 'Background principal (#FFFFFF)'
  },
  {
    from: /class="([^"]*)bg-white\/90 dark:bg-dark-800\/50([^"]*)"/g,
    to: 'class="$1bg-claude-bg dark:bg-dark-800/50$2"',
    desc: 'Background cards (#FFFFFF)'
  },
  {
    from: /class="([^"]*)bg-gray-50 dark:bg-dark-900([^"]*)"/g,
    to: 'class="$1bg-claude-bg-secondary dark:bg-dark-900$2"',
    desc: 'Background secundário (#F5F5F5)'
  },
  {
    from: /class="([^"]*)bg-gray-100 dark:bg-dark-900\/50([^"]*)"/g,
    to: 'class="$1bg-claude-bg-secondary dark:bg-dark-900/50$2"',
    desc: 'Background terciário (#F5F5F5)'
  },
  {
    from: /class="([^"]*)bg-gray-200 dark:bg-dark-700([^"]*)"/g,
    to: 'class="$1bg-claude-bg-secondary dark:bg-dark-700$2"',
    desc: 'Background cards (#F5F5F5)'
  },

  // Text colors - #2C2C2C, #6B6B6B, #999999
  {
    from: /class="([^"]*)text-gray-900 dark:text-white([^"]*)"/g,
    to: 'class="$1text-claude-text dark:text-white$2"',
    desc: 'Texto principal (#2C2C2C)'
  },
  {
    from: /class="([^"]*)text-gray-600 dark:text-gray-400([^"]*)"/g,
    to: 'class="$1text-claude-text-secondary dark:text-gray-400$2"',
    desc: 'Texto secundário (#6B6B6B)'
  },
  {
    from: /class="([^"]*)text-gray-700 dark:text-gray-300([^"]*)"/g,
    to: 'class="$1text-claude-text-secondary dark:text-gray-300$2"',
    desc: 'Texto secundário (#6B6B6B)'
  },
  {
    from: /class="([^"]*)text-gray-500 dark:text-gray-500([^"]*)"/g,
    to: 'class="$1text-claude-text-tertiary dark:text-gray-500$2"',
    desc: 'Texto terciário (#999999)'
  },

  // Borders - #E5E5E5, #D4D4D4, #CCCCCC
  {
    from: /class="([^"]*)border-gray-200 dark:border-dark-700([^"]*)"/g,
    to: 'class="$1border-claude-border dark:border-dark-700$2"',
    desc: 'Borda principal (#E5E5E5)'
  },
  {
    from: /class="([^"]*)border-gray-300 dark:border-dark-700([^"]*)"/g,
    to: 'class="$1border-claude-border-input dark:border-dark-700$2"',
    desc: 'Borda inputs (#CCCCCC)'
  },
  {
    from: /class="([^"]*)divide-gray-200 dark:divide-dark-700([^"]*)"/g,
    to: 'class="$1divide-claude-border dark:divide-dark-700$2"',
    desc: 'Divisores (#E5E5E5)'
  },

  // Hover states
  {
    from: /class="([^"]*)hover:bg-gray-100 dark:hover:bg-dark-700([^"]*)"/g,
    to: 'class="$1hover:bg-claude-bg-secondary dark:hover:bg-dark-700$2"',
    desc: 'Hover background (#F5F5F5)'
  },
  {
    from: /class="([^"]*)hover:bg-gray-50 dark:hover:bg-dark-800([^"]*)"/g,
    to: 'class="$1hover:bg-claude-bg-secondary/50 dark:hover:bg-dark-800$2"',
    desc: 'Hover background suave'
  },
  {
    from: /class="([^"]*)hover:text-gray-900 dark:hover:text-white([^"]*)"/g,
    to: 'class="$1hover:text-claude-text dark:hover:text-white$2"',
    desc: 'Hover texto (#2C2C2C)'
  },

  // Placeholders
  {
    from: /class="([^"]*)placeholder-gray-400 dark:placeholder-gray-500([^"]*)"/g,
    to: 'class="$1placeholder-claude-text-tertiary dark:placeholder-gray-500$2"',
    desc: 'Placeholder (#999999)'
  },
  {
    from: /class="([^"]*)placeholder-gray-500 dark:placeholder-gray-400([^"]*)"/g,
    to: 'class="$1placeholder-claude-text-tertiary dark:placeholder-gray-400$2"',
    desc: 'Placeholder (#999999)'
  },

  // Primary colors - usar #CC785C
  {
    from: /from-primary-500 to-primary-600/g,
    to: 'from-claude-primary to-claude-hover',
    desc: 'Gradiente primário Claude'
  },
  {
    from: /hover:from-primary-600 hover:to-primary-700/g,
    to: 'hover:from-claude-hover hover:to-primary-700',
    desc: 'Hover gradiente primário'
  },
  {
    from: /bg-primary-500\/20/g,
    to: 'bg-claude-primary/20',
    desc: 'Background primário com opacidade'
  },
  {
    from: /text-primary-400/g,
    to: 'text-claude-primary',
    desc: 'Texto cor primária'
  },
  {
    from: /border-primary-500/g,
    to: 'border-claude-primary',
    desc: 'Borda cor primária'
  },
]

let totalChanges = 0
let filesChanged = 0
const changesByFile = {}

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

        if (!changesByFile[file]) {
          changesByFile[file] = []
        }
        changesByFile[file].push({ desc, count: matches })
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

console.log(`\n${'='.repeat(60)}`)
console.log(`🎉 RESULTADO FINAL`)
console.log(`${'='.repeat(60)}`)
console.log(`📄 Arquivos modificados: ${filesChanged}`)
console.log(`🔄 Total de alterações: ${totalChanges}`)
console.log(`\n✨ Paleta Claude.ai aplicada com sucesso!`)
console.log(`\n📋 Cores do tema claro:`)
console.log(`   • Background: #FFFFFF`)
console.log(`   • Background secundário: #F5F5F5`)
console.log(`   • Texto principal: #2C2C2C`)
console.log(`   • Texto secundário: #6B6B6B`)
console.log(`   • Texto terciário: #999999`)
console.log(`   • Primária: #CC785C`)
console.log(`   • Hover: #B86849`)
console.log(`   • Foco: #E8B4A0`)
console.log(`   • Bordas: #E5E5E5`)
console.log(`   • Bordas inputs: #CCCCCC`)
console.log(`\n⚡ O tema escuro permanece intacto!`)
