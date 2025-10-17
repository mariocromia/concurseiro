// Session Monitor - Improved with Realtime
// This file contains the improved session detection logic

// Setup Realtime subscription for instant detection
let realtimeChannel = null

async function setupRealtimeSubscription(supabaseClient) {
  const user = await getUser()
  if (!user) {
    console.log('[Extension] Cannot setup realtime - no user')
    return
  }

  // Remove existing channel
  if (realtimeChannel) {
    await supabaseClient.removeChannel(realtimeChannel)
  }

  console.log('[Extension] Setting up Realtime subscription for user:', user.id)

  // Subscribe to study_sessions changes
  realtimeChannel = supabaseClient
    .channel('study-sessions-extension')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'study_sessions',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('[Extension] 🔥 Realtime event received:', payload.eventType)

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const session = payload.new

          if (session.status === 'active') {
            console.log('[Extension] ✅ Session ACTIVE via Realtime!')
            handleSessionStarted(session)
          } else {
            console.log('[Extension] ⏸️ Session INACTIVE via Realtime')
            handleSessionEnded()
          }
        } else if (payload.eventType === 'DELETE') {
          console.log('[Extension] 🗑️ Session DELETED via Realtime')
          handleSessionEnded()
        }
      }
    )
    .subscribe((status) => {
      console.log('[Extension] Realtime connection status:', status)

      if (status === 'SUBSCRIBED') {
        console.log('[Extension] ✅ Realtime successfully connected!')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Extension] ❌ Realtime connection error!')
      }
    })
}

function handleSessionStarted(session) {
  // Update global state (these are defined in background.js)
  if (typeof currentStudySession !== 'undefined') {
    currentStudySession = session
    isStudyMode = true
  }

  // Load blocked sites
  if (typeof loadBlockedSites === 'function') {
    loadBlockedSites()
  }

  // Start tracking
  if (typeof startTracking === 'function') {
    startTracking()
  }

  // Update badge
  chrome.action.setBadgeText({ text: '🔥' })
  chrome.action.setBadgeBackgroundColor({ color: '#22d3ee' })

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title: 'Sessão de Estudo Iniciada! 🔥',
    message: 'Modo foco ativado. Sites de distração serão bloqueados.',
    priority: 2
  })

  console.log('[Extension] Session started successfully!')
}

function handleSessionEnded() {
  // Update global state
  if (typeof currentStudySession !== 'undefined') {
    currentStudySession = null
    isStudyMode = false
  }

  // Stop tracking
  if (typeof stopTracking === 'function') {
    stopTracking()
  }

  // Clear badge
  chrome.action.setBadgeText({ text: '' })

  console.log('[Extension] Session ended')
}

// Improved session check with better logging
async function checkActiveSessionImproved(supabaseClient) {
  console.log('[Extension] 🔍 Checking for active session...')

  const user = await getUser()
  if (!user) {
    console.log('[Extension] ❌ No user authenticated')
    return { hasSession: false }
  }

  console.log('[Extension] ✅ User authenticated:', user.id)

  try {
    const { data, error } = await supabaseClient
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[Extension] ❌ Error checking session:', error)
      return { hasSession: false, error }
    }

    if (data && data.length > 0) {
      const session = data[0]
      console.log('[Extension] ✅ Active session found!')
      console.log('[Extension] Session ID:', session.id)
      console.log('[Extension] Type:', session.type)
      console.log('[Extension] End time:', session.end_time)

      handleSessionStarted(session)

      return { hasSession: true, session }
    } else {
      console.log('[Extension] ℹ️ No active session found')
      handleSessionEnded()
      return { hasSession: false }
    }
  } catch (error) {
    console.error('[Extension] ❌ Exception in checkActiveSession:', error)
    return { hasSession: false, error }
  }
}
