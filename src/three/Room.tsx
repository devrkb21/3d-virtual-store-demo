import { useMemo } from 'react'
import * as THREE from 'three'
import { SECTIONS, type SectionId } from '../data/products'
import { ROOM, SECTION_LAYOUT, sectionRows } from './layout'
import {
  getFloorTexture, getLogoTexture, getPegboardTexture, getPosterTexture, getSignTexture, getWoodTexture,
} from './textures'

const WALL = '#e6e5e1'
const { halfW, halfD, height } = ROOM

function useMaterials() {
  return useMemo(() => {
    const wood = getWoodTexture()
    return {
      wall: new THREE.MeshLambertMaterial({ color: WALL }),
      ceiling: new THREE.MeshLambertMaterial({ color: '#f2f1ee' }),
      floor: new THREE.MeshLambertMaterial({ map: getFloorTexture() }),
      wood: new THREE.MeshLambertMaterial({ map: wood }),
      darkWood: new THREE.MeshLambertMaterial({ map: wood, color: '#8a6a4a' }),
      woodPlain: new THREE.MeshLambertMaterial({ color: '#b98f63' }),
      white: new THREE.MeshLambertMaterial({ color: '#f7f7f5' }),
      metal: new THREE.MeshLambertMaterial({ color: '#2b2b2b' }),
      light: new THREE.MeshBasicMaterial({ color: '#fffdf6' }),
      peg: new THREE.MeshLambertMaterial({ map: getPegboardTexture() }),
      aoStrip: new THREE.MeshBasicMaterial({ map: gradientTexture(), transparent: true, depthWrite: false }),
      plant: new THREE.MeshLambertMaterial({ color: '#3f6b45' }),
      pot: new THREE.MeshLambertMaterial({ color: '#2f2f2f' }),
    }
  }, [])
}

/** Vertical dark-to-clear gradient used as cheap baked "contact shadow" where walls meet the floor. */
function gradientTexture() {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 64, 0, 0)
  g.addColorStop(0, 'rgba(60,50,40,0.35)')
  g.addColorStop(1, 'rgba(60,50,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Room() {
  const m = useMaterials()
  return (
    <group>
      {/* shell */}
      <mesh rotation-x={-Math.PI / 2} material={m.floor}>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={height} material={m.ceiling}>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
      </mesh>
      <mesh position={[0, height / 2, -halfD]} material={m.wall}>
        <planeGeometry args={[halfW * 2, height]} />
      </mesh>
      <mesh position={[-halfW, height / 2, 0]} rotation-y={Math.PI / 2} material={m.wall}>
        <planeGeometry args={[halfD * 2, height]} />
      </mesh>
      <mesh position={[halfW, height / 2, 0]} rotation-y={-Math.PI / 2} material={m.wall}>
        <planeGeometry args={[halfD * 2, height]} />
      </mesh>

      {/* baked-looking contact shadows along the wall bases */}
      <mesh position={[0, 0.45, -halfD + 0.01]} material={m.aoStrip}>
        <planeGeometry args={[halfW * 2, 0.9]} />
      </mesh>
      <mesh position={[-halfW + 0.01, 0.45, 0]} rotation-y={Math.PI / 2} material={m.aoStrip}>
        <planeGeometry args={[halfD * 2, 0.9]} />
      </mesh>
      <mesh position={[halfW - 0.01, 0.45, 0]} rotation-y={-Math.PI / 2} material={m.aoStrip}>
        <planeGeometry args={[halfD * 2, 0.9]} />
      </mesh>

      {/* ceiling light strips */}
      {[-7, -3.5, 0, 3.5, 7].map((z) => (
        <mesh key={z} position={[0, height - 0.03, z]} material={m.light}>
          <boxGeometry args={[halfW * 1.6, 0.04, 0.22]} />
        </mesh>
      ))}

      <LogoWall m={m} />
      <ClothingRail m={m} />
      <ShoeShelves m={m} />
      <CapPegboard m={m} />
      <BagShelves m={m} />
      {SECTIONS.map((s) => <HangingSign key={s.id} section={s.id} label={s.label} m={m} />)}

      {/* side-wall posters and decor */}
      <Poster index={2} position={[-halfW + 0.03, 3, 5]} rotationY={Math.PI / 2} />
      <Poster index={3} position={[halfW - 0.03, 3, 5]} rotationY={-Math.PI / 2} />
      <Bench m={m} />
      <Plant m={m} position={[-halfW + 0.9, 0, 2.2]} />
      <Plant m={m} position={[halfW - 0.9, 0, 2.2]} />
    </group>
  )
}

type Mats = ReturnType<typeof useMaterials>

function LogoWall({ m }: { m: Mats }) {
  const logo = useMemo(() => new THREE.MeshBasicMaterial({ map: getLogoTexture(), transparent: true }), [])
  return (
    <group position={[0, 0, -halfD]}>
      <mesh position={[0, 3.3, 0.06]} material={m.white}>
        <boxGeometry args={[7, 3.6, 0.12]} />
      </mesh>
      <mesh position={[0, 3.35, 0.13]} material={logo}>
        <planeGeometry args={[5.2, 2.6]} />
      </mesh>
      <mesh position={[0, 1.42, 0.13]} material={m.light}>
        <boxGeometry args={[6.4, 0.04, 0.04]} />
      </mesh>
      <Poster index={0} position={[-4.85, 3.2, 0.03]} />
      <Poster index={1} position={[4.85, 3.2, 0.03]} />
    </group>
  )
}

function Poster({ index, position, rotationY = 0 }: { index: number; position: [number, number, number]; rotationY?: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: getPosterTexture(index) }), [index])
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-z={0.02}>
        <boxGeometry args={[1.62, 2.14, 0.04]} />
        <meshLambertMaterial color="#1b1b1b" />
      </mesh>
      <mesh position-z={0.045} material={mat}>
        <planeGeometry args={[1.5, 2]} />
      </mesh>
    </group>
  )
}

function ClothingRail({ m }: { m: Mats }) {
  const L = SECTION_LAYOUT.clothing
  const z = L.center.z + L.inset
  const y = L.rowY(0)
  const half = L.width / 2
  return (
    <group position={[L.center.x, 0, z]}>
      <mesh position-y={y} rotation-z={Math.PI / 2} material={m.metal}>
        <cylinderGeometry args={[0.03, 0.03, half * 2, 10]} />
      </mesh>
      {[-half, half].map((x) => (
        <group key={x} position-x={x}>
          <mesh position-y={y / 2} material={m.metal}>
            <cylinderGeometry args={[0.035, 0.035, y, 8]} />
          </mesh>
          <mesh position-y={0.03} material={m.metal}>
            <boxGeometry args={[0.12, 0.06, 0.9]} />
          </mesh>
        </group>
      ))}
      {/* low wooden plinth under the rail */}
      <mesh position={[0, 0.12, 0]} material={m.wood}>
        <boxGeometry args={[half * 2 + 0.4, 0.24, 1.3]} />
      </mesh>
    </group>
  )
}

function ShoeShelves({ m }: { m: Mats }) {
  const L = SECTION_LAYOUT.shoes
  const rows = sectionRows('shoes')
  const w = L.width - 0.6
  return (
    <group position={[L.center.x, 0, L.center.z]}>
      <mesh position={[0, L.center.y, 0.03]} material={m.darkWood}>
        <boxGeometry args={[w + 0.3, L.height, 0.06]} />
      </mesh>
      {Array.from({ length: rows }, (_, r) => (
        <mesh key={r} position={[0, L.rowY(r) - 0.03, 0.34]} material={m.wood}>
          <boxGeometry args={[w, 0.06, 0.6]} />
        </mesh>
      ))}
    </group>
  )
}

function CapPegboard({ m }: { m: Mats }) {
  const L = SECTION_LAYOUT.caps
  const rows = sectionRows('caps')
  const h = rows * 1.25 + 0.5
  const midY = L.rowY(0) - ((rows - 1) * 1.25) / 2
  return (
    <group position={[L.center.x + 0.03, midY, L.center.z]} rotation-y={Math.PI / 2}>
      <mesh material={m.peg}>
        <boxGeometry args={[L.width - 0.6, h, 0.05]} />
      </mesh>
      {/* frame */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (L.width - 0.6)) / 2, 0, 0.03]} material={m.darkWood}>
          <boxGeometry args={[0.08, h + 0.08, 0.08]} />
        </mesh>
      ))}
    </group>
  )
}

function BagShelves({ m }: { m: Mats }) {
  const L = SECTION_LAYOUT.bags
  const rows = sectionRows('bags')
  const w = L.width - 0.4
  return (
    <group position={[L.center.x, 0, L.center.z]} rotation-y={-Math.PI / 2}>
      {Array.from({ length: rows }, (_, r) => (
        <mesh key={r} position={[0, L.rowY(r) - 0.04, 0.35]} material={m.wood}>
          <boxGeometry args={[w, 0.08, 0.7]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, L.rowY(0) / 2 + 0.6, 0.35]} material={m.woodPlain}>
          <boxGeometry args={[0.08, L.rowY(0) + 1.2, 0.7]} />
        </mesh>
      ))}
    </group>
  )
}

function HangingSign({ section, label, m }: { section: SectionId; label: string; m: Mats }) {
  const L = SECTION_LAYOUT[section]
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: getSignTexture(label) }), [label])
  const y = 5.45
  const pos = L.center.clone().addScaledVector(L.normal, 0.9)
  const rotY = Math.atan2(L.normal.x, L.normal.z)
  return (
    <group position={[pos.x, y, pos.z]} rotation-y={rotY}>
      <mesh material={mat}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, (height - y) / 2 + 0.15, 0]} material={m.metal}>
          <boxGeometry args={[0.012, height - y - 0.3, 0.012]} />
        </mesh>
      ))}
    </group>
  )
}

function Bench({ m }: { m: Mats }) {
  return (
    <group position={[0, 0, 1.5]}>
      <mesh position-y={0.46} material={m.wood}>
        <boxGeometry args={[3.2, 0.1, 1]} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 0.21, 0]} material={m.metal}>
          <boxGeometry args={[0.08, 0.42, 0.9]} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ m, position }: { m: Mats; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.35} material={m.pot}>
        <cylinderGeometry args={[0.32, 0.25, 0.7, 14]} />
      </mesh>
      {[[0, 1.1, 0, 0.5], [0.22, 1.45, 0.1, 0.38], [-0.2, 1.4, -0.1, 0.36], [0, 1.75, 0, 0.3]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={m.plant}>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  )
}
