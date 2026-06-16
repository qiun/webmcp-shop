// src/lib/webmcp.ts
// The single point that depends on the WebMCP API version. Source of truth for all 4 projects.
// If the Chrome API changes -> you fix ONLY this file.
import { useEffect } from 'react';

export interface ToolResult<O = unknown> {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: O;
  isError?: boolean;
}

export interface ToolDefinition<I = any, O = any> {
  name: string; // snake_case, <=30 characters, unique
  description: string; // <=500 characters, describes the intent
  inputSchema: object; // JSON Schema (from zod-to-json-schema)
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: I) => Promise<ToolResult<O>>;
}

function getModelContext(): any | null {
  if (typeof document !== 'undefined' && (document as any).modelContext) {
    return (document as any).modelContext; // Chrome 150+
  }
  if (typeof navigator !== 'undefined' && (navigator as any).modelContext) {
    return (navigator as any).modelContext; // older native / MCP-B polyfill
  }
  return null;
}

async function ensureModelContext(): Promise<any> {
  let mc = getModelContext();
  if (mc) return mc;
  await import('@mcp-b/global'); // polyfill: injects navigator.modelContext + bridge
  mc = getModelContext();
  if (!mc) throw new Error('WebMCP unavailable: no native API and no polyfill.');
  return mc;
}

export async function registerTool(def: ToolDefinition): Promise<() => void> {
  const mc = await ensureModelContext();
  mc.registerTool({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema,
    annotations: def.annotations,
    execute: def.execute,
  });
  return () => {
    try {
      mc.unregisterTool(def.name);
    } catch {
      /* noop */
    }
  };
}

// React hook. `enabled` lets you register a tool conditionally on state
// (e.g. checkout only when the cart is non-empty). Resilient to double registration in React StrictMode.
export function useWebMcpTool(def: ToolDefinition, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    registerTool(def).then((fn) => {
      if (cancelled) fn();
      else cleanup = fn;
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
    // Re-register only when the name/state changes — `def` is a new reference on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, def.name]);
}

// Human-in-the-loop. Tries the native requestUserInteraction; falls back to a custom
// modal via a global callback set in <ConfirmDialog/>.
type ConfirmFn = (o: { title: string; body: string; confirmLabel: string }) => Promise<boolean>;
let modalConfirm: ConfirmFn | null = null;
export function registerConfirmHandler(fn: ConfirmFn) {
  modalConfirm = fn;
}

export async function confirmWithUser(o: {
  title: string;
  body: string;
  confirmLabel: string;
}): Promise<boolean> {
  const mc = getModelContext();
  const client = mc?.client ?? mc;
  if (client?.requestUserInteraction) {
    try {
      return !!(await client.requestUserInteraction(async () =>
        modalConfirm ? modalConfirm(o) : true,
      ));
    } catch {
      /* fallthrough */
    }
  }
  if (modalConfirm) return modalConfirm(o);
  return true;
}
