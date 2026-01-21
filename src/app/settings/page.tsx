import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateSettings, signOut } from './actions'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
                    <Link href="/" style={{ fontSize: '1.5rem', marginRight: '1rem', textDecoration: 'none' }}>←</Link>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>
                </div>

                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <form action={updateSettings} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Account Info */}
                        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                Account
                            </label>
                            <div style={{ fontSize: '1rem' }}>{user.email}</div>
                        </div>

                        {/* Timezone */}
                        <div>
                            <label htmlFor="timezone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Timezone
                            </label>
                            <select
                                name="timezone"
                                id="timezone"
                                defaultValue={profile?.timezone}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                {Intl.supportedValuesOf('timeZone').map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notifications */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <label htmlFor="reminderEnabled" style={{ fontWeight: 600 }}>Daily Reminders</label>
                                <input
                                    type="checkbox"
                                    name="reminderEnabled"
                                    id="reminderEnabled"
                                    defaultChecked={profile?.reminder_enabled}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </div>

                            <label htmlFor="reminderTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                Reminder Time
                            </label>
                            <input
                                type="time"
                                name="reminderTime"
                                id="reminderTime"
                                defaultValue={profile?.reminder_time_local || '20:00'}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid #e2e8f0'
                                }}
                            />
                        </div>

                        <button type="submit" style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--text-brand)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            Save Changes
                        </button>
                    </form>
                </div>

                <form action={signOut} style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button type="submit" style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '1rem'
                    }}>
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}
