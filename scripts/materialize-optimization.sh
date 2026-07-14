#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d .payload ]]; then
  exit 0
fi

export LC_ALL=C

declare -A expected=(
  [app.js]="f4be0b45acb787bc7ec74ca672be8a61c211e643d4b1982a56fee23992ac55b2"
  [index.html]="c22bc6ca678da1023a88aa3593ac7758705a56fca7f34ceea862e97298a6b850"
  [styles.css]="bcffa2a5845e1fe21ac29c466c00c6a29e159ce3159e50ac81568d31c8911c59"
)

for target in app.js index.html styles.css; do
  shopt -s nullglob
  parts=(.payload/${target}.part-*)
  shopt -u nullglob
  if (( ${#parts[@]} == 0 )); then
    echo "Missing payload parts for ${target}" >&2
    exit 1
  fi

  temporary="${target}.materialized"
  cat "${parts[@]}" | base64 --decode | gzip --decompress > "$temporary"
  actual="$(sha256sum "$temporary" | awk '{print $1}')"
  if [[ "$actual" != "${expected[$target]}" ]]; then
    echo "Checksum mismatch for ${target}: ${actual}" >&2
    rm -f "$temporary"
    exit 1
  fi
  mv "$temporary" "$target"
done

echo "Optimized source materialized and checksums verified"
