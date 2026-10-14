// Small HOG implementation: 64×128 window, 8×8 cells, 9 unsigned bins (0–180°).
export const W = 64
export const H = 128
export const CELL = 8
export const NB = 9

const inRect = (x: number, y: number, x0: number, y0: number, x1: number, y1: number) => x >= x0 && x < x1 && y >= y0 && y < y1

/** A simple standing-person silhouette, bright on dark, slightly blurred. */
export function personImage(): number[][] {
  const raw = (x: number, y: number) =>
    Math.hypot(x - 32, y - 20) < 10 || // head
    inRect(x, y, 20, 32, 44, 78) || // torso
    inRect(x, y, 12, 34, 19, 74) || // left arm
    inRect(x, y, 45, 34, 52, 74) || // right arm
    inRect(x, y, 21, 78, 30, 120) || // left leg
    inRect(x, y, 34, 78, 43, 120) // right leg
      ? 210
      : 35
  const img: number[][] = []
  for (let y = 0; y < H; y++) {
    img.push([])
    for (let x = 0; x < W; x++) {
      let s = 0
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += raw(x + i, y + j)
      img[y].push(s / 9)
    }
  }
  return img
}

/** cells[cy][cx][bin], magnitude-weighted, unsigned orientation. */
export function hogCells(img: number[][]) {
  const at = (x: number, y: number) => img[Math.min(H - 1, Math.max(0, y))][Math.min(W - 1, Math.max(0, x))]
  const cells = Array.from({ length: H / CELL }, () => Array.from({ length: W / CELL }, () => new Array(NB).fill(0)))
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const gx = at(x + 1, y) - at(x - 1, y)
      const gy = at(x, y + 1) - at(x, y - 1)
      const m = Math.hypot(gx, gy)
      if (m === 0) continue
      const deg = ((Math.atan2(gy, gx) * 180) / Math.PI + 180) % 180 // 0..180
      cells[Math.floor(y / CELL)][Math.floor(x / CELL)][Math.floor(deg / (180 / NB)) % NB] += m
    }
  return cells
}
