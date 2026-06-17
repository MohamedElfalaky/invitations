"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

type GalleryProps = {
  images: string[];
  className?: string;
  imageClassName?: string;
};

/**
 * Responsive, lazy-loaded photo grid with a lightweight lightbox. Uses
 * `next/image` for optimization; images below the fold load lazily.
 */
export function Gallery({
  images,
  className = "",
  imageClassName = "rounded-xl",
}: GalleryProps) {
  const { m } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const show = useCallback(
    (delta: number) =>
      setOpen((cur) =>
        cur === null ? cur : (cur + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(1);
      if (e.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, show]);

  if (!images.length) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative aspect-square overflow-hidden rounded-xl"
            aria-label={`Photo ${i + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, 33vw"
              className={`object-cover transition duration-500 group-hover:scale-105 ${imageClassName}`}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label={m.gallery.close}
              className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-black"
            >
              ✕
            </button>

            <motion.div
              key={open}
              className="relative h-[80vh] w-full max-w-3xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[open]}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                priority
              />
            </motion.div>

            {images.length > 1 && (
              <>
                <NavButton side="start" onClick={(e) => { e.stopPropagation(); show(-1); }} label="‹" />
                <NavButton side="end" onClick={(e) => { e.stopPropagation(); show(1); }} label="›" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({
  side,
  onClick,
  label,
}: {
  side: "start" | "end";
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-2xl text-black ${
        side === "start" ? "start-4" : "end-4"
      }`}
    >
      {label}
    </button>
  );
}
