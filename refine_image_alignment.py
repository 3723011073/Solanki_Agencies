from pathlib import Path
from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parent
MASTER_DIR = ROOT / "images" / "catalog_clean" / "master"

CANVAS = 900
FILL = 0.88
DIFF_THRESHOLD = 16
PADDING = 14
MIN_AREA_RATIO = 0.03
CANVAS_BG = (244, 247, 250)


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def corner_average_color(img: Image.Image):
    w, h = img.size
    samples = [
        img.getpixel((0, 0)),
        img.getpixel((w - 1, 0)),
        img.getpixel((0, h - 1)),
        img.getpixel((w - 1, h - 1)),
    ]
    r = sum(p[0] for p in samples) // len(samples)
    g = sum(p[1] for p in samples) // len(samples)
    b = sum(p[2] for p in samples) // len(samples)
    return (r, g, b)


def border_average_color(img: Image.Image):
    w, h = img.size
    edge = max(2, min(w, h) // 30)

    top = img.crop((0, 0, w, edge))
    bottom = img.crop((0, h - edge, w, h))
    left = img.crop((0, edge, edge, h - edge))
    right = img.crop((w - edge, edge, w, h - edge))

    merged = Image.new("RGB", (top.width, top.height + bottom.height + left.height + right.height))
    y = 0
    for part in (top, bottom, left, right):
        merged.paste(part.resize((top.width, part.height)), (0, y))
        y += part.height

    stat = ImageStat.Stat(merged)
    return tuple(int(c) for c in stat.median[:3])


def detect_foreground_bbox(img: Image.Image):
    w, h = img.size
    bg = border_average_color(img)

    bg_img = Image.new("RGB", (w, h), bg)
    diff = ImageChops.difference(img, bg_img)
    gray_diff = ImageOps.grayscale(diff)

    edges = ImageOps.grayscale(img.filter(ImageFilter.FIND_EDGES))
    boosted_edges = edges.point(lambda p: min(255, int(p * 2.2)))

    combined = ImageChops.lighter(gray_diff, boosted_edges)
    mask = combined.point(lambda p: 255 if p > DIFF_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox is None:
        return None, bg

    left, top, right, bottom = bbox
    left = clamp(left - PADDING, 0, w)
    top = clamp(top - PADDING, 0, h)
    right = clamp(right + PADDING, 0, w)
    bottom = clamp(bottom + PADDING, 0, h)

    if right <= left or bottom <= top:
        return None, bg

    area = (right - left) * (bottom - top)
    if area < int(w * h * MIN_AREA_RATIO):
        return None, bg

    return (left, top, right, bottom), bg


def tighten_and_center(path: Path):
    img = Image.open(path).convert("RGB")
    w, h = img.size

    bbox, detected_bg = detect_foreground_bbox(img)
    if bbox is None:
        # Fallback to previous corner sampling when foreground detection is weak.
        bg_color = corner_average_color(img)
        cropped = img
    else:
        bg_color = detected_bg
        cropped = img.crop(bbox)

    cw, ch = cropped.size
    target = int(CANVAS * FILL)
    scale = min(target / max(cw, 1), target / max(ch, 1))
    nw = max(1, int(cw * scale))
    nh = max(1, int(ch * scale))

    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    # Keep a stable light background so every product card appears visually aligned.
    canvas_bg = CANVAS_BG if sum(abs(CANVAS_BG[i] - bg_color[i]) for i in range(3)) < 60 else bg_color
    canvas = Image.new("RGB", (CANVAS, CANVAS), canvas_bg)
    x = (CANVAS - nw) // 2
    y = (CANVAS - nh) // 2
    canvas.paste(resized, (x, y))
    canvas.save(path, format="JPEG", quality=90, optimize=True)


def main():
    files = sorted(MASTER_DIR.glob("*.jpg"))
    processed = 0
    for fp in files:
        tighten_and_center(fp)
        processed += 1
    print(f"Re-aligned {processed} images in {MASTER_DIR}")


if __name__ == "__main__":
    main()
