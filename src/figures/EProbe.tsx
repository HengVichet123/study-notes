import { useMemo, useState } from 'react'

// A tiny 20×20 image: dark (30) everywhere, a bright (200) block in the lower right.
const N = 20
const DARK = 30
const BRIGHT = 200
const img = (x: number, y: number) => (x >= 10 && y >= 6 ? BRIGHT : DARK)
const R = 2 // 5×5 window

const presets = {
  flat: { label: 'Flat area', x: 4, y: 13 },
  edge: { label: 'Edge', x: 10, y: 14 },
  corner: { label: 'Corner', x: 10, y: 6 },
} as const
type Kind = keyof typeof presets

const dirs = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
] as const

function E(px: number, py: number, dx: number, dy: number) {
  let sum = 0
  for (let j = -R; j <= R; j++)
    for (let i = -R; i <= R; i++) {
      const d = img(px + i, py + j) - img(px + i + dx, py + j + dy)
      sum += d * d
    }
  return sum
}

const fmt = (n: number) => n.toLocaleString('en-US')

export function EProbe() {
  const [kind, setKind] = useState<Kind>('edge')
  const [dir, setDir] = useState(0)
  const p = presets[kind]

  const values = useMemo(() => dirs.map(([dx, dy]) => E(p.x, p.y, dx, dy)), [p])
  const globalMax = useMemo(
    () => Math.max(...Object.values(presets).flatMap((q) => dirs.map(([dx, dy]) => E(q.x, q.y, dx, dy)))),
    [],
  )
  const minE = Math.min(...values)
  const [dx, dy] = dirs[dir]
  const cell = 11

  const verdict =
    minE > 0 ? 'Every move changes the patch. This point can be matched.' :
    Math.max(...values) > 0 ? 'Some moves change nothing, so the point slides along the edge.' :
    'No move changes anything. This point cannot be matched.'

  return (
    <div className="probe">
      <div className="segmented" role="tablist" aria-label="Choose a patch">
        {(Object.keys(presets) as Kind[]).map((k) => (
          <button key={k} role="tab" aria-selected={k === kind} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>
            {presets[k].label}
          </button>
        ))}
      </div>
      <div className="probe-panes">
        <svg viewBox={`0 0 ${N * cell} ${N * cell}`} className="probe-img" role="img" aria-label="Image with the patch and the shifted patch">
          {Array.from({ length: N * N }, (_, k) => {
            const x = k % N
            const y = Math.floor(k / N)
            return <rect key={k} x={x * cell} y={y * cell} width={cell} height={cell} className={img(x, y) === BRIGHT ? 'px-bright' : 'px-dark'} />
          })}
          <rect x={(p.x - R) * cell} y={(p.y - R) * cell} width={(2 * R + 1) * cell} height={(2 * R + 1) * cell} className="win" />
          <rect x={(p.x - R + dx) * cell} y={(p.y - R + dy) * cell} width={(2 * R + 1) * cell} height={(2 * R + 1) * cell} className="win-shift" />
        </svg>
        <svg viewBox="-120 -120 240 240" className="probe-polar" role="img" aria-label="E for each of the eight shift directions">
          <circle r="100" className="grid" fill="none" />
          <circle r="55" className="grid" fill="none" />
          {dirs.map(([ddx, ddy], i) => {
            const len = 8 + 92 * (values[i] / globalMax)
            const ux = ddx / Math.hypot(ddx, ddy)
            const uy = ddy / Math.hypot(ddx, ddy)
            const on = i === dir
            return (
              <g key={i} className="spoke" onClick={() => setDir(i)}>
                <line x1="0" y1="0" x2={ux * 100} y2={uy * 100} className="grid" />
                <line x1="0" y1="0" x2={ux * len} y2={uy * len} className={on ? 'stroke-orange' : 'stroke-blue'} strokeWidth="6" strokeLinecap="round" />
                <circle cx={ux * 108} cy={uy * 108} r="10" className={on ? 'fill-orange' : 'dot'} />
              </g>
            )
          })}
        </svg>
      </div>
      <dl className="probe-read">
        <div>
          <dt>Shift (Δx, Δy)</dt>
          <dd>({dx}, {dy})</dd>
        </div>
        <div>
          <dt>E for this shift</dt>
          <dd>{fmt(values[dir])}</dd>
        </div>
        <div>
          <dt>Smallest E over all 8 shifts</dt>
          <dd>{fmt(minE)}</dd>
        </div>
      </dl>
      <p className="probe-verdict">{verdict}</p>
    </div>
  )
}
