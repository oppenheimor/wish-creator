import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { Root } from '../Root'
import { PrototypeApp } from './PrototypeApp'
import type { PrototypeEntry } from './registry'

afterEach(() => {
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

test('prototype route opens the prototype workspace without loading product data', async () => {
  window.history.replaceState({}, '', '/prototype')
  const fetchMock = vi.spyOn(globalThis, 'fetch')

  render(<Root />)

  expect(await screen.findByRole('heading', { name: '原型工作台' })).toBeInTheDocument()
  expect(screen.getByText('尚未登记功能原型')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

test('registered prototype variants are selected through shareable URL parameters', async () => {
  const entries: PrototypeEntry[] = [{
    id: 'example',
    title: '示例功能',
    scope: '验证注册和方案切换',
    updatedAt: '2026-08-25',
    variants: [
      { id: 'A', name: '方案 A', description: '第一种结构', Component: () => <p>方案 A 内容</p> },
      { id: 'B', name: '方案 B', description: '第二种结构', Component: () => <p>方案 B 内容</p> },
    ],
  }]
  window.history.replaceState({}, '', '/prototype?screen=example&variant=A')

  render(<PrototypeApp entries={entries} />)

  expect(screen.getByText('方案 A 内容')).toBeInTheDocument()
  screen.getByRole('button', { name: '方案 B' }).click()
  expect(await screen.findByText('方案 B 内容')).toBeInTheDocument()
  expect(window.location.search).toBe('?screen=example&variant=B')
})
