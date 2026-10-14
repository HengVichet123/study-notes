import { useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { courses, notes } from './notes'
import { mdxComponents } from './components'

function NoteList({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="note-list" aria-label="Notes">
      {courses.map(({ course, notes }) => (
        <section key={course} className="group">
          <h2 className="group-header">{course}</h2>
          <ul className="inset">
            {notes.map((n) => (
              <li key={n.slug}>
                <Link
                  to={`/${n.slug}`}
                  className={'row' + (n.slug === activeSlug ? ' is-active' : '')}
                  aria-current={n.slug === activeSlug ? 'page' : undefined}
                >
                  <span className="row-section">{n.section}</span>
                  <span className="row-text">
                    <span className="row-title">{n.title}</span>
                    <span className="row-sub">{n.summary}</span>
                  </span>
                  <span className="chevron" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}

function Home() {
  return (
    <div className="page home">
      <header className="large-title">
        <h1>Study Notes</h1>
        <p className="subtitle">
          Classes and materials, explained step by step. {courses.length}{' '}
          {courses.length === 1 ? 'course' : 'courses'}, {notes.length} {notes.length === 1 ? 'note' : 'notes'}.
        </p>
      </header>
      <NoteList />
    </div>
  )
}

function NotePage() {
  const { slug } = useParams()
  const note = notes.find((n) => n.slug === slug)
  if (!note) {
    return (
      <div className="page">
        <header className="large-title">
          <h1>Note not found</h1>
          <p className="subtitle">
            There is no note called “{slug}”. <Link to="/">Go back to all notes</Link>.
          </p>
        </header>
      </div>
    )
  }
  const { Body } = note
  return (
    <article className="page note">
      <header className="large-title">
        <p className="kicker">
          {note.course} · {note.chapter ? `${note.section}, ${note.chapter}` : note.section}
        </p>
        <h1>{note.title}</h1>
        <p className="subtitle">{note.summary}</p>
      </header>
      <div className="prose">
        <MDXProvider components={mdxComponents}>
          <Body />
        </MDXProvider>
      </div>
      <footer className="note-footer">Written {note.date}</footer>
    </article>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 16" width="20" height="16" aria-hidden="true">
      <path d="M1 2h18M1 8h18M1 14h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const activeSlug = pathname.slice(1) || undefined
  const current = notes.find((n) => n.slug === activeSlug)
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setOpen(false) // picking a note closes the drawer
  }, [pathname])

  useEffect(() => {
    document.title = current ? `${current.title} · Study Notes` : 'Study Notes'
  }, [current])

  // Esc closes; Ctrl+Cmd+S toggles, as in Mac apps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key.toLowerCase() === 's' && e.ctrlKey && e.metaKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Keep the page from scrolling behind the open drawer, and move focus into it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) drawerRef.current?.querySelector<HTMLElement>('.is-active, a')?.focus()
  }, [open])

  return (
    <div className="shell">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setOpen(true)}
          aria-label="Open notes list"
          aria-expanded={open}
          aria-controls="drawer"
        >
          <MenuIcon />
        </button>
        <Link to="/" className="topbar-home">Study Notes</Link>
        {current && <span className="topbar-title">{current.title}</span>}
      </header>

      <div className={'scrim' + (open ? ' is-open' : '')} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        id="drawer"
        ref={drawerRef}
        className={'drawer' + (open ? ' is-open' : '')}
        aria-label="Notes list"
        {...(open ? {} : { inert: '' })}
      >
        <div className="drawer-head">
          <Link to="/" className="drawer-title">Study Notes</Link>
          <button type="button" className="icon-btn close-btn" onClick={() => setOpen(false)} aria-label="Close notes list">
            ✕
          </button>
        </div>
        <NoteList activeSlug={activeSlug} />
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:slug" element={<NotePage />} />
        </Routes>
      </main>
    </div>
  )
}
