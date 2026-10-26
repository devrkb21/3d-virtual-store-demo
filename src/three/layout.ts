// Room geometry and where each section's products sit. Camera framing for
// sections and products is computed from these numbers, so the room adapts
// to any screen shape.
import * as THREE from 'three'
import { PRODUCTS, type Product, type SectionId } from '../data/products'
import type { View } from '../store'

export const ROOM = { halfW: 16, halfD: 10, height: 7 }

const UP = new THREE.Vector3(0, 1, 0)

export interface Frame {
  center: THREE.Vector3
  /** Direction from the display towards the viewer. */
  normal: THREE.Vector3
  width: number
  height: number
}

interface SectionLayout extends Frame {
  /** Items per row/shelf. */
  cols: number
  /** Product plane size in metres. */
  itemSize: number
  colGap: number
  /** Height of the base of each row (shelf top or rail). */
  rowY: (row: number) => number
  /** Plane-centre offset above the row base (for hanging items it is negative). */
  itemLift: number
  /** Distance in front of the wall. */
  inset: number
}

export const SECTION_LAYOUT: Record<SectionId, SectionLayout> = {
  clothing: {
    center: new THREE.Vector3(-10, 2.6, -ROOM.halfD), normal: new THREE.Vector3(0, 0, 1),
    width: 8.6, height: 4.4,
    cols: 6, itemSize: 1.6, colGap: 1.26, rowY: () => 3.4, itemLift: -0.72, inset: 0.7,
  },
  shoes: {
    center: new THREE.Vector3(10, 2.4, -ROOM.halfD), normal: new THREE.Vector3(0, 0, 1),
    width: 5.4, height: 4.6,
    cols: 2, itemSize: 1.25, colGap: 1.75, rowY: (r) => 3.25 - r * 1.05, itemLift: 0.4, inset: 0.38,
  },
  caps: {
    center: new THREE.Vector3(-ROOM.halfW, 2.5, -3), normal: new THREE.Vector3(1, 0, 0),
    width: 5.6, height: 3.8,
    cols: 3, itemSize: 1.1, colGap: 1.35, rowY: (r) => 3.05 - r * 1.25, itemLift: 0, inset: 0.18,
  },
  bags: {
    center: new THREE.Vector3(ROOM.halfW, 2.2, -3), normal: new THREE.Vector3(-1, 0, 0),
    width: 6, height: 4,
    cols: 3, itemSize: 1.25, colGap: 1.6, rowY: (r) => 2.5 - r * 1.45, itemLift: 0.5, inset: 0.42,
  },
}

export const ALL_VIEW: Frame = {
  center: new THREE.Vector3(0, 2.5, -4),
  normal: new THREE.Vector3(0, 0.1, 1).normalize(),
  width: 31,
  height: 8,
}

export const rightOf = (normal: THREE.Vector3) => new THREE.Vector3().crossVectors(UP, normal).normalize()

export interface Placement {
  product: Product
  position: THREE.Vector3
  rotationY: number
  size: number
  row: number
  col: number
}

export function sectionRows(section: SectionId) {
  const n = PRODUCTS.filter((p) => p.section === section).length
  return Math.ceil(n / SECTION_LAYOUT[section].cols)
}

/** Places every product in its section's grid, left to right as seen by the shopper. */
export const PLACEMENTS: Placement[] = (Object.keys(SECTION_LAYOUT) as SectionId[]).flatMap((section) => {
  const L = SECTION_LAYOUT[section]
  const right = rightOf(L.normal)
  const items = PRODUCTS.filter((p) => p.section === section)
  return items.map((product, i) => {
    const row = Math.floor(i / L.cols)
    const col = i % L.cols
    const inRow = Math.min(L.cols, items.length - row * L.cols)
    const offset = (col - (inRow - 1) / 2) * L.colGap
    const position = L.center.clone()
      .addScaledVector(right, offset)
      .addScaledVector(L.normal, L.inset + (section === 'clothing' ? (i % 2) * 0.04 : 0))
    position.y = L.rowY(row) + L.itemLift
    return { product, position, rotationY: Math.atan2(L.normal.x, L.normal.z), size: L.itemSize, row, col }
  })
})

export const placementOf = (id: string) => PLACEMENTS.find((p) => p.product.id === id)

export interface Insets { top: number; right: number; bottom: number }

/**
 * Camera pose that fits `frame` inside the part of the screen not covered by
 * UI (insets, in px), looking straight along the frame normal.
 */
export function fitFrame(frame: Frame, fovDeg: number, vw: number, vh: number, insets: Insets, margin = 1.12, maxDist = 24) {
  const tanH = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)
  const aspect = vw / vh
  const fw = Math.max(0.2, (vw - insets.right) / vw)
  const fh = Math.max(0.2, (vh - insets.top - insets.bottom) / vh)
  let d = Math.max((frame.height * margin) / (2 * tanH * fh), (frame.width * margin) / (2 * tanH * aspect * fw))
  d = Math.min(d, maxDist)

  const visH = 2 * d * tanH
  const visW = visH * aspect
  const right = rightOf(frame.normal)
  const up = new THREE.Vector3().crossVectors(frame.normal, right).normalize()
  const shift = new THREE.Vector3()
    .addScaledVector(right, (insets.right / 2 / vw) * visW)
    .addScaledVector(up, ((insets.top - insets.bottom) / 2 / vh) * visH)

  const target = frame.center.clone().add(shift)
  const position = target.clone().addScaledVector(frame.normal, d)
  return { position, target }
}

export function frameForView(view: View): Frame {
  if (view === 'all') return ALL_VIEW
  const L = SECTION_LAYOUT[view]
  return L
}

export function frameForProduct(id: string): Frame | null {
  const pl = placementOf(id)
  if (!pl) return null
  const L = SECTION_LAYOUT[pl.product.section]
  return { center: pl.position.clone(), normal: L.normal, width: pl.size * 1.05, height: pl.size * 1.05 }
}
