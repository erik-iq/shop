"use strict";
(() => {
  const localValue = window.SHOP_CONFIG.showPrices !== false;
  const web = /^https?:$/.test(location.protocol);
  let mode = web ? "loading" : "local",
    visible = web ? false : localValue,
    error = "";
  const previewKey = "informaquik.prices-preview.v1";
  let previewHidden = false;
  try {
    previewHidden = sessionStorage.getItem(previewKey) === "hidden";
  } catch {}
  function notify() {
    window.dispatchEvent(new CustomEvent("shop:pricingchange"));
  }
  async function refresh() {
    if (!web) return;
    try {
      const r = await fetch("/api/settings", {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (r.status === 404) {
        mode = "local";
        visible = localValue;
        error = "";
        notify();
        return;
      }
      if (!r.ok) throw new Error("Réglages indisponibles");
      const settings = await r.json();
      if (typeof settings.showPrices !== "boolean")
        throw new Error("Réglages invalides");
      const changed = visible !== settings.showPrices || mode !== "server";
      mode = "server";
      visible = settings.showPrices;
      error = "";
      if (changed) notify();
    } catch {
      mode = "error";
      visible = false;
      error =
        "Impossible de charger les réglages du site. Les prix restent masqués.";
      notify();
    }
  }
  const ready = web ? refresh() : Promise.resolve();
  window.SHOP_PRICING = {
    get visible() {
      return visible && !previewHidden;
    },
    get siteVisible() {
      return visible;
    },
    get previewHidden() {
      return previewHidden;
    },
    togglePreview() {
      previewHidden = !previewHidden;
      try {
        sessionStorage.setItem(
          previewKey,
          previewHidden ? "hidden" : "visible",
        );
      } catch {}
      notify();
    },
    get mode() {
      return mode;
    },
    get error() {
      return error;
    },
    ready,
    refresh,
  };
  if (web) {
    setInterval(() => {
      if (mode === "server" && !document.hidden) refresh();
    }, 30000);
    window.addEventListener("focus", () => {
      if (mode === "server" || mode === "error") refresh();
    });
  }
})();
