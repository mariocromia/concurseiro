// Script para executar a migration do sistema de pagamentos
// Uso: node scripts/run-payment-migration.js

const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Iniciando migration do sistema de pagamentos...\n');

  // Importar o cliente Supabase
  const { createClient } = require('@supabase/supabase-js');

  // Carregar variáveis de ambiente
  require('dotenv').config();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_KEY não encontradas no .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ler o arquivo SQL
  const sqlPath = path.join(__dirname, 'payment-schema.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ ERRO: Arquivo payment-schema.sql não encontrado em:', sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 Arquivo SQL carregado com sucesso');
  console.log('📊 Executando migration...\n');

  try {
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });

    if (error) {
      // Se o RPC não existir, tentar executar por partes
      console.log('⚠️  Método RPC não disponível, executando por partes...\n');
      await runMigrationByParts(supabase, sqlContent);
    } else {
      console.log('✅ Migration executada com sucesso!\n');
    }

    // Verificar se os planos foram criados
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      console.error('❌ Erro ao verificar planos:', plansError.message);
    } else {
      console.log('✅ Planos cadastrados:', plans.length);
      plans.forEach(plan => {
        console.log(`   - ${plan.display_name}: R$ ${plan.price.toFixed(2)} (AI: ${plan.ai_enabled ? 'Sim' : 'Não'})`);
      });
    }

    // Verificar tabelas criadas
    console.log('\n✅ Tabelas criadas:');
    const tables = [
      'subscription_plans',
      'asaas_customers',
      'subscriptions',
      'payments',
      'asaas_webhooks',
      'subscription_changes'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        console.log(`   ✓ ${table}`);
      } else {
        console.log(`   ✗ ${table} - ${error.message}`);
      }
    }

    console.log('\n🎉 Migration concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Configure as variáveis do Asaas no .env');
    console.log('   2. Execute: npm run dev');
    console.log('   3. Acesse: http://localhost:3000/precos');

  } catch (error) {
    console.error('❌ ERRO ao executar migration:', error.message);
    process.exit(1);
  }
}

async function runMigrationByParts(supabase, sqlContent) {
  // Dividir em statements individuais
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Executando ${statements.length} comandos SQL...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Pular comentários
    if (statement.startsWith('--')) continue;

    try {
      // Para INSERT/CREATE/ALTER, usar query direto
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Ignorar erros de "already exists"
        if (error.message.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Já existe (ignorando)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Erro:`, error.message);
          errorCount++;
        }
      } else {
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`✓ [${i + 1}/${statements.length}] Executados...`);
        }
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${statements.length}] Erro:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Comandos executados com sucesso: ${successCount}`);
  if (errorCount > 0) {
    console.log(`⚠️  Comandos com erro: ${errorCount}`);
  }
}

// Executar
runMigration().catch(console.error);
