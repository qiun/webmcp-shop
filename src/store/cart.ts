import { useSyncExternalStore } from 'react';
import { findProduct, type Product } from '../data/products';

const STORAGE_KEY = 'webmcp-shop-cart';

export interface CartItem {
  sku: string;
  quantity: number;
  variant?: Record<string, string>;
}

export interface CartLine extends CartItem {
  product: Product;
  lineTotal: number;
}

export interface CartView {
  items: CartLine[];
  total: number;
  currency: 'PLN';
  count: number;
}

let items: CartItem[] = load();
const listeners = new Set<() => void>();

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === 'object' && i !== null && typeof (i as CartItem).sku === 'string',
    );
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* localStorage unavailable — ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---- Domain API (shared by the UI and the WebMCP tools) ----

export function getCartView(): CartView {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = findProduct(item.sku);
    if (!product) continue;
    lines.push({ ...item, product, lineTotal: product.price * item.quantity });
  }
  const total = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { items: lines, total, currency: 'PLN', count };
}

export function addToCart(sku: string, quantity = 1, variant?: Record<string, string>): CartLine {
  const product = findProduct(sku);
  if (!product) throw new Error(`No product with SKU=${sku}. Use search_products.`);
  if (quantity < 1) throw new Error('Quantity must be >= 1.');

  const existing = items.find((i) => i.sku === product.sku && sameVariant(i.variant, variant));
  if (existing) {
    existing.quantity += quantity;
  } else {
    items = [...items, { sku: product.sku, quantity, ...(variant ? { variant } : {}) }];
  }
  emit();
  const line = getCartView().items.find((l) => l.sku === product.sku);
  if (!line) throw new Error('Failed to add the product to the cart.');
  return line;
}

export function updateCartItem(sku: string, quantity: number): void {
  if (quantity < 0) throw new Error('Quantity cannot be negative.');
  const found = items.find((i) => i.sku.toLowerCase() === sku.toLowerCase());
  if (!found) throw new Error(`No item with SKU=${sku} in the cart.`);
  if (quantity === 0) {
    items = items.filter((i) => i !== found);
  } else {
    found.quantity = quantity;
  }
  emit();
}

export function clearCart(): void {
  items = [];
  emit();
}

function sameVariant(a?: Record<string, string>, b?: Record<string, string>): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

// ---- React hook ----

let cachedView: CartView = getCartView();
let cacheKey = '';

function getSnapshot(): CartView {
  const key = JSON.stringify(items);
  if (key !== cacheKey) {
    cacheKey = key;
    cachedView = getCartView();
  }
  return cachedView;
}

export function useCart(): CartView {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
