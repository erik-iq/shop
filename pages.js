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
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{ arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>', screen: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>', shield: '<path d="m12 3 8 4v6c0 4-4 7-8 9-4-2-8-5-8-9V7l8-4Z"/>', spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v3"/>', server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5"/>', network: '<rect x="8" y="2" width="8" height="6" rx="1"/><path d="M12 8v5M4 17v-4h16v4"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/>', tools: '<path d="m14 6 4 4M3 21l7-7m3-9a6 6 0 0 0-7 7L2 20l2 2 8-4a6 6 0 0 0 7-7l-4 3-5-5 3-4Z"/>', battery: '<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M23 10v4M6 10v4m4-4v4m4-4v4"/>' }[name] || '<path d="M4 12h16m-6-6 6 6-6 6"/>'}</svg>`;
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
    `<section class="page-cta"><div><h2>${title}</h2><p>${text}</p></div>${link("#/boutique", "Découvrir le shop", "primary")}</section>`;
  const supportButtons = () =>
    `<a class="button dark" href="${esc(cfg.support.anydesk)}" target="_blank" rel="noopener noreferrer">Télécharger AnyDesk ${icon()}</a><a class="button secondary" href="${esc(cfg.support.teamviewer)}" target="_blank" rel="noopener noreferrer">TeamViewer QuickSupport ${icon()}</a>`;
  const serverVisual = `<div class="server-visual" aria-hidden="true"><span class="server-overline">INFORMAQUIK / PME</span><div class="server-rack"><div><i></i><span>SERVEURS HÉBERGÉS</span><b>01</b></div><div><i></i><span>DONNÉES & SAUVEGARDES</span><b>02</b></div><div><i></i><span>RÉSEAUX & ÉQUIPES</span><b>03</b></div></div><span class="server-caption">Votre infrastructure. Notre accompagnement.</span></div>`;
  const titles = {
    boutique: "Shop",
    reconditionnement: "Le reconditionné",
    entreprises: "Solutions PME",
    depannage: "Dépannage & atelier",
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
        "Solutions PME",
        "Votre informatique.<br><em>Un partenaire à vos côtés.</em>",
        "Serveurs hébergés, sauvegardes, réseaux et postes de travail : Informaquik accompagne l’informatique de votre PME à Martigny et à distance.",
        serverVisual,
      ) +
      `<section class="section page-section"><div class="page-intro"><span class="eyebrow">L’INFORMATIQUE DE VOTRE ENTREPRISE</span><h2>De vos serveurs<br><em>à chaque poste de travail.</em></h2><p>Un interlocuteur pour comprendre vos usages, faire évoluer votre installation et vous accompagner au quotidien.</p></div><div class="editorial-grid three">${card("01 / HÉBERGEMENT", "Serveurs hébergés", "Nous hébergeons vos serveurs et étudions avec vous une solution adaptée à vos applications, à vos utilisateurs et à votre organisation.", "server")}${card("02 / DONNÉES", "Sauvegardes & restauration", "Sauvegardes locales et à distance, restauration et accompagnement pour la récupération de données : préparons la protection de vos fichiers.", "shield")}${card("03 / CONNEXION", "Réseaux & Wi-Fi professionnels", "Installation et optimisation de votre réseau informatique, câblé ou sans fil, pour relier vos équipes et vos équipements.", "network")}${card("04 / MAINTENANCE", "Un parc suivi et entretenu", "Entretien des postes, mises à jour, antivirus professionnels et dépannage de votre parc informatique.", "screen")}${card("05 / ACCOMPAGNEMENT", "Assistance au quotidien", "Une intervention à distance, sur site ou dans notre atelier selon le besoin. Vous échangez avec les techniciens qui prennent en charge votre informatique.", "people")}${card("06 / ÉQUIPEMENT", "Du matériel professionnel", "Conseil, installation de logiciels et de matériel, ordinateurs de gamme professionnelle et renouvellement de vos postes.", "spark")}</div></section>` +
      `<section class="page-band"><div><span class="eyebrow light">UN PROJET D’HÉBERGEMENT ?</span><h2>Vos applications.<br><em>Votre façon de travailler.</em></h2><p class="band-description">Parlons de vos serveurs actuels, de vos accès et de vos données pour définir une solution adaptée à votre entreprise.</p>${link("#/contact?motif=entreprise", "Parler de mon infrastructure", "light-button")}</div><ul class="clarity-list"><li>${icon("check")}Applications métiers et nombre d’utilisateurs.</li><li>${icon("check")}Accès aux serveurs et travail à distance.</li><li>${icon("check")}Volumes de données et besoins de sauvegarde.</li><li>${icon("check")}Installation existante, budget et échéance.</li></ul></section>` +
      `<section class="section page-section"><div class="split-editorial"><div><span class="eyebrow">VOTRE PARTENAIRE INFORMATIQUE</span><h2>Une équipe à joindre.<br><em>Un atelier à Martigny.</em></h2><p class="section-description">Un besoin de conseil, une panne ou un projet d’évolution ? Nous vous accueillons en magasin et intervenons aussi à distance ou sur site.</p><div class="page-button-row">${link("#/depannage", "Dépannage & atelier", "secondary")}</div></div><div><details class="page-faq" open><summary>Un accompagnement ponctuel ou régulier</summary><p>Nous vous accompagnons pour un besoin précis ou dans le suivi de votre parc. Décrivez-nous votre fonctionnement pour préparer une proposition.</p></details><details class="page-faq"><summary>La banque d’heures pour les PME</summary><p>Notre système de banque d’heures permet de prévoir des interventions dont la main-d’œuvre est déduite du crédit d’heures. Les packs et modalités sont présentés dans votre offre.</p></details><details class="page-faq"><summary>Équiper un poste ou préparer un lot</summary><p>Retrouvez les ordinateurs professionnels dans le shop. Préparez les références et quantités souhaitées pour une demande d’offre.</p></details></div></div></section>` +
      `<section class="page-cta"><div><h2>Votre prochain projet commence ici.</h2><p>Hébergement, réseau, maintenance ou équipement : dites-nous ce dont vous avez besoin.</p></div>${link("#/contact?motif=entreprise", "Discutons de votre PME", "primary")}</section>`,
    depannage: () =>
      hero(
        "Dépannage & atelier",
        "Une panne ? Une question ?<br><em>On s’en occupe ensemble.</em>",
        "À distance ou dans notre magasin de Martigny, nos techniciens vous accompagnent pour diagnostiquer, entretenir et dépanner votre ordinateur.",
        `<div class="support-hero-card"><span class="eyebrow light">PARLONS DE VOTRE PROBLÈME</span><a href="tel:+41275653232">027 565 32 32</a><span>Lundi–vendredi · 09h–12h / 13h30–18h</span><small>Fermeture à 17h le vendredi et les veilles de fêtes.</small></div>`,
      ) +
      `<section class="section page-section"><div class="editorial-grid three">${card("01 / À DISTANCE", "Un technicien, où que vous soyez", "Pour les problèmes qui peuvent être résolus à distance, nous vous guidons avec AnyDesk ou TeamViewer. Appelez-nous pour organiser l’intervention.", "screen")}${card("02 / EN MAGASIN", "Notre atelier à Martigny", "Apportez votre ordinateur en magasin. Notre atelier ouvert vous permet d’échanger avec les informaticiens qui prennent en charge votre appareil.", "tools")}${card("03 / POUR LES PME", "Sur votre infrastructure", "Nous intervenons aussi sur site et à distance pour les entreprises : postes de travail, serveurs, réseau et assistance aux collaborateurs.", "network")}</div></section>` +
      `<section class="remote-support section" id="assistance-distance"><div class="remote-intro"><span class="eyebrow light">DÉPANNAGE À DISTANCE</span><h2>Votre technicien vous guide.<br><em>Choisissez votre outil.</em></h2><p>Contactez Informaquik, puis ouvrez l’outil indiqué par votre technicien pour démarrer l’assistance.</p><a href="tel:+41275653232" class="text-link light">Appeler le 027 565 32 32 ${icon()}</a></div><div class="remote-downloads"><div class="support-platform"><span class="status-dot"></span>POUR WINDOWS</div><div class="support-download-buttons">${supportButtons()}</div><p>AnyDesk Informaquik et TeamViewer QuickSupport. Le téléchargement démarre lorsque vous cliquez sur le lien choisi.</p><ol class="remote-steps"><li><span>01</span>Appelez-nous et décrivez le problème.</li><li><span>02</span>Ouvrez l’outil demandé par le technicien.</li><li><span>03</span>Communiquez l’identifiant affiché et autorisez la connexion.</li></ol><small>Sur Mac ou un autre système ? Contactez-nous pour être guidé.</small></div></section>` +
      `<section class="section page-section" id="atelier"><div class="split-editorial"><div><span class="eyebrow">LE SERVICE, AUSSI EN MAGASIN</span><h2>Un vrai atelier.<br><em>Des échanges en direct.</em></h2><p class="section-description">Diagnostic, réparation, entretien et conseils : nous vous accueillons au magasin pour faire le point sur votre matériel.</p><div class="workshop-address"><strong>InformaQuik sàrl</strong><span>Rue du Simplon 27A · 1920 Martigny</span><span>Lundi–jeudi : 09h–12h / 13h30–18h</span><span>Vendredi et veilles de fêtes : fermeture à 17h</span></div>${link("#/contact?motif=atelier", "Contacter l’atelier")}</div><div class="workshop-services">${card("DIAGNOSTIC & RÉPARATION", "Retrouver un ordinateur qui vous suit", "Panne matérielle ou logicielle, nettoyage et désinfection, installation du système, de logiciels ou de matériel.", "tools")}${card("DONNÉES & CONSEILS", "Vous accompagner dans la durée", "Sauvegardes, récupération de données, conseils et entretien pour vos usages personnels ou professionnels.", "shield")}</div></div></section>` +
      `<section class="page-cta"><div><h2>Commençons par votre problème.</h2><p>Décrivez les symptômes, le modèle et le moment où la panne apparaît.</p></div>${link("#/contact?motif=depannage", "Demander un dépannage", "primary")}</section>`,
    garanties: () =>
      hero(
        "Garanties & SAV",
        "Une seconde vie.<br><em>De vrais repères.</em>",
        "Les durées annoncées sont simples : une garantie sur l’ordinateur et une durée spécifique pour sa batterie.",
        `<div class="guarantee-pair"><div><strong>${cfg.computerWarrantyMonths}</strong><span>MOIS · ORDINATEUR</span></div><div><strong>${cfg.batteryWarrantyMonths}</strong><span>MOIS · BATTERIE</span></div></div>`,
      ) +
      `<section class="section page-section"><div class="editorial-grid two">${card("ORDINATEUR", `${cfg.computerWarrantyMonths} mois de garantie`, "La durée de garantie de l’ordinateur est indiquée dans votre offre. Les conditions de prise en charge doivent être consultées avec vos documents de vente.", "shield")}${card("BATTERIE", `${cfg.batteryWarrantyMonths} mois de garantie`, "La batterie bénéficie d’une garantie spécifique. Son état et sa capacité doivent être précisés pour l’exemplaire choisi.", "battery")}</div></section>` +
      `<section class="page-band"><div><span class="eyebrow light">UN BESOIN D’ASSISTANCE ?</span><h2>Décrivez le problème.<br><em>Gardez vos références.</em></h2></div><ol class="support-steps"><li><span>01</span><div><strong>Retrouvez le modèle et la preuve d’achat.</strong><p>Ajoutez le numéro de série si vous l’avez.</p></div></li><li><span>02</span><div><strong>Décrivez ce qui se passe.</strong><p>Message d’erreur, fréquence et circonstances du problème.</p></div></li><li><span>03</span><div><strong>Contactez Informaquik.</strong><p>Les étapes de prise en charge vous seront communiquées. Sauvegardez vos données avant une intervention.</p></div></li></ol></section>` +
      `<section class="section page-section"><div class="split-editorial"><div><span class="eyebrow">VOS QUESTIONS</span><h2>Avant et après<br><em>votre choix.</em></h2></div><div><details class="page-faq"><summary>Que dois-je vérifier avant de choisir ?</summary><p>La configuration, l’état de l’appareil, l’état de batterie, les accessoires et les conditions figurant dans l’offre.</p></details><details class="page-faq"><summary>Comment demander une prise en charge ?</summary><p>Préparez votre modèle, votre référence d’achat et une description du problème. Le formulaire de contact permet de composer ces informations.</p></details><details class="page-faq"><summary>Les données personnelles sont-elles sauvegardées automatiquement ?</summary><p>Ne présumez pas qu’une intervention comprend une sauvegarde. Conservez une copie de vos fichiers avant de confier votre ordinateur.</p></details>${link("#/contact?motif=sav", "Préparer une demande SAV")}<a class="text-link support-inline-link" href="#/depannage">Dépannage à distance ou en atelier ${icon()}</a></div></div></section>`,
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
      `<section class="section page-section"><div class="contact-layout"><form id="contact-form" class="contact-form"><span class="eyebrow">VOTRE MESSAGE</span><h2>Comment pouvons-nous<br><em>vous accompagner ?</em></h2><div class="contact-fields"><label>Votre nom<input name="name" autocomplete="name" maxlength="100" required></label><label>Votre e-mail<input type="email" name="email" autocomplete="email" maxlength="200" required></label><label>Entreprise (facultatif)<input name="company" autocomplete="organization" maxlength="150"></label><label>Votre demande<select name="reason"><option value="conseil">Conseil avant de choisir</option><option value="offre">Offre pour une sélection</option><option value="entreprise">PME / serveurs / équipement</option><option value="depannage">Dépannage à distance</option><option value="atelier">Réparation en atelier / magasin</option><option value="sav">Garantie / SAV</option></select></label><label class="full">Votre message<textarea name="message" rows="6" maxlength="3000" required placeholder="Modèle, usage, quantités, ou description du problème…"></textarea></label></div><button class="button dark" type="submit">${cfg.contactEmail ? "Préparer mon e-mail" : "Télécharger mon message"}${icon()}</button><p class="form-help">${cfg.contactEmail ? "Votre messagerie s’ouvrira pour vous permettre de vérifier et envoyer votre message." : "Votre message est préparé dans un fichier texte. Rien n’est envoyé automatiquement. Pour joindre Informaquik, utilisez les coordonnées du site i-q.ch."}</p><p id="contact-status" role="status"></p></form><aside class="contact-aside"><article class="editorial-card business-contact"><span class="eyebrow">RETROUVEZ-NOUS À MARTIGNY</span><h3>InformaQuik sàrl</h3><p>Rue du Simplon 27A, CP 626<br>1920 Martigny 1</p><a href="tel:+41275653232">027 565 32 32</a><a href="mailto:info@i-q.ch">info@i-q.ch</a><p>Lundi–jeudi : 09h–12h / 13h30–18h<br>Vendredi : fermeture à 17h.<br>Veilles de fêtes : fermeture à 17h.</p><a href="https://i-q.ch/" target="_blank" rel="noopener noreferrer" class="text-link">Coordonnées sur i-q.ch ${icon()}</a></article><article class="editorial-card"><span class="editorial-card-icon">${icon("screen")}</span><h3>Avant de choisir</h3><p>Indiquez vos usages, votre budget, les logiciels utilisés et vos préférences de format.</p><a class="text-link" href="#/guide">Consulter le guide ${icon()}</a></article><article class="editorial-card"><span class="editorial-card-icon">${icon("people")}</span><h3>Pour votre PME</h3><p>Hébergement de serveurs, sauvegardes, réseau ou équipement : décrivez votre infrastructure et vos besoins.</p><a class="text-link" href="#/entreprises">Découvrir nos solutions PME ${icon()}</a></article><article class="editorial-card"><span class="editorial-card-icon">${icon("shield")}</span><h3>Dépannage & atelier</h3><p>Assistance à distance avec AnyDesk ou TeamViewer et réparations dans notre atelier de Martigny.</p><a class="text-link" href="#/depannage">Accéder au dépannage ${icon()}</a></article></aside></div></section>`,
  };
  document.querySelectorAll("[data-support-tools]").forEach((el) => {
    el.innerHTML = supportButtons();
  });
  document.querySelectorAll("[data-support-quick-links]").forEach((el) => {
    el.innerHTML = `<span class="quick-support-label">Dépannage Windows</span><a href="${esc(cfg.support.anydesk)}" target="_blank" rel="noopener noreferrer" aria-label="Télécharger AnyDesk Informaquik pour Windows">AnyDesk ${icon()}</a><a href="${esc(cfg.support.teamviewer)}" target="_blank" rel="noopener noreferrer" aria-label="Télécharger TeamViewer QuickSupport pour Windows">TeamViewer ${icon()}</a>`;
  });
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
        if (
          ["entreprise", "sav", "offre", "depannage", "atelier"].includes(
            reason,
          )
        )
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
