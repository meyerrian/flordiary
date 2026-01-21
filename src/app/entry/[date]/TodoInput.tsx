'use client'

import { createTodo } from '../actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function TodoInput({ date }: { date: string }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [inputValue, setInputValue] = useState('')

    async function handleSubmit() {
        const content = inputValue.trim()
        if (!content || isSubmitting) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('content', content)
        formData.append('date', date)

        await createTodo(formData)

        setInputValue('')
        setIsSubmitting(false)
        router.refresh()
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <input
                type="text"
                placeholder="Add a task..."
                disabled={isSubmitting}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--text-secondary)',
                    outline: 'none',
                    opacity: isSubmitting ? 0.5 : 1,
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '16px'
                }}
                onKeyDown={handleKeyDown}
            />
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !inputValue.trim()}
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--text-brand)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    cursor: (isSubmitting || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || !inputValue.trim()) ? 0.7 : 1
                }}
            >
                Add
            </button>
        </div>
    )
}
