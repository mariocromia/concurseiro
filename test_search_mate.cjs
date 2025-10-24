const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

(async () => {
  // Buscar TODAS as atividades
  const { data } = await supabase
    .from('study_schedules')
    .select('id, title, description, start_time, scheduled_date, subjects(name)')
    .order('scheduled_date');

  console.log('=== ANÁLISE: Por que "Constituição" aparece na busca "mate"? ===\n');

  const query = 'mate';

  // Filtrar atividades que contêm "mate"
  const matches = (data || []).filter(act => {
    const titleMatch = act.title.toLowerCase().includes(query);
    const descMatch = act.description?.toLowerCase().includes(query);
    const subjectMatch = act.subjects?.name?.toLowerCase().includes(query);
    const timeMatch = act.start_time?.includes(query);

    return titleMatch || descMatch || subjectMatch || timeMatch;
  });

  console.log(`Total de atividades encontradas com "${query}":`, matches.length);
  console.log('');

  // Mostrar apenas as que têm "Constituição" no título
  const constituicaoMatches = matches.filter(a =>
    a.title.toLowerCase().includes('constituição')
  );

  if (constituicaoMatches.length > 0) {
    console.log(`⚠️⚠️⚠️ PROBLEMA ENCONTRADO! ⚠️⚠️⚠️`);
    console.log(`${constituicaoMatches.length} atividades "Constituição" aparecem na busca "mate":\n`);

    constituicaoMatches.forEach((act, i) => {
      console.log(`--- Atividade Constituição #${i + 1} ---`);
      console.log('Título:', act.title);
      console.log('Matéria:', act.subjects?.name || '(sem matéria)');
      console.log('Descrição:', act.description || '(vazia)');
      console.log('Horário:', act.start_time);
      console.log('Data:', act.scheduled_date);

      // Identificar ONDE está o match
      const reasons = [];
      if (act.title.toLowerCase().includes(query)) reasons.push(`TÍTULO contém "${query}"`);
      if (act.description?.toLowerCase().includes(query)) reasons.push(`DESCRIÇÃO contém "${query}"`);
      if (act.subjects?.name?.toLowerCase().includes(query)) reasons.push(`MATÉRIA contém "${query}"`);
      if (act.start_time?.includes(query)) reasons.push(`HORÁRIO contém "${query}"`);

      console.log('🔍 Match encontrado em:', reasons.join(' | '));
      console.log('');
    });
  } else {
    console.log('✅ Nenhuma atividade "Constituição" foi encontrada com "mate"');
    console.log('✅ A busca está funcionando corretamente!');
  }

  // Mostrar o que FOI encontrado corretamente
  console.log('\n=== Atividades corretas encontradas com "mate" ===');
  matches.slice(0, 10).forEach((act, i) => {
    console.log(`${i + 1}. ${act.title} - ${act.scheduled_date}`);
  });
})();
