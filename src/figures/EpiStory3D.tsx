import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, Grid, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  STEPS, cam1, cam2, ghosts, ghostsOnPhoto2, lerp3, line2, p1, p2, photo1, photo2, P, ramp, ray1, ray2Far, rayFar, sheet, sheetSeed,
  type V3,
} from './epiStory'

const RED = '#ff3b30'
const BLUE = '#007aff'
const GREEN = '#34c759'
const INK = '#1c1c1e'

function Poly({ pts, color, opacity, solid = false }: { pts: V3[]; color: string; opacity: number; solid?: boolean }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3))
    g.setIndex(pts.length === 3 ? [0, 1, 2] : [0, 1, 2, 0, 2, 3])
    return g
  }, [pts])
  if (opacity <= 0.001) return null
  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={color} transparent={!solid || opacity < 0.99} opacity={opacity} side={THREE.DoubleSide} depthWrite={solid} />
    </mesh>
  )
}

function Seg({ a, b, k = 1, color, width = 2, opacity = 1, dashed = false, depthTest = true }: { a: V3; b: V3; k?: number; color: string; width?: number; opacity?: number; dashed?: boolean; depthTest?: boolean }) {
  if (k <= 0.001 || opacity <= 0.001) return null
  return (
    <Line points={[a, lerp3(a, b, k)]} color={color} lineWidth={width} transparent opacity={opacity} dashed={dashed} dashSize={0.12} gapSize={0.08} depthTest={depthTest} renderOrder={depthTest ? 0 : 5} />
  )
}

function Dot({ at, color, r = 0.06, opacity = 1, scale = 1, onTop = false }: { at: V3; color: string; r?: number; opacity?: number; scale?: number; onTop?: boolean }) {
  if (opacity <= 0.001) return null
  return (
    <mesh position={at} scale={scale} renderOrder={onTop ? 6 : 0}>
      <sphereGeometry args={[r, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={!onTop} />
    </mesh>
  )
}

function Label({ at, text, opacity, dy = -18, tone }: { at: V3; text: string; opacity: number; dy?: number; tone?: 'red' | 'green' | 'blue' }) {
  if (opacity <= 0.01) return null
  return (
    <Html position={at} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <span className={'l3d' + (tone ? ` l3d-${tone}` : '')} style={{ opacity, transform: `translateY(${dy}px)` }}>{text}</span>
    </Html>
  )
}

function Camera({ O, photo, opacity, label, highlight, glow = 0 }: { O: V3; photo: V3[]; opacity: number; label: string; highlight: number; glow?: number }) {
  return (
    <group>
      <Poly pts={photo} color="#ececf0" opacity={opacity} solid />
      <Line points={[...photo, photo[0]]} color={glow > 0.05 ? BLUE : '#8e8e93'} lineWidth={1.3 + 2.5 * glow} transparent opacity={opacity} />
      {photo.map((c, i) => (
        <Line key={i} points={[O, c]} color="#aeaeb2" lineWidth={1} transparent opacity={opacity} />
      ))}
      <Dot at={O} color={INK} r={0.09} opacity={opacity} scale={1 + 0.6 * highlight} />
      <Label at={O} text={label} opacity={opacity} dy={22} />
    </group>
  )
}

/** Moves the view smoothly to each step's viewpoint. */
function ViewDirector({ step }: { step: number }) {
  const ref = useRef<CameraControls>(null)
  useEffect(() => {
    const v = STEPS[step].view
    ref.current?.setLookAt(...v.pos, ...v.target, true)
  }, [step])
  return <CameraControls ref={ref} smoothTime={0.9} minDistance={2.5} maxDistance={16} />
}

export default function EpiStory3D({ t, step }: { t: number; step: number }) {
  const s0 = STEPS[0].start
  const [, s1, s2, s3, s4, s5, s6] = STEPS.map((s) => s.start)

  // step 1: cameras only
  const camOp = ramp(t, s0 + 0.2, 0.9)
  // step 2: we see p1 on photo 1 (it pulses once)
  const p1Op = ramp(t, s1 + 0.5, 0.4)
  const p1Pulse = ramp(t, s1 + 0.5, 0.4) * (1 - ramp(t, s1 + 1.3, 0.8))
  // step 3: the ray from camera 1 through p1, and the "?" candidates
  const rayK = ramp(t, s2 + 0.4, 1.6)
  const ghostOp = (i: number) => ramp(t, s2 + 1.8 + i * 0.25, 0.4) * (1 - ramp(t, s5 - 0.6, 0.6))
  // step 4: highlight the three known points, baseline, plane
  const hl = ramp(t, s3 + 0.2, 0.4) * (1 - ramp(t, s3 + 1.6, 0.6))
  const baseK = ramp(t, s3 + 0.6, 1.0)
  const seedOp = ramp(t, s3 + 1.6, 0.6) * (1 - ramp(t, s3 + 3, 0.8))
  const sheetOp = ramp(t, s3 + 2.6, 1.2) * (1 - 0.8 * ramp(t, s4 + 5.2, 1))
  // step 5: the plane cuts photo 2 → line; then each "?" is seen by camera 2 on that line
  const glow = ramp(t, s4 + 0.2, 0.4) * (1 - ramp(t, s4 + 2.6, 0.6))
  const lineK = ramp(t, s4 + 0.9, 1.6)
  const sightK = (i: number) => ramp(t, s4 + 2.8 + i * 0.35, 0.7)
  const sightOp = 1 - ramp(t, s5 - 0.6, 0.6)
  // step 6: matching → p2 appears
  const p2Op = ramp(t, s5 + 5.3, 0.4)
  // step 7: second ray, P found
  const ray2K = ramp(t, s6 + 0.5, 1.5)
  const pFound = ramp(t, s6 + 2.1, 0.5)

  const rayFarOp = 1 - 0.55 * ramp(t, s4 + 5.2, 1)

  return (
    <Canvas camera={{ position: STEPS[0].view.pos, fov: 42 }} dpr={[1, 2]}>
      {/* ground: a soft grid under the cameras that fades into the distance */}
      <Grid
        position={[0, -1.1, 3]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#c7c7cc"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#aeaeb2"
        fadeDistance={22}
        fadeStrength={1.6}
        infiniteGrid
      />
      <ViewDirector step={step} />
      <Camera O={cam1.O} photo={photo1} opacity={camOp} label="O1 · camera 1" highlight={hl} />
      <Camera O={cam2.O} photo={photo2} opacity={camOp} label="O2 · camera 2" highlight={hl} glow={glow} />

      {/* the epipolar plane: grows out of the triangle O1–p1–O2 */}
      <Poly pts={sheetSeed} color="#ffcc00" opacity={0.55 * seedOp} />
      <Poly pts={sheet} color="#ffcc00" opacity={0.3 * sheetOp} />
      <Label at={lerp3(sheet[2], sheet[3], 0.5)} text="epipolar plane" opacity={sheetOp * (1 - ramp(t, s4 + 5.2))} dy={-6} />

      {/* baseline */}
      <Seg a={cam1.O} b={cam2.O} k={baseK} color={INK} width={1.8} dashed />
      <Label at={lerp3(cam1.O, cam2.O, 0.5)} text="baseline" opacity={baseK * (1 - ramp(t, s5))} dy={16} />

      {/* the ray from camera 1 through p1 */}
      <Seg a={cam1.O} b={rayFar} k={rayK} color={RED} width={3} opacity={rayFarOp} />
      <Label at={ray1(7)} text="ray through p1" opacity={rayK * (1 - ramp(t, s3))} dy={-6} tone="red" />

      {/* candidates for P along the ray */}
      {ghosts.map((g, i) => (
        <group key={i}>
          <Dot at={g} color="#5ac8fa" r={0.08} opacity={0.55 * ghostOp(i)} />
          <Label at={g} text="?" opacity={ghostOp(i)} dy={-16} />
        </group>
      ))}

      {/* each "?" seen by camera 2: thin sight lines, landing on the epipolar line */}
      {ghosts.map((g, i) => (
        <group key={`s${i}`}>
          <Seg a={g} b={cam2.O} k={sightK(i)} color="#5ac8fa" width={1.4} opacity={0.9 * sightOp} />
          {ghostsOnPhoto2[i].inside && (
            <Dot at={ghostsOnPhoto2[i].at} color="#0a84ff" r={0.05} onTop opacity={ramp(t, s4 + 3.3 + i * 0.35, 0.3) * sightOp} />
          )}
        </group>
      ))}

      {/* the epipolar line on photo 2: where the plane passes through it */}
      <Seg a={line2[0]} b={line2[1]} k={lineK} color={RED} width={4} depthTest={false} />
      <Label at={line2[1]} text="epipolar line" opacity={lineK * (1 - ramp(t, s6))} dy={-14} tone="red" />

      {/* second ray: camera 2 through p2 */}
      <Seg a={cam2.O} b={ray2Far} k={ray2K} color={GREEN} width={3} />

      {/* points */}
      {/* P only appears at the end, once we have found it */}
      <Dot at={P} color="#5ac8fa" r={0.11} opacity={pFound} scale={1 + 0.5 * pFound * (1 - ramp(t, s6 + 2.8, 0.6))} />
      <Label at={P} text="P · found" opacity={pFound} tone="green" />
      <Dot at={p1} color={BLUE} r={0.055} opacity={p1Op} scale={1 + 0.8 * hl + 1.4 * p1Pulse} onTop />
      <Label at={p1} text="p1" opacity={p1Op} tone="blue" />
      <Dot at={p2} color={GREEN} r={0.055} opacity={p2Op} onTop />
      <Label at={p2} text="p2" opacity={p2Op} tone="green" />
    </Canvas>
  )
}
