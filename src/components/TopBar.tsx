import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../data/products'
import { cartCount, useStore } from '../store'
import { BagIcon } from './icons'

export function TopBar() {
  const count = useStore((s) => cartCount(s.cart))
  const setCartOpen = useStore((s) => s.setCartOpen)
  const goTo = useStore((s) => s.goTo)
  const [bump, setBump] = useState(false)
  const prev = useRef(count)

  useEffect(() => {
    if (count > prev.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 450)
      prev.current = count
      return () => clearTimeout(t)
    }
    prev.current = count
  }, [count])

  return (
    <header className="topbar">
      <button className="brand" onClick={() => goTo('all')} aria-label={`${BRAND.name} — back to overview`}>
        <span className="brand-mark" aria-hidden>CZ</span>
        <span className="brand-text">
          <strong>{BRAND.name}</strong>
          <small>Virtual Store · Demo</small>
        </span>
      </button>
      <button className={`icon-btn cart-btn ${bump ? 'bump' : ''}`} onClick={() => setCartOpen(true)} aria-label={`Open bag, ${count} items`}>
        <BagIcon />
        {count > 0 && <span className="badge">{count}</span>}
      </button>
    </header>
  )
}
