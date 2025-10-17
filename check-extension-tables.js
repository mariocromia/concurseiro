import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubeivchkuoptmhkcglny.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Verificando tabelas da extensão...\n')

  const tables = [
    'user_block_settings',
    'browsing_statistics',
    'captured_notes',
    'review_items',
    'error_log',
    'page_highlights',
    'extension_settings'
  ]

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`❌ ${table}: NÃO EXISTE`)
      console.log(`   Erro: ${error.message}\n`)
    } else {
      console.log(`✅ ${table}: EXISTE (${data?.length || 0} registros)\n`)
    }
  }
}

checkTables().catch(console.error)
