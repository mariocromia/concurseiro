// Script para verificar dados no Supabase
// Execute este arquivo com: node query_records.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('🔍 Verificando dados no banco...\n')

  // 1. Verificar matérias (subjects)
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name, user_id')
    .limit(10)

  console.log('📚 MATÉRIAS (subjects):')
  if (subjectsError) {
    console.error('❌ Erro:', subjectsError.message)
  } else {
    console.log(`✅ Total encontrado: ${subjects?.length || 0}`)
    subjects?.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (ID: ${s.id})`)
    })
  }

  if (subjects && subjects.length > 0) {
    const subjectId = subjects[0].id
    console.log(`\n🔍 Verificando cadernos da matéria: ${subjects[0].name}`)

    // 2. Verificar cadernos (notebooks) da primeira matéria
    const { data: notebooks, error: notebooksError } = await supabase
      .from('notebooks')
      .select('id, name, subject_id')
      .eq('subject_id', subjectId)

    console.log('\n📔 CADERNOS (notebooks):')
    if (notebooksError) {
      console.error('❌ Erro:', notebooksError.message)
    } else {
      console.log(`✅ Total encontrado: ${notebooks?.length || 0}`)
      notebooks?.forEach((n, i) => {
        console.log(`  ${i + 1}. ${n.name} (ID: ${n.id})`)
      })

      if (notebooks && notebooks.length > 0) {
        const notebookId = notebooks[0].id
        console.log(`\n🔍 Verificando capítulos do caderno: ${notebooks[0].name}`)

        // 3. Verificar seções/capítulos (notebook_sections) do primeiro caderno
        const { data: sections, error: sectionsError } = await supabase
          .from('notebook_sections')
          .select('id, name, notebook_id, order_index')
          .eq('notebook_id', notebookId)
          .order('order_index')

        console.log('\n📑 CAPÍTULOS (notebook_sections):')
        if (sectionsError) {
          console.error('❌ Erro:', sectionsError.message)
        } else {
          console.log(`✅ Total encontrado: ${sections?.length || 0}`)
          sections?.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.name} (ID: ${s.id})`)
          })

          if (sections && sections.length > 0) {
            const sectionId = sections[0].id
            console.log(`\n🔍 Verificando páginas do capítulo: ${sections[0].name}`)

            // 4. Verificar páginas (notebook_pages) da primeira seção
            const { data: pages, error: pagesError } = await supabase
              .from('notebook_pages')
              .select('id, title, section_id, content')
              .eq('section_id', sectionId)

            console.log('\n📄 PÁGINAS (notebook_pages):')
            if (pagesError) {
              console.error('❌ Erro:', pagesError.message)
            } else {
              console.log(`✅ Total encontrado: ${pages?.length || 0}`)
              pages?.forEach((p, i) => {
                const contentPreview = p.content?.substring(0, 50) || 'Sem conteúdo'
                console.log(`  ${i + 1}. ${p.title} - "${contentPreview}..."`)
              })
            }
          }
        }
      } else {
        console.log('\n⚠️ PROBLEMA IDENTIFICADO: Não há cadernos cadastrados para esta matéria!')
        console.log('💡 Solução: Acesse /notebook e crie um caderno para a matéria antes de gerar exercícios.')
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Verificação concluída!')
  console.log('='.repeat(60))
}

checkData().catch(console.error)
