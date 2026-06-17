"use client";

import { useState } from "react";

/** Copy text across browsers, including insecure (http LAN) contexts. */
async function copyText(text: string): Promise<boolean> {
  // Preferred path — needs a secure context (https or localhost).
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy approach */
    }
  }
  // Legacy fallback for http (e.g. testing over a LAN IP) / older browsers.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Copies the public invitation URL to the clipboard. */
export function CopyLinkButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    // Use the host the admin is actually on (localhost, LAN IP, or the live
    // domain), falling back to the configured site URL.
    const base =
      (typeof window !== "undefined" && window.location.origin) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "";
    const url = `${base}/i/${slug}`;

    const ok = await copyText(url);
    if (ok) {
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } else {
      // Last resort: surface the URL so it can be copied by hand.
      setState("failed");
      window.prompt("Copy this link:", url);
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
    >
      {state === "copied"
        ? "Copied!"
        : state === "failed"
          ? "Copy manually"
          : "Copy link"}
    </button>
  );
}
