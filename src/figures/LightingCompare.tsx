import { useMemo, useState } from 'react'
import { PatchView } from './DescriptorGrid'
import { descriptor, diskPatch, dist, ssd, vector } from './sift'

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })

/** Same patch, different lighting: raw pixels disagree, the descriptor does not. */
export function LightingCompare() {
  const [gain, setGain] = useState(0.55)
  const left = useMemo(() => diskPatch(), [])
  const right = useMemo(() => diskPatch(gain, 30), [gain])
  const raw = ssd(left, right)
  const d = dist(vector(descriptor(left)), vector(descriptor(right)))
  return (
    <div className="probe">
      <div className="desc-pair">
        <PatchView img={left} label="Left image" />
        <PatchView img={right} label="Right image (other lighting)" />
      </div>
      <label className="slider" htmlFor="gain">
        <span>Right image brightness: × {fmt(gain, 2)} + 30</span>
        <input id="gain" type="range" min="0.2" max="1.2" step="0.05" value={gain} onChange={(e) => setGain(Number(e.target.value))} />
      </label>
      <dl className="probe-read">
        <div>
          <dt>Raw pixels, SSD</dt>
          <dd>{fmt(raw)}</dd>
        </div>
        <div>
          <dt>SIFT descriptors, distance</dt>
          <dd>{fmt(d, 3)}</dd>
        </div>
      </dl>
      <p className="probe-verdict">Pixel difference grows with the lighting change. The descriptor distance stays at 0.</p>
    </div>
  )
}
