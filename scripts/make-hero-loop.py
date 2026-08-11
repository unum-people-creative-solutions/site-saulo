#!/usr/bin/env python3
"""Bake a seamless ping-pong loop into the Hero background video.

Why: the hero clip is background footage with organic, non-cyclic motion
(e.g. wind-blown foliage) — its first and last frames never match closely,
so a plain `loop` playback (or a runtime freeze/crossfade hack) makes the
wrap point visibly jump. A ping-pong encode (forward, then the same clip
played backward) sidesteps the problem entirely: the file's last frame is
exactly one playback step from frame 0 in *both* directions, so native
`<video loop>` wraps with zero seam — no JS required.

This trades 2x duration (and a smaller-than-expected size bump, since CRF
encoding is far more efficient than the flat high-bitrate export many
AI video tools produce) for a mathematically perfect loop.

Usage (from site root):
  python3 scripts/make-hero-loop.py <input.mp4> [--crf 23] [--out public/media/hero-video.mp4]

Requires `ffmpeg` on PATH (or set FFMPEG_BIN env var).
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "public" / "media" / "hero-video.mp4"


def ffmpeg_bin() -> str:
    candidate = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg")
    if not candidate:
        try:
            import imageio_ffmpeg  # type: ignore

            candidate = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            pass
    if not candidate:
        raise SystemExit(
            "ffmpeg not found. Install it, set FFMPEG_BIN, or "
            "`pip install imageio-ffmpeg` for a portable binary."
        )
    return candidate


def probe(ffmpeg: str, src: Path) -> tuple[float, float]:
    """Return (duration_s, fps) by parsing `ffmpeg -i` stderr — avoids a
    hard dependency on ffprobe, which portable ffmpeg installs (e.g. the
    `imageio-ffmpeg` PyPI package) don't ship."""
    out = subprocess.run([ffmpeg, "-i", str(src)], capture_output=True, text=True)
    stderr = out.stderr

    duration_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", stderr)
    if not duration_match:
        raise SystemExit("Could not detect duration from ffmpeg output.")
    h, m, s = duration_match.groups()
    duration = int(h) * 3600 + int(m) * 60 + float(s)

    video_line = next((l for l in stderr.splitlines() if "Video:" in l), "")
    fps_match = re.search(r"([\d.]+)\s*fps", video_line)
    if not fps_match:
        raise SystemExit("Could not detect fps from ffmpeg output; pass --fps explicitly.")
    fps = float(fps_match.group(1))

    return duration, fps


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="source clip (any container ffmpeg reads)")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--crf", type=int, default=23, help="x264 CRF, lower = higher quality/size")
    parser.add_argument("--preset", default="medium", help="x264 preset (avoid 'slow'/'veryslow' — much longer encode, marginal gain here)")
    parser.add_argument("--fps", type=int, default=None, help="override detected fps if probing fails")
    args = parser.parse_args()

    ffmpeg = ffmpeg_bin()
    src = args.input.resolve()
    if not src.exists():
        raise SystemExit(f"input not found: {src}")

    duration, detected_fps = probe(ffmpeg, src)
    fps = args.fps or round(detected_fps)
    frame_count = round(duration * fps)
    if frame_count < 4:
        raise SystemExit(f"clip too short to loop ({frame_count} frames)")

    # forward: frames [0, frame_count) — the whole clip.
    # reverse: frames [1, frame_count - 1) played backward — excludes both
    # endpoints so the wrap never repeats a frame (0 -> ... -> N-1 -> ... -> 1 -> 0).
    filter_complex = (
        f"[0:v]trim=start_frame=0:end_frame={frame_count},setpts=PTS-STARTPTS[fwd];"
        f"[0:v]trim=start_frame=1:end_frame={frame_count - 1},setpts=PTS-STARTPTS,reverse[rev];"
        f"[fwd][rev]concat=n=2:v=1:a=0,fps={fps}[outv]"
    )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(src),
        "-filter_complex",
        filter_complex,
        "-map",
        "[outv]",
        "-an",
        "-r",
        str(fps),
        "-vsync",
        "cfr",
        "-c:v",
        "libx264",
        "-crf",
        str(args.crf),
        "-preset",
        args.preset,
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(args.out),
    ]
    print("Running:", " ".join(cmd), file=sys.stderr)
    subprocess.run(cmd, check=True)
    print(f"Wrote seamless ping-pong loop -> {args.out}")


if __name__ == "__main__":
    main()
