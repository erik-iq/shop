import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const context = { window: {} };
for (const file of ["catalogue.js", "commerce.js"])
  vm.runInNewContext(
    readFileSync(new URL("../" + file, import.meta.url), "utf8"),
    context,
  );
const { SHOP_SERVICES: services, SHOP_COMMERCE: c } = context.window;
test("Les huit prestations sont disponibles sans tarif inventé", () => {
  assert.equal(services.length, 8);
  assert.equal(new Set(c.items.map((p) => p.id)).size, 18);
  for (const p of services) {
    assert.equal(p.price, null);
    assert.equal(c.isService(p), true);
    assert.ok(p.description);
    assert.doesNotMatch(c.name(p), /undefined/);
  }
});
test("Le panier de services seuls reste sur devis et ne présente pas un total zéro", () => {
  const result = c.summarize([{ id: services[0].id, quantity: 2 }], true);
  assert.equal(result.knownTotal, null);
  assert.equal(result.hasQuote, true);
  assert.equal(result.count, 2);
  assert.equal(result.computers, 0);
});
test("Le panier mixte indique un sous-total connu et garde les prestations à chiffrer", () => {
  const rows = [
    { id: "hp-1030-g7", quantity: 2 },
    { id: services[0].id, quantity: 1 },
  ];
  const result = c.summarize(rows, true);
  assert.equal(result.knownTotal, 1398);
  assert.equal(result.hasQuote, true);
  assert.equal(result.services, 1);
  const hidden = c.summarize(rows, false);
  assert.equal(hidden.knownTotal, null);
  assert.equal(hidden.hasQuote, true);
});
