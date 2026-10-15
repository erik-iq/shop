import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const context = { window: {} };
vm.runInNewContext(
  readFileSync(new URL("../catalogue.js", import.meta.url), "utf8"),
  context,
);
vm.runInNewContext(
  readFileSync(new URL("../photos.js", import.meta.url), "utf8"),
  context,
);
const { SHOP_PRODUCTS: products, SHOP_CONFIG: config } = context.window;
test("Les dix configurations fournies sont distinctes et conservent leurs prix de vente", () => {
  assert.equal(products.length, 10);
  assert.equal(new Set(products.map((p) => p.id)).size, 10);
  const expected = {
    "hp-1030-g7": 699,
    "lenovo-x13-yoga-gen2": 799,
    "hp-850-g7-i7": 799,
    "hp-850-g7-i5": 799,
    "hp-850-g8": 799,
    "hp-zbook-studio-g7": 1499,
    "hp-1030-g8": 799,
    "hp-probook-435-g10": 799,
    "lenovo-t14-gen1": 599,
    "lenovo-t14s-gen2": 799,
  };
  for (const p of products) {
    assert.equal(p.price, expected[p.id]);
    assert.equal("cost" in p, false);
    assert.equal("margin" in p, false);
    assert.equal("purchasePrice" in p, false);
  }
});
test("La mémoire et le stockage restent ceux des fiches, notamment 250 Go et les variantes i5/i7", () => {
  const p = (id) => products.find((p) => p.id === id);
  assert.equal(p("hp-1030-g7").storage, 250);
  assert.equal(p("lenovo-t14s-gen2").storage, 250);
  assert.equal(p("hp-850-g7-i5").storage, 512);
  assert.equal(p("hp-850-g7-i7").storage, 256);
  assert.equal(p("hp-850-g8").ram, 32);
  assert.equal(p("hp-zbook-studio-g7").gpu, "NVIDIA Quadro T2000");
});
test("Les contradictions graphiques et la diagonale du X13 sont à confirmer, sans inventer de correction", () => {
  const amd = products.find((p) => p.id === "hp-probook-435-g10");
  assert.match(amd.cpu, /confirmer/);
  assert.doesNotMatch(amd.gpu, /Intel/);
  assert.equal(amd.review.length, 2);
  const x13 = products.find((p) => p.id === "lenovo-x13-yoga-gen2");
  assert.doesNotMatch(x13.screen, /14/);
  assert.ok(x13.review.length);
});
test("Les quantités, grades, origines et états de batterie inconnus ne sont pas fabriqués", () => {
  for (const p of products) {
    assert.equal(p.stock, null);
    assert.equal(p.grade, null);
    assert.match(p.origin, /préciser/);
    assert.match(p.battery, /communiquer/);
  }
});
test("Le nom, les garanties confirmées et la TVA suisse sont appliqués", () => {
  assert.equal(config.name, "Informaquik Shop");
  assert.equal(config.computerWarrantyMonths, 24);
  assert.equal(config.batteryWarrantyMonths, 6);
  assert.equal(config.taxRate, 0.081);
  assert.equal(config.currency, "CHF");
});
test("La distribution autonome contient les ressources nécessaires et ses sommes de contrôle correspondent", async () => {
  const { createHash } = await import("node:crypto");
  const base = new URL("../downloads/", import.meta.url),
    html = readFileSync(new URL("Informaquik-Shop.html", base), "utf8"),
    sums = readFileSync(new URL("SHA256SUMS.txt", base), "utf8");
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href="style\.css"/i);
  assert.match(html, /<style>/);
  assert.match(html, /window.SHOP_PRODUCTS/);
  assert.match(html, /composants illustrés/);
  for (const filename of ["Informaquik-Shop.html", "Informaquik-Shop.zip"]) {
    const expected = sums
      .split("\n")
      .find((line) => line.endsWith("  " + filename))
      .split(" ")[0];
    assert.equal(
      createHash("sha256")
        .update(readFileSync(new URL(filename, base)))
        .digest("hex"),
      expected,
    );
  }
});

test("Chaque référence possède des photos locales du modèle, sourcées et valides", () => {
  const unique = new Set();
  for (const product of products) {
    assert.ok(product.photos.length >= 1, product.id);
    for (const photo of product.photos) {
      assert.match(photo.src, /^assets\/products\/[a-z0-9-]+\.(jpg|png)$/);
      assert.match(photo.source, /^https:\/\//);
      assert.match(photo.sourcePage, /^https:\/\//);
      assert.ok(photo.credit && photo.alt);
      const bytes = readFileSync(new URL("../" + photo.src, import.meta.url));
      assert.ok(bytes.length > 10000);
      if (photo.src.endsWith(".png"))
        assert.equal(bytes.subarray(1, 4).toString(), "PNG");
      else assert.equal(bytes.readUInt16BE(0), 0xffd8);
      unique.add(photo.src);
    }
  }
  assert.equal(unique.size, 15);
  const i5 = products.find((p) => p.id === "hp-850-g7-i5");
  const i7 = products.find((p) => p.id === "hp-850-g7-i7");
  assert.equal(i5.photos, i7.photos);
});
test("La distribution incorpore les photos et logos pour un fonctionnement hors ligne", () => {
  const html = readFileSync(
    new URL("../downloads/Informaquik-Shop.html", import.meta.url),
    "utf8",
  );
  const unique = new Set(
    products.flatMap((p) => p.photos.map((photo) => photo.src)),
  );
  for (const src of unique) {
    const base64 = readFileSync(new URL("../" + src, import.meta.url)).toString(
      "base64",
    );
    assert.ok(html.includes(base64), src);
    assert.equal(html.includes(src), false);
  }
  for (const asset of [
    "assets/brands/anydesk.svg",
    "assets/brands/teamviewer.svg",
    "assets/informaquik-logo.png",
  ]) {
    const base64 = readFileSync(
      new URL("../" + asset, import.meta.url),
    ).toString("base64");
    assert.ok(html.includes(base64), asset);
    assert.equal(html.includes(asset), false);
  }
  assert.match(html, /id="home-root"/);
  assert.match(html, /id="editorial-root"/);
  assert.match(html, /id="guide-form"/);
  assert.match(html, /id="contact-form"/);
});
