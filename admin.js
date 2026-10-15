"use strict";
(() => {
  const pricing = window.SHOP_PRICING;
  let csrfToken = "";
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
  async function api(url, method = "GET", data) {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      headers: {
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Une erreur est survenue.");
    return result;
  }
  const status = (message) => {
    const el = document.getElementById("admin-status");
    if (el) el.textContent = message;
  };
  async function render() {
    const panel = document.getElementById("admin-panel");
    if (!panel) return;
    await pricing.ready;
    if (!panel.isConnected) return;
    if (pricing.mode !== "server") {
      panel.innerHTML = `<article class="admin-card"><h2>Administration du site hébergé</h2><p>${pricing.mode === "local" ? "Vous consultez une version autonome ou statique. Le réglage partagé des prix et la connexion protégée sont disponibles dans la version hébergée avec le serveur Informaquik." : "Les réglages du serveur sont indisponibles. Réessayez dans un instant."}</p><p>Le fichier HTML fonctionne pour consulter le shop et préparer une sélection. Il ne peut pas modifier les prix affichés sur un autre site.</p><a class="button dark" href="#/boutique">Revenir au shop</a></article>`;
      return;
    }
    try {
      const session = await api("/api/admin/session");
      if (!panel.isConnected) return;
      csrfToken = session.csrfToken || "";
      if (!session.configured) {
        panel.innerHTML =
          '<article class="admin-card"><h2>Accès à configurer</h2><p>L’accès administrateur doit être activé par l’hébergeur avant la première connexion. Aucun mot de passe par défaut n’est publié.</p><a class="button secondary" href="#/contact">Revenir au contact</a></article>';
        return;
      }
      if (!session.authenticated) {
        panel.innerHTML =
          '<form id="admin-login" class="admin-card"><span class="eyebrow">ACCÈS PROTÉGÉ</span><h2>Connexion administrateur</h2><label>Mot de passe<input type="password" name="password" autocomplete="current-password" required minlength="12" maxlength="256"></label><button type="submit" class="button dark">Se connecter</button><p id="admin-status" role="status"></p></form>';
        return;
      }
      panel.innerHTML = `<form id="admin-settings" class="admin-card"><span class="eyebrow">RÉGLAGES POUR TOUS LES VISITEURS</span><h2>Affichage des prix</h2><label class="admin-switch"><input type="checkbox" name="hidePrices" ${pricing.siteVisible ? "" : "checked"}><span><strong>Masquer les prix</strong><small>Afficher « Sur devis » dans le shop, les fiches et le panier. Retirer les montants des exports et demandes d’offre.</small></span></label><p>Le réglage est enregistré sur le serveur. Les autres visiteurs le voient à l’actualisation ou lors de la prochaine synchronisation automatique.</p><div class="admin-actions"><button type="submit" class="button dark">Enregistrer pour tous les visiteurs</button><button type="button" class="button secondary" data-admin-action="logout">Se déconnecter</button></div><p id="admin-status" role="status"></p></form>`;
    } catch (error) {
      if (panel.isConnected)
        panel.innerHTML = `<article class="admin-card"><h2>Connexion indisponible</h2><p>${esc(error.message)}</p><button class="button secondary" data-admin-action="retry">Réessayer</button></article>`;
    }
  }
  document.addEventListener("submit", async (event) => {
    if (!["admin-login", "admin-settings"].includes(event.target.id)) return;
    event.preventDefault();
    const form = event.target,
      button = form.querySelector("button[type=submit]");
    button.disabled = true;
    status("Enregistrement…");
    try {
      if (form.id === "admin-login") {
        const data = Object.fromEntries(new FormData(form));
        const result = await api("/api/admin/login", "POST", {
          password: data.password,
        });
        csrfToken = result.csrfToken;
        await pricing.refresh();
        await render();
      } else {
        await api("/api/admin/settings", "PATCH", {
          showPrices: !form.elements.hidePrices.checked,
        });
        await pricing.refresh();
        await render();
        status("Réglage enregistré pour tous les visiteurs.");
      }
    } catch (error) {
      status(error.message);
    } finally {
      if (button.isConnected) button.disabled = false;
    }
  });
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button) return;
    if (button.dataset.adminAction === "retry") {
      await pricing.refresh();
      await render();
    } else {
      button.disabled = true;
      try {
        await api("/api/admin/logout", "POST", {});
        csrfToken = "";
        await render();
      } catch (error) {
        status(error.message);
        button.disabled = false;
      }
    }
  });
  window.SHOP_ADMIN = { render };
})();
