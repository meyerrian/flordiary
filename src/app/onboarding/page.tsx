'use client'

import { useState, useEffect } from 'react'
import { completeOnboarding } from './actions'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [timezone, setTimezone] = useState('')
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Auto-detect timezone
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
        setTimezone(detected)

        // Check current notification status
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications')
            return
        }
        const result = await Notification.requestPermission()
        setPermission(result)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('timezone', timezone)
        // Default reminder is 20:00, we can add a picker later if requested,
        // but the requirement says "Default reminder time set to 20:00"
        formData.append('reminderTime', '20:00')

        await completeOnboarding(formData)
        setIsSubmitting(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-secondary)',
            gap: '2rem'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: 'var(--bg-primary)',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 4px 6px -1px createElement(0, 0, 0, 0.1)'
            }}>
                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ marginBottom: '1rem' }}>Welcome to Flor</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Your private space to reflect, record, and track your days.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--text-brand)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ marginBottom: '0.5rem' }}>Setup your experience</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                We need a few details to keep your diary in sync with your life.
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Your Timezone
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid #cbd5e1',
                                    background: 'white',
                                    fontSize: '1rem'
                                }}
                            >
                                {Intl.supportedValuesOf('timeZone').map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                We detected this automatically. Change it if you prefer.
                            </p>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Daily Reminder</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>8:00 PM</span>
                            </div>

                            {permission === 'granted' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mood-great)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                    <span>Notifications enabled</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={requestNotificationPermission}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-brand)',
                                        background: 'white',
                                        border: '1px solid currentColor',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Enable Notifications
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--text-brand)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: isSubmitting ? 'wait' : 'pointer'
                            }}
                        >
                            {isSubmitting ? 'Saving...' : 'Start Journaling'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
