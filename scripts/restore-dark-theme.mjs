// Script para restaurar o tema dark como padrão
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
const files = getAllVueFiles(pagesDir)

console.log(`🔍 Restaurando tema dark em ${files.length} arquivos .vue\n`)

const replacements = [
  // Background principal
  {
    from: /class="([^"]*)bg-gray-50 dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900([^"]*)"/g,
    to: 'class="$1bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900$2"'
  },

  // Cards e containers principais
  {
    from: /class="([^"]*)bg-white\/90 dark:bg-dark-800\/50 backdrop-blur-sm border border-gray-200 dark:border-dark-700([^"]*)"/g,
    to: 'class="$1bg-dark-800/50 backdrop-blur-sm border border-dark-700$2"'
  },
  {
    from: /class="([^"]*)bg-white\/90 dark:bg-dark-800\/50 border border-gray-200 dark:border-dark-700([^"]*)"/g,
    to: 'class="$1bg-dark-800/50 border border-dark-700$2"'
  },
  {
    from: /class="([^"]*)bg-gray-100 dark:bg-dark-900\/50([^"]*)"/g,
    to: 'class="$1bg-dark-900/50$2"'
  },
  {
    from: /class="([^"]*)bg-gray-200 dark:bg-dark-700([^"]*)"/g,
    to: 'class="$1bg-dark-700$2"'
  },
  {
    from: /class="([^"]*)bg-white dark:bg-dark-800([^"]*)"/g,
    to: 'class="$1bg-dark-800$2"'
  },

  // Inputs e forms
  {
    from: /class="([^"]*)bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-700([^"]*)"/g,
    to: 'class="$1bg-dark-900 border border-dark-700$2"'
  },

  // Text colors
  {
    from: /class="([^"]*)text-gray-900 dark:text-white([^"]*)"/g,
    to: 'class="$1text-white$2"'
  },
  {
    from: /class="([^"]*)text-gray-600 dark:text-gray-400([^"]*)"/g,
    to: 'class="$1text-gray-400$2"'
  },
  {
    from: /class="([^"]*)text-gray-700 dark:text-gray-300([^"]*)"/g,
    to: 'class="$1text-gray-300$2"'
  },

  // Borders
  {
    from: /class="([^"]*)border-gray-200 dark:border-dark-700([^"]*)"/g,
    to: 'class="$1border-dark-700$2"'
  },
  {
    from: /class="([^"]*)divide-gray-200 dark:divide-dark-700([^"]*)"/g,
    to: 'class="$1divide-dark-700$2"'
  },

  // Hovers
  {
    from: /class="([^"]*)hover:bg-gray-100 dark:hover:bg-dark-700([^"]*)"/g,
    to: 'class="$1hover:bg-dark-700$2"'
  },
  {
    from: /class="([^"]*)hover:text-gray-900 dark:hover:text-white([^"]*)"/g,
    to: 'class="$1hover:text-white$2"'
  },

  // Placeholders
  {
    from: /class="([^"]*)placeholder-gray-400 dark:placeholder-gray-500([^"]*)"/g,
    to: 'class="$1placeholder-gray-500$2"'
  },
]

let totalChanges = 0
let filesChanged = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8')
    const originalContent = content
    let fileChanges = 0

    for (const { from, to } of replacements) {
      const before = content
      content = content.replace(from, to)
      if (content !== before) {
        fileChanges++
      }
    }

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8')
      console.log(`✅ ${file.replace('app/pages/', '')}`)
      filesChanged++
      totalChanges += fileChanges
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n🎉 ${filesChanged} arquivos restaurados para tema dark!`)
console.log(`📊 Total de ${totalChanges} alterações aplicadas`)
