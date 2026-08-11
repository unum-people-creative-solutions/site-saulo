'use client';

import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO_SRC = '/media/hero-video.mp4';

type HeroMediaMode = 'pending' | 'static' | 'video';

function prefersStaticHero(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;

  return connection?.saveData === true;
}

/**
 * The source clip (`hero-video.mp4`) is a ping-pong (forward + reverse)
 * encode baked in at export time: its last frame is one playback step away
 * from frame 0 in both directions, so the browser's native `loop` gives a
 * mathematically seamless seam with no runtime crossfade/freeze needed. See
 * `scripts/` for the ffmpeg recipe if the source footage is ever replaced —
 * a plain non-looping clip will visibly jump on every wrap.
 *
 * When video is unavailable (reduced motion, saveData, playback failure)
 * nothing renders here at all — the hero's own ink backdrop
 * (HeroSection.css) shows through on its own instead of a static photo.
 */
export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mode, setMode] = useState<HeroMediaMode>('pending');
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setMode(prefersStaticHero() ? 'static' : 'video');
  }, []);

  async function handleLoadedData() {
    setVideoReady(true);
    try {
      await videoRef.current?.play();
    } catch {
      setVideoFailed(true);
    }
  }

  const showVideo = mode === 'video' && !videoFailed;

  return (
    <>
      {showVideo ? (
        <video
          ref={videoRef}
          className="hero-section__image hero-section__video"
          data-ready={videoReady ? 'true' : undefined}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => {
            void handleLoadedData();
          }}
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
