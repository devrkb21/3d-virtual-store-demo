import { useEffect, useState, type FormEvent } from 'react'
import { formatPrice } from '../data/products'
import { cartSubtotal, useStore } from '../store'
import { deliveryFor } from './CartDrawer'
import { CheckIcon, CloseIcon } from './icons'

/** Fake checkout: validates the form, shows a confirmation and clears the bag. Nothing is sent anywhere. */
export function Checkout() {
  const open = useStore((s) => s.checkoutOpen)
  const cart = useStore((s) => s.cart)
  const setOpen = useStore((s) => s.setCheckoutOpen)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const clearCart = useStore((s) => s.clearCart)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { if (open) { setOrderId(null); setErrors({}) } }, [open])

  if (!open) return null
  const subtotal = cartSubtotal(cart)
  const total = subtotal + deliveryFor(subtotal)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const next: Record<string, string> = {}
    if (!String(data.get('name') ?? '').trim()) next.name = 'Enter your name'
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(String(data.get('phone') ?? '').replace(/[\s-]/g, ''))) next.phone = 'Enter a valid BD mobile number (01XXXXXXXXX)'
    if (String(data.get('address') ?? '').trim().length < 6) next.address = 'Enter a delivery address'
    setErrors(next)
    if (Object.keys(next).length) return
    setPlacing(true)
    setTimeout(() => {
      setPlacing(false)
      setOrderId(`CZ-${Math.floor(100000 + Math.random() * 900000)}`)
      clearCart()
    }, 900)
  }

  const close = () => {
    setOpen(false)
    if (orderId) setCartOpen(false)
  }

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="scrim on" onClick={close} />
      <div className="modal">
        <button className="icon-btn sm modal-close" onClick={close} aria-label="Close checkout"><CloseIcon /></button>
        {orderId ? (
          <div className="success">
            <div className="success-icon"><CheckIcon /></div>
            <h2>Order placed!</h2>
            <p>Order <strong>{orderId}</strong> is confirmed.</p>
            <p className="fine">This is a demo store — no payment was taken and nothing was shipped.</p>
            <button className="cta" onClick={close}>Continue shopping</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2>Checkout</h2>
            <p className="fine">Demo only — details stay in your browser.</p>
            <label>
              Full name
              <input name="name" autoComplete="name" placeholder="Your name" aria-invalid={!!errors.name} />
              {errors.name && <em>{errors.name}</em>}
            </label>
            <label>
              Mobile number
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={!!errors.phone} />
              {errors.phone && <em>{errors.phone}</em>}
            </label>
            <label>
              Delivery address
              <textarea name="address" rows={2} autoComplete="street-address" placeholder="House, road, area, city" aria-invalid={!!errors.address} />
              {errors.address && <em>{errors.address}</em>}
            </label>
            <fieldset>
              <legend>Payment</legend>
              <label className="radio"><input type="radio" name="pay" value="cod" defaultChecked /> Cash on delivery</label>
              <label className="radio"><input type="radio" name="pay" value="mobile" /> Mobile banking (demo)</label>
            </fieldset>
            <div className="totals compact">
              <div className="grand"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <button className="cta" type="submit" disabled={placing || cart.length === 0}>
              {placing ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
