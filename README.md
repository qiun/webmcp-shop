# webmcp-shop

▶ **Live demo: https://webmcp-shop.vercel.app**

An online store — works normally for humans (catalog → product → cart → checkout)
**and** exposes all of its features to AI agents via **WebMCP**. Every human action has
an equivalent as a tool operating on the same logic (`src/store/cart.ts`).

## Why this exists

This is one of **four open demo sites built specifically to be _agent-ready_ via WebMCP**.
We publish them so that anyone building AI browser agents — or working on the WebMCP standard
and the [MCP-B](https://github.com/WebMCP-org) polyfill itself — has **realistic, end-to-end
targets to test against**, not toy pages. The full shopping journey here (search the catalog, open
a product, build a cart, **check out**) can be completed by a human in the UI **and** driven
entirely by an AI agent through WebMCP tools, with human-in-the-loop confirmation on the order.

The goal is simple: make it easy to verify that an agent can _really_ operate a WebMCP-enabled
site, end to end. Fork it, point your agent at it, and see what works.

**WebMCP demo set** — live demos ([source](https://github.com/qiun?tab=repositories&q=webmcp)):
[acme](https://webmcp-acme.vercel.app) ·
[shop](https://webmcp-shop.vercel.app) ·
[stays](https://webmcp-stays.vercel.app) ·
[airline](https://webmcp-airline.vercel.app)

## Stack

- Vite + React 18 + TypeScript (`strict`), `react-router-dom`
- Tailwind CSS, `lucide-react`
- `zod` + `zod-to-json-schema` (single source of truth for schema and validation)
- **MCP-B** polyfill (`@mcp-b/global`); no backend — the cart lives in `localStorage` (`webmcp-shop-cart`)

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build
pnpm lint
pnpm typecheck
```

## WebMCP tools (7)

| Tool | read-only | destructive | human-in-loop |
|---|---|---|---|
| `search_products` | ✓ | – | – |
| `get_product_details` | ✓ | – | – |
| `list_categories` | ✓ | – | – |
| `add_to_cart` | – | – | – |
| `update_cart_item` | – | – | – |
| `get_cart` | ✓ | – | – |
| `checkout` | – | ✓ | **YES** |

`checkout` is registered **only when the cart is non-empty** (`useWebMcpTool(checkoutTool, cart.count > 0)`)
and never finalizes an order without human confirmation (`confirmWithUser` → `<ConfirmDialog/>`).

## How to test with an agent

1. **Native Chrome 146+**: enable the WebMCP flag in `chrome://flags`, refresh — an agent (e.g. Gemini
   in Chrome / Model Context Tool Inspector) sees the page's tools.
2. **MCP-B polyfill (works today, any MCP agent):** the page loads `@mcp-b/global`
   automatically. Start the `@mcp-b/webmcp-local-relay` bridge and connect any MCP agent.
3. **Smoke test:**
   ```bash
   pnpm dev
   npx @mcp-b/webmcp-local-relay
   MCP_URL=http://localhost:8080/mcp node examples/agent-smoke-test.mjs
   ```
   It runs `search_products → add_to_cart → get_cart → checkout`.

## API stability (June 2026)

WebMCP is a *W3C Community Group Draft Report*. Surface: `document.modelContext.registerTool/
unregisterTool` (`navigator.modelContext` deprecated since Chrome 150). API changes → you edit
**only** `src/lib/webmcp.ts`. Changelog: `developer.chrome.com/docs/ai/webmcp`.

## Deploy

Vercel / Netlify / GitHub Pages. SPA fallback to `index.html`. HTTPS required (secure context).
Set `Content-Type: application/json` for `/.well-known/webmcp`.

## License

MIT — see [LICENSE](./LICENSE).
