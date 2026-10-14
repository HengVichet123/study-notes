import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { H, STEPS, TOTAL, W, difference, line2img, linePoint, p1img, ramp, stepAt, uTrue } from './epiStory'

const EpiStory3D = lazy(() => import('./EpiStory3D'))

// ---------- the flat 2D view used in the matching step ----------
const PW = 230
const PH = (PW * H) / W
const toPx = (x: number, y: number): [number, number] => [((x + W) / (2 * W)) * PW, ((H - y) / (2 * H)) * PH]
const PATCH = 26

function MatchingView({ t, start }: { t: number; start: number }) {
  const u = ramp(t, start + 1.1, 4) // scan position along the line (smoothstep keeps it calm)
  const found = ramp(t, start + 5.3, 0.4)
  const uNow = found > 0 ? uTrue + (u - uTrue) * (1 - found) : u
  const [sx, sy] = toPx(...linePoint(uNow))
  const [p1x, p1y] = toPx(p1img.x, p1img.y)
  const [la, lb] = [toPx(...line2img[0]), toPx(...line2img[1])]
  const N = 120
  const shown = Math.floor(N * u)
  const GW = PW
  const GH = 70
  const curve = Array.from({ length: shown + 1 }, (_, i) => {
    const uu = i / N
    return `${(uu * GW).toFixed(1)},${(GH - 6 - (1 - difference(uu)) * (GH - 14)).toFixed(1)}`
  }).join(' ')
  const best = found > 0.5
  return (
    <div className="story-2d">
      <div className="story-2d-row">
        <figure>
          <figcaption>Photo 1</figcaption>
          <svg viewBox={`-4 -4 ${PW + 8} ${PH + 8}`}>
            <rect width={PW} height={PH} rx="6" className="story-photo" />
            <rect x={p1x - PATCH / 2} y={p1y - PATCH / 2} width={PATCH} height={PATCH} rx="3" className="story-patch blue" />
            <circle cx={p1x} cy={p1y} r="4.5" fill="#007aff" />
            <text x={p1x + PATCH / 2 + 4} y={p1y + 4} className="t-label" fill="#007aff">p1</text>
          </svg>
        </figure>
        <figure>
          <figcaption>Photo 2: search along the epipolar line</figcaption>
          <svg viewBox={`-4 -4 ${PW + 8} ${PH + 8}`}>
            <rect width={PW} height={PH} rx="6" className="story-photo" />
            <line x1={la[0]} y1={la[1]} x2={lb[0]} y2={lb[1]} stroke="#ff3b30" strokeWidth="3" strokeLinecap="round" />
            <rect x={sx - PATCH / 2} y={sy - PATCH / 2} width={PATCH} height={PATCH} rx="3" className={'story-patch ' + (best ? 'green' : 'orange')} />
            {best && (
              <g>
                <circle cx={sx} cy={sy} r="4.5" fill="#34c759" />
                <text x={sx + PATCH / 2 + 4} y={sy + 4} className="t-label" fill="#1f8a3b">p2</text>
              </g>
            )}
          </svg>
        </figure>
      </div>
      <div className="story-graph">
        <div className="story-graph-title">How different each spot looks from p1 (lower = more similar)</div>
        <svg viewBox={`-4 -4 ${GW + 8} ${GH + 8}`} preserveAspectRatio="none">
          <line x1="0" y1={GH - 6} x2={GW} y2={GH - 6} stroke="var(--sep)" />
          <polyline points={curve} fill="none" stroke="#ff9500" strokeWidth="2" />
          {best && <circle cx={uTrue * GW} cy={GH - 6 - (1 - difference(uTrue)) * (GH - 14)} r="4.5" fill="#34c759" />}
        </svg>
        <div className="story-graph-axis"><span>start of line</span><span>{best ? 'best match = p2' : 'scanning…'}</span><span>end of line</span></div>
      </div>
    </div>
  )
}

// ---------- the player ----------
export function EpipolarStory() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const started = useRef(false)
  const box = useRef<HTMLDivElement>(null)

  // Start playing the first time the figure scrolls into view (not with reduced motion).
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || !box.current) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          setPlaying(true)
        }
      },
      { threshold: 0.5 },
    )
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setT((prev) => {
        const next = prev + dt
        if (next >= TOTAL) {
          setPlaying(false)
          return TOTAL
        }
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // Lets a test jump to an exact moment: window.__epiStoryTime(20)
  useEffect(() => {
    ;(window as unknown as { __epiStoryTime: (v: number) => void }).__epiStoryTime = (v: number) => {
      setPlaying(false)
      setT(v)
    }
  }, [])

  const step = stepAt(t)
  const go = (i: number) => {
    setT(STEPS[Math.max(0, Math.min(STEPS.length - 1, i))].start + 0.001)
    setPlaying(true)
  }
  const s5 = STEPS[5]
  const overlay = ramp(t, s5.start + 0.2, 0.6) * (1 - ramp(t, s5.end - 0.3, 0.5))
  const atEnd = t >= TOTAL

  return (
    <div className="story" ref={box}>
      <div className="story-stage">
        <Suspense fallback={<div className="epi-3d-loading">Loading 3D view…</div>}>
          <EpiStory3D t={t} step={step} />
        </Suspense>
        {overlay > 0.01 && (
          <div className="story-overlay" style={{ opacity: overlay }}>
            <MatchingView t={t} start={s5.start} />
          </div>
        )}
      </div>
      <div className="story-caption" aria-live="polite">
        <span className="story-num">{step + 1}/{STEPS.length}</span> {STEPS[step].caption}
      </div>

      <div className="story-bar">
        <button type="button" className="story-btn" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Previous step">‹</button>
        <button
          type="button"
          className="story-btn primary"
          onClick={() => {
            if (atEnd) {
              setT(0)
              setPlaying(true)
            } else setPlaying((p) => !p)
          }}
        >
          {atEnd ? 'Replay' : playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="story-btn" onClick={() => go(step + 1)} disabled={step === STEPS.length - 1} aria-label="Next step">›</button>
        <div className="story-progress" aria-hidden="true">
          <div style={{ width: `${(100 * t) / TOTAL}%` }} />
        </div>
      </div>

      <ol className="story-steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button type="button" className={i === step ? 'on' : i < step ? 'done' : ''} onClick={() => go(i)}>
              {s.title}
            </button>
          </li>
        ))}
      </ol>
      <p className="probe-verdict">Drag the 3D view to look around at any time.</p>
    </div>
  )
}
