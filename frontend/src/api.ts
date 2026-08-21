import type { Todo } from './types'

interface ApiProblem {
  detail?: string
  errors?: Record<string, string>
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export function getTodos() {
  return request<Todo[]>('/api/todos')
}

export function createTodo(title: string) {
  return request<Todo>('/api/todos', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  })
}

export function updateTodo(todo: Pick<Todo, 'id' | 'title' | 'completed'>) {
  return request<Todo>(`/api/todos/${todo.id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ title: todo.title, completed: todo.completed }),
  })
}

export async function deleteTodo(id: string) {
  await request<void>(`/api/todos/${id}`, { method: 'DELETE' })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)

  if (!response.ok) {
    const problem = await readProblem(response)
    const validationMessage = problem.errors
      ? Object.values(problem.errors)[0]
      : undefined
    throw new Error(validationMessage ?? problem.detail ?? 'Something went wrong. Please try again.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function readProblem(response: Response): Promise<ApiProblem> {
  try {
    return await response.json() as ApiProblem
  } catch {
    return {}
  }
}
