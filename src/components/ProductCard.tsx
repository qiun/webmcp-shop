import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../data/products';
import { addToCart } from '../store/cart';

export function ProductCard({ product }: { product: Product }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/product/${product.sku}`} className="block">
        <div
          className="flex h-40 items-center justify-center text-sm text-slate-500"
          style={{ backgroundColor: product.imagePlaceholder }}
          aria-hidden="true"
        >
          {product.category}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">
          <Link to={`/product/${product.sku}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex-1 text-sm text-slate-600">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-brand-700">
            {product.price.toLocaleString('en-US')} {product.currency}
          </span>
          <button
            type="button"
            onClick={() => addToCart(product.sku, 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Add to cart
          </button>
        </div>
      </div>
    </li>
  );
}
