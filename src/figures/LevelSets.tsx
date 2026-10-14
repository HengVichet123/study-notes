// The curve E(d) = const around d = 0 for each kind of patch.
// Tight = E grows fast in that direction. Wide = E barely changes.
export function LevelSets() {
  const panels = [
    { name: 'Flat', note: 'λ₁, λ₂ both small', rx: 66, ry: 66, angle: 0, cls: 'fill-gray' },
    { name: 'Edge', note: 'λ₁ large, λ₂ small', rx: 12, ry: 66, angle: 0, cls: 'fill-orange' },
    { name: 'Corner', note: 'λ₁, λ₂ both large', rx: 16, ry: 16, angle: 0, cls: 'fill-green' },
  ]
  return (
    <svg viewBox="0 0 480 210" className="fig" role="img" aria-label="Level sets of E for flat, edge and corner patches">
      <defs>
        <clipPath id="ls-clip">
          <rect x="-72" y="-72" width="144" height="144" rx="12" />
        </clipPath>
      </defs>
      {panels.map((p, i) => (
        <g key={p.name} transform={`translate(${80 + i * 160}, 92)`}>
          <rect x="-72" y="-72" width="144" height="144" rx="12" className="panel" />
          <g clipPath="url(#ls-clip)">
            <line x1="-72" y1="0" x2="72" y2="0" className="grid" />
            <line x1="0" y1="-72" x2="0" y2="72" className="grid" />
            <ellipse rx={p.rx} ry={p.ry} className={p.cls} fillOpacity="0.22" />
            <ellipse rx={p.rx} ry={p.ry} fill="none" className={p.cls.replace('fill', 'stroke')} strokeWidth="2" />
          </g>
          <text y="96" textAnchor="middle" className="t-label">{p.name}</text>
          <text y="113" textAnchor="middle" className="t-small">{p.note}</text>
        </g>
      ))}
      <text x="12" y="16" className="t-small">axes: Δx →, Δy ↓</text>
    </svg>
  )
}
