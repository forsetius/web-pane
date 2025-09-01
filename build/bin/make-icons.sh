#!/usr/bin/env bash
set -euo pipefail

SRC="../icons/logo.png"         # 1024x1024 PNG or bigger
OUT="../icons"
LIN="$OUT/set"

mkdir -p "$LIN"

# PNG for Linux and as a base for .ico/.icns
for s in 16 24 32 48 64 128 256 512 1024; do
  convert "$SRC" -resize ${s}x${s} "$LIN/${s}x${s}.png"
done

# ICO for Windows (multi-size)
convert \
  "$LIN/16x16.png" "$LIN/24x24.png" "$LIN/32x32.png" "$LIN/48x48.png" \
  "$LIN/64x64.png" "$LIN/128x128.png" "$LIN/256x256.png" \
  "$OUT/icon.ico"

# ICNS for macOS (png2icns will use "slots")
png2icns "$OUT/icon.icns" \
  "$LIN/16x16.png" "$LIN/32x32.png" "$LIN/64x64.png" \
  "$LIN/128x128.png" "$LIN/256x256.png" "$LIN/512x512.png" "$LIN/1024x1024.png"

echo "Done generating: $OUT/icon.icns, $OUT/icon.ico, $LIN/*.png"
