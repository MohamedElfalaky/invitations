"use client";

import { useEffect, useState } from "react";

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  started: boolean;
};

function compute(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    started: false,
  };
}

/**
 * Ticks every second on the client. Returns `null` until mounted so the static
 * (CDN-cached) HTML and the first client render agree — no hydration mismatch
 * and, importantly, the countdown reflects the *guest's* current time, not the
 * moment the page was generated.
 */
export function useCountdown(iso: string): TimeLeft | null {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(iso).getTime();
    setLeft(compute(target));
    const id = setInterval(() => setLeft(compute(target)), 1000);
    return () => clearInterval(id);
  }, [iso]);

  return left;
}
