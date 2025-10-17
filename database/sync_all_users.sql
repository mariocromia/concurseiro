-- SINCRONIZAR TODOS OS USUÁRIOS E AJUSTAR RLS

-- Passo 1: Ver quantos usuários existem em auth.users
SELECT
  'Usuários em auth.users' AS tabela,
  COUNT(*) AS total,
  string_agg(email, ', ') AS emails
FROM auth.users;

-- Passo 2: Desabilitar RLS temporariamente para permitir sincronização
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Passo 3: Sincronizar TODOS os usuários de auth.users para public.users
INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
  updated_at = NOW();

-- Passo 4: Verificar sincronização
SELECT
  'Usuários sincronizados em public.users' AS tabela,
  COUNT(*) AS total,
  string_agg(email, ', ') AS emails
FROM public.users;

-- Passo 5: Mostrar todos os usuários sincronizados
SELECT
  id,
  email,
  full_name,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Passo 6: Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Passo 7: RECRIAR políticas RLS para study_goals
DROP POLICY IF EXISTS "Users can insert their own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can view their own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can update their own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can delete their own study goals" ON public.study_goals;

-- Política de SELECT
CREATE POLICY "Users can view their own study goals"
ON public.study_goals
FOR SELECT
USING (auth.uid() = user_id);

-- Política de INSERT
CREATE POLICY "Users can insert their own study goals"
ON public.study_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE
CREATE POLICY "Users can update their own study goals"
ON public.study_goals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política de DELETE
CREATE POLICY "Users can delete their own study goals"
ON public.study_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Passo 8: Garantir que RLS está habilitado em study_goals
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- Passo 9: Recriar o trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro em handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Sincronização completa! Faça logout e login na aplicação.' AS resultado;
