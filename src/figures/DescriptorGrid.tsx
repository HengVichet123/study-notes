import { BINS, CELLS, P, descriptor, diskPatch } from './sift'

const cell = 14
const gray = (v: number) => `rgb(${v},${v},${v})`

/** Patch on the left, its 4×4 grid of orientation histograms on the right. */
export function PatchView({ img, label }: { img: number[][]; label?: string }) {
  return (
    <svg viewBox={`0 0 ${P * cell} ${P * cell + (label ? 22 : 0)}`} className="desc-svg" role="img" aria-label={label ?? 'Image patch'}>
      {img.flatMap((row, y) =>
        row.map((v, x) => <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={gray(Math.round(Math.max(0, Math.min(255, v))))} />),
      )}
      {Array.from({ length: CELLS + 1 }, (_, i) => (
        <g key={i}>
          <line x1={(i * P * cell) / CELLS} y1="0" x2={(i * P * cell) / CELLS} y2={P * cell} className="stroke-blue" strokeWidth="1.5" />
          <line x1="0" y1={(i * P * cell) / CELLS} x2={P * cell} y2={(i * P * cell) / CELLS} className="stroke-blue" strokeWidth="1.5" />
        </g>
      ))}
      {label && <text x={(P * cell) / 2} y={P * cell + 16} textAnchor="middle" className="t-small">{label}</text>}
    </svg>
  )
}

export function HistView({ hist }: { hist: number[][][] }) {
  const size = (P * cell) / CELLS
  const max = Math.max(...hist.flat(2)) || 1
  return (
    <svg viewBox={`0 0 ${P * cell} ${P * cell}`} className="desc-svg" role="img" aria-label="Orientation histogram in each cell">
      {hist.map((row, cy) =>
        row.map((bins, cx) => {
          const ox = cx * size + size / 2
          const oy = cy * size + size / 2
          return (
            <g key={`${cx}-${cy}`}>
              <rect x={cx * size + 1} y={cy * size + 1} width={size - 2} height={size - 2} rx="6" className="panel" />
              {bins.map((v, b) => {
                const a = (b * 2 * Math.PI) / BINS
                const len = (size / 2 - 5) * (v / max)
                return len > 0.5 ? (
                  <line key={b} x1={ox} y1={oy} x2={ox + Math.cos(a) * len} y2={oy + Math.sin(a) * len} className="stroke-orange" strokeWidth="2.2" strokeLinecap="round" />
                ) : null
              })}
              <circle cx={ox} cy={oy} r="1.6" className="fill-gray" />
            </g>
          )
        }),
      )}
    </svg>
  )
}

export function DescriptorGrid() {
  const img = diskPatch()
  return (
    <div className="desc-pair">
      <PatchView img={img} />
      <span className="desc-arrow" aria-hidden="true">→</span>
      <HistView hist={descriptor(img)} />
    </div>
  )
}
