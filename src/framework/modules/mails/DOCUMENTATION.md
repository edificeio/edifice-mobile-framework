# Module Mails – Documentation fonctionnelle

## 1. Vue d’ensemble

Le module **Mails** de l’application Edifice Mobile permet la consultation et l’envoi de courriels. Il s’appuie sur **deux backends** selon les droits de l’utilisateur :

- **Mails Classic** : API REST Entcore (`/conversation/...`, `/communication/...`, etc.)
- **Carbonio** : API SOAP Zimbra (ex. `mail.lyceeconnecte.fr`), activée si l’utilisateur possède le droit `org.entcore.auth.controllers.CarbonioPreauthController|preauth`

Le choix du service est fait au chargement via `getMailCarbonioRight(session)` dans `service/index.ts` : si le droit Carbonio est présent, `carbonioMailsApi` est utilisé, sinon `mailsApi` (classic).

---

## 2. Fonctionnalités disponibles (par écran et par service)

### 2.1 Liste des mails (écran d’accueil)

| Fonctionnalité                   | Description                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dossiers par défaut**          | Boîte de réception, Envoyés, Brouillons, Corbeille (identifiants : `inbox`, `outbox`, `draft`, `trash`)                                          |
| **Dossiers personnalisés**       | Affichage et navigation dans les dossiers utilisateur (uniquement si `folders.get` est disponible)                                               |
| **Liste des messages**           | Aperçus (expéditeur, destinataires, sujet, date, pièce jointe, non lu, état brouillon/envoyé)                                                    |
| **Pagination**                   | Chargement de la première page puis « page suivante » en fin de liste (classic) ; Carbonio renvoie une liste fixe (ex. 100)                      |
| **Recherche**                    | Champ de recherche pour filtrer les messages (paramètre `search` passé à `mails.get`)                                                            |
| **Mode sélection**               | Sélection multiple de mails pour actions groupées                                                                                                |
| **Actions groupées (sélection)** | Marquer lu / non lu, déplacer vers un dossier, retirer du dossier, mettre à la corbeille, supprimer définitivement, restaurer (depuis corbeille) |
| **Ouverture d’un mail**          | Clic sur un aperçu → écran Détail ; si brouillon → écran Édition                                                                                 |
| **Menu contextuel (liste)**      | Sélectionner, Rechercher, Configurer la signature, Renommer le dossier, Supprimer le dossier (selon disponibilité des méthodes du service)       |
| **Compteurs par dossier**        | Nombre de non lus (ou nombre pour Brouillons) pour les dossiers par défaut (si `folder.count` disponible)                                        |
| **Création de dossier**          | Depuis le bottom sheet « Déplacer » : créer un nouveau dossier puis y déplacer les mails (si `folder.create` et `mail.moveToFolder` disponibles) |

### 2.2 Détail d’un mail

| Fonctionnalité                          | Description                                                                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Affichage**                           | Sujet, expéditeur, destinataires (To, Cc, Cci), date, corps HTML, pièces jointes, historique de conversation (réponses imbriquées)                                                                                 |
| **Répondre**                            | Ouvrir l’écran d’édition en mode Réponse (un seul destinataire : l’expéditeur ou le premier du groupe)                                                                                                             |
| **Répondre à tous**                     | Ouvrir l’écran d’édition avec To/Cc/Cci pré-remplis (si plusieurs destinataires)                                                                                                                                   |
| **Transférer**                          | Créer un brouillon de transfert puis ouvrir l’écran d’édition en mode Transfert (si `mail.forward` disponible)                                                                                                     |
| **Rappel de message**                   | Retirer un message envoyé (si `mail.recall` disponible, droit dédié, délai < 60 min, expéditeur = utilisateur connecté)                                                                                            |
| **Marquer non lu**                      | Basculer le statut « lu » (si `mail.toggleUnread` disponible)                                                                                                                                                      |
| **Déplacer**                            | Déplacer le mail vers un dossier (liste + possibilité de créer un dossier) si `mail.moveToFolder` et `folder.create` disponibles                                                                                   |
| **Retirer du dossier**                  | Retirer le mail du dossier personnalisé courant (si `mail.removeFromFolder` disponible, hors dossiers par défaut)                                                                                                  |
| **Corbeille / Restaurer**               | Mettre à la corbeille ou restaurer depuis la corbeille                                                                                                                                                             |
| **Supprimer définitivement**            | Suppression définitive (depuis la corbeille)                                                                                                                                                                       |
| **Pièces jointes**                      | Affichage et ouverture/téléchargement des pièces jointes (si `attachments.supportViewAttachments`). Sinon (Carbonio) : liste des noms + bouton unique pour ouvrir le mail dans la webview et consulter les pièces. |
| **Téléchargement / partage des pièces** | En mode lecture (Classic uniquement) : chaque pièce peut être téléchargée, ouverte ou partagée via le composant Attachments.                                                                                       |
| **Contenu original**                    | Lien « Contenu original » si le backend indique `original_format_exists` (uniquement classic)                                                                                                                      |
| **Historique**                          | Bloc « conversation-history » affiché séparément (bouton pour déplier)                                                                                                                                             |
| **Redirection webview (Carbonio)**      | Message + lien pour ouvrir le mail dans l’interface web Carbonio (si `mail.rederictToWebview` disponible). Affiché lorsque `supportViewAttachments` est faux.                                                      |
| **Images dans le corps (Carbonio)**     | Les images dont le `src` est invalide (cid:, data:, ou hébergement lyceeconnecte) sont remplacées par un lien « Ouvrir l’image dans le web » pointant vers la version web du mail.                                 |
| **Message rappelé**                     | Affichage spécifique pour un message rappelé (titre, texte, pas de réponse si non expéditeur)                                                                                                                      |

### 2.3 Édition / rédaction (nouveau, réponse, transfert, brouillon)

| Fonctionnalité                 | Description                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Destinataires**              | Champs To, Cc, Cci avec sélection de contacts (visibles)                                                                                                                                                       |
| **Sujet**                      | Champ sujet                                                                                                                                                                                                    |
| **Corps**                      | Éditeur riche HTML (RichEditor)                                                                                                                                                                                |
| **Signature**                  | Insertion automatique de la signature si configurée (uniquement si `signature.get` disponible)                                                                                                                 |
| **Pièces jointes**             | Ajout et suppression de pièces jointes sur un brouillon (uniquement si `attachments.add` et `attachments.remove` disponibles). Sources d’ajout : appareil photo, galerie, documents (modal AttachmentsImport). |
| **Upload d’images**            | Insertion d’images dans le corps (si `attachments.allowMultimediaUpload === true`)                                                                                                                             |
| **Enregistrer en brouillon**   | Sauvegarde automatique ou manuelle en brouillon (`sendToDraft`, `updateDraft`)                                                                                                                                 |
| **Envoyer**                    | Envoi du mail (`send` avec éventuel `draftId` et `inReplyTo`)                                                                                                                                                  |
| **Supprimer le brouillon**     | Mise à la corbeille du brouillon courant                                                                                                                                                                       |
| **Option « Ne pas répondre »** | Indication noReply (utilisée côté classic pour masquer Répondre/Répondre à tous si droit dédié)                                                                                                                |
| **Historique dans le corps**   | En réponse/transfert, affichage de l’historique (addHtmlReply / addHtmlForward)                                                                                                                                |

### 2.4 Signature

| Fonctionnalité    | Description                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| **Consultation**  | Récupération de la préférence (signature + useSignature) via `signature.get`                 |
| **Modification**  | Mise à jour via `signature.update` (signature, useSignature)                                 |
| **Disponibilité** | Uniquement en Mails Classic ; Carbonio expose `signature.get` et `signature.update` à `null` |

### 2.5 Contacts / Visibles (destinataires)

| Fonctionnalité                       | Description                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Liste préchargée (classic)**       | `visibles.get` renvoie la liste des contacts/visibles ; elle est mise en cache (storage) et utilisée pour le filtre local dans le champ destinataires |
| **Recherche à la frappe (Carbonio)** | `visibles.getOnSearch(query)` appelle l’API d’autocomplétion (FullAutocompleteRequest) ; pas de liste préchargée                                      |
| **ShareBookmark (classic)**          | Ouverture d’un carnet de partage par `bookmark.getById` pour afficher groupes/utilisateurs ; Carbonio n’expose pas `bookmarks.getById` (null)         |

---

## 3. Spécifications fonctionnelles Carbonio

### 3.1 Choix du backend

- **Condition** : l’utilisateur doit avoir le droit `org.entcore.auth.controllers.CarbonioPreauthController|preauth`.
- **Service utilisé** : `carbonioMailsApi` (défini dans `service/api/carbonio.ts`).

### 3.2 Authentification

- **Préauthentification** : un token Carbonio est obtenu via une fonction dédiée (`getCarbonioAuthToken`). L’URL de base SOAP utilisée dans le code est `https://mail.lyceeconnecte.fr/service/soap`.
- **Requêtes SOAP** : chaque appel est un POST JSON avec un corps structuré (Header avec `context`, `authToken`, Body avec namespace `urn:zimbraMail`).

### 3.3 API SOAP utilisées

| Action métier                | Requête SOAP                             | Rôle                                                                                               |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Liste des messages           | `SearchRequest`                          | Récupération des messages (types: message, query selon dossier, tri dateDesc, limit 100)            |
| Détail d’un message         | `GetMsgRequest`                         | Contenu complet d’un message (corps HTML, pièces jointes, To/Cc/Cci)                              |
| Envoi                        | `SendMsgRequest`                         | Envoi d’un message (draft optionnel, inReplyTo pour réponse)                                       |
| Brouillon                    | `SaveDraftRequest`                       | Création ou mise à jour d’un brouillon                                                             |
| Transfert                    | (non implémenté : `mail.forward` = null) | —                                                                                                  |
| Marquer lu / non lu          | `MsgActionRequest`                       | Action `read` ou `!read` sur un id                                                                 |
| Corbeille                    | `ItemActionRequest`                      | Action `trash`                                                                                     |
| Suppression définitive       | `ItemActionRequest`                      | Action `delete`                                                                                    |
| Retirer du dossier           | `MoveRequest`                            | Déplacement vers la boîte de réception (l: '2')                                                    |
| Autocomplétion destinataires | `FullAutocompleteRequest`                | Champ `name` pour la recherche (includeGal: 1)                                                     |

### 3.4 Mapping des dossiers

Les dossiers par défaut sont traduits en requête via `folderIdSwitch` :

- `inbox` → `inId:"2"`
- `outbox` → `inId:"5"`
- `draft` → `inId:"6"`
- `trash` → `inId:"3"`

### 3.5 Adaptateurs

- **carbonioMessageToMailPreviewBackend** : transforme un message de la réponse `SearchRequest` (types: message) en `MailsMailPreviewBackend` (sujet, expéditeur, destinataires, date, non lu, pièce jointe, etc.).
- **carbonioMessageToMailContentBackend** : transforme un message (GetMsgResponse) en `MailsMailContentBackend` (corps, pièces jointes, To/Cc/Cci, etc.). Le corps et les pièces jointes sont extraits de la structure MIME (`mp`, `ct`, `content`, etc.). Pas d’historique de conversation : un message = un mail.

### 3.6 Comportements spécifiques Carbonio

- **Pas de dossiers personnalisés** : `folders.get` et `folder.count` sont à `null` → pas de liste de dossiers ni de compteurs par dossier dans l’UI.
- **Pas de gestion des dossiers** : `folder.create`, `folder.delete`, `folder.rename` sont à `null` → pas de création/renommage/suppression de dossiers.
- **Pas de déplacement vers un dossier personnalisé** : `mail.moveToFolder` est à `null` (seul `removeFromFolder` est implémenté pour ramener en boîte de réception).
- **Pas de restauration** : `mail.restore` est à `null`.
- **Pas de rappel** : `mail.recall` est à `null`.
- **Pas de transfert** : `mail.forward` est à `null` (non implémenté côté API Carbonio).
- **Pas de pièces jointes en brouillon** : `attachments.add` et `attachments.remove` sont à `null`, `allowMultimediaUpload: false` → pas d’ajout/suppression de pièces dans l’app.
- **Vue des pièces jointes en lecture** : `attachments.supportViewAttachments` est à `false` → en détail, les pièces sont affichées sous forme de liste avec un seul bouton « Ouvrir dans le web » (redirection vers la webview Carbonio) au lieu du téléchargement/partage in-app.
- **Images dans le corps** : les balises `<img>` dont le `src` est invalide (cid:, data:, ou domaine lyceeconnecte) sont remplacées par un lien « Ouvrir l’image dans le web » (adaptateur `replaceInvalidImagesWithWebViewLink`).
- **Pas de signature** : `signature.get` et `signature.update` sont à `null`.
- **Pas de bookmark** : `bookmarks.getById` est à `null`.
- **Redirection webview** : `mail.rederictToWebview` renvoie une URL de préauth avec callback vers la vue mail Carbonio (focus-mode) pour ouvrir le mail dans le navigateur.
- **Identifiants** : Carbonio fonctionne par message ; les IDs sont des IDs de message (positifs). La fonction `getItemId` enlève le « - » pour les requêtes qui l’exigent (delete, trash, etc.).

---

## 4. Tableau comparatif : Mails Classic vs Carbonio

| Fonctionnalité                               | Mails Classic                                                                 | Carbonio                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Liste des mails**                          | ✅ Pagination (page, page_size)                                               | ✅ Liste fixe (ex. 100), pas de pagination côté API                      |
| **Recherche dans la liste**                  | ✅ Paramètre `search`                                                         | ✅ Paramètre `query` dans SearchRequest                                  |
| **Dossiers personnalisés**                   | ✅ Liste (`folders.get`), compteurs (`folder.count`)                          | ❌ `folders.get` et `folder.count` = null                                |
| **Création de dossier**                      | ✅ `folder.create`                                                            | ❌ null                                                                  |
| **Renommer dossier**                         | ✅ `folder.rename`                                                            | ❌ null                                                                  |
| **Supprimer dossier**                        | ✅ `folder.delete`                                                            | ❌ null                                                                  |
| **Déplacer un mail vers un dossier**         | ✅ `mail.moveToFolder`                                                        | ❌ `mail.moveToFolder` = null                                            |
| **Retirer du dossier (vers Inbox)**          | ✅ `mail.removeFromFolder`                                                    | ✅ `mail.removeFromFolder` (MoveRequest vers l’Inbox)                    |
| **Mettre à la corbeille**                    | ✅ `mail.moveToTrash`                                                         | ✅ ItemActionRequest trash                                               |
| **Supprimer définitivement**                 | ✅ `mail.delete`                                                              | ✅ ItemActionRequest delete                                              |
| **Restaurer depuis la corbeille**            | ✅ `mail.restore`                                                             | ❌ `mail.restore` = null                                                 |
| **Marquer lu / non lu**                      | ✅ `mail.toggleUnread`                                                        | ✅ MsgActionRequest read / !read                                         |
| **Détail d’un mail**                         | ✅ `mail.get` (API message)                                                   | ✅ GetMsgRequest + adaptateur                                             |
| **Répondre / Répondre à tous**               | ✅ Navigation vers écran edit avec initialMailInfo                            | ✅ Même flux (données depuis GetMsg)                                     |
| **Transférer**                               | ✅ `mail.forward` (draft + forward)                                           | ❌ `mail.forward` = null (non implémenté)                                |
| **Rappel de message**                        | ✅ `mail.recall` (si droit)                                                   | ❌ `mail.recall` = null                                                  |
| **Envoi / brouillon**                        | ✅ `mail.send`, `sendToDraft`, `updateDraft`                                  | ✅ SendMsgRequest, SaveDraftRequest                                      |
| **Pièces jointes (brouillon)**               | ✅ `attachments.add`, `attachments.remove` (camera, galerie, documents)       | ❌ null (pas d’upload dans l’app)                                        |
| **Vue / téléchargement des pièces (détail)** | ✅ `supportViewAttachments: true` (téléchargement, ouverture, partage in-app) | ❌ `supportViewAttachments: false` (liste + lien « Ouvrir dans le web ») |
| **Upload d’images dans le corps**            | ✅ `allowMultimediaUpload: true`                                              | ❌ `allowMultimediaUpload: false`                                        |
| **Signature**                                | ✅ `signature.get`, `signature.update` + écran dédié                          | ❌ `signature.get` et `signature.update` = null                          |
| **Contacts / visibles**                      | ✅ `visibles.get` (liste + cache)                                             | ❌ `visibles.get` = null                                                 |
| **Recherche de destinataires**               | Filtre local sur la liste visibles                                            | ✅ `visibles.getOnSearch` (FullAutocompleteRequest)                      |
| **ShareBookmark**                            | ✅ `bookmark.getById`                                                         | ❌ `bookmarks.getById` = null                                            |
| **Contenu original**                         | ✅ Si `original_format_exists`                                                | ❌ Non géré (original_format_exists non renseigné)                       |
| **Redirection vers webview**                 | ❌ `mail.rederictToWebview` = null                                            | ✅ URL preauth + callback mail Carbonio                                  |
| **Option « Ne pas répondre »**               | ✅ Support + droit dédié                                                      | Non utilisé (noReply non géré côté Carbonio dans l’adaptateur)           |

---

## 5. Rôle de `isServiceMethodAvailable` (util.ts)

`isServiceMethodAvailable` est une fonction utilitaire (et un **type guard** TypeScript) qui vérifie qu’une méthode du service mails est disponible : elle n’est pas `null` et est bien une fonction (`typeof method === 'function'`).

Comme le backend (Classic ou Carbonio) n’expose pas les mêmes méthodes — Carbonio met à `null` de nombreuses méthodes (transfert, rappel, dossiers personnalisés, signature, pièces jointes en brouillon, etc.) — l’interface doit adapter les actions proposées à l’utilisateur. Cette fonction est utilisée partout dans le module (liste, détail, édition, signature, storage, champs destinataires) pour :

- **Afficher ou masquer** des boutons et entrées de menu (ex. Transférer, Rappeler, Déplacer, Restaurer, Marquer non lu, Retirer du dossier, Signature, Renommer/Supprimer dossier) ;
- **Activer ou désactiver** des flux (ex. création de dossier, ajout/suppression de pièces jointes, configuration de la signature, recherche de destinataires via `visibles.get` ou `visibles.getOnSearch`) ;
- **Éviter d’appeler** une méthode inexistante avant un appel API (guard avant `mailsService.mail.forward`, `mailsService.folder.create`, etc.).

Cela permet une seule base de code pour les deux backends, avec une UI qui reflète les capacités réelles du service connecté.

---
