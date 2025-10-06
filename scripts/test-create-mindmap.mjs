import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const SUPABASE_URL = 'https://ubeivchkuoptmhkcglny.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('=== Testando Criação de Mapa Mental ===\n')

// Primeiro, verificar se há um usuário
console.log('1. Verificando autenticação...')
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  console.log('   ✗ Usuário não autenticado')
  console.log('   → Isso explica o erro "Failed to fetch"')
  console.log('   → A API precisa de autenticação para criar mapas\n')
  console.log('=== SOLUÇÃO ===')
  console.log('O erro ocorre porque você precisa estar logado na aplicação.')
  console.log('1. Faça login na aplicação web')
  console.log('2. Tente criar o mapa mental novamente\n')
  process.exit(1)
}

console.log('   ✓ Usuário autenticado:', user.email)

// Testar criação de mapa mental
console.log('\n2. Tentando criar mapa mental de teste...')
const testMindmap = {
  title: 'Mapa de Teste',
  description: 'Criado via script de teste',
  user_id: user.id
}

const { data: mindmap, error: createError } = await supabase
  .from('mindmaps')
  .insert(testMindmap)
  .select()
  .single()

if (createError) {
  console.log('   ✗ Erro ao criar:', createError.message)
  console.log('   → Código:', createError.code)
  console.log('   → Detalhes:', createError.details)
} else {
  console.log('   ✓ Mapa criado com sucesso!')
  console.log('   → ID:', mindmap.id)
  console.log('   → Título:', mindmap.title)

  // Limpar teste
  console.log('\n3. Limpando mapa de teste...')
  await supabase.from('mindmaps').delete().eq('id', mindmap.id)
  console.log('   ✓ Mapa de teste removido')
}

console.log('\n✓ Teste concluído\n')
