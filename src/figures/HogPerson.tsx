import { useMemo, useState } from 'react'
import { CELL, H, NB, W, hogCells, personImage } from './hog'

const S = 3 // display scale

/** Left: the window. Right: one 9-line "star" per cell, each line drawn along the edge direction. Click a cell to see its histogram. */
export function HogPerson() {
  const img = useMemo(personImage, [])
  const cells = useMemo(() => hogCells(img), [img])
  const max = Math.max(...cells.flat(2))
  const [sel, setSel] = useState({ cx: 2, cy: 5 })
  const hist = cells[sel.cy][sel.cx]
  const hmax = Math.max(...hist, 1)

  return (
    <div className="probe">
      <div className="probe-panes">
        <svg viewBox={`0 0 ${W * S} ${H * S}`} className="hog-svg" role="img" aria-label="64 by 128 window with a person shape">
          {img.flatMap((row, y) => row.map((v, x) => (x % 2 === 0 && y % 2 === 0 ? <rect key={`${x}-${y}`} x={x * S} y={y * S} width={S * 2} height={S * 2} fill={`rgb(${v | 0},${v | 0},${v | 0})`} /> : null)))}
          {Array.from({ length: W / CELL + 1 }, (_, i) => <line key={`v${i}`} x1={i * CELL * S} y1="0" x2={i * CELL * S} y2={H * S} className="hog-grid" />)}
          {Array.from({ length: H / CELL + 1 }, (_, j) => <line key={`h${j}`} x1="0" y1={j * CELL * S} x2={W * S} y2={j * CELL * S} className="hog-grid" />)}
          <rect x={sel.cx * CELL * S} y={sel.cy * CELL * S} width={CELL * S} height={CELL * S} className="win" />
        </svg>
        <svg viewBox={`0 0 ${W * S} ${H * S}`} className="hog-svg" role="img" aria-label="HOG picture: orientation lines in each cell">
          <rect width={W * S} height={H * S} fill="#000" />
          {cells.flatMap((row, cy) =>
            row.map((bins, cx) => {
              const ox = (cx + 0.5) * CELL * S
              const oy = (cy + 0.5) * CELL * S
              return (
                <g key={`${cx}-${cy}`} onClick={() => setSel({ cx, cy })} className="spoke">
                  <rect x={cx * CELL * S} y={cy * CELL * S} width={CELL * S} height={CELL * S} fill="transparent" />
                  {bins.map((v, b) => {
                    if (v <= 0) return null
                    const edge = (((b + 0.5) * (180 / NB) + 90) * Math.PI) / 180 // edge runs perpendicular to the gradient
                    const L = (CELL * S * 0.5) * Math.sqrt(v / max)
                    return (
                      <line key={b} x1={ox - Math.cos(edge) * L} y1={oy - Math.sin(edge) * L} x2={ox + Math.cos(edge) * L} y2={oy + Math.sin(edge) * L}
                        stroke="#fff" strokeOpacity={0.35 + 0.65 * Math.sqrt(v / max)} strokeWidth="1.6" strokeLinecap="round" />
                    )
                  })}
                </g>
              )
            }),
          )}
          <rect x={sel.cx * CELL * S} y={sel.cy * CELL * S} width={CELL * S} height={CELL * S} className="win" />
        </svg>
      </div>
      <div className="hog-hist">
        <div className="hog-hist-title">Cell ({sel.cx}, {sel.cy}): 9-bin histogram of gradient direction</div>
        <svg viewBox="0 0 360 120" className="fig" role="img" aria-label="Histogram of the selected cell">
          {hist.map((v, b) => {
            const h = (86 * v) / hmax
            return (
              <g key={b}>
                <rect x={14 + b * 38} y={96 - h} width="30" height={h} rx="4" className="fill-blue" />
                <text x={29 + b * 38} y="112" textAnchor="middle" className="t-small">{b * 20}°</text>
              </g>
            )
          })}
          <line x1="10" y1="96" x2="350" y2="96" className="axis" />
        </svg>
      </div>
      <p className="probe-verdict">Click any cell on either picture. Each bin covers 20° of gradient direction (0–180°).</p>
    </div>
  )
}
