import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(new URL("../pricing.js", import.meta.url), "utf8");

function pricingHarness({
  protocol = "https:",
  storage = new Map(),
  storageBlocked = false,
} = {}) {
  const requests = [],
    events = [];
  let response = { showPrices: true },
    failed = false;
  const window = {
    SHOP_CONFIG: { showPrices: true },
    dispatchEvent: (e) => events.push(e.type),
    addEventListener() {},
  };
  vm.runInNewContext(source, {
    window,
    location: { protocol },
    document: { hidden: false },
    sessionStorage: {
      getItem(key) {
        if (storageBlocked) throw new Error("Blocked");
        return storage.get(key);
      },
      setItem(key, value) {
        if (storageBlocked) throw new Error("Blocked");
        storage.set(key, value);
      },
    },
    CustomEvent: class {
      constructor(type) {
        this.type = type;
      }
    },
    AbortSignal,
    setInterval() {},
    fetch: async (url, options) => {
      requests.push({ url, method: options.method || "GET" });
      if (failed) throw new Error("Network failure");
      return { ok: true, status: 200, json: async () => response };
    },
  });
  return {
    pricing: window.SHOP_PRICING,
    requests,
    events,
    showPrices(value) {
      response = { showPrices: value };
    },
    fail() {
      failed = true;
    },
  };
}

test("L’aperçu masque les prix dans cet onglet, persiste et ne modifie pas le serveur", async () => {
  const storage = new Map();
  const first = pricingHarness({ storage });
  await first.pricing.ready;
  assert.equal(first.pricing.visible, true);
  first.pricing.togglePreview();
  assert.equal(first.pricing.visible, false);
  assert.equal(first.pricing.siteVisible, true);
  await first.pricing.refresh();
  assert.equal(first.pricing.visible, false);
  const reloaded = pricingHarness({ storage });
  await reloaded.pricing.ready;
  assert.equal(reloaded.pricing.visible, false);
  reloaded.pricing.togglePreview();
  assert.equal(reloaded.pricing.visible, true);
  const independent = pricingHarness();
  await independent.pricing.ready;
  assert.equal(independent.pricing.visible, true);
  assert.ok(first.events.includes("shop:pricingchange"));
  assert.ok(
    first.requests.every(
      (r) => r.url === "/api/settings" && r.method === "GET",
    ),
  );
});

test("L’aperçu ne peut réafficher ni les prix masqués par l’administration ni ceux d’un serveur indisponible", async () => {
  const { pricing, showPrices, fail } = pricingHarness();
  await pricing.ready;
  pricing.togglePreview();
  showPrices(false);
  await pricing.refresh();
  pricing.togglePreview();
  assert.equal(pricing.visible, false);
  assert.equal(pricing.siteVisible, false);
  showPrices(true);
  await pricing.refresh();
  assert.equal(pricing.visible, true);
  fail();
  await pricing.refresh();
  pricing.togglePreview();
  pricing.togglePreview();
  assert.equal(pricing.visible, false);
  assert.equal(pricing.mode, "error");
});

test("L’aperçu fonctionne hors ligne même si le stockage du navigateur est bloqué", async () => {
  const { pricing, requests } = pricingHarness({
    protocol: "file:",
    storageBlocked: true,
  });
  await pricing.ready;
  assert.equal(pricing.visible, true);
  pricing.togglePreview();
  assert.equal(pricing.visible, false);
  pricing.togglePreview();
  assert.equal(pricing.visible, true);
  assert.equal(requests.length, 0);
});
