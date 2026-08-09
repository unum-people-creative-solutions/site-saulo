#!/usr/bin/env python3
"""Generate Saulo Magno Arquitetos mark favicon (black circle + white square).

Source reference: resources-for-planing/logos_saulo.jpeg
(bottom row, middle column — solid black disk with centered white square).

Measured square/diameter ratio ≈ 1/6.

Usage (from site root):
  npm run generate:favicon
  # or: python3 scripts/generate-favicon.py
"""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]

# White square side as a fraction of the circle diameter.
# Reference mark in logos_saulo.jpeg is ~1/6; doubled for favicon legibility at tab size.
SQUARE_RATIO = 1 / 3

CIRCLE_COLOR = (0, 0, 0, 255)
SQUARE_COLOR = (255, 255, 255, 255)

ICO_SIZES = (16, 32, 48)
PNG_ICON_SIZE = 32
APPLE_TOUCH_SIZE = 180
SVG_VIEWBOX = 32

# BOX averages the supersample grid without Lanczos ringing into transparent corners.
_RESAMPLE = getattr(getattr(Image, "Resampling", Image), "BOX", Image.BOX)


def clear_outside_circle(img: Image.Image) -> Image.Image:
    """Force fully transparent pixels outside the disc (kills downscale fringe)."""
    w, h = img.size
    cx = (w - 1) / 2.0
    cy = (h - 1) / 2.0
    radius = min(w, h) / 2.0
    px = img.load()
    for y in range(h):
        for x in range(w):
            if math.hypot(x - cx, y - cy) > radius:
                px[x, y] = (0, 0, 0, 0)
    return img


def render_mark(size: int, *, supersample: int = 4) -> Image.Image:
    """Render the mark at `size` via supersampled drawing for clean edges."""
    scale = max(1, supersample)
    canvas = size * scale
    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1px inset at final resolution keeps the rim AA inside the canvas.
    pad = scale
    draw.ellipse((pad, pad, canvas - 1 - pad, canvas - 1 - pad), fill=CIRCLE_COLOR)

    diameter = canvas - 2 * pad
    side = max(scale, round(diameter * SQUARE_RATIO))
    x0 = (canvas - side) // 2
    y0 = (canvas - side) // 2
    draw.rectangle((x0, y0, x0 + side - 1, y0 + side - 1), fill=SQUARE_COLOR)

    if scale > 1:
        img = img.resize((size, size), _RESAMPLE)
    return clear_outside_circle(img)


def write_svg(path: Path) -> None:
    vb = SVG_VIEWBOX
    # Match raster inset (~1px at 32) so the disc does not touch the viewBox edge.
    r = (vb / 2) - 1
    side = (r * 2) * SQUARE_RATIO
    x = (vb - side) / 2
    y = (vb - side) / 2
    svg = f"""\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}" role="img" aria-label="Saulo Magno Arquitetos">
  <circle cx="{vb / 2}" cy="{vb / 2}" r="{r}" fill="#000"/>
  <rect x="{x}" y="{y}" width="{side}" height="{side}" fill="#fff"/>
</svg>
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(svg, encoding="utf-8")


def write_ico(path: Path) -> None:
    """Pack 16/32/48 PNGs into a multi-resolution .ico (ImageMagick, else Pillow)."""
    convert_bin = shutil.which("convert") or shutil.which("magick")

    with tempfile.TemporaryDirectory(prefix="saulo-favicon-") as tmp:
        tmp_path = Path(tmp)
        pngs = []
        for s in ICO_SIZES:
            p = tmp_path / f"mark-{s}.png"
            render_mark(s).save(p, format="PNG")
            pngs.append(p)

        if convert_bin:
            if Path(convert_bin).name == "magick":
                cmd = [convert_bin, "convert", *[str(p) for p in pngs], str(path)]
            else:
                cmd = [convert_bin, *[str(p) for p in pngs], str(path)]
            subprocess.run(cmd, check=True)
            return

        render_mark(max(ICO_SIZES)).save(
            path,
            format="ICO",
            sizes=[(s, s) for s in ICO_SIZES],
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=ROOT / "src" / "app",
        help="Directory for favicon.ico and icon.png (default: src/app)",
    )
    parser.add_argument(
        "--brand-dir",
        type=Path,
        default=ROOT / "public" / "brand",
        help="Directory for SVG mark (default: public/brand)",
    )
    args = parser.parse_args()

    out_dir: Path = args.out_dir
    brand_dir: Path = args.brand_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    brand_dir.mkdir(parents=True, exist_ok=True)

    ico_path = out_dir / "favicon.ico"
    icon_png_path = out_dir / "icon.png"
    apple_path = out_dir / "apple-icon.png"
    svg_path = brand_dir / "mark-dot.svg"

    write_ico(ico_path)
    render_mark(PNG_ICON_SIZE).save(icon_png_path, format="PNG")
    render_mark(APPLE_TOUCH_SIZE).save(apple_path, format="PNG")
    write_svg(svg_path)

    print(f"Wrote {ico_path.relative_to(ROOT)} ({', '.join(f'{s}x{s}' for s in ICO_SIZES)})")
    print(f"Wrote {icon_png_path.relative_to(ROOT)}")
    print(f"Wrote {apple_path.relative_to(ROOT)}")
    print(f"Wrote {svg_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
