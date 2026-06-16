import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findProduct } from '../data/products';
import { addToCart } from '../store/cart';

export function Product() {
  const { sku } = useParams<{ sku: string }>();
  const product = sku ? findProduct(sku) : undefined;
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div>
        <p className="text-slate-600">Product “{sku}” not found.</p>
        <Link to="/" className="mt-4 inline-block text-brand-700 hover:underline">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product.sku, quantity, Object.keys(variant).length ? variant : undefined);
    setAdded(true);
  };

  return (
    <div>
      <Link to="/" className="text-sm text-brand-700 hover:underline">
        ← Catalog
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div
          className="flex h-72 items-center justify-center rounded-2xl text-slate-500"
          style={{ backgroundColor: product.imagePlaceholder }}
          aria-hidden="true"
        >
          {product.category}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">SKU: {product.sku}</p>
          <p className="mt-4 text-2xl font-semibold text-brand-700">
            {product.price.toLocaleString('en-US')} {product.currency}
          </p>
          <p className="mt-4 text-slate-600">{product.description}</p>

          {product.variants?.map((v) => (
            <div key={v.name} className="mt-4">
              <label htmlFor={`var-${v.name}`} className="mb-1 block text-sm font-medium">
                {v.name}
              </label>
              <select
                id={`var-${v.name}`}
                value={variant[v.name] ?? ''}
                onChange={(e) => setVariant((s) => ({ ...s, [v.name]: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">— select —</option>
                {v.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="mt-6 flex items-center gap-4">
            <label htmlFor="qty" className="text-sm font-medium">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700"
            >
              Add to cart
            </button>
          </div>

          <p aria-live="polite" className="mt-3 text-sm text-green-700">
            {added ? 'Added to cart.' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
