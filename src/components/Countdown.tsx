"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { useCountdown } from "./useCountdown";

type CountdownProps = {
  eventDate: string;
  className?: string;
  cellClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
};

/**
 * Default countdown presentation. Themes can either reuse this (passing class
 * names for full visual control) or call `useCountdown` directly for a bespoke
 * layout. The ticking logic lives in the shared hook.
 */
export function Countdown({
  eventDate,
  className = "",
  cellClassName = "min-w-[4.5rem] rounded-2xl bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur",
  numberClassName = "text-3xl font-semibold tabular-nums",
  labelClassName = "mt-1 text-xs uppercase tracking-wide opacity-70",
}: CountdownProps) {
  const { m } = useI18n();
  const left = useCountdown(eventDate);

  if (left?.started) {
    return (
      <p className={`text-lg font-medium ${className}`}>{m.countdown.started}</p>
    );
  }

  const units = [
    { value: left?.days, label: m.countdown.days },
    { value: left?.hours, label: m.countdown.hours },
    { value: left?.minutes, label: m.countdown.minutes },
    { value: left?.seconds, label: m.countdown.seconds },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      {units.map((u, i) => (
        <motion.div
          key={u.label}
          className={cellClassName}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.4 }}
        >
          <div className={numberClassName}>
            {left ? String(u.value).padStart(2, "0") : "––"}
          </div>
          <div className={labelClassName}>{u.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
