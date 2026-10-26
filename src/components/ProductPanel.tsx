import { useEffect, useRef, useState } from 'react'
import { formatPrice, productById, productsInSection, SECTIONS } from '../data/products'
import { useStore } from '../store'
import { CheckIcon, ChevronLeft, ChevronRight, CloseIcon } from './icons'

export function ProductPanel() {
  const focusedId = useStore((s) => s.focusedId)
  const focus = useStore((s) => s.focus)
  const step = useStore((s) => s.step)
  const colorById = useStore((s) => s.colorById)
  const setColor = useStore((s) => s.setColor)
  const addToCart = useStore((s) => s.addToCart)
  const setCartOpen = useStore((s) => s.setCartOpen)

  // Keep showing the last product while the panel animates out.
  const [shownId, setShownId] = useState<string | null>(focusedId)
  useEffect(() => { if (focusedId) setShownId(focusedId) }, [focusedId])

  const product = shownId ? productById(shownId) : undefined
  const [size, setSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [needSize, setNeedSize] = useState(false)
  const addedTimer = useRef<number>()

  useEffect(() => {
    setSize(product && product.sizes.length === 1 ? product.sizes[0] : null)
    setQty(1)
    setAdded(false)
    setNeedSize(false)
  }, [product])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!useStore.getState().focusedId) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') focus(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, step])

  useEffect(() => () => window.clearTimeout(addedTimer.current), [])

  if (!product) return null
  const list = productsInSection(product.section)
  const index = list.findIndex((p) => p.id === product.id)
  const colorIndex = colorById[product.id] ?? 0
  const color = product.colors[colorIndex]
  const sectionLabel = SECTIONS.find((s) => s.id === product.section)?.label

  const onAdd = () => {
    if (!size) {
      setNeedSize(false)
      requestAnimationFrame(() => setNeedSize(true))
      return
    }
    addToCart(product.id, size, qty)
    setAdded(true)
    window.clearTimeout(addedTimer.current)
    addedTimer.current = window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <aside className={`panel ${focusedId ? 'open' : ''}`} aria-hidden={!focusedId} aria-label={`${product.name} details`}>
      <div className="grabber" aria-hidden />
      <div className="panel-head">
        <span className="eyebrow">{sectionLabel} · {index + 1} / {list.length}</span>
        <div className="panel-nav">
          <button className="icon-btn sm" onClick={() => step(-1)} aria-label="Previous item"><ChevronLeft /></button>
          <button className="icon-btn sm" onClick={() => step(1)} aria-label="Next item"><ChevronRight /></button>
          <button className="icon-btn sm" onClick={() => focus(null)} aria-label="Close"><CloseIcon /></button>
        </div>
      </div>

      <div className="panel-body">
        <div className="title-row">
          <h2>{product.name}</h2>
          {product.badge && <span className="tag">{product.badge}</span>}
        </div>
        <div className="price">
          <strong>{formatPrice(product.price)}</strong>
          {product.comparePrice && <s>{formatPrice(product.comparePrice)}</s>}
        </div>
        <p className="desc">{product.description}</p>

        <div className="field">
          <div className="field-label">Colour <span>{color.name}</span></div>
          <div className="swatches">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                className={`swatch ${i === colorIndex ? 'active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setColor(product.id, i)}
                aria-label={c.name}
                aria-pressed={i === colorIndex}
              />
            ))}
          </div>
        </div>

        <div className={`field ${needSize ? 'shake' : ''}`}>
          <div className="field-label">
            Size {needSize && !size && <em>Please choose a size</em>}
          </div>
          <div className="sizes">
            {product.sizes.map((s) => (
              <button key={s} className={`size ${size === s ? 'active' : ''}`} onClick={() => { setSize(s); setNeedSize(false) }} aria-pressed={size === s}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field row">
          <div className="field-label">Quantity</div>
          <div className="stepper">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span aria-live="polite">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>

      <div className="panel-foot">
        <button className={`cta ${added ? 'added' : ''}`} onClick={onAdd}>
          {added ? (<><CheckIcon /> Added to bag</>) : (<>Add to bag · {formatPrice(product.price * qty)}</>)}
        </button>
        <button className={`link-btn ${added ? 'show' : ''}`} onClick={() => setCartOpen(true)} tabIndex={added ? 0 : -1}>
          View bag & checkout →
        </button>
      </div>
    </aside>
  )
}
