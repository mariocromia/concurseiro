import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Configurações do Supabase
const SUPABASE_URL = 'https://ubeivchkuoptmhkcglny.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

console.log('=== Verificando Tabelas de Mapas Mentais ===\n')

// Verificar se as tabelas existem
console.log('1. Verificando se a tabela "mindmaps" existe...')
const { data: mindmapsData, error: mindmapsError } = await supabase
  .from('mindmaps')
  .select('id')
  .limit(1)

if (mindmapsError) {
  console.log('   ✗ Tabela "mindmaps" não existe ou erro:', mindmapsError.message)
  console.log('   → Código:', mindmapsError.code)
} else {
  console.log('   ✓ Tabela "mindmaps" existe')
}

console.log('\n2. Verificando se a tabela "mindmap_nodes" existe...')
const { data: nodesData, error: nodesError } = await supabase
  .from('mindmap_nodes')
  .select('id')
  .limit(1)

if (nodesError) {
  console.log('   ✗ Tabela "mindmap_nodes" não existe ou erro:', nodesError.message)
  console.log('   → Código:', nodesError.code)
} else {
  console.log('   ✓ Tabela "mindmap_nodes" existe')
}

if (mindmapsError || nodesError) {
  console.log('\n\n=== INSTRUÇÕES PARA CRIAR AS TABELAS ===\n')
  console.log('As tabelas não existem. Para criá-las:')
  console.log('\n1. Acesse: https://supabase.com/dashboard/project/ubeivchkuoptmhkcglny/editor')
  console.log('2. Clique em "SQL Editor" no menu lateral')
  console.log('3. Clique em "New query"')
  console.log('4. Cole o conteúdo do arquivo:')
  console.log('   C:\\xampp\\htdocs\\consurseiro\\concurseiro-app\\scripts\\create-mindmaps-tables.sql')
  console.log('5. Clique em "Run" ou pressione Ctrl+Enter')
  console.log('\nApós executar o SQL, execute este script novamente para verificar.\n')
} else {
  console.log('\n\n✓ Todas as tabelas existem e estão prontas para uso!\n')
}
