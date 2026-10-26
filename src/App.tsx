import { lazy, Suspense, useEffect, useState } from 'react'
import { PRODUCTS } from './data/products'
import { prepareTextures } from './three/textures'
import { useStore } from './store'
import { Loader } from './components/Loader'
import { TopBar } from './components/TopBar'
import { NavPills } from './components/NavPills'
import { ProductPanel } from './components/ProductPanel'
import { CartDrawer } from './components/CartDrawer'
import { Checkout } from './components/Checkout'
import { Hint } from './components/Hint'

const sceneImport = import('./three/Scene')
const Scene = lazy(() => sceneImport)

export default function App() {
  const ready = useStore((s) => s.ready)
  const focused = useStore((s) => !!s.focusedId)
  const [texProgress, setTexProgress] = useState(0)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [prepared, setPrepared] = useState(false)

  useEffect(() => {
    sceneImport.then(() => setSceneLoaded(true))
    prepareTextures(PRODUCTS, setTexProgress).then(() => setPrepared(true))
  }, [])

  const progress = ready ? 1 : texProgress * 0.65 + (sceneLoaded ? 0.25 : 0) + (prepared && sceneLoaded ? 0.05 : 0)

  return (
    <>
      {prepared && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
      <div className={`vignette ${focused ? 'on' : ''}`} aria-hidden />
      {ready && (
        <>
          <TopBar />
          <NavPills />
          <ProductPanel />
          <CartDrawer />
          <Checkout />
          <Hint />
        </>
      )}
      <Loader progress={progress} done={ready} />
    </>
  )
}
