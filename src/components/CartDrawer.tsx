import { useEffect } from 'react'
import { BRAND, formatPrice, productById } from '../data/products'
import { getProductImage } from '../three/textures'
import { cartCount, cartSubtotal, useStore } from '../store'
import { CloseIcon, TrashIcon } from './icons'

export function deliveryFor(subtotal: number) {
  return subtotal === 0 || subtotal >= BRAND.freeDeliveryOver ? 0 : BRAND.deliveryFee
}

export function CartDrawer() {
  const open = useStore((s) => s.cartOpen)
  const cart = useStore((s) => s.cart)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const setQty = useStore((s) => s.setQty)
  const removeLine = useStore((s) => s.removeLine)
  const setCheckoutOpen = useStore((s) => s.setCheckoutOpen)
  const goTo = useStore((s) => s.goTo)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !useStore.getState().checkoutOpen) setCartOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setCartOpen])

  const subtotal = cartSubtotal(cart)
  const delivery = deliveryFor(subtotal)
  const remaining = BRAND.freeDeliveryOver - subtotal

  return (
    <>
      <div className={`scrim ${open ? 'on' : ''}`} onClick={() => setCartOpen(false)} aria-hidden />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Shopping bag">
        <div className="drawer-head">
          <h2>Your bag <span>({cartCount(cart)})</span></h2>
          <button className="icon-btn sm" onClick={() => setCartOpen(false)} aria-label="Close bag"><CloseIcon /></button>
        </div>

        {cart.length === 0 ? (
          <div className="empty">
            <p>Your bag is empty.</p>
            <button className="cta ghost" onClick={() => { setCartOpen(false); goTo('clothing') }}>Start shopping</button>
          </div>
        ) : (
          <>
            {remaining > 0 && (
              <div className="free-note">
                Add {formatPrice(remaining)} more for free delivery
                <div className="meter"><span style={{ transform: `scaleX(${Math.min(1, subtotal / BRAND.freeDeliveryOver)})` }} /></div>
              </div>
            )}
            <ul className="lines">
              {cart.map((l) => {
                const p = productById(l.productId)!
                const c = p.colors[l.colorIndex] ?? p.colors[0]
                return (
                  <li key={l.key}>
                    <img src={getProductImage(p.kind, c)} alt="" width={72} height={72} />
                    <div className="line-info">
                      <strong>{p.name}</strong>
                      <small>{c.name} · {l.size}</small>
                      <div className="line-row">
                        <div className="stepper sm">
                          <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease quantity">−</button>
                          <span>{l.qty}</span>
                          <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase quantity">+</button>
                        </div>
                        <span className="line-price">{formatPrice(p.price * l.qty)}</span>
                      </div>
                    </div>
                    <button className="icon-btn sm ghost" onClick={() => removeLine(l.key)} aria-label={`Remove ${p.name}`}><TrashIcon /></button>
                  </li>
                )
              })}
            </ul>
            <div className="totals">
              <div><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div><span>Delivery</span><span>{delivery === 0 ? 'Free' : formatPrice(delivery)}</span></div>
              <div className="grand"><span>Total</span><span>{formatPrice(subtotal + delivery)}</span></div>
              <button className="cta" onClick={() => setCheckoutOpen(true)}>Checkout</button>
              <p className="fine">Demo store — no real payment is taken.</p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
