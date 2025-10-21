import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function checkColumn() {
  console.log('🔍 Verificando estrutura da tabela saved_exercise_results...')
  
  // Tentar fazer um select incluindo subject_id
  const { data, error } = await supabase
    .from('saved_exercise_results')
    .select('id, user_id, subject_id, title')
    .limit(1)
  
  if (error) {
    console.error('❌ Erro:', error)
    if (error.message.includes('column') && error.message.includes('subject_id')) {
      console.log('\n⚠️  A coluna subject_id NÃO EXISTE na tabela!')
      console.log('📝 Você precisa adicionar a coluna no Supabase.')
    }
  } else {
    console.log('✅ A tabela tem a coluna subject_id!')
    console.log('📊 Dados:', data)
  }
}

checkColumn()
