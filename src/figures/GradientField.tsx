import { P, diskPatch, gradients } from './sift'

/** Gradient arrows at every pixel of a patch: long on edges, none in flat areas. */
export function GradientField() {
  const img = diskPatch()
  const g = gradients(img)
  const cell = 16
  const max = Math.max(...g.flat().map((v) => Math.hypot(v.gx, v.gy)))
  return (
    <div className="desc-pair">
      <svg viewBox={`0 0 ${P * cell} ${P * cell}`} className="desc-svg wide" role="img" aria-label="Image with gradient arrows">
        <defs>
          <marker id="garrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-orange" />
          </marker>
        </defs>
        {img.flatMap((row, y) =>
          row.map((v, x) => <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={`rgb(${v},${v},${v})`} />),
        )}
        {g.flatMap((row, y) =>
          row.map(({ gx, gy }, x) => {
            const m = Math.hypot(gx, gy)
            if (m < max * 0.08) return null
            const L = (cell * 0.85 * m) / max
            const cx = x * cell + cell / 2
            const cy = y * cell + cell / 2
            return (
              <line key={`a${x}-${y}`} x1={cx - (gx / m) * L * 0.5} y1={cy - (gy / m) * L * 0.5} x2={cx + (gx / m) * L * 0.5} y2={cy + (gy / m) * L * 0.5}
                className="stroke-orange" strokeWidth="1.8" strokeLinecap="round" markerEnd="url(#garrow)" />
            )
          }),
        )}
      </svg>
    </div>
  )
}
