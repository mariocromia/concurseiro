-- SOLUÇÃO TEMPORÁRIA: DESABILITAR RLS E REABILITAR APÓS INSERIR USUÁRIOS

-- Passo 1: Desabilitar RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;

-- Passo 2: Sincronizar TODOS os usuários de auth.users para public.users
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
  updated_at = NOW();

-- Passo 3: Verificar quantos usuários foram sincronizados
SELECT
  'Total de usuários em auth.users' AS tabela,
  COUNT(*) AS total
FROM auth.users
UNION ALL
SELECT
  'Total de usuários em public.users' AS tabela,
  COUNT(*) AS total
FROM public.users;

-- Passo 4: Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Passo 5: Verificar o usuário atual
SELECT
  'Meu usuário está sincronizado!' AS status,
  pu.id,
  pu.email,
  pu.full_name,
  pu.created_at
FROM public.users pu
WHERE pu.id = auth.uid();
