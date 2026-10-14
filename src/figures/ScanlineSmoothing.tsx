import { useMemo, useState } from 'react'
import { ND, NX, costs, flat, solve, trueDisparity } from './stereo1d'

const Wd = 560
const Hd = 230
const ox = 36
const oy = 14
const pw = Wd - ox - 10
const ph = Hd - oy - 34
const X = (x: number) => ox + ((x + 0.5) / NX) * pw
const Y = (d: number) => oy + ph - (d / (ND - 1)) * ph

/** One image row: choose each pixel's disparity alone (orange) vs with a smoothness penalty (blue). */
export function ScanlineSmoothing() {
  const C = useMemo(costs, [])
  const [P2, setP2] = useState(12)
  const P1 = Math.min(2, P2)
  const { wta, smooth } = useMemo(() => solve(C, P1, P2), [C, P1, P2])
  const err = (ds: number[]) => ds.filter((d, x) => Math.abs(d - trueDisparity(x)) > 1).length

  return (
    <div className="probe">
      <svg viewBox={`0 0 ${Wd} ${Hd}`} className="fig wide-fig" role="img" aria-label="Disparity along one image row">
        {Array.from({ length: NX }, (_, x) => (flat(x) ? <rect key={`f${x}`} x={X(x) - pw / NX / 2} y={oy} width={pw / NX} height={ph} className="fill-gray" fillOpacity="0.12" /> : null))}
        <line x1={ox} y1={oy + ph} x2={ox + pw} y2={oy + ph} className="axis" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + ph} className="axis" />
        {[0, 8, 16, 24].map((d) => (
          <text key={d} x={ox - 6} y={Y(d) + 4} textAnchor="end" className="t-small">{d}</text>
        ))}
        <text x={ox} y={Hd - 6} className="t-small">pixel x along the row →</text>
        <text x={ox + pw} y={Hd - 6} textAnchor="end" className="t-small">grey = textureless</text>
        <polyline points={Array.from({ length: NX }, (_, x) => `${X(x)},${Y(trueDisparity(x))}`).join(' ')} fill="none" stroke="var(--label-3)" strokeWidth="6" strokeLinejoin="round" />
        {wta.map((d, x) => <circle key={`w${x}`} cx={X(x)} cy={Y(d)} r="3" className="fill-orange" />)}
        <polyline points={smooth.map((d, x) => `${X(x)},${Y(d)}`).join(' ')} fill="none" className="stroke-blue" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="legend">
        <span><i className="sw sw-true" /> true disparity</span>
        <span><i className="sw sw-wta" /> each pixel alone (winner-take-all)</span>
        <span><i className="sw sw-dp" /> with smoothness (exact on this row)</span>
      </div>
      <label className="slider" htmlFor="p2">
        <span>Jump penalty P2 = {P2} (P1 = {P1})</span>
        <input id="p2" type="range" min="0" max="60" step="1" value={P2} onChange={(e) => setP2(Number(e.target.value))} />
      </label>
      <dl className="probe-read">
        <div><dt>Wrong pixels, each alone</dt><dd>{err(wta)} / {NX}</dd></div>
        <div><dt>Wrong pixels, with smoothness</dt><dd>{err(smooth)} / {NX}</dd></div>
      </dl>
      <p className="probe-verdict">P2 = 0 gives the same noisy answer. A moderate P2 fixes the grey stretches. A huge P2 refuses real jumps and flattens the object borders.</p>
    </div>
  )
}
