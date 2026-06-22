"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

type EnvelopeIntroProps = {
  children: React.ReactNode;
  /** Turn the whole intro off — children render directly. */
  enabled?: boolean;
  /** Italic caption under the envelope. Defaults to the localized string. */
  caption?: string;
  /** Accessible label for the seal. Defaults to the localized string. */
  openLabel?: string;
};

type Phase = "closed" | "opening" | "done";

/**
 * Additive "wax-sealed envelope" cover that sits on top of an already-mounted
 * invitation. The invitation underneath renders normally at all times (so its
 * fonts, images and logic preload); this overlay simply covers it until the
 * guest taps the seal, then plays a one-shot open animation and fades away.
 *
 * It touches none of the invitation's data/logic — it only wraps it so the
 * reveal can give the content a gentle scale-in. Honors prefers-reduced-motion
 * (plain crossfade, no petals) and is keyboard-operable (Enter/Space on seal).
 */
export function EnvelopeIntro({
  children,
  enabled = true,
  caption,
  openLabel,
}: EnvelopeIntroProps) {
  const { m } = useI18n();
  const reduceMotion = useReducedMotion();
  const content = useAnimationControls();

  // Per-page session key so a refresh doesn't replay once it's been opened.
  const storageKey = useMemo(
    () =>
      `envelope-opened:${
        typeof window !== "undefined" ? window.location.pathname : ""
      }`,
    [],
  );

  const [phase, setPhase] = useState<Phase>("closed");
  const [showPetals, setShowPetals] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // If this page was already opened in this session, skip straight to the
  // invitation (no replay). Runs after mount, so SSR markup stays consistent.
  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(storageKey)) {
      setPhase("done");
      content.set({ opacity: 1, scale: 1 });
    }
  }, [enabled, storageKey, content]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  function open() {
    if (phase !== "closed") return;
    sessionStorage.setItem(storageKey, "1");
    setPhase("opening");

    const after = (ms: number, fn: () => void) =>
      timers.current.push(setTimeout(fn, ms));

    if (reduceMotion) {
      // Reduced motion: no flap/petals — just crossfade the overlay out.
      content.set({ opacity: 0.5 });
      content.start({ opacity: 1, transition: { duration: 0.5 } });
      after(450, () => setPhase("done"));
      return;
    }

    // Reveal the invitation with a gentle scale-in as the overlay fades.
    setShowPetals(true);
    content.set({ opacity: 0.4, scale: 0.96 });
    after(700, () =>
      content.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
      }),
    );
    after(1500, () => setPhase("done")); // triggers overlay exit fade
    after(3000, () => setShowPetals(false));
  }

  if (!enabled) return <>{children}</>;

  return (
    <>
      <motion.div animate={content}>{children}</motion.div>

      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="envelope-overlay"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-8"
            style={{
              background:
                "radial-gradient(120% 120% at 50% 30%, #fdfaf4 0%, #f6efe3 55%, #efe6d6 100%)",
              perspective: 1400,
            }}
            initial={false}
            exit={{
              opacity: 0,
              transition: { duration: 0.6, ease: "easeOut" },
            }}
          >
            <Envelope
              phase={phase}
              reduceMotion={!!reduceMotion}
              label={openLabel ?? m.envelope.open}
              onOpen={open}
            />

            <motion.p
              className="mt-10 max-w-xs text-center font-serif text-base italic text-[#8a8178] sm:text-lg"
              animate={
                phase === "opening" ? { opacity: 0, y: 8 } : { opacity: 1 }
              }
              transition={{ duration: 0.4 }}
            >
              {caption ?? m.envelope.caption}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {showPetals && <Petals />}
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Envelope({
  phase,
  reduceMotion,
  label,
  onOpen,
}: {
  phase: Phase;
  reduceMotion: boolean;
  label: string;
  onOpen: () => void;
}) {
  const opening = phase === "opening";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative aspect-[3/2] w-[min(82vw,360px)] cursor-pointer rounded-md outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-[#c9a14a] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
    >
      {/* Envelope body */}
      <div className="absolute inset-0 overflow-hidden rounded-md border border-[#d8c188] bg-gradient-to-b from-[#fbf6ec] to-[#f3ead6] shadow-[0_18px_50px_-12px_rgba(120,96,52,0.45)]">
        {/* Faint side/bottom fold lines */}
        <svg
          viewBox="0 0 300 200"
          className="absolute inset-0 h-full w-full text-[#d8c188]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          aria-hidden
        >
          <path d="M0 0 L150 110 L300 0" strokeOpacity="0.45" />
          <path d="M0 200 L150 110 L300 200" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Top triangular flap — hinged at the top edge, rotates back on open */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[62%] border-b border-[#caa94e]/40 bg-gradient-to-b from-[#fcf8ef] to-[#f1e6cf] shadow-[0_2px_6px_rgba(120,96,52,0.15)] [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]"
        style={{ transformOrigin: "top center", zIndex: 2 }}
        initial={false}
        animate={opening && !reduceMotion ? { rotateX: -165 } : { rotateX: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
      />

      {/* Wax seal — the primary tap target */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 z-[3] -ml-8 -mt-8 flex h-16 w-16 items-center justify-center rounded-full shadow-[0_6px_14px_-3px_rgba(120,40,60,0.55)]"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #d98ea0 0%, #c4778b 45%, #a85870 100%)",
        }}
        animate={
          opening
            ? reduceMotion
              ? { opacity: 0 }
              : { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
            : { scale: [1, 1.06, 1], opacity: 1 }
        }
        transition={
          opening
            ? { duration: 0.6, times: [0, 0.4, 1], ease: "easeInOut" }
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* glossy highlight */}
        <span className="absolute left-2.5 top-2 h-4 w-5 rounded-full bg-white/35 blur-[2px]" />
        {/* embossed swirl monogram */}
        <svg
          viewBox="0 0 32 32"
          className="h-8 w-8 text-[#8f4258]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden
        >
          <path
            d="M11 21c-3-1-4-4-2.5-6.5S14 12 15 15s.5 7-2 8"
            strokeOpacity="0.8"
          />
          <path
            d="M21 11c3 1 4 4 2.5 6.5S18 20 17 17s-.5-7 2-8"
            strokeOpacity="0.8"
          />
        </svg>
      </motion.span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */

/** A soft, sparse scatter of dusty-rose petals drifting down over the reveal. */
function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const rnd = (seed: number) => {
          const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          left: rnd(1) * 100,
          size: 10 + rnd(2) * 12,
          delay: rnd(3) * 1.2,
          duration: 2.4 + rnd(4) * 1.4,
          drift: (rnd(5) - 0.5) * 120,
          rotate: rnd(6) * 360,
          hue: rnd(7) > 0.5 ? "#e6b8c4" : "#dca9b8",
        };
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.7,
            background: p.hue,
            borderRadius: "100% 0 100% 0",
            opacity: 0.85,
          }}
          initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: "112vh",
            x: p.drift,
            rotate: p.rotate,
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            times: [0, 0.1, 0.8, 1],
          }}
        />
      ))}
    </div>
  );
}
