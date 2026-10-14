// Worked min-sum example on a chain A – B – C, disparities {3, 4, 5}.
const D = [3, 4, 5]
const C = { A: [0, 5, 8], B: [4, 6, 3], C: [0, 5, 8] }
const V = (a: number, b: number) => (a === b ? 0 : Math.abs(a - b) === 1 ? 2 : 6)
const msg = (from: number[]) => D.map((d) => Math.min(...D.map((dp, i) => from[i] + V(dp, d))))
const mA = msg(C.A)
const mC = msg(C.C)
const belief = C.B.map((c, i) => c + mA[i] + mC[i])
const best = belief.indexOf(Math.min(...belief))
const ownBest = C.B.indexOf(Math.min(...C.B))

function Row({ label, vals, hi, note }: { label: string; vals: number[]; hi?: number; note?: string }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {vals.map((v, i) => <td key={i} className={i === hi ? 'hi' : ''}>{v}</td>)}
      <td className="note">{note}</td>
    </tr>
  )
}

export function MessageChain() {
  return (
    <div className="probe">
      <svg viewBox="0 0 420 90" className="fig" role="img" aria-label="Chain of three pixels A, B, C with messages into B">
        <defs>
          <marker id="mArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-orange" />
          </marker>
        </defs>
        {[['A', 70], ['B', 210], ['C', 350]].map(([n, x]) => (
          <g key={n}>
            <circle cx={x} cy="50" r="26" className={n === 'B' ? 'fill-blue' : 'panel'} stroke="var(--sep)" />
            <text x={x} y="56" textAnchor="middle" className="t-label" fill={n === 'B' ? '#fff' : undefined} style={n === 'B' ? { fill: '#fff' } : undefined}>{n}</text>
          </g>
        ))}
        <line x1="100" y1="50" x2="180" y2="50" className="stroke-orange" strokeWidth="3" markerEnd="url(#mArrow)" />
        <line x1="320" y1="50" x2="240" y2="50" className="stroke-orange" strokeWidth="3" markerEnd="url(#mArrow)" />
        <text x="140" y="36" textAnchor="middle" className="t-small">m A→B</text>
        <text x="280" y="36" textAnchor="middle" className="t-small">m C→B</text>
      </svg>
      <div className="figure-art">
        <table className="num-table">
          <thead>
            <tr><th scope="col" /> {D.map((d) => <th key={d} scope="col">d = {d}</th>)}<th /></tr>
          </thead>
          <tbody>
            <Row label="A's own cost" vals={C.A} hi={0} note="sure: d = 3" />
            <Row label="C's own cost" vals={C.C} hi={0} note="sure: d = 3" />
            <Row label="B's own cost" vals={C.B} hi={ownBest} note="unsure, slightly prefers 5" />
            <Row label="message A→B" vals={mA} />
            <Row label="message C→B" vals={mC} />
            <Row label="B's belief (sum)" vals={belief} hi={best} note={`picks d = ${D[best]}`} />
          </tbody>
        </table>
      </div>
      <p className="probe-verdict">Penalty V: 0 for the same disparity, 2 for a change of 1, 6 for a bigger jump.</p>
    </div>
  )
}
