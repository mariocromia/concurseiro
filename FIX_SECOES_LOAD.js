// ============================================
// CORREÇÃO: Carregar Seções do Caderno
// ============================================
// Substitua a função loadNotebooks() no arquivo:
// prapassar-app/app/pages/mapa-mental.vue
// Linha aproximada: 340-372
// ============================================

// VERSÃO CORRIGIDA COM DEBUG:
const loadNotebooks = async () => {
  if (!selectedSubjectId.value) return

  sections.value = []
  selectedSectionId.value = ''

  try {
    console.log('🔍 Buscando cadernos para matéria:', selectedSubjectId.value)

    // Buscar cadernos da matéria
    const { data: notebooks, error: notebooksError } = await supabase
      .from('notebooks')
      .select('id, name')
      .eq('subject_id', selectedSubjectId.value)

    console.log('📚 Cadernos encontrados:', notebooks)

    if (notebooksError) {
      console.error('❌ Erro ao buscar cadernos:', notebooksError)
      alert('Erro ao buscar cadernos: ' + notebooksError.message)
      return
    }

    if (!notebooks || notebooks.length === 0) {
      console.warn('⚠️ Nenhum caderno encontrado para esta matéria')
      alert('Nenhum caderno encontrado para esta matéria.\n\nCrie um caderno primeiro em: /notebook')
      return
    }

    const notebookIds = notebooks.map(n => n.id)
    console.log('📦 IDs dos cadernos:', notebookIds)

    // Buscar seções dos cadernos
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('notebook_sections')
      .select('id, name, notebook_id, order_index')
      .in('notebook_id', notebookIds)
      .order('order_index')

    console.log('📑 Seções encontradas:', sectionsData)

    if (sectionsError) {
      console.error('❌ Erro ao buscar seções:', sectionsError)
      alert('Erro ao buscar seções: ' + sectionsError.message)
      return
    }

    if (!sectionsData || sectionsData.length === 0) {
      console.warn('⚠️ Nenhuma seção encontrada nos cadernos')
      alert('Nenhuma seção encontrada.\n\nCrie seções no seu caderno em: /notebook')
      return
    }

    sections.value = sectionsData
    console.log('✅ Seções carregadas com sucesso:', sections.value.length, 'seções')
  } catch (error) {
    console.error('❌ Erro geral ao carregar seções:', error)
    alert('Erro inesperado: ' + error.message)
  }
}
