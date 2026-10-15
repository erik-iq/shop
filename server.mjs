import http from "node:http";
import { readFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const allowed = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/style.css", "style.css"],
  ["/app.js", "app.js"],
  ["/catalogue.js", "catalogue.js"],
  ["/photos.js", "photos.js"],
  ["/pages.js", "pages.js"],
  ["/assets/favicon.svg", "assets/favicon.svg"],
]);
for (const file of readdirSync(path.join(root, "assets"), {
  recursive: true,
})) {
  if (/\.(?:png|jpg|jpeg|webp|svg|avif)$/.test(file))
    allowed.set("/assets/" + file.replaceAll("\\", "/"), "assets/" + file);
}
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const file = allowed.get(pathname);
    if (!file) {
      res.writeHead(404);
      res.end("Introuvable");
      return;
    }
    const data = await readFile(path.join(root, file));
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)],
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(500);
    res.end("Erreur");
  }
});
server.listen(
  Number(process.env.PORT || 4173),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log("Informaquik Shop prêt sur le port " + server.address().port),
);
