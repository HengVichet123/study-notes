import { useEffect } from 'react'
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

export default function App() {
  const { pathname } = useLocation()
  const activeSlug = pathname.slice(1) || undefined
  useEffect(() => window.scrollTo(0, 0), [pathname])
  const current = notes.find((n) => n.slug === activeSlug)
  useEffect(() => {
    document.title = current ? `${current.title} · Study Notes` : 'Study Notes'
  }, [current])

  return (
    <div className={'shell' + (activeSlug ? ' has-note' : '')}>
      <aside className="sidebar">
        <Link to="/" className="sidebar-title">Study Notes</Link>
        <NoteList activeSlug={activeSlug} />
      </aside>
      <div className="detail">
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
