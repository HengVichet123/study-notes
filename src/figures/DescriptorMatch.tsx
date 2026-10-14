import { PatchView } from './DescriptorGrid'
import { cornerPatch, descriptor, diskPatch, dist, stripePatch, vector } from './sift'

function Bars({ v }: { v: number[] }) {
  const w = 2
  const h = 34
  const max = Math.max(...v) || 1
  return (
    <svg viewBox={`0 0 ${v.length * w} ${h}`} className="bars" preserveAspectRatio="none" role="img" aria-label="128 descriptor numbers">
      {v.map((a, i) => (
        <rect key={i} x={i * w} y={h - (h * a) / max} width={w - 0.4} height={(h * a) / max} className="fill-indigo" />
      ))}
    </svg>
  )
}

/** One point on the left, three candidates on the right: the closest descriptor wins. */
export function DescriptorMatch() {
  const query = diskPatch()
  const cands = [
    { name: 'Corner', img: cornerPatch(0.6, 40) },
    { name: 'Disk', img: diskPatch(0.6, 40) },
    { name: 'Stripes', img: stripePatch(0.6, 40) },
  ]
  const q = vector(descriptor(query))
  const ds = cands.map((c) => dist(q, vector(descriptor(c.img))))
  const best = ds.indexOf(Math.min(...ds))
  return (
    <div className="match">
      <div className="match-col">
        <div className="match-head">Left image: keypoint</div>
        <div className="match-card">
          <div className="match-thumb"><PatchView img={query} /></div>
          <Bars v={q} />
        </div>
      </div>
      <div className="match-col">
        <div className="match-head">Right image: candidates (darker lighting)</div>
        {cands.map((c, i) => (
          <div key={c.name} className={'match-card' + (i === best ? ' is-best' : '')}>
            <div className="match-thumb"><PatchView img={c.img} /></div>
            <Bars v={vector(descriptor(c.img))} />
            <div className="match-d">
              <span>distance</span>
              <strong>{ds[i].toFixed(2)}</strong>
              {i === best && <em>match</em>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
