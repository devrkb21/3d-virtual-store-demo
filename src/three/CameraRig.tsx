import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import { useStore } from '../store'
import { fitFrame, frameForProduct, frameForView, type Insets } from './layout'

const { ACTION } = CameraControlsImpl

/** Matches the CSS breakpoint where the product panel turns into a bottom sheet. */
export const MOBILE_BREAKPOINT = 760
export const PANEL_WIDTH = 400

/** Flies the camera between sections and products; drag gives a small look-around. */
export function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const ready = useStore((s) => s.ready)
  const view = useStore((s) => s.view)
  const focusedId = useStore((s) => s.focusedId)
  const introPlayed = useRef(false)
  const moveId = useRef(0)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.wheel = ACTION.NONE
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.NONE
    c.touches.three = ACTION.NONE
    c.azimuthRotateSpeed = 0.3
    c.polarRotateSpeed = 0.3
    c.draggingSmoothTime = 0.15
  }, [])

  useEffect(() => {
    const c = ref.current
    if (!c || !ready) return
    const vw = size.width
    const vh = size.height
    const mobile = vw < MOBILE_BREAKPOINT
    const productFrame = focusedId ? frameForProduct(focusedId) : null

    let insets: Insets
    let margin: number
    if (productFrame) {
      insets = mobile ? { top: 64, right: 0, bottom: Math.round(vh * 0.5) } : { top: 72, right: PANEL_WIDTH + 24, bottom: 40 }
      margin = mobile ? 1.15 : 1.3
    } else {
      insets = { top: 72, right: 0, bottom: 96 }
      margin = view === 'all' ? 1 : 1.16
    }
    const frame = productFrame ?? frameForView(view)
    const { position: p, target: t } = fitFrame(frame, camera.fov, vw, vh, insets, margin)

    // Free the angle limits while flying; re-apply around the new pose on arrival.
    c.minAzimuthAngle = -Infinity
    c.maxAzimuthAngle = Infinity
    c.minPolarAngle = 0
    c.maxPolarAngle = Math.PI
    const id = ++moveId.current

    if (!introPlayed.current) {
      introPlayed.current = true
      c.smoothTime = 1.15
      c.setLookAt(p.x * 0.4, p.y + 3.5, p.z + 9, t.x, t.y + 1, t.z, false)
    } else {
      c.smoothTime = 0.55
    }
    c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, true).then(() => {
      if (id !== moveId.current) return
      c.smoothTime = 0.55
      const dir = p.clone().sub(t).normalize()
      const az = Math.atan2(dir.x, dir.z)
      const pol = Math.acos(dir.y)
      const range = productFrame ? 0.35 : 0.25
      c.minAzimuthAngle = az - range
      c.maxAzimuthAngle = az + range
      c.minPolarAngle = pol - 0.18
      c.maxPolarAngle = Math.min(pol + 0.18, Math.PI / 2 + 0.2)
    })
  }, [ready, view, focusedId, size.width, size.height, camera])

  return <CameraControls ref={ref} makeDefault />
}
