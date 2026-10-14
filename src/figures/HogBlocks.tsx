/** How 8×8-pixel cells group into overlapping 2×2-cell blocks over a 64×128 window. */
export function HogBlocks() {
  const c = 22
  const cols = 8
  const rows = 16
  return (
    <svg viewBox={`0 0 ${cols * c + 300} ${rows * c + 10}`} className="fig" role="img" aria-label="Cells and overlapping blocks">
      <g transform="translate(5,5)">
        {Array.from({ length: rows }, (_, j) =>
          Array.from({ length: cols }, (_, i) => <rect key={`${i}-${j}`} x={i * c} y={j * c} width={c} height={c} className="panel" stroke="var(--sep)" />),
        )}
        <rect x="0" y="0" width={c * 2} height={c * 2} className="stroke-blue" fill="none" strokeWidth="3" />
        <rect x={c} y="0" width={c * 2} height={c * 2} className="stroke-orange dashed" fill="none" strokeWidth="3" />
        <rect x="0" y={c} width={c * 2} height={c * 2} className="stroke-green dashed" fill="none" strokeWidth="3" />
      </g>
      <g transform={`translate(${cols * c + 30}, 20)`} className="t-label">
        <text y="0">1 cell = 8 × 8 pixels → 9 numbers</text>
        <text y="28" className="fill-blue">1 block = 2 × 2 cells → 36 numbers</text>
        <text y="56" className="fill-orange">next block: move 1 cell right</text>
        <text y="84" className="fill-green">or 1 cell down (blocks overlap)</text>
        <text y="128">8 × 16 cells</text>
        <text y="156">→ 7 × 15 = 105 blocks</text>
        <text y="184">→ 105 × 36 = 3780 numbers</text>
        <text y="226" className="t-small">Each block is normalised on its own,</text>
        <text y="244" className="t-small">so every cell is counted 4 times,</text>
        <text y="262" className="t-small">each time with different neighbours.</text>
      </g>
    </svg>
  )
}
