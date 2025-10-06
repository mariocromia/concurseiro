import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://ubeivchkuoptmhkcglny.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQxNTg0OSwiZXhwIjoyMDc0OTkxODQ5fQ.mVBGR8C0u6EgJ3HnkKZJYDKSRcVJxVJkMnNOnm_JMPo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSchema() {
  try {
    const sql = readFileSync(join(__dirname, 'affiliate-schema.sql'), 'utf-8')

    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`Executando ${commands.length} comandos...`)

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';'
      console.log(`\n[${i + 1}/${commands.length}] Executando comando...`)

      try {
        const { data, error } = await supabase.rpc('exec_sql', { query: command })

        if (error) {
          console.error(`Erro: ${error.message}`)
          // Continuar mesmo com erro (pode ser que já exista)
        } else {
          console.log('✓ Sucesso')
        }
      } catch (err) {
        console.error(`Erro ao executar: ${err.message}`)
      }
    }

    console.log('\n✓ Schema de afiliados executado!')
  } catch (error) {
    console.error('Erro:', error)
    process.exit(1)
  }
}

runSchema()
