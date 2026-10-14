// Tiny SIFT-style descriptor on a 16×16 patch: 4×4 cells × 8 orientation bins = 128 numbers.
export const P = 16
export const CELLS = 4
export const BINS = 8

/** A bright disk on a dark background, with a soft edge. gain/offset change the lighting. */
export function diskPatch(gain = 1, offset = 0): number[][] {
  return Array.from({ length: P }, (_, y) =>
    Array.from({ length: P }, (_, x) => {
      const r = Math.hypot(x - 7.5, y - 7.5)
      const t = Math.min(1, Math.max(0, (6 - r) / 1.5)) // 1 inside, 0 outside
      return gain * (40 + 160 * t) + offset
    }),
  )
}

export function gradients(img: number[][]) {
  const at = (x: number, y: number) => img[Math.min(P - 1, Math.max(0, y))][Math.min(P - 1, Math.max(0, x))]
  const out: { gx: number; gy: number }[][] = []
  for (let y = 0; y < P; y++) {
    out.push([])
    for (let x = 0; x < P; x++) out[y].push({ gx: (at(x + 1, y) - at(x - 1, y)) / 2, gy: (at(x, y + 1) - at(x, y - 1)) / 2 })
  }
  return out
}

/** hist[cy][cx][bin], magnitude-weighted. Bin 0 points right, bins go clockwise in image coords (y down). */
export function descriptor(img: number[][]) {
  const g = gradients(img)
  const s = P / CELLS
  const hist = Array.from({ length: CELLS }, () => Array.from({ length: CELLS }, () => new Array(BINS).fill(0)))
  for (let y = 0; y < P; y++)
    for (let x = 0; x < P; x++) {
      const { gx, gy } = g[y][x]
      const mag = Math.hypot(gx, gy)
      if (mag < 1e-9) continue
      const ang = (Math.atan2(gy, gx) + 2 * Math.PI) % (2 * Math.PI)
      const bin = Math.round(ang / ((2 * Math.PI) / BINS)) % BINS
      hist[Math.floor(y / s)][Math.floor(x / s)][bin] += mag
    }
  return hist
}

/** Flatten to 128 numbers and normalise to length 1 (Lowe also clips at 0.2 and renormalises). */
export function vector(hist: number[][][]) {
  const v = hist.flat(2)
  const n = Math.hypot(...v) || 1
  return v.map((a) => a / n)
}

export const dist = (a: number[], b: number[]) => Math.hypot(...a.map((x, i) => x - b[i]))
export const ssd = (a: number[][], b: number[][]) => a.flat().reduce((s, x, i) => s + (x - b.flat()[i]) ** 2, 0)
