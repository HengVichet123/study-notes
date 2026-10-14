// Classification in the (λ₁, λ₂) plane.
export function EigenRegions() {
  const o = { x: 60, y: 250 }
  const s = 200
  const t = 70 // threshold position
  return (
    <svg viewBox="0 0 320 290" className="fig narrow" role="img" aria-label="Flat, edge and corner regions in the eigenvalue plane">
      <rect x={o.x + t} y={o.y - s} width={s - t} height={s - t} className="fill-green" fillOpacity="0.16" />
      <rect x={o.x} y={o.y - t} width={t} height={t} className="fill-gray" fillOpacity="0.16" />
      <rect x={o.x + t} y={o.y - t} width={s - t} height={t} className="fill-orange" fillOpacity="0.14" />
      <rect x={o.x} y={o.y - s} width={t} height={s - t} className="fill-orange" fillOpacity="0.14" />
      <line x1={o.x} y1={o.y} x2={o.x + s + 16} y2={o.y} className="axis" />
      <line x1={o.x} y1={o.y} x2={o.x} y2={o.y - s - 16} className="axis" />
      <line x1={o.x + t} y1={o.y} x2={o.x + t} y2={o.y - s} className="grid dashed" />
      <line x1={o.x} y1={o.y - t} x2={o.x + s} y2={o.y - t} className="grid dashed" />
      <text x={o.x + s + 20} y={o.y + 4} className="t-label">λ₁</text>
      <text x={o.x - 6} y={o.y - s - 22} className="t-label">λ₂</text>
      <text x={o.x + t / 2} y={o.y - t / 2 + 4} textAnchor="middle" className="t-label">flat</text>
      <text x={o.x + (t + s) / 2} y={o.y - t / 2 + 4} textAnchor="middle" className="t-label fill-orange">edge</text>
      <text x={o.x + t / 2} y={o.y - (t + s) / 2} textAnchor="middle" className="t-label fill-orange" transform={`rotate(-90 ${o.x + t / 2} ${o.y - (t + s) / 2})`}>edge</text>
      <text x={o.x + (t + s) / 2} y={o.y - (t + s) / 2 + 4} textAnchor="middle" className="t-label fill-green">corner</text>
      <text x={o.x + t} y={o.y + 18} textAnchor="middle" className="t-small">λc</text>
      <text x={o.x - 8} y={o.y - t + 4} textAnchor="end" className="t-small">λc</text>
    </svg>
  )
}
