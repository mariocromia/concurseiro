const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Simula a função calculatePeriod do dashboard
const calculatePeriod = (viewMode, currentDate) => {
  // ✅ CORREÇÃO: Criar data em horário local, não UTC
  const date = typeof currentDate === 'string'
    ? new Date(currentDate + 'T12:00:00') // Adiciona hora do meio-dia para evitar problemas de timezone
    : new Date(currentDate);
  date.setHours(0, 0, 0, 0);

  let startDate;
  let endDate;

  switch (viewMode) {
    case 'day':
      startDate = new Date(date);
      endDate = new Date(date);
      break;

    case 'week':
      startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay()); // Domingo
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sábado
      break;

    case 'biweek':
      startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay()); // Domingo
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13); // 14 dias
      break;

    case 'month':
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      break;

    case 'list':
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setFullYear(endDate.getFullYear() + 10); // 10 anos no futuro
      break;

    default:
      startDate = new Date(date);
      endDate = new Date(date);
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

// Simula getWorkloadStats
const getWorkloadStats = (activities, startDate, endDate) => {
  const filtered = activities.filter(
    a => a.scheduled_date >= startDate && a.scheduled_date <= endDate
  );

  const totalMinutes = filtered.reduce((sum, a) => sum + (a.duration || a.planned_duration || 0), 0);
  const completedMinutes = filtered.filter(a => a.is_completed || a.status === 'completed')
    .reduce((sum, a) => sum + (a.duration || a.planned_duration || 0), 0);

  const totalActivities = filtered.length;
  const completedActivities = filtered.filter(a => a.is_completed || a.status === 'completed').length;

  return {
    totalMinutes,
    completedMinutes,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    completedHours: Math.round(completedMinutes / 60 * 10) / 10,
    totalActivities,
    completedActivities,
    completionRate: totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0
  };
};

(async () => {
  console.log('=== TESTE: CARREGAMENTO DE TODAS AS ATIVIDADES ===\n');

  // 1. Buscar TODAS as atividades (SEM filtro de data)
  const { data: allActivities, error } = await supabase
    .from('study_schedules')
    .select('id, scheduled_date, duration, planned_duration, is_completed, status, title')
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('ERRO:', error);
    process.exit(1);
  }

  console.log('✅ Total de atividades carregadas:', allActivities.length);

  if (allActivities.length > 0) {
    const dates = allActivities.map(a => a.scheduled_date).sort();
    console.log(`📅 Range de datas: ${dates[0]} até ${dates[dates.length - 1]}\n`);
  }

  // 2. Testar filtros de visualização
  const testDate = '2025-10-23'; // Quarta-feira da semana 20-26/10

  console.log('=== TESTE: FILTROS DE VISUALIZAÇÃO ===\n');
  console.log(`Data de referência: ${testDate}\n`);

  const modes = ['day', 'week', 'biweek', 'month'];

  for (const mode of modes) {
    const period = calculatePeriod(mode, testDate);
    const stats = getWorkloadStats(allActivities, period.start, period.end);

    console.log(`--- Modo: ${mode.toUpperCase()} ---`);
    console.log(`Período: ${period.start} até ${period.end}`);
    console.log(`Total de atividades: ${stats.totalActivities}`);
    console.log(`Atividades concluídas: ${stats.completedActivities}`);
    console.log(`Taxa de conclusão: ${stats.completionRate}%`);
    console.log(`Carga horária: ${stats.totalHours}h`);
    console.log('');
  }

  // 3. Validar semana específica (20-26/10/2025)
  console.log('=== VALIDAÇÃO: SEMANA 20-26/10/2025 ===\n');
  const weekPeriod = calculatePeriod('week', testDate);
  const weekStats = getWorkloadStats(allActivities, weekPeriod.start, weekPeriod.end);

  console.log(`Período calculado: ${weekPeriod.start} até ${weekPeriod.end}`);
  console.log(`✅ Total de atividades: ${weekStats.totalActivities} (esperado: 30)`);
  console.log(`✅ Atividades concluídas: ${weekStats.completedActivities} (esperado: 14)`);
  console.log(`✅ Taxa de conclusão: ${weekStats.completionRate}% (esperado: 47%)`);
  console.log(`✅ Carga horária: ${weekStats.totalHours}h (esperado: 42h)`);

  // Verificação
  const isCorrect =
    weekStats.totalActivities === 30 &&
    weekStats.completedActivities === 14 &&
    weekStats.completionRate === 47 &&
    weekStats.totalHours === 42;

  console.log('\n' + (isCorrect ? '✅ TESTE PASSOU!' : '❌ TESTE FALHOU!'));

  if (!isCorrect) {
    console.log('\n⚠️ Diferenças encontradas:');
    if (weekStats.totalActivities !== 30)
      console.log(`  - Total: ${weekStats.totalActivities} (esperado 30)`);
    if (weekStats.completedActivities !== 14)
      console.log(`  - Concluídas: ${weekStats.completedActivities} (esperado 14)`);
    if (weekStats.completionRate !== 47)
      console.log(`  - Taxa: ${weekStats.completionRate}% (esperado 47%)`);
    if (weekStats.totalHours !== 42)
      console.log(`  - Horas: ${weekStats.totalHours}h (esperado 42h)`);
  }
})();
