#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d .patches ]]; then
  exit 0
fi

export LC_ALL=C
for target in app.js index.html styles.css; do
  shopt -s nullglob
  parts=(.patches/${target}.patch.part-*)
  shopt -u nullglob
  if (( ${#parts[@]} == 0 )); then
    continue
  fi
  patch_file="/tmp/${target}.patch"
  cat "${parts[@]}" > "$patch_file"
  patch --batch --forward -p0 < "$patch_file"
done
