"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Floating mute/unmute control. Off by default and only starts on a user click
 * (browser autoplay policy + courtesy). The audio element uses `preload="none"`
 * so nothing is fetched until the guest opts in.
 */
export function MusicPlayer({ src }: { src: string }) {
  const { m } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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
      <audio ref={audioRef} src={src} loop preload="none" />
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
