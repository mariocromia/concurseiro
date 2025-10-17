// Script para substituir todos os tons de azul por #ca643f no tema claro
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function getAllFiles(dir, fileList = [], extensions = ['.vue', '.css', '.ts', '.js']) {
  const files = readdirSync(dir)

  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      getAllFiles(filePath, fileList, extensions)
    } else if (extensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath)
    }
  })

  return fileList
}

const files = getAllFiles('app')

console.log(`🔍 Procurando tons de azul em ${files.length} arquivos\n`)

const orangeColor = '#ca643f'
const orangeHover = '#b85635'
const orangeLight = '#f0e8e1'

const replacements = [
  // Classes Tailwind - bg-blue
  {
    from: /class="([^"]*)bg-blue-600([^"]*)"/g,
    to: `class="$1bg-[${orangeColor}] dark:bg-blue-600$2"`,
    desc: 'bg-blue-600'
  },
  {
    from: /hover:bg-blue-700/g,
    to: `hover:bg-[${orangeHover}] dark:hover:bg-blue-700`,
    desc: 'hover:bg-blue-700'
  },
  {
    from: /bg-blue-500\/20/g,
    to: `bg-[${orangeColor}]/20 dark:bg-blue-500/20`,
    desc: 'bg-blue-500/20'
  },
  {
    from: /bg-blue-500\/10/g,
    to: `bg-[${orangeColor}]/10 dark:bg-blue-500/10`,
    desc: 'bg-blue-500/10'
  },
  {
    from: /bg-blue-100/g,
    to: `bg-[${orangeLight}] dark:bg-blue-100`,
    desc: 'bg-blue-100'
  },

  // Classes Tailwind - text-blue
  {
    from: /text-blue-600/g,
    to: `text-[${orangeColor}] dark:text-blue-600`,
    desc: 'text-blue-600'
  },
  {
    from: /text-blue-800/g,
    to: `text-[${orangeColor}] dark:text-blue-800`,
    desc: 'text-blue-800'
  },
  {
    from: /text-blue-400/g,
    to: `text-[${orangeColor}] dark:text-blue-400`,
    desc: 'text-blue-400'
  },
  {
    from: /text-blue-300/g,
    to: `text-[${orangeHover}] dark:text-blue-300`,
    desc: 'text-blue-300'
  },
  {
    from: /hover:text-blue-400/g,
    to: `hover:text-[${orangeColor}] dark:hover:text-blue-400`,
    desc: 'hover:text-blue-400'
  },

  // Classes Tailwind - border-blue
  {
    from: /border-blue-500\/30/g,
    to: `border-[${orangeColor}]/30 dark:border-blue-500/30`,
    desc: 'border-blue-500/30'
  },

  // Hex colors - #3B82F6 e #3b82f6
  {
    from: /'#3b82f6'/g,
    to: `'${orangeColor}'`,
    desc: "Hex '#3b82f6' em strings"
  },
  {
    from: /'#3B82F6'/g,
    to: `'${orangeColor}'`,
    desc: "Hex '#3B82F6' em strings"
  },
  {
    from: /"#3b82f6"/g,
    to: `"${orangeColor}"`,
    desc: 'Hex "#3b82f6" em strings'
  },
  {
    from: /"#3B82F6"/g,
    to: `"${orangeColor}"`,
    desc: 'Hex "#3B82F6" em strings'
  },

  // CSS direto
  {
    from: /background:\s*#3b82f6/g,
    to: `background: ${orangeColor}`,
    desc: 'CSS background #3b82f6'
  },
  {
    from: /color:\s*#3b82f6/g,
    to: `color: ${orangeColor}`,
    desc: 'CSS color #3b82f6'
  },
  {
    from: /border:\s*2px\s+solid\s+#3b82f6/g,
    to: `border: 2px solid ${orangeColor}`,
    desc: 'CSS border solid #3b82f6'
  },
  {
    from: /border:\s*2px\s+dashed\s+#3b82f6/g,
    to: `border: 2px dashed ${orangeColor}`,
    desc: 'CSS border dashed #3b82f6'
  },
  {
    from: /stroke'?,\s*'#3b82f6'/g,
    to: `stroke', '${orangeColor}'`,
    desc: "SVG stroke '#3b82f6'"
  },
  {
    from: /fill'?,\s*'#3b82f6'/g,
    to: `fill', '${orangeColor}'`,
    desc: "SVG fill '#3b82f6'"
  },
]

let totalChanges = 0
let filesChanged = 0
const changedFiles = []

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
      console.log(`✅ ${shortPath} - ${fileChanges} substituições`)
      filesChanged++
      totalChanges += fileChanges
      changedFiles.push(shortPath)
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message)
  }
}

console.log(`\n${'='.repeat(70)}`)
console.log(`🎉 SUBSTITUIÇÃO DE AZUL POR LARANJA CONCLUÍDA`)
console.log(`${'='.repeat(70)}`)
console.log(`📄 Arquivos modificados: ${filesChanged}`)
console.log(`🔄 Total de substituições: ${totalChanges}`)
console.log(`\n✨ Cores aplicadas no tema claro:`)
console.log(`   • Azul (#3b82f6) → Laranja (${orangeColor})`)
console.log(`   • Azul escuro → Laranja escuro (${orangeHover})`)
console.log(`   • Azul claro → Laranja claro (${orangeLight})`)
console.log(`\n📋 Arquivos modificados:`)
changedFiles.forEach(f => console.log(`   • ${f}`))
console.log(`\n🌙 Tema escuro mantém cores azuis originais`)
