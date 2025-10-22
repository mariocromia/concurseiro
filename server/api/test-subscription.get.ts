// Endpoint de teste para diagnosticar problema de subscription
// Acesse: http://localhost:3001/api/test-subscription

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    console.log('\n========================================')
    console.log('🔍 TESTE DE SUBSCRIPTION - INICIANDO')
    console.log('========================================\n')

    // 1. Verificar autenticação
    const user = await serverSupabaseUser(event)
    console.log('1️⃣ AUTENTICAÇÃO:')
    console.log('   - User ID:', user?.id)
    console.log('   - Email:', user?.email)
    console.log('   - User completo:', JSON.stringify(user, null, 2))

    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
        message: 'Faça login primeiro'
      }
    }

    // 2. Buscar dados do usuário na tabela users
    const supabase = await serverSupabaseClient(event)

    console.log('\n2️⃣ BUSCANDO DADOS NA TABELA users:')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('   - Query executada: SELECT * FROM users WHERE id =', user.id)
    console.log('   - Erro?', userError)
    console.log('   - Dados retornados:', JSON.stringify(userData, null, 2))

    if (userError) {
      console.log('   ❌ ERRO AO BUSCAR USUÁRIO:', userError)
      return {
        success: false,
        error: 'Erro ao buscar dados do usuário',
        details: userError,
        message: 'Verifique se a tabela users existe e tem RLS configurado'
      }
    }

    if (!userData) {
      console.log('   ❌ USUÁRIO NÃO ENCONTRADO NA TABELA users')
      return {
        success: false,
        error: 'Usuário não encontrado na tabela users',
        message: 'O registro do usuário não existe na tabela users. Você precisa criar um registro.',
        sql: `INSERT INTO users (id, email, subscription_type, trial_ends_at)
              VALUES ('${user.id}', '${user.email}', 'pro', NOW() + INTERVAL '14 days');`
      }
    }

    // 3. Verificar campos específicos
    console.log('\n3️⃣ VERIFICAÇÃO DE CAMPOS:')
    console.log('   - subscription_type existe?', 'subscription_type' in userData)
    console.log('   - subscription_type valor:', userData.subscription_type)
    console.log('   - subscription_type tipo:', typeof userData.subscription_type)
    console.log('   - trial_ends_at existe?', 'trial_ends_at' in userData)
    console.log('   - trial_ends_at valor:', userData.trial_ends_at)

    // 4. Testar a lógica de validação
    const subscriptionType = userData?.subscription_type?.toString().toLowerCase()
    const isPro = subscriptionType === 'pro'
    const isPlus = subscriptionType === 'plus'
    const isTrial = userData?.trial_ends_at && new Date(userData.trial_ends_at) > new Date()

    console.log('\n4️⃣ VALIDAÇÃO DE ACESSO:')
    console.log('   - subscriptionType (normalizado):', subscriptionType)
    console.log('   - isPro:', isPro)
    console.log('   - isPlus:', isPlus)
    console.log('   - isTrial:', isTrial)
    console.log('   - Acesso liberado?', isPro || isPlus || isTrial)

    // 5. Verificar estrutura da tabela users
    console.log('\n5️⃣ VERIFICANDO ESTRUTURA DA TABELA:')
    const { data: columns } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (columns && columns.length > 0) {
      console.log('   - Colunas disponíveis:', Object.keys(columns[0]))
    }

    // 6. Resultado final
    const hasAccess = isPro || isPlus || isTrial
    console.log('\n========================================')
    console.log(hasAccess ? '✅ USUÁRIO TEM ACESSO' : '❌ USUÁRIO NÃO TEM ACESSO')
    console.log('========================================\n')

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      userData: userData,
      validation: {
        subscriptionType,
        isPro,
        isPlus,
        isTrial,
        hasAccess
      },
      availableColumns: columns && columns.length > 0 ? Object.keys(columns[0]) : [],
      recommendation: !hasAccess ?
        'Execute o SQL em FIX_ADD_SUBSCRIPTION_FIELD.sql para corrigir' :
        'Tudo OK! O usuário tem acesso.'
    }

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error)
    return {
      success: false,
      error: 'Erro ao executar teste',
      details: error.message,
      stack: error.stack
    }
  }
})
