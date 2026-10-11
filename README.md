# pdf-tools

PDF to Markdown conversion and PDF splitting in the browser.

Production URL: https://tokaga.me/pdf-tools/

Run `bun run dev` for local development and `bun run build` to build.
Those scripts call vite-plus (`vp`), which needs Node.js 24 on `PATH`.
Tests, the CLI, and other scripts run on Bun.
The build writes to `dist/pdf-tools/` so Cloudflare can serve assets at their
actual `/pdf-tools/` paths. Hash routes (`#/` and `#/split`) remain unchanged.

Pushes to `main` and manual runs of the Deploy to Cloudflare workflow deploy
static assets to Cloudflare Workers and then install a zone redirect rule.
Configure the repository Actions secret `CLOUDFLARE_API_TOKEN` with Workers
Scripts Edit, Zone Workers Routes Edit, Zone Read, and Dynamic URL Redirects
Write for the account and `tokaga.me` zone specified in `wrangler.toml`.
The domain must already have a proxied DNS record, as it does for
`twitter-movie-downloader`.

The Worker routes cover only `/pdf-tools` and `/pdf-tools/*`.
A redirect rule matches host `tokaga.me` and path `/pdf-tools` exactly,
including when a query string is present, and redirects to `/pdf-tools/`
while keeping that query string. It does not match `/pdf-tools-other`.
GitHub Pages deployment is replaced by this workflow. Existing content on
`tokadev.io/pdf-tools/` is not removed or redirected by a Cloudflare deployment;
retire or redirect that old site separately after verifying the new deployment.
