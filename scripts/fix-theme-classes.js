// Script para converter classes dark fixas para suporte a tema claro/escuro
import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'

const replacements = [
  // Backgrounds principais
  { from: /class="([^"]*)\bbg-gradient-to-br from-dark-900 via-dark-800 to-dark-900([^"]*)"/, to: 'class="$1bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900$2"' },
  { from: /class="([^"]*)\bbg-dark-800\/50([^"]*)"/, to: 'class="$1bg-white/80 dark:bg-dark-800/50$2"' },
  { from: /class="([^"]*)\bbg-dark-800\/80([^"]*)"/, to: 'class="$1bg-white/90 dark:bg-dark-800/80$2"' },
  { from: /class="([^"]*)\bbg-dark-900\/50([^"]*)"/, to: 'class="$1bg-gray-50 dark:bg-dark-900/50$2"' },
  { from: /class="([^"]*)\bbg-dark-700([^"]*)"/, to: 'class="$1bg-gray-100 dark:bg-dark-700$2"' },
  { from: /class="([^"]*)\bbg-dark-800([^"]*)"/, to: 'class="$1bg-white dark:bg-dark-800$2"' },
  { from: /class="([^"]*)\bbg-dark-900([^"]*)"/, to: 'class="$1bg-gray-50 dark:bg-dark-900$2"' },

  // Borders
  { from: /class="([^"]*)\bborder-dark-700([^"]*)"/, to: 'class="$1border-gray-200 dark:border-dark-700$2"' },
  { from: /class="([^"]*)\bborder-dark-600([^"]*)"/, to: 'class="$1border-gray-300 dark:border-dark-600$2"' },

  // Text colors
  { from: /class="([^"]*)\btext-white([^"]*)"/, to: 'class="$1text-gray-900 dark:text-white$2"' },
  { from: /class="([^"]*)\btext-gray-400([^"]*)"/, to: 'class="$1text-gray-600 dark:text-gray-400$2"' },
  { from: /class="([^"]*)\btext-gray-300([^"]*)"/, to: 'class="$1text-gray-700 dark:text-gray-300$2"' },
  { from: /class="([^"]*)\btext-gray-500([^"]*)"/, to: 'class="$1text-gray-600 dark:text-gray-500$2"' },

  // Hovers
  { from: /class="([^"]*)\bhover:bg-dark-700([^"]*)"/, to: 'class="$1hover:bg-gray-100 dark:hover:bg-dark-700$2"' },
  { from: /class="([^"]*)\bhover:bg-dark-800([^"]*)"/, to: 'class="$1hover:bg-gray-50 dark:hover:bg-dark-800$2"' },
  { from: /class="([^"]*)\bhover:text-white([^"]*)"/, to: 'class="$1hover:text-gray-900 dark:hover:text-white$2"' },

  // Placeholders
  { from: /class="([^"]*)\bplaceholder-gray-500([^"]*)"/, to: 'class="$1placeholder-gray-400 dark:placeholder-gray-500$2"' },
  { from: /class="([^"]*)\bplaceholder-gray-400([^"]*)"/, to: 'class="$1placeholder-gray-500 dark:placeholder-gray-400$2"' },

  // Dividers
  { from: /class="([^"]*)\bdivide-dark-700([^"]*)"/, to: 'class="$1divide-gray-200 dark:divide-dark-700$2"' },
]

const files = globSync('app/pages/**/*.vue')

console.log(`🔍 Encontrados ${files.length} arquivos Vue\n`)

let totalChanges = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8')
    let changed = false
    let fileChanges = 0

    for (const { from, to } of replacements) {
      const matches = content.match(from)
      if (matches) {
        content = content.replace(from, to)
        changed = true
        fileChanges++
      }
    }

    if (changed) {
      writeFileSync(file, content, 'utf8')
      console.log(`✅ ${file} - ${fileChanges} alterações`)
      totalChanges += fileChanges
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n🎉 Total de ${totalChanges} alterações em ${files.length} arquivos`)
