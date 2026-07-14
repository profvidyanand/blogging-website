# Phase 13 deploy helper (PowerShell)
# Run after wrangler.jsonc vars + secrets are configured.

Write-Host "==> Building with OpenNext + deploying to Cloudflare Workers"
npm run deploy

Write-Host "==> Done. Smoke-test:"
Write-Host "  1. Open the Worker URL /admin/login"
Write-Host "  2. Get Topics → Generate Blog → Publish"
Write-Host "  3. Confirm article on public URL + Unsplash featured image"
Write-Host "  4. Optional cron test: npx wrangler dev --test-scheduled"
