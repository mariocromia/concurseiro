-- FIX COMPLETO DO TRIGGER handle_new_user

-- Passo 1: Remover trigger e função existentes (se houver)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Passo 2: Criar a função com tratamento de erros melhorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Tentar inserir o novo usuário na tabela public.users
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não falha a criação do usuário
  RAISE WARNING 'Erro em handle_new_user para user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Passo 3: Criar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Passo 4: Sincronizar usuários existentes (os que já existem em auth.users mas não em public.users)
INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Passo 5: Verificar resultado
SELECT
  'Trigger criado com sucesso!' AS status,
  COUNT(*) AS usuarios_em_auth
FROM auth.users;

SELECT
  'Usuários sincronizados!' AS status,
  COUNT(*) AS usuarios_em_public
FROM public.users;

-- Mostrar usuários que foram sincronizados
SELECT
  pu.id,
  pu.email,
  pu.full_name,
  pu.created_at
FROM public.users pu
ORDER BY pu.created_at DESC;
