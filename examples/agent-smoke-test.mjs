#!/usr/bin/env node
/**
 * Agent smoke test for WebMCP Shop.
 *
 * Runs the full shopping flow using MCP tools ONLY:
 *   list_categories → search_products → add_to_cart → get_cart → checkout
 *
 * Requires a running MCP-B bridge (`@mcp-b/webmcp-local-relay`) pointing at an
 * open store page (e.g. http://localhost:5173) and the
 * `@modelcontextprotocol/sdk` package (part of the agent/relay dependencies).
 *
 * Usage:
 *   1) pnpm dev                       # start the store
 *   2) npx @mcp-b/webmcp-local-relay  # start the bridge (default http://localhost:8080/mcp)
 *   3) MCP_URL=http://localhost:8080/mcp node examples/agent-smoke-test.mjs
 */

const MCP_URL = process.env.MCP_URL ?? 'http://localhost:8080/mcp';

async function main() {
  let Client, StreamableHTTPClientTransport;
  try {
    ({ Client } = await import('@modelcontextprotocol/sdk/client/index.js'));
    ({ StreamableHTTPClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/streamableHttp.js'
    ));
  } catch {
    console.error(
      'Missing @modelcontextprotocol/sdk. Install the MCP-B bridge / SDK to run the smoke test.',
    );
    process.exit(2);
  }

  const client = new Client({ name: 'shop-smoke-test', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));

  const call = async (name, args = {}) => {
    const res = await client.callTool({ name, arguments: args });
    const text = res.content?.map((c) => c.text).join('\n') ?? '';
    console.log(`\n▶ ${name}(${JSON.stringify(args)})\n${text}`);
    if (res.isError) throw new Error(`Tool ${name} returned an error: ${text}`);
    return res;
  };

  await call('list_categories');
  const search = await call('search_products', { query: 'headphones', maxResults: 5 });
  const sku = search.structuredContent?.results?.[0]?.sku ?? 'EL-001';
  await call('add_to_cart', { sku, quantity: 2 });
  await call('get_cart');
  const order = await call('checkout', {
    fullName: 'John Tester',
    email: 'john@example.com',
    address: '1 Test Street',
    city: 'New York',
    postalCode: '10001',
  });

  const orderId = order.structuredContent?.orderId;
  if (!orderId) throw new Error('Checkout did not return an orderId.');
  console.log(`\n✅ Smoke test OK — order ${orderId}`);
  await client.close();
}

main().catch((err) => {
  console.error('\n❌ Smoke test failed:', err.message);
  process.exit(1);
});
