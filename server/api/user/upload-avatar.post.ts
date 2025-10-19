import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * POST /api/user/upload-avatar
 * Uploads user avatar image to Supabase Storage
 *
 * Accepts: multipart/form-data with 'avatar' field
 * Returns: { success: true, avatar_url: string }
 *
 * Validations:
 * - File size: max 2MB
 * - File types: JPG, PNG, GIF, WEBP
 * - User must be authenticated
 *
 * @author Claude Code
 * @date 2025-10-19
 */
export default defineEventHandler(async (event) => {
  console.log('\n=== [UPLOAD AVATAR] INÍCIO DA REQUISIÇÃO ===')

  // 1. Authentication
  console.log('[UPLOAD AVATAR] Verificando autenticação...')
  const user = await serverSupabaseUser(event)

  // O Supabase pode retornar user.id ou user.sub (padrão JWT)
  const userId = user?.id || user?.sub

  console.log('[UPLOAD AVATAR] Resultado da autenticação:', {
    authenticated: !!user,
    userId: user?.id || 'UNDEFINED',
    userSub: user?.sub || 'UNDEFINED',
    finalUserId: userId || 'UNDEFINED',
    userEmail: user?.email || 'UNDEFINED'
  })

  if (!user || !userId) {
    console.error('[UPLOAD AVATAR] ❌ ERRO: Usuário não autenticado ou ID ausente')
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  try {
    // 2. Get uploaded file from FormData
    console.log('[UPLOAD AVATAR] Lendo FormData...')
    const formData = await readFormData(event)
    const file = formData.get('avatar')

    console.log('[UPLOAD AVATAR] ✅ Usuário autenticado:', {
      id: userId,
      email: user.email
    })

    // 3. Validate file exists
    if (!file || !(file instanceof File)) {
      console.error('[UPLOAD AVATAR] ❌ ERRO: Nenhum arquivo no FormData')
      throw createError({
        statusCode: 400,
        message: 'Nenhum arquivo enviado. Por favor, selecione uma imagem.'
      })
    }

    console.log('[UPLOAD AVATAR] ✅ Arquivo recebido:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    })

    // 4. Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      throw createError({
        statusCode: 400,
        message: `Imagem muito grande (${sizeMB}MB). O tamanho máximo é 2MB.`
      })
    }

    // 5. Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        message: 'Formato inválido. Use JPG, PNG, GIF ou WEBP.'
      })
    }

    const supabase = await serverSupabaseClient(event)

    // 6. Create unique filename WITH USER FOLDER
    // IMPORTANTE: O caminho deve ser user_id/filename para as políticas RLS funcionarem
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const fileName = `${userId}/avatar-${timestamp}.${fileExt}` // ⭐ Pasta do usuário

    console.log('[UPLOAD AVATAR] ✅ Nome do arquivo gerado:', {
      fileName: fileName,
      userFolder: userId,
      extension: fileExt,
      timestamp: timestamp
    })

    // 7. Convert File to ArrayBuffer (compatible with Supabase)
    console.log('[UPLOAD AVATAR] Convertendo arquivo para buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('[UPLOAD AVATAR] ✅ Buffer criado:', buffer.length, 'bytes')

    // 8. Upload to Supabase Storage
    console.log('[UPLOAD AVATAR] 🚀 Iniciando upload para Supabase Storage...')
    console.log('[UPLOAD AVATAR] Detalhes do upload:', {
      bucket: 'avatars',
      path: fileName,
      contentType: file.type,
      size: buffer.length,
      upsert: true
    })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('[UPLOAD AVATAR] ❌ ERRO NO UPLOAD:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
        details: uploadError
      })
      throw createError({
        statusCode: 500,
        message: 'Erro ao fazer upload: ' + uploadError.message
      })
    }

    console.log('[UPLOAD AVATAR] ✅✅✅ UPLOAD BEM-SUCEDIDO!')
    console.log('[UPLOAD AVATAR] Dados do upload:', {
      path: uploadData.path,
      id: uploadData.id,
      fullPath: uploadData.fullPath
    })

    // 9. Get public URL
    console.log('[UPLOAD AVATAR] Gerando URL pública...')
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const avatarUrl = urlData.publicUrl
    console.log('[UPLOAD AVATAR] ✅ URL pública gerada:', avatarUrl)

    // 10. Update users table with new avatar URL
    console.log('[UPLOAD AVATAR] Atualizando tabela users...')
    console.log('[UPLOAD AVATAR] Update payload:', {
      user_id: userId,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    })

    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (updateError) {
      console.error('[UPLOAD AVATAR] ❌ ERRO ao atualizar banco:', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      })
      // Don't throw - image was uploaded successfully
      // User can manually save from profile page
    } else {
      console.log('[UPLOAD AVATAR] ✅ Banco de dados atualizado!')
      console.log('[UPLOAD AVATAR] Dados atualizados:', updateData)
    }

    // 11. Also update auth metadata
    console.log('[UPLOAD AVATAR] Atualizando metadados de autenticação...')
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    })

    if (authUpdateError) {
      console.error('[UPLOAD AVATAR] ⚠️ Erro ao atualizar auth metadata:', authUpdateError)
    } else {
      console.log('[UPLOAD AVATAR] ✅ Auth metadata atualizado')
    }

    // 12. Return success
    console.log('[UPLOAD AVATAR] 🎉 PROCESSO COMPLETO!')
    console.log('=== [UPLOAD AVATAR] FIM DA REQUISIÇÃO ===\n')

    return {
      success: true,
      message: 'Avatar atualizado com sucesso!',
      avatar_url: avatarUrl,
      file_name: fileName,
      file_size: file.size,
      file_type: file.type
    }
  } catch (error: any) {
    console.error('[UPLOAD AVATAR] ❌ Error:', error)

    // If it's already a createError, re-throw
    if (error.statusCode) {
      throw error
    }

    // Otherwise, create a new error
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao fazer upload do avatar'
    })
  }
})
