# Bascule : `support`

> Statut : **basculé, ouverture jouée dans l'app (Android) ; assaini (§9), appliqué dans l'arbre de travail le 2026-11-19, non commité, pas testé dans l'app** — mis à jour le 2026-11-19
>
> Premier module passé par la bascule seule (étape 1 d'[INTENT.md](../INTENT.md)), pour éprouver le patron [BASCULE.md](../BASCULE.md). Bascule faite le 2026-11-18 par un agent sans développeur ; revue et alignée sur les règles le 2026-11-19 avec le développeur (route renommée, `useConfirmRemove`, `withSession`, `ToDo` sur les imports de `workspace`). Candidat modèle de bascule ([modules-de-reference.md](../modules-de-reference.md)), en attente de relecture.

## 1. Ce que fait le module

Un écran : créer un ticket d'assistance (catégorie, établissement, sujet, description, pièces jointes). On y entre par « Mes applis », app ENT « Aide et support ». La création demande le droit `TicketController|createTicket`.

## 2. Taille et dépendances

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| 9 | 497 | 1 | 0 | 1 | non |

- **Module ancien importé : `workspace`, code seul.** `actions/index.ts` appelle `workspaceFileTransferActions.uploadFilesAction` pour envoyer les pièces jointes ; `reducer.ts` lit `workspace/module-config` pour le préfixe d'un type d'action. `uploadFilesAction` (`src/framework/modules/workspace/actions/fileTransfer.ts`) appelle seulement le service de `workspace`, sans son reducer ni son registre, et le scope `workspace` est demandé par `media` (`src/modules/media/index.ts`) : l'envoi doit marcher alors que `workspace` n'est pas chargé. Permis par la règle des imports de code (geste 16), avec un `ToDo(support-migration)` sur chaque import. **Pas encore joué dans l'app.**
- **Importeurs** : aucun import depuis un autre module. Seule mention : le littéral `'support'` (nom de module) dans un type de `src/app/intents.ts`, non touché.
- **Marques** : l'ancien système ne chargeait `support` que pour `dev/default`, `ent77`, `openent` et `poc` (pas `neo`, `one`, `lyceeconnecte`, `leducdenormandie`). Il est maintenant chargé pour toutes les marques, en attendant la liste des modules par marque ([later.md](later.md)).

## 3. Comportements à conserver

Le comportement n° 1 a son flow : carte `myapps-aide-et-support` (libellé affiché « Assistance ENT »), `header-title` avec le texte « Assistance ENT » (fragile : langue), retour par `BackButton|header-back` (les deux générations). Le 2026-11-19, sur Android (Pixel 6a, build Debug de la nouvelle génération, compte de recette) : vert deux fois de suite, rouge quand `support` est retiré de `src/app/config/modules.ts` (l'appli part alors dans le navigateur). Pas joué sur l'ancienne génération : pas de build de référence sur l'appareil. Attention : sur une marque qui ne chargeait pas `support` (`neo`…), « part dans le navigateur » est l'ancien comportement.

`testID` ajoutés le 2026-11-19, après la bascule (commit `4307c0738`) : `support-createticket-form`, `-category`, `-structure`, `-subject`, `-description`, `-addfiles`, `-send`, `-empty`, `-toast-success`. Le build de l'ancienne génération ne les a pas : les flows 2 à 6 ne pourront y être joués qu'avec une recette manuelle.

| # | Comportement | Flow ou recette | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | « Aide et support » s'ouvre dans l'app depuis « Mes applis », avec son titre et un bouton retour | [`support-01-ouverture.yaml`](../../../../.maestro/flows/support-01-ouverture.yaml) | non joué | ✅ Android |
| 2 | La liste des catégories est remplie ; le second sélecteur n'apparaît que sur un compte multi-établissements | à écrire | — | — |
| 3 | Sujet saisi puis retour : alerte de confirmation ; « continuer » reste, « quitter » sort | à écrire | — | — |
| 4 | Ajout d'une pièce jointe par chaque source, puis retrait | à écrire | — | — |
| 5 | Envoi avec sujet et description (avec et sans pièce jointe) : retour à l'écran précédent, toast de succès avec le numéro du ticket | à écrire | — | — |
| 6 | Compte sans droit de création : écran vide ; compte sans l'app : entrée absente de « Mes applis » | à écrire | — | — |

## 4. Dans la bascule

- `module-config.ts` et `navigation/` supprimés ; `index.ts` exporte un `EntModule` (`scope`, `matchEntcoreApp`, `entTrackingName`, `fileManager`, `redux: { reducer }`).
- Un écran en `defineScreen` ; `navBarOptions` remplacé par `options: () => ({ title })`.
- **Route** : `support` (ancienne route d'accueil, nom du module) devient `support/create-ticket` (décidé le 2026-11-19). Télémétrie : la vue `support` devient `support` / `create-ticket` (`trackView` découpe la route sur `/`).
- Point d'entrée : `entries.myApps: { route: 'support/create-ticket' }`, sans lequel le module n'est pas ouvrable.
- `usePreventBack` remplacé par `useConfirmRemove` (même alerte, même condition).
- `withSession` autour de l'écran connecté : `mapStateToProps` reçoit la session en second argument au lieu d'appeler `getSession()`.
- Session et types pris dans `~/modules/auth` (`getSession`, `assertSession`, `AuthActiveAccount`) au lieu des façades.
- `ToDo(support-migration)` sur les deux imports de `workspace`.
- Une ligne dans `src/app/config/modules.ts`.
- Le module reste **sur place**, dans `src/framework/modules/support`.

Diff de la bascule : 11 fichiers, +47 / −79 ; alignement du 2026-11-19 : 4 fichiers. `styles.ts`, `service/` et la logique de `reducer.ts` ne sont pas modifiés.

## 5. Hors de la bascule

Backlog de `/sanitize-module` (§9). Vu et non touché :

Rien : tous les sujets de §9 sont faits ou abandonnés (2026-11-19).

Noté, non traité (décisions du 2026-11-19, §6) :

- `BottomMenu` (composant du framework, `CustomBottomSheetModal` de gorhom) : sa conversion en `formSheet` est un chantier du framework (5 utilisateurs), pas du module. `BottomMenu` modifie aussi le tableau `actions` qu'il reçoit (`actions.push` du bouton « Annuler » à chaque ouverture) : un tableau mémoïsé gagnerait un « Annuler » par ouverture ;
- `rights.ts` vers `hasRight` : `hasRight` ne masquerait pas le module, l'app « Aide et support » s'ouvrirait dans le navigateur depuis « Mes applis » (`useOpenApp`) au lieu de l'écran vide ;
- `PageView` / `KeyboardPageView` : remplacés le 2026-11-19 (voir §6) ; `pageGutterSize` remplacé par `UI_SIZES.spacing.medium`.
- `DropDownPicker` (`react-native-dropdown-picker`) tenu par des `zIndex` négatifs et un décalage sur Android ;
- valeurs en dur sans équivalent exact dans `constants.ts`, gardées pour ne rien changer à l'écran (`styles` : équivalents exacts seulement) : `borderRadius: 5` (×3, `UI_SIZES.radius.small` vaut `getScaleWidth(4)`), `height: 100` (champ de description), `top: -16` (décalage Android de la liste des catégories, alors que la marge qu'il compense est `UI_SIZES.spacing.medium`, mise à l'échelle), icône `Svg` 18 × 18 (`icon.xsmall` = 16, `icon.small` = 20). `theme.ui` non touché ;
- une pièce jointe choisie deux fois est retirée deux fois (`removeAttachment` filtre par `filepath`) ;
- après un échec de la création du ticket, réessayer renvoie les pièces jointes dans l'espace documentaire.

## 6. Décisions

| Sujet | Choix | Raison | Date |
| --- | --- | --- | --- |
| Nom de route | `support/create-ticket` | règle `<module>/<dossier de l'écran>` ; suffixe choisi par le développeur | 2026-11-19 |
| Imports de `workspace` | gardés, avec `ToDo` | code seul, l'envoi ne demande pas que `workspace` soit chargé | 2026-11-19 |
| Chargé pour toutes les marques | oui | pas de liste des modules par marque dans le nouveau système pour l'instant | 2026-11-19 |
| `usePreventBack` | `useConfirmRemove` | geste de bascule | 2026-11-19 |
| Session de l'écran | `withSession`, session passée à `mapStateToProps` | geste de bascule : tout écran qui lit la session | 2026-11-19 |
| Dossier de l'écran | `screen.tsx` (avec `defineScreen`) + `index.ts` qui réexporte ; `types.ts` supprimé, son seul type (`StaticScreenProps<undefined>`) est écrit dans l'écran | CONVENTIONS « Structure d'un module » : un type d'un seul fichier reste dans ce fichier | 2026-11-19 |
| Gestionnaire d'état | Redux gardé | pas de passage à zustand | 2026-11-19 |
| `connect(` | gardé | assainissement | 2026-11-18 |
| `connect`, `try-action`, Redux mort | une seule PR (`connect`) ; `try-action` et la partie Redux de `dette` absorbés | les deux `tryActionLegacy` et le reducer `ticket` ne servaient que `mapDispatchToProps` | 2026-11-19 |
| Gestionnaire d'état (assainissement) | plus de Redux : reducer `ticket` supprimé, l'écran appelle les actions directement | le state `support` n'était lu par personne | 2026-11-19 |
| `SyncedFileWithId` | celui de `~/framework/util/fileHandler` dans tout le module | décidé seul pendant `connect` : sans le cast de `mapDispatchToProps`, l'autre classe donnait une erreur nouvelle ; c'est celle de `workspace` et du service | 2026-11-19 |
| `droits` | abandonné : l'écran vide reste ; la règle de droit passe dans `model/business.ts`, `rights.ts` supprimé | `hasRight` ouvrirait l'app web dans le navigateur au lieu de l'écran vide | 2026-11-19 |
| `structure` | deux PR : service (avec `transport`), puis `model/` + `actions.ts` | une PR par couche | 2026-11-19 |
| Flows Maestro 2 à 6 | pas écrits ; recette par PR dans §9 | personne ne peut les jouer pour l'instant | 2026-11-19 |
| Transport | `getModuleTransport('support').accountFetch(session, …)` | modèle `myapps` ; le service reçoit la session | 2026-11-19 |
| `actions` de `BottomMenu` | jamais mémoïsées, commentaire dans le code ; `BottomMenu` non modifié | `BottomMenu` ajoute « Annuler » au tableau reçu | 2026-11-19 |
| `LocalFile` (TS2345) | patch du framework à part avant `erreurs` : `nativeInfo` élargi dans `src/framework/util/fileHandler/index.ts` | aucun autre lecteur de `nativeInfo` | 2026-11-19 |
| Styles | équivalents exacts seulement, `theme.ui` non touché ; le reste en §5 | rien ne doit changer à l'écran | 2026-11-19 |
| Alerte de sortie | texte `support-createticket-leavealert-text` | la clé existe dans les six langues ; changement visible validé | 2026-11-19 |
| Libellé d'une catégorie | traduction de `support`, puis libellé traduit par le serveur (hooks de `myapps`), puis `displayName` ; règle pure de `model/` | CONVENTIONS « App ENT ou module » ; changement visible validé | 2026-11-19 |
| `ui` | abandonné pour `support` | conversion de `BottomMenu` : chantier du framework | 2026-11-19 |
| `PageView` / `KeyboardPageView` | remplacés : fragment sur Android, `KeyboardAvoidingView` (`~/framework/components/keyboard`) sur iOS | demande du développeur ; le layout de la nouvelle navigation donne déjà fond, taille et `ErrorBoundary` | 2026-11-19 |
| `DropDownPicker` | noté en §5, non traité | hors des sujets de l'assainissement | 2026-11-19 |
| `storageName: 'support'` | disparaît avec `module-config.ts` | n'était lu par aucun code | 2026-11-18 |
| Nom du module dans l'écran | littéral `'support'` à la place de `moduleConfig.name` | `module-config.ts` n'existe plus | 2026-11-18 |
| `entTrackingName` | équivalent de `entcoreTrackingName` | le tracker les lit de la même façon (`src/framework/util/tracker/index.ts`, `_init`) | 2026-11-19 |

### Questions ouvertes

Aucune.

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module | 5 erreurs | les 5 mêmes (2026-11-19, après l'alignement) |
| `tsc`, total du dépôt, par fichier et par code (2026-11-19) | 778 | 778, identiques par fichier et par code |
| ESLint sur le dossier | 6 erreurs, 3 avertissements | 2 erreurs, 3 avertissements, aucune nouvelle (`state` n'est plus signalé : un argument utilisé le suit) |
| Jest | 431 | 431 (2026-11-18) ; aucun test ne couvre ce module ; non relancé après l'alignement |
| Compteurs de [SUIVI.md](SUIVI.md) | — | navigation ancienne 0, statut `basculé, testable` |
| Flows Maestro | aucun | `support-01` vert sur Android (2026-11-19, avant l'alignement) ; ancienne génération non jouée |
| Parcours joué dans l'app | — | ouverture et retour seulement, par Maestro, sur Android ; formulaire, envoi, route renommée et `withSession` **non** |

Mesures du 2026-11-18 prises quand le module avait été déplacé dans `src/modules/support`, puis remis sur place le 2026-11-19. Le 2026-11-19, la comparaison ligne à ligne de `tsc` a montré que le message d'une erreur cite l'union de toutes les routes : renommer une route change le texte d'erreurs d'autres modules. D'où la comparaison par fichier et par code ([BASCULE.md](../BASCULE.md)).

Recette à jouer dans l'app tant que les flows n'existent pas : les six comportements du §3, plus l'envoi hors réseau (toast d'erreur, bouton de nouveau actif, saisie conservée) et le changement de compte (aucun état ne persiste). Rejouer `support-01` après le renommage de la route.

## 8. Mesure

- Écriture de la bascule : environ 4 minutes. Lecture et plan : environ 10 minutes. Mesures `tsc`, ESLint, Jest avant et après : environ 6 minutes.
- **Douze décisions rencontrées pour 500 lignes**, toutes prises seul en « tel quel » le 2026-11-18 ; revues avec le développeur le 2026-11-19.
- Ce module est le cas le plus simple : un écran, ni notification, ni modale, ni consommateur. **Ne pas en déduire une durée par module.**
- Ce que les skills en ont appris (2026-11-19) : comparer `tsc` par fichier et par code ; distinguer import de code et navigation vers un module ancien ; ajouter les `testID` avant la bascule ne suffit pas si le build de référence ne les a pas ; vérifier ce que le nouveau registre change par marque ; ce qui ne marche pas dans la nouvelle navigation (en-têtes, `setOptions`, `usePreventBack`, routes) appartient à la bascule.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR. Sujets tirés de §5. Pas de commit dans cette série : chaque PR est un patch (`sanitize-patches/NN-<sujet>.patch`), à relire.

| Sujet | Statut | Décisions | PR / commit |
| --- | --- | --- | --- |
| `connect` | fait | une seule PR avec `try-action` et le Redux mort ; `SyncedFileWithId` de `~/framework/util/fileHandler` (§6) | `01-connect` |
| `try-action` | fait (absorbé par `connect`) | `tryActionLegacy(…, undefined, true)` : ni `track`, ni erreur avalée ; aucun changement | `01-connect` |
| `dette` : Redux mort (reducer `ticket`, `WORKSPACE_POST_TICKET`) | fait (absorbé par `connect`) | l'import de `workspace/module-config` part avec lui | `01-connect` |
| `structure` : service (avec `transport`) | fait | `getModuleTransport('support').accountFetch(session, …)` ; `service/types.ts` (`namespace API`), `service/adapter.ts` ; types `TicketDraft` et `TicketAttachment` dans `model/index.ts` (décidé seul : le service parle le modèle) ; corps de la requête identique, octet pour octet (test) | `02-structure-service` |
| `structure` : `model/` + `actions.ts` | fait | règles pures dans `model/business.ts` (droit de création, catégories, établissements, validation), `rights.ts` supprimé ; `actions.ts` : `sendSupportTicket` (fichiers, puis ticket), fonction async simple, le module n'ayant plus de store (décidé seul) ; tests colocalisés | `03-structure-model` |
| `performance` | fait | `useCallback` (fichiers choisis, retrait, envoi), constantes hors du composant (`FILE_ACTIONS`, `MANDATORY_TEXT`, `PageComponent`), `renderPage` intégré au rendu, `onChangeText` direct ; `actions` de `BottomMenu` reconstruites à chaque rendu, avec commentaire ; `removeAttachment` en mise à jour fonctionnelle (même résultat) ; rendus non mesurés | `04-performance` |
| `styles` | fait | les 3 styles en ligne dans `styles.ts` (`categoryDropdownListAndroid`, `structureDropdown`, `fields`), condition Android gardée dans l'écran (un `Platform.select` dans `styles.ts` aurait mis `position: undefined` sur iOS, par-dessus le style de la bibliothèque) ; `borderWidth: 1` → `UI_SIZES.border.thin` (×4) ; le reste en §5 | `05-styles` |
| `dette` : alerte de sortie, `admin.title` | fait | texte `support-createticket-leavealert-text` ; libellé d'une catégorie : traduction de `support`, puis libellé de « Mes applis » (`useEntApps` de `myapps`, `EntApp.label` = `appName` du serveur, sinon le nom de l'app), puis `displayName` ; règle `getCategoryLabel` testée | `06-dette` |
| Framework : `nativeInfo` de `LocalFile` | fait | `nativeInfo` du `LocalFile` de `src/framework/util/fileHandler/index.ts` élargi à `CustomUploadFileItem` (ce que son constructeur accepte), cast du constructeur retiré. Seul lecteur : `LocalFile.imageCallback` du même fichier (étalé puis casté en `ImagePicked[]`, inchangé). Corrige aussi 3 TS2345 hors du module (`rich-text/file-import/screen.tsx`, `user/screens/profile/screen.tsx`, `presences/screens/declare-absence/screen.tsx`) | `07-framework-localfile` |
| `erreurs` | fait (absorbé) | rien à écrire : les 3 TS1205 et les 2 `getState` sont partis avec `connect`, la TS2345 de `SyncedFileWithId` aussi (§6), celle de `LocalFile` avec le patch du framework. Module : 0 erreur `tsc`, 0 problème ESLint | `08-erreurs` (suivi seul) |
| `droits` | abandonné | l'écran vide reste | |
| `ui` | abandonné | chantier du framework | |

Vérifié le 2026-11-19, après `08-erreurs`, comparé à la mesure d'avant `01-connect` : `tsc` du dépôt 778 → 770, aucune erreur nouvelle par fichier et par code (−5 dans le module, −3 ailleurs avec le patch du framework) ; ESLint sur le dossier : 2 erreurs et 3 avertissements → 0 ; Jest 431 → 447 (16 tests du module : `service/adapter.test.ts`, `model/business.test.ts`, `actions.test.ts`) ; `yarn migration-status --check` vert à chaque patch ; `connect(` du module 1 → 0 ; les 9 `testID` inchangés. **Pas testé dans l'app.**

Sans objet pour `support` : `classes` (aucune classe), `temporal` (pas de `moment`), `api-publique` (aucun importeur).

### Recette par PR

**Pas testé dans l'app.** Pas de nouveaux flows Maestro (décidé le 2026-11-19) : `support-01` (`maestro test -e APP_ID=$APP_ID -e PLATFORM_NAME=$PLATFORM_NAME -e LOGIN=$LOGIN -e PASSWORD=$PASSWORD .maestro/flows/support-01-ouverture.yaml`), puis la recette à la main. Numéros = comportements du §3.

- `01-connect` : `support-01` ; n° 2 (catégories, second sélecteur sur un compte multi-établissements) ; n° 3 (alerte de sortie) ; n° 4 (une pièce jointe par source, puis retrait) ; n° 5 (envoi avec et sans pièce jointe : retour, toast avec le numéro) ; envoi hors réseau (toast d'erreur, bouton de nouveau actif, saisie conservée) ; n° 6 (compte sans droit : écran vide).
- `02-structure-service` : n° 5, avec et sans pièce jointe (requête signée par `accountFetch` au lieu de `sessionFetch`) ; le ticket créé a sa catégorie, son établissement, son sujet, sa description et ses pièces jointes côté web.
- `03-structure-model` : n° 2 (liste et ordre des catégories identiques à avant, « Autre » compris ; second sélecteur), bouton d'envoi inactif sans sujet, sans description ou avec un sujet de plus de 255 caractères ; n° 5 avec et sans pièce jointe ; n° 6.
- `04-performance` : n° 3 (alerte de sortie, avec sujet puis avec description seule) ; n° 4 : ouvrir le menu « Ajouter des fichiers » deux fois de suite (un seul « Annuler »), une pièce jointe par source, deux pièces jointes puis retrait de l'une ; n° 5 ; changement de catégorie et d'établissement.
- `05-styles` : comparer à l'œil avec une capture d'avant, sur Android et sur iOS : bordures, liste des catégories ouverte (Android : sous le sélecteur, elle pousse les champs), liste des établissements ouverte sur un compte multi-établissements (au-dessus des champs).
- `06-dette` : n° 3 : le texte de l'alerte est « Les modifications que vous avez apportées ne seront pas enregistrées… » (plus le titre deux fois) ; n° 2 : plus de libellé `admin.title` (ni d'autre clé du serveur) dans les catégories, les apps traduites par `support` gardent leur libellé, l'ordre suit les libellés ; la catégorie proposée par défaut peut changer (première du tri).
- `07-framework-localfile` : n° 4 et n° 5 avec une pièce jointe de chaque source (le type change seul, pas le code exécuté). Hors du module, rien à rejouer pour la même raison.
- `08-erreurs` : rien de plus (suivi seul).
- Remplacement de `PageView` / `KeyboardPageView` (2026-11-19, après les patchs) : iOS : le formulaire remonte au-dessus du clavier quand on saisit la description, le bouton d'envoi reste atteignable ; **marge du bas** du bouton d'envoi (le `SafeAreaView` de `KeyboardPageView` a disparu) ; fond blanc. Android : clavier ouvert sur la description, le formulaire se redimensionne comme avant ; écran vide d'un compte sans droit centré comme avant.
