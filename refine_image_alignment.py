from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent
MASTER_DIR = ROOT / "images" / "catalog_clean" / "master"

CANVAS = 900
FILL = 0.92
DIFF_THRESHOLD = 18
PADDING = 12


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


def tighten_and_center(path: Path):
    img = Image.open(path).convert("RGB")
    w, h = img.size

    bg_color = corner_average_color(img)
    bg = Image.new("RGB", (w, h), bg_color)

    diff = ImageChops.difference(img, bg).convert("L")
    mask = diff.point(lambda p: 255 if p > DIFF_THRESHOLD else 0)
    bbox = mask.getbbox()

    if bbox is None:
        cropped = img
    else:
        left, top, right, bottom = bbox
        left = clamp(left - PADDING, 0, w)
        top = clamp(top - PADDING, 0, h)
        right = clamp(right + PADDING, 0, w)
        bottom = clamp(bottom + PADDING, 0, h)
        if right <= left or bottom <= top:
            cropped = img
        else:
            cropped = img.crop((left, top, right, bottom))

    cw, ch = cropped.size
    target = int(CANVAS * FILL)
    scale = min(target / max(cw, 1), target / max(ch, 1))
    nw = max(1, int(cw * scale))
    nh = max(1, int(ch * scale))

    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (CANVAS, CANVAS), bg_color)
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
