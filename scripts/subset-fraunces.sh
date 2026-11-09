#!/usr/bin/env bash
# Regenerates src/assets/fonts/fraunces-subset-*.woff2 from the @fontsource-variable "full" files.
# Needs: pip install fonttools brotli. Output is committed, so this only runs when the ranges change.
#   wght 300..700  lightest is the macOS lock-screen clock, heaviest is Classic and Landing
#   SOFT 0..40     highest used value is .mac-serif
#   opsz 9..144    kept whole because font-optical-sizing is auto
#   WONK 0         never turned on
# Keep UNICODES in step with the unicode-range in src/styles/fonts.css.
set -euo pipefail
SRC=node_modules/@fontsource-variable/fraunces/files
OUT=src/assets/fonts
UNICODES="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026"
TMP=$(mktemp -d)
mkdir -p "$OUT"
for style in normal italic; do
  fonttools varLib.instancer "$SRC/fraunces-latin-full-$style.woff2" wght=300:700 SOFT=0:40 WONK=0 -o "$TMP/$style.woff2" -q
  pyftsubset "$TMP/$style.woff2" --unicodes="$UNICODES" --layout-features='rvrn,kern,liga,clig,calt,ccmp,locl,mark,mkmk,lnum,onum,pnum,tnum' \
    --flavor=woff2 --output-file="$OUT/fraunces-subset-$style.woff2"
done
rm -rf "$TMP"
