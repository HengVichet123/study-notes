// One scanline of stereo: matching costs C[x][d], and exact min-sum on a chain (= BP on a chain = one SGM path).
export const NX = 64
export const ND = 25

export function trueDisparity(x: number) {
  if (x < 22) return 8
  if (x < 42) return 15
  return 15 + Math.round((x - 42) * 0.3) // slanted surface
}

// Textureless stretches: every disparity costs about the same, so the best one is random.
export const flat = (x: number) => (x >= 6 && x < 18) || (x >= 46 && x < 56)

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}

export function costs(): number[][] {
  const r = rng(7)
  return Array.from({ length: NX }, (_, x) =>
    Array.from({ length: ND }, (_, d) => {
      const noise = r() * 6
      return flat(x) ? 4 + noise : Math.min(12, 1.2 * Math.abs(d - trueDisparity(x))) + noise * 0.6
    }),
  )
}

export const argmin = (a: number[]) => a.indexOf(Math.min(...a))

/** L(x,d) along one direction (Hirschmüller's recursion). */
export function pathCosts(C: number[][], P1: number, P2: number, reverse = false): number[][] {
  const L: number[][] = Array.from({ length: NX }, () => new Array(ND).fill(0))
  const xs = [...Array(NX).keys()]
  if (reverse) xs.reverse()
  xs.forEach((x, i) => {
    if (i === 0) {
      L[x] = [...C[x]]
      return
    }
    const prev = L[xs[i - 1]]
    const mp = Math.min(...prev)
    for (let d = 0; d < ND; d++) {
      const same = prev[d]
      const step = Math.min(d > 0 ? prev[d - 1] : Infinity, d < ND - 1 ? prev[d + 1] : Infinity) + P1
      const jump = mp + P2
      L[x][d] = C[x][d] + Math.min(same, step, jump) - mp
    }
  })
  return L
}

/** Winner-take-all and the smoothed result from left→right plus right→left paths. */
export function solve(C: number[][], P1: number, P2: number) {
  const wta = C.map(argmin)
  const a = pathCosts(C, P1, P2)
  const b = pathCosts(C, P1, P2, true)
  // Forward + backward minus the pixel's own cost (counted twice) = exact min-marginal on the chain.
  const smooth = C.map((_, x) => argmin(a[x].map((v, d) => v + b[x][d] - C[x][d])))
  return { wta, smooth }
}
