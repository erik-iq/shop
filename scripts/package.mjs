import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (name) => readFile(path.join(root, name), "utf8");
const [html, css, catalogue, photos, app, pages, favicon] = await Promise.all(
  [
    "index.html",
    "style.css",
    "catalogue.js",
    "photos.js",
    "app.js",
    "pages.js",
    "assets/favicon.svg",
  ].map(read),
);
const imageTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};
const embeddedAssets = [];
for (const name of await readdir(path.join(root, "assets"), {
  recursive: true,
})) {
  const mime = imageTypes[path.extname(name)];
  if (!mime) continue;
  const data = await readFile(path.join(root, "assets", name));
  embeddedAssets.push([
    "assets/" + name.replaceAll("\\", "/"),
    "data:" + mime + ";base64," + data.toString("base64"),
  ]);
}
const embedAssets = (text) =>
  embeddedAssets.reduce((s, [src, data]) => s.replaceAll(src, data), text);
const safeScript = (text) => text.replace(/<\/script/gi, "<\\/script");
const standalone = embedAssets(html)
  .replace(
    /<link\b[^>]*href=["']style\.css["'][^>]*>/i,
    () => `<style>${css}</style>`,
  )
  .replace(
    /^[ \t]*<script\b[^>]*src=["'](?:catalogue|photos|app|pages)\.js["'][^>]*>\s*<\/script>[ \t]*\r?\n?/gim,
    "",
  )
  .replace(
    'href="assets/favicon.svg"',
    () =>
      `href="data:image/svg+xml;base64,${Buffer.from(favicon).toString("base64")}"`,
  )
  .replace(
    "</body>",
    () =>
      `<script>${safeScript(catalogue)}</script><script>${safeScript(embedAssets(photos))}</script><script>${safeScript(app)}</script><script>${safeScript(pages)}</script></body>`,
  );
const instructions = `INFORMAQUIK SHOP — BOUTIQUE VISUELLE\r\n\r\n1. Extraire le ZIP avec « Extraire tout ».\r\n2. Double-cliquer sur Informaquik-Shop.html : la boutique s’ouvre dans votre navigateur.\r\n3. Les photos présentent chaque modèle. Survoler le portable ou utiliser « Explorer les composants » pour le schéma pédagogique.\r\n4. Filtrer les marques, rechercher un modèle, consulter sa fiche et préparer une sélection.\r\n5. Le menu propose aussi Le reconditionné, Entreprises, Bien choisir, Garanties et Contact.\r\n6. Le panier reste dans ce navigateur. L’export et l’impression permettent de conserver la sélection.\r\n\r\nAucune application, aucun serveur ni connexion Internet ne sont nécessaires.\r\nDix configurations issues des fiches fournies ; garantie ordinateur 24 mois, batterie 6 mois.\r\nPrix TTC en CHF. Disponibilité, état de batterie et provenance des lots à compléter.\r\nCette version ne reçoit ni commande ni paiement.\r\n`;
const digest = createHash("sha256").update(standalone).digest("hex");
const sums = `${digest}  Informaquik-Shop.html\n`;
// Archive ZIP standard sans dépendance : stockage direct, CRC-32, en-têtes et index central.
const table = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = (data) => {
  let crc = 0xffffffff;
  for (const b of data) crc = (crc >>> 8) ^ table[(crc ^ b) & 255];
  return (crc ^ 0xffffffff) >>> 0;
};
function zip(entries) {
  const chunks = [],
    central = [];
  let offset = 0;
  for (const [filename, value] of entries) {
    const name = Buffer.from("Informaquik-Shop/" + filename),
      data = Buffer.from(value),
      crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    chunks.push(local, name, data);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x800, 8);
    cd.writeUInt16LE(0x21, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(data.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt32LE(offset, 42);
    central.push(cd, name);
    offset += local.length + name.length + data.length;
  }
  const index = Buffer.concat(central),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(index.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, index, end]);
}
await mkdir(path.join(root, "downloads"), { recursive: true });
const archive = zip([
  ["Informaquik-Shop.html", standalone],
  ["LISEZ-MOI.txt", instructions],
  ["SHA256SUMS.txt", sums],
]);
await writeFile(path.join(root, "downloads/Informaquik-Shop.html"), standalone);
await writeFile(path.join(root, "downloads/Informaquik-Shop.zip"), archive);
await writeFile(
  path.join(root, "downloads/SHA256SUMS.txt"),
  sums +
    createHash("sha256").update(archive).digest("hex") +
    "  Informaquik-Shop.zip\n",
);
console.log("Version autonome et ZIP générés ; SHA-256 : " + digest);
