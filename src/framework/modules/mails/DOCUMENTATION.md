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
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dossiers par défaut**          | Boîte de réception, Envoyés, Brouillons, Corbeille (identifiants : `inbox`, `outbox`, `draft`, `trash`)                                          |
| **Dossiers personnalisés**       | Affichage et navigation dans les dossiers utilisateur (uniquement si `folders.get` est disponible) — disponible sur les deux backends            |
| **Liste des messages**           | Aperçus (expéditeur, destinataires, sujet, date, pièce jointe, non lu, état brouillon/envoyé)                                                    |
| **Pagination**                   | Chargement de la première page puis « page suivante » en fin de liste (classic) ; Carbonio renvoie une liste fixe (ex. 100)                      |
| **Recherche**                    | Champ de recherche pour filtrer les messages (paramètre `search` passé à `mails.get`)                                                            |
| **Mode sélection**               | Sélection multiple de mails pour actions groupées                                                                                                |
| **Actions groupées (sélection)** | Marquer lu / non lu, déplacer vers un dossier, retirer du dossier, mettre à la corbeille, supprimer définitivement, restaurer (depuis corbeille) |
| **Ouverture d’un mail**          | Clic sur un aperçu → écran Détail ; si brouillon → écran Édition                                                                                 |
| **Menu contextuel (liste)**      | Sélectionner, Rechercher, Configurer la signature, Renommer le dossier, Supprimer le dossier (selon disponibilité des méthodes du service)       |
| **Compteurs par dossier**        | Nombre de non lus (ou nombre pour Brouillons) pour les dossiers par défaut (si `folder.count` disponible) — disponible sur les deux backends     |
| **Création de dossier**          | Depuis le bottom sheet « Déplacer » : créer un nouveau dossier puis y déplacer les mails (si `folder.create` et `mail.moveToFolder` disponibles) — disponible sur les deux backends |

### 2.2 Détail d’un mail

| Fonctionnalité                          | Description                                                                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Affichage**                           | Sujet, expéditeur, destinataires (To, Cc, Cci), date, corps HTML, pièces jointes, historique de conversation (réponses imbriquées)                                                                                 |
| **Répondre**                            | Ouvrir l’écran d’édition en mode Réponse (un seul destinataire : l’expéditeur ou le premier du groupe)                                                                                                             |
| **Répondre à tous**                     | Ouvrir l’écran d’édition avec To/Cc/Cci pré-remplis (si plusieurs destinataires)                                                                                                                                   |
| **Transférer**                          | Créer un brouillon de transfert puis ouvrir l’écran d’édition en mode Transfert (si `mail.forward` disponible) — disponible sur les deux backends                                                                 |
| **Rappel de message**                   | Retirer un message envoyé (si `mail.recall` disponible, droit dédié, délai < 60 min, expéditeur = utilisateur connecté) — classic uniquement                                                                      |
| **Marquer non lu**                      | Basculer le statut « lu » (si `mail.toggleUnread` disponible)                                                                                                                                                      |
| **Déplacer**                            | Déplacer le mail vers un dossier (liste + possibilité de créer un dossier) si `mail.moveToFolder` et `folder.create` disponibles — disponible sur les deux backends                                               |
| **Retirer du dossier**                  | Retirer le mail du dossier personnalisé courant (si `mail.removeFromFolder` disponible, hors dossiers par défaut)                                                                                                  |
| **Corbeille / Restaurer**               | Mettre à la corbeille ou restaurer depuis la corbeille (restauration : classic uniquement)                                                                                                                         |
| **Supprimer définitivement**            | Suppression définitive (depuis la corbeille)                                                                                                                                                                       |
| **Pièces jointes**                      | Affichage, téléchargement, ouverture et partage in-app via le composant Attachments — disponible sur les deux backends (`attachments.supportViewAttachments: true`)                                              |
| **Téléchargement / partage des pièces** | Chaque pièce peut être téléchargée, ouverte ou partagée via le composant Attachments (classic et Carbonio, via `attachments.getDistantFile`)                                                                       |
| **Contenu original**                    | Lien « Contenu original » si le backend indique `original_format_exists` (uniquement classic ; toujours `false` côté Carbonio)                                                                                     |
| **Historique**                          | Bloc « conversation-history » affiché séparément (bouton pour déplier)                                                                                                                                             |
| **Redirection webview (Carbonio)**      | Bandeau info « Ouvrir dans le web » affiché systématiquement en fin de message (si `mail.redirectToWebview` disponible), en plus de la consultation native des pièces jointes/images                              |
| **Images dans le corps (Carbonio)**     | Les images (`cid:`, URLs relatives `/service/home/...`, domaine Carbonio) sont réécrites en URLs REST Carbonio authentifiées (token en query) et affichées nativement, sans passer par une webview                |
| **Message rappelé**                     | Affichage spécifique pour un message rappelé (titre, texte, pas de réponse si non expéditeur)                                                                                                                      |

### 2.3 Édition / rédaction (nouveau, réponse, transfert, brouillon)

| Fonctionnalité                 | Description                                                                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Destinataires**              | Champs To, Cc, Cci avec sélection de contacts (visibles)                                                                                                                                                       |
| **Sujet**                      | Champ sujet                                                                                                                                                                                                    |
| **Corps**                      | Éditeur riche HTML (RichEditor)                                                                                                                                                                                |
| **Signature**                  | Insertion automatique de la signature si configurée (uniquement si `signature.get` disponible) — classic uniquement                                                                                           |
| **Pièces jointes**             | Ajout et suppression de pièces jointes sur un brouillon (si `attachments.add` et `attachments.remove` disponibles) — disponible sur les deux backends. Sources : appareil photo, galerie, documents (modal AttachmentsImport) |
| **Upload d’images inline**     | Insertion d’images dans le corps. Classic : flux générique `allowMultimediaUpload` (upload workspace, indépendant du brouillon). Carbonio : `attachments.uploadInlineImage`, activé seulement une fois le brouillon créé (nécessite un `draftId`) |
| **Enregistrer en brouillon**   | Sauvegarde automatique ou manuelle en brouillon (`sendToDraft`, `updateDraft`)                                                                                                                                 |
| **Envoyer**                    | Envoi du mail (`send` avec éventuel `draftId` et `inReplyTo`)                                                                                                                                                  |
| **Supprimer le brouillon**     | Mise à la corbeille du brouillon courant                                                                                                                                                                       |
| **Option « Ne pas répondre »** | Indication noReply (utilisée côté classic pour masquer Répondre/Répondre à tous si droit dédié) ; non géré côté Carbonio                                                                                       |
| **Historique dans le corps**   | En réponse/transfert, affichage de l’historique (addHtmlReply / addHtmlForward)                                                                                                                                |

### 2.4 Signature

| Fonctionnalité    | Description                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **Consultation**  | Récupération de la préférence (signature + useSignature) via `signature.get`                 |
| **Modification**  | Mise à jour via `signature.update` (signature, useSignature)                                 |
| **Disponibilité** | Uniquement en Mails Classic ; Carbonio expose `signature.get` et `signature.update` à `null` |

### 2.5 Contacts / Visibles (destinataires)

| Fonctionnalité                       | Description                                                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Liste préchargée (classic)**       | `visibles.get` renvoie la liste des contacts/visibles ; elle est mise en cache (storage) et utilisée pour le filtre local dans le champ destinataires |
| **Recherche à la frappe (Carbonio)** | `visibles.getOnSearch(query)` appelle l’API d’autocomplétion (`FullAutocompleteRequest`, `includeGal: 1`) ; pas de liste préchargée (`visibles.get` = null) |
| **ShareBookmark (classic)**          | Ouverture d’un carnet de partage par `bookmark.getById` pour afficher groupes/utilisateurs ; Carbonio n’expose pas `bookmarks.getById` (null)         |

---

## 3. Spécifications fonctionnelles Carbonio

### 3.1 Choix du backend

- **Condition** : l’utilisateur doit avoir le droit `org.entcore.auth.controllers.CarbonioPreauthController|preauth`.
- **Service utilisé** : `carbonioMailsApi` (défini dans `service/api/carbonio.ts`).

### 3.2 Authentification

- **Préauthentification** : un token Carbonio est obtenu via `GET /auth/carbonio/token`, stocké dans le store (`authActions.setCarbonioToken`), avec récupération des infos utilisateur Carbonio (`GetInfoRequest`, `authActions.setCarbonioUserInfos`).
- **Requêtes SOAP** : chaque appel est un POST JSON (`carbonioSoapRequest`) avec un corps structuré (Header avec `context`/`authToken`, Body avec namespace `urn:zimbraMail`), envoyé avec le cookie `ZM_AUTH_TOKEN`.
- **Renouvellement automatique du token** : si la réponse SOAP contient un fault `account.AUTH_EXPIRED` ou `account.AUTH_TOKEN_EXPIRED`, le token est régénéré et la requête est rejouée une fois (2 tentatives max).
- **Configuration plateforme** : l’URL de base Carbonio (`session.platform.carbonioUrl`) et le domaine e-mail (`session.platform.carbonioEmailDomain`) sont lus depuis la configuration de la plateforme (pas de constante hardcodée / pas de valeur par défaut).

### 3.3 API SOAP / REST utilisées

| Action métier                        | Requête                                   | Rôle                                                                                                    |
| -------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Liste des messages                   | `SearchRequest`                           | Récupération des messages (types: message, query selon dossier ou recherche, tri dateDesc, limit/offset) |
| Détail d’un message                  | `GetMsgRequest`                           | Contenu complet d’un message (arbre MIME, corps HTML, pièces jointes, images inline, To/Cc/Cci)          |
| Envoi                                 | `SendMsgRequest`                          | Envoi d’un message (direct, ou depuis un brouillon via `did`+`sfd:"1"`, `origid` pour réponse)           |
| Brouillon                             | `SaveDraftRequest`                        | Création ou mise à jour d’un brouillon (corps, destinataires, pièces jointes, images inline)             |
| Transfert                             | `SaveDraftRequest`                        | Brouillon vide avec `origid` + `rt:"w"`, pièces jointes et images inline copiées via `attach.mp`         |
| Marquer lu / non lu                   | `MsgActionRequest`                        | Action `read` ou `!read` sur un ou plusieurs ids                                                          |
| Déplacer vers un dossier              | `MsgActionRequest`                        | Action `move` avec `l:<folderId>`                                                                        |
| Corbeille                             | `ItemActionRequest`                       | Action `trash`                                                                                            |
| Suppression définitive                | `ItemActionRequest`                       | Action `delete`                                                                                           |
| Retirer du dossier                    | `ItemActionRequest`                       | Action `move` vers la boîte de réception (`l:'2'`)                                                        |
| Autocomplétion destinataires          | `FullAutocompleteRequest`                 | Champ `name` pour la recherche (includeGal: 1)                                                            |
| Dossiers personnalisés (liste)        | `GetFolderRequest`                        | Arbre des dossiers utilisateur (profondeur configurable), avec compteurs (`n`, `u`)                       |
| Compteur d’un dossier par défaut      | `GetFolderRequest`                        | Compteur d’un dossier système précis (n / u)                                                              |
| Création de dossier                   | `CreateFolderRequest`                     | Création d’un dossier (`l` = parent, `view: 'message'`)                                                   |
| Renommer / Supprimer dossier          | `FolderActionRequest`                     | Action `rename` ou `delete`                                                                               |
| Upload de fichier (pièce jointe/image) | `POST /service/upload?fmt=raw`            | Upload binaire (cookie auth) renvoyant un `aid` (attachment id temporaire) réutilisé dans `SaveDraftRequest` |
| Téléchargement pièce / image inline    | `GET /service/home/~/?id=...&part=...`    | URL REST authentifiée (`auth=qp&zauthtoken=...`) ; `disp=a` pour téléchargement, `disp=i` pour affichage inline |

### 3.4 Mapping des dossiers

Les dossiers par défaut sont traduits en requête via `folderIdSwitch` (utilisé pour la recherche/liste des messages) :

- `inbox` → `inId:"2"`
- `outbox` → `inId:"5"`
- `draft` → `inId:"6"`
- `trash` → `inId:"3"`

Les mêmes identifiants numériques (`2`, `3`, `5`, `6`) sont utilisés directement pour les compteurs (`folder.count`). Les dossiers personnalisés utilisent leur véritable id Carbonio (renvoyé par `GetFolderRequest`) ; les ids système (`1` à `17`) sont filtrés de la liste des dossiers personnalisés affichée dans l’UI.

### 3.5 Adaptateurs et helpers

- **`carbonioMessageToMailPreviewBackend`** : transforme un message de la réponse `SearchRequest` en `MailsMailPreviewBackend` (sujet, expéditeur, destinataires, date, non lu, pièce jointe, etc.).
- **`carbonioMessageToMailContentBackend`** : transforme un message (`GetMsgResponse`) en `MailsMailContentBackend` (corps, pièces jointes, To/Cc/Cci, etc.). Le corps et les pièces jointes sont extraits récursivement de l’arbre MIME (`mp`, `ct`, `content`, `cd`, `ci`). Pas d’historique de conversation : un message = un mail.
- **Extraction MIME** : `collectAttachmentParts` (pièces jointes réelles, hors parties body/inline) et `collectInlineParts` (parties avec `ci`, images embarquées) parcourent récursivement l’arbre `mp`.
- **Images du corps** : `replaceImagesWithAuthenticatedUrls` reconstruit une carte cid→numéro de partie (`buildCidToPartMap`) puis réécrit chaque `<img src="...">` en URL REST Carbonio authentifiée (`buildCarbonioAttachmentUrl`), en gérant `cid:`, les URLs relatives `/service/home/...` et les URLs absolues du domaine Carbonio ; les `data:` sont laissées telles quelles.
- **`normalizeFromMobileToWeb`** : insère `<hr id="zwchr">` avant le bloc d’historique de conversation pour que Carbonio threade correctement le message.
- **`replaceInlineUrlsWithCids`** : à l’envoi/sauvegarde, réécrit les URLs de prévisualisation (par numéro de partie ou par `cid=`) en références `cid:` standard avant transmission au serveur.
- **`carbonio-helpers.ts`** : URLs de base (`getCarbonioBaseUrl`, `getCarbonioSoapBaseUrl`, `getCarbonioEmailDomain`, lues depuis `session.platform`), `getCarbonioTokenFromStore`, `uploadFileToCarbonio` (upload binaire via cookie auth, RNFS direct — pas via `fileTransferService`), `buildCarbonioAttachmentUrl`, `normalizeCid`, `patchInlinePartUrls`.

### 3.6 Comportements spécifiques Carbonio

- **Pièces jointes en brouillon** : ajout (`attachments.add`) et suppression (`attachments.remove`) supportés. Chaque opération relit l’état courant du brouillon (`GetMsgRequest`) puis **reconstruit explicitement l’arbre MIME** (`multipart/related` avec corps + images inline, puis `attach.mp` pour les pièces jointes) avant `SaveDraftRequest` — sans cela, Carbonio englobe le `multipart/related` existant dans un nouveau `multipart/mixed` et renumérote toutes les parties, cassant les références `cid:` des images déjà insérées dans le corps.
- **Images inline dans le corps** : `attachments.uploadInlineImage` upload le fichier (`aid`), génère un `cid` côté client, puis reconstruit l’arbre MIME du brouillon en ajoutant la nouvelle partie inline. Retourne l’URL REST de prévisualisation (`disp=i`). Une table de correspondance ancien→nouveau numéro de partie (`inlinePartMapping` / `patchInlinePartUrls`) permet à l’éditeur de mettre à jour les URLs absolues affichées après une restructuration MIME (ex. lors de l’ajout d’une pièce jointe après coup).
- **Vue des pièces jointes en lecture** : `attachments.supportViewAttachments: true` → les pièces sont affichées, téléchargées, ouvertes et partagées in-app comme en classic, via `attachments.getDistantFile` (URL REST authentifiée `disp=a`).
- **Transfert** : `mail.forward` crée un brouillon vide (`id: '-1'`, `origid`, `rt:"w"`) en copiant les pièces jointes et les images inline du message d’origine (par référence `attach.mp` avec `mid`/`part`), sans dupliquer le contenu binaire.
- **Envoi depuis un brouillon** : avant `SendMsgRequest`, le brouillon est d’abord réécrit avec son état final (corps en `cid:`, structure MIME, destinataires, sujet) via `SaveDraftRequest`, puis envoyé avec `did:<id>` et **`sfd:"1"`** (send-from-draft) — sans ce paramètre, Carbonio ignore le contenu du brouillon et lève une erreur « No recipient addresses ».
- **Dossiers personnalisés** : listés (`folders.get`/`GetFolderRequest`), avec compteurs (`folder.count`), création (`folder.create`/`CreateFolderRequest`), renommage et suppression (`folder.rename`/`folder.delete` via `FolderActionRequest`). Déplacement d’un mail vers un dossier personnalisé supporté (`mail.moveToFolder`/`MsgActionRequest` `op:"move"`).
- **Pas de restauration** : `mail.restore` est à `null` (pas de corbeille → dossier d’origine).
- **Pas de rappel** : `mail.recall` est à `null`.
- **Pas de signature** : `signature.get` et `signature.update` sont à `null`.
- **Pas de bookmark** : `bookmarks.getById` est à `null`.
- **Pas de liste préchargée de contacts** : `visibles.get` est à `null` ; la recherche de destinataires passe uniquement par `visibles.getOnSearch` (autocomplétion à la frappe).
- **Redirection webview** : `mail.redirectToWebview` renvoie une URL de préauth avec callback vers la vue mail Carbonio (focus-mode). Affichée systématiquement en bandeau info sous le message (complément à la consultation native, pas un simple fallback).
- **Contenu original** : non géré (`original_format_exists` toujours `false`).
- **Option « Ne pas répondre »** : `noReply` non géré côté adaptateur/API Carbonio.
- **Identifiants** : Carbonio fonctionne par message ; les IDs sont des IDs de message (positifs). La fonction `getItemId` enlève le « - » pour les requêtes qui l’exigent (delete, trash, move, toggleUnread, etc.).

---

## 4. Tableau comparatif : Mails Classic vs Carbonio

| Fonctionnalité                               | Mails Classic                                                                 | Carbonio                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Liste des mails**                          | ✅ Pagination (page, page_size)                                               | ✅ Liste fixe (ex. 100) avec offset, pas de pagination incrémentale             |
| **Recherche dans la liste**                  | ✅ Paramètre `search`                                                         | ✅ Paramètre `query` dans SearchRequest                                        |
| **Dossiers personnalisés**                   | ✅ Liste (`folders.get`), compteurs (`folder.count`)                          | ✅ Liste (`GetFolderRequest`), compteurs (`GetFolderRequest`)                   |
| **Création de dossier**                      | ✅ `folder.create`                                                            | ✅ `folder.create` (`CreateFolderRequest`)                                      |
| **Renommer dossier**                         | ✅ `folder.rename`                                                            | ✅ `folder.rename` (`FolderActionRequest`)                                      |
| **Supprimer dossier**                        | ✅ `folder.delete`                                                            | ✅ `folder.delete` (`FolderActionRequest`)                                      |
| **Déplacer un mail vers un dossier**         | ✅ `mail.moveToFolder`                                                        | ✅ `mail.moveToFolder` (`MsgActionRequest` move)                                |
| **Retirer du dossier (vers Inbox)**          | ✅ `mail.removeFromFolder`                                                    | ✅ `mail.removeFromFolder` (`ItemActionRequest` move vers l’Inbox)              |
| **Mettre à la corbeille**                    | ✅ `mail.moveToTrash`                                                         | ✅ `ItemActionRequest` trash                                                    |
| **Supprimer définitivement**                 | ✅ `mail.delete`                                                              | ✅ `ItemActionRequest` delete                                                   |
| **Restaurer depuis la corbeille**            | ✅ `mail.restore`                                                             | ❌ `mail.restore` = null                                                        |
| **Marquer lu / non lu**                      | ✅ `mail.toggleUnread`                                                        | ✅ `MsgActionRequest` read / !read                                              |
| **Détail d’un mail**                         | ✅ `mail.get` (API message)                                                   | ✅ `GetMsgRequest` + adaptateur (parcours MIME récursif)                        |
| **Répondre / Répondre à tous**               | ✅ Navigation vers écran edit avec initialMailInfo                            | ✅ Même flux (données depuis GetMsg)                                            |
| **Transférer**                               | ✅ `mail.forward` (draft + forward)                                           | ✅ `mail.forward` — `SaveDraftRequest` avec `origid` + `rt:"w"`, PJ + inline copiées |
| **Rappel de message**                        | ✅ `mail.recall` (si droit)                                                   | ❌ `mail.recall` = null                                                         |
| **Envoi / brouillon**                        | ✅ `mail.send`, `sendToDraft`, `updateDraft`                                  | ✅ `SendMsgRequest` (avec `sfd:"1"` si depuis brouillon), `SaveDraftRequest`     |
| **Pièces jointes (brouillon)**               | ✅ `attachments.add`, `attachments.remove` (camera, galerie, documents)       | ✅ `attachments.add`, `attachments.remove` (upload `service/upload` + reconstruction MIME) |
| **Upload d’images inline dans le corps**     | ✅ `allowMultimediaUpload: true` (flux workspace générique)                   | ✅ `attachments.uploadInlineImage` (activé une fois le brouillon créé)          |
| **Vue / téléchargement des pièces (détail)** | ✅ `supportViewAttachments: true` (téléchargement, ouverture, partage in-app) | ✅ `supportViewAttachments: true` (idem, via URL REST authentifiée)             |
| **Images affichées nativement dans le corps**| ✅ (HTML servi directement)                                                   | ✅ Réécriture en URLs REST Carbonio authentifiées (`replaceImagesWithAuthenticatedUrls`) |
| **Signature**                                | ✅ `signature.get`, `signature.update` + écran dédié                          | ❌ `signature.get` et `signature.update` = null                                |
| **Contacts / visibles**                      | ✅ `visibles.get` (liste + cache)                                             | ❌ `visibles.get` = null                                                        |
| **Recherche de destinataires**               | Filtre local sur la liste visibles (`visibles.getOnSearch` = null)            | ✅ `visibles.getOnSearch` (`FullAutocompleteRequest`)                           |
| **ShareBookmark**                            | ✅ `bookmark.getById`                                                         | ❌ `bookmarks.getById` = null                                                   |
| **Contenu original**                         | ✅ Si `original_format_exists`                                                | ❌ Non géré (`original_format_exists` toujours `false`)                        |
| **Redirection vers webview**                 | ❌ `mail.redirectToWebview` = null                                            | ✅ URL preauth + callback mail Carbonio, affichée en bandeau systématique       |
| **Option « Ne pas répondre »**               | ✅ Support + droit dédié                                                      | Non géré côté Carbonio dans l’adaptateur                                       |

---

## 5. Rôle de `isServiceMethodAvailable` (util.ts)

`isServiceMethodAvailable` est une fonction utilitaire (et un **type guard** TypeScript) qui vérifie qu’une méthode du service mails est disponible : elle n’est pas `null` et est bien une fonction (`typeof method === 'function'`).

Comme le backend (Classic ou Carbonio) n’expose pas exactement les mêmes méthodes — Carbonio met à `null` certaines méthodes (rappel, restauration, signature, bookmark, liste préchargée des contacts), tandis que Classic met à `null` d’autres méthodes (`redirectToWebview`, `uploadInlineImage`, `visibles.getOnSearch`) — l’interface doit adapter les actions proposées à l’utilisateur. Cette fonction est utilisée partout dans le module (liste, détail, édition, signature, storage, champs destinataires) pour :

- **Afficher ou masquer** des boutons et entrées de menu (ex. Rappeler, Restaurer, Signature, redirection webview) ;
- **Activer ou désactiver** des flux (ex. upload d’image inline avant création du brouillon côté Carbonio, recherche de destinataires via `visibles.get` ou `visibles.getOnSearch`) ;
- **Éviter d’appeler** une méthode inexistante avant un appel API (guard avant `mailsService.mail.recall`, `mailsService.signature.update`, etc.).

Cela permet une seule base de code pour les deux backends, avec une UI qui reflète les capacités réelles du service connecté.

---
