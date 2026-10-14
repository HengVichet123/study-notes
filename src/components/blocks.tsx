import type { ReactNode } from 'react'

/** "What this step is for." Sensei asked for the goal before every equation. */
export function Goal({ children }: { children: ReactNode }) {
  return (
    <aside className="block goal">
      <div className="block-label">Goal</div>
      <div className="block-body">{children}</div>
    </aside>
  )
}

/** A key equation, set apart with an optional name underneath. */
export function KeyEq({ name, children }: { name?: string; children: ReactNode }) {
  return (
    <div className="block key-eq">
      <div className="key-eq-math">{children}</div>
      {name && <div className="key-eq-name">{name}</div>}
    </div>
  )
}

/** Something to say out loud when the professor asks. */
export function SayIt({ children }: { children: ReactNode }) {
  return (
    <aside className="block say-it">
      <div className="block-label">To the professor</div>
      <div className="block-body">{children}</div>
    </aside>
  )
}

export function Figure({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="block figure">
      <div className="figure-art">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/** A question that came up, with a tap-to-open answer. Group several inside <QAList>. */
export function QA({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="qa">
      <summary>
        <span>{q}</span>
        <span className="chevron" aria-hidden="true" />
      </summary>
      <div className="qa-body">{children}</div>
    </details>
  )
}

export function QAList({ children }: { children: ReactNode }) {
  return <div className="inset qa-list">{children}</div>
}
