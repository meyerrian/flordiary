'use client'

import { useEffect } from 'react'

type Props = {
    reminderTime: string // "HH:MM"
    enabled: boolean
}

export default function Notifications({ reminderTime, enabled }: Props) {
    useEffect(() => {
        if (!enabled || !reminderTime || typeof window === 'undefined') return

        if (!('Notification' in window) || Notification.permission !== 'granted') return

        // Parse reminder time
        const [hours, minutes] = reminderTime.split(':').map(Number)

        const now = new Date()
        const scheduled = new Date(now)
        scheduled.setHours(hours, minutes, 0, 0)

        // If time has passed today, schedule for tomorrow
        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1)
        }

        const timeout = scheduled.getTime() - now.getTime()

        const timer = setTimeout(() => {
            new Notification("Flor Diary", {
                body: "It's time to record your day.",
                icon: "/favicon.ico" // assuming default
            })
        }, timeout)

        console.log(`Notification scheduled for ${scheduled.toLocaleTimeString()}`)

        return () => clearTimeout(timer)
    }, [reminderTime, enabled])

    return null
}
