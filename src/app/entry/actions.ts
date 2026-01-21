'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function saveEntry(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const moodId = formData.get('moodId') as string
    const notes = formData.get('notes') as string
    const dateParam = formData.get('date') as string // YYYY-MM-DD

    if (!moodId) {
        return { error: 'Please select a mood' }
    }

    // If date isn't provided, use "today" in user's timezone
    let entryDate = dateParam
    if (!entryDate) {
        const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single()
        if (!profile?.timezone) return { error: 'Timezone not set' }

        entryDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: profile.timezone
        }).format(new Date())
    }

    // Upsert entry based on unique(user_id, entry_date)
    // We first try to select the ID if it exists to do an update, or just use upsert

    // Upsert is cleanest:
    const { error } = await supabase
        .from('entries')
        .upsert({
            user_id: user.id,
            entry_date: entryDate,
            mood_id: moodId,
            notes: notes,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, entry_date'
        })

    if (error) {
        console.error('Entry error', error)
        return { error: 'Failed to save entry' }
    }

    redirect('/')
}

export async function deleteEntry(entryDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    redirect('/')
}

export async function createTodo(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const content = formData.get('content') as string
    const date = formData.get('date') as string

    if (!content || !date) return

    await supabase.from('todos').insert({
        user_id: user.id,
        date,
        content,
        completed: false
    })

    // We don't redirect here to allow staying on the page, but we should revalidate.
    // However, since we are using forms in the UI that might perform a full refresh or we'll rely on router.refresh() client side.
    // For now, let's just return.
}

export async function toggleTodo(todoId: string, completed: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('todos').update({ completed }).eq('id', todoId).eq('user_id', user.id)
}

export async function deleteTodo(todoId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('todos').delete().eq('id', todoId).eq('user_id', user.id)
}
