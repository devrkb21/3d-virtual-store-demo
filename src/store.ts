import { create } from 'zustand'
import { PRODUCTS, productById, type SectionId } from './data/products'

export type View = 'all' | SectionId

export interface CartLine {
  key: string
  productId: string
  colorIndex: number
  size: string
  qty: number
}

interface StoreState {
  ready: boolean
  view: View
  focusedId: string | null
  hoveredId: string | null
  /** Selected colour per product; the 3D item re-skins to match. */
  colorById: Record<string, number>
  cart: CartLine[]
  cartOpen: boolean
  checkoutOpen: boolean
  setReady: () => void
  goTo: (view: View) => void
  focus: (id: string | null) => void
  step: (dir: 1 | -1) => void
  hover: (id: string | null) => void
  setColor: (id: string, index: number) => void
  addToCart: (productId: string, size: string, qty: number) => void
  setQty: (key: string, qty: number) => void
  removeLine: (key: string) => void
  clearCart: () => void
  setCartOpen: (open: boolean) => void
  setCheckoutOpen: (open: boolean) => void
}

const CART_KEY = 'cz-studio-cart'

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const lines = raw ? (JSON.parse(raw) as CartLine[]) : []
    return lines.filter((l) => productById(l.productId))
  } catch {
    return []
  }
}

function saveCart(cart: CartLine[]) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* storage unavailable */ }
}

export const useStore = create<StoreState>((set, get) => ({
  ready: false,
  view: 'all',
  focusedId: null,
  hoveredId: null,
  colorById: {},
  cart: loadCart(),
  cartOpen: false,
  checkoutOpen: false,

  setReady: () => set({ ready: true }),
  goTo: (view) => set({ view, focusedId: null }),
  focus: (id) => {
    if (!id) return set({ focusedId: null })
    const p = productById(id)
    if (p) set({ focusedId: id, view: p.section, cartOpen: false })
  },
  step: (dir) => {
    const { focusedId } = get()
    const p = focusedId && productById(focusedId)
    if (!p) return
    const list = PRODUCTS.filter((x) => x.section === p.section)
    const i = list.findIndex((x) => x.id === p.id)
    set({ focusedId: list[(i + dir + list.length) % list.length].id })
  },
  hover: (id) => set({ hoveredId: id }),
  setColor: (id, index) => set((s) => ({ colorById: { ...s.colorById, [id]: index } })),

  addToCart: (productId, size, qty) => {
    const colorIndex = get().colorById[productId] ?? 0
    const key = `${productId}|${colorIndex}|${size}`
    const cart = [...get().cart]
    const existing = cart.find((l) => l.key === key)
    if (existing) existing.qty = Math.min(existing.qty + qty, 10)
    else cart.push({ key, productId, colorIndex, size, qty })
    saveCart(cart)
    set({ cart })
  },
  setQty: (key, qty) => {
    const cart = get().cart.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, 10)) } : l))
    saveCart(cart)
    set({ cart })
  },
  removeLine: (key) => {
    const cart = get().cart.filter((l) => l.key !== key)
    saveCart(cart)
    set({ cart })
  },
  clearCart: () => {
    saveCart([])
    set({ cart: [] })
  },
  setCartOpen: (cartOpen) => set({ cartOpen, ...(cartOpen ? { focusedId: null } : {}) }),
  setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen }),
}))

export const cartCount = (cart: CartLine[]) => cart.reduce((n, l) => n + l.qty, 0)
export const cartSubtotal = (cart: CartLine[]) =>
  cart.reduce((sum, l) => sum + (productById(l.productId)?.price ?? 0) * l.qty, 0)
