// Script para adicionar suporte a tema claro em todas as páginas
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Função recursiva para pegar todos os arquivos .vue
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

console.log(`🔍 Encontrados ${files.length} arquivos .vue\n`)

let totalFiles = 0

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8')
    const originalContent = content

    // Substituir apenas se tiver o padrão dark fixo
    if (content.includes('bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900') &&
        !content.includes('dark:bg-gradient-to-br')) {

      content = content.replace(
        /class="([^"]*)bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900([^"]*)"/g,
        'class="$1bg-gray-50 dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900$2"'
      )

      if (content !== originalContent) {
        writeFileSync(file, content, 'utf8')
        console.log(`✅ ${file.replace('app/pages/', '')}`)
        totalFiles++
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n🎉 ${totalFiles} arquivos atualizados com sucesso!`)
console.log(`\n📝 Próximos passos:`)
console.log(`   - Verifique o navegador e teste o tema claro`)
console.log(`   - Os cards e elementos internos ainda usam dark mode`)
console.log(`   - Para correção completa, será necessário ajustar cada componente individualmente`)
