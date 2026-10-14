import { useState } from 'react'

// 10×10 test image: dark background with a bright tilted square, so edges run in several directions.
const N = 10
const IMG: number[][] = Array.from({ length: N }, (_, y) =>
  Array.from({ length: N }, (_, x) => (Math.abs(x - 4.5) + Math.abs(y - 4.5) <= 3.6 ? 200 : 20)),
)
const KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
const KY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]

const px = (x: number, y: number) => IMG[Math.min(N - 1, Math.max(0, y))][Math.min(N - 1, Math.max(0, x))]
const apply = (k: number[][], x: number, y: number) =>
  k.reduce((s, row, j) => s + row.reduce((t, w, i) => t + w * px(x + i - 1, y + j - 1), 0), 0)

function Kernel({ k, x, y, name }: { k: number[][]; x: number; y: number; name: string }) {
  const terms = k.flatMap((row, j) => row.map((w, i) => ({ w, v: px(x + i - 1, y + j - 1) }))).filter((t) => t.w !== 0)
  const sum = apply(k, x, y)
  return (
    <div className="sobel-k">
      <div className="sobel-k-title">{name}</div>
      <table className="mini-grid" aria-label={`${name} kernel`}>
        <tbody>
          {k.map((row, j) => (
            <tr key={j}>{row.map((w, i) => <td key={i} className={w > 0 ? 'pos' : w < 0 ? 'neg' : ''}>{w > 0 ? `+${w}` : w}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <div className="sobel-sum">
        {terms.map((t, i) => (
          <span key={i}>{i > 0 && (t.w > 0 ? ' + ' : ' − ')}{i === 0 && t.w < 0 ? '−' : ''}{Math.abs(t.w) === 1 ? '' : `${Math.abs(t.w)}·`}{t.v}</span>
        ))}
        <span> = <strong>{sum}</strong></span>
      </div>
    </div>
  )
}

export function SobelProbe() {
  const [p, setP] = useState({ x: 2, y: 4 })
  const cell = 26
  const ix = apply(KX, p.x, p.y)
  const iy = apply(KY, p.x, p.y)
  const mag = Math.hypot(ix, iy)
  const ang = (Math.atan2(iy, ix) * 180) / Math.PI
  const s = mag > 0 ? 1.15 / Math.max(...[mag, 1]) : 0
  return (
    <div className="probe">
      <p className="probe-verdict">Click any pixel. The blue 3×3 box is what Sobel looks at.</p>
      <div className="probe-panes">
        <svg viewBox={`0 0 ${N * cell} ${N * cell}`} className="sobel-img" role="img" aria-label="Test image, click a pixel">
          {IMG.flatMap((row, y) =>
            row.map((v, x) => (
              <g key={`${x}-${y}`} onClick={() => setP({ x, y })} className="sobel-px">
                <rect x={x * cell} y={y * cell} width={cell} height={cell} fill={`rgb(${v},${v},${v})`} />
                <text x={x * cell + cell / 2} y={y * cell + cell / 2 + 4} textAnchor="middle" className={v > 100 ? 'px-num dark' : 'px-num'}>{v}</text>
              </g>
            )),
          )}
          <rect x={(p.x - 1) * cell} y={(p.y - 1) * cell} width={cell * 3} height={cell * 3} className="win" />
          {mag > 0 && (
            <line
              x1={p.x * cell + cell / 2}
              y1={p.y * cell + cell / 2}
              x2={p.x * cell + cell / 2 + ix * s * cell}
              y2={p.y * cell + cell / 2 + iy * s * cell}
              className="stroke-orange"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
          )}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="fill-orange" />
            </marker>
          </defs>
        </svg>
        <div className="sobel-side">
          <Kernel k={KX} x={p.x} y={p.y} name="Sobel x → Ix" />
          <Kernel k={KY} x={p.x} y={p.y} name="Sobel y → Iy" />
        </div>
      </div>
      <dl className="probe-read">
        <div><dt>Gradient (Ix, Iy)</dt><dd>({ix}, {iy})</dd></div>
        <div><dt>Strength √(Ix² + Iy²)</dt><dd>{mag.toFixed(0)}</dd></div>
        <div><dt>Direction atan2(Iy, Ix)</dt><dd>{mag > 0 ? `${ang.toFixed(0)}°` : 'none'}</dd></div>
      </dl>
      <p className="probe-verdict">The orange arrow points from dark to bright, across the edge. Angles are measured with y pointing down.</p>
    </div>
  )
}
