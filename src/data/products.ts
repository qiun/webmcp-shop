export const CATEGORIES = ['Electronics', 'Home', 'Sport', 'Books'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  sku: string;
  name: string;
  category: Category;
  price: number;
  currency: 'PLN';
  description: string;
  variants?: ProductVariant[];
  stock: number;
  imagePlaceholder: string; // placeholder background color
}

export const products: Product[] = [
  // Electronics
  { sku: 'EL-001', name: 'Aura X Headphones', category: 'Electronics', price: 399, currency: 'PLN', description: 'Wireless headphones with ANC and 30 h battery life.', stock: 24, imagePlaceholder: '#dbeafe', variants: [{ name: 'Color', options: ['Black', 'Silver'] }] },
  { sku: 'EL-002', name: 'BoomMini Speaker', category: 'Electronics', price: 199, currency: 'PLN', description: 'Compact Bluetooth speaker, waterproof IPX7.', stock: 40, imagePlaceholder: '#bfdbfe' },
  { sku: 'EL-003', name: 'GaN Charger 65W', category: 'Electronics', price: 149, currency: 'PLN', description: 'Three-port USB-C/USB-A charger.', stock: 60, imagePlaceholder: '#c7d2fe' },
  { sku: 'EL-004', name: 'Mech K2 Keyboard', category: 'Electronics', price: 329, currency: 'PLN', description: 'Mechanical 75% keyboard with hot-swap switches.', stock: 18, imagePlaceholder: '#e0e7ff', variants: [{ name: 'Switch', options: ['Red', 'Brown', 'Blue'] }] },
  { sku: 'EL-005', name: 'Glide Pro Mouse', category: 'Electronics', price: 179, currency: 'PLN', description: 'Lightweight wireless mouse, 26,000 DPI.', stock: 33, imagePlaceholder: '#ddd6fe' },
  { sku: 'EL-006', name: 'Clear 4K Webcam', category: 'Electronics', price: 289, currency: 'PLN', description: '4K camera with autofocus and built-in microphone.', stock: 15, imagePlaceholder: '#dbeafe' },

  // Home
  { sku: 'HM-001', name: 'Lumo Lamp', category: 'Home', price: 159, currency: 'PLN', description: 'LED desk lamp with adjustable color temperature.', stock: 27, imagePlaceholder: '#fef3c7' },
  { sku: 'HM-002', name: 'Thermal Mug 0.5L', category: 'Home', price: 79, currency: 'PLN', description: 'Steel mug that keeps drinks hot for 12 h.', stock: 80, imagePlaceholder: '#fde68a', variants: [{ name: 'Color', options: ['Graphite', 'Mint', 'Sand'] }] },
  { sku: 'HM-003', name: 'Knife Set, 5 pcs', category: 'Home', price: 249, currency: 'PLN', description: 'Stainless steel kitchen knives.', stock: 22, imagePlaceholder: '#fed7aa' },
  { sku: 'HM-004', name: 'Aroma Diffuser', category: 'Home', price: 129, currency: 'PLN', description: 'Ultrasonic diffuser with ambient lighting.', stock: 35, imagePlaceholder: '#fecaca' },
  { sku: 'HM-005', name: 'Cozy Blanket 150x200', category: 'Home', price: 119, currency: 'PLN', description: 'Soft microfiber blanket.', stock: 50, imagePlaceholder: '#fbcfe8', variants: [{ name: 'Color', options: ['Beige', 'Graphite'] }] },
  { sku: 'HM-006', name: 'Artificial Plant L', category: 'Home', price: 99, currency: 'PLN', description: 'Decorative monstera in a pot.', stock: 19, imagePlaceholder: '#d9f99d' },

  // Sport
  { sku: 'SP-001', name: 'Grip Yoga Mat', category: 'Sport', price: 139, currency: 'PLN', description: 'Non-slip 6 mm mat with carry strap.', stock: 44, imagePlaceholder: '#bbf7d0', variants: [{ name: 'Color', options: ['Purple', 'Black', 'Turquoise'] }] },
  { sku: 'SP-002', name: 'Water Bottle 750ml', category: 'Sport', price: 49, currency: 'PLN', description: 'BPA-free sports water bottle.', stock: 90, imagePlaceholder: '#a7f3d0' },
  { sku: 'SP-003', name: 'Dumbbells 2x5kg', category: 'Sport', price: 189, currency: 'PLN', description: 'Pair of vinyl-coated dumbbells.', stock: 16, imagePlaceholder: '#99f6e4' },
  { sku: 'SP-004', name: 'Speed Jump Rope', category: 'Sport', price: 59, currency: 'PLN', description: 'Jump rope with bearings and adjustable length.', stock: 70, imagePlaceholder: '#5eead4' },
  { sku: 'SP-005', name: 'Trail Backpack 25L', category: 'Sport', price: 219, currency: 'PLN', description: 'Lightweight hiking backpack with rain cover.', stock: 21, imagePlaceholder: '#67e8f9', variants: [{ name: 'Size', options: ['S', 'M', 'L'] }] },
  { sku: 'SP-006', name: 'Massage Roller', category: 'Sport', price: 89, currency: 'PLN', description: 'Foam roller for muscle recovery.', stock: 38, imagePlaceholder: '#a5f3fc' },

  // Books
  { sku: 'BK-001', name: 'Clean Code', category: 'Books', price: 89, currency: 'PLN', description: 'A handbook of good programming practices.', stock: 55, imagePlaceholder: '#e2e8f0' },
  { sku: 'BK-002', name: 'The Pragmatic Programmer', category: 'Books', price: 79, currency: 'PLN', description: 'A software engineering classic.', stock: 48, imagePlaceholder: '#cbd5e1' },
  { sku: 'BK-003', name: 'Design Patterns', category: 'Books', price: 99, currency: 'PLN', description: 'A catalog of object-oriented patterns.', stock: 30, imagePlaceholder: '#e2e8f0' },
  { sku: 'BK-004', name: 'Atomic Habits', category: 'Books', price: 49, currency: 'PLN', description: 'On building good habits.', stock: 100, imagePlaceholder: '#cbd5e1' },
  { sku: 'BK-005', name: 'Deep Work', category: 'Books', price: 45, currency: 'PLN', description: 'On focus in a distracted world.', stock: 62, imagePlaceholder: '#e2e8f0' },
  { sku: 'BK-006', name: 'The Art of Writing', category: 'Books', price: 59, currency: 'PLN', description: 'A practical guide to writing.', stock: 41, imagePlaceholder: '#cbd5e1' },
];

export function findProduct(sku: string): Product | undefined {
  return products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
}
