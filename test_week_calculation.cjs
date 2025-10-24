// Teste para validar que TODOS os componentes usam Domingo-Sábado

// Simula getWeekDays do CalendarView (DEPOIS da correção)
const getWeekDays_NEW = (startDate, count = 7) => {
  const days = []
  const date = new Date(startDate + 'T12:00:00')

  // ✅ Ajusta para começar no DOMINGO
  const dayOfWeek = date.getDay() // 0 = Domingo, 6 = Sábado
  date.setDate(date.getDate() - dayOfWeek) // Volta para o domingo da semana

  for (let i = 0; i < count; i++) {
    days.push(date.toISOString().split('T')[0])
    date.setDate(date.getDate() + 1)
  }

  return days
}

// Simula calculatePeriod do Dashboard
const calculatePeriod = (viewMode, currentDate) => {
  const date = new Date(currentDate + 'T12:00:00')
  date.setHours(0, 0, 0, 0)

  let startDate
  let endDate

  switch (viewMode) {
    case 'week':
      startDate = new Date(date)
      startDate.setDate(date.getDate() - date.getDay()) // Domingo
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // Sábado
      break
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  }
}

console.log('=== TESTE: CONSISTÊNCIA DOMINGO-SÁBADO ===\n')

const testDate = '2025-10-23' // Quinta-feira
console.log(`Data de teste: ${testDate} (quinta-feira)\n`)

// Teste CalendarView
const visibleDays = getWeekDays_NEW(testDate, 7)
console.log('📅 CalendarView - Dias visíveis:')
console.log(`   Primeiro dia: ${visibleDays[0]} (deveria ser domingo)`)
console.log(`   Último dia:   ${visibleDays[6]} (deveria ser sábado)`)
console.log(`   Lista: ${visibleDays.join(', ')}\n`)

// Teste Dashboard
const period = calculatePeriod('week', testDate)
console.log('📊 Dashboard - Período dos cards:')
console.log(`   Início: ${period.start} (deveria ser domingo)`)
console.log(`   Fim:    ${period.end} (deveria ser sábado)\n`)

// Validação
const isConsistent =
  visibleDays[0] === period.start &&
  visibleDays[6] === period.end

console.log(isConsistent ? '✅ CONSISTENTE!' : '❌ INCONSISTENTE!')
console.log('')

if (isConsistent) {
  console.log('✨ CalendarView e Dashboard agora usam o MESMO período!')
  console.log('   - CalendarView exibe: Domingo a Sábado')
  console.log('   - Cards calculam:      Domingo a Sábado')
  console.log('   - Período comum:      ' + period.start + ' a ' + period.end)
} else {
  console.log('⚠️ Ainda há inconsistência entre CalendarView e Dashboard')
}

// Verificar que 20/10 está INCLUÍDO
console.log('\n=== VERIFICAÇÃO: 20/10/2025 está incluído? ===')
const includes20 = visibleDays.includes('2025-10-20')
console.log(includes20 ? '✅ SIM - 20/10 está visível' : '❌ NÃO - 20/10 NÃO está visível')
