const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

(async () => {
  // Buscar TODAS as atividades
  const { data: all } = await supabase
    .from('study_schedules')
    .select('id, title, description, scheduled_date, subjects(name)')
    .order('scheduled_date');

  console.log('=== ANÁLISE: BUSCA POR "CONSTITUIÇÃO" ===\n');
  console.log('Total de atividades no banco:', all?.length || 0);
  console.log('');

  // Simular busca por "constituição"
  const query = 'constituição';
  const filtered = (all || []).filter(activity => {
    // Busca no título
    if (activity.title.toLowerCase().includes(query)) return true;

    // Busca na descrição
    if (activity.description?.toLowerCase().includes(query)) return true;

    // Busca no nome da matéria
    if (activity.subjects?.name?.toLowerCase().includes(query)) return true;

    // Busca no horário (não aplicável aqui)
    return false;
  });

  console.log(`Atividades que contêm "${query}":`, filtered.length);
  console.log('');

  // Verificar se alguma tem título "História"
  const historiasEncontradas = filtered.filter(a =>
    a.title.toLowerCase().includes('história')
  );

  if (historiasEncontradas.length > 0) {
    console.log('⚠️⚠️⚠️ BUG ENCONTRADO! ⚠️⚠️⚠️');
    console.log(`Busca por "constituição" retornou ${historiasEncontradas.length} atividades com título "História":\n`);

    historiasEncontradas.forEach((act, i) => {
      console.log(`--- Atividade História #${i + 1} ---`);
      console.log('Título:', act.title);
      console.log('Descrição:', act.description || '(vazia)');
      console.log('Matéria:', act.subjects?.name || '(sem matéria)');
      console.log('Data:', act.scheduled_date);

      // Verificar ONDE está "constituição"
      if (act.title.toLowerCase().includes(query)) {
        console.log('❌ ERRO: Título não deveria conter "constituição"');
      }
      if (act.description?.toLowerCase().includes(query)) {
        console.log('✅ Encontrado na DESCRIÇÃO:', act.description);
      }
      if (act.subjects?.name?.toLowerCase().includes(query)) {
        console.log('✅ Encontrado na MATÉRIA:', act.subjects.name);
      }
      console.log('');
    });
  } else {
    console.log('✅ Nenhuma atividade "História" foi retornada pela busca');
    console.log('✅ A busca está funcionando corretamente!');
  }

  // Listar as 5 primeiras encontradas
  console.log('\n=== Primeiras 5 atividades encontradas ===');
  filtered.slice(0, 5).forEach((act, i) => {
    console.log(`${i + 1}. ${act.title} (${act.scheduled_date})`);
  });
})();
