// Script para restaurar cores verdes no tema escuro (mantendo Claude.ai no claro)
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

console.log(`🔄 Restaurando verde no tema escuro em ${files.length} arquivos\n`)

const replacements = [
  // Gradientes de botões - usar primary (verde) no dark, claude no light
  {
    from: /class="([^"]*)from-claude-primary to-claude-hover([^"]*)"/g,
    to: 'class="$1from-claude-primary to-claude-hover dark:from-primary-500 dark:to-primary-600$2"',
    desc: 'Gradiente botões primários'
  },
  {
    from: /class="([^"]*)hover:from-claude-hover hover:to-primary-700([^"]*)"/g,
    to: 'class="$1hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700$2"',
    desc: 'Hover gradiente botões'
  },

  // Backgrounds com opacidade
  {
    from: /class="([^"]*)bg-claude-primary\/20([^"]*)"/g,
    to: 'class="$1bg-claude-primary/20 dark:bg-primary-500/20$2"',
    desc: 'Background primário 20%'
  },
  {
    from: /class="([^"]*)bg-claude-primary\/10([^"]*)"/g,
    to: 'class="$1bg-claude-primary/10 dark:bg-primary-500/10$2"',
    desc: 'Background primário 10%'
  },

  // Texto com cor primária
  {
    from: /class="([^"]*)text-claude-primary([^"]*)"/g,
    to: 'class="$1text-claude-primary dark:text-primary-400$2"',
    desc: 'Texto cor primária'
  },

  // Bordas com cor primária
  {
    from: /class="([^"]*)border-claude-primary([^"]*)"/g,
    to: 'class="$1border-claude-primary dark:border-primary-500$2"',
    desc: 'Borda cor primária'
  },

  // Hover bordas primárias
  {
    from: /class="([^"]*)hover:border-claude-primary([^"]*)"/g,
    to: 'class="$1hover:border-claude-primary dark:hover:border-primary-500$2"',
    desc: 'Hover borda primária'
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

console.log(`\n${'='.repeat(60)}`)
console.log(`🎉 RESULTADO`)
console.log(`${'='.repeat(60)}`)
console.log(`📄 Arquivos modificados: ${filesChanged}`)
console.log(`🔄 Total de alterações: ${totalChanges}`)
console.log(`\n✨ Cores restauradas:`)
console.log(`   🌙 TEMA ESCURO: Verde (#22c55e) - ORIGINAL`)
console.log(`   ☀️  TEMA CLARO: Terracota (#CC785C) - Claude.ai`)
