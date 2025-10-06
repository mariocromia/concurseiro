// Script para corrigir elementos internos com suporte ao tema claro
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

console.log(`🔍 Processando ${files.length} arquivos .vue\n`)

const replacements = [
  // Cards e containers principais
  {
    from: /class="([^"]*)bg-dark-800\/50 backdrop-blur-sm border border-dark-700([^"]*)"/g,
    to: 'class="$1bg-white/90 dark:bg-dark-800/50 backdrop-blur-sm border border-gray-200 dark:border-dark-700$2"',
    desc: 'Cards principais'
  },
  {
    from: /class="([^"]*)bg-dark-800\/50 border border-dark-700([^"]*)"/g,
    to: 'class="$1bg-white/90 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700$2"',
    desc: 'Cards simples'
  },
  {
    from: /class="([^"]*)bg-dark-900\/50([^"]*)"/g,
    to: 'class="$1bg-gray-100 dark:bg-dark-900/50$2"',
    desc: 'Backgrounds secundários'
  },
  {
    from: /class="([^"]*)bg-dark-700([^"]*)"/g,
    to: 'class="$1bg-gray-200 dark:bg-dark-700$2"',
    desc: 'Backgrounds terciários'
  },
  {
    from: /class="([^"]*)bg-dark-800([^"]*)"/g,
    to: 'class="$1bg-white dark:bg-dark-800$2"',
    desc: 'Backgrounds brancos'
  },

  // Inputs e forms
  {
    from: /class="([^"]*)bg-dark-900 border border-dark-700([^"]*)"/g,
    to: 'class="$1bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-700$2"',
    desc: 'Inputs'
  },

  // Text colors
  {
    from: /class="([^"]*)text-white([^"]*)"/g,
    to: 'class="$1text-gray-900 dark:text-white$2"',
    desc: 'Texto principal'
  },
  {
    from: /class="([^"]*)text-gray-400([^"]*)"/g,
    to: 'class="$1text-gray-600 dark:text-gray-400$2"',
    desc: 'Texto secundário'
  },
  {
    from: /class="([^"]*)text-gray-300([^"]*)"/g,
    to: 'class="$1text-gray-700 dark:text-gray-300$2"',
    desc: 'Texto terciário'
  },

  // Borders
  {
    from: /class="([^"]*)border-dark-700([^"]*)"/g,
    to: 'class="$1border-gray-200 dark:border-dark-700$2"',
    desc: 'Bordas'
  },
  {
    from: /class="([^"]*)divide-dark-700([^"]*)"/g,
    to: 'class="$1divide-gray-200 dark:divide-dark-700$2"',
    desc: 'Divisores'
  },

  // Hovers
  {
    from: /class="([^"]*)hover:bg-dark-700([^"]*)"/g,
    to: 'class="$1hover:bg-gray-100 dark:hover:bg-dark-700$2"',
    desc: 'Hover backgrounds'
  },
  {
    from: /class="([^"]*)hover:text-white([^"]*)"/g,
    to: 'class="$1hover:text-gray-900 dark:hover:text-white$2"',
    desc: 'Hover text'
  },

  // Placeholders
  {
    from: /class="([^"]*)placeholder-gray-500([^"]*)"/g,
    to: 'class="$1placeholder-gray-400 dark:placeholder-gray-500$2"',
    desc: 'Placeholders'
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
      const before = content
      content = content.replace(from, to)
      if (content !== before) {
        fileChanges++
      }
    }

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8')
      console.log(`✅ ${file.replace('app/pages/', '')} - ${fileChanges} tipos de alterações`)
      filesChanged++
      totalChanges += fileChanges
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n🎉 ${filesChanged} arquivos atualizados!`)
console.log(`📊 Total de ${totalChanges} tipos de alterações aplicadas`)
