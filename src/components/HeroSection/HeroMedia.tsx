'use client';

import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO_SRC = '/media/hero-video.mp4';
/** Crossfade end→start via canvas (ms). */
const LOOP_FADE_MS = 800;
/** Begin soft-loop this many seconds before the end. */
const LOOP_FADE_LEAD_S = 0.85;

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

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - time) < 0.001 && !video.seeking) {
      resolve();
      return;
    }
    const onSeeked = () => resolve();
    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = time;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

/**
 * Soft-loop: one <video> + a canvas holding frame 0.
 *
 * At the loop seam the video stays opaque; only the canvas fades in on top
 * so the ink backdrop never bleeds through as a dark dip. When video is
 * unavailable (reduced motion, saveData, playback failure) nothing renders
 * here at all — the hero's own ink backdrop (HeroSection.css) shows through
 * on its own instead of a static photo.
 */
export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopingRef = useRef(false);
  const frameReadyRef = useRef(false);
  const bootstrappedRef = useRef(false);

  const [mode, setMode] = useState<HeroMediaMode>('pending');
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [loopCover, setLoopCover] = useState(false);
  const [loopSnap, setLoopSnap] = useState(false);

  useEffect(() => {
    setMode(prefersStaticHero() ? 'static' : 'video');
  }, []);

  useEffect(() => {
    if (mode !== 'video' || videoFailed || !videoReady || !frameReadyRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const softLoop = async () => {
      if (loopingRef.current || !frameReadyRef.current) return;
      loopingRef.current = true;

      video.pause();
      setLoopCover(true);
      await delay(LOOP_FADE_MS);

      await seekTo(video, 0);

      setLoopSnap(true);
      setLoopCover(false);
      await delay(32);
      setLoopSnap(false);

      try {
        await video.play();
      } catch {
        setVideoFailed(true);
      }

      loopingRef.current = false;
    };

    const onTimeUpdate = () => {
      if (loopingRef.current || !frameReadyRef.current) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const lead = Math.min(LOOP_FADE_LEAD_S, video.duration / 3);
      if (video.duration - video.currentTime > lead) return;
      void softLoop();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [mode, videoFailed, videoReady]);

  async function bootstrapVideo() {
    if (bootstrappedRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    bootstrappedRef.current = true;
    video.pause();
    await seekTo(video, 0);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frameReadyRef.current = true;
    }

    setVideoReady(true);
    try {
      await video.play();
    } catch {
      setVideoFailed(true);
    }
  }

  const showVideo = mode === 'video' && !videoFailed;

  return (
    <>
      {showVideo ? (
        <>
          <video
            ref={videoRef}
            className="hero-section__image hero-section__video"
            data-ready={videoReady ? 'true' : undefined}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => {
              void bootstrapVideo();
            }}
            onError={() => setVideoFailed(true)}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          <canvas
            ref={canvasRef}
            className="hero-section__image hero-section__loop-frame"
            data-active={loopCover ? 'true' : undefined}
            data-loop-snap={loopSnap ? 'true' : undefined}
            aria-hidden="true"
          />
        </>
      ) : null}
    </>
  );
}
