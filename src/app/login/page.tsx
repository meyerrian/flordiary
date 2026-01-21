'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Wrap actions to catch redirects (which look like errors) vs actual errors
        try {
            const res = isSignUp ? await signup(formData) : await login(formData)
            if (res?.error) {
                setError(res.error)
                setLoading(false)
            }
        } catch (e) {
            // Redirects throw errors in Next.js Server Actions, but we shouldn't catch them here 
            // if we are using the returned object pattern.
            // However, the `redirect` function in `actions.ts` throws NEXT_REDIRECT
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 6px -1px createElement(0, 0, 0, 0.1), 0 2px 4px -1px rgb(0, 0, 0, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: '#0f172a',
                    textAlign: 'center'
                }}>
                    Flor Diary
                </h1>
                <p style={{
                    textAlign: 'center',
                    color: '#475569',
                    marginBottom: '2rem'
                }}>
                    {isSignUp ? 'Create your private diary' : 'Welcome back'}
                </p>

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="email" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '0.5rem'
                        }}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: '#1e293b',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '0.5rem'
                        }}>
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: '#1e293b',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: '#fee2e2',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--text-brand)',
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            cursor: loading ? 'wait' : 'pointer',
                            fontSize: '1rem',
                            transition: 'transform 0.1s',
                        }}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#475569',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}
