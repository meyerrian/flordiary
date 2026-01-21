
export const MOCK_USER = {
    id: 'mock-user-123',
    email: 'test@example.com',
}

export const MOCK_PROFILE = {
    id: 'mock-user-123',
    timezone: 'UTC', // Default for test
    reminder_enabled: false,
    reminder_time_local: '20:00',
}

export const MOCK_MOODS = [
    { id: 1, name: 'Great', color_hex: '#22c55e', sort_order: 1 },
    { id: 2, name: 'Good', color_hex: '#84cc16', sort_order: 2 },
    { id: 3, name: 'Okay', color_hex: '#eab308', sort_order: 3 },
    { id: 4, name: 'Low', color_hex: '#f97316', sort_order: 4 },
    { id: 5, name: 'Awful', color_hex: '#ef4444', sort_order: 5 },
]

export const MOCK_ENTRIES = [
    {
        id: 'entry-1',
        user_id: 'mock-user-123',
        mood_id: 2,
        entry_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        notes: 'This is a mock entry for yesterday.',
        created_at: new Date().toISOString(),
        moods: { name: 'Good', color_hex: '#84cc16' }
    }
]
