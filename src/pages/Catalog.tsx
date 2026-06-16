import { useMemo, useState } from 'react';
import { CATEGORIES, products, type Category } from '../data/products';
import { ProductCard } from '../components/ProductCard';

type SortKey = 'price-asc' | 'price-desc' | 'name';

export function Catalog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('name');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (q === '' || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name, 'en');
    });
    return sorted;
  }, [query, category, sort]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search products
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | 'all')}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="sr-only">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500" aria-live="polite">
        Found {visible.length} {visible.length === 1 ? 'product' : 'products'}.
      </p>

      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={p.sku} product={p} />
        ))}
      </ul>
    </div>
  );
}
