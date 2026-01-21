import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MoodRing } from '@/components/MoodRing'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DashboardTodoList } from '@/components/DashboardTodoList'

async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Redirect to onboarding if no timezone set
  if (!profile?.timezone) {
    redirect('/onboarding')
  }

  // Calculate "Today" in user's timezone
  // We use the Intl API to get the local date string "YYYY-MM-DD"
  const now = new Date()
  const localDateString = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
    timeZone: profile.timezone
  }).format(now)

  // Fetch entries
  const { data: entries } = await supabase
    .from('entries')
    .select('*, moods(name, color_hex, emoji)')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(30) // Get last 30 days for stats/list

  // Fetch Today's Todos
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', localDateString)

  // Check if today has an entry
  const todayEntry = entries?.find(e => e.entry_date === localDateString)

  // Calculate Streak
  let streak = 0
  if (entries && entries.length > 0) {
    // Simple streak logic: Check if today or yesterday has entry, then count back
    // This is a naive implementation, a robust one would traverse dates
    const hasToday = entries.some(e => e.entry_date === localDateString)

    // Get yesterday local date
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = new Intl.DateTimeFormat('en-CA', {
      timeZone: profile.timezone
    }).format(yesterday)

    const hasYesterday = entries.some(e => e.entry_date === yesterdayString)

    if (hasToday || hasYesterday) {
      streak = 1
      // Ideally we loop back day by day. 
      // For MVP, if we have entries sorted desc, we can iterate.
      // Note: This logic needs to be robust for gaps.
      // Let's do a basic continuous check from start date (today or yesterday)
      let checkDate = hasToday ? now : yesterday

      // We already counted the first day (checkDate)
      // Actually let's refine:
      // 1. Sort entries desc (already done)
      // 2. Iterate.
      let currentCheck = new Date(now)
      let currentString = new Intl.DateTimeFormat('en-CA', { timeZone: profile.timezone }).format(currentCheck)

      // If we don't have today's entry, allow streak to continue if we have yesterday's
      if (!entries.find(e => e.entry_date === currentString)) {
        currentCheck.setDate(currentCheck.getDate() - 1)
        currentString = new Intl.DateTimeFormat('en-CA', { timeZone: profile.timezone }).format(currentCheck)
      }

      streak = 0
      for (const entry of entries) {
        if (entry.entry_date === currentString) {
          streak++
          // Move to previous day
          currentCheck.setDate(currentCheck.getDate() - 1)
          currentString = new Intl.DateTimeFormat('en-CA', { timeZone: profile.timezone }).format(currentCheck)
        } else {
          // If the entry is older than currentCheck, we missed a day.
          // Since entries are sorted desc, if entry_date < currentString, we broke the chain.
          // If entry_date > currentString, that shouldn't happen if we aligned start correctly.
          if (entry.entry_date < currentString) {
            break
          }
        }
      }
    }
  }

  // Calculate Mood Ring Segments
  const moodCounts: Record<string, { count: number; color: string }> = {}
  entries?.forEach(e => {
    const name = e.moods?.name
    if (name) {
      if (!moodCounts[name]) {
        moodCounts[name] = { count: 0, color: e.moods?.color_hex || '#ccc' }
      }
      moodCounts[name].count++
    }
  })

  const totalMoods = entries?.length || 0
  const moodSegments = Object.values(moodCounts).map(m => ({
    color: m.color,
    percentage: (m.count / totalMoods) * 100
  })).sort((a, b) => b.percentage - a.percentage)

  return {
    user,
    profile,
    todayEntry,
    entries: entries || [],
    streak,
    localDateString,
    moodSegments,
    todos: todos || []
  }
}

export default async function Dashboard() {
  const { profile, todayEntry, entries, streak, localDateString, moodSegments, todos } = await getDashboardData()

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Flor Diary</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ThemeToggle />
          <Link href="/settings" style={{ padding: '0.5rem' }}>
            <img
              src={`https://api.dicebear.com/9.x/${profile.avatar_style || 'notionists-neutral'}/svg?seed=${profile.id}`}
              alt="Avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}
            />
          </Link>
        </div>
      </header>

      {/* Mood Ring & Streak */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {/* Streak */}
        <div style={{
          flex: 1,
          background: 'white',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</span>
          <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{streak}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day Streak</span>
        </div>

        {/* Mood Ring */}
        <div style={{
          flex: 1,
          background: 'white',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {moodSegments.length > 0 ? (
            <MoodRing segments={moodSegments} />
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>No mood data yet</div>
          )}
        </div>
      </div>

      {/* Today's Entry CTA */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Today's Story</h2>
        {todayEntry ? (
          <Link href={`/entry/${todayEntry.entry_date}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: todayEntry.moods?.color_hex || 'var(--bg-secondary)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              color: '#1e293b',
              transition: 'transform 0.1s',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{todayEntry.moods?.emoji}</span>
                  {todayEntry.moods?.name}
                </span>
                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Edit</span>
              </div>
              <p style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5
              }}>
                {todayEntry.notes || 'No notes written...'}
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/entry/new" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed #cbd5e1',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>✍️</span>
              Write today's entry
            </button>
          </Link>
        )}
      </section>
      {/* To-Do List */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>To-Do List</h2>
          <Link href={`/entry/${localDateString}`} style={{ fontSize: '0.9rem', color: 'var(--text-brand)', textDecoration: 'none' }}>Manage</Link>
        </div>

        <DashboardTodoList initialTodos={todos || []} />
      </section>

      {/* Recent History */}
      <section>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Days</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.filter(e => e.entry_date !== localDateString).map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.entry_date}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                borderLeft: `4px solid ${entry.moods?.color_hex}`
              }}>
                <div style={{ width: '50px', textAlign: 'center', marginRight: '1rem' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700 }}>
                    {new Date(entry.entry_date).getDate()}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{entry.moods?.emoji}</span>
                    {entry.moods?.name}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.notes || 'No notes'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {entries.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No past entries yet.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
