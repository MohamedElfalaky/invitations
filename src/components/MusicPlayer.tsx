"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Background music with a floating mute/unmute control.
 *
 * Tries to autoplay on load. Browsers block audio autoplay until the user has
 * interacted with the page, so if the immediate attempt is rejected we start
 * playback on the visitor's first gesture (tap / click / scroll / key) — which
 * is the earliest the browser permits. The control still lets them mute.
 */
export function MusicPlayer({ src }: { src: string }) {
  const { m } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const events = ["pointerdown", "touchstart", "keydown", "scroll"];

    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, onInteract));
    }
    function onInteract() {
      cleanup();
      audio!.play().then(() => setPlaying(true)).catch(() => {});
    }

    // Attempt immediate autoplay; if blocked, arm a one-shot gesture listener.
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        events.forEach((e) =>
          window.addEventListener(e, onInteract, { passive: true }),
        );
      });

    return cleanup;
  }, [src]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }

  return (
    <>
      {/* preload so playback can begin the instant autoplay is allowed */}
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? m.music.mute : m.music.play}
        aria-pressed={playing}
        className="fixed bottom-4 end-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/80 text-lg shadow-md backdrop-blur transition hover:bg-white"
      >
        <span aria-hidden>{playing ? "🔊" : "🔈"}</span>
      </button>
    </>
  );
}
