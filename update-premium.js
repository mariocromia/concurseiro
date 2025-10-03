import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpzgsqjnbvsluwdvmftu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwemdzcWpuYnZzbHV3ZHZtZnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzkyNzQzNiwiZXhwIjoyMDUzNTAzNDM2fQ.cCvrcnTQcTNB2eWLKRlHl2MH3JPzQZq_6Xb8dCX9KFs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateUserToPremium() {
  const email = 'netsacolas@gmail.com'

  console.log(`🔄 Atualizando usuário ${email} para premium...`)

  // 1. Buscar o ID do usuário
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

  if (userError) {
    console.error('❌ Erro ao buscar usuários:', userError)
    return
  }

  const user = userData.users.find(u => u.email === email)

  if (!user) {
    console.error('❌ Usuário não encontrado:', email)
    return
  }

  console.log('✅ Usuário encontrado:', user.id)

  // 2. Verificar se já existe na tabela users
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('❌ Erro ao verificar usuário:', checkError)
    return
  }

  // 3. Inserir ou atualizar
  if (existingUser) {
    // Atualizar
    const { error: updateError } = await supabase
      .from('users')
      .update({ subscription_type: 'pro' })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError)
      return
    }

    console.log('✅ Usuário atualizado para PRO')
  } else {
    // Inserir
    const { error: insertError } = await supabase
      .from('users')
      .insert({ id: user.id, subscription_type: 'pro' })

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError)
      return
    }

    console.log('✅ Usuário criado como PRO')
  }

  // 4. Verificar resultado
  const { data: finalUser, error: finalError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (finalError) {
    console.error('❌ Erro ao verificar resultado:', finalError)
    return
  }

  console.log('✅ Resultado final:', finalUser)
  console.log('🎉 Usuário', email, 'agora é', finalUser.subscription_type)
}

updateUserToPremium()
