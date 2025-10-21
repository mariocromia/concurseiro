import { serverSupabaseClient } from '#supabase/server'

// PUT /api/mindmaps/:id - Atualizar mapa mental
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  // Usar getUser() ao invés de serverSupabaseUser() para garantir que o user.id existe
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { title, description } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do mapa mental é obrigatório'
    })
  }

  try {
    const { data: mindmap, error } = await supabase
      .from('mindmaps')
      .update({
        title: title || undefined,
        description: description !== undefined ? description : undefined
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: mindmap
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao atualizar mapa mental'
    })
  }
})
