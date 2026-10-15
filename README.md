# Informaquik — accueil, services et shop

Site Informaquik en français : accueil, dépannage et atelier à Martigny, solutions PME et boutique d’ordinateurs professionnels reconditionnés. Dix configurations transcrites des fiches fournies.

![Accueil Informaquik](docs/accueil.png)

[Aperçu du shop](docs/shop.png) · [Services](docs/services.png) · [Options après ajout au panier](docs/options.png) · [Options sur mobile](docs/options-mobile.png) · [Administration](docs/administration.png) · [Aperçu des solutions PME](docs/pme.png) · [Dépannage à distance et atelier](docs/depannage.png)

## Tester sans installation

Ouvrez **`downloads/Informaquik-Shop.html`** dans Edge, Chrome ou Firefox. Ce fichier contient tout le site et fonctionne sans serveur ni connexion Internet. L’archive **`downloads/Informaquik-Shop.zip`** contient la même version et ses instructions. Les téléchargements des outils de dépannage nécessitent une connexion Internet.

Depuis les sources, ouvrir `index.html` fonctionne également. Conservez `app.js`, `commerce.js`, `pricing.js`, `admin.js`, `pages.js`, `photos.js`, `style.css`, `catalogue.js` et `assets/` à côté du fichier.

## Fonctions

- Identité inspirée de [i-q.ch](https://i-q.ch/) : logo officiel conservé, palette noire, blanche et grise ; composition éditoriale propre à la boutique.
- Photos de chaque famille de modèles, conservées localement ; galerie de deux vues pour les HP.
- Exploration pédagogique des composants au survol ou au bouton, utilisable au clavier et sur mobile.
- Accueil Informaquik organisé autour de trois besoins : être dépanné, accompagner une PME, trouver un ordinateur.
- Menu principal à cinq entrées : **Accueil**, **Shop**, **Solutions PME**, **Dépannage & atelier**, **Contact**.
- **Bien choisir**, **Le reconditionné** et **Garanties & SAV** sont accessibles dans la navigation du shop et dans le pied de page.
- Solutions PME : serveurs hébergés, sauvegardes et restauration, réseaux et Wi-Fi professionnels, maintenance, antivirus, assistance et équipement. Banque d’heures présentée sans tarif inventé.
- Atelier de Martigny, réparations en magasin et dépannage à distance ou sur site pour les PME.
- Accès AnyDesk Informaquik et TeamViewer QuickSupport pour Windows avec leurs logos SVG locaux, dans l’en-tête fixe en haut à droite et dans la page Dépannage. Les liens reprennent ceux d’i-q.ch ; aucun outil n’est téléchargé ni exécuté automatiquement.
- Guide interactif : recommandations selon l’usage, le budget et le besoin d’un écran tactile.
- Contact : coordonnées publiques vérifiées, formulaire qui prépare un e-mail dans la messagerie du visiteur, motif SAV ou entreprise prérempli depuis les pages correspondantes.
- Catalogue organisé par marque et modèle, recherche, filtres d’usage et tactile, tri par prix ou mémoire.
- Huit prestations à ajouter au panier : transfert de données, installation Windows, nettoyage physique, nettoyage logiciel, détection de malwares, antivirus professionnel, licence Microsoft Office et abonnement Microsoft 365. Tarifs sur devis tant qu’ils ne sont pas renseignés.
- Après chaque ajout d’un ordinateur, une fenêtre propose les services et licences en option, sans présélection. On peut passer cette étape, ou sélectionner les options et les retrouver dans le panier et l’offre.
- Petit bouton **Masquer les prix · test**, également dans le panier : aperçu sans montants pour cet onglet, conservé à l’actualisation. Il agit sur les fiches, le guide, les options, le panier, les exports HTML/PDF et l’e-mail préparé. **Réafficher les prix · test** rétablit les montants si le site les autorise. Ce bouton ne modifie aucun réglage partagé.
- Panier mixte ou composé uniquement de services : quantités, persistance, export, impression/PDF et demande d’offre. Les devis distinguent le sous-total connu des prestations à chiffrer.
- Déplacements chez les particuliers et dans les entreprises, en plus de l’atelier et de l’assistance à distance. Les modalités et frais de déplacement sont confirmés avec l’offre.
- Administration protégée pour masquer les prix à tous les visiteurs de la version serveur. [Activation et utilisation](docs/ADMINISTRATION.md).
- Fiches détaillées : configuration, connectique, système, état et provenance à préciser.
- Prix de vente TTC en CHF ; TVA de 8,1 % selon les fiches fournies.
- Garantie ordinateur **24 mois**, garantie batterie **6 mois**, confirmées pour ce projet.
- Panier enregistré dans le navigateur, quantités, suppression, total et export de la sélection en HTML imprimable ou en PDF via le dialogue d’impression du navigateur.
- Présentation du réemploi de gammes professionnelles provenant, selon les lots, de parcs d’entreprises, administrations, services publics ou militaires.
- Mise en page adaptée aux ordinateurs et mobiles ; animations désactivables selon la préférence de mouvement réduit.

Les photos présentent les modèles, pas l’état d’un exemplaire précis. Le schéma des composants est générique et explicitement pédagogique. Les sources et crédits figurent dans [docs/SOURCES-VISUELS.md](docs/SOURCES-VISUELS.md). Les coûts d’achat et marges des captures ne sont pas inclus dans le catalogue ni la distribution.

## Tester les options et les prix

1. Ouvrir le fichier autonome, aller dans **Shop**, puis ajouter un ordinateur. La fenêtre d’options s’ouvre sans aucune case cochée.
2. Sélectionner par exemple **Antivirus professionnel** et **Microsoft 365**, puis **Ajouter les options**. Le panier contient le PC et ces deux options. **Continuer sans option** ajoute uniquement le PC.
3. Dans le panier, cliquer sur **Masquer les prix · test**. Les montants deviennent « Sur devis », y compris dans **Exporter ma sélection**, **Imprimer / enregistrer en PDF** et **Demander une offre**.
4. Cliquer sur **Réafficher les prix · test** pour retrouver les prix connus. Les licences restent sur devis tant que leurs tarifs ne sont pas renseignés. Cet aperçu ne concerne que l’onglet ; le réglage partagé se fait dans l’administration.

## Performance et simplicité

- L’accueil s’ouvre par défaut. Le catalogue et ses images sont initialisés au premier accès au shop ; le panier reste utilisable sur toutes les pages.
- Aucune bibliothèque, police ou image distante nécessaire pour afficher le site. Les photos restent locales et se chargent progressivement.
- Le serveur Node utilise Brotli/gzip pour HTML, CSS, JavaScript et SVG, ainsi que des ETag pour éviter de retransmettre les ressources inchangées. Les fichiers modifiés restent détectés pendant le développement.
- La version HTML autonome contient les logos et photos pour fonctionner hors ligne. La compression HTTP concerne la version servie par Node.

La compression et le cache sont vérifiés automatiquement. L’accueil ne charge aucune photo produit avant l’ouverture du shop. Les temps réels dépendent de l’hébergement et de la connexion.

## Le catalogue fourni

Dix références distinctes, après suppression des captures répétées :

| Modèle                         | Processeur                         | RAM   | SSD    | Prix TTC  |
| ------------------------------ | ---------------------------------- | ----- | ------ | --------- |
| HP EliteBook x360 1030 G7      | Core i5-10210U                     | 16 Go | 250 Go | 699 CHF   |
| Lenovo ThinkPad X13 Yoga Gen 2 | Core i7-1185G7                     | 16 Go | 256 Go | 799 CHF   |
| HP EliteBook 850 G7 · i7       | Core i7-10610U                     | 16 Go | 256 Go | 799 CHF   |
| HP EliteBook 850 G7 · i5       | Core i5-10210U                     | 16 Go | 512 Go | 799 CHF   |
| HP EliteBook 850 G8            | Core i5-1145G7                     | 32 Go | 256 Go | 799 CHF   |
| HP ZBook Studio G7             | Core i7-10850H                     | 32 Go | 512 Go | 1 499 CHF |
| HP EliteBook x360 1030 G8      | Core i7-1185G7                     | 16 Go | 512 Go | 799 CHF   |
| HP ProBook x360 435 G10        | AMD Ryzen 5, référence à confirmer | 16 Go | 256 Go | 799 CHF   |
| Lenovo ThinkPad T14 Gen 1      | Core i5-10310U                     | 16 Go | 256 Go | 599 CHF   |
| Lenovo ThinkPad T14s Gen 2     | Core i5-1145G7                     | 16 Go | 250 Go | 799 CHF   |

Les points à vérifier sont regroupés dans [CATALOGUE-A-VERIFIER.md](CATALOGUE-A-VERIFIER.md). Aucune quantité disponible, note d’état ou provenance de lot n’a été inventée.

## Adapter les informations

Modifier **`catalogue.js`** : identité, devise, garanties et coordonnées dans `SHOP_CONFIG` ; modèles, caractéristiques, prix et disponibilités dans `SHOP_PRODUCTS` ; prestations et tarifs éventuels dans `SHOP_SERVICES`. `price: null` signifie « Sur devis » et ne vaut pas zéro.

`stock: null` signifie que la disponibilité doit être confirmée. Le panier permet de préparer une demande, sans réserver un stock. Renseigner une quantité réelle permet de limiter la sélection à cette quantité. Les filtres de marque se construisent automatiquement à partir du catalogue.

`contactEmail` contient l’adresse publique `info@i-q.ch`, relevée sur le site de référence. Le panier et le formulaire ouvrent un message à vérifier et à envoyer depuis la messagerie du visiteur. Aucun e-mail n’est envoyé automatiquement. Effacer cette valeur désactive le bouton e-mail du panier et propose le téléchargement du message de contact en texte. La version actuelle ne collecte pas de paiement, ne transmet pas de commandes et ne propose pas de gestion de stock partagée. Publier le dépôt ne met pas automatiquement la boutique en ligne.

Les photographies et leurs crédits sont configurés dans **`photos.js`**. Les deux configurations du 850 G7 partagent les visuels du même châssis. Le contenu des pages et leur navigation se trouvent dans **`pages.js`**. Les liens Windows d’assistance se configurent dans `SHOP_CONFIG.support` (`anydesk` et `teamviewer`).

## Administration partagée

Définir `ADMIN_PASSWORD` sur l’hébergement, conserver `DATA_DIR` sur un disque persistant et utiliser le serveur Node. L’accès se fait par **Administration** dans le pied de page. Le fichier HTML autonome reste utilisable pour le shop et les services, mais ne peut pas modifier le réglage d’un site partagé. Voir [docs/ADMINISTRATION.md](docs/ADMINISTRATION.md).

## Développement et vérification

Aucune dépendance à installer ; Node.js 24 ou supérieur suffit pour les commandes de développement.

```sh
npm start
npm test
npm run package
```

Le serveur de développement utilise le port 4173 (`PORT` et `HOST` configurables). Il sert uniquement les ressources de la boutique. `npm run package` fabrique le fichier HTML autonome et le ZIP dans `downloads/` avec les sommes SHA-256.

La version autonome est vérifiée dans un navigateur, notamment l’ouverture sans serveur, le chargement des photos, les galeries, les pages de services et les accès secondaires, le guide, le formulaire, l’exploration des composants, les filtres, les fiches, le panier persistant, l’export et la mise en page mobile. Les tests Node vérifient les données, les sous-totaux mixtes et les services sur devis, les ressources embarquées, la compression/cache et l’administration (authentification, CSRF, origine, persistance, déconnexion, limitation des tentatives). Les essais navigateur couvrent aussi deux sessions indépendantes, l’aperçu isolé par onglet, les exports et la vue d’impression sans montants, les options sans présélection, l’abandon sans ajout de service, l’accès au clavier, les limites de quantité et les nouveaux écrans sur cinq largeurs (320 à 1 440 px).

## Configuration cloud

Le projet est séparé de `Gestion-des-horaires`. Utiliser directement le dossier `/workspace/Informaquik-Shop`, sans créer de worktree. Les fichiers persistent, mais le processus `npm start` doit être relancé dans une nouvelle tâche si le serveur est nécessaire.
