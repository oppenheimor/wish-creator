import { lazy, Suspense } from 'react'

import App from './App'

const PrototypeApp = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('./prototype/PrototypeApp')
      return { default: module.PrototypeApp }
    })
  : null

export function Root() {
  const isPrototype = PrototypeApp && window.location.pathname === '/prototype'

  return isPrototype ? (
    <Suspense fallback={null}>
      <PrototypeApp />
    </Suspense>
  ) : <App />
}
