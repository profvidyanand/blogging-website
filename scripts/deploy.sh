#!/usr/bin/env bash
# Phase 13 deploy helper — run after secrets/vars are configured.
set -euo pipefail

echo "==> Building with OpenNext + deploying to Cloudflare Workers"
npm run deploy

echo "==> Done. Smoke-test:"
echo "  1. Open the Worker URL /admin/login"
echo "  2. Get Topics → Generate Blog → Publish"
echo "  3. Confirm article on public URL + Unsplash featured image"
echo "  4. Optional cron test: npx wrangler dev --test-scheduled"
