# Administration des prix

L’administration partagée fonctionne avec le serveur Node du projet. Un site statique ou le fichier HTML autonome ne peut pas enregistrer un réglage pour les autres visiteurs.

## Activer l’accès sur l’hébergement

1. Utiliser Node.js 24 ou supérieur et lancer `npm start` depuis le projet.
2. Définir **`ADMIN_PASSWORD`** dans les secrets ou variables protégées de l’hébergement : choisir un mot de passe de 12 à 256 caractères. Il n’y a aucun mot de passe par défaut. Ne pas l’ajouter au dépôt ni au JavaScript public.
3. Conserver **`DATA_DIR`** sur un disque persistant. Par défaut, il s’agit du dossier `data/` du projet, ignoré par Git. Il contient `settings.json`, avec le réglage d’affichage des prix.
4. Sur un site public, utiliser HTTPS et renseigner **`PUBLIC_ORIGIN`** avec l’origine exacte du site (schéma et domaine, sans chemin). Les sessions utilisent alors un cookie sécurisé.
5. Ouvrir **`/#/admin`**, également accessible par « Administration » dans le pied de page.

`PORT` et `HOST` se configurent selon l’hébergement. Le serveur peut rester derrière le reverse proxy HTTPS de l’hébergeur.

## Masquer les prix

Se connecter, cocher **Masquer les prix**, puis choisir **Enregistrer pour tous les visiteurs**.

- Catalogue, fiches, services et panier : « Sur devis » remplace les montants.
- Guide : le filtre de budget et les tarifs des recommandations sont masqués. Le tri par prix du catalogue est désactivé.
- Exports HTML, impression/PDF et e-mails préparés depuis le panier : les montants ne sont pas inclus.
- Les visiteurs déjà présents se synchronisent automatiquement sous 30 secondes, au retour dans la fenêtre, ou immédiatement après actualisation.
- Le choix est conservé après redémarrage, tant que le dossier de données est conservé.

Décocher l’option et enregistrer pour réafficher les prix connus. Les services sans tarif restent sur devis.

Le réglage concerne l’affichage et les nouveaux exports. Il ne retire pas les tarifs des données sources du catalogue ou de l’historique Git, et ne modifie pas les fichiers HTML/PDF déjà téléchargés. Les copies autonomes ne se synchronisent pas avec le serveur.

## Accès et sessions

Le serveur vérifie le mot de passe et les droits de modification ; cacher un bouton dans le navigateur ne suffit pas à modifier les réglages. Les sessions expirent après huit heures et sont invalidées au redémarrage. Cinq échecs de connexion depuis la même adresse entraînent une attente de quinze minutes. La déconnexion ferme la session courante.

Pour changer le mot de passe, remplacer `ADMIN_PASSWORD` sur l’hébergement et redémarrer le serveur. Sans cette variable, la boutique reste utilisable mais la connexion administrateur est désactivée.

## Tester sans connexion administrateur

Le petit bouton **Masquer les prix · test** (en bas à gauche du site et dans le panier) permet de prévisualiser les fiches, le panier et les offres sans montants. Il fonctionne aussi dans le fichier HTML autonome. Le choix est conservé dans l’onglet lors de l’actualisation, et peut être annulé avec **Réafficher les prix · test**. Il ne modifie pas le réglage du serveur et ne concerne pas les autres visiteurs.

Si l’administration masque déjà les prix, le bouton ne peut pas les réafficher. Le formulaire administrateur montre toujours le réglage partagé, indépendamment de l’aperçu local.
