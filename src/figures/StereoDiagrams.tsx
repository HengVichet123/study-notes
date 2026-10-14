/** The cost volume: one matching cost for every pixel and every disparity. */
export function CostVolume() {
  // simple oblique box: x to the right, y down, d going back
  const w = 220, h = 140, dx = 90, dy = -55, x0 = 40, y0 = 90
  const front = `${x0},${y0} ${x0 + w},${y0} ${x0 + w},${y0 + h} ${x0},${y0 + h}`
  const top = `${x0},${y0} ${x0 + dx},${y0 + dy} ${x0 + w + dx},${y0 + dy} ${x0 + w},${y0}`
  const side = `${x0 + w},${y0} ${x0 + w + dx},${y0 + dy} ${x0 + w + dx},${y0 + h + dy} ${x0 + w},${y0 + h}`
  const px = x0 + 120, py = y0 + 60
  return (
    <svg viewBox="0 0 470 260" className="fig" role="img" aria-label="Cost volume with axes x, y and disparity d">
      <polygon points={top} className="fill-blue" fillOpacity="0.10" stroke="var(--blue)" />
      <polygon points={side} className="fill-blue" fillOpacity="0.16" stroke="var(--blue)" />
      <polygon points={front} className="fill-blue" fillOpacity="0.06" stroke="var(--blue)" />
      {/* the column of costs behind one pixel */}
      {Array.from({ length: 7 }, (_, k) => (
        <rect key={k} x={px + (k * dx) / 7 - 6} y={py + (k * dy) / 7 - 6} width="12" height="12" rx="2" className={k === 3 ? 'fill-orange' : 'panel'} stroke="var(--orange)" />
      ))}
      <text x={x0 + w / 2} y={y0 + h + 22} textAnchor="middle" className="t-label">x</text>
      <text x={x0 - 14} y={y0 + h / 2} textAnchor="middle" className="t-label">y</text>
      <text x={x0 + w + dx / 2 + 14} y={y0 + dy / 2 - 4} className="t-label">d</text>
      <text x={px + 10} y={py + 30} className="t-small">pixel p: one cost</text>
      <text x={px + 10} y={py + 45} className="t-small">C(p, d) per disparity</text>
      <text x="300" y="215" className="t-small">orange = smallest cost</text>
    </svg>
  )
}

/** Chains and trees have no loops (BP exact). The pixel grid has loops (BP approximate). */
export function GraphLoops() {
  const n = (x: number, y: number, hi = false) => <circle cx={x} cy={y} r="9" className={hi ? 'fill-orange' : 'panel'} stroke="var(--label-2)" strokeWidth="1.2" />
  const e = (x1: number, y1: number, x2: number, y2: number, hi = false) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hi ? 'var(--orange)' : 'var(--label-2)'} strokeWidth={hi ? 3 : 1.4} />
  return (
    <svg viewBox="0 0 520 180" className="fig" role="img" aria-label="Chain, tree and grid graphs">
      <g>
        {e(30, 70, 150, 70)}
        {[30, 70, 110, 150].map((x) => <g key={x}>{n(x, 70)}</g>)}
        <text x="90" y="140" textAnchor="middle" className="t-label">Chain</text>
        <text x="90" y="158" textAnchor="middle" className="t-small fill-green">BP exact</text>
      </g>
      <g>
        {e(260, 40, 230, 80)}{e(260, 40, 290, 80)}{e(230, 80, 210, 115)}{e(230, 80, 250, 115)}{e(290, 80, 310, 115)}
        {[[260, 40], [230, 80], [290, 80], [210, 115], [250, 115], [310, 115]].map(([x, y]) => <g key={`${x}${y}`}>{n(x, y)}</g>)}
        <text x="260" y="140" textAnchor="middle" className="t-label">Tree</text>
        <text x="260" y="158" textAnchor="middle" className="t-small fill-green">BP exact</text>
      </g>
      <g>
        {[0, 1, 2].map((j) => e(380, 30 + j * 40, 480, 30 + j * 40, j === 0))}
        {[0, 1, 2].map((i) => e(380 + i * 50, 30, 380 + i * 50, 110, i < 2))}
        {[0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => <g key={`${i}${j}`}>{n(380 + i * 50, 30 + j * 40, i < 2 && j < 2)}</g>))}
        <line x1="380" y1="70" x2="430" y2="70" stroke="var(--orange)" strokeWidth="3" />
        <text x="430" y="140" textAnchor="middle" className="t-label">Pixel grid</text>
        <text x="430" y="158" textAnchor="middle" className="t-small fill-orange">loops → BP approximate</text>
      </g>
    </svg>
  )
}

/** SGM: 8 one-dimensional paths arriving at pixel p. */
export function SgmDirections() {
  const c = 110, s = 22, N = 9
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
  return (
    <svg viewBox="0 0 220 220" className="fig narrow" role="img" aria-label="Eight paths into one pixel">
      <defs>
        <marker id="sArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="fill-blue" />
        </marker>
      </defs>
      {Array.from({ length: N }, (_, j) =>
        Array.from({ length: N }, (_, i) => <rect key={`${i}-${j}`} x={11 + i * s} y={11 + j * s} width={s} height={s} className="panel" stroke="var(--sep)" />),
      )}
      {dirs.map(([dx, dy], k) => (
        <line key={k} x1={c - dx * 4 * s} y1={c - dy * 4 * s} x2={c - dx * 14} y2={c - dy * 14} className="stroke-blue" strokeWidth="2.5" markerEnd="url(#sArrow)" />
      ))}
      <rect x={c - s / 2} y={c - s / 2} width={s} height={s} className="fill-orange" />
      <text x={c} y={c + 4} textAnchor="middle" className="t-small" style={{ fill: '#fff', fontWeight: 600 }}>p</text>
    </svg>
  )
}
