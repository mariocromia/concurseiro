/**
 * Script para criar tabela question_attempts via API do Supabase
 * Execute: node scripts/create-question-attempts-table.mjs
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY devem estar definidas no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const createTableSQL = `
-- Criar tabela question_attempts
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  selected_answer CHAR(1),
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON public.question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON public.question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_created_at ON public.question_attempts(created_at);

-- Habilitar RLS
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver suas próprias tentativas" ON public.question_attempts;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias tentativas" ON public.question_attempts;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tentativas" ON public.question_attempts;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias tentativas" ON public.question_attempts;

-- Criar políticas RLS
CREATE POLICY "Usuários podem ver suas próprias tentativas"
  ON public.question_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias tentativas"
  ON public.question_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tentativas"
  ON public.question_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias tentativas"
  ON public.question_attempts
  FOR DELETE
  USING (auth.uid() = user_id);
`

async function createTable() {
  console.log('🔧 Criando tabela question_attempts...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL })

    if (error) {
      // Tentar de outra forma - executando cada comando separadamente
      console.log('⚠️  Tentando método alternativo...')

      const commands = createTableSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0)

      for (const cmd of commands) {
        console.log(`📝 Executando: ${cmd.substring(0, 50)}...`)
        const { error: cmdError } = await supabase.rpc('exec_sql', { sql: cmd })
        if (cmdError && !cmdError.message.includes('already exists')) {
          console.error(`❌ Erro:`, cmdError)
        }
      }
    }

    console.log('✅ Tabela question_attempts criada com sucesso!')
    console.log('\n📊 Verificando se a tabela foi criada...')

    // Verificar se a tabela existe
    const { data: tables, error: checkError } = await supabase
      .from('question_attempts')
      .select('*')
      .limit(0)

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar tabela:', checkError)
    } else {
      console.log('✅ Tabela verificada e pronta para uso!')
    }

  } catch (err) {
    console.error('❌ Erro ao criar tabela:', err)
    console.log('\n📝 Execute o SQL manualmente no Supabase SQL Editor:')
    console.log(createTableSQL)
  }
}

createTable()
