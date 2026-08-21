import { useState, type FormEvent } from 'react'

import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  busy: boolean
  onDelete: (todo: Todo) => Promise<void>
  onUpdate: (todo: Todo) => Promise<void>
}

export function TodoItem({ todo, busy, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = draft.trim()
    if (!nextTitle) return

    await onUpdate({ ...todo, title: nextTitle })
    setIsEditing(false)
  }

  function cancelEditing() {
    setDraft(todo.title)
    setIsEditing(false)
  }

  return (
    <li className={`todo-item${todo.completed ? ' todo-item--completed' : ''}`}>
      <button
        className="check-button"
        type="button"
        disabled={busy}
        aria-label={`Mark ${todo.title} ${todo.completed ? 'open' : 'complete'}`}
        aria-pressed={todo.completed}
        onClick={() => void onUpdate({ ...todo, completed: !todo.completed })}
      >
        <CheckIcon />
      </button>

      {isEditing ? (
        <form className="edit-form" onSubmit={handleSave}>
          <label className="sr-only" htmlFor={`edit-${todo.id}`}>Edit task</label>
          <input
            id={`edit-${todo.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={200}
            autoFocus
          />
          <div className="edit-form__actions">
            <button type="button" onClick={cancelEditing}>Cancel</button>
            <button className="text-button--strong" type="submit" disabled={busy || !draft.trim()}>
              Save changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="todo-item__content">
            <p>{todo.title}</p>
            <span>{todo.completed ? 'Complete' : 'In motion'}</span>
          </div>
          <div className="todo-item__actions">
            <button
              type="button"
              disabled={busy}
              aria-label={`Edit ${todo.title}`}
              onClick={() => setIsEditing(true)}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              disabled={busy}
              aria-label={`Delete ${todo.title}`}
              onClick={() => void onDelete(todo)}
            >
              <TrashIcon />
            </button>
          </div>
        </>
      )}
    </li>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m5 10 3 3 7-7" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m13.8 3.7 2.5 2.5M4 16l3.2-.7 8.6-8.6a1.8 1.8 0 0 0-2.5-2.5l-8.6 8.6L4 16Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 6h12M8 3h4l1 3H7l1-3Zm-2 3 1 11h6l1-11M9 9v5m2-5v5" />
    </svg>
  )
}
