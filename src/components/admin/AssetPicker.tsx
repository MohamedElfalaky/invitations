"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  deleteAsset,
  listAssets,
  type AssetKind,
  type MediaAsset,
} from "@/lib/mediaAssets";

/**
 * Dropdown to reuse a previously uploaded asset (image or audio) from the
 * shared library, instead of uploading the same file again. Calls `onSelect`
 * with the chosen asset's URL.
 */
export function AssetPicker({
  kind,
  label,
  onSelect,
}: {
  kind: AssetKind;
  label?: string;
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const buttonLabel = label ?? "Choose from library";

  async function load() {
    setError(null);
    try {
      setAssets(await listAssets(kind));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load library");
      setAssets([]);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && assets === null) void load();
  }

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function choose(url: string) {
    onSelect(url);
    setOpen(false);
  }

  async function remove(id: string) {
    try {
      await deleteAsset(id);
      setAssets((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove");
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        {buttonLabel}
        <span className="text-neutral-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

          {assets === null ? (
            <p className="py-4 text-center text-sm text-neutral-400">Loading…</p>
          ) : assets.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">
              No saved {kind === "audio" ? "audio" : "images"} yet.
            </p>
          ) : kind === "image" ? (
            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
              {assets.map((a) => (
                <div key={a.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => choose(a.url)}
                    title={a.label || a.url}
                    className="relative block aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 hover:ring-2 hover:ring-neutral-900"
                  >
                    <Image
                      src={a.url}
                      alt={a.label}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="absolute end-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove from library"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {assets.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => choose(a.url)}
                    title={a.label || a.url}
                    className="flex-1 truncate rounded-lg px-2 py-1.5 text-start text-sm hover:bg-neutral-100"
                  >
                    🎵 {a.label || a.url}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="shrink-0 text-xs text-red-600"
                    aria-label="Remove from library"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
