// Geometry and timeline for the epipolar story animation.
// Real pinhole projections: every point and line shown is computed, not drawn by hand.

export type V3 = [number, number, number]
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const len = (a: V3) => Math.sqrt(dot(a, a))
export const lerp3 = (a: V3, b: V3, k: number): V3 => add(a, mul(sub(b, a), k))

export const W = 0.75 // half width of a photo
export const H = 0.5 // half height

type Cam = { O: V3; fwd: V3; right: V3; up: V3 }
// right = forward × up, so photo x matches what you see standing behind the camera.
const camera = (O: V3, yaw: number): Cam => ({
  O,
  fwd: [Math.sin(yaw), 0, Math.cos(yaw)],
  right: [-Math.cos(yaw), 0, Math.sin(yaw)],
  up: [0, 1, 0],
})
const project = (c: Cam, X: V3) => {
  const v = sub(X, c.O)
  const z = dot(v, c.fwd)
  return { x: dot(v, c.right) / z, y: dot(v, c.up) / z, z }
}
const toWorld = (c: Cam, x: number, y: number): V3 => add(add(add(c.O, c.fwd), mul(c.right, x)), mul(c.up, y))

// Camera 1 on the left (seen from behind), camera 2 on the right, both turned slightly inward.
const TH = 0.42
export const cam1 = camera([1.5, 0, 0], -TH)
export const cam2 = camera([-1.5, 0, 0], TH)
export const P: V3 = [0.2, 0.6, 4.4]

export const p1img = project(cam1, P)
export const p2img = project(cam2, P)
export const p1 = toWorld(cam1, p1img.x, p1img.y)
export const p2 = toWorld(cam2, p2img.x, p2img.y)

export const photo = (c: Cam): V3[] => [toWorld(c, -W, -H), toWorld(c, W, -H), toWorld(c, W, H), toWorld(c, -W, H)]
export const photo1 = photo(cam1)
export const photo2 = photo(cam2)

// The ray from camera 1 through p1. s = 1 is p1 itself; P is at s = sP.
export const dir1 = sub(p1, cam1.O)
export const ray1 = (s: number) => add(cam1.O, mul(dir1, s))
export const sP = len(sub(P, cam1.O)) / len(dir1)
export const rayFar = ray1(8.5)
export const ghosts = [1.9, 3.1, sP, 6.2, 7.6].map(ray1)
// Where camera 2 sees each candidate: they all land on the epipolar line.
export const ghostsOnPhoto2 = ghosts.map((g) => {
  const q = project(cam2, g)
  return { at: toWorld(cam2, q.x, q.y), inside: Math.abs(q.x) <= W && Math.abs(q.y) <= H }
})

// The ray from camera 2 through p2 (for the final step).
export const dir2 = sub(p2, cam2.O)
export const ray2Far = add(cam2.O, mul(dir2, 8.5))

// The epipolar plane as a big sheet: spanned by the baseline and the ray direction.
const ub = mul(sub(cam2.O, cam1.O), 1 / len(sub(cam2.O, cam1.O)))
const ud = mul(dir1, 1 / len(dir1))
const A = sub(cam1.O, mul(ub, 0.8))
const B = add(cam2.O, mul(ub, 0.8))
export const sheet: V3[] = [A, B, add(B, mul(ud, 8.2)), add(A, mul(ud, 8.2))]
export const sheetSeed: V3[] = [cam1.O, p1, cam2.O] // the triangle the sheet grows from

/** Clip the infinite 2D line through a, b to the photo rectangle. */
function clip(a: [number, number], b: [number, number]) {
  const d = [b[0] - a[0], b[1] - a[1]]
  let t0 = -1e9
  let t1 = 1e9
  for (const [p, q, lo, hi] of [
    [a[0], d[0], -W, W],
    [a[1], d[1], -H, H],
  ] as const) {
    if (Math.abs(q) < 1e-12) continue
    let u0 = (lo - p) / q
    let u1 = (hi - p) / q
    if (u0 > u1) [u0, u1] = [u1, u0]
    t0 = Math.max(t0, u0)
    t1 = Math.min(t1, u1)
  }
  return [
    [a[0] + d[0] * t0, a[1] + d[1] * t0],
    [a[0] + d[0] * t1, a[1] + d[1] * t1],
  ] as [[number, number], [number, number]]
}

// Epipolar line on photo 2: the ray from camera 1 seen by camera 2.
const qa = project(cam2, ray1(1.3))
const qb = project(cam2, ray1(30))
export const line2img = clip([qa.x, qa.y], [qb.x, qb.y])
export const line2: [V3, V3] = [toWorld(cam2, ...line2img[0]), toWorld(cam2, ...line2img[1])]
// Where p2 sits along that line, 0..1.
export const uTrue = (() => {
  const [a, b] = line2img
  const d = [b[0] - a[0], b[1] - a[1]]
  return ((p2img.x - a[0]) * d[0] + (p2img.y - a[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1])
})()
export const linePoint = (u: number): [number, number] => {
  const [a, b] = line2img
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]
}
/** How different the patch at position u looks from the patch around p1 (0 = identical). */
export const difference = (u: number) =>
  Math.max(0.03, 1 - 0.95 * Math.exp(-(((u - uTrue) / 0.07) ** 2)) + 0.07 * Math.sin(u * 41) + 0.05 * Math.sin(u * 17 + 1))

// ---------- timeline ----------
export interface Step {
  title: string
  caption: string
  start: number
  end: number
  view: { pos: V3; target: V3 }
}

export const STEPS: Step[] = [
  {
    title: 'Two cameras',
    caption: 'Two cameras, O1 and O2, look at the same point P. In front of each camera floats its photo.',
    start: 0, end: 4.5,
    view: { pos: [3.0, 3.0, -4.6], target: [0, 0.3, 2.0] },
  },
  {
    title: 'Pixel p1',
    caption: 'Light from P travels to camera 1. Where it crosses photo 1 is the pixel p1.',
    start: 4.5, end: 9,
    view: { pos: [4.2, 2.2, -2.4], target: [0.6, 0.4, 1.6] },
  },
  {
    title: 'Depth unknown',
    caption: 'But a photo has no depth. Camera 1 only knows p1, so P could be at any of these “?” points: each one is a possible depth.',
    start: 9, end: 13.5,
    view: { pos: [7.4, 4.6, -2.4], target: [0, 0.7, 3.4] },
  },
  {
    title: 'Epipolar plane',
    caption: 'We do know O1, O2 and p1. Three points make a plane: the epipolar plane. Every possible P is on it.',
    start: 13.5, end: 19.5,
    view: { pos: [2.0, 8.0, -4.8], target: [0, 0.4, 3.0] },
  },
  {
    title: 'Epipolar line',
    caption: 'Where the plane passes through photo 2, it leaves a line: the epipolar line. Camera 2 sees every “?” on that line, so p2 must be on it.',
    start: 19.5, end: 27,
    view: { pos: [-4.6, 2.6, -1.6], target: [-0.6, 0.4, 2.0] },
  },
  {
    title: 'Matching',
    caption: 'Slide along the line and compare each spot with the patch around p1. The most similar spot is p2.',
    start: 27, end: 34,
    view: { pos: [-3.6, 1.4, -2.8], target: [-0.9, 0.2, 0.6] },
  },
  {
    title: 'Depth found',
    caption: 'Now draw a ray from camera 2 through p2. Where the two rays meet is P, so we know its depth.',
    start: 34, end: 39.5,
    view: { pos: [3.4, 3.6, -5.0], target: [0, 0.4, 2.4] },
  },
]
export const TOTAL = STEPS[STEPS.length - 1].end

export const smooth = (k: number) => k * k * (3 - 2 * k)
/** 0 before `at`, 1 after `at + dur`, smooth in between. */
export const ramp = (t: number, at: number, dur = 0.7) => smooth(Math.min(1, Math.max(0, (t - at) / dur)))
export const stepAt = (t: number) => {
  for (let i = STEPS.length - 1; i >= 0; i--) if (t >= STEPS[i].start) return i
  return 0
}
