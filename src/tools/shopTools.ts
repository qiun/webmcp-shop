import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ToolDefinition, ToolResult } from '../lib/webmcp';
import { confirmWithUser } from '../lib/webmcp';
import { CATEGORIES, findProduct, products } from '../data/products';
import { addToCart, clearCart, getCartView, updateCartItem } from '../store/cart';

const PLN = (n: number) => `${n.toLocaleString('en-US')} PLN`;

function ok<O>(text: string, structuredContent: O): ToolResult<O> {
  return { content: [{ type: 'text', text }], structuredContent };
}
function fail(text: string): ToolResult {
  return { content: [{ type: 'text', text }], isError: true };
}

// --- search_products ---
const SearchInput = z.object({
  query: z.string().describe('Search phrase (product name or part of the description).'),
  category: z.enum(CATEGORIES).optional().describe('Optional category.'),
  maxResults: z.number().int().min(1).max(50).default(10),
});
export const searchProductsTool: ToolDefinition = {
  name: 'search_products',
  description: 'Searches products by phrase and an optional category.',
  inputSchema: zodToJsonSchema(SearchInput),
  annotations: { readOnlyHint: true },
  execute: async (raw) => {
    const input = SearchInput.parse(raw);
    const q = input.query.trim().toLowerCase();
    const hits = products
      .filter((p) => (input.category ? p.category === input.category : true))
      .filter(
        (p) =>
          q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      .slice(0, input.maxResults);
    const text = hits.length
      ? hits.map((p) => `${p.sku} — ${p.name} (${PLN(p.price)}, ${p.category})`).join('\n')
      : 'No results. Try a different phrase or category.';
    return ok(text, { results: hits, count: hits.length });
  },
};

// --- get_product_details ---
const SkuInput = z.object({ sku: z.string().describe('Product SKU, e.g. EL-001.') });
export const getProductDetailsTool: ToolDefinition = {
  name: 'get_product_details',
  description: 'Returns product details by SKU.',
  inputSchema: zodToJsonSchema(SkuInput),
  annotations: { readOnlyHint: true },
  execute: async (raw) => {
    const { sku } = SkuInput.parse(raw);
    const p = findProduct(sku);
    if (!p) return fail(`No product with SKU=${sku}. Use search_products.`);
    const variants = p.variants?.map((v) => `${v.name}: ${v.options.join(', ')}`).join('; ') ?? 'none';
    return ok(
      `${p.name} (${p.sku})\nCategory: ${p.category}\nPrice: ${PLN(p.price)}\nStock: ${p.stock} pcs\nVariants: ${variants}\n\n${p.description}`,
      p,
    );
  },
};

// --- list_categories ---
export const listCategoriesTool: ToolDefinition = {
  name: 'list_categories',
  description: 'Returns the list of available product categories.',
  inputSchema: zodToJsonSchema(z.object({})),
  annotations: { readOnlyHint: true },
  execute: async () => ok(`Categories: ${CATEGORIES.join(', ')}`, { categories: CATEGORIES }),
};

// --- add_to_cart ---
const AddInput = z.object({
  sku: z.string(),
  quantity: z.number().int().min(1).default(1),
  variant: z.record(z.string()).optional(),
});
export const addToCartTool: ToolDefinition = {
  name: 'add_to_cart',
  description: 'Adds a product to the cart (optionally with a variant).',
  inputSchema: zodToJsonSchema(AddInput),
  execute: async (raw) => {
    const input = AddInput.parse(raw);
    try {
      const line = addToCart(input.sku, input.quantity, input.variant);
      const view = getCartView();
      return ok(
        `Added ${line.quantity}× ${line.product.name} to the cart. Total: ${PLN(view.total)}.`,
        { added: line, cartTotal: view.total, cartCount: view.count },
      );
    } catch (e) {
      return fail(e instanceof Error ? e.message : 'Failed to add to the cart.');
    }
  },
};

// --- update_cart_item ---
const UpdateInput = z.object({
  sku: z.string(),
  quantity: z.number().int().min(0).describe('New quantity; 0 removes the item.'),
});
export const updateCartItemTool: ToolDefinition = {
  name: 'update_cart_item',
  description: 'Changes the quantity of a cart item or removes it (quantity=0).',
  inputSchema: zodToJsonSchema(UpdateInput),
  execute: async (raw) => {
    const input = UpdateInput.parse(raw);
    try {
      updateCartItem(input.sku, input.quantity);
      const view = getCartView();
      return ok(
        input.quantity === 0
          ? `Removed ${input.sku} from the cart. Total: ${PLN(view.total)}.`
          : `Changed quantity of ${input.sku} to ${input.quantity}. Total: ${PLN(view.total)}.`,
        { cartTotal: view.total, cartCount: view.count },
      );
    } catch (e) {
      return fail(e instanceof Error ? e.message : 'Failed to update the cart.');
    }
  },
};

// --- get_cart ---
export const getCartTool: ToolDefinition = {
  name: 'get_cart',
  description: 'Returns the cart contents and total.',
  inputSchema: zodToJsonSchema(z.object({})),
  annotations: { readOnlyHint: true },
  execute: async () => {
    const view = getCartView();
    if (view.items.length === 0) return ok('The cart is empty.', view);
    const lines = view.items.map(
      (l) => `${l.quantity}× ${l.product.name} (${l.sku}) = ${PLN(l.lineTotal)}`,
    );
    return ok(`Cart:\n${lines.join('\n')}\nTotal: ${PLN(view.total)}`, view);
  },
};

// --- checkout (human-in-the-loop) ---
const CheckoutInput = z.object({
  fullName: z.string().min(1),
  email: z.string().email('Invalid email address.'),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
});
function orderId(): string {
  // Math.random is unavailable in some script environments — derive from time and cart state.
  const seed = (Date.now() % 100000).toString(36).toUpperCase();
  return `ORD-${seed}`;
}
export const checkoutTool: ToolDefinition = {
  name: 'checkout',
  description: 'Places an order from the cart along with shipping details. Requires user confirmation.',
  inputSchema: zodToJsonSchema(CheckoutInput),
  annotations: { destructiveHint: true },
  execute: async (raw) => {
    const parsed = CheckoutInput.safeParse(raw);
    if (!parsed.success) {
      return fail(`Invalid data: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
    }
    const view = getCartView();
    if (view.items.length === 0) return fail('The cart is empty — there is nothing to order.');

    const summary = view.items
      .map((l) => `${l.quantity}× ${l.product.name} = ${PLN(l.lineTotal)}`)
      .join('\n');
    const confirmed = await confirmWithUser({
      title: 'Confirm order',
      body: `${summary}\n\nTotal: ${PLN(view.total)}\nShipping: ${parsed.data.fullName}, ${parsed.data.address}, ${parsed.data.postalCode} ${parsed.data.city}`,
      confirmLabel: 'Place order',
    });
    if (!confirmed) return fail('Order cancelled by the user.');

    const id = orderId();
    const total = view.total;
    clearCart();
    return ok(`Order ${id} placed. Total ${PLN(total)}. Thank you!`, { orderId: id, total });
  },
};

export const shopTools: ToolDefinition[] = [
  searchProductsTool,
  getProductDetailsTool,
  listCategoriesTool,
  addToCartTool,
  updateCartItemTool,
  getCartTool,
];
