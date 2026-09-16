#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  printf '%s\n' "Vercel CLI is required. Install it with: npm install --global vercel" >&2
  exit 1
fi

if [[ ! -f "vercel.json" || ! -f "index.html" ]]; then
  printf '%s\n' "Run this script from the repository root containing index.html and vercel.json." >&2
  exit 1
fi

printf '%s\n' "Deploying Cuisine Caritative to Vercel in production..."
vercel --prod "$@"
