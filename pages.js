"use strict";
(() => {
  const cfg = window.SHOP_CONFIG,
    products = window.SHOP_PRODUCTS;
  const root = document.getElementById("editorial-root"),
    shop = document.getElementById("shop-root");
  const esc = (v) =>
    String(v ?? "").replace(
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
  const icon = (name = "arrow") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{ arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>', screen: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>', shield: '<path d="m12 3 8 4v6c0 4-4 7-8 9-4-2-8-5-8-9V7l8-4Z"/>', spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v3"/>', battery: '<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M23 10v4M6 10v4m4-4v4m4-4v4"/>' }[name] || '<path d="M4 12h16m-6-6 6 6-6 6"/>'}</svg>`;
  const link = (href, text, type = "dark") =>
    `<a class="button ${type}" href="${href}">${text}${icon()}</a>`;
  const hero = (label, title, description, aside = "") =>
    `<section class="page-hero"><div class="page-breadcrumb"><a href="#/boutique">Informaquik Shop</a><span>/</span><span>${label}</span></div><div class="page-hero-grid"><div><span class="eyebrow">INFORMAQUIK / ${label.toUpperCase()}</span><h1 tabindex="-1">${title}</h1><p>${description}</p></div>${aside}</div></section>`;
  const card = (number, title, text, svg = "check") =>
    `<article class="editorial-card"><span class="editorial-card-icon">${icon(svg)}</span><span class="small-caps">${number}</span><h3>${title}</h3><p>${text}</p></article>`;
  const cta = (
    title = "Votre prochaine machine vous attend.",
    text = "Retrouvez les configurations et leurs caractéristiques dans la boutique.",
  ) =>
    `<section class="page-cta"><div><h2>${title}</h2><p>${text}</p></div>${link("#/boutique", "Découvrir le shop", "lime")}</section>`;
  const titles = {
    boutique: "Shop",
    reconditionnement: "Le reconditionné",
    entreprises: "Entreprises",
    guide: "Bien choisir",
    garanties: "Garanties & SAV",
    contact: "Contact",
  };
  const content = {
    reconditionnement: () =>
      hero(
        "Le reconditionné",
        "Une première vie pro.<br><em>Une seconde vie avec vous.</em>",
        "Du matériel de gamme professionnelle, un usage prolongé, et des informations claires pour choisir.",
        `<div class="page-emblem"><span>RE</span><span>UNE NOUVELLE VIE.</span><i aria-hidden="true">${icon()}</i></div>`,
      ) +
      `<section class="section page-section"><div class="page-intro"><span class="eyebrow">LE RÉEMPLOI, CONCRÈTEMENT</span><h2>La bonne machine.<br><em>Pour le bon usage.</em></h2><p>Un ordinateur n’a pas besoin d’être neuf pour rester utile. Nous proposons des références professionnelles avec une configuration précise, pour répondre à votre usage et à votre budget.</p></div><div class="editorial-grid three">${card("01", "Des gammes professionnelles", "HP EliteBook, ProBook et ZBook, Lenovo ThinkPad : des familles de produits destinées aux usages professionnels.", "screen")}${card("02", "Une origine présentée avec transparence", "Selon les lots, les machines proviennent d’entreprises, d’administrations, de services publics ou militaires. La provenance précise d’un exemplaire reste à confirmer sur sa fiche.", "people")}${card("03", "Une nouvelle histoire utile", "Le réemploi donne une nouvelle utilité à du matériel existant. Une autre façon de s’équiper, en prolongeant son usage.", "spark")}</div></section>` +
      `<section class="page-band"><div><span class="eyebrow light">DES REPÈRES, PAS DES SURPRISES</span><h2>Ce qui compte,<br><em>c’est ce que vous recevez.</em></h2></div><ul class="clarity-list"><li>${icon("check")}La configuration indiquée : processeur, mémoire, stockage et écran.</li><li>${icon("check")}L’état cosmétique et la disponibilité à confirmer pour chaque lot.</li><li>${icon("check")}L’état de la batterie à communiquer avant votre choix.</li><li>${icon("check")}${cfg.computerWarrantyMonths} mois de garantie ordinateur et ${cfg.batteryWarrantyMonths} mois pour la batterie.</li></ul></section>` +
      `<section class="section page-section"><div class="split-editorial"><div><span class="eyebrow">DEUX NOTIONS À DISTINGUER</span><h2>Reconditionné.<br><em>Et adapté à vous.</em></h2></div><div><details class="page-faq" open><summary>Quel aspect attendre d’un ordinateur reconditionné ?</summary><p>Des traces d’usage peuvent être présentes. Le grade, les éventuels défauts et les accessoires doivent être précisés pour l’exemplaire proposé.</p></details><details class="page-faq"><summary>Comment connaître l’état de la batterie ?</summary><p>La capacité et l’état de la batterie sont des informations distinctes de la configuration. Sa garantie est de ${cfg.batteryWarrantyMonths} mois.</p></details><details class="page-faq"><summary>Comment choisir une configuration adaptée ?</summary><p>Le bon choix dépend de vos applications. Consultez le guide pour distinguer bureautique, mobilité, multitâche et applications graphiques.</p></details>${link("#/guide", "Trouver le bon modèle")}</div></div></section>` +
      cta(),
    entreprises: () =>
      hero(
        "Entreprises",
        "Un équipement cohérent.<br><em>Une équipe qui avance.</em>",
        "Préparez un besoin à l’unité ou en lot. Nous pourrons vous orienter à partir des références, configurations et disponibilités.",
        `<div class="business-visual"><span>${icon("people")}</span><div><b>VOTRE ÉQUIPE</b><strong>Un besoin.<br>Une sélection.</strong></div></div>`,
      ) +
      `<section class="section page-section"><div class="editorial-grid three">${card("01", "Équiper un poste", "Un ordinateur de travail correspondant aux applications utilisées et au budget.", "screen")}${card("02", "Préparer un lot", "Indiquez le nombre de postes et la configuration souhaitée. Les quantités disponibles seront confirmées avant toute offre.", "people")}${card("03", "Renouveler progressivement", "Comparez les modèles et préparez une sélection pour faire évoluer votre équipement à votre rythme.", "spark")}</div></section>` +
      `<section class="page-band"><div><span class="eyebrow light">AVANT DE CHOISIR</span><h2>Partons de vos usages.<br><em>Pas d’une fiche au hasard.</em></h2></div><ul class="clarity-list"><li>${icon("check")}Nombre de collaborateurs et de postes à équiper.</li><li>${icon("check")}Applications métiers, mobilité et besoins graphiques.</li><li>${icon("check")}Mémoire, stockage, écran et connectique nécessaires.</li><li>${icon("check")}Budget, échéance et besoin d’une configuration homogène.</li></ul></section>` +
      `<section class="section page-section"><div class="section-heading"><div><span class="eyebrow">UNE DEMANDE CLAIRE</span><h2>Préparez votre projet.<br><em>On en parle ensuite.</em></h2></div><p>La disponibilité et les modalités<br>sont confirmées avec l’offre.</p></div><div class="editorial-grid three">${card("1", "Choisir les références", "Consultez le catalogue et ajoutez les ordinateurs à votre sélection.", "screen")}${card("2", "Préciser les quantités", "Le panier permet de préparer un besoin. Il ne réserve pas les machines.", "people")}${card("3", "Demander une offre", "Exportez votre sélection et préparez votre message pour Informaquik.", "shield")}</div><div class="page-button-row">${link("#/contact?motif=entreprise", "Préparer une demande entreprise")}${link("#/boutique", "Voir les configurations", "secondary")}</div></section>`,
    garanties: () =>
      hero(
        "Garanties & SAV",
        "Une seconde vie.<br><em>De vrais repères.</em>",
        "Les durées annoncées sont simples : une garantie sur l’ordinateur et une durée spécifique pour sa batterie.",
        `<div class="guarantee-pair"><div><strong>${cfg.computerWarrantyMonths}</strong><span>MOIS · ORDINATEUR</span></div><div><strong>${cfg.batteryWarrantyMonths}</strong><span>MOIS · BATTERIE</span></div></div>`,
      ) +
      `<section class="section page-section"><div class="editorial-grid two">${card("ORDINATEUR", `${cfg.computerWarrantyMonths} mois de garantie`, "La durée de garantie de l’ordinateur est indiquée dans votre offre. Les conditions de prise en charge doivent être consultées avec vos documents de vente.", "shield")}${card("BATTERIE", `${cfg.batteryWarrantyMonths} mois de garantie`, "La batterie bénéficie d’une garantie spécifique. Son état et sa capacité doivent être précisés pour l’exemplaire choisi.", "battery")}</div></section>` +
      `<section class="page-band"><div><span class="eyebrow light">UN BESOIN D’ASSISTANCE ?</span><h2>Décrivez le problème.<br><em>Gardez vos références.</em></h2></div><ol class="support-steps"><li><span>01</span><div><strong>Retrouvez le modèle et la preuve d’achat.</strong><p>Ajoutez le numéro de série si vous l’avez.</p></div></li><li><span>02</span><div><strong>Décrivez ce qui se passe.</strong><p>Message d’erreur, fréquence et circonstances du problème.</p></div></li><li><span>03</span><div><strong>Contactez Informaquik.</strong><p>Les étapes de prise en charge vous seront communiquées. Sauvegardez vos données avant une intervention.</p></div></li></ol></section>` +
      `<section class="section page-section"><div class="split-editorial"><div><span class="eyebrow">VOS QUESTIONS</span><h2>Avant et après<br><em>votre choix.</em></h2></div><div><details class="page-faq"><summary>Que dois-je vérifier avant de choisir ?</summary><p>La configuration, l’état de l’appareil, l’état de batterie, les accessoires et les conditions figurant dans l’offre.</p></details><details class="page-faq"><summary>Comment demander une prise en charge ?</summary><p>Préparez votre modèle, votre référence d’achat et une description du problème. Le formulaire de contact permet de composer ces informations.</p></details><details class="page-faq"><summary>Les données personnelles sont-elles sauvegardées automatiquement ?</summary><p>Ne présumez pas qu’une intervention comprend une sauvegarde. Conservez une copie de vos fichiers avant de confier votre ordinateur.</p></details>${link("#/contact?motif=sav", "Préparer une demande SAV")}</div></div></section>`,
    guide: () =>
      hero(
        "Bien choisir",
        "Votre usage d’abord.<br><em>Le bon PC ensuite.</em>",
        "Quelques repères pour comparer les configurations. Puis un guide rapide pour retrouver les modèles de votre budget.",
        `<div class="page-emblem guide-emblem"><span>VOUS</span><span>VOTRE USAGE. VOTRE PROCHAIN PC.</span><i aria-hidden="true">${icon()}</i></div>`,
      ) +
      `<section class="section page-section"><div class="guide-layout"><form id="guide-form" class="guide-form"><span class="eyebrow">VOTRE SÉLECTION EN QUELQUES CHOIX</span><h2>Qu’est-ce qui<br><em>compte pour vous ?</em></h2><label>Votre usage principal<select name="usage"><option value="everyday">Bureautique et usage quotidien</option><option value="mobile">Déplacements et mobilité</option><option value="multitask">Multitâche et beaucoup d’applications</option><option value="graphics">Applications graphiques professionnelles</option></select></label><label>Votre budget maximum<select name="budget"><option value="800">800 CHF</option><option value="600">600 CHF</option><option value="1000">1 000 CHF</option><option value="1500">1 500 CHF</option><option value="99999">Tous les budgets</option></select></label><label class="guide-checkbox"><input type="checkbox" name="touch">Je souhaite un écran tactile / convertible</label><button class="button dark" type="submit">Trouver mes modèles${icon()}</button><p>Une aide à la comparaison basée sur les caractéristiques du catalogue. La compatibilité avec vos logiciels reste à vérifier.</p></form><div id="guide-results" class="guide-results" aria-live="polite"><div class="guide-idle">${icon("spark")}<h3>Votre prochain ordinateur<br>commence par vos besoins.</h3><p>Choisissez un usage et un budget pour découvrir une sélection.</p></div></div></div></section>` +
      `<section class="page-band"><div><span class="eyebrow light">QUATRE REPÈRES UTILES</span><h2>Comprendre la fiche.<br><em>Choisir sereinement.</em></h2></div><div class="spec-explainer"><div><strong>Le processeur</strong><p>Sa référence complète et sa génération comptent davantage que la seule mention i5 ou i7.</p></div><div><strong>La mémoire RAM</strong><p>16 Go pour de nombreux usages quotidiens ; 32 Go offrent plus de marge pour le multitâche et les applications gourmandes.</p></div><div><strong>Le stockage SSD</strong><p>250/256 Go, 512 Go : choisissez selon vos fichiers et applications. Une sauvegarde reste nécessaire.</p></div><div><strong>L’écran et la connectique</strong><p>Format, définition, tactile, ports USB, HDMI et station d’accueil : vérifiez votre façon de travailler.</p></div></div></section>` +
      cta(),
    contact: () =>
      hero(
        "Contact",
        "Un conseil, un projet,<br><em>un prochain chapitre.</em>",
        "Préparez votre question, votre demande d’offre ou les informations nécessaires à une prise en charge.",
        `<div class="contact-brand"><span>INFORMAQUIK · MARTIGNY</span><strong>Parlons<br>informatique.</strong><a href="tel:+41275653232">027 565 32 32</a><a href="mailto:info@i-q.ch">info@i-q.ch</a><p>Rue du Simplon 27A<br>1920 Martigny</p></div>`,
      ) +
      `<section class="section page-section"><div class="contact-layout"><form id="contact-form" class="contact-form"><span class="eyebrow">VOTRE MESSAGE</span><h2>Comment pouvons-nous<br><em>vous accompagner ?</em></h2><div class="contact-fields"><label>Votre nom<input name="name" autocomplete="name" maxlength="100" required></label><label>Votre e-mail<input type="email" name="email" autocomplete="email" maxlength="200" required></label><label>Entreprise (facultatif)<input name="company" autocomplete="organization" maxlength="150"></label><label>Votre demande<select name="reason"><option value="conseil">Conseil avant de choisir</option><option value="offre">Offre pour une sélection</option><option value="entreprise">Besoin d’entreprise / lot</option><option value="sav">Garantie / SAV</option></select></label><label class="full">Votre message<textarea name="message" rows="6" maxlength="3000" required placeholder="Modèle, usage, quantités, ou description du problème…"></textarea></label></div><button class="button dark" type="submit">${cfg.contactEmail ? "Préparer mon e-mail" : "Télécharger mon message"}${icon()}</button><p class="form-help">${cfg.contactEmail ? "Votre messagerie s’ouvrira pour vous permettre de vérifier et envoyer votre message." : "Votre message est préparé dans un fichier texte. Rien n’est envoyé automatiquement. Pour joindre Informaquik, utilisez les coordonnées du site i-q.ch."}</p><p id="contact-status" role="status"></p></form><aside class="contact-aside"><article class="editorial-card business-contact"><span class="eyebrow">RETROUVEZ-NOUS À MARTIGNY</span><h3>InformaQuik sàrl</h3><p>Rue du Simplon 27A, CP 626<br>1920 Martigny 1</p><a href="tel:+41275653232">027 565 32 32</a><a href="mailto:info@i-q.ch">info@i-q.ch</a><p>Lundi–jeudi : 09h–12h / 13h30–18h<br>Vendredi : fermeture à 17h.<br>Veilles de fêtes : fermeture à 17h.</p><a href="https://i-q.ch/" target="_blank" rel="noopener noreferrer" class="text-link">Coordonnées sur i-q.ch ${icon()}</a></article><article class="editorial-card"><span class="editorial-card-icon">${icon("screen")}</span><h3>Avant de choisir</h3><p>Indiquez vos usages, votre budget, les logiciels utilisés et vos préférences de format.</p><a class="text-link" href="#/guide">Consulter le guide ${icon()}</a></article><article class="editorial-card"><span class="editorial-card-icon">${icon("people")}</span><h3>Pour une équipe</h3><p>Ajoutez le nombre de machines, les caractéristiques souhaitées et votre échéance.</p></article><article class="editorial-card"><span class="editorial-card-icon">${icon("shield")}</span><h3>Pour le SAV</h3><p>Préparez le modèle, la référence d’achat, le numéro de série et les symptômes.</p></article></aside></div></section>`,
  };
  let route = "";
  function closeMenu() {
    document.querySelector(".header").classList.remove("nav-open");
    const b = document.querySelector(".menu-toggle");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-label", "Ouvrir le menu");
  }
  function renderPage() {
    const hash = location.hash;
    const key = hash.startsWith("#/")
      ? hash.slice(2).split("?")[0]
      : "boutique";
    closeMenu();
    if (key === "boutique") {
      shop.hidden = false;
      root.hidden = true;
      document.title = "Informaquik Shop — La performance a une seconde vie.";
      if (route !== key && hash.startsWith("#/")) window.scrollTo({ top: 0 });
    } else {
      shop.hidden = true;
      root.hidden = false;
      if (route !== key) {
        root.innerHTML = content[key]
          ? content[key]()
          : hero(
              "Page introuvable",
              "Un autre chemin ?",
              "Cette page n’existe pas.",
            ) + cta();
        document.title =
          (titles[key] || "Page introuvable") + " — Informaquik Shop";
        window.scrollTo({ top: 0 });
        root.querySelector("h1")?.focus({ preventScroll: true });
      }
      if (key === "contact") {
        const reason = new URLSearchParams(hash.split("?")[1] || "").get(
          "motif",
        );
        if (["entreprise", "sav", "offre"].includes(reason))
          root.querySelector("[name=reason]").value = reason;
      }
    }
    document.querySelectorAll("#main-nav a").forEach((a) => {
      const current = a.hash === "#/" + key;
      a.classList.toggle("current", current);
      if (current) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    route = key;
  }
  function recommend(form) {
    const b = Object.fromEntries(new FormData(form));
    let rows = products.filter(
      (p) => p.price <= Number(b.budget) && (!b.touch || p.touch),
    );
    if (b.usage === "mobile") rows = rows.filter((p) => p.usage === "mobile");
    if (b.usage === "multitask") rows = rows.filter((p) => p.ram >= 32);
    if (b.usage === "graphics")
      rows = rows.filter((p) => /NVIDIA/i.test(p.gpu || ""));
    rows.sort((a, b) => a.price - b.price);
    const results = document.getElementById("guide-results");
    results.innerHTML =
      `<div class="guide-result-heading"><span class="eyebrow">VOTRE SÉLECTION</span><h3>${rows.length} modèle${rows.length > 1 ? "s" : ""} à découvrir</h3><p>${rows.length > 4 ? "Les 4 modèles les plus accessibles sont présentés ci-dessous. " : ""}Prix TTC · disponibilité à confirmer.</p></div>` +
      (rows.length
        ? rows
            .slice(0, 4)
            .map(
              (p) =>
                `<article class="recommended-product"><div><span>${esc(p.brand)}</span><h4>${esc(p.model)}</h4><p>${esc(p.generation)}<br>${esc(p.cpuShort)} · ${p.ram} Go RAM · ${p.storage} Go SSD</p></div><div><strong>${p.price}.– <small>CHF</small></strong><button class="text-link" data-action="details" data-id="${esc(p.id)}">Voir le modèle ${icon()}</button></div></article>`,
            )
            .join("")
        : `<div class="guide-no-results"><p>Aucun modèle du catalogue ne correspond à tous ces critères pour le moment.</p>${link("#/contact", "Discuter de mon besoin", "secondary")}</div>`);
  }
  document.addEventListener("submit", (event) => {
    if (event.target.id === "guide-form") {
      event.preventDefault();
      recommend(event.target);
    }
    if (event.target.id === "contact-form") {
      event.preventDefault();
      const b = Object.fromEntries(new FormData(event.target));
      const text = `Demande Informaquik Shop\n\nNom : ${b.name}\nE-mail : ${b.email}\nEntreprise : ${b.company || "—"}\nMotif : ${b.reason}\n\n${b.message}\n`;
      if (cfg.contactEmail) {
        location.href = `mailto:${encodeURIComponent(cfg.contactEmail)}?subject=${encodeURIComponent("Informaquik Shop — " + b.reason)}&body=${encodeURIComponent(text)}`;
      } else {
        const url = URL.createObjectURL(
            new Blob([text], { type: "text/plain;charset=utf-8" }),
          ),
          a = document.createElement("a");
        a.href = url;
        a.download = "Informaquik-mon-message.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      document.getElementById("contact-status").textContent = cfg.contactEmail
        ? "Votre message est prêt dans votre messagerie."
        : "Votre message est téléchargé. Vous pouvez le transmettre à Informaquik avec les coordonnées du site i-q.ch.";
    }
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-site-action=menu]")) {
      const head = document.querySelector(".header"),
        open = head.classList.toggle("nav-open"),
        b = head.querySelector(".menu-toggle");
      b.setAttribute("aria-expanded", String(open));
      b.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }
    if (event.target.closest("#main-nav a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("hashchange", renderPage);
  renderPage();
})();
