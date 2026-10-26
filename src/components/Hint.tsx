import { useEffect, useState } from 'react'
import { useStore } from '../store'

/** One-time tip that fades out after a few seconds or on first product click. */
export function Hint() {
  const focused = useStore((s) => !!s.focusedId)
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 6500)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => { if (focused) setShow(false) }, [focused])
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  return (
    <div className={`hint ${show ? '' : 'hide'}`} aria-hidden={!show}>
      {touch ? 'Tap a product to shop · Drag to look around' : 'Click a product to shop · Drag to look around'}
    </div>
  )
}
