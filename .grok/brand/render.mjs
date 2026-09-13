import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".css": "text/css",
};

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const file = join(root, url === "/" ? "og-card.html" : url.slice(1));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end("no");
    return;
  }
  res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({ args: ["--disable-web-security"] });

const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`${origin}/og-card.html`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(100);
await page.screenshot({ path: join(root, "og-raw.png"), type: "png" });

const zoom = await browser.newPage({ viewport: { width: 640, height: 320 }, deviceScaleFactor: 1 });
await zoom.goto(`${origin}/pixel-zoom.html`, { waitUntil: "networkidle" });
await zoom.waitForTimeout(80);
await zoom.screenshot({ path: join(root, "pixel-zoom.png"), type: "png" });

await browser.close();
server.close();
console.log("rendered");
