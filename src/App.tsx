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
    <svg viewBox="0 0 20 18" width="20" height="18" aria-hidden="true">
      <rect x="1" y="1" width="18" height="16" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="7.5" y1="1.5" x2="7.5" y2="16.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 18" width="20" height="18" aria-hidden="true">
      <path d="M2.5 8.5 10 2l7.5 6.5M4.5 7v9h4v-5h3v5h4V7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 16" width="20" height="16" aria-hidden="true">
      <path d="M1 3h18M1 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SideList({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="side-list" aria-label="Notes">
      {courses.map(({ course, notes }) => (
        <section key={course}>
          <h2 className="side-course">{course}</h2>
          {notes.map((n) => (
            <Link
              key={n.slug}
              to={`/${n.slug}`}
              className={'side-row' + (n.slug === activeSlug ? ' is-active' : '')}
              aria-current={n.slug === activeSlug ? 'page' : undefined}
              title={n.title}
            >
              <span className="side-num">{n.section}</span>
              <span className="side-title">{n.title}</span>
            </Link>
          ))}
        </section>
      ))}
    </nav>
  )
}

const COLLAPSE_KEY = 'study-notes:sidebar-collapsed'
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const { pathname } = useLocation()
  const activeSlug = pathname.slice(1) || undefined
  const current = notes.find((n) => n.slug === activeSlug)
  const [collapsed, setCollapsed] = useState(readCollapsed) // laptop: sidebar shrunk to an icon strip
  const [mobileOpen, setMobileOpen] = useState(false) // phone: sidebar slid over the page

  useEffect(() => {
    window.scrollTo(0, 0)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.title = current ? `${current.title} · Study Notes` : 'Study Notes'
  }, [current])

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* storage blocked: still works for this visit */
    }
  }, [collapsed])

  // Esc closes the phone menu; Ctrl+Cmd+S toggles the sidebar, as in Mac apps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
      if (e.key.toLowerCase() === 's' && e.ctrlKey && e.metaKey) {
        e.preventDefault()
        setCollapsed((c) => !c)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
  }, [mobileOpen])

  return (
    <div className={'shell' + (collapsed ? ' is-collapsed' : '') + (mobileOpen ? ' is-mobile-open' : '')}>
      <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <aside className="sidebar" aria-label="Notes list">
        <div className="sb-top">
          <Link to="/" className="sb-title">Study Notes</Link>
          <button
            type="button"
            className="icon-btn sb-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
            aria-expanded={!collapsed}
            title={(collapsed ? 'Open sidebar' : 'Close sidebar') + ' (⌃⌘S)'}
          >
            <SidebarIcon />
          </button>
          <button type="button" className="icon-btn sb-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>
        <Link to="/" className="icon-btn sb-rail-home" aria-label="All notes" title="All notes">
          <HomeIcon />
        </Link>
        <div className="sb-body">
          <SideList activeSlug={activeSlug} />
        </div>
      </aside>

      <div className="main">
        <div className="mobile-bar">
          <button type="button" className="icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}>
            <MenuIcon />
          </button>
          <span className="mobile-bar-title">{current ? current.title : 'Study Notes'}</span>
        </div>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:slug" element={<NotePage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
