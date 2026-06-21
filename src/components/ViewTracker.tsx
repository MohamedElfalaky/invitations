"use client";

import { useEffect, useRef } from "react";

/**
 * Fire-and-forget visit beacon. The guest invitation page is statically
 * rendered and served from the CDN, so the only place a visit can be observed
 * is the client. On mount we POST the slug once; the API route increments the
 * invitation's view_count. Failures are intentionally ignored — tracking must
 * never affect the guest experience.
 */
export function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      // Lets the request complete even if the guest navigates away immediately.
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
