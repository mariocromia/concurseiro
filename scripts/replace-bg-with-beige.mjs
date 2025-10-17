// Script para substituir backgrounds das páginas específicas por tom bege #faf9f5
import { readFileSync, writeFileSync } from 'fs'

const files = [
  'app/pages/subjects.vue',
  'app/pages/metas.vue',
  'app/pages/study.vue',
  'app/pages/notebook.vue',
  'app/pages/flashcards.vue',
  'app/pages/reports.vue'
]

const beigeColor = '#faf9f5'

console.log(`🎨 Substituindo backgrounds por tom bege (${beigeColor}) em 6 páginas\n`)

const replacements = [
  // Background principal da página - trocar gradiente por bege no light mode
  {
    from: /class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900"/g,
    to: `class="min-h-screen bg-[${beigeColor}] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"`,
    desc: 'Background principal da página'
  },
  // Alternativa sem gradiente
  {
    from: /class="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"/g,
    to: `class="min-h-screen bg-[${beigeColor}] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"`,
    desc: 'Background principal alternativo'
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
        console.log(`   📝 ${desc}: ${matches} ocorrência(s)`)
      }
    }

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8')
      const shortPath = file.replace('app/pages/', '')
      console.log(`✅ ${shortPath} - ${fileChanges} alterações\n`)
      filesChanged++
      totalChanges += fileChanges
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`${'='.repeat(60)}`)
console.log(`🎉 RESULTADO`)
console.log(`${'='.repeat(60)}`)
console.log(`📄 Arquivos modificados: ${filesChanged}`)
console.log(`🔄 Total de alterações: ${totalChanges}`)
console.log(`\n✨ Background atualizado:`)
console.log(`   ☀️  TEMA CLARO: ${beigeColor} (bege claro)`)
console.log(`   🌙 TEMA ESCURO: Gradiente original mantido`)
console.log(`\n📋 Páginas afetadas:`)
console.log(`   • Matérias (subjects)`)
console.log(`   • Metas`)
console.log(`   • Estudo (study)`)
console.log(`   • Caderno (notebook)`)
console.log(`   • Flashcards`)
console.log(`   • Relatórios (reports)`)
