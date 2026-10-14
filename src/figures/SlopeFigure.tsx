// Brightness along one image row: start at 50, slope 10 per pixel, move 3 pixels.
export function SlopeFigure() {
  const px = (i: number) => 70 + i * 80
  const py = (b: number) => 190 - (b - 40) * 4
  const pts = [50, 60, 70, 80]
  return (
    <svg viewBox="0 0 400 240" className="fig" role="img" aria-label="Brightness rises 30 when moving 3 pixels with slope 10">
      <line x1="50" y1="200" x2="380" y2="200" className="axis" />
      <line x1="50" y1="200" x2="50" y2="14" className="axis" />
      <text x="384" y="204" className="t-small">x</text>
      <text x="38" y="12" className="t-small">ℓ</text>
      {[50, 60, 70, 80].map((b) => (
        <g key={b}>
          <line x1="46" y1={py(b)} x2="50" y2={py(b)} className="axis" />
          <text x="40" y={py(b) + 4} textAnchor="end" className="t-small">{b}</text>
        </g>
      ))}
      {['x', 'x+1', 'x+2', 'x+3'].map((l, i) => (
        <text key={l} x={px(i)} y="218" textAnchor="middle" className="t-small">{l}</text>
      ))}
      <line x1={px(0)} y1={py(50)} x2={px(3)} y2={py(80)} className="stroke-blue" strokeWidth="2.5" />
      {pts.map((b, i) => (
        <circle key={i} cx={px(i)} cy={py(b)} r="4.5" className="fill-blue" />
      ))}
      {/* run */}
      <line x1={px(0)} y1={py(50)} x2={px(3)} y2={py(50)} className="stroke-orange dashed" strokeWidth="2" />
      <text x={(px(0) + px(3)) / 2} y={py(50) + 18} textAnchor="middle" className="t-label fill-orange">
        run: Δx = 3
      </text>
      {/* rise */}
      <line x1={px(3)} y1={py(50)} x2={px(3)} y2={py(80)} className="stroke-green" strokeWidth="2.5" />
      <text x={px(3) - 8} y={(py(50) + py(80)) / 2 - 6} textAnchor="end" className="t-label fill-green">
        rise = (∂ℓ/∂x)·Δx
      </text>
      <text x={px(3) - 8} y={(py(50) + py(80)) / 2 + 12} textAnchor="end" className="t-label fill-green">
        = 10 × 3 = 30
      </text>
      <text x={px(0)} y={py(50) - 12} textAnchor="middle" className="t-small">before 50</text>
      <text x={px(3)} y={py(80) - 12} textAnchor="middle" className="t-small">after ≈ 80</text>
    </svg>
  )
}
