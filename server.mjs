import http from "node:http";
import { createAdminApi } from "./admin-api.mjs";
import { readFile, stat } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const adminApi = await createAdminApi({
  dataDir: process.env.DATA_DIR || path.join(root, "data"),
  password: process.env.ADMIN_PASSWORD || "",
  publicOrigin: process.env.PUBLIC_ORIGIN || "",
});
const allowed = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/style.css", "style.css"],
  ["/app.js", "app.js"],
  ["/commerce.js", "commerce.js"],
  ["/pricing.js", "pricing.js"],
  ["/admin.js", "admin.js"],
  ["/catalogue.js", "catalogue.js"],
  ["/photos.js", "photos.js"],
  ["/pages.js", "pages.js"],
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
// Reuse the representation until the source file changes, including during development.
const cache = new Map();
async function resource(file) {
  const full = path.join(root, file),
    info = await stat(full);
  const stamp = `${info.mtimeMs}:${info.size}`;
  if (cache.get(file)?.stamp === stamp) return cache.get(file);
  const data = await readFile(full);
  const text = /\.(?:html|css|js|svg)$/.test(file);
  const result = {
    stamp,
    data,
    hash: createHash("sha256").update(data).digest("hex"),
    br: text
      ? brotliCompressSync(data, {
          params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
        })
      : null,
    gzip: text ? gzipSync(data) : null,
  };
  cache.set(file, result);
  return result;
}
function accepts(value, encoding) {
  return String(value || "")
    .split(",")
    .some((part) => {
      const [name, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return name === encoding && (!q || Number(q.trim().slice(2)) > 0);
    });
}
const server = http.createServer(async (req, res) => {
  try {
    if (
      await adminApi.handle(
        req,
        res,
        new URL(req.url, "http://localhost").pathname,
      )
    )
      return;
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    const file = allowed.get(new URL(req.url, "http://localhost").pathname);
    if (!file) {
      res.writeHead(404);
      res.end("Introuvable");
      return;
    }
    const asset = await resource(file),
      accept = req.headers["accept-encoding"];
    const encoding =
      asset.br && accepts(accept, "br")
        ? "br"
        : asset.gzip && accepts(accept, "gzip")
          ? "gzip"
          : null;
    const body = encoding ? asset[encoding] : asset.data;
    const etag = `"${asset.hash}-${encoding || "identity"}"`;
    const headers = {
      "Content-Type": mime[path.extname(file)],
      "Cache-Control": "public, max-age=0, must-revalidate",
      ETag: etag,
      Vary: "Accept-Encoding",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
    };
    if (encoding) headers["Content-Encoding"] = encoding;
    const tags = String(req.headers["if-none-match"] || "")
      .split(",")
      .map((s) => s.trim().replace(/^W\//, ""));
    if (tags.includes(etag) || tags.includes("*")) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
    res.writeHead(200, { ...headers, "Content-Length": body.length });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    res.writeHead(error.code === "ENOENT" ? 404 : 500);
    res.end("Erreur");
  }
});
server.listen(
  Number(process.env.PORT || 4173),
  process.env.HOST || "127.0.0.1",
  () => console.log("Informaquik prêt sur le port " + server.address().port),
);
