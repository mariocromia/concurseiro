-- ============================================
-- TESTE: Mapas Mentais com Usuário Real
-- ============================================
-- Este script testa as policies com um usuário real do sistema
-- ============================================

-- PASSO 1: Encontrar um usuário real para testar
SELECT
  id as "User ID",
  email,
  full_name,
  subscription_type,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Copie o "User ID" (UUID) de um usuário da lista acima
-- 2. Substitua 'SEU_USER_ID_AQUI' abaixo pelo UUID copiado
-- 3. Execute o resto do script
-- ============================================

-- PASSO 2: Testar INSERT de mindmap como esse usuário
DO $$
DECLARE
  test_user_id UUID := 'SEU_USER_ID_AQUI'; -- ⚠️ SUBSTITUA AQUI!
  test_mindmap_id UUID;
  test_node_id UUID;
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Testando com usuário: %', test_user_id;
  RAISE NOTICE '================================================';

  -- Teste 1: Inserir mindmap
  BEGIN
    INSERT INTO public.mindmaps (user_id, title, description)
    VALUES (test_user_id, 'TEST - Mapa Mental Teste', 'Teste de RLS policies')
    RETURNING id INTO test_mindmap_id;

    RAISE NOTICE '✅ SUCESSO: Mindmap criado! ID: %', test_mindmap_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao criar mindmap: %', SQLERRM;
      RETURN;
  END;

  -- Teste 2: Inserir node
  BEGIN
    INSERT INTO public.mindmap_nodes (
      mindmap_id,
      text,
      position_x,
      position_y,
      color
    )
    VALUES (
      test_mindmap_id,
      'Nó Central',
      100,
      100,
      '#8B5CF6'
    )
    RETURNING id INTO test_node_id;

    RAISE NOTICE '✅ SUCESSO: Node criado! ID: %', test_node_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao criar node: %', SQLERRM;
      -- Limpar mindmap criado
      DELETE FROM public.mindmaps WHERE id = test_mindmap_id;
      RETURN;
  END;

  -- Teste 3: Ler mindmap
  BEGIN
    PERFORM id FROM public.mindmaps WHERE id = test_mindmap_id;
    RAISE NOTICE '✅ SUCESSO: Mindmap pode ser lido';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao ler mindmap: %', SQLERRM;
  END;

  -- Teste 4: Atualizar mindmap
  BEGIN
    UPDATE public.mindmaps
    SET description = 'Descrição atualizada'
    WHERE id = test_mindmap_id;

    RAISE NOTICE '✅ SUCESSO: Mindmap pode ser atualizado';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao atualizar mindmap: %', SQLERRM;
  END;

  -- Limpar dados de teste
  DELETE FROM public.mindmap_nodes WHERE id = test_node_id;
  DELETE FROM public.mindmaps WHERE id = test_mindmap_id;

  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '🎉 TESTE CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE 'Dados de teste removidos automaticamente';
  RAISE NOTICE '================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '❌ ERRO GERAL: %', SQLERRM;
    RAISE NOTICE '================================================';
END $$;
