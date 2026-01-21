'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const timezone = formData.get('timezone') as string
    const reminderTime = formData.get('reminderTime') as string || '20:00'

    // Update profile
    const { error } = await supabase
        .from('profiles')
        .update({
            timezone,
            reminder_time_local: reminderTime,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Onboarding error:', error)
        return { error: 'Failed to save settings. Please try again.' }
    }

    redirect('/')
}
