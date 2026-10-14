import { Component, type ReactNode } from 'react'

// If anything breaks while showing a note, say so instead of leaving a blank page.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="page">
        <header className="large-title">
          <h1>This page didn’t load</h1>
          <p className="subtitle">
            If Chrome is translating the page, turn translation off, then reload.
          </p>
          <p className="subtitle">
            <a href={location.href} onClick={() => location.reload()}>Reload</a>
          </p>
          <p className="subtitle"><code>{String(this.state.error.message)}</code></p>
        </header>
      </div>
    )
  }
}
