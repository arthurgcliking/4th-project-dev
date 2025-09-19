#!/usr/bin/env bash
set -euo pipefail

# Requiert: brew install webp
SRC_ROOT="assets/images"
OUT_BASE="assets/img"
QUALITY=82
SIZES=(400 800 1200)

# Parcourt JPG/JPEG/PNG, convertit en WebP + versions redimensionnées
while IFS= read -r -d '' f; do
  rel="${f#${SRC_ROOT}/}"            # ex: gallery/portraits/xxx.jpg
  stem="${rel%.*}"                   # ex: gallery/portraits/xxx
  name="$(basename "$stem")"         # ex: xxx
  dir="$(dirname "$rel")"            # ex: gallery/portraits

  # Dossier sortie "plein format"
  outdir="${OUT_BASE}/webp/${dir}"
  mkdir -p "$outdir"
  cwebp -q "${QUALITY}" "$f" -o "${outdir}/${name}.webp" >/dev/null

  # Tailles 400/800/1200
  for w in "${SIZES[@]}"; do
    sizedir="${OUT_BASE}/webp_${w}/${dir}"
    mkdir -p "$sizedir"
    cwebp -q "${QUALITY}" -resize "${w}" 0 "$f" -o "${sizedir}/${name}.webp" >/dev/null
  done

  printf '✓ %s -> webp + [%s]\n' "$rel" "$(IFS=,; echo "${SIZES[*]}")"
done < <(find "$SRC_ROOT" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

echo "Done. Outputs under: ${OUT_BASE}/webp{,_400,_800,_1200}/…"
