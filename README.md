# Cuisine Caritative — site web

Site statique (HTML/CSS/JS, aucune dépendance à installer) construit à partir du plan de projet fourni.
Il suffit d'héberger ce dossier tel quel sur n'importe quel hébergement web (y compris un hébergement
mutualisé classique, Netlify, Vercel ou GitHub Pages) — il n'y a ni serveur, ni base de données, ni
étape de build à lancer.

## Structure

```
index.html                 Accueil
comment-ca-marche.html     Étapes détaillées + FAQ
packages.html               Catalogue des formules + configurateur de budget
commande.html               Formulaire de commande en 4 étapes (formule → détails → coordonnées → paiement)
don-horaire.html            Calculateur "1h de mon salaire" + cagnottes
galerie.html                 Galerie d'impact + statistiques + zones couvertes
organisations.html          Offre RSE / entreprises + formulaire de devis
a-propos.html                Histoire, mission, engagements
suivi.html                   Suivi de commande (démo)
blog.html                    Liste d'articles de sensibilisation
contact.html                 Formulaire de contact
mentions-legales.html       Transparence financière, mentions légales
avis.html                    Avis publics + formulaire de soumission

admin/                        Espace gérant (voir README-admin.md) : tableau de bord, commandes,
                               packages & prix, envoi de photos/vidéos, modération des avis, export
compte/                       Espace donateur (voir README-admin.md) : connexion, historique de
                               dons, factures, photos reçues, avis

assets/css/style.css        Système de design (couleurs, typographie, composants)
assets/js/main.js           Interactivité du site public (menu, FAQ, calculateurs, commande, suivi)
assets/js/store.js           « Base de données » partagée (localStorage) utilisée par tout le site
assets/js/admin.js           Logique de l'espace admin
assets/js/compte.js          Logique de l'espace donateur
assets/img/                 Vos logos (fournis)
```

## Déploiement / publication

Le site est prêt pour un hébergement statique sans étape de build. Les options recommandées sont :

- GitHub Pages : branche `main`, dossier racine du dépôt, avec `.nojekyll` activé pour éviter toute transformation Jekyll.
- Netlify / Vercel : importez simplement ce dossier comme site statique et laissez le build vide.

Exemple de configuration Netlify (`netlify.toml`) est fournie dans la racine du projet.

### Vérification rapide avant publication

1. Ouvrez la page d'accueil localement avec un serveur statique.
2. Vérifiez le menu mobile, le formulaire de commande et le parcours WhatsApp.
3. Confirmez que les liens internes fonctionnent depuis la racine et depuis les sous-pages.
4. Pour GitHub Pages, poussez le dépôt puis activez le déploiement via l'onglet Pages du dépôt.

## Espace admin & espace donateur

Un tableau de bord gérant et un espace donateur ont été ajoutés — voir **`README-admin.md`** pour
le détail complet des fonctionnalités, les identifiants de démonstration, et surtout les
limites importantes à connaître avant une mise en production (ces espaces utilisent le stockage
local du navigateur, pas une vraie base de données partagée).

## Passe design (UI/UX, art génératif, responsive)

- **Palette et typographie** appliquées de façon cohérente sur tout le site à partir de vos logos
  (bleu #2888BA, accent doré, vert de confiance ; Fredoka pour les titres, Work Sans pour le texte).
- **Art génératif** : `generate_art.py` produit des compositions abstraites procédurales (formes
  organiques + nuages de points) dans la palette de marque, utilisées dans les visuels de hero, la
  galerie, le blog et les écrans de connexion. Ce sont des placeholders assumés — relancez le script
  pour de nouvelles variantes, ou remplacez-les par vos photos réelles / des images IA validées une
  fois le style approuvé. Fichiers dans `assets/img/generative/`.
- **Responsive** : toutes les grilles (packages, galerie, blog, statistiques, formulaires) ont été
  reconstruites en flexbox avec des largeurs de base plutôt que des paliers fixes, pour un
  réagencement naturel à n'importe quelle largeur d'écran — testé et vérifié à 390px (mobile),
  820px (tablette) et 1440px (ordinateur).
- Deux bugs de mise en page réels ont été trouvés et corrigés pendant les tests : le menu mobile
  qui ne se cachait pas correctement hors-écran, et des tableaux d'administration qui débordaient
  sur petits écrans faute de défilement horizontal.

## Ce qui est déjà fonctionnel (côté navigateur)

- Configurateur de budget sur la page Packages (suggestion automatique de formule).
- Formulaire de commande en 4 étapes avec récapitulatif dynamique et numéro de suivi généré.
- Calculateur "1h de mon salaire" avec option de don récurrent.
- Filtres de packages, FAQ en accordéon, compteurs animés, menu mobile.
- Formulaires de contact et de devis RSE (démo front-end).

## Ce qu'il reste à brancher pour une mise en production réelle

Ces éléments demandent un service côté serveur et des identifiants que vous seul pouvez fournir ; le
code actuel simule leur comportement pour que vous puissiez valider l'expérience avant de les connecter :

1. **Paiement réellement encaissé** — le parcours redirige maintenant vers WhatsApp avec un
   message pré-rempli (référence + montant), mais la conversation de paiement et son suivi restent
   manuels avec votre équipe. Un vrai encaissement Mobile Money/carte en ligne demanderait un
   prestataire de paiement intégré.
2. **Back-office de gestion des commandes** pour votre équipe terrain (liste triée par date, upload photos/vidéos) — déjà présent dans l'espace admin, à connecter à une vraie base partagée.
3. **Envoi automatique des confirmations et des preuves** par email/WhatsApp (actuellement, le client va lui-même chercher ses preuves sur le site).
4. **Suivi de commande connecté à une vraie base de données partagée entre appareils** (actuellement les données vivent dans le navigateur, voir `README-admin.md`).
5. **Vos vraies photos et vidéos** en remplacement des tuiles d'art génératif de `galerie.html` — c'est,
   comme indiqué dans le plan initial, votre plus grand actif de crédibilité.
6. **Comptes donateurs et dons récurrents automatisés** — les comptes existent déjà ; il manque l'automatisation du renouvellement mensuel réel.

## Personnalisation rapide

- Couleurs, polices, espacements : tout est centralisé dans `assets/css/style.css` (variables en haut du fichier).
- Textes : directement dans chaque page HTML.
- Logos : déjà intégrés depuis vos fichiers fournis (`assets/img/`).

## Dernières améliorations (agenda, paiement WhatsApp, cagnottes)

- **« 1h de mon salaire »** : le choix de la cause se fait maintenant en cliquant sur une cagnotte
  (au lieu d'un simple lien d'ancrage), et chaque contribution génère un numéro de suivi
  (`CCH-xxxxxx`) consultable sur `suivi.html` et dans l'espace donateur.
- **Calendrier de commande** : la page `commande.html` affiche un vrai mini-calendrier qui ne
  laisse cliquer que les jours ouverts par l'admin et pas encore complets (capacité définie par
  jour). Voir `README-admin.md` pour la configuration.
- **Paiement via WhatsApp** : après confirmation d'une commande (ou d'un don « 1h de salaire »),
  le client accède à un écran de paiement avec un bouton « Confirmer et payer » qui le redirige
  vers le lien WhatsApp configuré par l'admin, message pré-rempli avec sa référence et son montant.
- **Nouvelles pages admin** : Agenda (ouvrir/fermer des jours, fixer une capacité), Cagnottes
  (gérer les causes du don « 1h de salaire »), Paramètres (lien WhatsApp + message), et Dons
  « 1h de salaire » (liste des contributions).
