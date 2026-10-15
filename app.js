"use strict";
(() => {
  const config = window.SHOP_CONFIG;
  const products = window.SHOP_PRODUCTS;
  const { byId, isService, name, describe, priced, summarize } =
    window.SHOP_COMMERCE;
  const prices = window.SHOP_PRICING;
  const hasPrice = (p) => priced(p, prices.visible);
  const priceMarkup = (p) =>
    hasPrice(p)
      ? `<span class="price">${p.price}.–<small>${esc(config.currency)}</small></span>`
      : `<span class="price quote-label">Sur devis</span>`;
  let detailId = null;
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
    tools:
      '<path d="m14 6 4 4M3 21l7-7m3-9a6 6 0 0 0-7 7L2 20l2 2 8-4a6 6 0 0 0 7-7l-4 3-5-5 3-4Z"/>',
    server:
      '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5"/>',
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
  let brand = "all",
    query = "",
    usage = "all",
    sort = "featured",
    toastTimer;
  const productDialog = $("#product-dialog"),
    cartDialog = $("#cart-dialog"),
    optionsDialog = $("#options-dialog");
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
      `Ouvrir le panier, ${n} article${n > 1 ? "s" : ""}`,
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
  function photoMarkup(p, eager = false) {
    const photo = p.photos?.[0];
    return photo
      ? `<img class="machine-photo" src="${esc(photo.src)}" alt="${esc(photo.alt)}" width="1000" height="750" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""} decoding="async">`
      : `<div class="photo-pending"><span>${icon("screen")}</span><strong>${esc(p.brand)} ${esc(p.model)}</strong><small>Photo du modèle en préparation</small></div>`;
  }
  function machine(p, { open = false, interactive = true, readout = "" } = {}) {
    return `<div class="machine photographic ${open ? "is-open" : ""}" data-product="${esc(p.id)}" data-pinned="${open}" data-readout="${esc(readout)}"><div class="photo-stage">${photoMarkup(p, readout === "hero-readout")}</div>${interactive ? `<div class="component-board" aria-hidden="true"><div class="board-traces"></div><span class="board-fan">✳</span><span class="board-cpu">CPU</span><span class="board-ram">RAM<br><i></i><i></i></span><span class="board-ssd">NVMe SSD</span><span class="board-battery">BATTERY</span><small>VUE PÉDAGOGIQUE DES COMPOSANTS</small></div><button class="explore-toggle" data-action="explore" aria-expanded="${open}" aria-label="Explorer les composants du ${esc(p.brand + " " + p.model)}">${icon("layers")}<span>${open ? "Revenir à la photo" : "Explorer les composants"}</span></button>${["cpu", "ram", "ssd", "battery"].map((key, i) => `<button class="hotspot ${key}" data-action="component" data-component="${key}" aria-label="${{ cpu: "Processeur", ram: "Mémoire RAM", ssd: "Stockage SSD", battery: "Batterie" }[key]} du ${esc(p.model)}" tabindex="${open ? "0" : "-1"}">${i + 1}</button>`).join("")}<span class="machine-note">Photo du modèle · composants illustrés</span>` : ""}</div>`;
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
  const heroProduct =
    products.find((p) => p.id === config.featuredProductId) || products[0];
  function setOpen(el, open) {
    el.classList.toggle("is-open", open);
    const toggle = $(".explore-toggle", el);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      $("span", toggle).textContent = open
        ? "Revenir à la photo"
        : "Explorer les composants";
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
      el.addEventListener("focusin", (event) => {
        if (event.target.closest(".explore-toggle,.hotspot")) setOpen(el, true);
      });
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
    return `<article class="product-card" data-id="${esc(p.id)}"><div class="product-art" data-action="details" data-id="${esc(p.id)}"><span class="product-tag">${esc(p.tag)}</span>${machine(p, { interactive: false })}<button class="art-detail" data-action="details" data-id="${esc(p.id)}" aria-label="Découvrir le ${esc(p.brand + " " + p.model)}">${icon("arrow")}</button></div><div class="product-info"><div class="product-meta"><span>${esc(p.brand)}</span><span class="grade">${p.grade ? "Grade " + esc(p.grade) : p.touch ? "Tactile · 360°" : "Gamme pro"}</span></div><h3><button class="product-title" data-action="details" data-id="${esc(p.id)}">${esc(p.model)}</button></h3><p class="product-generation">${esc(p.generation)} · Reconditionné</p><div class="product-specs"><span class="spec-chip">${icon("cpu")}${esc(p.cpuShort)}</span><span class="spec-chip">${icon("ram")}${p.ram} Go</span><span class="spec-chip">${icon("ssd")}${disk(p)}</span></div><p class="product-screen">${icon("screen")}${esc(p.screen)} · ${esc(p.os)}</p><div class="product-footer"><div>${priceMarkup(p)}${hasPrice(p) ? `<p class="price-note">TVA 8,1 % incluse</p>` : ""}</div><button class="add-button" data-action="add" data-id="${esc(p.id)}" aria-label="Ajouter le ${esc(p.brand + " " + p.model)} au panier" ${p.stock === 0 ? "disabled" : ""}>${icon("bag")}Ajouter</button></div></div></article>`;
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
    if (!p || isService(p)) return;
    detailId = id;
    const wasOpen = productDialog.open;
    productDialog.innerHTML = `<button class="dialog-close" data-action="product-close" aria-label="Fermer la fiche produit">${icon("close")}</button><div class="detail-layout"><div class="detail-art"><span>LA GAMME PRO, UNE SECONDE FOIS.</span>${machine(p, { open: false, readout: "detail-readout" })}${(p.photos || []).length > 1 ? `<div class="photo-strip" role="group" aria-label="Photos du modèle">${p.photos.map((photo, index) => `<button data-action="gallery" data-id="${esc(p.id)}" data-index="${index}" aria-label="Voir la photo ${index + 1} du ${esc(p.model)}" aria-pressed="${index === 0}"><img src="${esc(photo.src)}" alt="" width="60" height="42" loading="lazy"></button>`).join("")}</div>` : ""}<div class="component-readout" id="detail-readout" aria-live="polite">${componentContent(p, "cpu")}</div><p class="detail-art-note">La photo présente le modèle ; l’état et la configuration de l’exemplaire restent ceux de sa fiche. L’exploration des composants est une vue pédagogique, pas une photo de son intérieur.</p></div><div class="detail-copy"><span class="eyebrow">${esc(p.brand)} / ${esc(p.generation)}</span><h2 id="product-title">${esc(p.model)}</h2><p class="detail-description">${esc(p.description)}</p><div class="detail-badges"><span class="grade">Reconditionné · ${p.grade ? "Grade " + esc(p.grade) : p.touch ? "Tactile · 360°" : "Gamme pro"}</span><span class="grade">${esc(p.condition)}</span></div><dl class="detail-specs">${[["Processeur", p.cpu], ["Mémoire RAM", p.ram + " Go " + (p.ramType || "")], ["Stockage SSD", disk(p) + " " + (p.storageType || "")], ["Écran", p.screen], ["Définition", p.resolution], ["Système", p.os], ...(p.gpu ? [["Graphique", p.gpu]] : []), ["Connectique", p.ports], ["Batterie", p.battery], ["Provenance", p.origin]].map(([key, val]) => `<div><dt>${esc(key)}</dt><dd>${esc(val)}</dd></div>`).join("")}</dl><p class="detail-guarantee">${icon("shield")}Ordinateur : ${config.computerWarrantyMonths} mois de garantie.<br>Batterie : ${config.batteryWarrantyMonths} mois.</p><div class="detail-purchase">${priceMarkup(p)}<button class="button dark" data-action="add" data-id="${esc(p.id)}" ${p.stock === 0 ? "disabled" : ""}>${icon("bag")}Ajouter au panier</button></div><p class="stock-note">${Number.isInteger(p.stock) ? p.stock + " exemplaire(s) disponible(s)" : "Disponibilité à confirmer"}${hasPrice(p) ? " · Prix TTC, TVA 8,1 %." : ""}</p></div></div>`;
    productDialog.setAttribute("aria-labelledby", "product-title");
    wireMachines(productDialog);
    if (!wasOpen) {
      productDialog.showModal();
      $(".dialog-close", productDialog).focus();
    }
  }
  function addToCart(id) {
    const p = byId.get(id);
    if (!p) return false;
    const row = cart.find((r) => r.id === id);
    if ((row?.quantity || 0) >= quantityLimit(p)) {
      toast("La quantité disponible est déjà dans votre sélection.");
      return false;
    }
    if (row) row.quantity++;
    else cart.push({ id, quantity: 1 });
    persist();
    if (cartDialog.open) renderCart();
    toast(name(p) + " ajouté à votre sélection.");
    return true;
  }
  const previewButton = () =>
    `<button type="button" class="price-preview" data-action="price-preview" title="Aperçu dans cet onglet uniquement, sans modifier le réglage des autres visiteurs."></button>`;
  function syncPreviewButtons() {
    document
      .querySelectorAll('[data-action="price-preview"]')
      .forEach((button) => {
        button.hidden = false;
        button.disabled = !prices.siteVisible;
        button.setAttribute("aria-pressed", String(prices.previewHidden));
        button.textContent = prices.siteVisible
          ? prices.previewHidden
            ? "Réafficher les prix · test"
            : "Masquer les prix · test"
          : prices.mode === "loading"
            ? "Chargement des prix…"
            : "Prix masqués · site";
      });
  }
  function renderOptions(id) {
    const p = byId.get(id);
    optionsDialog.innerHTML = `<form id="options-form"><header class="options-header"><span class="eyebrow">VOTRE ORDINATEUR EST DANS LE PANIER</span><h2 id="options-title">Un ordinateur.<br>Prêt pour <em>vous.</em></h2><p>${esc(name(p))}</p><button type="button" class="dialog-close" data-action="options-close" aria-label="Fermer les options, garder uniquement l’ordinateur">${icon("close")}</button></header><div class="options-body"><p class="options-intro" id="options-help">Complétez votre ordinateur avec nos services et logiciels. Tout est facultatif, rien n’est ajouté sans votre choix. Les tarifs sur devis sont confirmés dans votre offre.</p>${[
      ["software", "Logiciels & licences"],
      ["service", "Préparation & entretien"],
    ]
      .map(
        ([category, title]) =>
          `<fieldset class="options-group" aria-describedby="options-help"><legend>${title}</legend><div class="options-grid">${window.SHOP_SERVICES.filter(
            (service) => (service.category || "service") === category,
          )
            .map(
              (service) =>
                `<label class="option-card"><input type="checkbox" name="option" value="${esc(service.id)}" ${quantityLimit(service) <= (cart.find((row) => row.id === service.id)?.quantity || 0) ? "disabled" : ""}><span class="option-icon">${icon(service.icon)}</span><span class="option-copy"><strong>${esc(service.model)}</strong><small>${esc(service.description)}</small><span class="option-price" data-option-price="${esc(service.id)}">${hasPrice(service) ? money(service.price) : "Sur devis"}</span></span></label>`,
            )
            .join("")}</div></fieldset>`,
      )
      .join(
        "",
      )}</div><footer class="options-footer"><div class="options-selection" role="status" aria-live="polite">Aucune option sélectionnée</div><div class="options-actions"><button type="button" class="button secondary" data-action="options-skip">Continuer sans option</button><button type="submit" class="button dark" disabled>Ajouter les options ${icon("arrow")}</button></div>${previewButton()}</footer></form>`;
    syncPreviewButtons();
  }
  function openOptions(id) {
    if (productDialog.open) productDialog.close();
    renderOptions(id);
    optionsDialog.showModal();
    $(".dialog-close", optionsDialog).focus();
  }
  $("#options-dialog").addEventListener("change", () => {
    const count = optionsDialog.querySelectorAll(
      'input[name="option"]:checked',
    ).length;
    $(".options-selection", optionsDialog).textContent = count
      ? `${count} option${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""}`
      : "Aucune option sélectionnée";
    $('button[type="submit"]', optionsDialog).disabled = count === 0;
  });
  document.addEventListener("submit", (event) => {
    if (event.target.id !== "options-form") return;
    event.preventDefault();
    const selected = [
      ...optionsDialog.querySelectorAll('input[name="option"]:checked'),
    ];
    if (!selected.length) return;
    for (const input of selected) addToCart(input.value);
    optionsDialog.close();
    openCart();
  });
  function renderServices() {
    document.getElementById("service-products").innerHTML =
      window.SHOP_SERVICES.map(
        (p) =>
          `<article class="service-product" data-id="${esc(p.id)}"><span class="service-product-icon">${icon(p.icon)}</span><span class="eyebrow">PRESTATION INFORMAQUIK</span><h3>${esc(p.model)}</h3><p>${esc(p.description)}</p><div class="service-product-footer"><span class="quote-label">${hasPrice(p) ? money(p.price) : "Sur devis"}</span><button class="button dark" data-action="add" data-id="${esc(p.id)}" aria-label="Ajouter ${esc(p.model)} au panier">${icon("plus")}Ajouter</button></div></article>`,
      ).join("");
  }
  function summaryLabel(summary) {
    return !prices.visible || summary.knownTotal === null
      ? "Votre demande de devis"
      : summary.hasQuote
        ? "Sous-total connu · hors prestations sur devis"
        : "Total indicatif";
  }
  function quoteText() {
    const summary = summarize(cart, prices.visible);
    const body = cart
      .map((row) => {
        const p = byId.get(row.id);
        return `${row.quantity} × ${name(p)} — ${hasPrice(p) ? money(p.price * row.quantity) : "Sur devis"}`;
      })
      .join("\n");
    return (
      "Bonjour,\n\nJe souhaiterais une offre pour cette sélection :\n" +
      body +
      "\n\n" +
      summaryLabel(summary) +
      " : " +
      (summary.knownTotal === null ? "Sur devis" : money(summary.knownTotal)) +
      (summary.hasQuote ? "\nLes éléments sur devis restent à chiffrer." : "") +
      "\n\nMerci."
    );
  }
  function quoteMailto() {
    return `mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent("Demande d’offre — " + config.name)}&body=${encodeURIComponent(quoteText())}`;
  }
  function renderCart() {
    const summary = summarize(cart, prices.visible);
    cartDialog.innerHTML = `<div class="cart-shell"><div class="cart-header"><span class="eyebrow">ORDINATEURS & SERVICES</span><h2 id="cart-title">Votre sélection<span>.</span></h2>${previewButton()}<button class="dialog-close" data-action="cart-close" aria-label="Fermer le panier">${icon("close")}</button></div><div class="cart-items">${
      cart.length
        ? cart
            .map((row) => {
              const p = byId.get(row.id),
                service = isService(p);
              return `<article class="cart-item" data-id="${esc(p.id)}"><div class="cart-thumb">${service ? `<span class="cart-service-icon">${icon(p.icon)}</span>` : machine(p, { interactive: false })}</div><div class="cart-item-copy"><span>${service ? "PRESTATION INFORMAQUIK" : esc(p.brand) + " · RECONDITIONNÉ"}</span><h3>${esc(p.model)}</h3><p>${esc(describe(p))}</p><div class="cart-item-bottom"><div class="quantity"><button data-action="quantity-down" data-id="${esc(p.id)}" aria-label="Diminuer la quantité de ${esc(p.model)}">−</button><span aria-label="Quantité">${row.quantity}</span><button data-action="quantity-up" data-id="${esc(p.id)}" aria-label="Augmenter la quantité de ${esc(p.model)}" ${row.quantity >= quantityLimit(p) ? "disabled" : ""}>+</button></div><strong>${hasPrice(p) ? money(p.price * row.quantity) : "Sur devis"}</strong></div><button class="cart-remove" data-action="remove" data-id="${esc(p.id)}">Retirer de la sélection</button></div></article>`;
            })
            .join("")
        : `<div class="cart-empty">${icon("bag")}Préparez votre sélection.<br>Ajoutez un ordinateur ou un service.<br><button class="button dark" style="margin-top:20px" data-action="cart-close">Continuer ma visite</button></div>`
    }</div>${cart.length ? `<div class="cart-total"><div><span>${summaryLabel(summary)} · ${summary.count} article${summary.count > 1 ? "s" : ""}</span><strong>${summary.knownTotal === null ? "Sur devis" : money(summary.knownTotal)}</strong></div>${summary.hasQuote ? "<p>Les articles et services sur devis sont chiffrés dans votre offre. Aucun total complet n’est annoncé avant confirmation.</p>" : ""}${summary.computers ? `<p>Ordinateurs : garantie ${config.computerWarrantyMonths} mois.<br>Batterie : garantie ${config.batteryWarrantyMonths} mois.</p>` : ""}<button class="button dark" data-action="export">${icon("download")}Exporter ma sélection</button><button class="button secondary" data-action="print">${icon("print")}Imprimer / enregistrer en PDF</button>${config.contactEmail ? `<a class="button primary" href="${esc(quoteMailto())}">Demander une offre</a>` : ""}<small class="cart-demo">Votre sélection prépare une offre. Aucun paiement ni rendez-vous n’est confirmé automatiquement.</small></div>` : ""}</div>`;
    syncPreviewButtons();
  }
  function openCart() {
    if (optionsDialog.open) optionsDialog.close();
    renderCart();
    cartDialog.showModal();
    $(".dialog-close", cartDialog).focus();
  }
  function quoteHtml() {
    const date = new Intl.DateTimeFormat(config.locale, {
      dateStyle: "long",
      timeZone: "Europe/Zurich",
    }).format(new Date());
    const summary = summarize(cart, prices.visible);
    const columns = prices.visible;
    const rows = cart
      .map((row) => {
        const p = byId.get(row.id);
        return `<tr><td><strong>${esc(name(p))}</strong><small>${esc(describe(p))}${isService(p) ? "" : `<br>${esc(p.screen)} · ${esc(p.os)}`}</small></td><td>${row.quantity}</td>${columns ? `<td>${hasPrice(p) ? money(p.price) : "Sur devis"}</td><td>${hasPrice(p) ? money(p.price * row.quantity) : "Sur devis"}</td>` : ""}</tr>`;
      })
      .join("");
    return `<!doctype html><html lang="fr"><meta charset="utf-8"><title>${esc(config.name)} — Sélection</title><style>body{font:14px Arial,sans-serif;color:#222;max-width:850px;margin:40px auto;padding:25px}h1{font-size:32px}h2{font-size:23px}p,small{line-height:1.8;color:#666}small{display:block;font-size:11px}table{border-collapse:collapse;width:100%;font-size:12px;margin:25px 0}th{text-align:left;background:#eee;padding:12px}td{padding:14px 12px;border-bottom:1px solid #ddd;vertical-align:top}.total{text-align:right;font-size:20px}.guarantee{border:1px solid #ddd;padding:18px;margin-top:25px}@media print{body{margin:0;padding:20px}tr{break-inside:avoid}}</style><body><h1>${esc(config.name)}</h1><h2>Votre sélection d’ordinateurs et de services</h2><p>${date}</p><table><thead><tr><th>Article ou prestation</th><th>Quantité</th>${columns ? "<th>Prix unitaire</th><th>Montant</th>" : ""}</tr></thead><tbody>${rows}</tbody></table><div class="total">${summaryLabel(summary)} : <strong>${summary.knownTotal === null ? "Sur devis" : money(summary.knownTotal)}</strong></div>${summary.hasQuote ? "<p>Les éléments sur devis sont chiffrés dans votre offre. Le sous-total éventuel ne les comprend pas.</p>" : ""}${summary.computers ? `<div class="guarantee">Garantie ordinateur : ${config.computerWarrantyMonths} mois.<br>Garantie batterie : ${config.batteryWarrantyMonths} mois.</div>` : ""}<p>${columns ? "Montants connus TTC, TVA 8,1 % incluse. " : ""}Disponibilité et modalités d’intervention à confirmer. Cette sélection n’est ni une commande ni une facture.</p><footer>Informaquik · Ordinateurs et services informatiques</footer></body></html>`;
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
    if (action === "add" && addToCart(id) && !isService(byId.get(id)))
      openOptions(id);
    if (action === "options-close") optionsDialog.close();
    if (action === "options-skip") {
      optionsDialog.close();
      openCart();
    }
    if (action === "price-preview") {
      const parent = button.closest("dialog");
      prices.togglePreview();
      (parent || document)
        .querySelector('[data-action="price-preview"]')
        ?.focus();
      toast(
        prices.visible
          ? "Les prix sont réaffichés dans cet onglet."
          : "Aperçu sans prix dans cet onglet, panier et offre inclus.",
      );
    }
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
    if (action === "gallery") {
      const p = byId.get(id),
        photo = p?.photos?.[Number(button.dataset.index)],
        el = productDialog.querySelector(".machine");
      if (photo && el) {
        const img = el.querySelector(".machine-photo");
        img.src = photo.src;
        img.alt = photo.alt;
        el.dataset.pinned = "false";
        setOpen(el, false);
        productDialog
          .querySelectorAll("[data-action=gallery]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      }
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
      !cartDialog.open &&
      !optionsDialog.open &&
      !document.getElementById("shop-root").hidden
    ) {
      event.preventDefault();
      $("#search").focus();
    }
  });
  const dialogs = [productDialog, cartDialog, optionsDialog];
  const syncDialogScroll = () => {
    document.body.style.overflow = dialogs.some((dialog) => dialog.open)
      ? "hidden"
      : "";
  };
  for (const dialog of dialogs) {
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
    dialog.addEventListener("close", syncDialogScroll);
    new MutationObserver(syncDialogScroll).observe(dialog, {
      attributes: true,
      attributeFilter: ["open"],
    });
  }
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      cart = readCart();
      updateCount();
      if (cartDialog.open) renderCart();
    }
  });
  let catalogueReady = false;
  function ensureCatalogue() {
    if (catalogueReady) return;
    catalogueReady = true;
    $("#hero-machine").innerHTML = machine(heroProduct, {
      readout: "hero-readout",
    });
    $("#hero-readout").innerHTML =
      `<div><strong>${esc(heroProduct.cpuShort)}</strong><small>PROCESSEUR</small></div><span></span><div><strong>${heroProduct.ram} Go</strong><small>MÉMOIRE RAM</small></div><span></span><div><strong>${disk(heroProduct)} SSD</strong><small>STOCKAGE</small></div>`;
    renderBrands();
    renderProducts();
    renderServices();
    wireMachines();
  }
  function syncPricing() {
    document
      .querySelectorAll('#sort option[value^="price-"]')
      .forEach((option) => {
        option.hidden = option.disabled = !prices.visible;
      });
    if (!prices.visible && sort.startsWith("price-")) {
      sort = "featured";
      $("#sort").value = sort;
    }
    document.querySelectorAll("[data-price-only]").forEach((el) => {
      el.hidden = !prices.visible;
    });
    if (catalogueReady) {
      renderProducts();
      renderServices();
    }
    if (cartDialog.open) renderCart();
    if (productDialog.open && detailId) productDetails(detailId);
    optionsDialog.querySelectorAll("[data-option-price]").forEach((el) => {
      const p = byId.get(el.dataset.optionPrice);
      el.textContent = hasPrice(p) ? money(p.price) : "Sur devis";
    });
    syncPreviewButtons();
  }
  window.addEventListener("shop:pricingchange", syncPricing);
  window.SHOP_UI = { ensureCatalogue };
  syncPricing();
  updateCount();
})();
