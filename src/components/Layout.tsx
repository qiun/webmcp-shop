import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useWebMcpTool } from '../lib/webmcp';
import { shopTools, checkoutTool } from '../tools/shopTools';
import { useCart } from '../store/cart';
import { ConfirmDialog } from './ConfirmDialog';

export function Layout() {
  const cart = useCart();

  // Read-only / cart tools registered globally (fixed number and order of hooks).
  useWebMcpTool(shopTools[0]!);
  useWebMcpTool(shopTools[1]!);
  useWebMcpTool(shopTools[2]!);
  useWebMcpTool(shopTools[3]!);
  useWebMcpTool(shopTools[4]!);
  useWebMcpTool(shopTools[5]!);
  // checkout registered only when the cart is non-empty.
  useWebMcpTool(checkoutTool, cart.count > 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <nav
          className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"
          aria-label="Main"
        >
          <Link to="/" className="text-lg font-bold text-brand-700">
            WebMCP Shop
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            aria-label={`Cart, ${cart.count} items`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            Cart
            {cart.count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {cart.count}
              </span>
            )}
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>

      <ConfirmDialog />
    </div>
  );
}
