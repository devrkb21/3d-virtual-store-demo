// All store content lives here. Edit this file to change products, prices,
// colours or sizes; the 3D room places items in their section automatically.

export type SectionId = 'clothing' | 'shoes' | 'caps' | 'bags'

export type ProductKind =
  | 'tshirt' | 'longsleeve' | 'hoodie' | 'jacket' | 'polo' | 'pants'
  | 'runner' | 'court' | 'hightop' | 'slide'
  | 'cap' | 'bucket' | 'beanie'
  | 'backpack' | 'tote' | 'duffel' | 'sling'

export interface ProductColor {
  name: string
  hex: string
  /** Detail colour (sole, trim, logo). Defaults to white. */
  accent?: string
}

export interface Product {
  id: string
  name: string
  section: SectionId
  kind: ProductKind
  price: number
  /** Optional original price to show a discount. */
  comparePrice?: number
  badge?: string
  description: string
  colors: ProductColor[]
  sizes: string[]
}

export const BRAND = {
  name: 'CZ Studio',
  tagline: 'Step inside the store',
  currency: '৳',
  deliveryFee: 80,
  freeDeliveryOver: 5000,
}

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'clothing', label: 'Clothing' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'caps', label: 'Caps' },
  { id: 'bags', label: 'Bags' },
]

const APPAREL = ['S', 'M', 'L', 'XL', 'XXL']
const SHOES = ['39', '40', '41', '42', '43', '44']
const ONE = ['One size']

export const PRODUCTS: Product[] = [
  // ── Clothing ───────────────────────────────────────────────
  {
    id: 'essential-tee', name: 'Essential Cotton Tee', section: 'clothing', kind: 'tshirt',
    price: 890, badge: 'Bestseller',
    description: '180 GSM combed cotton, relaxed fit and a soft rib collar. Built for Khulna summers.',
    colors: [
      { name: 'Ink Black', hex: '#1d1f22' },
      { name: 'Chalk', hex: '#ecebe6', accent: '#1d1f22' },
      { name: 'Clay', hex: '#c8643c' },
    ],
    sizes: APPAREL,
  },
  {
    id: 'oversized-hoodie', name: 'Oversized Fleece Hoodie', section: 'clothing', kind: 'hoodie',
    price: 2450, comparePrice: 2950, badge: 'New',
    description: 'Brushed-back fleece, dropped shoulders and a lined hood with flat drawcords.',
    colors: [
      { name: 'Heather Grey', hex: '#9da3a8', accent: '#f4f4f2' },
      { name: 'Forest', hex: '#2f5d4a' },
      { name: 'Navy', hex: '#23335a' },
    ],
    sizes: APPAREL,
  },
  {
    id: 'wind-jacket', name: 'Featherweight Wind Jacket', section: 'clothing', kind: 'jacket',
    price: 3290,
    description: 'Water-repellent ripstop shell that packs into its own pocket. Full zip, mesh lining.',
    colors: [
      { name: 'Signal Blue', hex: '#2c63d6', accent: '#f2f2f2' },
      { name: 'Sand', hex: '#cdb894', accent: '#2a2a2a' },
      { name: 'Black', hex: '#202124', accent: '#e85d2a' },
    ],
    sizes: APPAREL,
  },
  {
    id: 'pique-polo', name: 'Piqué Knit Polo', section: 'clothing', kind: 'polo',
    price: 1350,
    description: 'Breathable piqué cotton with a two-button placket and tipped collar.',
    colors: [
      { name: 'White', hex: '#f1f0ec', accent: '#23335a' },
      { name: 'Olive', hex: '#6d7244' },
      { name: 'Maroon', hex: '#6e2230' },
    ],
    sizes: APPAREL,
  },
  {
    id: 'long-sleeve', name: 'Training Long Sleeve', section: 'clothing', kind: 'longsleeve',
    price: 1190,
    description: 'Quick-dry stretch jersey with thumb loops. Light enough for evening runs.',
    colors: [
      { name: 'Volt', hex: '#c9e43c', accent: '#1d1f22' },
      { name: 'Slate', hex: '#4b5563' },
      { name: 'Rose', hex: '#e08a96' },
    ],
    sizes: APPAREL,
  },
  {
    id: 'track-pants', name: 'Tapered Track Pants', section: 'clothing', kind: 'pants',
    price: 1790,
    description: 'Tapered leg, zip pockets and side stripes. Elastic waist with a drawcord.',
    colors: [
      { name: 'Black', hex: '#1f2023', accent: '#f2f2f2' },
      { name: 'Navy', hex: '#22304f', accent: '#e9c46a' },
    ],
    sizes: APPAREL,
  },

  // ── Shoes ──────────────────────────────────────────────────
  {
    id: 'aero-runner', name: 'Aero Runner 2', section: 'shoes', kind: 'runner',
    price: 5490, comparePrice: 6200, badge: 'New',
    description: 'Engineered mesh upper on a responsive foam midsole for daily miles.',
    colors: [
      { name: 'Coral', hex: '#ef6a4c', accent: '#ffffff' },
      { name: 'Midnight', hex: '#1f2a44', accent: '#7ee0c3' },
      { name: 'Cloud', hex: '#e8e8e8', accent: '#2c63d6' },
    ],
    sizes: SHOES,
  },
  {
    id: 'court-classic', name: 'Court Classic Low', section: 'shoes', kind: 'court',
    price: 4290,
    description: 'Clean leather court shoe with a cupsole and padded collar.',
    colors: [
      { name: 'Triple White', hex: '#f4f4f1', accent: '#2f5d4a' },
      { name: 'Black Gum', hex: '#222222', accent: '#b07a45' },
    ],
    sizes: SHOES,
  },
  {
    id: 'trail-pro', name: 'Trail Pro GTX', section: 'shoes', kind: 'runner',
    price: 6990,
    description: 'Grippy lugged outsole, toe bumper and a weather-sealed upper.',
    colors: [
      { name: 'Moss', hex: '#5b6b3a', accent: '#f0a830' },
      { name: 'Stone', hex: '#9b9488', accent: '#e85d2a' },
    ],
    sizes: SHOES,
  },
  {
    id: 'canvas-hi', name: 'Canvas Hi-Top', section: 'shoes', kind: 'hightop',
    price: 2690,
    description: 'Vulcanised rubber sole, cotton canvas upper and a cushioned insole.',
    colors: [
      { name: 'Red', hex: '#c8322f', accent: '#f4f1ea' },
      { name: 'Black', hex: '#1d1d1d', accent: '#f4f1ea' },
      { name: 'Cream', hex: '#efe6d2', accent: '#1d1d1d' },
    ],
    sizes: SHOES,
  },
  {
    id: 'street-low', name: 'Street Skate Low', section: 'shoes', kind: 'court',
    price: 3490,
    description: 'Suede overlays, reinforced toe and a grippy waffle sole.',
    colors: [
      { name: 'Navy', hex: '#26365c', accent: '#f4f1ea' },
      { name: 'Tan', hex: '#c39a6b', accent: '#3a2a1a' },
    ],
    sizes: SHOES,
  },
  {
    id: 'comfort-slide', name: 'Comfort Slide', section: 'shoes', kind: 'slide',
    price: 1290,
    description: 'Contoured foam footbed and a soft padded strap. Rain-ready.',
    colors: [
      { name: 'Black', hex: '#202020', accent: '#f4f4f4' },
      { name: 'Sage', hex: '#9fb59a', accent: '#f4f4f4' },
    ],
    sizes: SHOES,
  },

  // ── Caps ───────────────────────────────────────────────────
  {
    id: 'club-cap', name: 'Club Six-Panel Cap', section: 'caps', kind: 'cap',
    price: 990, badge: 'Bestseller',
    description: 'Washed cotton twill, curved brim and an adjustable brass buckle.',
    colors: [
      { name: 'Black', hex: '#1e1f22', accent: '#ffffff' },
      { name: 'Khaki', hex: '#bba57a', accent: '#2a2a2a' },
      { name: 'Royal', hex: '#2b4fb3', accent: '#ffffff' },
    ],
    sizes: ONE,
  },
  {
    id: 'trucker-cap', name: 'Mesh Trucker Cap', section: 'caps', kind: 'cap',
    price: 850,
    description: 'Foam front, breathable mesh back and a snapback strap.',
    colors: [
      { name: 'White / Red', hex: '#f2f2f0', accent: '#c8322f' },
      { name: 'Green', hex: '#2f5d4a', accent: '#f2f2f0' },
    ],
    sizes: ONE,
  },
  {
    id: 'bucket-hat', name: 'Reversible Bucket Hat', section: 'caps', kind: 'bucket',
    price: 1150,
    description: 'Two looks in one: twill on one side, ripstop on the other.',
    colors: [
      { name: 'Sand', hex: '#d4c09a', accent: '#5b4a2f' },
      { name: 'Black', hex: '#202124', accent: '#888888' },
    ],
    sizes: ['S/M', 'L/XL'],
  },
  {
    id: 'rib-beanie', name: 'Ribbed Knit Beanie', section: 'caps', kind: 'beanie',
    price: 690,
    description: 'Soft acrylic rib knit with a fold-over cuff and pom-pom.',
    colors: [
      { name: 'Mustard', hex: '#d9a334', accent: '#f4f1ea' },
      { name: 'Charcoal', hex: '#3d3f44', accent: '#e85d2a' },
      { name: 'Teal', hex: '#24797a', accent: '#f4f1ea' },
    ],
    sizes: ONE,
  },
  {
    id: 'sport-cap', name: 'Dri Sport Cap', section: 'caps', kind: 'cap',
    price: 1090,
    description: 'Lightweight sweat-wicking crown with laser-cut vents.',
    colors: [
      { name: 'Volt', hex: '#c9e43c', accent: '#1d1f22' },
      { name: 'Grey', hex: '#8e949b', accent: '#ffffff' },
    ],
    sizes: ONE,
  },
  {
    id: 'cord-bucket', name: 'Corduroy Bucket', section: 'caps', kind: 'bucket',
    price: 1250,
    description: 'Fine-wale cotton corduroy with a stitched brim.',
    colors: [
      { name: 'Rust', hex: '#a9502d', accent: '#f4e9d8' },
      { name: 'Forest', hex: '#2f4f3a', accent: '#f4e9d8' },
    ],
    sizes: ['S/M', 'L/XL'],
  },

  // ── Bags ───────────────────────────────────────────────────
  {
    id: 'daypack', name: 'City Daypack 22L', section: 'bags', kind: 'backpack',
    price: 3450, badge: 'New',
    description: 'Padded 15" laptop sleeve, water-resistant base and quick-access front pocket.',
    colors: [
      { name: 'Black', hex: '#1f2023', accent: '#e85d2a' },
      { name: 'Olive', hex: '#5d6440', accent: '#e9e3d0' },
      { name: 'Sky', hex: '#7fb2e5', accent: '#1f2a44' },
    ],
    sizes: ONE,
  },
  {
    id: 'canvas-tote', name: 'Heavy Canvas Tote', section: 'bags', kind: 'tote',
    price: 990,
    description: '16 oz canvas with long handles and an inner zip pocket.',
    colors: [
      { name: 'Natural', hex: '#e7dcc4', accent: '#1d1f22' },
      { name: 'Black', hex: '#232323', accent: '#e7dcc4' },
    ],
    sizes: ONE,
  },
  {
    id: 'gym-duffel', name: 'Gym Duffel 40L', section: 'bags', kind: 'duffel',
    price: 2890,
    description: 'Ventilated shoe compartment, padded shoulder strap and wipe-clean base.',
    colors: [
      { name: 'Navy', hex: '#22304f', accent: '#f2f2f2' },
      { name: 'Red', hex: '#b8322f', accent: '#f2f2f2' },
    ],
    sizes: ONE,
  },
  {
    id: 'sling-bag', name: 'Crossbody Sling', section: 'bags', kind: 'sling',
    price: 1490,
    description: 'Compact sling for phone, wallet and keys. Wear it front or back.',
    colors: [
      { name: 'Clay', hex: '#c8643c', accent: '#2a2a2a' },
      { name: 'Black', hex: '#1d1f22', accent: '#c9e43c' },
      { name: 'Stone', hex: '#a39d91', accent: '#2a2a2a' },
    ],
    sizes: ONE,
  },
  {
    id: 'roll-top', name: 'Roll-Top Backpack', section: 'bags', kind: 'backpack',
    price: 4190,
    description: 'Fully waterproof roll-top with a welded seam body. Monsoon approved.',
    colors: [
      { name: 'Yellow', hex: '#e9b83a', accent: '#1d1f22' },
      { name: 'Grey', hex: '#6b7078', accent: '#f2f2f2' },
    ],
    sizes: ONE,
  },
  {
    id: 'mini-tote', name: 'Mini Market Tote', section: 'bags', kind: 'tote',
    price: 750,
    description: 'Small everyday tote that folds flat into your pocket.',
    colors: [
      { name: 'Sage', hex: '#9fb59a', accent: '#1d1f22' },
      { name: 'Rose', hex: '#e3a3a8', accent: '#1d1f22' },
    ],
    sizes: ONE,
  },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const productsInSection = (section: SectionId) => PRODUCTS.filter((p) => p.section === section)

export const formatPrice = (n: number) => `${BRAND.currency} ${n.toLocaleString('en-IN')}`
