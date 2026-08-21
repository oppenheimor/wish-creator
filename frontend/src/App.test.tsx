import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'

import App from './App'
import type { Todo } from './types'

const existingTodo: Todo = {
  id: '8a225d1a-6581-4ed9-a20c-aa780fcec999',
  title: 'Sketch the product idea',
  completed: false,
  createdAt: '2026-08-21T08:00:00Z',
  updatedAt: '2026-08-21T08:00:00Z',
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('user can create, complete, edit, and delete todos', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(jsonResponse([existingTodo]))
    .mockResolvedValueOnce(jsonResponse({
      ...existingTodo,
      id: '2f9d5fd6-eb45-42a5-8ef8-45b27129666a',
      title: 'Build the foundation',
    }, 201))
    .mockResolvedValueOnce(jsonResponse({ ...existingTodo, completed: true }))
    .mockResolvedValueOnce(jsonResponse({ ...existingTodo, title: 'Refine the product idea', completed: true }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))

  const user = userEvent.setup()
  render(<App />)

  expect(await screen.findByText('Sketch the product idea')).toBeInTheDocument()

  await user.type(screen.getByLabelText('New task'), 'Build the foundation')
  await user.click(screen.getByRole('button', { name: 'Add task' }))
  expect(await screen.findByText('Build the foundation')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Mark Sketch the product idea complete' }))
  const existingItem = screen.getByText('Sketch the product idea').closest('li')
  expect(existingItem).not.toBeNull()
  expect(existingItem).toHaveClass('todo-item--completed')

  await user.click(within(existingItem!).getByRole('button', { name: 'Edit Sketch the product idea' }))
  const editInput = within(existingItem!).getByLabelText('Edit task')
  await user.clear(editInput)
  await user.type(editInput, 'Refine the product idea')
  await user.click(within(existingItem!).getByRole('button', { name: 'Save changes' }))
  expect(await screen.findByText('Refine the product idea')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Delete Refine the product idea' }))
  expect(screen.queryByText('Refine the product idea')).not.toBeInTheDocument()

  expect(fetchMock).toHaveBeenCalledTimes(5)
  expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/todos', expect.objectContaining({ method: 'POST' }))
  expect(fetchMock).toHaveBeenNthCalledWith(3, `/api/todos/${existingTodo.id}`, expect.objectContaining({ method: 'PUT' }))
  expect(fetchMock).toHaveBeenNthCalledWith(5, `/api/todos/${existingTodo.id}`, expect.objectContaining({ method: 'DELETE' }))
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
