import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// POST /api/admin/affiliates/withdraw-approve - Aprovar/rejeitar/marcar como pago saque (admin)
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  // Verificar se é admin
  if (user.email !== 'mariocromia@gmail.com') {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado'
    })
  }

  const { withdrawal_id, action, rejection_reason } = body

  if (!withdrawal_id || !action) {
    throw createError({
      statusCode: 400,
      message: 'ID do saque e ação são obrigatórios'
    })
  }

  if (!['approve', 'reject', 'mark_paid'].includes(action)) {
    throw createError({
      statusCode: 400,
      message: 'Ação inválida'
    })
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = user.id
    } else if (action === 'reject') {
      if (!rejection_reason) {
        throw createError({
          statusCode: 400,
          message: 'Motivo da rejeição é obrigatório'
        })
      }
      updateData.status = 'rejected'
      updateData.rejection_reason = rejection_reason
    } else if (action === 'mark_paid') {
      updateData.status = 'paid'
      updateData.paid_at = new Date().toISOString()
    }

    const { data: withdrawal, error } = await supabase
      .from('affiliate_withdrawals')
      .update(updateData)
      .eq('id', withdrawal_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // TODO: Enviar email para afiliado notificando sobre status do saque

    return {
      success: true,
      withdrawal,
      message: `Saque ${action === 'approve' ? 'aprovado' : action === 'reject' ? 'rejeitado' : 'marcado como pago'} com sucesso`
    }
  } catch (error: any) {
    console.error('Erro ao processar saque:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao processar saque'
    })
  }
})
