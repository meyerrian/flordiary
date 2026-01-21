'use client'

import { toggleTodo } from '../app/entry/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Todo = {
    id: string
    content: string
    completed: boolean
}

export function DashboardTodoList({ initialTodos }: { initialTodos: Todo[] }) {
    const router = useRouter()
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

    async function handleToggle(id: string, completed: boolean) {
        if (pendingIds.has(id)) return // Prevent double clicks

        // Optimistic update could go here, but for simplicity relying on router refresh
        // Set pending state
        setPendingIds(prev => new Set(prev).add(id))

        await toggleTodo(id, !completed)

        router.refresh()
        setPendingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }

    if (!initialTodos || initialTodos.length === 0) {
        return <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No tasks for today.</p>
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {initialTodos.map((todo) => (
                <li
                    key={todo.id}
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    style={{
                        padding: '1rem', // Generous padding for mobile tap
                        background: 'white', // Theme overrides via CSS usually handle this, but let's be safe
                        marginBottom: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        opacity: (todo.completed || pendingIds.has(todo.id)) ? 0.6 : 1,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        // Dark mode support via CSS class or variable
                        color: 'var(--text-primary)'
                    }}
                    className="dashboard-todo-item" // Hook for potential CSS overrides
                >
                    <span style={{
                        color: todo.completed ? '#22c55e' : 'var(--text-secondary)',
                        fontSize: '1.2rem'
                    }}>
                        {todo.completed ? '✅' : '⬜'}
                    </span>
                    <span style={{ flex: 1 }}>{todo.content}</span>
                </li>
            ))}
        </ul>
    )
}
