import json
import math
import os
import re
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parent
CATALOG_DIR = ROOT / "catalog"
OUTPUT_DIR = ROOT / "images" / "catalog_clean" / "master"
PRODUCTS_FILE = ROOT / "products.json"

TARGET_SIZE = 900
DPI = 150
GRID_ROWS = 2
GRID_COLS = 3
MIN_CONTENT_RATIO = 0.04

CATEGORY_MAP = {
    "plato": "Crockery & Dinnerware",
    "dinewell": "Crockery & Dinnerware",
    "porcelain": "Crockery & Dinnerware",
    "dinex": "Crockery & Dinnerware",
    "vanras": "Buffet & Display Ware",
    "catalog 1": "Cookware & Kitchen Essentials",
    "catalog 2": "Cookware & Kitchen Essentials",
    "catalouge": "Cookware & Kitchen Essentials",
}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or "catalog"


def humanize_catalog_name(file_name: str) -> str:
    stem = Path(file_name).stem
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem


def infer_category(catalog_name: str) -> str:
    lower = catalog_name.lower()
    for key, category in CATEGORY_MAP.items():
        if key in lower:
            return category
    return "Hotelware"


def choose_price(index: int) -> int:
    # Deterministic but varied price bands for large catalogs.
    bands = [95, 125, 165, 215, 295, 345, 425, 575, 695, 895, 1095, 1495]
    return bands[index % len(bands)]


def render_page_to_image(page: fitz.Page) -> Image.Image:
    matrix = fitz.Matrix(DPI / 72.0, DPI / 72.0)
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return img


def crop_page_margins(img: Image.Image) -> Image.Image:
    w, h = img.size
    left = int(w * 0.03)
    right = int(w * 0.97)
    top = int(h * 0.08)
    bottom = int(h * 0.93)
    if right <= left or bottom <= top:
        return img
    return img.crop((left, top, right, bottom))


def content_ratio(img: Image.Image) -> float:
    gray = img.convert("L")
    pixels = gray.load()
    w, h = gray.size
    non_bg = 0
    total = w * h
    threshold = 245
    for y in range(h):
        for x in range(w):
            if pixels[x, y] < threshold:
                non_bg += 1
    return non_bg / max(total, 1)


def detail_score(img: Image.Image) -> float:
    gray = img.convert("L")
    stat = ImageStat.Stat(gray)
    # Standard deviation captures whether a tile has meaningful detail.
    return float(stat.stddev[0])


def is_useful_tile(img: Image.Image) -> bool:
    ratio = content_ratio(img)
    if ratio < MIN_CONTENT_RATIO:
        return False

    # Reject near-solid tiles and decorative backgrounds that have very low variation.
    detail = detail_score(img)
    if detail < 16.0:
        return False

    gray = img.convert("L")
    entropy = gray.entropy()
    if entropy < 3.2:
        return False

    trimmed = trim_whitespace(img)
    tw, th = trimmed.size
    w, h = img.size
    if tw >= int(w * 0.95) and th >= int(h * 0.95) and detail < 22.0:
        return False

    return True


def trim_whitespace(img: Image.Image) -> Image.Image:
    gray = img.convert("L")
    pixels = gray.load()
    w, h = gray.size
    threshold = 245

    min_x, min_y = w, h
    max_x, max_y = 0, 0

    for y in range(h):
        for x in range(w):
            if pixels[x, y] < threshold:
                if x < min_x:
                    min_x = x
                if y < min_y:
                    min_y = y
                if x > max_x:
                    max_x = x
                if y > max_y:
                    max_y = y

    if min_x > max_x or min_y > max_y:
        return img

    pad = 10
    left = max(min_x - pad, 0)
    top = max(min_y - pad, 0)
    right = min(max_x + pad + 1, w)
    bottom = min(max_y + pad + 1, h)
    return img.crop((left, top, right, bottom))


def normalize_tile(img: Image.Image) -> Image.Image:
    trimmed = trim_whitespace(img)
    canvas = Image.new("RGB", (TARGET_SIZE, TARGET_SIZE), (243, 247, 251))

    src_w, src_h = trimmed.size
    scale = min((TARGET_SIZE * 0.92) / max(src_w, 1), (TARGET_SIZE * 0.92) / max(src_h, 1))
    new_w = max(1, int(src_w * scale))
    new_h = max(1, int(src_h * scale))
    resized = trimmed.resize((new_w, new_h), Image.Resampling.LANCZOS)

    left = (TARGET_SIZE - new_w) // 2
    top = (TARGET_SIZE - new_h) // 2
    canvas.paste(resized, (left, top))
    return canvas


def split_into_tiles(page_img: Image.Image):
    w, h = page_img.size
    tile_w = w // GRID_COLS
    tile_h = h // GRID_ROWS

    tiles = []
    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            left = col * tile_w
            top = row * tile_h
            right = w if col == GRID_COLS - 1 else (col + 1) * tile_w
            bottom = h if row == GRID_ROWS - 1 else (row + 1) * tile_h
            tiles.append((row, col, page_img.crop((left, top, right, bottom))))
    return tiles


def build():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Clean old generated files for deterministic output.
    for old_file in OUTPUT_DIR.glob("*.jpg"):
        old_file.unlink(missing_ok=True)

    pdf_files = sorted(CATALOG_DIR.glob("*.pdf"))
    all_products = []
    product_id = 1

    for pdf_path in pdf_files:
        catalog_name = humanize_catalog_name(pdf_path.name)
        catalog_slug = slugify(catalog_name)
        category = infer_category(catalog_name)

        doc = fitz.open(pdf_path)
        catalog_count = 0

        for page_index in range(doc.page_count):
            page = doc.load_page(page_index)
            page_img = render_page_to_image(page)
            page_img = crop_page_margins(page_img)

            for row, col, tile in split_into_tiles(page_img):
                if not is_useful_tile(tile):
                    continue

                normalized = normalize_tile(tile)
                tile_index = row * GRID_COLS + col + 1
                file_name = f"{catalog_slug}_p{page_index + 1:03d}_t{tile_index}.jpg"
                output_path = OUTPUT_DIR / file_name
                normalized.save(output_path, format="JPEG", quality=86, optimize=True)

                catalog_count += 1
                global_index = len(all_products) + 1
                all_products.append({
                    "id": product_id,
                    "name": f"{catalog_name} Item {page_index + 1}-{tile_index}",
                    "category": category,
                    "desc": f"Product extracted from {catalog_name}, page {page_index + 1}, tile {tile_index}.",
                    "price": choose_price(global_index),
                    "stock": 20 + (global_index * 7) % 180,
                    "image": f"/images/catalog_clean/master/{file_name}"
                })
                product_id += 1

        print(f"Processed {catalog_name}: {catalog_count} products")

    with PRODUCTS_FILE.open("w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2)

    print(f"\nGenerated {len(all_products)} products in total")
    print(f"Images written to: {OUTPUT_DIR}")


if __name__ == "__main__":
    build()
