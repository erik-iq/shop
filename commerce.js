"use strict";
(() => {
  const items = [...window.SHOP_PRODUCTS, ...window.SHOP_SERVICES];
  const byId = new Map(items.map((p) => [p.id, p]));
  const isService = (p) => p?.kind === "service";
  const name = (p) => (isService(p) ? p.model : `${p.brand} ${p.model}`);
  const describe = (p) =>
    isService(p)
      ? p.description
      : `${p.cpu} · ${p.ram} Go RAM · ${p.storage} Go SSD`;
  const priced = (p, visible) =>
    visible && Number.isFinite(p.price) && p.price >= 0;
  function summarize(rows, visible) {
    const valid = rows.filter((r) => byId.has(r.id));
    const hasPriced = valid.some((r) => priced(byId.get(r.id), visible));
    return {
      count: valid.reduce((n, r) => n + r.quantity, 0),
      computers: valid
        .filter((r) => !isService(byId.get(r.id)))
        .reduce((n, r) => n + r.quantity, 0),
      services: valid
        .filter((r) => isService(byId.get(r.id)))
        .reduce((n, r) => n + r.quantity, 0),
      hasQuote: valid.some((r) => !priced(byId.get(r.id), visible)),
      knownTotal: hasPriced
        ? valid.reduce(
            (n, r) =>
              n +
              (priced(byId.get(r.id), visible)
                ? byId.get(r.id).price * r.quantity
                : 0),
            0,
          )
        : null,
    };
  }
  window.SHOP_COMMERCE = {
    items,
    byId,
    isService,
    name,
    describe,
    priced,
    summarize,
  };
})();
