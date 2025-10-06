import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://ubeivchkuoptmhkcglny.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQxNTg0OSwiZXhwIjoyMDc0OTkxODQ5fQ.mVBGR8C0u6EgJ3HnkKZJYDKSRcVJxVJkMnNOnm_JMPo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQLFile(filename) {
  console.log(`\nExecutando ${filename}...`)

  const sql = fs.readFileSync(`./scripts/${filename}`, 'utf-8')

  // Executar SQL via RPC
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: sql
  })

  if (error) {
    console.error(`❌ Erro ao executar ${filename}:`, error.message)
    return false
  }

  console.log(`✅ ${filename} executado com sucesso!`)
  return true
}

async function createTables() {
  console.log('🚀 Configurando tabelas de afiliados...\n')

  // Primeiro executar o schema principal
  await executeSQLFile('affiliate-schema.sql')

  // Depois executar o fix de RLS
  await executeSQLFile('fix-affiliate-rls.sql')

  console.log('\n✨ Configuração concluída!')
}

createTables()
