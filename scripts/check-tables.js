// Script para verificar se as tabelas de mapas mentais existem no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubeivchkuoptmhkcglny.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Verificando tabelas de mapas mentais...\n')

  // Tentar buscar na tabela mindmaps
  const { data: mindmaps, error: mindmapsError } = await supabase
    .from('mindmaps')
    .select('*')
    .limit(1)

  if (mindmapsError) {
    console.log('❌ Tabela "mindmaps" NÃO existe ou não tem permissão')
    console.log('   Erro:', mindmapsError.message)
  } else {
    console.log('✅ Tabela "mindmaps" existe')
  }

  // Tentar buscar na tabela mindmap_nodes
  const { data: nodes, error: nodesError } = await supabase
    .from('mindmap_nodes')
    .select('*')
    .limit(1)

  if (nodesError) {
    console.log('❌ Tabela "mindmap_nodes" NÃO existe ou não tem permissão')
    console.log('   Erro:', nodesError.message)
  } else {
    console.log('✅ Tabela "mindmap_nodes" existe')
  }

  console.log('\n📋 RESULTADO:')
  if (mindmapsError || nodesError) {
    console.log('⚠️  Você precisa executar a migração SQL!')
    console.log('\nPasso a passo:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/ubeivchkuoptmhkcglny/sql/new')
    console.log('2. Copie o conteúdo de: scripts/mindmaps-schema.sql')
    console.log('3. Cole no editor SQL e clique em "Run"')
  } else {
    console.log('✅ Todas as tabelas existem! Sistema pronto para uso.')
  }
}

checkTables()
