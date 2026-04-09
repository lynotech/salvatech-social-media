#!/usr/bin/env python3
"""
SalvaTech — Panoramic Carousel Composer

Composes a character image over a panoramic background,
then slices into carousel slides.

Usage:
  python pipeline/compose-panorama.py \
    --background posts/{slug}/assets/panorama-bg.jpg \
    --character posts/{slug}/assets/mascote.png \
    --output-dir posts/{slug}/assets/slices \
    --slides 7 \
    --char-position 0 \
    --char-scale 0.85

Arguments:
  --background    Panoramic background image (wide, e.g. 7560x1350)
  --character     Character image with transparency (PNG)
  --output-dir    Directory to save sliced slides
  --slides        Number of slides (default: 7)
  --char-position Which slide the character is centered on (0-indexed, default: 0)
  --char-scale    Scale of character relative to slide height (default: 0.85)
  --char-offset-x Horizontal pixel offset from center of target slide (default: 0)
  --char-offset-y Vertical pixel offset from bottom (default: 0)
"""

import argparse
import os
import sys

try:
    from PIL import Image, ImageFilter
except ImportError:
    print("ERROR: Pillow is required. Install with: pip install Pillow", file=sys.stderr)
    sys.exit(1)


SLIDE_WIDTH = 1080
SLIDE_HEIGHT = 1350


def compose_and_slice(bg_path, char_path, output_dir, num_slides,
                      char_position, char_scale, char_offset_x, char_offset_y):
    """Compose character over panoramic background and slice into slides."""

    # Load images
    bg = Image.open(bg_path).convert('RGBA')
    char_img = Image.open(char_path).convert('RGBA')

    total_width = SLIDE_WIDTH * num_slides
    total_height = SLIDE_HEIGHT

    # Resize background to fit panorama dimensions
    bg_resized = bg.resize((total_width, total_height), Image.LANCZOS)

    # Scale character
    char_target_height = int(total_height * char_scale)
    char_aspect = char_img.width / char_img.height
    char_target_width = int(char_target_height * char_aspect)
    char_resized = char_img.resize((char_target_width, char_target_height), Image.LANCZOS)

    # Position character on the target slide
    slide_center_x = (char_position * SLIDE_WIDTH) + (SLIDE_WIDTH // 2)
    char_x = slide_center_x - (char_target_width // 2) + char_offset_x
    char_y = total_height - char_target_height - char_offset_y

    # Create glow behind character
    glow = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
    # Simple purple glow ellipse
    glow_width = int(char_target_width * 1.5)
    glow_height = int(char_target_height * 0.8)
    glow_layer = Image.new('RGBA', (glow_width, glow_height), (0, 0, 0, 0))

    # Draw radial gradient for glow
    for y in range(glow_height):
        for x in range(glow_width):
            dx = (x - glow_width / 2) / (glow_width / 2)
            dy = (y - glow_height / 2) / (glow_height / 2)
            dist = (dx * dx + dy * dy) ** 0.5
            if dist < 1.0:
                alpha = int(90 * (1.0 - dist))
                glow_layer.putpixel((x, y), (151, 85, 255, alpha))

    glow_x = slide_center_x - (glow_width // 2)
    glow_y = total_height - glow_height - char_offset_y + int(char_target_height * 0.2)
    glow.paste(glow_layer, (glow_x, glow_y), glow_layer)

    # Compose: background + glow + character
    composite = Image.alpha_composite(bg_resized, glow)
    composite = Image.alpha_composite(composite, Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0)))

    # Paste character
    char_layer = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
    char_layer.paste(char_resized, (char_x, char_y), char_resized)
    composite = Image.alpha_composite(composite, char_layer)

    # Save full panorama
    os.makedirs(output_dir, exist_ok=True)
    panorama_path = os.path.join(output_dir, '..', 'panorama-full.jpg')
    composite.convert('RGB').save(panorama_path, 'JPEG', quality=95)
    print(f"  Panorama: {panorama_path} ({total_width}x{total_height})")

    # Slice into slides
    for i in range(num_slides):
        left = i * SLIDE_WIDTH
        right = left + SLIDE_WIDTH
        slide = composite.crop((left, 0, right, total_height))
        slide_path = os.path.join(output_dir, f'slice-{i+1:02d}.jpg')
        slide.convert('RGB').save(slide_path, 'JPEG', quality=95)
        print(f"  Slice {i+1}: {slide_path}")

    print(f"\n  {num_slides} slices saved to {output_dir}")


def main():
    parser = argparse.ArgumentParser(description='Compose panoramic carousel')
    parser.add_argument('--background', required=True, help='Panoramic background image')
    parser.add_argument('--character', required=True, help='Character PNG with transparency')
    parser.add_argument('--output-dir', required=True, help='Output directory for slices')
    parser.add_argument('--slides', type=int, default=7, help='Number of slides')
    parser.add_argument('--char-position', type=int, default=0, help='Slide index for character (0-indexed)')
    parser.add_argument('--char-scale', type=float, default=0.85, help='Character height as fraction of slide')
    parser.add_argument('--char-offset-x', type=int, default=0, help='Horizontal offset from center')
    parser.add_argument('--char-offset-y', type=int, default=0, help='Vertical offset from bottom')
    args = parser.parse_args()

    if not os.path.exists(args.background):
        print(f"ERROR: Background not found: {args.background}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(args.character):
        print(f"ERROR: Character not found: {args.character}", file=sys.stderr)
        sys.exit(1)

    print(f"\n  🐒 Panoramic Composer")
    print(f"  Slides: {args.slides} | Character on slide: {args.char_position + 1}")
    print(f"  Scale: {args.char_scale} | Offset: ({args.char_offset_x}, {args.char_offset_y})\n")

    compose_and_slice(
        args.background, args.character, args.output_dir,
        args.slides, args.char_position, args.char_scale,
        args.char_offset_x, args.char_offset_y
    )


if __name__ == '__main__':
    main()
