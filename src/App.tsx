import { useEffect, useState } from 'react'
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

function SidebarIcon() {
  return (
    <svg viewBox="0 0 22 18" width="22" height="18" aria-hidden="true">
      <rect x="1" y="1" width="20" height="16" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="1.5" x2="8" y2="16.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3.6" y1="5" x2="5.6" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3.6" y1="8" x2="5.6" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const SIDEBAR_KEY = 'study-notes:sidebar-hidden'
const readHidden = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [sidebarHidden, setSidebarHidden] = useState(readHidden)
  const toggleSidebar = () => setSidebarHidden((h) => !h)
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarHidden ? '1' : '0')
    } catch {
      /* storage blocked: the toggle still works for this visit */
    }
  }, [sidebarHidden])
  // Ctrl+Cmd+S toggles the sidebar, as in Mac apps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 's' && e.ctrlKey && e.metaKey) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { pathname } = useLocation()
  const activeSlug = pathname.slice(1) || undefined
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const current = notes.find((n) => n.slug === activeSlug)
  useEffect(() => {
    document.title = current ? `${current.title} · Study Notes` : 'Study Notes'
  }, [current])

  return (
    <div className={'shell' + (activeSlug ? ' has-note' : '') + (sidebarHidden ? ' sidebar-hidden' : '')}>
      <aside className="sidebar" hidden={sidebarHidden}>
        <div className="sidebar-head">
          <Link to="/" className="sidebar-title">Study Notes</Link>
          <button type="button" className="icon-btn" onClick={toggleSidebar} aria-label="Hide sidebar" title="Hide sidebar (⌃⌘S)">
            <SidebarIcon />
          </button>
        </div>
        <NoteList activeSlug={activeSlug} />
      </aside>
      <div className="detail">
        {sidebarHidden && (
          <div className="desk-bar">
            <button type="button" className="icon-btn" onClick={toggleSidebar} aria-label="Show sidebar" title="Show sidebar (⌃⌘S)">
              <SidebarIcon />
            </button>
            <Link to="/" className="desk-bar-home">Study Notes</Link>
          </div>
        )}
        <div className="navbar">
          <Link to="/" className="back">
            <span className="back-chevron" aria-hidden="true" />
            Notes
          </Link>
          <span className="navbar-title">{current?.title}</span>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:slug" element={<NotePage />} />
        </Routes>
      </div>
    </div>
  )
}
