import { serverSupabaseClient } from '#supabase/server'
import fs from 'fs'
import path from 'path'

// POST /api/admin/setup-affiliates - Executar schema de afiliados (apenas admin)
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  try {
    // Ler os arquivos SQL
    const schemaPath = path.join(process.cwd(), 'scripts', 'affiliate-schema.sql')
    const fixRlsPath = path.join(process.cwd(), 'scripts', 'fix-affiliate-rls.sql')

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8')
    const fixRlsSql = fs.readFileSync(fixRlsPath, 'utf-8')

    // Executar schema principal
    console.log('Executando affiliate-schema.sql...')
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql_query: schemaSql
    })

    if (schemaError) {
      console.error('Erro no schema:', schemaError)
    }

    // Executar fix de RLS
    console.log('Executando fix-affiliate-rls.sql...')
    const { error: fixError } = await supabase.rpc('exec_sql', {
      sql_query: fixRlsSql
    })

    if (fixError) {
      console.error('Erro no fix RLS:', fixError)
    }

    return {
      success: true,
      message: 'Tabelas de afiliados configuradas com sucesso!',
      errors: {
        schema: schemaError?.message,
        fixRls: fixError?.message
      }
    }
  } catch (error: any) {
    console.error('Erro ao executar setup:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
