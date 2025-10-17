// Script para testar conexão com Supabase e verificar tabelas
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log('SUPABASE_URL:', supabaseUrl)
console.log('SUPABASE_KEY:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_KEY não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('\n🔍 Testando conexão com Supabase...\n')

  try {
    // Tentar listar tabelas (isso vai falhar se não existirem)
    console.log('1️⃣ Verificando tabela mindmaps...')
    const { data: mindmaps, error: mindmapsError } = await supabase
      .from('mindmaps')
      .select('count')
      .limit(0)

    if (mindmapsError) {
      console.error('❌ Erro ao acessar tabela mindmaps:', mindmapsError.message)
      console.error('   Código:', mindmapsError.code)
      console.error('   Detalhes:', mindmapsError.details)
    } else {
      console.log('✅ Tabela mindmaps existe e está acessível')
    }

    console.log('\n2️⃣ Verificando tabela mindmap_nodes...')
    const { data: nodes, error: nodesError } = await supabase
      .from('mindmap_nodes')
      .select('count')
      .limit(0)

    if (nodesError) {
      console.error('❌ Erro ao acessar tabela mindmap_nodes:', nodesError.message)
      console.error('   Código:', nodesError.code)
      console.error('   Detalhes:', nodesError.details)
    } else {
      console.log('✅ Tabela mindmap_nodes existe e está acessível')
    }

    // Resumo
    console.log('\n' + '='.repeat(50))
    if (mindmapsError || nodesError) {
      console.log('❌ ERRO: Tabelas não existem no banco de dados!')
      console.log('\n📝 SOLUÇÃO:')
      console.log('1. Acesse: https://supabase.com/dashboard')
      console.log('2. Vá para SQL Editor')
      console.log('3. Execute o arquivo: scripts/create-mindmaps-tables.sql')
      console.log('='.repeat(50))
    } else {
      console.log('✅ Todas as tabelas estão OK!')
      console.log('='.repeat(50))
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testConnection()
