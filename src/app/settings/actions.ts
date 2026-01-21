'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const timezone = formData.get('timezone') as string
    const reminderTime = formData.get('reminderTime') as string
    const reminderEnabled = formData.get('reminderEnabled') === 'on'
    const avatarStyle = formData.get('avatarStyle') as string

    await supabase.from('profiles').update({
        timezone,
        reminder_time_local: reminderTime,
        reminder_enabled: reminderEnabled,
        avatar_style: avatarStyle,
        updated_at: new Date().toISOString()
    }).eq('id', user.id)

    redirect('/settings')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
