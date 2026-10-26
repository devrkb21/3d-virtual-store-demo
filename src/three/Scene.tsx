import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from '../store'
import { CameraRig } from './CameraRig'
import { Products, DRAG_PX } from './Products'
import { Room } from './Room'

const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export default function Scene() {
  const down = useRef({ x: 0, y: 0 })
  return (
    <Canvas
      className="scene"
      flat
      dpr={[1, isMobile ? 1.5 : 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 50, near: 0.1, far: 120, position: [0, 6, 24] }}
      onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY } }}
      onPointerMissed={(e) => {
        const moved = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y)
        if (moved < DRAG_PX && useStore.getState().focusedId) useStore.getState().focus(null)
      }}
      onCreated={() => {
        // Let two frames render before revealing the room and starting the intro.
        requestAnimationFrame(() => requestAnimationFrame(() => useStore.getState().setReady()))
      }}
    >
      <color attach="background" args={['#d6d4cf']} />
      <ambientLight intensity={1.5} />
      <hemisphereLight args={['#ffffff', '#b89a78', 0.9]} />
      <directionalLight position={[4, 9, 6]} intensity={1.1} />
      <Room />
      <Products />
      <CameraRig />
    </Canvas>
  )
}
