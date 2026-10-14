import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export type V3 = [number, number, number]

export interface Epipolar3DProps {
  O1: V3
  O2: V3
  P: V3
  rayEnd: V3
  p1: V3
  p2: V3 | null
  e1: V3 | null
  e2: V3 | null
  plane1: V3[]
  plane2: V3[]
  line1: [V3, V3] | null
  line2: [V3, V3] | null
  trace: V3[]
}

const RED = '#ff3b30'

/** A flat polygon (image plane or epipolar plane) from its corner points. */
function Poly({ pts, color, opacity }: { pts: V3[]; color: string; opacity: number }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3))
    g.setIndex(pts.length === 3 ? [0, 1, 2] : [0, 1, 2, 0, 2, 3])
    g.computeVertexNormals()
    return g
  }, [pts])
  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function Dot({ at, color, r = 0.06 }: { at: V3; color: string; r?: number }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[r, 24, 24]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function Label({ at, children, dy = -18 }: { at: V3; children: string; dy?: number }) {
  return (
    <Html position={at} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <span className="l3d" style={{ transform: `translateY(${dy}px)` }}>{children}</span>
    </Html>
  )
}

/** Rotatable 3D view of the two cameras, the ray, P and the epipolar plane. Drag to turn it. */
export default function Epipolar3D(input: Epipolar3DProps) {
  // Our cameras look along +z; flip x so camera 1 shows on the left when viewed from behind, as in the book.
  const m = (v: V3): V3 => [-v[0], v[1], v[2]]
  const ms = (vs: V3[]) => vs.map(m)
  const p = {
    ...input,
    O1: m(input.O1), O2: m(input.O2), P: m(input.P), rayEnd: m(input.rayEnd), p1: m(input.p1),
    p2: input.p2 && m(input.p2), e1: input.e1 && m(input.e1), e2: input.e2 && m(input.e2),
    plane1: ms(input.plane1), plane2: ms(input.plane2),
    line1: input.line1 && (ms(input.line1) as [V3, V3]), line2: input.line2 && (ms(input.line2) as [V3, V3]),
    trace: ms(input.trace),
  }
  return (
    <Canvas camera={{ position: [0.4, 4.4, -3.6], fov: 45 }} dpr={[1, 2]}>
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
      <OrbitControls target={[0, 0.2, 1.7]} enablePan={false} minDistance={4} maxDistance={14} />

      {/* image planes */}
      <Poly pts={p.plane1} color="#e5e5ea" opacity={0.55} />
      <Poly pts={p.plane2} color="#e5e5ea" opacity={0.55} />
      <Line points={[...p.plane1, p.plane1[0]]} color="#8e8e93" lineWidth={1.2} />
      <Line points={[...p.plane2, p.plane2[0]]} color="#8e8e93" lineWidth={1.2} />
      {/* camera outlines: pinhole to the photo's corners */}
      {[...p.plane1.map((c) => [p.O1, c]), ...p.plane2.map((c) => [p.O2, c])].map((seg, i) => (
        <Line key={i} points={seg as [V3, V3]} color="#aeaeb2" lineWidth={1} />
      ))}
      {/* epipolar plane */}
      <Poly pts={[p.O1, p.P, p.O2]} color="#ffcc00" opacity={0.32} />
      {/* baseline */}
      <Line points={[p.O1, p.O2]} color="#1c1c1e" lineWidth={1.6} dashed dashSize={0.12} gapSize={0.08} />
      {/* rays */}
      <Line points={[p.O1, p.rayEnd]} color={RED} lineWidth={3} />
      <Line points={[p.O2, p.P]} color={RED} lineWidth={1.6} />
      {/* epipolar lines on the image planes */}
      {p.line1 && <Line points={p.line1} color={RED} lineWidth={1.4} dashed dashSize={0.06} gapSize={0.05} transparent opacity={0.5} />}
      {p.line2 && <Line points={p.line2} color={RED} lineWidth={1.4} dashed dashSize={0.06} gapSize={0.05} transparent opacity={0.5} />}
      {p.trace.length > 1 && <Line points={p.trace} color={RED} lineWidth={4} />}
      {/* points */}
      <Dot at={p.O1} color="#1c1c1e" r={0.09} />
      <Dot at={p.O2} color="#1c1c1e" r={0.09} />
      <Dot at={p.P} color="#5ac8fa" r={0.1} />
      <Dot at={p.p1} color={RED} />
      {p.p2 && <Dot at={p.p2} color={RED} />}
      {p.e1 && <Dot at={p.e1} color="#1c1c1e" r={0.05} />}
      {p.e2 && <Dot at={p.e2} color="#1c1c1e" r={0.05} />}
      <Label at={p.O1} dy={20}>O1 · camera 1</Label>
      <Label at={p.O2} dy={20}>O2 · camera 2</Label>
      <Label at={p.P}>P</Label>
      <Label at={p.p1}>p1</Label>
      {p.p2 && <Label at={p.p2}>p2</Label>}
      {p.e1 && <Label at={p.e1} dy={16}>e1</Label>}
      {p.e2 && <Label at={p.e2} dy={16}>e2</Label>}
      <Label at={[(p.O1[0] + p.O2[0]) / 2, -0.05, (p.O1[2] + p.O2[2]) / 2]} dy={16}>baseline</Label>
    </Canvas>
  )
}
