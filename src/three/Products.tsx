import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { PLACEMENTS, SECTION_LAYOUT, type Placement } from './layout'
import { getProductTexture } from './textures'

export function Products() {
  return (
    <>
      {PLACEMENTS.map((pl) => <ProductItem key={pl.product.id} pl={pl} />)}
    </>
  )
}

const noRaycast = () => null
/** Pointer movement (px) above which a press counts as a drag, not a click. */
export const DRAG_PX = 6

function ProductItem({ pl }: { pl: Placement }) {
  const { product, position, rotationY, size } = pl
  const id = product.id
  const group = useRef<THREE.Group>(null)
  const colorIndex = useStore((s) => s.colorById[id] ?? 0)
  const focusedId = useStore((s) => s.focusedId)
  const hovered = useStore((s) => s.hoveredId === id)
  const hover = useStore((s) => s.hover)
  const focus = useStore((s) => s.focus)
  const focused = focusedId === id
  useCursor(hovered)

  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.04, toneMapped: false }),
    [],
  )
  useEffect(() => {
    material.map = getProductTexture(product.kind, product.colors[colorIndex] ?? product.colors[0])
    material.needsUpdate = true
  }, [material, product, colorIndex])

  const normal = SECTION_LAYOUT[product.section].normal
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    const targetOpacity = focusedId && !focused ? 0.2 : 1
    material.opacity = THREE.MathUtils.damp(material.opacity, targetOpacity, 7, d)
    const s = THREE.MathUtils.damp(g.scale.x, focused ? 1.04 : hovered ? 1.07 : 1, 10, d)
    g.scale.setScalar(s)
    tmp.copy(position).addScaledVector(normal, focused ? 0.1 : hovered ? 0.05 : 0)
    g.position.lerp(tmp, 1 - Math.exp(-10 * d))
  })

  const hitW = size * 0.66
  const hitH = product.section === 'shoes' ? size * 0.5 : size * 0.74

  return (
    <group ref={group} position={position} rotation-y={rotationY}>
      <mesh material={material} raycast={noRaycast}>
        <planeGeometry args={[size, size]} />
      </mesh>
      {/* invisible, tighter hit area so overlapping transparent edges don't steal clicks */}
      <mesh
        position={[0, product.section === 'shoes' ? -size * 0.08 : 0, 0.01]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); hover(id) }}
        onPointerOut={() => { if (useStore.getState().hoveredId === id) hover(null) }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (e.delta > DRAG_PX) return
          focus(id)
        }}
      >
        <planeGeometry args={[hitW, hitH]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}
