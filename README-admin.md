# Espace admin & espace donateur — notes importantes

Ces deux espaces ont été ajoutés au site statique livré précédemment. Ils sont **entièrement
fonctionnels dans votre navigateur**, mais reposent sur `localStorage` (stockage local du
navigateur) plutôt que sur une vraie base de données serveur. C'est un prototype qui vous permet
de valider tous les parcours avant d'investir dans un vrai backend. Concrètement, cela veut dire :

- Les données (commandes, prix, photos, avis, comptes) restent **dans le navigateur où elles ont
  été créées**. Elles ne sont pas visibles depuis un autre ordinateur, un autre téléphone, ou même
  un autre navigateur sur le même appareil.
- Le mot de passe admin (`caritative2026`, modifiable dans `assets/js/store.js` /
  `ccSession.loginAdmin`) n'est **pas sécurisé** pour de la production : il est visible dans le
  code source. Ne l'utilisez pas tel quel pour protéger de vraies données sensibles.
- Les comptes donateurs n'ont aucun chiffrement de mot de passe.

**En clair : c'est la maquette fonctionnelle de tout ce que vous avez demandé, prête à montrer à
votre équipe ou à des partenaires, mais il faut la brancher à un vrai serveur avant de l'ouvrir à
de vrais donateurs.**

## Ce que vous pouvez tester dès maintenant

### Espace admin — `admin/index.html` (lien « Accès gérant » en bas de chaque page publique)
Mot de passe démo : `caritative2026`

- **Tableau de bord** : dons enregistrés, montant total, bénéficiaires estimés, pages les plus
  visitées, fonctionnalités les plus cliquées, une carte des zones cliquées sur les pages, et les
  dernières commandes.
- **Commandes** : liste de tous les dons, changement de statut (Reçue → Confirmée → En
  préparation → Réalisée).
- **Dons « 1h de salaire »** : liste des contributions reçues via le calculateur de salaire
  horaire, avec la cagnotte soutenue et le statut de paiement.
- **Agenda** : calendrier cliquable pour ouvrir ou fermer des jours aux réservations et fixer,
  pour chaque jour ouvert, le nombre de dons acceptés (capacité). C'est ce calendrier qui
  détermine les jours proposés aux clients dans le formulaire de commande.
- **Packages & prix** : modification des prix, noms, délais, nombre de bénéficiaires ; activer /
  désactiver une formule ; la mettre en avant sur la page d'accueil ; en créer une nouvelle. Les
  changements sont immédiatement visibles sur les pages Accueil, Packages et Commande.
- **Cagnottes (1h)** : gestion des causes proposées sur la page « 1h de mon salaire » (nom,
  description, objectif, montant déjà collecté, nombre de contributeurs, activer/désactiver).
- **Photos & vidéos** : choisir une commande, uploader des fichiers, notifier automatiquement le
  client (le statut passe à « Réalisée » et une notification est enregistrée pour son espace
  donateur).
- **Avis clients** : publier ou dépublier les témoignages envoyés par les donateurs.
- **Paramètres** : le lien WhatsApp vers lequel les clients sont redirigés pour payer (ex.
  `https://wa.me/22997000000`), et le message pré-rempli envoyé avec (avec `{ref}` et `{montant}`
  remplacés automatiquement).
- **Export des données** : tout télécharger en JSON, ou chaque table en CSV (Excel).

### Espace donateur — `compte/index.html` (lien « Mon espace » dans le menu de chaque page)
Compte démo : `rachida@email.com` / `demo1234`

- Historique des dons (classiques et « 1h de salaire »), avec téléchargement de facture (fichier
  HTML imprimable en PDF depuis le navigateur) et accès aux photos reçues.
- Statistiques personnelles : nombre de dons, montant total, personnes aidées.
- Formulaire d'avis avec boutons de partage WhatsApp / Facebook.

### Le parcours de commande, pas à pas

1. **Choix de la formule** (étape 1).
2. **Date, via un calendrier** (étape 2) : seuls les jours ouverts par l'admin dans l'Agenda, et
   pas encore complets, sont cliquables. Un jour se ferme automatiquement dès que sa capacité est
   atteinte par d'autres commandes.
3. **Coordonnées** (étape 3).
4. **Récapitulatif** (étape 4) → le client confirme, reçoit son numéro de suivi immédiatement, puis
   clique sur « Procéder au paiement ».
5. **Paiement** : le client choisit un moyen de paiement puis clique sur « Confirmer et payer » —
   il est alors redirigé vers le lien WhatsApp configuré par l'admin, avec un message pré-rempli
   contenant sa référence et le montant à régler. C'est là que la conversation de paiement réel
   avec l'équipe démarre.

Le parcours « 1h de mon salaire » suit la même logique : calcul du montant → sélection d'une
cagnotte en cliquant dessus → coordonnées → confirmation avec numéro de suivi → paiement via le
même lien WhatsApp.

### Pour tester le parcours complet

1. Dans l'admin, ouvrez quelques jours dans l'**Agenda** et renseignez un lien WhatsApp dans
   **Paramètres**.
2. Faites un don depuis `commande.html` : choisissez une date parmi celles ouvertes, allez jusqu'au
   bout, puis cliquez sur « Procéder au paiement » → « Confirmer et payer ». Vous devriez être
   redirigé vers WhatsApp avec le message pré-rempli.
3. Connectez-vous à l'admin (`admin/index.html`) : la commande apparaît dans Commandes et dans le
   tableau de bord, avec le statut « Confirmée ».
4. Depuis Photos & vidéos, envoyez une image liée à cette commande.
5. Créez un compte donateur avec le même email dans `compte/index.html` : le don, son statut et la
   photo apparaissent automatiquement, ainsi que sa facture téléchargeable.
6. Sur `don-horaire.html`, choisissez un revenu horaire, cliquez une cagnotte, renseignez vos
   coordonnées, confirmez : vous obtenez un numéro de suivi (préfixe `CCH-`) que vous pouvez
   chercher sur `suivi.html`.
7. Laissez un avis depuis l'espace donateur, puis publiez-le depuis l'admin : il apparaît sur
   `avis.html`.

## Pour une vraie mise en production

Il faut remplacer `assets/js/store.js` par de vrais appels à un serveur avec :
- une base de données partagée (PostgreSQL, MySQL, ou un service comme Supabase/Firebase) ;
- une authentification sécurisée (mots de passe hachés, sessions ou tokens) pour l'admin et les
  donateurs ;
- un stockage de fichiers dédié pour les photos/vidéos (S3, Cloudinary, etc. — le localStorage ne
  supporte que quelques Mo et n'est pas fait pour des fichiers lourds) ;
- un vrai outil d'envoi d'email/WhatsApp pour les notifications ;
- idéalement, un outil d'analytics dédié (Plausible, Umami, Google Analytics) plutôt que le
  traqueur maison inclus ici, qui ne voit que l'activité d'un seul navigateur.

Je peux continuer à faire évoluer ce prototype ici, ou vous pouvez le reprendre avec Claude Code
pour brancher un vrai backend.
