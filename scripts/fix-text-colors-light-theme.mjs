// Script para adicionar suporte a tema claro apenas nas cores de texto
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
  // Text colors principais - white vira dark:text-white (cinza escuro no light)
  {
    from: /class="([^"]*)text-white([^"]*)"/g,
    to: 'class="$1text-gray-900 dark:text-white$2"',
    desc: 'Texto principal (branco -> cinza escuro)'
  },

  // Text colors secundários
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

  {
    from: /class="([^"]*)text-gray-500([^"]*)"/g,
    to: 'class="$1text-gray-600 dark:text-gray-500$2"',
    desc: 'Texto quaternário'
  },

  // Hover text colors
  {
    from: /class="([^"]*)hover:text-white([^"]*)"/g,
    to: 'class="$1hover:text-gray-900 dark:hover:text-white$2"',
    desc: 'Hover texto'
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
      console.log(`✅ ${file.replace('app/pages/', '')} - ${fileChanges} alterações`)
      filesChanged++
      totalChanges += fileChanges
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n🎉 ${filesChanged} arquivos atualizados!`)
console.log(`📊 Total de ${totalChanges} alterações de cores de texto`)
console.log(`\n✨ Agora os textos brancos aparecerão em cinza escuro no tema claro`)
