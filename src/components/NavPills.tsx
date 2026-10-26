import { SECTIONS } from '../data/products'
import { useStore, type View } from '../store'

const ITEMS: { id: View; label: string }[] = [{ id: 'all', label: 'All' }, ...SECTIONS]

export function NavPills() {
  const view = useStore((s) => s.view)
  const focused = useStore((s) => !!s.focusedId)
  const goTo = useStore((s) => s.goTo)
  return (
    <nav className={`pills ${focused ? 'behind' : ''}`} aria-label="Store sections">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          className={`pill ${view === it.id && !focused ? 'active' : ''}`}
          aria-current={view === it.id ? 'true' : undefined}
          onClick={() => goTo(it.id)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  )
}
