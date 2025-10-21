// ============================================
// CORREÇÃO COMPLETA - Carregar Seções/Capítulos
// ============================================
// SUBSTITUA a função loadNotebooks() no arquivo:
// prapassar-app/app/pages/mapa-mental.vue
// Linha aproximada: 341-372
// ============================================

// Carregar cadernos/seções (VERSÃO CORRIGIDA COM DEBUG COMPLETO)
const loadNotebooks = async () => {
  if (!selectedSubjectId.value) {
    console.warn('⚠️ selectedSubjectId está vazio!')
    return
  }

  // Resetar seções
  sections.value = []
  selectedSectionId.value = ''

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 INICIANDO BUSCA DE SEÇÕES/CAPÍTULOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 Matéria selecionada (subject_id):', selectedSubjectId.value)

  try {
    // ============================================
    // PASSO 1: Buscar CADERNOS (notebooks) da matéria
    // ============================================
    console.log('\n📚 PASSO 1: Buscando cadernos...')

    const { data: notebooks, error: notebooksError } = await supabase
      .from('notebooks')
      .select('id, name, subject_id, user_id')
      .eq('subject_id', selectedSubjectId.value)

    if (notebooksError) {
      console.error('❌ ERRO ao buscar cadernos:', notebooksError)
      console.error('   Código:', notebooksError.code)
      console.error('   Mensagem:', notebooksError.message)
      console.error('   Detalhes:', notebooksError.details)
      alert('Erro ao buscar cadernos:\n' + notebooksError.message + '\n\nVerifique as permissões RLS no Supabase.')
      return
    }

    console.log('✅ Query de cadernos executada com sucesso')
    console.log('📦 Cadernos encontrados:', notebooks?.length || 0)
    console.table(notebooks)

    if (!notebooks || notebooks.length === 0) {
      console.warn('⚠️ NENHUM CADERNO ENCONTRADO para esta matéria')
      console.log('💡 SOLUÇÃO: Vá em /notebook e crie um caderno vinculado à matéria "História"')
      alert(
        '⚠️ Nenhum caderno encontrado para esta matéria.\n\n' +
        '📝 Como resolver:\n' +
        '1. Acesse /notebook\n' +
        '2. Crie um novo caderno\n' +
        '3. Vincule-o à matéria "História"\n' +
        '4. Volte aqui e tente novamente'
      )
      return
    }

    const notebookIds = notebooks.map(n => n.id)
    console.log('\n📌 IDs dos cadernos encontrados:', notebookIds)

    // ============================================
    // PASSO 2: Buscar SEÇÕES/CAPÍTULOS (notebook_sections)
    // ============================================
    console.log('\n📑 PASSO 2: Buscando seções/capítulos...')

    const { data: sectionsData, error: sectionsError } = await supabase
      .from('notebook_sections')
      .select('id, name, notebook_id, order_index')
      .in('notebook_id', notebookIds)
      .order('order_index')

    if (sectionsError) {
      console.error('❌ ERRO ao buscar seções:', sectionsError)
      console.error('   Código:', sectionsError.code)
      console.error('   Mensagem:', sectionsError.message)
      console.error('   Detalhes:', sectionsError.details)
      alert('Erro ao buscar seções:\n' + sectionsError.message + '\n\nVerifique as permissões RLS no Supabase.')
      return
    }

    console.log('✅ Query de seções executada com sucesso')
    console.log('📄 Seções/Capítulos encontrados:', sectionsData?.length || 0)
    console.table(sectionsData)

    if (!sectionsData || sectionsData.length === 0) {
      console.warn('⚠️ NENHUMA SEÇÃO/CAPÍTULO ENCONTRADO nos cadernos')
      console.log('💡 SOLUÇÃO: Vá em /notebook e crie seções/capítulos dentro do seu caderno')
      alert(
        '⚠️ Nenhuma seção/capítulo encontrado.\n\n' +
        '📝 Como resolver:\n' +
        '1. Acesse /notebook\n' +
        '2. Abra o caderno de "História"\n' +
        '3. Crie seções/capítulos (ex: "Idade Média", "Renascimento", etc.)\n' +
        '4. Adicione conteúdo nas seções\n' +
        '5. Volte aqui e tente novamente'
      )
      return
    }

    // ============================================
    // PASSO 3: Verificar se há CONTEÚDO nas seções
    // ============================================
    console.log('\n📝 PASSO 3: Verificando conteúdo nas seções...')

    const sectionIds = sectionsData.map(s => s.id)

    const { data: pages, error: pagesError } = await supabase
      .from('notebook_pages')
      .select('id, section_id, title, content')
      .in('section_id', sectionIds)

    if (!pagesError && pages) {
      console.log('📄 Páginas encontradas:', pages.length)
      console.table(pages.map(p => ({
        section_id: p.section_id,
        title: p.title,
        content_length: p.content?.length || 0
      })))

      if (pages.length === 0) {
        console.warn('⚠️ AVISO: As seções não têm conteúdo (páginas)')
        console.log('💡 A IA precisa de conteúdo para gerar o mapa mental')
      }
    }

    // ============================================
    // PASSO 4: SUCESSO! Atualizar estado
    // ============================================
    sections.value = sectionsData
    console.log('\n✅✅✅ SUCESSO! ✅✅✅')
    console.log('📌 Seções carregadas no estado:', sections.value.length)
    console.log('📋 Seções disponíveis para seleção:')
    sections.value.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (ID: ${s.id})`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌❌❌ ERRO INESPERADO ❌❌❌')
    console.error('Tipo:', error.constructor.name)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
    alert('Erro inesperado ao carregar seções:\n\n' + error.message + '\n\nAbra o console (F12) para mais detalhes.')
  }
}
