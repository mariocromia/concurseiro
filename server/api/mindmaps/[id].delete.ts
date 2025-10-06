import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// DELETE /api/mindmaps/:id - Deletar mapa mental
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do mapa mental é obrigatório'
    })
  }

  try {
    const { error } = await supabase
      .from('mindmaps')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return {
      success: true,
      message: 'Mapa mental deletado com sucesso'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao deletar mapa mental'
    })
  }
})
