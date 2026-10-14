import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'

const Epipolar3D = lazy(() => import('./Epipolar3D'))

// A tiny 3D scene: two pinhole cameras, a pixel p1 in camera 1, and the 3D point P sliding along its ray.
// Everything is computed with real projections, so the traced line really is the epipolar line.

type V3 = [number, number, number]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const F = 1 // focal length
const W = 1.7 // half width of the drawn image plane
const H = 0.9 // half height
const TMIN = 0.3
const TMAX = 6
const P1: [number, number] = [0.35, 0.3] // the chosen pixel in camera 1 (image coords, y up)

type Cam = { O: V3; fwd: V3; right: V3; up: V3 }
const camera = (O: V3, yaw: number): Cam => ({
  O,
  fwd: [Math.sin(yaw), 0, Math.cos(yaw)],
  right: [Math.cos(yaw), 0, -Math.sin(yaw)],
  up: [0, 1, 0],
})
const project = (c: Cam, X: V3) => {
  const v = sub(X, c.O)
  const z = dot(v, c.fwd)
  return { x: (dot(v, c.right) / z) * F, y: (dot(v, c.up) / z) * F, z }
}
const imgToWorld = (c: Cam, x: number, y: number): V3 => add(add(add(c.O, mul(c.fwd, F)), mul(c.right, x)), mul(c.up, y))
const inside = (x: number, y: number) => Math.abs(x) <= W && Math.abs(y) <= H

/** Clip the infinite 2D line through a and b to the image rectangle. */
function clipLine(a: [number, number], b: [number, number]): [[number, number], [number, number]] | null {
  const d = [b[0] - a[0], b[1] - a[1]]
  let t0 = -1e9
  let t1 = 1e9
  for (const [p, q, lo, hi] of [
    [a[0], d[0], -W, W],
    [a[1], d[1], -H, H],
  ] as const) {
    if (Math.abs(q) < 1e-12) {
      if (p < lo || p > hi) return null
      continue
    }
    let u0 = (lo - p) / q
    let u1 = (hi - p) / q
    if (u0 > u1) [u0, u1] = [u1, u0]
    t0 = Math.max(t0, u0)
    t1 = Math.min(t1, u1)
  }
  if (t0 > t1) return null
  return [
    [a[0] + d[0] * t0, a[1] + d[1] * t0],
    [a[0] + d[0] * t1, a[1] + d[1] * t1],
  ]
}

export function EpipolarAnimation() {
  const [turned, setTurned] = useState(true)
  const [t, setT] = useState(2.2)
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [playing, setPlaying] = useState(!reduce)
  const dirRef = useRef(1)

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setT((prev) => {
        let next = prev + dirRef.current * dt * 1.4
        if (next > TMAX) (next = TMAX), (dirRef.current = -1)
        if (next < TMIN) (next = TMIN), (dirRef.current = 1)
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const theta = turned ? 0.62 : 0
  const c1 = useMemo(() => camera([-1, 0, 0], theta), [theta])
  const c2 = useMemo(() => camera([1, 0, 0], -theta), [theta])

  const dir = add(add(c1.fwd, mul(c1.right, P1[0])), mul(c1.up, P1[1]))
  const Pat = (s: number) => add(c1.O, mul(dir, s))
  const P = Pat(t)
  const p2 = project(c2, P)

  // Epipoles: the other camera's centre seen in each image (null = behind / at infinity).
  const e1raw = project(c1, c2.O)
  const e2raw = project(c2, c1.O)
  const e1 = e1raw.z > 1e-6 ? e1raw : null
  const e2 = e2raw.z > 1e-6 ? e2raw : null

  // Full epipolar lines (faint) and the part already traced by p2 (bold).
  const a2 = project(c2, Pat(1))
  const b2 = project(c2, Pat(5))
  const line2 = clipLine([a2.x, a2.y], [b2.x, b2.y])
  const q1 = project(c1, add(c2.O, mul(sub(P, c2.O), 2)))
  const line1 = clipLine(P1, [q1.x, q1.y])
  const trace = Array.from({ length: 80 }, (_, i) => project(c2, Pat(TMIN + ((t - TMIN) * i) / 79))).filter((q) => q.z > 0 && inside(q.x, q.y))

  const corners = (c: Cam): V3[] => [imgToWorld(c, -W, -H), imgToWorld(c, W, -H), imgToWorld(c, W, H), imgToWorld(c, -W, H)]
  const seg = (c: Cam, l: [[number, number], [number, number]] | null): [V3, V3] | null => (l ? [imgToWorld(c, ...l[0]), imgToWorld(c, ...l[1])] : null)
  const scene = {
    O1: c1.O,
    O2: c2.O,
    P,
    rayEnd: Pat(TMAX + 0.4),
    p1: imgToWorld(c1, P1[0], P1[1]),
    p2: p2.z > 0 && inside(p2.x, p2.y) ? imgToWorld(c2, p2.x, p2.y) : null,
    e1: e1 && inside(e1.x, e1.y) ? imgToWorld(c1, e1.x, e1.y) : null,
    e2: e2 && inside(e2.x, e2.y) ? imgToWorld(c2, e2.x, e2.y) : null,
    plane1: corners(c1),
    plane2: corners(c2),
    line1: seg(c1, line1),
    line2: seg(c2, line2),
    trace: trace.map((q) => imgToWorld(c2, q.x, q.y)),
  }

  // 2D image panels.
  const PW = 250
  const PH = (PW * H) / W
  const toPanel = (x: number, y: number): [number, number] => [((x + W) / (2 * W)) * PW, ((H - y) / (2 * H)) * PH]

  const Panel = ({ which }: { which: 1 | 2 }) => {
    const line = which === 1 ? line1 : line2
    const e = which === 1 ? e1 : e2
    const eIn = e && inside(e.x, e.y)
    return (
      <div className="epi-panel">
        <div className="epi-panel-title">{which === 1 ? 'Left image (camera 1)' : 'Right image (camera 2)'}</div>
        <svg viewBox={`-6 -6 ${PW + 12} ${PH + 12}`} role="img" aria-label={which === 1 ? 'Left image with p1' : 'Right image with the traced epipolar line'}>
          <rect x="0" y="0" width={PW} height={PH} rx="6" className="panel" stroke="var(--label-3)" />
          {line && <line x1={toPanel(...line[0])[0]} y1={toPanel(...line[0])[1]} x2={toPanel(...line[1])[0]} y2={toPanel(...line[1])[1]} className="epi-line-faint" />}
          {which === 2 && trace.length > 1 && (
            <polyline points={trace.map((q) => toPanel(q.x, q.y).join(',')).join(' ')} fill="none" className="epi-line" />
          )}
          {eIn && (
            <g>
              <circle cx={toPanel(e!.x, e!.y)[0]} cy={toPanel(e!.x, e!.y)[1]} r="5" className="epi-epipole" />
              <text x={toPanel(e!.x, e!.y)[0] + 8} y={toPanel(e!.x, e!.y)[1] + 16} className="t-label">e{which}</text>
            </g>
          )}
          {which === 1 ? (
            <g>
              <circle cx={toPanel(...P1)[0]} cy={toPanel(...P1)[1]} r="6" className="epi-pixel" />
              <text x={toPanel(...P1)[0] + 9} y={toPanel(...P1)[1] - 8} className="t-label">p1</text>
            </g>
          ) : (
            p2.z > 0 && inside(p2.x, p2.y) && (
              <g>
                <circle cx={toPanel(p2.x, p2.y)[0]} cy={toPanel(p2.x, p2.y)[1]} r="6" className="epi-pixel" />
                <text x={toPanel(p2.x, p2.y)[0] + 9} y={toPanel(p2.x, p2.y)[1] - 8} className="t-label">p2</text>
              </g>
            )
          )}
        </svg>
        <div className="epi-panel-note">
          {which === 1
            ? 'p1 never moves: every depth on the ray looks the same to camera 1.'
            : e2
              ? eIn
                ? 'p2 moves along a line through e2.'
                : 'p2 moves along a line. e2 is off the picture.'
              : 'Parallel cameras: the line is a horizontal row, and e2 is at infinity.'}
        </div>
      </div>
    )
  }

  return (
    <div className="probe">
      <div className="epi-controls">
        <div className="segmented" role="tablist" aria-label="Camera setup">
          <button role="tab" aria-selected={turned} className={turned ? 'on' : ''} onClick={() => setTurned(true)}>Cameras turned</button>
          <button role="tab" aria-selected={!turned} className={!turned ? 'on' : ''} onClick={() => setTurned(false)}>Parallel (平行)</button>
        </div>
        <button type="button" className="play-btn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="epi-3d">
        <Suspense fallback={<div className="epi-3d-loading">Loading 3D view…</div>}>
          <Epipolar3D {...scene} />
        </Suspense>
        <div className="epi-3d-hint">Drag to turn the view. Scroll to zoom.</div>
      </div>

      <label className="slider" htmlFor="depth">
        <span>Depth of P along the ray: {t.toFixed(1)}</span>
        <input
          id="depth"
          type="range"
          min={TMIN}
          max={TMAX}
          step="0.01"
          value={t}
          onChange={(e) => {
            setPlaying(false)
            setT(Number(e.target.value))
          }}
        />
      </label>

      <div className="epi-panels">
        <Panel which={1} />
        <Panel which={2} />
      </div>
    </div>
  )
}
