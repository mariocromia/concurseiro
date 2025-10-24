const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('study_schedules')
    .select(`
      id,
      user_id,
      subject_id,
      title,
      description,
      scheduled_date,
      start_time,
      scheduled_time,
      duration,
      planned_duration,
      is_completed,
      status,
      color,
      created_at,
      subjects(name, color)
    `)
    .gte('scheduled_date', '2025-10-20')
    .lte('scheduled_date', '2025-10-26')
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('ERRO:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('=== REGISTROS ENCONTRADOS: ' + (data?.length || 0) + ' ===\n');

  if (data && data.length > 0) {
    data.forEach((record, index) => {
      console.log(`--- REGISTRO #${index + 1} ---`);
      console.log('ID:', record.id);
      console.log('User ID:', record.user_id);
      console.log('Subject ID:', record.subject_id);
      console.log('Matéria:', record.subjects?.name || 'Sem matéria');
      console.log('Título:', record.title);
      console.log('Descrição:', record.description || 'Sem descrição');
      console.log('Data:', record.scheduled_date);
      console.log('Horário (start_time):', record.start_time || 'null');
      console.log('Horário (scheduled_time):', record.scheduled_time || 'null');
      console.log('Duração (duration):', record.duration || 'null', 'minutos');
      console.log('Duração (planned_duration):', record.planned_duration || 'null', 'minutos');
      console.log('Concluída (is_completed):', record.is_completed);
      console.log('Status:', record.status);
      console.log('Cor:', record.color || 'Sem cor');
      console.log('Criado em:', record.created_at);
      console.log('');
    });

    // Estatísticas
    const totalDuration = data.reduce((sum, r) => sum + (r.duration || r.planned_duration || 0), 0);
    const completed = data.filter(r => r.is_completed || r.status === 'completed').length;
    const completionRate = data.length > 0 ? Math.round((completed / data.length) * 100) : 0;

    console.log('=== ESTATÍSTICAS ===');
    console.log('Total de atividades:', data.length);
    console.log('Atividades concluídas:', completed);
    console.log('Taxa de conclusão:', completionRate + '%');
    console.log('Carga horária total:', Math.round(totalDuration / 60 * 10) / 10 + 'h');
  } else {
    console.log('Nenhum registro encontrado no período.');
  }
})();
