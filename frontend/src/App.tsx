import { useEffect, useMemo, useState } from 'react'

import { createTodo, deleteTodo, getTodos, updateTodo } from './api'
import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import type { Todo, TodoFilter } from './types'
import './styles.css'

const filters: Array<{ value: TodoFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
]

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getTodos()
      .then((items) => {
        if (!cancelled) setTodos(items)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorMessage(reason))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleTodos = useMemo(() => todos.filter((todo) => {
    if (filter === 'open') return !todo.completed
    if (filter === 'done') return todo.completed
    return true
  }), [filter, todos])

  const completedCount = todos.reduce((count, todo) => count + Number(todo.completed), 0)
  const progress = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100)

  async function handleAdd(title: string) {
    setError(null)
    setIsCreating(true)
    try {
      const created = await createTodo(title)
      setTodos((current) => [created, ...current])
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpdate(nextTodo: Todo) {
    setError(null)
    setBusy(nextTodo.id, true)
    try {
      const updated = await updateTodo(nextTodo)
      setTodos((current) => current.map((todo) => todo.id === updated.id ? updated : todo))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(nextTodo.id, false)
    }
  }

  async function handleDelete(todo: Todo) {
    setError(null)
    setBusy(todo.id, true)
    try {
      await deleteTodo(todo.id)
      setTodos((current) => current.filter((item) => item.id !== todo.id))
    } catch (reason) {
      setError(errorMessage(reason))
      setBusy(todo.id, false)
    }
  }

  function setBusy(id: string, busy: boolean) {
    setBusyIds((current) => {
      const next = new Set(current)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Wish Creator home">
          <span>W</span>
          <i />
          <span>C</span>
        </a>
        <p>Field notes for ideas worth building</p>
        <span className="edition">Edition 00</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero__copy">
          <span className="eyebrow">Today’s direction</span>
          <h1 id="page-title">Make room<br />for <em>momentum.</em></h1>
          <p>Capture the next useful move. Finish it, learn from it, then shape what comes after.</p>
        </div>
        <div className="progress-stamp" aria-label={`${progress}% complete`}>
          <span>{String(progress).padStart(2, '0')}</span>
          <small>% complete</small>
        </div>
      </section>

      <section className="workspace" aria-labelledby="tasks-heading">
        <TodoForm isSubmitting={isCreating} onAdd={handleAdd} />

        <div className="list-header">
          <div>
            <span className="section-number">01</span>
            <h2 id="tasks-heading">Current moves</h2>
          </div>
          <div className="filters" aria-label="Filter tasks">
            {filters.map(({ value, label }) => (
              <button
                key={value}
                className={filter === value ? 'is-active' : ''}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="error-note" role="alert">
            <span>!</span>
            <p>{error}</p>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">×</button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="loading-state" aria-live="polite">
            <span /><span /><span />
            <p>Gathering your notes…</p>
          </div>
        ) : visibleTodos.length > 0 ? (
          <ul className="todo-list">
            {visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                busy={busyIds.has(todo.id)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">✦</span>
            <h3>{todos.length === 0 ? 'A clear field.' : 'Nothing in this view.'}</h3>
            <p>{todos.length === 0 ? 'Write down one small move above.' : 'Try another filter to find your tasks.'}</p>
          </div>
        )}
      </section>

      <footer>
        <p>Wish Creator / Foundation build</p>
        <p>{todos.length - completedCount} open · {completedCount} complete</p>
      </footer>
    </main>
  )
}

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : 'Something went wrong. Please try again.'
}
