import { useEffect, useMemo, useState } from 'react'

import { prototypeEntries, type PrototypeEntry, type PrototypeVariant } from './registry'
import './prototype.css'

interface Selection {
  entryId: string | null
  variantId: string | null
}

export function PrototypeApp({ entries = prototypeEntries }: { entries?: readonly PrototypeEntry[] }) {
  const [selection, setSelection] = useState<Selection>(readSelection)
  const active = useMemo(() => resolveSelection(selection, entries), [entries, selection])

  useEffect(() => {
    function syncFromUrl() {
      setSelection(readSelection())
    }

    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  function navigate(entry: PrototypeEntry, requestedVariant?: PrototypeVariant) {
    const variant = requestedVariant ?? entry.variants[0]
    const url = new URL(window.location.href)
    url.searchParams.set('screen', entry.id)
    url.searchParams.set('variant', variant.id)
    window.history.replaceState({}, '', url)
    setSelection({ entryId: entry.id, variantId: variant.id })
  }

  return (
    <div className="prototype-lab">
      <header className="prototype-lab__header">
        <a className="prototype-lab__brand" href="/prototype" aria-label="原型工作台首页">
          <span aria-hidden="true">愿</span>
          <strong>许愿池</strong>
          <small>Prototype Lab</small>
        </a>
        <div className="prototype-lab__environment">
          <span aria-hidden="true" />
          仅用于设计验证
        </div>
      </header>

      <div className="prototype-lab__layout">
        <aside className="prototype-lab__sidebar">
          <div>
            <span className="prototype-lab__label">功能原型</span>
            <strong>{entries.length}</strong>
          </div>
          <nav aria-label="功能原型列表">
            {entries.map((entry) => (
              <button
                className={entry.id === active?.entry.id ? 'is-active' : ''}
                key={entry.id}
                type="button"
                onClick={() => navigate(entry)}
              >
                <span>{entry.title}</span>
                <small>{entry.variants.length} 个方案</small>
              </button>
            ))}
          </nav>
          <a href="/" className="prototype-lab__back">返回当前应用</a>
        </aside>

        <main className="prototype-lab__main">
          <header className="prototype-lab__intro">
            <div>
              <span className="prototype-lab__label">设计验证空间</span>
              <h1>原型工作台</h1>
              <p>先在这里确认用户流程、界面结构和交互反馈，再进入正式功能实现。</p>
            </div>
            {active ? <span className="prototype-lab__date">更新于 {active.entry.updatedAt}</span> : null}
          </header>

          {active ? (
            <PrototypeCanvas active={active} onVariantChange={(variant) => navigate(active.entry, variant)} />
          ) : (
            <EmptyPrototype />
          )}
        </main>
      </div>
    </div>
  )
}

function PrototypeCanvas({
  active,
  onVariantChange,
}: {
  active: ActivePrototype
  onVariantChange: (variant: PrototypeVariant) => void
}) {
  const { Component } = active.variant

  return (
    <section className="prototype-canvas" aria-labelledby="prototype-title">
      <header className="prototype-canvas__toolbar">
        <div>
          <h2 id="prototype-title">{active.entry.title}</h2>
          <p>{active.entry.scope}</p>
        </div>
        {active.entry.variants.length > 1 ? (
          <div className="prototype-canvas__variants" aria-label="原型方案">
            {active.entry.variants.map((variant) => (
              <button
                className={variant.id === active.variant.id ? 'is-active' : ''}
                key={variant.id}
                type="button"
                aria-pressed={variant.id === active.variant.id}
                onClick={() => onVariantChange(variant)}
              >
                {variant.name}
              </button>
            ))}
          </div>
        ) : null}
      </header>
      <div className="prototype-canvas__surface"><Component /></div>
    </section>
  )
}

function EmptyPrototype() {
  return (
    <section className="prototype-empty" aria-labelledby="prototype-empty-title">
      <span className="prototype-empty__mark" aria-hidden="true">+</span>
      <div>
        <h2 id="prototype-empty-title">尚未登记功能原型</h2>
        <p>这是有意保留的空状态。具体需求明确后，再添加对应页面和交互方案。</p>
      </div>
      <ol>
        <li><strong>明确行为</strong><span>写清用户目标、关键流程和验收示例。</span></li>
        <li><strong>更新原型</strong><span>在注册表中加入页面，并完成可交互方案。</span></li>
        <li><strong>确认后实现</strong><span>原型达成一致后，再修改正式产品代码。</span></li>
      </ol>
      <code>frontend/src/prototype/registry.ts</code>
    </section>
  )
}

interface ActivePrototype {
  entry: PrototypeEntry
  variant: PrototypeVariant
}

function resolveSelection(selection: Selection, entries: readonly PrototypeEntry[]): ActivePrototype | null {
  const entry = entries.find(({ id }) => id === selection.entryId) ?? entries[0]
  if (!entry) return null
  const variant = entry.variants.find(({ id }) => id === selection.variantId) ?? entry.variants[0]
  return { entry, variant }
}

function readSelection(): Selection {
  const params = new URLSearchParams(window.location.search)
  return {
    entryId: params.get('screen'),
    variantId: params.get('variant'),
  }
}
