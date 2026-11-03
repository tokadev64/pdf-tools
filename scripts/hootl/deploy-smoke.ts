/**
 * 本番 Deploy-smoke（Segment B）
 *
 * Usage:
 *   bun run hootl:deploy-smoke
 */

const BASE = "https://tokaga.me/pdf-tools";

type Check = { name: string; ok: boolean; detail: string };

const checks: Check[] = [];

const withSlash = await fetch(`${BASE}/`, { redirect: "manual" });
const withSlashBody = await withSlash.text();
checks.push({
  name: "GET /pdf-tools/",
  ok:
    withSlash.status === 200 &&
    (withSlashBody.includes("pdf-tools") || withSlashBody.includes('id="app"')),
  detail: `status=${withSlash.status} bytes=${withSlashBody.length}`,
});

const noSlash = await fetch(BASE, { redirect: "manual" });
const location = noSlash.headers.get("location") ?? "";
checks.push({
  name: "GET /pdf-tools redirect",
  ok:
    (noSlash.status === 308 || noSlash.status === 301) && location.includes("tokaga.me/pdf-tools/"),
  detail: `status=${noSlash.status} location=${location}`,
});

const assetMatch =
  withSlashBody.match(/src="([^"]+\.js)"/) ?? withSlashBody.match(/href="([^"]+\.css)"/);
if (assetMatch?.[1]) {
  const assetUrl = new URL(assetMatch[1], `${BASE}/`).href;
  const asset = await fetch(assetUrl, { redirect: "follow" });
  const buf = await asset.arrayBuffer();
  checks.push({
    name: "primary asset",
    ok: asset.status === 200 && buf.byteLength > 0,
    detail: `url=${assetUrl} status=${asset.status} bytes=${buf.byteLength}`,
  });
} else {
  checks.push({
    name: "primary asset",
    ok: false,
    detail: "HTML から js/css 参照を拾えない",
  });
}

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.ok)) {
  process.exit(1);
}
