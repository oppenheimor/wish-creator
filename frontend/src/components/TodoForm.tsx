import { useState, type FormEvent } from 'react'

interface TodoFormProps {
  isSubmitting: boolean
  onAdd: (title: string) => Promise<void>
}

export function TodoForm({ isSubmitting, onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return

    await onAdd(nextTitle)
    setTitle('')
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <span className="composer__plus" aria-hidden="true">+</span>
      <label className="sr-only" htmlFor="new-task">New task</label>
      <input
        id="new-task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={200}
        placeholder="What deserves momentum?"
        autoComplete="off"
      />
      <button type="submit" disabled={isSubmitting || !title.trim()}>
        <span>{isSubmitting ? 'Adding…' : 'Add task'}</span>
        <ArrowIcon />
      </button>
    </form>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  )
}
