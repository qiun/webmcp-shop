import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { updateCartItem, useCart } from '../store/cart';

export function Cart() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
        <p className="mt-4 text-slate-600">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-brand-700 hover:underline">
          ← Go to catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
      <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {cart.items.map((line) => (
          <li key={line.sku} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="font-medium text-slate-900">{line.product.name}</p>
              <p className="text-sm text-slate-500">
                {line.product.price.toLocaleString('en-US')} PLN / pc.
              </p>
            </div>
            <label htmlFor={`qty-${line.sku}`} className="sr-only">
              Quantity of {line.product.name}
            </label>
            <input
              id={`qty-${line.sku}`}
              type="number"
              min={0}
              value={line.quantity}
              onChange={(e) => updateCartItem(line.sku, Math.max(0, Number(e.target.value) || 0))}
              className="w-20 rounded-lg border border-slate-300 px-3 py-2"
            />
            <span className="w-28 text-right font-semibold">
              {line.lineTotal.toLocaleString('en-US')} PLN
            </span>
            <button
              type="button"
              onClick={() => updateCartItem(line.sku, 0)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${line.product.name}`}
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold">Total: {cart.total.toLocaleString('en-US')} PLN</span>
        <Link
          to="/checkout"
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
