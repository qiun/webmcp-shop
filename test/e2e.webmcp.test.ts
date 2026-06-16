// @vitest-environment happy-dom
/**
 * E2E test przez PRAWDZIWĄ warstwę WebMCP (@mcp-b polyfill).
 *
 * Rejestruje narzędzia naszym adapterem (src/lib/webmcp), a następnie wywołuje je
 * przez `navigator.modelContextTesting.executeTool(...)` — tej samej drogi używa
 * serwer MCP-B do wykonywania narzędzi strony. Pomijamy jedynie transport WS/iframe
 * (czysta infrastruktura MCP-B), nie nasz kod.
 *
 * `confirmWithUser` w tym trybie nie ma modala ani requestUserInteraction → zwraca true
 * (auto-potwierdzenie w trybie testu), zgodnie z briefem.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { registerTool } from '../src/lib/webmcp';
import { shopTools, checkoutTool } from '../src/tools/shopTools';

interface CallResult {
  content: { type: string; text: string }[];
  structuredContent?: unknown;
  isError?: boolean;
}

function testingShim(): { executeTool: (name: string, argsJson: string) => Promise<string | null> } {
  const shim = (navigator as unknown as { modelContextTesting?: unknown }).modelContextTesting;
  if (!shim) throw new Error('navigator.modelContextTesting niedostępne — polyfill nie zainicjalizowany.');
  return shim as { executeTool: (name: string, argsJson: string) => Promise<string | null> };
}

async function call(name: string, args: Record<string, unknown> = {}): Promise<CallResult> {
  const raw = await testingShim().executeTool(name, JSON.stringify(args));
  if (raw === null) throw new Error(`${name}: pusty wynik`);
  return JSON.parse(raw) as CallResult;
}

beforeAll(async () => {
  await import('@mcp-b/global'); // auto-init polyfilla (navigator.modelContext + modelContextTesting)
  for (const tool of [...shopTools, checkoutTool]) {
    await registerTool(tool);
  }
});

describe('webmcp-shop — e2e przez warstwę WebMCP', () => {
  it('rejestruje wszystkie 7 narzędzi i są widoczne dla agenta', () => {
    const shim = (navigator as unknown as { modelContextTesting: { listTools: () => unknown[] } })
      .modelContextTesting;
    const names = shim.listTools().map((t) => (t as { name: string }).name);
    for (const expected of [
      'search_products',
      'get_product_details',
      'list_categories',
      'add_to_cart',
      'update_cart_item',
      'get_cart',
      'checkout',
    ]) {
      expect(names).toContain(expected);
    }
  });

  it('list_categories zwraca 4 kategorie', async () => {
    const res = await call('list_categories');
    const sc = res.structuredContent as { categories: string[] };
    expect(sc.categories).toEqual(['Electronics', 'Home', 'Sport', 'Books']);
  });

  it('pełny przepływ zakupowy: search → add → cart → checkout', async () => {
    const search = await call('search_products', { query: 'headphones', maxResults: 5 });
    const results = (search.structuredContent as { results: { sku: string }[] }).results;
    expect(results.length).toBeGreaterThan(0);
    const sku = results[0]!.sku;

    const add = await call('add_to_cart', { sku, quantity: 2 });
    expect((add.structuredContent as { cartCount: number }).cartCount).toBe(2);

    const cart = await call('get_cart');
    const cartSc = cart.structuredContent as { total: number; count: number };
    expect(cartSc.count).toBe(2);
    expect(cartSc.total).toBeGreaterThan(0);

    const order = await call('checkout', {
      fullName: 'Jan Tester',
      email: 'jan@example.com',
      address: 'Test St 1',
      city: 'Krakow',
      postalCode: '30-001',
    });
    const orderSc = order.structuredContent as { orderId: string; total: number };
    expect(orderSc.orderId).toMatch(/^ORD-/);
    expect(orderSc.total).toBeGreaterThan(0);

    // Po checkout koszyk jest wyczyszczony.
    const empty = await call('get_cart');
    expect((empty.structuredContent as { count: number }).count).toBe(0);
  });

  it('walidacja: nieznane SKU rzuca błąd narzędzia', async () => {
    await expect(call('get_product_details', { sku: 'NOPE-999' })).rejects.toThrow();
  });

  it('walidacja zod: zły e-mail w checkout jest odrzucony', async () => {
    await call('add_to_cart', { sku: 'EL-002', quantity: 1 });
    await expect(
      call('checkout', {
        fullName: 'X',
        email: 'not-an-email',
        address: 'A',
        city: 'B',
        postalCode: 'C',
      }),
    ).rejects.toThrow();
  });
});
