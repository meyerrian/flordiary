import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { saveEntry, deleteEntry, createTodo, toggleTodo, deleteTodo } from '../actions'

import { TodoInput } from './TodoInput'
import { TodoItem } from './TodoItem'
import { ThemeToggle } from '@/components/ThemeToggle'

// Allow creating for "new" or specific date
export default async function EntryPage({ params }: { params: Promise<{ date: string }> }) {
    const { date } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get User Timezone to determine what "new" means (Today)
    const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single()

    let targetDate = date
    const todayLocal = new Intl.DateTimeFormat('en-CA', { timeZone: profile?.timezone || 'UTC' }).format(new Date())

    if (targetDate === 'new') {
        targetDate = todayLocal
    }

    // Fetch Entry if exists
    const { data: entry } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', targetDate)
        .single()

    // Fetch Todos for this date
    const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .order('created_at', { ascending: true })

    // Fetch Moods for picker
    const { data: moods } = await supabase
        .from('moods')
        .select('*')
        .order('sort_order')

    async function handleDelete() {
        'use server'
        await deleteEntry(targetDate)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Navbar */}
            <div style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ fontSize: '2rem', lineHeight: 1 }}>×</Link>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                        {targetDate === todayLocal ? 'Today' : new Date(targetDate).toLocaleDateString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    {entry ? (
                        <form action={handleDelete}>
                            <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                        </form>
                    ) : <div style={{ width: 40 }} />}
                </div>
            </div>

            <form action={async (formData) => {
                'use server'
                await saveEntry(formData)
            }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '2rem' }}>
                <input type="hidden" name="date" value={targetDate} />

                {/* Mood Picker */}
                <div>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        How are you feeling?
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                        {moods?.map((mood) => (
                            <label key={mood.id} style={{ cursor: 'pointer', flex: 1 }}>
                                <input
                                    type="radio"
                                    name="moodId"
                                    value={mood.id}
                                    defaultChecked={entry?.mood_id === mood.id}
                                    style={{ display: 'none' }}
                                />
                                <div className="mood-chip" style={{
                                    padding: '1rem 0.5rem',
                                    textAlign: 'center',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-secondary)',
                                    border: '2px solid transparent',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}>
                                    <span className="mood-color" style={{
                                        display: 'block',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: mood.color_hex,
                                        margin: '0 auto 0.5rem'
                                    }} />
                                    {mood.name}
                                </div>
                            </label>
                        ))}
                    </div>
                    <style>{`
                  input[type="radio"]:checked + .mood-chip {
                      background: white;
                      border-color: var(--text-brand);
                      box-shadow: 0 4px 6px -1px createElement(0,0,0,0.1);
                  }
              `}</style>
                </div>

                {/* To-Do List Integration */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Tasks for {targetDate === todayLocal ? 'Today' : targetDate}</h3>

                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {todos?.map((todo) => (
                            <TodoItem key={todo.id} todo={todo} />
                        ))}
                    </div>

                    {/* Add New Todo */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <TodoInput date={targetDate} />
                    </div>
                </div>

                {/* Diary Input */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="notes" style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Your Thoughts
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        placeholder="What happened today?"
                        defaultValue={entry?.notes || ''}
                        style={{
                            flex: 1, // fill remaining space
                            width: '100%',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid #e2e8f0',
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'var(--font-sans)',
                            minHeight: '300px'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--text-brand)',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 'auto'
                    }}
                >
                    Save Entry
                </button>
            </form>
        </div>
    )
}
