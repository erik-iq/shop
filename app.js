"use strict";
(() => {
  const config = window.SHOP_CONFIG;
  const products = window.SHOP_PRODUCTS;
  const byId = new Map(products.map((p) => [p.id, p]));
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const money = (value) =>
    new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  const disk = (p) =>
    p.storage >= 1024 ? `${p.storage / 1024} To` : `${p.storage} Go`;
  const icons = {
    bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    down: '<path d="M12 3v18m-6-6 6 6 6-6"/>',
    shield:
      '<path d="m12 3 8 4v6c0 4-4 7-8 9-4-2-8-5-8-9V7l8-4Z"/><path d="m8 12 3 3 5-6"/>',
    leaf: '<path d="M20 3c1 13-4 18-10 18-7 0-9-8-4-12 4-3 9-1 14-6Z"/><path d="M4 22 16 10"/>',
    briefcase:
      '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c6 4 12 4 18 0M10 13h4"/>',
    refresh:
      '<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
    battery:
      '<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M23 10v4M6 10v4m4-4v4m4-4v4"/>',
    cursor: '<path d="m4 3 6 17 3-7 7-3L4 3Zm9 10 6 6"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
    ram: '<rect x="2" y="6" width="20" height="11" rx="2"/><path d="M5 17v3m4-3v3m6-3v3m4-3v3M6 9v5m4-5v5m4-5v5m4-5v5"/>',
    ssd: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h18M6 17h1m3 0h1"/>',
    screen:
      '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    layers:
      '<path d="m12 3 10 6-10 6L2 9l10-6Zm-10 12 10 6 10-6M2 12l10 6 10-6"/>',
    print: '<path d="M7 7V2h10v5M7 17H3V8h18v9h-4M7 13h10v9H7v-9ZM17 11h1"/>',
    download: '<path d="M12 2v14m-5-5 5 5 5-5M4 17v5h16v-5"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.bag}</svg>`;
  function hydrateIcons(root = document) {
    root
      .querySelectorAll("[data-icon]")
      .forEach((el) => (el.outerHTML = icon(el.dataset.icon)));
  }
  hydrateIcons();
  let svgId = 0,
    brand = "all",
    query = "",
    usage = "all",
    sort = "featured",
    toastTimer;
  const productDialog = $("#product-dialog"),
    cartDialog = $("#cart-dialog");
  const storageKey = "informaquik.selection.v1";
  const quantityLimit = (p) =>
    Number.isInteger(p.stock) ? Math.max(0, p.stock) : 99;
  function normalizeCart(rows) {
    if (!Array.isArray(rows)) return [];
    const map = new Map();
    for (const row of rows.slice(0, 100)) {
      const p = byId.get(row?.id),
        q = Number(row?.quantity);
      if (!p || !Number.isInteger(q) || q < 1 || quantityLimit(p) < 1) continue;
      map.set(p.id, Math.min(quantityLimit(p), (map.get(p.id) || 0) + q));
    }
    return [...map].map(([id, quantity]) => ({ id, quantity }));
  }
  function readCart() {
    try {
      return normalizeCart(
        JSON.parse(localStorage.getItem(storageKey) || "[]"),
      );
    } catch {
      return [];
    }
  }
  let cart = readCart();
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {}
    updateCount();
  }
  function updateCount() {
    const n = cart.reduce((s, r) => s + r.quantity, 0);
    $("#cart-count").textContent = n;
    $(".cart-trigger").setAttribute(
      "aria-label",
      `Ouvrir le panier, ${n} ordinateur${n > 1 ? "s" : ""}`,
    );
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      2800,
    );
  }
  function laptopSvg(color) {
    const id = "machine-" + ++svgId,
      tint = /^#[0-9a-f]{6}$/i.test(color) ? color : "#89978d";
    return `<svg viewBox="0 0 760 500" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d4dbd0"/><stop offset=".48" stop-color="${tint}"/><stop offset="1" stop-color="#465347"/></linearGradient>
      <linearGradient id="${id}-edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a6b4a4"/><stop offset="1" stop-color="#566454"/></linearGradient>
      <linearGradient id="${id}-display" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#253728"/><stop offset=".45" stop-color="#18251b"/><stop offset="1" stop-color="#08120c"/></linearGradient>
      <radialGradient id="${id}-green"><stop stop-color="#d1ff79" stop-opacity=".4"/><stop offset="1" stop-color="#d1ff79" stop-opacity="0"/></radialGradient>
      <pattern id="${id}-keys" width="25" height="22" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="21" height="18" rx="2" fill="#263029" stroke="#9ead9529" stroke-width="1"/><path d="M8 6h6" stroke="#c9d5c650" stroke-width="1"/></pattern>
      <pattern id="${id}-circuits" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 12h14v12h22M23 0v10h13" fill="none" stroke="#65864c40" stroke-width=".8"/><circle cx="14" cy="12" r="2" fill="#75954b50"/></pattern>
      </defs><ellipse cx="382" cy="429" rx="260" ry="23" fill="#000" opacity=".12"/>
      <g class="lid"><path d="m140 21 479 31c15 1 19 9 15 22l-59 190L53 225 122 35c3-9 8-15 18-14Z" fill="url(#${id}-metal)" stroke="#b8c7b444" stroke-width="2"/><path d="m143 37 467 31-58 178L71 213 134 44c2-5 4-7 9-7Z" fill="#101712" stroke="#28372b" stroke-width="5"/>
      <g transform="matrix(1 .069 -.34 .66 146 45)"><rect width="443" height="245" rx="5" fill="url(#${id}-display)"/><circle cx="355" cy="125" r="155" fill="url(#${id}-green)"/><path d="M28 50h384M28 195h384" stroke="#b2d09c22"/>
      <text x="30" y="34" fill="#bac8aa" font-size="11" font-family="Arial,sans-serif" letter-spacing="2">INFORMAQUIK SHOP</text><text x="31" y="111" fill="#ecf2df" font-size="35" font-family="Arial,sans-serif" font-weight="600">Ready for</text><text x="31" y="150" fill="#d1ff79" font-size="35" font-family="Georgia,serif" font-style="italic">what’s next.</text>
      <rect x="31" y="172" width="122" height="4" rx="2" fill="#d1ff79" opacity=".6"/><circle cx="317" cy="116" r="45" fill="none" stroke="#b9d89c33" stroke-width="1"/><circle cx="317" cy="116" r="32" fill="none" stroke="#b9d89c20" stroke-dasharray="4 6"/><path d="m306 126 22-22m-20 0h20v20" fill="none" stroke="#d1ff79" stroke-width="4"/>
      <text x="31" y="224" fill="#6a825c" font-size="8" font-family="Arial,sans-serif" letter-spacing="1.4">PROFESSIONAL. RECONDITIONED. YOURS.</text></g><circle cx="370" cy="48" r="2.3" fill="#e2ebd5"/><path d="m54 227 520 36-1 7-521-37Z" fill="#29332b"/></g>
      <path d="m54 240 521 36 132 89-4 12-495 58L33 300l3-16Z" fill="url(#${id}-edge)" stroke="#60745b88"/><path d="m54 238 521 36 132 89-498 60L35 288Z" fill="#18231a" stroke="#8ea28088" stroke-width="1.3"/>
      <g class="interior" transform="matrix(1 .07 .62 .41 85 258)"><rect x="0" y="0" width="455" height="210" rx="12" fill="#223823"/><rect x="4" y="4" width="447" height="202" rx="9" fill="url(#${id}-circuits)" stroke="#79945a55"/>
      <path d="M82 42h54v40h96M190 97v25h61M227 45h52M399 65v64h-62" fill="none" stroke="#a8c07a55" stroke-width="2"/>
      <circle cx="55" cy="54" r="37" fill="#111c14" stroke="#728c6255" stroke-width="3"/>
      ${Array.from({ length: 12 }, (_, i) => `<path d="M53 49q16-27 27-4q-21-9-22 12Z" fill="#5a7150" opacity=".9" transform="rotate(${i * 30} 55 54)"/>`).join("")}<circle cx="55" cy="54" r="9" fill="#899d76"/>
      <path d="M84 26q60-20 81 1v11H87Z" fill="#a49169" stroke="#c8b88a" stroke-width="1"/>
      <rect x="146" y="19" width="86" height="70" rx="5" fill="#18281a" stroke="#d1ff79" stroke-width="1.8"/><rect x="157" y="28" width="64" height="49" rx="3" fill="#708361"/>
      <text x="170" y="58" font-family="Arial,sans-serif" font-size="15" fill="#d8e6c4" font-weight="700">CPU</text><g fill="#bfd399">${Array.from({ length: 7 }, (_, i) => `<rect x="${151 + i * 11}" y="13" width="5" height="4"/><rect x="${151 + i * 11}" y="92" width="5" height="4"/>`).join("")}</g>
      <rect x="267" y="16" width="139" height="28" rx="3" fill="#466039" stroke="#8ca66d"/><rect x="267" y="53" width="139" height="28" rx="3" fill="#3f5734" stroke="#8ca66d"/>
      ${Array.from({ length: 4 }, (_, i) => `<rect x="${277 + i * 31}" y="20" width="23" height="19" rx="1" fill="#19271b"/><rect x="${277 + i * 31}" y="57" width="23" height="19" rx="1" fill="#19271b"/>`).join("")}
      <path d="M277 44h118M277 81h118" stroke="#c3b37a" stroke-width="3"/>
      <rect x="315" y="104" width="112" height="28" rx="4" fill="#71845d" stroke="#adc386"/><rect x="324" y="108" width="65" height="19" rx="2" fill="#cad8b9"/><text x="332" y="120" font-size="8" font-family="Arial,sans-serif" fill="#456031">NVMe SSD</text><circle cx="418" cy="118" r="3" fill="#baca9d"/>
      <rect x="92" y="142" width="210" height="48" rx="7" fill="#0c170f" stroke="#536949"/>
      <path d="M142 145v42m50-42v42m50-42v42" stroke="#29402c" stroke-width="2"/><text x="152" y="170" font-family="Arial,sans-serif" font-size="8" letter-spacing="2" fill="#869d72">BATTERY</text>
      <path d="M304 165h52v-22h72" fill="none" stroke="#d1ff7966" stroke-width="2"/><g fill="#afc494">${[
        [12, 12],
        [444, 12],
        [12, 196],
        [444, 196],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`)
        .join("")}</g></g>
      <ellipse class="chip-glow" cx="304" cy="310" rx="85" ry="28" fill="url(#${id}-green)"/>
      <g class="deck"><path d="m54 237 521 36 132 89-498 60L35 288Z" fill="url(#${id}-metal)" stroke="#cbd7c35a"/>
      <g transform="matrix(1 .07 .62 .41 91 254)"><rect width="445" height="121" rx="5" fill="#3d483c" stroke="#adc19b44"/><rect x="5" y="5" width="435" height="109" rx="4" fill="url(#${id}-keys)"/><rect x="136" y="94" width="137" height="14" rx="3" fill="#263029"/><circle cx="221" cy="52" r="4" fill="#e27467"/></g>
      <path d="m273 335 114 8 59 40-126 15-62-48Z" fill="#a2b19977" stroke="#55695177" stroke-width="1"/><path d="m65 292 121 91" stroke="#d8e1d07a" stroke-width="1"/><text x="532" y="342" fill="#d9e4d188" font-size="10" font-family="Arial,sans-serif" transform="rotate(7 532 342)">PRO</text></g>
      <path d="m214 429 87-10-2 4-81 9Z" fill="#d8e1cf" opacity=".45"/><path d="m77 327 23 17-1 5-24-17Z" fill="#1c2b1d"/><path d="m119 360 20 14-1 5-20-14Z" fill="#1c2b1d"/><path d="m164 389 15 10-1 4-15-10Z" fill="#1c2b1d"/><circle cx="626" cy="388" r="2" fill="#d1ff79"/>
      </svg>`;
  }
  function machine(p, { open = false, interactive = true, readout = "" } = {}) {
    return `<div class="machine ${open ? "is-open" : ""}" data-product="${esc(p.id)}" data-pinned="${open}" data-readout="${esc(readout)}">${laptopSvg(p.color)}${interactive ? `<button class="explore-toggle" data-action="explore" aria-expanded="${open}" aria-label="Explorer l’intérieur du ${esc(p.brand + " " + p.model)}">${icon("layers")}<span>${open ? "Refermer le portable" : "Explorer l’intérieur"}</span></button>${["cpu", "ram", "ssd", "battery"].map((key, i) => `<button class="hotspot ${key}" data-action="component" data-component="${key}" aria-label="${{ cpu: "Processeur", ram: "Mémoire RAM", ssd: "Stockage SSD", battery: "Batterie" }[key]} du ${esc(p.model)}" tabindex="${open ? "0" : "-1"}">${i + 1}</button>`).join("")}<span class="machine-note">Vue illustrée</span>` : ""}</div>`;
  }
  function componentContent(p, key) {
    const data = {
      cpu: ["Processeur", p.cpu, "Le moteur de vos applications."],
      ram: [
        "Mémoire RAM",
        p.ram + " Go",
        "Pour travailler sur plusieurs applications.",
      ],
      ssd: [
        "Stockage SSD",
        disk(p),
        "Votre espace pour les applications et fichiers.",
      ],
      battery: [
        "Batterie",
        "Garantie " + config.batteryWarrantyMonths + " mois",
        p.battery,
      ],
    };
    const [label, value, hint] = data[key] || data.cpu;
    return `<div><strong>${esc(value)}</strong><small>${esc(label)}</small></div><span></span><div>${esc(hint)}</div>`;
  }
  const heroProduct = products[0];
  $("#hero-machine").innerHTML = machine(heroProduct, {
    readout: "hero-readout",
  });
  $("#hero-readout").innerHTML =
    `<div><strong>${esc(heroProduct.cpuShort)}</strong><small>PROCESSEUR</small></div><span></span><div><strong>${heroProduct.ram} Go</strong><small>MÉMOIRE RAM</small></div><span></span><div><strong>${disk(heroProduct)} SSD</strong><small>STOCKAGE</small></div>`;
  function setOpen(el, open) {
    el.classList.toggle("is-open", open);
    const toggle = $(".explore-toggle", el);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      $("span", toggle).textContent = open
        ? "Refermer le portable"
        : "Explorer l’intérieur";
    }
    el.querySelectorAll(".hotspot").forEach(
      (button) => (button.tabIndex = open ? 0 : -1),
    );
  }
  function wireMachines(root = document) {
    root.querySelectorAll(".machine:not([data-wired])").forEach((el) => {
      el.dataset.wired = "true";
      el.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") setOpen(el, true);
      });
      el.addEventListener("pointerleave", () => {
        if (
          el.dataset.pinned !== "true" &&
          !el.contains(document.activeElement)
        )
          setOpen(el, false);
      });
      el.addEventListener("focusin", () => setOpen(el, true));
      el.addEventListener("focusout", (event) => {
        if (el.dataset.pinned !== "true" && !el.contains(event.relatedTarget))
          setOpen(el, false);
      });
    });
  }
  const brandNames = ["all", ...new Set(products.map((p) => p.brand))];
  function renderBrands() {
    $("#brand-filters").innerHTML = brandNames
      .map(
        (b) =>
          `<button data-action="brand" data-brand="${esc(b)}" class="${b === brand ? "active" : ""}" aria-pressed="${b === brand}">${esc(b === "all" ? "Tous les PC" : b)}<span>${products.filter((p) => b === "all" || p.brand === b).length}</span></button>`,
      )
      .join("");
  }
  const normalized = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function productCard(p) {
    return `<article class="product-card" data-id="${esc(p.id)}"><div class="product-art" data-action="details" data-id="${esc(p.id)}"><span class="product-tag">${esc(p.tag)}</span>${machine(p, { interactive: false })}<button class="art-detail" data-action="details" data-id="${esc(p.id)}" aria-label="Découvrir le ${esc(p.brand + " " + p.model)}">${icon("arrow")}</button></div><div class="product-info"><div class="product-meta"><span>${esc(p.brand)}</span><span class="grade">${p.grade ? "Grade " + esc(p.grade) : p.touch ? "Tactile · 360°" : "Gamme pro"}</span></div><h3><button class="product-title" data-action="details" data-id="${esc(p.id)}">${esc(p.model)}</button></h3><p class="product-generation">${esc(p.generation)} · Reconditionné</p><div class="product-specs"><span class="spec-chip">${icon("cpu")}${esc(p.cpuShort)}</span><span class="spec-chip">${icon("ram")}${p.ram} Go</span><span class="spec-chip">${icon("ssd")}${disk(p)}</span></div><p class="product-screen">${icon("screen")}${esc(p.screen)} · ${esc(p.os)}</p><div class="product-footer"><div><span class="price">${p.price}.–<small>${esc(config.currency)}</small></span><p class="price-note">TVA 8,1 % incluse</p></div><button class="add-button" data-action="add" data-id="${esc(p.id)}" aria-label="Ajouter le ${esc(p.brand + " " + p.model)} au panier" ${p.stock === 0 ? "disabled" : ""}>${icon("bag")}Ajouter</button></div></div></article>`;
  }
  function renderProducts() {
    let rows = products.filter(
      (p) =>
        (brand === "all" || p.brand === brand) &&
        (usage === "all" ||
          p.usage === usage ||
          (usage === "touch" && p.touch)) &&
        normalized(
          [p.brand, p.model, p.cpu, p.os, p.ram, p.storage].join(" "),
        ).includes(normalized(query.trim())),
    );
    if (sort === "price-asc") rows.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") rows.sort((a, b) => b.price - a.price);
    if (sort === "ram-desc") rows.sort((a, b) => b.ram - a.ram);
    $("#products").innerHTML = rows.map(productCard).join("");
    $("#result-count").textContent =
      `${rows.length} ordinateur${rows.length > 1 ? "s" : ""} · reconditionnés, gamme pro`;
    $("#empty-results").hidden = rows.length !== 0;
    wireMachines($("#products"));
  }
  function productDetails(id) {
    const p = byId.get(id);
    if (!p) return;
    productDialog.innerHTML = `<button class="dialog-close" data-action="product-close" aria-label="Fermer la fiche produit">${icon("close")}</button><div class="detail-layout"><div class="detail-art"><span>LA GAMME PRO, UNE SECONDE FOIS.</span>${machine(p, { open: true, readout: "detail-readout" })}<div class="component-readout" id="detail-readout" aria-live="polite">${componentContent(p, "cpu")}</div><p class="detail-art-note">Explorez les quatre points pour découvrir les composants. L’illustration explique la configuration et ne représente pas le châssis exact du modèle.</p></div><div class="detail-copy"><span class="eyebrow">${esc(p.brand)} / ${esc(p.generation)}</span><h2 id="product-title">${esc(p.model)}</h2><p class="detail-description">${esc(p.description)}</p><div class="detail-badges"><span class="grade">Reconditionné · ${p.grade ? "Grade " + esc(p.grade) : p.touch ? "Tactile · 360°" : "Gamme pro"}</span><span class="grade">${esc(p.condition)}</span></div><dl class="detail-specs">${[["Processeur", p.cpu], ["Mémoire RAM", p.ram + " Go " + (p.ramType || "")], ["Stockage SSD", disk(p) + " " + (p.storageType || "")], ["Écran", p.screen], ["Définition", p.resolution], ["Système", p.os], ...(p.gpu ? [["Graphique", p.gpu]] : []), ["Connectique", p.ports], ["Batterie", p.battery], ["Provenance", p.origin]].map(([key, val]) => `<div><dt>${esc(key)}</dt><dd>${esc(val)}</dd></div>`).join("")}</dl><p class="detail-guarantee">${icon("shield")}Ordinateur : ${config.computerWarrantyMonths} mois de garantie.<br>Batterie : ${config.batteryWarrantyMonths} mois.</p><div class="detail-purchase"><span class="price">${p.price}.–<small>${esc(config.currency)}</small></span><button class="button dark" data-action="add" data-id="${esc(p.id)}" ${p.stock === 0 ? "disabled" : ""}>${icon("bag")}Ajouter au panier</button></div><p class="stock-note">${Number.isInteger(p.stock) ? p.stock + " exemplaire(s) disponible(s)" : "Disponibilité à confirmer"} · Prix TTC, TVA 8,1 %.</p></div></div>`;
    productDialog.setAttribute("aria-labelledby", "product-title");
    wireMachines(productDialog);
    productDialog.showModal();
    $(".dialog-close", productDialog).focus();
  }
  function addToCart(id) {
    const p = byId.get(id);
    if (!p) return;
    const row = cart.find((r) => r.id === id);
    if ((row?.quantity || 0) >= quantityLimit(p)) {
      toast("La quantité disponible est déjà dans votre sélection.");
      return;
    }
    if (row) row.quantity++;
    else cart.push({ id, quantity: 1 });
    persist();
    if (cartDialog.open) renderCart();
    toast(p.brand + " " + p.model + " ajouté à votre sélection.");
  }
  function total() {
    return cart.reduce(
      (sum, row) => sum + byId.get(row.id).price * row.quantity,
      0,
    );
  }
  function renderCart() {
    const n = cart.reduce((s, row) => s + row.quantity, 0);
    cartDialog.innerHTML = `<div class="cart-shell"><div class="cart-header"><span class="eyebrow">UNE NOUVELLE HISTOIRE SE PRÉPARE.</span><h2 id="cart-title">Votre sélection<span>.</span></h2><button class="dialog-close" data-action="cart-close" aria-label="Fermer le panier">${icon("close")}</button></div><div class="cart-items">${
      cart.length
        ? cart
            .map((row) => {
              const p = byId.get(row.id);
              return `<article class="cart-item"><div class="cart-thumb">${machine(p, { interactive: false })}</div><div class="cart-item-copy"><span>${esc(p.brand)} · RECONDITIONNÉ</span><h3>${esc(p.model)}</h3><p>${esc(p.cpuShort)} · ${p.ram} Go RAM · ${disk(p)} SSD</p><div class="cart-item-bottom"><div class="quantity"><button data-action="quantity-down" data-id="${esc(p.id)}" aria-label="Diminuer la quantité de ${esc(p.model)}">−</button><span aria-label="Quantité">${row.quantity}</span><button data-action="quantity-up" data-id="${esc(p.id)}" aria-label="Augmenter la quantité de ${esc(p.model)}" ${row.quantity >= quantityLimit(p) ? "disabled" : ""}>+</button></div><strong>${money(p.price * row.quantity)}</strong></div><button class="cart-remove" data-action="remove" data-id="${esc(p.id)}">Retirer de la sélection</button></div></article>`;
            })
            .join("")
        : `<div class="cart-empty">${icon("bag")}Votre prochaine machine vous attend.<br>Découvrez les ordinateurs pour préparer votre sélection.<br><button class="button dark" style="margin-top:20px" data-action="cart-close">Découvrir la collection</button></div>`
    }</div>${cart.length ? `<div class="cart-total"><div><span>Total indicatif · ${n} ordinateur${n > 1 ? "s" : ""}</span><strong>${money(total())}</strong></div><p>Chaque ordinateur : garantie ${config.computerWarrantyMonths} mois.<br>Batterie : garantie ${config.batteryWarrantyMonths} mois.</p><button class="button dark" data-action="export">${icon("download")}Exporter ma sélection</button><button class="button secondary" data-action="print">${icon("print")}Imprimer / enregistrer en PDF</button>${config.contactEmail ? '<button class="button lime" data-action="contact">Demander une offre</button>' : ""}<small class="cart-demo">Votre sélection prépare une offre. Aucun paiement n’est effectué sur cette version.</small></div>` : ""}</div>`;
  }
  function openCart() {
    renderCart();
    cartDialog.showModal();
    $(".dialog-close", cartDialog).focus();
  }
  function quoteHtml() {
    const date = new Intl.DateTimeFormat(config.locale, {
      dateStyle: "long",
      timeZone: "Europe/Zurich",
    }).format(new Date());
    return `<!doctype html><html lang="fr"><meta charset="utf-8"><title>${esc(config.name)} — Sélection</title><style>body{font:14px Arial,sans-serif;color:#25301f;max-width:850px;margin:50px auto;padding:25px}h1{font-size:35px;letter-spacing:-2px}h1 span{color:#7b965b}h2{font-size:23px;font-weight:500}p{line-height:1.8;color:#7c876f;font-size:12px}table{border-collapse:collapse;width:100%;font-size:12px;margin:30px 0}th{text-align:left;background:#eaf0df;padding:14px}td{padding:17px 14px;border-bottom:1px solid #e2e7db;vertical-align:top}small{display:block;color:#798b68;margin-top:7px;line-height:1.6}.total{text-align:right;font-size:25px}.guarantee{border:1px solid #d9e1cc;padding:20px;margin-top:30px}.demo{border-top:1px solid #e2e7db;margin-top:30px;padding-top:15px}footer{margin-top:50px;font-size:11px;color:#8c9880}@media print{body{margin:0;max-width:none;padding:20px}tr{break-inside:avoid}.guarantee{break-inside:avoid}}</style><body><h1>${esc(config.name)}</h1><p>La performance a une seconde vie.</p><h2>Votre sélection d’ordinateurs</h2><p>${date}</p><table><thead><tr><th>Ordinateur professionnel reconditionné</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr></thead><tbody>${cart
      .map((row) => {
        const p = byId.get(row.id);
        return `<tr><td><strong>${esc(p.brand + " " + p.model)}</strong><small>${esc(p.cpu)} · ${p.ram} Go RAM · ${disk(p)} SSD<br>${esc(p.screen)} · ${esc(p.os)} · ${p.grade ? "Grade " + esc(p.grade) : p.touch ? "Tactile · 360°" : "Gamme pro"}</small></td><td>${row.quantity}</td><td>${money(p.price)}</td><td>${money(p.price * row.quantity)}</td></tr>`;
      })
      .join(
        "",
      )}</tbody></table><div class="total">Total indicatif : <strong>${money(total())}</strong></div><div class="guarantee"><strong>Garantie ordinateur : ${config.computerWarrantyMonths} mois.</strong><p>Garantie batterie : ${config.batteryWarrantyMonths} mois.</p></div><p class="demo">Prix TTC, TVA 8,1 % incluse. Disponibilité, état et provenance de chaque lot à confirmer. Cette sélection n’est ni une commande ni une facture.</p><footer>Ordinateurs professionnels reconditionnés · ${esc(config.name)}</footer></body></html>`;
  }
  function downloadQuote() {
    const url = URL.createObjectURL(
      new Blob([quoteHtml()], { type: "text/html;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "INFORMAQUIK-ma-selection.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Votre sélection est téléchargée.");
  }
  function printQuote() {
    const popup = window.open("", "_blank");
    if (!popup) {
      toast("Autorisez cette fenêtre pour imprimer votre sélection.");
      return;
    }
    popup.document.open();
    popup.document.write(quoteHtml());
    popup.document.close();
    let printed = false;
    const print = () => {
      if (printed) return;
      printed = true;
      popup.focus();
      popup.print();
    };
    popup.addEventListener("load", print, { once: true });
    if (popup.document.readyState === "complete") setTimeout(print, 150);
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === "brand") {
      brand = button.dataset.brand;
      renderBrands();
      renderProducts();
      $("#brand-filters")
        .querySelector(`[data-brand="${CSS.escape(brand)}"]`)
        ?.focus();
    }
    if (action === "details") productDetails(id);
    if (action === "product-close") productDialog.close();
    if (action === "cart-open") openCart();
    if (action === "cart-close") cartDialog.close();
    if (action === "add") addToCart(id);
    if (action === "remove") {
      cart = cart.filter((r) => r.id !== id);
      persist();
      renderCart();
    }
    if (action === "quantity-up" || action === "quantity-down") {
      const row = cart.find((r) => r.id === id);
      if (!row) return;
      const wanted = row.quantity + (action === "quantity-up" ? 1 : -1);
      if (wanted <= 0) cart = cart.filter((r) => r.id !== id);
      else row.quantity = Math.min(quantityLimit(byId.get(id)), wanted);
      persist();
      renderCart();
      cartDialog
        .querySelector(`[data-action="${action}"][data-id="${CSS.escape(id)}"]`)
        ?.focus();
    }
    if (action === "reset-filters") {
      brand = "all";
      usage = "all";
      query = "";
      sort = "featured";
      $("#usage").value = usage;
      $("#search").value = query;
      $("#sort").value = sort;
      renderBrands();
      renderProducts();
    }
    if (action === "explore") {
      const el = button.closest(".machine");
      el.dataset.pinned = el.dataset.pinned === "true" ? "false" : "true";
      setOpen(el, el.dataset.pinned === "true");
    }
    if (action === "component") {
      const el = button.closest(".machine"),
        p = byId.get(el.dataset.product),
        readout = document.getElementById(el.dataset.readout);
      if (readout)
        readout.innerHTML = componentContent(p, button.dataset.component);
      el.querySelectorAll(".hotspot").forEach((b) =>
        b.classList.toggle("selected", b === button),
      );
    }
    if (action === "export") downloadQuote();
    if (action === "print") printQuote();
    if (action === "contact" && config.contactEmail) {
      const body = cart
        .map(
          (row) =>
            `${row.quantity} × ${byId.get(row.id).brand} ${byId.get(row.id).model} — ${money(byId.get(row.id).price * row.quantity)}`,
        )
        .join("\n");
      window.location.href = `mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent("Demande d’offre — " + config.name)}&body=${encodeURIComponent("Bonjour,\n\nJe souhaiterais une offre pour cette sélection :\n" + body + "\n\nTotal indicatif : " + money(total()) + "\n\nMerci.")}`;
    }
  });
  $("#search").addEventListener("input", (event) => {
    query = event.target.value;
    renderProducts();
  });
  $("#usage").addEventListener("change", (event) => {
    usage = event.target.value;
    renderProducts();
  });
  $("#sort").addEventListener("change", (event) => {
    sort = event.target.value;
    renderProducts();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "SELECT", "TEXTAREA"].includes(
        document.activeElement.tagName,
      ) &&
      !productDialog.open &&
      !cartDialog.open
    ) {
      event.preventDefault();
      $("#search").focus();
    }
  });
  for (const dialog of [productDialog, cartDialog]) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
    });
    new MutationObserver(() => {
      document.body.style.overflow =
        productDialog.open || cartDialog.open ? "hidden" : "";
    }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  }
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      cart = readCart();
      updateCount();
      if (cartDialog.open) renderCart();
    }
  });
  renderBrands();
  renderProducts();
  wireMachines();
  updateCount();
})();
