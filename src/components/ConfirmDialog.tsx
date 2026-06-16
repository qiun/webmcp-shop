import { useEffect, useRef, useState } from 'react';
import { registerConfirmHandler } from '../lib/webmcp';

interface Prompt {
  title: string;
  body: string;
  confirmLabel: string;
}

/**
 * Human-in-the-loop modal. Registers a global handler that the WebMCP adapter
 * uses in `confirmWithUser` — an agent cannot finalize a destructive action without a click.
 */
export function ConfirmDialog() {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerConfirmHandler(
      (o) =>
        new Promise<boolean>((resolve) => {
          resolverRef.current = resolve;
          setPrompt(o);
        }),
    );
  }, []);

  const settle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setPrompt(null);
  };

  useEffect(() => {
    if (!prompt) return;
    confirmBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') settle(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prompt]);

  if (!prompt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {prompt.title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{prompt.body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => settle(false)}
            className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => settle(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            {prompt.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
