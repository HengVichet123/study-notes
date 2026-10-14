import { useEffect } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { chapters, notes } from './notes'
import { mdxComponents } from './components'

function NoteList({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="note-list" aria-label="Notes">
      {chapters.map(({ chapter, notes }) => (
        <section key={chapter} className="group">
          <h2 className="group-header">{chapter}</h2>
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
        <h1>Seminar Notes</h1>
        <p className="subtitle">
          M1 seminar, Foundations of Computer Vision (visionbook.mit.edu). {notes.length}{' '}
          {notes.length === 1 ? 'note' : 'notes'}.
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
          Section {note.section} · {note.chapter}
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
    document.title = current ? `${current.title} · Seminar Notes` : 'Seminar Notes'
  }, [current])

  return (
    <div className={'shell' + (activeSlug ? ' has-note' : '')}>
      <aside className="sidebar">
        <div className="sidebar-title">Seminar Notes</div>
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
