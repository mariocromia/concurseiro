import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://qpzgsqjnbvsluwdvmftu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwemdzcWpuYnZzbHV3ZHZtZnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQ4Mzk2MywiZXhwIjoyMDQ2MDU5OTYzfQ.FJ4Y_vd8iXy_xqU3_EbuO9SN_jBVR85GZBsT7nDvNMs'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQLFile() {
  console.log('📄 Lendo arquivo SQL...\n')

  const sqlContent = readFileSync('create-extension-tables.sql', 'utf-8')

  console.log('🚀 Executando SQL no Supabase...\n')

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: sqlContent
  })

  if (error) {
    console.error('❌ Erro ao executar SQL:', error.message)
    console.log('\n⚠️ Tentando método alternativo...\n')

    // Método alternativo: executar statement por statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') ||
          statement.includes('CREATE INDEX') ||
          statement.includes('CREATE POLICY') ||
          statement.includes('ALTER TABLE') ||
          statement.includes('DROP POLICY') ||
          statement.includes('DROP TRIGGER') ||
          statement.includes('CREATE TRIGGER')) {

        console.log(`Executando: ${statement.substring(0, 60)}...`)

        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement
        })

        if (stmtError) {
          console.log(`  ❌ Erro: ${stmtError.message}`)
          errorCount++
        } else {
          console.log(`  ✅ Sucesso`)
          successCount++
        }
      }
    }

    console.log(`\n📊 Resultado: ${successCount} sucesso, ${errorCount} erros`)
  } else {
    console.log('✅ SQL executado com sucesso!')
    console.log('Resultado:', data)
  }

  console.log('\n🔍 Verificando tabelas criadas...\n')
  await verifyTables()
}

async function verifyTables() {
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
    const { error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`❌ ${table}: NÃO EXISTE`)
    } else {
      console.log(`✅ ${table}: CRIADA COM SUCESSO`)
    }
  }
}

executeSQLFile().catch(console.error)
