import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { checkoutTool } from '../tools/shopTools';
import { useCart } from '../store/cart';

interface OrderResult {
  orderId: string;
  total: number;
}

export function Checkout() {
  const cart = useCart();
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (order) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Thank you!</h1>
        <p className="mt-4 text-slate-600">
          Order <strong>{order.orderId}</strong> has been placed.
        </p>
        <p className="mt-1 text-slate-600">Total: {order.total.toLocaleString('en-US')} PLN</p>
        <Link to="/" className="mt-6 inline-block text-brand-700 hover:underline">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-4 text-slate-600">The cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-brand-700 hover:underline">
          ← Catalog
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const str = (k: string) => {
      const v = data.get(k);
      return typeof v === 'string' ? v : '';
    };
    // Same logic as the WebMCP tool — including the confirmation modal.
    const result = await checkoutTool.execute({
      fullName: str('fullName'),
      email: str('email'),
      address: str('address'),
      city: str('city'),
      postalCode: str('postalCode'),
    });
    setBusy(false);
    if (result.isError) {
      setError(result.content[0]?.text ?? 'An error occurred.');
      return;
    }
    setOrder(result.structuredContent as OrderResult);
  };

  const field = (id: string, label: string, type = 'text', autoComplete?: string) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </div>
  );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4" noValidate>
          {field('fullName', 'Full name', 'text', 'name')}
          {field('email', 'Email', 'email', 'email')}
          {field('address', 'Address', 'text', 'street-address')}
          <div className="grid grid-cols-2 gap-4">
            {field('city', 'City', 'text', 'address-level2')}
            {field('postalCode', 'Postal code', 'text', 'postal-code')}
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? 'Processing…' : 'Place order'}
          </button>
        </form>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {cart.items.map((l) => (
            <li key={l.sku} className="flex justify-between">
              <span>
                {l.quantity}× {l.product.name}
              </span>
              <span>{l.lineTotal.toLocaleString('en-US')} PLN</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-semibold">
          <span>Total</span>
          <span>{cart.total.toLocaleString('en-US')} PLN</span>
        </div>
      </aside>
    </div>
  );
}
