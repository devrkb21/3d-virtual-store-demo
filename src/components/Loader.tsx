import { useEffect, useState } from 'react'
import { BRAND } from '../data/products'

export function Loader({ progress, done }: { progress: number; done: boolean }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(t)
  }, [done])
  if (gone) return null
  const pct = Math.round(progress * 100)
  return (
    <div className={`loader ${done ? 'done' : ''}`} role="status" aria-live="polite">
      <div className="loader-inner">
        <div className="brand-mark lg" aria-hidden>CZ</div>
        <h1>{BRAND.name}</h1>
        <p>{done ? 'Welcome in' : 'Setting up the store…'}</p>
        <div className="bar" aria-hidden>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <small>{pct}%</small>
      </div>
    </div>
  )
}
