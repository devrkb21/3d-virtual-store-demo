const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const BagIcon = () => (
  <svg {...base} aria-hidden><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
)
export const CloseIcon = () => (
  <svg {...base} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const ChevronLeft = () => (
  <svg {...base} aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
)
export const ChevronRight = () => (
  <svg {...base} aria-hidden><path d="M9 5l7 7-7 7" /></svg>
)
export const CheckIcon = () => (
  <svg {...base} aria-hidden><path d="M5 12.5l4.2 4.2L19 7" /></svg>
)
export const TrashIcon = () => (
  <svg {...base} width={18} height={18} aria-hidden><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
)
