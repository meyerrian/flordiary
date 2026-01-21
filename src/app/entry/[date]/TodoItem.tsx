'use client'

import { toggleTodo, deleteTodo } from '../actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Todo = {
    id: string
    content: string
    completed: boolean
}

export function TodoItem({ todo }: { todo: Todo }) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    async function handleToggle() {
        if (isPending) return
        setIsPending(true)
        await toggleTodo(todo.id, !todo.completed)
        router.refresh()
        setIsPending(false)
    }

    async function handleDelete() {
        if (isPending) return
        setIsPending(true)
        await deleteTodo(todo.id)
        router.refresh()
        setIsPending(false)
    }

    // Prevent enter key from submitting the parent form if focus is here
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                background: 'white',
                borderRadius: 'var(--radius-md)',
                opacity: isPending ? 0.5 : 1
            }}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button" // Critical: prevent form submission
                onClick={handleToggle}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
            >
                {todo.completed ? '✅' : '⬜'}
            </button>

            <span style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#cbd5e1' : '#1e293b'
            }}>
                {todo.content}
            </span>

            <button
                type="button" // Critical: prevent form submission
                onClick={handleDelete}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
                ×
            </button>
        </div>
    )
}
