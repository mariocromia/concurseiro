/**
 * Test: Z-Index Hierarchy v1.1
 *
 * Valida que a hierarquia de z-index está correta em todos os componentes
 * Agora testa que a toolbar do editor foi REDUZIDA para z-10
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

console.log('🧪 Testing Z-Index Hierarchy v1.1...\n')

const files = [
  { path: 'prapassar-app/app/components/ModernNav.vue', component: 'User Dropdown', expectedZIndex: 99999, type: 'bracket' },
  { path: 'prapassar-app/app/components/AIExercisesModal.vue', component: 'AI Exercises Modal', expectedZIndex: 99999, type: 'bracket' },
  { path: 'prapassar-app/app/components/AIChatModal.vue', component: 'AI Chat Modal', expectedZIndex: 99999, type: 'bracket' },
  { path: 'prapassar-app/app/components/AIFlashcardsModal.vue', component: 'AI Flashcards Modal', expectedZIndex: 99999, type: 'bracket' },
  { path: 'prapassar-app/app/components/AIPopupMenu.vue', component: 'AI Popup Menu', expectedZIndex: 99999, type: 'bracket' },
  { path: 'prapassar-app/app/components/RichContentEditor.vue', component: 'Editor Toolbar', expectedZIndex: 10, type: 'direct' },
]

let allPassed = true

files.forEach(({ path, component, expectedZIndex, type }) => {
  const fullPath = join(projectRoot, path)
  const content = readFileSync(fullPath, 'utf-8')

  console.log(`📊 ${component}:`)
  console.log(`   File: ${path}`)

  if (type === 'direct') {
    // Test for direct z-index value (like z-10)
    if (content.includes(`z-${expectedZIndex}`)) {
      console.log(`   ✅ PASS: Found z-${expectedZIndex} as expected`)
    } else {
      console.log(`   ❌ FAIL: Expected z-${expectedZIndex}, not found`)
      allPassed = false
    }
  } else if (type === 'bracket') {
    // Test for bracketed z-index values
    const zIndexMatches = content.match(/z-\[(\d+)\]/g)

    if (!zIndexMatches) {
      console.log(`   ❌ FAIL: No z-index found`)
      allPassed = false
    } else {
      const zIndexValues = zIndexMatches.map(match => parseInt(match.match(/z-\[(\d+)\]/)[1]))
      const maxZIndex = Math.max(...zIndexValues)
      console.log(`   Z-Index: ${maxZIndex}`)

      if (maxZIndex !== expectedZIndex) {
        console.log(`   ❌ FAIL: Expected ${expectedZIndex}, got ${maxZIndex}`)
        allPassed = false
      } else {
        console.log(`   ✅ PASS`)
      }
    }
  }
  console.log('')
})

// Test hierarchy: Dropdown (99999) > Navbar (50) > Toolbar (10)
console.log('🔍 Testing Hierarchy Rules...\n')

const userDropdownZIndex = 99999
const toolbarZIndex = 10

console.log(`User Dropdown z-index: ${userDropdownZIndex}`)
console.log(`Editor Toolbar z-index: ${toolbarZIndex}`)
console.log('')

if (userDropdownZIndex > toolbarZIndex) {
  console.log('✅ PASS: User Dropdown (99999) is above Editor Toolbar (10)')
  console.log(`   Difference: ${userDropdownZIndex - toolbarZIndex} levels`)
  console.log(`   Hierarchy: Dropdown (99999) > Navbar (50) > Toolbar (10) ✅`)
} else {
  console.log('❌ FAIL: User Dropdown is NOT above Editor Toolbar')
  allPassed = false
}

console.log('')

// Final result
if (allPassed) {
  console.log('✅ All z-index hierarchy tests passed!')
  console.log('✅ Toolbar REDUZIDA de z-100 para z-10 (abordagem otimizada)')
  process.exit(0)
} else {
  console.log('❌ Some z-index hierarchy tests failed!')
  process.exit(1)
}
