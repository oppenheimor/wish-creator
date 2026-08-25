import type { ComponentType } from 'react'

export interface PrototypeVariant {
  id: string
  name: string
  description: string
  Component: ComponentType
}

export interface PrototypeEntry {
  id: string
  title: string
  scope: string
  updatedAt: string
  variants: [PrototypeVariant, ...PrototypeVariant[]]
}

// Product prototypes are registered here only after the target behavior is understood.
// Keep this empty until the first product requirement has been clarified.
export const prototypeEntries: PrototypeEntry[] = []
