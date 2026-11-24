# Journal des sessions

Entrées les plus récentes **en tête**. Une entrée par session, même courte. Format :

```
## AAAA-MM-JJ — <sujet> (<branche>)
- Fait :
- Décidé :
- En suspens :
- Prochaine étape :
```

---

## 2026-11-24 — Intents des modules à la place des anciens intents (`feat/ia/migration-outillage`)

- Fait (commit `59804c2fd`, puis repris) : les anciens intents (`registerIntent` / `openIntent` / `INTENT_TYPE`) sont retirés. D'abord remplacés par une entry `entries.resource`, puis déplacés dans une nouvelle clé de module **`intents`** (`ConfigForIntents`, `src/app/module/types.ts` ; `Module.intents`) : des tableaux de callbacks, à la différence d'`entries` (des objets avec une `route`). Un callback renvoie `true` s'il prend la main, `false` pour laisser l'intent compatible suivant.
  - `intents.resource` : `{ resourceType, callback(resource: ResourceMedia, navigation) }`. `ResourceMedia.resourceType` (nouveau, nom technique de l'app : `'blog'`…) est rempli par `explorer` (`resourceType` de l'API) et `communities` (`appName` de l'API). `useOpenMedia` exporte `openResource`, qui essaie les intents des modules disponibles pour l'utilisateur (`runResourceIntents`, `src/app/module/intents.ts`), sinon le navigateur.
  - `intents.notification` : `{ type, eventType: string | string[], callback(notification, navigation) }`, déclaré par `notificationIntent` (notification `IAbstractNotification` restreinte au `type` / `event-type` de l'intent). Déclaré seulement, pas encore lu (chantier notifications, `later.md`, fiche `timeline`).
  - `src/app/intents.ts` renommé `src/app/ent-app-names.ts` (noms d'apps lus par `explorer`). `ToDo(<module>-migration)` de `blog`, `scrapbook`, `wiki` réécrits pour `intents.resource`.
- Cycle de types : un callback écrit dans la config rendait circulaires les types de tous les modules (via `RootNavigation`), d'où plus d'auto-complétion. `navigation` est une `IntentNavigation` (interface qui étend `RootNavigation`) et `intents` n'est pas générique. `entries` garde `Entries & ConfigForEntries<…>` : ses clés se complètent (ce n'était pas le cas avant).
- Décidé (utilisateur) : `intents` en tableaux ; `boolean` renvoyé ; `resourceType` comme nouveau champ de `ResourceMedia` ; notification : type seul, `IAbstractNotification` restreinte, fonction d'aide ; modules disponibles pour l'utilisateur seulement ; renommage d'`intents.ts` ; note « à confirmer » sur la décision 2 de `blog`. Décidé seul : valeurs de `resourceType` (`resourceType` d'`explorer`, `appName` de `communities`) ; ordre d'essai (modules, puis tableaux).
- Docs : ARCHITECTURE §2.3, `framework.md`, BASCULE (geste 19), `inventaire.md`, STATUS (B1, B5, chantier notifications), `later.md`, fiches `timeline` (décision), `blog`, `wiki`, `media`.
- Vérifié : voir la fin de session. Pas joué dans l'app : aucun module chargé ne déclare d'intent.
- Prochaine étape : la première bascule concernée (`blog`) déclare son `intents.resource`.

## 2026-11-23 — Assainissement d'`audience` : plan d'ensemble (`feat/ia/migration-outillage`)

- Fait : analyse de tous les sujets (`/sanitize-module src/modules/audience`, `tous`), décisions écrites dans la fiche ([audience.md](audience.md) §6, 4 à 11 ; §9). Aucun code écrit.
- Décidé (utilisateur) : un seul commit avec la bascule ; barre séparée (`AudienceBar` + `Audience` public aux props inchangées) ; `getModuleTransport('audience').sessionFetch` (pas `accountFetch`) ; importeurs du framework rebranchés, modules anciens sur les façades ; `POST` / `PUT` inversés du bouton notés, pas corrigés ; choix de la réaction converti en `transparentModal`.
- Décidé seul (à relire) : squelette de la barre rafraîchi à l'arrivée des types (pas de préférence du développeur) ; types de réactions passés au bouton en prop ; règle de `blog` gardée avec son `ToDo`.
- Suite (même jour) : retour du choix par `navigation.navigateAsync` (développeur, fiche §6, 12). Essai jetable du geste continu (`ToDo(audience-migration): EXPERIMENT`, bouton posé sur l'accueil de test) : **sur iOS, le geste survit à l'ouverture d'une `transparentModal`** (le bouton garde le toucher : mouvements et relâchement reçus). Essai Android par le développeur : fonctionne aussi bien. Geste gardé (fiche §6, 13) ; plus de question ouverte.
- Reprise et fin (même jour) : tous les sujets faits dans l'arbre de travail (fiche §9) ; l'essai est remplacé par l'implémentation. `model/` + `service/` (`namespace API`, adapter, `getModuleTransport('audience').sessionFetch`) + `actions.ts` ; barre séparée (`AudienceBar`, `AudienceReactButton`, `Audience` public) ; `connect` remplacés par des hooks ; sélecteur `audience/react` (`transparentModal`, `navigateAsync`, geste par `useReactionPickerGestureStore`) ; `PageView` retiré ; importeurs du framework rebranchés. Décisions prises seul : fiche §6, 14 (à relire).
- Vérifié : `tsc` 790 → 780 (aucune nouvelle) ; ESLint du module 14 → 0 ; `lint-all` 2153 → 2134 ; Jest 447 → 453 ; `--check` vert. iOS (accueil de test, ressource fictive) : barre, ouverture et position du sélecteur, modale « Réactions ». Pas joué : réagir pour de vrai, Android.
- En suspens : relecture ; essai Android (position du sélecteur, geste, toucher) ; `POST` / `PUT` inversés (noté).
- Retours du développeur (même jour) : icônes figées à la fermeture du sélecteur (capture de `react-native-screens`), page qui défilait pendant « maintenir puis glisser » (`PanResponder` → gestes natifs de `react-native-gesture-handler`). Puis **retour au `Modal` de react-native pour le sélecteur** (fiche §6, 15) : `audience/react` et son store retirés, `ui` abandonné. Signaux ajoutés à `framework.md`.
- Framework : **`NativeModal`** (`src/app/navigation-new/native-modal.tsx`), le `Modal` de react-native qui se ferme quand son écran perd le focus et rend le retour Android obligatoire ; utilisé par le sélecteur de réactions (fiche §6, 16). Pas d'autre utilisateur pour l'instant ; les autres `Modal` de react-native du dépôt (`src/ui/Modal.tsx`, `backdropModal.tsx`…) ne sont pas touchés.
- CONVENTIONS « UI » (accord du développeur) : `Modal` de react-native qui n'est pas une étape de navigation → `NativeModal`, ligne du tableau et règle sous le tableau.
- En suspens : jouer le sélecteur en `Modal` sur iOS et Android (le simulateur n'a pas rechargé le code ; chaque redémarrage à froid a perdu la session, cause non étudiée).
- Prochaine étape : relire, jouer le sélecteur, puis un seul commit (bascule + assainissement, fiche et suivi compris).

## 2026-11-23 — Bascule d'`audience` (`feat/ia/migration-outillage`)

- Fait : fiche [audience.md](audience.md), puis bascule (non commitée). Tout `src/framework/modules/audience` déplacé dans `src/modules/audience` (`service.ts`, `types.ts`, `components/`, `screens/`) ; l'ancien `index.ts` réparti en `actions.ts` (`markViewAudience`, `computeAudienceRefererFromResourceUri`, `ToDo` sur le code de `blog`) et `hooks.ts` (`useAudience`) ; `module-config.ts` et l'ancien `new Module(...)` supprimés. Écrans `reactions` et `views` en `defineModal`, déclarés en `modals` du `CoreModule` (`audience/reactions`, `audience/views`), `withSession` sur `reactions` ; barre `Audience` qui navigue vers ces routes ; façades d'`auth` (`getValidReactionTypes`, types) remplacées. Routes `Audience*` retirées de l'ancien registre des modales globales (`src/framework/navigation/modals/index.ts`, `navigator.tsx`). 5 façades `@deprecated` aux anciens chemins.
- Décidé (utilisateur) : tout le code dans `src/modules/audience` avec façades (contre la recommandation « écrans seuls ») ; routes retirées de l'ancien registre.
- Décidé seul (à relire) : `actions.ts` / `hooks.ts` pour le contenu de l'ancien `index.ts` ; params des écrans en `type` et `mapDispatchToProps` simplifié (typage, fiche §4).
- Vérifié : `tsc` 792, identique par fichier (chemins déplacés) ; ESLint du module 26 → 13 (déjà présentes) ; `yarn lint-all` 2166 → 2153 ; Jest 447/447 ; `--check` vert, `audience` en `basculé, sans test`, fichiers sur l'ancienne navigation 221 → 216 ; `testID` et clés i18n inchangés. **Pas testé dans l'app** (aucun consommateur chargé).
- En suspens : relecture ; régression possible de la barre (types de réactions lus par `connect` dans un store zustand, fiche §5, 2) ; STATUS B3 corrigé (`audience` n'attendait pas `debug` / `splashads`).
- Prochaine étape : relire le diff, commiter la bascule (fiche et suivi compris) ; puis `news` ou `blog`, qui rendront `audience` jouable.

## 2026-11-23 — Bascule d'`explorer` (`feat/ia/migration-outillage`)

- Fait : fiche [explorer.md](explorer.md) réécrite en fiche de bascule (l'ancien plan du 2026-11-18 écarté), puis bascule (non commitée). `index.ts` en `CoreModule` (`scope: ['explorer']`, `redux: { reducer }`), `module-config.ts` et `store.ts` supprimés ; store d'`explorer` dans `store/` (rangement de `myapps`), données par app puis par dossier, action `EXPLORER_LOAD_PAGE` et sélecteur `selectExplorerFolder` qui prennent l'app ; `ExplorerApp` (modèle) et `toExplorerApp` (service, nom ENT depuis `application`) ; template `ResourceExplorer` : prop `route`, `useNavigation()` / `useIsFocused` dedans, plus de `navigation` / `moduleConfig` / `selectors` ; `explorerScreenHeader` (options de `defineScreen`) ; `createResourceExplorerNavBar` en façade `@deprecated` sur le nouveau store (`deprecated.ts`, réexporté au même chemin) ; ligne dans `src/app/config/modules.ts`. CONVENTIONS : « Trois types de composants » (écran, template, composant d'interface).
- Décidé (utilisateur) : un seul store, celui d'`explorer`, par app (repris de l'ancien plan) ; le template reçoit la `route` et navigue lui-même (remplace « template sans navigation ») ; consommateurs cassés jusqu'à leur bascule ; en-tête `explorerScreenHeader` + façade `@deprecated` qui prend le `context` ; clé d'une app = nom converti par le service depuis `application` (`name` de l'`EntApp`) ; les trois types de composants.
- Décidé seul (à relire) : `~/app/intents` n'arrête pas la bascule (table de noms seulement) ; erreur levée au chargement pour une application sans app connue ; `appName` gardé à l'identique par un cast `as string` (`ToDo`) ; commentaires reformulés pour que `cli/migration-status.js` ne compte pas `defineScreen(` comme un écran.
- Vérifié : `tsc` 770 → 797, aucune erreur nouvelle dans `explorer` (les 5 de `model/index.ts` restent) ; +29 / −2 chez les 4 consommateurs, listées dans la fiche §7 (accepté) ; ESLint du dossier 2 → 0 (`eslint --fix`) ; `yarn lint-all` 2168 → 2166 ; Jest 447/447 ; `yarn migration-status --check` vert, `explorer` en `bascule incomplète` (la façade) ; pas de `testID` ni de storage. **Pas testé dans l'app** (aucun consommateur chargé).
- En suspens : relecture ; bug du reducer porté tel quel (le contenu d'un sous-dossier perdu au rechargement du parent, fiche §5, 13) ; composants d'interface qui naviguent déjà (`auth`, framework) pas encore notés dans `later.md`.
- Prochaine étape : relire le diff, commiter la bascule (fiche et suivi compris) ; puis `scrapbook` ou `wiki`, qui se mettront aux nouveaux contrats.
- Ensuite (utilisateur) : `model/index.ts` d'`explorer` vérifié (code mort, cassé depuis `972cccdc3` qui a séparé `folders` / `resources`, importé nulle part) et **supprimé dans la bascule** (fiche, décision 11). `tsc` 797 → 792, plus aucune erreur dans `explorer` ; ESLint du dossier 0 ; `--check` vert. Les types de `wiki` pris à l'ancien modèle (`Resource`, `ResourceHistory`, des `any` silencieux) notés dans `later.md`.
- Ensuite (utilisateur) : règle générale ajoutée, geste 21 de BASCULE : un fichier mort (importé nulle part) **et** cassé (erreurs `tsc`) est supprimé pendant la bascule ; un fichier mort qui compile reste au backlog. « Ne pas faire » et `inventaire.md` alignés.
- Ensuite (utilisateur) : le template ne convertit plus l'app (`toExplorerApp`) : il donne son `context` tel quel au GET et au sélecteur ; `resources.get` convertit et renvoie `{ app, ...page }` (erreur levée avant la requête pour une application sans app connue), `selectExplorerFolder(context, folderId)` convertit aussi ; `explorerScreenHeader` aligné (fiche, décision 12). `tsc` 792, identique par fichier ; ESLint du dossier 0 ; `--check` vert. Pas testé dans l'app.
- Ensuite (utilisateur) : table des noms d'apps déplacée de `src/app/intents.ts` (`newEntAppNameFromOldMap`, `NewEntAppName`, seul `explorer` les lisait) vers le service d'`explorer` (`explorerAppFromEntApplication`, lue par `toExplorerApp`) ; `ExplorerApp` écrit dans le modèle (fiche, décision 13). `tsc` 792, identique par fichier ; ESLint 0 ; `--check` vert.

## 2026-11-19 — Revue et harmonisation de `myapps` (`feat/ia/migration-outillage`)

- Fait : revue de `src/modules/myapps` face aux règles des deux skills (rien pour la bascule), puis harmonisation avec les décisions prises pour `auth` (non commité). Écrans en dossiers (`screen.tsx` + `index.ts`), `menu` et `app-actions` compris ; `screens/sheet.tsx` → `components/sheet/` ; slide de l'onboarding → `components/my-apps-onboarding-slide/` ; `index.ts` dans chaque composant, imports par le dossier ; `utils.ts` → `util.ts` ; styles de `MyAppsCard` dans `styles.ts` ; actions qui reçoivent la session (hooks publics : callbacks avec la session ; `home`, `app-actions`, `favorites` sous `withSession`) ; `headerTitle: () => ''` dans `myapps/favorites`. Fiche [myapps.md](myapps.md) (en-tête, §5.2, §7, §9), CONVENTIONS, BASCULE, `modules-de-reference.md`, STATUS, `later.md` alignés.
- Décidé (utilisateur) : un composant partagé par plusieurs écrans du module (`Sheet`) **n'est pas un template** : il va dans `components/`, chaque écran a son dossier (CONVENTIONS « Dossier d'un écran ») ; pour le reste, les décisions d'`auth` (erreurs non traitées, `ToDo` laissés).
- Décidé seul (à relire) : nom du dossier `components/sheet/` (le composant s'appelle `Sheet`) avec `options.ts` pour `sheetOptions` ; `infoMessageItem` (style du seul menu) dans `screens/menu/styles.ts` ; `MyAppsOnboardingSlide` dans `components/my-apps-onboarding-slide/` avec le type `OnboardingSlide` ; fond de `MyAppsCard` par `getCardBackgroundStyle` (`styles.ts`) au lieu d'un `StyleSheet` recréé par couleur ; les hooks publics prennent la session dans leurs callbacks (plutôt que de la lire eux-mêmes) ; CONVENTIONS ne cite plus `myapps` comme exception à « l'action reçoit la session ».
- Vérifié : `tsc` 770, identiques par fichier et par code ; ESLint du module : 1 erreur préexistante (`I18n` inutilisé, `service/index.ts`) ; Jest 447/447 ; `testID` inchangés ; `yarn migration-status --check` vert. **Pas testé dans l'app.**
- Prochaine étape : relire, jouer les flows `myapps-*` et la recette de la fiche §9, puis commiter (séparément d'`auth`).

## 2026-11-19 — Revue et assainissement de `auth` (`feat/ia/migration-outillage`)

- Fait : revue de `src/modules/auth` et de `src/framework/modules/auth` face aux règles des deux skills, puis assainissement décidé avec le développeur (non commité). `useConfirmRemove` dans les templates `verify-email` / `verify-mobile` ; template `mfa` : timers nettoyés, **bug corrigé** (pour `email` / `mobile`, `onVerified` appelé deux fois : timer et fin d'animation) ; `service/types.ts` en `namespace API`, formats identiques au modèle déplacés dans `model/index.ts` et aliasés, `SignInResult` dans le modèle, le modèle n'importe plus le service ni le template d'activation ; `use-sign-in.ts` → `sign-in/hooks.ts`, `hooks/remove-account.ts` → `screens/hooks.ts`, `account-list` hors de `components/index.ts` ; `PictureCard` déplacé dans `src/modules/auth/sign-in/components/` ; `PageView` / `KeyboardPageView` remplacés (`introduction`, `forgot`, `change-password`) ; `media-deprecated` et la façade `framework/modules/media` → `~/modules/media` ; façades sans importeur supprimées (`framework/modules/auth/model/business.ts`, `model/error.ts`) ; styles de `LargeButton` dans `styles.ts`. Fiche [auth.md](auth.md) réécrite (§3, §5, §6, §9), STATUS, `later.md`, `modules-de-reference.md` alignés.
- Décidé (utilisateur) : l'import de `~/app/navigation/types` d'`auth` attend une **grande phase de nettoyage après toutes les migrations** (nouvelle section de `later.md`) ; `headerTitle: () => ''` permis pour masquer le titre (CONVENTIONS « UI », BASCULE geste 6) ; `namespace API` = formats du backend, un format identique au modèle est écrit dans le modèle et aliasé par `API` (CONVENTIONS « Structure d'un module ») ; `debug` sera migré (son `DebugOptions` reste importé) ; marqueurs `TODO(auth-migration)` laissés ; classes et `moment` reportés (`later.md`) ; erreurs `tsc` / ESLint non traitées.
- Décidé seul (à relire) : `module-config.ts` de `framework/modules/auth` gardé (il nomme les types d'actions de `redux/actions.ts`, encore dispatchées pour `viescolaire`) ; l'ancien `templates/change-password` lit `~/modules/auth/model/error` ; noms des types déplacés dans le modèle inchangés (`IEntcore*`, `IUserRequirements`…), noms `API.*Response` pour les alias ; `KeyboardPageView` remplacé par la même structure (`KeyboardAvoidingView` + `ScrollView`, `SafeAreaView` gardé pour `forgot`).
- Vérifié : `tsc` 770, identiques par fichier et par code (les 2 TS2540 de `PictureCard` suivent le fichier) ; ESLint des deux dossiers : 1 erreur préexistante ; Jest 447/447 ; `yarn migration-status --check` vert. **Pas testé dans l'app** (recette dans la fiche §5).
- En suspens : `model/business.ts` lit le store (backlog) ; relecture et recette.
- Prochaine étape : relire le diff, jouer la recette de la fiche §5, puis commiter.

## 2026-11-19 — Assainissement de `support`, tous les sujets (`feat/ia/migration-outillage`)

- Fait : premier passage de `/sanitize-module`, par un agent, sur `src/framework/modules/support`, en huit patchs non commités (`sanitize-patches/01` à `08`) : `connect` (avec `try-action` et le reducer `ticket` mort : plus de Redux dans le module) ; `structure` en deux PR (service : `service/api.ts`, `service/adapter.ts`, `getModuleTransport('support').accountFetch` ; puis `model/` avec `business.ts` et `actions.ts`, `rights.ts` supprimé) ; `performance` ; `styles` (équivalents exacts seulement) ; `dette` (texte de l'alerte de sortie, libellé des catégories par « Mes applis ») ; patch du framework (`nativeInfo` du `LocalFile` de `src/framework/util/fileHandler/index.ts`) ; `erreurs` (absorbé). Fiche [support.md](support.md) §5, §6, §9.
- Décidé (utilisateur) : `droits` et `ui` abandonnés ; `connect` + `try-action` + Redux mort en une PR ; `structure` en deux PR ; pas de nouveaux flows Maestro, recette par PR dans la fiche ; `accountFetch(session, …)` ; `actions` de `BottomMenu` jamais mémoïsées ; patch du framework pour `LocalFile` ; styles : équivalents exacts seulement ; texte de l'alerte et libellés des catégories corrigés ; `PageView` / `KeyboardPageView` et `DropDownPicker` notés.
- Décidé seul (à relire) : `SyncedFileWithId` de `~/framework/util/fileHandler` dans tout le module dès `connect` (sans le cast de `mapDispatchToProps`, l'autre classe donnait une erreur nouvelle) ; types `TicketDraft` et `TicketAttachment` dans `model/index.ts` dès la PR du service ; `actions.ts` en fonction async simple (`sendSupportTicket`), le module n'ayant plus de store ; condition Android du style de la liste des catégories gardée dans l'écran (un `Platform.select` dans `styles.ts` aurait mis `position: undefined` sur iOS).
- Vérifié : `tsc` 778 → 770, aucune erreur nouvelle par fichier et par code (−5 dans le module, −3 ailleurs grâce au patch du framework) ; ESLint du dossier 0 ; Jest 431 → 447 ; `yarn migration-status --check` vert à chaque patch ; `testID` inchangés. **Pas testé dans l'app.**
- En suspens : relecture des huit patchs ; recette par patch dans l'app (fiche §9) ; les deux classes `LocalFile` / `SyncedFileWithId` du framework (`fileHandler/index.ts` et `fileHandler/models`) restent.
- Prochaine étape : relire, jouer la recette, puis commiter un patch par PR.
- Ensuite (utilisateur) : les huit patchs appliqués à l'arbre de travail (la fiche reprise du worktree, qui avait déjà la bonne phrase sur `hasRight`) ; `screens/create-ticket/types.ts` supprimé (un seul type, utilisé par un seul fichier). Retours de l'essai intégrés aux skills : mode « plan d'ensemble » (`/sanitize-module <chemin> tous`), ordre par défaut des sujets, statuts `absorbé par <sujet>` et `sans objet`, base `tsc` d'un sujet = état après le précédent, mesures dans le scratchpad, `yarn migration-status` seulement en fin de session, total de `yarn lint-all` comparé à la base, une entrée de JOURNAL par session ; CONVENTIONS : actions qui **reçoivent la session** en paramètre (décidé), dossier d'un écran (avec template : un fichier ; sans template : `screen.tsx` + `index.ts` qui réexporte, décidé), droits par fonction dans `model/business.ts`, section « Styles » (équivalents exacts, style de plateforme dans le JSX), mock Jest d'un service exporté par défaut ; `framework.md` : `PageView`, `BottomMenu`, les deux classes `LocalFile` ; `inventaire.md` : recettes de vérification ; gabarit : §5 « Backlog » / « Noté, non traité », colonne « Recette » en §9 ; `cli/migration-status.js` ne compte plus les tests (`support` : 534 lignes). La doc de migration n'est pas formatée par Prettier (décidé).
- Ensuite (utilisateur) : le fichier des types de l'API d'un service s'appelle `service/types.ts`, jamais `service/api.ts` (fichier de types du dossier, CONVENTIONS « Types »). `src/modules/myapps/service/api.ts` et `src/framework/modules/support/service/api.ts` renommés `types.ts`, imports corrigés ; CONVENTIONS, `sanitize-module`, `inventaire.md`, `modules-de-reference.md` et les fiches (`myapps`, `support`, plans de `wiki`, `explorer`, `user` : plus de renommage `types.ts` → `api.ts`) mis à jour.
- Ensuite (utilisateur) : dans `support`, `PageView` remplacé par un fragment (le layout de la nouvelle navigation donne déjà fond, taille et `ErrorBoundary`), `KeyboardPageView` par `KeyboardAvoidingView` (`~/framework/components/keyboard`, iOS seulement comme avant), `pageGutterSize` par `UI_SIZES.spacing.medium`. Règle écrite dans `framework.md` et le sujet `dette` de `sanitize-module`. Vérifié : `tsc` 770, rien dans `support` ; ESLint du dossier propre ; Jest 16/16. **Pas testé dans l'app** : la marge du bas sur iOS (le `SafeAreaView` de `KeyboardPageView` disparaît).
- Ensuite (utilisateur) : `docs/ARCHITECTURE.md` (les deux générations) fusionné dans `.claude/docs/ARCHITECTURE.md` (qui ne décrivait que l'ancien système), numérotation des sections gardée (les fiches et les skills citent §2, §3.2, §6) ; `AGENTS.md` (inexistant) remplacé par `CLAUDE.md` ; §7 renvoie aux vrais documents. Dossier `docs/` retiré : les autres fichiers étaient vides (`TESTS.md` : « Pas de tests. »). Liens mis à jour (`CLAUDE.md`, INTENT, `framework.md`, `journal/README.md`) ; aucun lien cassé.
- Ensuite (utilisateur) : INTENT revu et réécrit sans détails techniques (pourquoi, quoi, comment, quand ; les gestes renvoient à BASCULE, les sujets à `sanitize-module`). Ajouts : la raison des deux étapes et de la migration sur place ; « la migration ne change rien pour les utilisateurs, un changement visible ne vient qu'avec l'assainissement, validé ». Retirés : identifiants de code, listes d'API, dates de décision, notice du script (reportée dans `migrate-module/SKILL.md`, « Le suivi calculé »). Numéros des §4 et §8, cités ailleurs, gardés.
- Ensuite (utilisateur) : INTENT §4 « En profiter pour relever bugs et défauts de conception » et règle §5.3 « tout noter » : propre au module → fiche §5 (corrigé en assainissement) ; au-delà ou plus tard → `later.md`, nouvelle table « Bugs et défauts de conception relevés », remplie avec les 5 relevés de la session (`BottomMenu`, classes de fichiers en double, `auth`, carrousel de `media`, `SCREENS.md`). Consigne ajoutée aux deux skills.
- Ensuite (utilisateur) : inventaire des modules restants et ordre de migration écrits dans [STATUS.md](STATUS.md) (« Ordre de migration ») : 5 blocages (notifications : 17 modules ; widgets ; modales globales ; navigation circulaire `viescolaire`, `mails` ↔ `user` ; intents, non vérifiés), difficulté par module, 7 vagues (0 à 6). Questions ouvertes 3 (gestionnaires de notifications débranchés pendant la bascule, recommandé, non décidé) et 4 (widgets) ajoutées ; prochaines étapes réécrites (vague 0). Relevé fait par un script du scratchpad, pas versionné.
- Ensuite (utilisateur) : questions ouvertes 1 à 4 tranchées. (1) Ouverture des notifications par une clé de config de module `notifications`, lue par le module `notifications` (fiche `timeline` §7, `later.md`, ARCHITECTURE). (2) Reste d'`audience` migré avant tous ses consommateurs. (3) `notif-handler` débranché pendant la bascule, rebranché avant la livraison : geste 19 de BASCULE ; condition d'arrêt retirée ; `cli/migration-status.js` ne compte plus les `notif-handler` comme navigation ancienne (222 fichiers au lieu de 238). (4) Widgets d'accueil hors de la migration, faits à part par l'équipe : geste 20, INTENT « Hors des deux étapes ». STATUS : ordre de migration ajusté (30 modules, vague 6 retirée, rebranchement des handlers avant la livraison), chantier « Ouverture des notifications » ajouté, prochaines étapes mises à jour.

## 2026-11-19 — Revue de `support`, deux skills (bascule / assainissement), suivi déplacé (`feat/ia/migration-outillage`)

- Fait : revue de `support` face au nouveau framework et confrontation du skill `migrate-module` avec INTENT / BASCULE (issus d'une formation). `docs/migrations/` déplacé dans le skill : règles à la racine de `.claude/skills/migrate-module/`, suivi et gabarits dans `journal/` ; copie en double `docs/migrations/migration-status.js` supprimée ; chemins corrigés (`cli/migration-status.js`, `.maestro/`, `docs/ARCHITECTURE.md`, un commentaire de `src/modules/notifications/hooks.ts`). INTENT, BASCULE (17 gestes), CONVENTIONS, gabarit de fiche (§9 « Assainissement »), `later.md` réécrits. `migrate-module` réécrit pour la bascule seule ; nouveau skill `sanitize-module` (un sujet par PR, phases d'une réécriture complète). `support` aligné : route `support/create-ticket`, `useConfirmRemove`, `ToDo(support-migration)` sur les imports de `workspace`. Compteur : `~/framework/navigation` compté, `setOptions` seulement avec un contenu ancien, `bascule incomplète` seulement pour la navigation ancienne ou l'import des routes d'un module ancien.
- Décidé (utilisateur) : deux skills, bascule puis assainissement ; dans la bascule, tout ce qui ne marche pas dans la nouvelle navigation (`setOptions` en entier, `usePreventBack` → `useConfirmRemove`, routes renommées `<module>/<dossier de l'écran>`, suffixe de la route d'accueil demandé au développeur) ; conversions d'UI en assainissement ; **plus de passage de Redux à zustand** (exception `user` gardée) ; sur place, jamais de déplacement vers `src/modules/` sauf dossier existant ; façade pour les importeurs de `module-config.ts` / `navigation/` ; `setOptions` permis avec les nouveaux items pour un bouton qui dépend de l'état ; import du code d'un module ancien permis avec `ToDo`, navigation ou state : arrêt ; Maestro recommandé, pas bloquant ; module ajouté au registre quelle que soit la marque (liste par marque dans `later.md`) ; tout le suivi dans le skill `migrate-module`.
- Vérifié : `tsc` 778 erreurs, identiques par fichier et par code avant / après (le texte de certaines erreurs d'autres modules change : il cite l'union des routes) ; ESLint sur `support` : 3 erreurs, 3 avertissements, les mêmes ; `yarn migration-status --check` vert après régénération (navigation ancienne 219 → 238 : nouvelle règle de comptage, pas du code nouveau) ; `myapps` et `support` passent `basculé, testable` ; aucun lien Markdown cassé dans les fichiers déplacés. **Pas testé dans l'app** (route renommée, `useConfirmRemove`).
- En suspens : `auth` importe encore `~/app/navigation/types` ; `media` (carrousel) masque ses boutons par `setOptions({ headerLeft, headerRight })`, signalé par la nouvelle règle ; `.claude/rules/SCREENS.md` et `CLAUDE.md` §5 décrivent la création d'écran à l'ancienne ; le commit `4307c0738` (`chore(support)`) touche aussi `src/app/store/index.tsx`.
- Prochaine étape : relire les deux skills ; rejouer `support-01` et la recette de `support` dans l'app ; premier vrai essai de `/migrate-module` sur un module.
- Ensuite (utilisateur) : ajouts aux deux skills. Bascule : geste 18, `withSession` (`~/modules/auth/hoc`) sur **tout** écran qui lit la session (`getSession()` / `assertSession()`, `sessionScreen`, ancien chemin de `withSession`), appliqué à `support` (session passée à `mapStateToProps`). Assainissement : nouveaux sujets `try-action` (supprimer `tryAction`, tracking gardé), `performance` (`useCallback` / `useMemo`), `styles` (styles statiques dans `styles.ts`), `erreurs` (`tsc` / ESLint du modèle et du reste du code) ; `api-publique` élargi (types, hooks, utilitaires). Pendant la bascule, DESIGN-SYSTEM et les règles d'écriture de COMPONENTS / SCREENS ne s'appliquent pas au code porté (CONVENTIONS « Portage »). Vérifié : `tsc` 778, identiques par fichier et par code ; ESLint `support` 2 erreurs, 3 avertissements. **Pas testé dans l'app.**
- Ensuite (utilisateur) : sujet `try-action` corrigé : l'option `track` est supprimée avec `tryAction`, sans appel de remplacement à `Trackers`, qui n'est plus compatible avec la stack Firebase. Remplace « tracking gardé » de la ligne précédente.

## 2026-11-19 — Intention, suivi calculé, tests Maestro, bascule de `support` (`feat/ia/migration-outillage`)

- Fait : [INTENT.md](../INTENT.md) (contexte, migration en deux étapes, règles de conduite, définition de « terminé ») ; [BASCULE.md](../BASCULE.md) (patron de l'étape 1) et [\_template-bascule.md](_template-bascule.md) ; `yarn migration-status` (`cli/migration-status.js`) qui génère [SUIVI.md](SUIVI.md) et `suivi.json`, avec `--check` qui échoue si un compteur de l'ancienne génération augmente ; suite Maestro dans `.maestro/` (connexion, six flows `myapps`, guide), script `yarn e2e` ; bascule de `support` sur place ([support.md](support.md)) : 11 fichiers, +47 / −79.
- Décidé : rien. Tout ce qui est écrit ici est une proposition à relire ; les choix pris pour `support` sont des choix par défaut ([support.md](support.md) §6).
- Vérifié : `yarn migration-status` (8 modules sur 41 sur la nouvelle génération, 97 écrans anciens) ; `tsc`, ESLint et Jest sur `support` le 2026-11-18, avant sa remise sur place. **Pas testé dans l'app. Aucun flow Maestro n'a tourné.**
- En suspens : `support` importe l'ancien `workspace` pour l'envoi des pièces jointes (aussi importé par `blog`, `homework`, `mails`, `user`) ; `support` n'a aucun `testID` ; trois `testID` ont changé avec la migration (`header-back` → `BackButton`, `network-welcome-version` → `network-welcome-subtitle`, `network-version-number` disparu), à l'encontre de la règle « `testID` inchangés ».
- Prochaine étape : faire passer `.maestro/flows/00-connexion.yaml` puis `myapps-01-liste.yaml` sur un build de l'ancienne génération ([.maestro/README.md](../../../../.maestro/README.md)) ; jouer `support` dans l'app ; trancher les questions ouvertes de [support.md](support.md).

## 2026-11-18 — Révision de la cible d'`explorer` (`feat/navigation`)

- Fait : [explorer.md](explorer.md) §1, §3, §4 n° 4 et 10, §5, §6 (phases 2 à 4), §7 ; [wiki.md](wiki.md) §5.1, §5.2, §7. Aucun code modifié.
- Décidé (utilisateur) : `explorer` garde dans **son** store (`state.explorer`) l'inventaire des dossiers et ressources **par app** (nom ENT : `Wiki`, `Blog`, `Cahier de texte`, `Cahier Multimédia`) ; API publique en **fonctions qui prennent l'app** (`loadExplorerPage`, `selectExplorerFolder`, `resourceExplorerScreenOptions`, prop `app` du template), pas de fabrique ; contexte de l'API (`application` / `resource_type`) dans le service d'`explorer`. Remplace « un slice par consommateur ». Flux des noms d'apps détaillé ([explorer.md](explorer.md) §5.4) : l'ancien nom (`wiki`) ne sort pas du service ; `appName` d'une ressource = nom ENT de l'app demandée (`item.application` non lu).
- Vérifié : rien à lancer (documentation seule).
- En suspens : validation du plan ; règle « mapping de noms d'apps hors de l'adapter de l'API = anti-pattern » proposée pour CONVENTIONS, sans réponse.
- Prochaine étape : phase 1 (déplacements) d'`explorer`, après validation.

## 2026-11-17 — Spécification d'`explorer` (`feat/navigation`)

- Fait : fiche [explorer.md](explorer.md) (inventaire, consommateurs `wiki` / `blog` / `homework` / `scrapbook`, dépendances, comportements, cible, plan en 5 phases). Override `dev/default` gardé (déjà actif). Aucun code modifié.
- Décidé (utilisateur) : sur place ; `CoreModule` sans `redux` (state par consommateur, fabrique préfixée par son nom) ; sous-dossier par callback `onOpenFolder` ; titre lu dans le store depuis la fonction `options` de `defineScreen` ; **pas de façade** (ancien template et anciennes fabriques supprimés, les 4 consommateurs cassent jusqu'à leur migration) ; conversion des noms d'apps de `/explorer` dans l'adapter d'`explorer`, `newEntAppNameFromOldMap` retiré d'`intents.ts` (un mapping de noms d'apps hors de l'adapter de l'API qui l'impose est un anti-pattern) ; corrections §4 n° 6, 7, 8.
- Vérifié : base tsc 776 (5 dans `explorer`, orphelin `model/index.ts`), eslint 2 090 / 88, `yarn test` 431/431.
- En suspens : validation du plan.
- Prochaine étape : phase 1 (déplacements) d'`explorer`.

## 2026-11-17 — Spécification de `wiki` (`feat/navigation`)

- Fait : fiche [wiki.md](wiki.md) (inventaire, consommateurs, dépendances, comportements, cible, plan par phases). Override `dev/default` appliqué par le skill. Aucun code modifié.
- Décidé (utilisateur) : migration sur place ; `explorer` puis `audience` migrés d'abord, migration de `wiki` **arrêtée** en attendant ; orphelins non portés (`wiki/create`, `image-input`, `resource-thumbnail-loader`, pas de `fileManager`) ; corrections §4 n° 3, 4, 7 ; `testID` de l'en-tête abandonnés au profit du header du framework ; **jamais `headerTitle`** pour un titre lu dans le store (perd le titre natif).
- Vérifié : base tsc 776 erreurs (22 dans `modules/wiki`), eslint 2 090 / 88, `yarn test` 431/431.
- En suspens : question 7 de la fiche (moyen d'afficher un titre lu dans le store sans `headerTitle`) ; validation du plan.
- Prochaine étape : `/migrate-module src/framework/modules/explorer`, puis `audience`, puis reprise de `wiki`.

## 2026-11-17 — Points d'entrée `entries` et clé `fileManager` (`feat/navigation`)

- Fait : phase 0 du plan de `user`, à part : `ModuleConfig.entry` / `tab` remplacés par `entries` (`myApps`, `tab`, `userMenu`), `route` obligatoire sans params ; `getUserMenuEntries` / `useUserMenuEntries` pour les liens de l'accueil de `user` ; clé `fileManager` enregistrée au chargement des modules. `myapps`, modules de test, tabs, `useOpenModule` adaptés. Doc : ARCHITECTURE, [myapps.md](myapps.md), [user.md](user.md) §9, signaux du skill. Détail dans [user.md](user.md) §9.
- Décidé (utilisateur) : **migration de `user` reportée** ; seules ses évolutions du framework sont faites maintenant.
- Vérifié : tsc 776 (inchangé), eslint 2 090 / 88 (inchangé), `yarn test` 431/431 (+3). **Pas testé dans l'app.**
- En suspens : test dans l'app (onglets, ouverture des modules depuis « Mes applis ») ; champs d'un lien `userMenu` gardés comme proposés (à revoir avec le premier consommateur).
- Prochaine étape : tester dans l'app ; reprise de `user` à la phase 0 bis.

## 2026-11-17 — Spécification de `user` (`feat/navigation`)

- Fait : premier essai du skill `migrate-module`. Fiche [user.md](user.md) : inventaire de `framework/modules/user` (écrans, consommateurs, dépendances), comportements à conserver, cible, plan par phases. Override `dev/default` appliqué par le skill. Aucun code modifié.
- Décidé (utilisateur) : écrans des notifications push hors périmètre (repris par `notifications`, supprimés au nettoyage) ; points d'entrée des modules regroupés dans `entries` (`myApps` ex-`entry`, `tab`, `userMenu` = tableau de liens dans l'accueil de `user`, `create` plus tard), `route` obligatoire et sans params ; emplacement `src/modules/user` ; store Redux des profils ; clé `fileManager` dans `ModuleConfig` ; alerte « heures calmes » portée ; « Envoyer un message » masqué ; `debug` et `splashads` migrés d'abord ; `birthdate` en `Temporal`.
- Vérifié : base tsc 776 erreurs (39 dans `modules/user`), eslint 2 090 erreurs / 88 warnings, 428 tests.
- En suspens : validation du plan ; champs d'un lien `userMenu` à confirmer en phase 0.
- Prochaine étape : phase 0 (`entries`, `fileManager`) après accord sur le plan.
- Ensuite (utilisateur) : skill `migrate-module` mis à jour avec les décisions de ce plan : `entries` et `fileManager` (inventaire, signaux de `framework.md`, phase 3), module déjà commencé dans `src/modules/` → on continue là, phase « 0 bis » pour les modules à migrer d'abord, nettoyage du code orphelin et hors périmètre, questions de forme quand une réponse ouvre une évolution du framework, valeurs renvoyées par params → store, `Temporal` recommandé.
- Retours (utilisateur) sur le skill : l'emplacement du module est **toujours demandé** (pas de règle « on continue dans `src/modules/` ») ; migrer d'abord un autre module est **toujours demandé**, et s'il est gros, le skill propose d'arrêter la migration en cours pour faire le préalable d'abord.
- Relecture (utilisateur) : store des profils de `user` en **zustand** (`createSessionStore`) au lieu de Redux (fiche §4 n°4, §5, §7) ; plus de clé `redux` dans la config de `user`.

## 2026-11-16 — Skill `migrate-module` (`feat/navigation`)

- Fait : skill `.claude/skills/migrate-module/` (lancé à la main) : préparation, inventaire du module, état des dépendances transverses, fiche + plan par phases, exécution phase par phase avec relecture. Registre des modules de référence (`myapps`, `auth`), enrichi à la main après relecture. Mention dans [README.md](README.md). Aucun code modifié.
- Décidé (utilisateur) : un module migré reste dans `src/framework/modules/` sauf réécriture quasi complète ; le développeur prend les décisions, le skill propose.
- En suspens : skill pas encore essayé sur un module.
- Prochaine étape : premier essai sur un module (relecture du skill au passage).

## 2026-11-11 — Détails de `GET /api/me/applications` (`feat/ia/vmou`)

- Décidé (utilisateur) : on ne change rien, comme le client web (détection des bibliothèques par l'adresse, `libraries` et `isExternal` ignorés, pas de repli sur les anciennes routes).
- Fait : sujet retiré de [later.md](later.md) ; [myapps.md](myapps.md) mis à jour (§3.1, §5.3, décisions, §9). Aucun changement de code.
- Ensuite (utilisateur) : les 3 commentaires qui renvoyaient à ce sujet de `later.md` disent maintenant que c'est voulu, comme le client web (`model/classification.ts`, dont le `ToDo(myapps-migration)` retiré ; `service/api.ts` : `isExternal`, `libraries`). Aucun changement de comportement.

## 2026-11-11 — Recherche de `MyAppsFilters` (`feat/ia/vmou`)

- Décidé (utilisateur) : pas de barre de recherche native du header ; la recherche de `MyAppsFilters` reste telle quelle, elle suit le design fourni. Aucun changement de code.
- Fait : sujet retiré de [later.md](later.md) ; [myapps.md](myapps.md) §4 n° 13 et décisions mis à jour.

## 2026-11-10 — Clé i18n du libellé d'un onglet (`feat/ia/vmou`)

- Décidé (utilisateur) : `tab.labelI18n` facultatif ; ordre : sa traduction, sinon `appName` de l'app du module (`myapps`), sinon `name` ; règle isolée dans une fonction.
- Fait : `ConfigForTab.labelI18n`, `getTabLabel` (dans `src/app/navigation-new/tabs.tsx`, à la demande de l'utilisateur ; sans test, Jest ne chargeant pas `tabs.tsx`), utilisé par `TabLabel` et l'ancienne `main-navigation`. Doc : ARCHITECTURE §2.3, §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767, eslint propre, `yarn test` 411/411. **Pas testé dans l'app.**

## 2026-11-10 — Libellés des apps et des onglets : `appName` (`feat/ia/vmou`)

- Décidé (utilisateur) : afficher uniquement `appName` (traduit par le serveur selon `Accept-Language`), tabBar comprise ; plus de traductions locales ni de règles de correspondance. Le changement de langue redémarre l'app (`sessionSetup` relancé) ; cas ajouté dans [later.md](later.md).
- Fait : `EntApp.label` = `appName` ; `getAppLabel`, `getModuleLabel`, `Translate` et la plomberie `translate` supprimés ; libellé d'un onglet = celui de son app, sinon le nom du module. Sujet « Libellés de tous les onglets » retiré de `later.md`. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767, eslint propre, `yarn test` 411/411 (7 tests des règles supprimées retirés). **Pas testé dans l'app.**

## 2026-11-10 — Libellé de l'onglet `myapps` (`feat/ia/vmou`)

- Décidé (utilisateur) : `matchEntcoreApp: 'Portal'` sur `myapps` (droit universel, toujours renvoyé par le serveur) ; sujet retiré de [later.md](later.md).
- Fait : `hasRight: () => true` retiré ; `getModuleLabel` normalise les noms pour la clé i18n (`myapps-app-portal`), alias supprimé. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-10 — `myapps` phase 7 : nettoyage (`feat/ia/vmou`)

- Fait : suppression de `src/framework/modules/myapps` (plus aucun import extérieur) et de la modale `ModalsRouteNames.FavoritesManagement` de l'ancienne navigation. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767 (−10, code ancien supprimé), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : tester `myapps` (phases 4 à 6) dans l'app ; module suivant selon STATUS (`user`).

## 2026-11-10 — « Scroll to top » sur appui du header (iOS 27) (`feat/ia/vmou`)

- Constaté : depuis iOS 27 sur iPhone (iPadOS 26), UIKit remonte le contenu de l'écran quand on appuie sur la barre de navigation (titre, zone vide : voulu par Apple). Les items natifs consomment l'appui, pas les vues React du header (pas de gesture recognizer) : appuyer sur un bouton `custom` remontait la liste. Indépendant de la liste (ScrollView, FlatList, FlashList). Problème connu : facebook/react-native#56061.
- Fait : `ScrollToTopGuard` (`react-native-screens/experimental`) autour des éléments React des items iOS du header (`navigation-new/header/index.tsx` : `headerCustom` et boutons à icône SVG). Son natif n'est compilé qu'avec le projet « gamma » de react-native-screens : le patch de react-native-screens compile maintenant `ios/gamma/scroll-to-top-guard/` seul (podspec) et retire son stub (`RNSGammaStubs`). `pod install` fait ; build iOS Debug réussi. `scrollsToTop` laissé par défaut (appui sur la barre d'état et le titre conservés).
- Remarque : `patch-package` ne sait pas régénérer le patch avec yarn berry (`--ignore-scripts` refusé) : les diffs ont été ajoutés à la main au fichier de patch (vérifié par `git apply --check -R`).
- **Pas testé dans l'app** (test par l'utilisateur) : sur iOS 27, un appui sur un bouton du header ne doit plus remonter la liste, un appui sur le titre ou la barre d'état si.

## 2026-11-10 — `myapps` phase 6 : ouvrir une app (`feat/ia/vmou`)

- Fait : `useOpenApp()` (module ouvrable, sinon `openUrl(getAppUrl(…))`), appelé par `MyAppsHomeScreen` ; `getAppModules` ne garde que les modules dotés d'une `entry` (carte cohérente avec l'ouverture). Détail : §9 de [myapps.md](myapps.md).
- Constaté : aucun module nouveau n'a de `matchEntcoreApp`, donc toutes les apps s'ouvrent dans le navigateur pour l'instant.
- Vérifié : tsc 776, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : tester les phases 4 à 6, puis phase 7 (nettoyage).

## 2026-11-10 — Items du header complets (`feat/ia/vmou`)

- Décidé (utilisateur) : items de react-navigation (`unstable_header*Items`) comme contrainte, les quatre types (button, menu, spacing, custom) ; champs communs aux deux plateformes, ceux d'iOS dans `ios` ; `testID` obligatoire sur chaque action et chaque entrée de menu ; icône SVG (rendue en React) ou paire `{ ios, android }` (natif sur iOS) ; espacement fixe `spacing.minor` ; helpers `headerAction()`, `headerMenu()`, `headerSpacing()`, `headerCustom()` (+ `menuAction()`, `menuSubmenu()` pour les entrées).
- Fait : `src/app/navigation-new/header/` (`types.ts`, `items.ts`, `menu.ts` + test, `components.tsx`, `index.tsx`) ; menus Android (et iOS avec icône SVG) par `MenuView` de `@react-native-menu/menu`, entrée identifiée par son `testID`. Appelants : `myapps` (accueil en `headerCustom`, favoris : bouton natif `checkmark` / `ui-check`), `amodule` (avatar + vitrine des quatre types). Doc : ARCHITECTURE §3.2, CONVENTIONS.
- Constaté : native-stack inverse lui-même l'ordre des items de droite pour iOS (rien à faire) ; react-native-screens ne donne pas d'identifiant aux entrées d'un menu natif iOS (`identifier:nil`) : leur `testID` y est sans effet (suivi possible : étendre le patch).
- Vérifié : tsc 776, eslint propre, `yarn test` 418/418 (4 nouveaux). **Pas testé dans l'app** : vitrine d'`amodule` à vérifier sur iOS et Android.
- Ensuite (utilisateur) : `headerRightActions` liste ses items **de droite à gauche** (le premier au bord de l'écran, comme `rightBarButtonItems` d'UIKit) ; `headerLeftActions` de gauche à droite. Appelants remis dans cet ordre (`myapps` : menu au bord, comme l'ancien écran).
- Ensuite : bouton texte seul sur Android (marge de 12dp, une ligne, ripple sur tout le bouton) ; « Modifier » dans la vitrine d'`amodule`.
- Ensuite (utilisateur) : header du carrousel de `media` (`screens/carousel/navbar.tsx`) passé aux items : menu natif « options » (entrée « partager », `ellipsis` / `ui-options`) au bord, puis « télécharger » (`arrow.down.to.line` / `ui-download`), natifs sur iOS. `PopupMenu` et l'ancien `headerAction` n'y servent plus. `media-navbar-share` est maintenant le `testID` de l'entrée du menu (avant : l'enveloppe du bouton) ; le menu s'ouvre par `media-navbar-options`. Libellé du menu pour les lecteurs d'écran : « Partager » faute de traduction de « options » (`ToDo(media)`). L'ancien carrousel (`framework/components/carousel`, ancienne navigation) n'est pas touché. tsc 776, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-09 — Boutons du header dans `navigation-new` (`feat/ia/vmou`)

- Fait : `src/app/navigation-new/header.tsx` : `headerLeftActions(...actions)` / `headerRightActions(...actions)` donnent les champs d'un côté pour les deux plateformes (Android `headerLeft` / `headerRight` en ligne, boutons de 48dp avec le ripple natif ; iOS un item `custom` par action). Une action = objet (`icon` : `SvgIconName` ou élément, `accessibilityLabel`, `testID`, `onPress`, `disabled`) ou fonction qui rend un composant à hooks affichant un `HeaderActionButton`. Règles reprises d'`amodule` et de `modalCloseButtonOptions`. Utilisé par `myapps` (accueil, favoris) et `amodule`. Doc : ARCHITECTURE §3.2, CONVENTIONS (conversions d'UI).
- Choix : bouton désactivé à demi-opacité ; marge de `spacing.minor` entre les boutons et le titre sur Android (comme la croix des modales).
- En suspens : `media/screens/carousel/navbar.tsx` utilise encore `headerAction` (bouton enveloppé dans un `PopupMenu`) ; libellés d'accessibilité des boutons onboarding / menu de `myapps` sans traduction (`ToDo(myapps-migration)`).
- Vérifié : tsc 776, eslint propre, `yarn test` 414/414. **Pas testé dans l'app.**

## 2026-11-09 — `myapps` phase 5 : modales (`feat/ia/vmou`)

- Décidé (utilisateur) : le filtre de `myapps/home` devient un param (`{ filter? }`) pour que le bouton du menu le connaisse (le menu se réduit sur le filtre Favoris, comme l'ancien).
- Fait : `myapps/menu`, `myapps/app-actions` (`formSheet`), `myapps/favorites` (`defineModal`, `useConfirmRemove`), `myapps/onboarding` (`transparentModal`) ; `MyAppsMenuItem` ; onboarding automatique par le state de session ; boutons du header et appui long branchés ; §4 n° 4-9 et 11 faits ; `hasHelpUrl` supprimé. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 776, eslint propre, `yarn test` 414/414. **Pas testé dans l'app** (points à vérifier listés au §9).
- Prochaine étape : tester les phases 4 et 5 dans l'app, puis phase 6 (ouvrir une app).

## 2026-11-09 — Requêtes signées typées par les scopes d'un module (`feat/ia/vmou`)

- Décidé (utilisateur) : factory `getModuleTransport('<module>')` (« transport » plutôt que « fetch » : elle donne aussi les consommateurs d'API ; pas un hook : types seulement, appelable dans les services, thunks et hooks de session) ; opt-in, les appels existants ne changent pas ; les API dont le chemin ne commence pas par leur scope (`/api/me/applications`, sous `portal`) restent sur les fonctions du transport.
- Fait : paramètre de type `Scope` (7e, défaut `never`) sur `Module` / `CoreModule` / `EntModule` et leurs configs, `scope?: readonly Scope[]`, `ModuleScope<T>` ; `src/framework/util/transport/module-transport.ts` (`getModuleTransport`, `ModuleTransport`, `ScopedPath`) ; utilisé pour les préférences de `myapps`. Doc : ARCHITECTURE §2.3, CONVENTIONS « Données et état ».
- Vérifié : tsc 776 (aucune nouvelle erreur, pas de circularité de types), eslint propre, `yarn test` 414/414 (tests de types par `@ts-expect-error` dans `module-transport.test.ts`).
- En suspens : les sources d'images signées (`Image` de `media`) ne sont pas couvertes.
- Ensuite : module `auth` passé sur `getModuleTransport('auth')` (tous ses `tokenFetch` : `service/validation.ts`, `requirements.ts`, `userinfo.ts`, `token.ts`, chemins sous `auth`, `directory`, `userbook`). Ses `platformFetch` (non signés) ne changent pas. tsc 776, eslint propre, `yarn test` 414/414. **Pas testé dans l'app.**
- Ensuite : scope `portal` retiré d'`auth` (aucune requête d'auth dessous ; `myapps` le déclare, le jeton ne change pas). `infra` reste : seul module à le déclarer, utilisé par le tracker (`/infra/event/mobile/store`). `userinfo` : peut-être exigé par `/auth/oauth2/userinfo`, à tester avant de le retirer.

## 2026-11-07 — Rozenite : stores dans React Native DevTools (`feat/ia/vmou`)

- Fait : `@rozenite/metro` (Metro enveloppé par `withRozenite`, actif avec `WITH_ROZENITE=true`, script `yarn start:rozenite`), `@rozenite/redux-devtools-plugin` (enhancer en `__DEV__` dans `src/app/store`), `rozenite-zustand-devtools` (stores zustand listés dans `src/app/debug/devtools.ts`, hook dans `App`). Doc : ARCHITECTURE §6 bis.
- Vérifié : bundle iOS de dev avec Rozenite (2 plugins chargés), tsc 776, `yarn test` 413/413. **Pas testé dans les DevTools.**
- Ensuite : plugins React Navigation (`navigation-new/index.tsx`), Storage (MMKV de l'app, clés de secrets masquées), File System (`react-native-fs`) et Require Profiler (Metro + hook) ; hooks regroupés dans `useRozeniteDevTools` (`src/app/debug/devtools.ts`). Bundle de dev : 6 plugins chargés. Doc : ARCHITECTURE §6 bis.

## 2026-11-07 — `myapps` : suites de la revue du modèle (`feat/ia/vmou`)

- Décidé (utilisateur) : ouverture = module ouvrable sinon `/auth/redirect` (plus de distinction `web` / `connector`) ; `applications` transmis sans vérification ; modules typés `AllModulesNames` ; `EntApp.icon` et `User-Agent` gardés tels quels (on évite de transformer les données du serveur) ; `EMPTY_PREFERENCES` et palette du thème : pas de problème ; état « en cours » : hors périmètre.
- Fait : `ListedApp.hasModule` ; `toListedApps` + `filterApps` / `hasAppsToList` ; suppression de `AppOpeningStrategy`, `getAppOpeningStrategy`, `EntApp.isConnector`, `AppModule`. Détail : §8 et §9 de [myapps.md](myapps.md).
- Vérifié : tsc 776, eslint propre, `yarn test` 411/411. **Pas testé dans l'app.**
- Ensuite (utilisateur) : plus de signature manuelle de l'icône du workspace (`Image` signe) ; `getAppUrl` : pas de `/auth/redirect` pour une adresse de la plateforme.
- Prochaine étape : phase 5 (modales).

## 2026-11-07 — `myapps` : relecture de la phase 4 (`feat/ia/vmou`)

- Décidé : hooks d'un composant dans `hooks.ts` ; favoris dans l'ordre des préférences ; `ListedApp.opening` au lieu de `module` ; tablette hors sujet (`CLAUDE.md` créé).
- Fait : corrections de la revue (icônes en URL, séparateur FlashList 2, query des images, pictogramme web, accessibilité, clavier, mémoïsation, code mort). Détail : §9 de [myapps.md](myapps.md). Revue du modèle : 8 points fragiles en §8, à discuter.
- Vérifié : tsc 776, eslint propre, `yarn test` 423/423. **Pas testé dans l'app.**
- Prochaine étape : discuter les points du modèle (§8), puis phase 5.

## 2026-11-07 — `myapps` phase 4 : `MyAppsHomeScreen` (`feat/ia/vmou`)

- Fait : `src/modules/myapps/screens/home/` (écran + boutons du header en composants, options statiques) ; `components/` (`MyAppsList`, `MyAppsCard`, `MyAppsFilters`, `MyAppsFilterCell`, portés tels quels, anciens `testID` conservés) ; `filterApps` renvoie des `ListedApp` ; `hasAppsToList` / `useHasAppsToList`. Détail : §9 de [myapps.md](myapps.md).
- Choix d'implémentation : `useScrollToTop` ; recherche fermée à la perte de focus ; focus de la recherche sans délai (à vérifier).
- En suspens (`ToDo(myapps-migration)`) : appui sur une app (phase 6), appui long et boutons du header (phase 5).
- Vérifié : tsc 776 (aucune nouvelle), eslint propre, `yarn test` 422/422. **Pas testé dans l'app.**
- Prochaine étape : phase 5 (modales).

## 2026-11-07 — Contrainte pour `timeline` : notifications à part (`feat/ia/vmou`)

- Décidé : les notifications sortent de `timeline` dans le module `notifications`, consommé par `timeline` et par le futur module `home` (développé par ailleurs), qui ont tous deux un fil de notifications.
- Fait : fiche [timeline.md](timeline.md) (contrainte, §5.1) ; question d'architecture n° 1 de [STATUS.md](STATUS.md) complétée.
- Prochaine étape : phase 4 de `myapps`.

## 2026-11-06 — Icônes typées, puis annulé (`feat/ia/vmou`)

- Décidé : une icône `Svg` est typée `SvgIconName`. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `EntAppDisplay.icon`, `DEFAULT_APP_ICON`, surcharges d'icônes de `myapps` et des notifications ; `getAppSvgIcon` (via `svgExists`) ; `media/resource-display` et `communities` sans cast.
- Constaté : `EntApp.icon` n'est pas toujours un `Svg` (image du workspace, URL : ancien `resolveAppIcon`) ; il reste une référence `string`, à traiter avec `MyAppsCard` en phase 4. Le modèle ne peut pas vérifier les noms (`svgExists`) : la liste des SVG ne se charge pas sous Jest (imports ESM) ; la vérification est dans les hooks.
- Vérifié : tsc 775 (aucune nouvelle), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- **Annulé** à la demande de l'utilisateur (le typage venait d'une erreur de sa part) : icônes de nouveau en `string`, règle « Icônes » retirée de CONVENTIONS. Au passage, `community-card-small` utilise `useModuleAppDisplay('communities')` (on est dans ce module) : tsc 776, erreur voulue.

## 2026-11-06 — `EntAppImage` et `ModuleImage` (`feat/ia/vmou`)

- Décidé : un composant par source du nom : `EntAppImage` (nom d'app ENT venu du serveur, `useEntAppDisplay`) et `ModuleImage` par-dessus (module connu du code, `AllModulesNames`). Règle « app ENT ou module » dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `src/framework/components/picture/ent-app-image/` (corps de l'ancien `ModuleImage`, styles déplacés) ; `module-image` réduit à `EntAppImage` + `useModuleAppName` (exporté par les hooks de `myapps`).
- Vérifié : tsc 775 (aucune nouvelle ; les 2 erreurs préexistantes du rendu de remplacement ont suivi le code), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-06 — Noms de modules typés (`feat/ia/vmou`)

- Décidé (utilisateur) : `useModuleAppDisplay`, `useModuleApp` et `useModuleAppName` n'acceptent qu'un `AllModulesNames` ; `ModuleWithRights` prend `Pick<AnyModule, 'name'>`. On ne doit pouvoir obtenir qu'un module qui existe. Dans les tests, les noms de modules restent fictifs (les modules de test `amodule`… disparaîtront) : on surcharge les types.
- Fait : `useModuleApp` / `useModuleAppName` typés ; `src/app/module/rights.test.ts` surcharge le type de `isModuleAvailableForUser` (nom quelconque).
- `ModuleImage` (`src/framework/components/picture/module-image`) prend une prop `moduleName: AllModulesNames` (ex-`appName: string`) ; ses appelants `wiki` passent `moduleName`.
- Conséquence : tsc 775 au lieu de 768. Erreurs **voulues** : 7 appels avec un module non migré (5 de `useModuleAppDisplay`, 2 de `ModuleImage` dans `wiki`), corrigés au fil des migrations. Ne pas les traiter comme des régressions.

## 2026-11-06 — Types rangés dans les fichiers de types (`feat/ia/vmou`)

- Décidé : un type utile à plusieurs fichiers va dans le fichier de types de son dossier (`types.ts`, `model/index.ts`…) ; un type interne reste dans son fichier, non exporté, voire sans nom. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `src/app/module/types.ts` (`ModulesMap`) ; `src/modules/myapps/model/index.ts` (`Translate`, `AppConfig`, `MyAppsFilter`) ; `src/modules/myapps/hooks/types.ts` (`MyAppsDispatch`, `EntAppDisplay`). Restés locaux : `LoadedModules`, `ModuleWithRights`, `LabelSourceData`, `FilterAppsContext` ; dépendances de `createMyAppsSessionHooks` sans nom.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418.
- Ensuite : `ModulesMap` → `AllModulesMap` (comme `AllModulesArray`) ; l'ancien type objet `AllModulesMap` → `AllModulesByName`.
- Puis : la Map devient un objet typé `AllModulesByName` (`useModulesByName()`, ex-`useModulesMap()` ; `getModuleByName` pour un nom quelconque) ; le type `AllModulesMap` est supprimé.
- Enfin : `AllModulesByName` → `AllModulesRecord`, `useModulesByName` → `useModulesRecord`. Le tableau des modules du contexte est en lecture seule (`Readonly<AllModulesArray>`, figé), comme `useModules()`.

## 2026-11-06 — Modules par nom en O(1) (`feat/ia/vmou`)

- Décidé : un module se lit par son nom dans une Map, pas par `modules.find(…)`. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `ModuleContext` (`src/app/module/loader.tsx`) contient `{ modules, byName }`, construits une fois ; `useModulesMap()`, `useModule(name)` ; utilisés par `useModuleAppName` (`myapps`) et `src/app/navigation-new/open-module.ts`.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — `myapps` : `useTabLabel` supprimé (`feat/ia/vmou`)

- Décidé : `useTabLabel` redondant avec `useModuleAppDisplay` (même libellé, écrit avant lui) : supprimé.
- Fait : `TabLabel` (`src/app/navigation-new/tabs.tsx`) lit `useModuleAppDisplay(module.name).label`.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — Couleurs de la palette typées (`feat/ia/vmou`)

- Décidé : un nom de couleur de la palette est typé `ThemeColorName` (`keyof palette.complementary` + `primary` / `secondary`), pas `string`. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `src/app/theme.ts` (`ThemeColorName`, `isThemeColorName`, `getThemeColorShades`) ; `myapps` (`EntApp.color`, `getAppColor` qui écarte une couleur inconnue, `getAppShades`) ; surcharges de `src/modules/notifications/hooks.ts`.
- Vérifié : tsc 768 (aucune nouvelle), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — `myapps` : relecture de la phase 3 (`feat/ia/vmou`)

- Décidé : `useEntAppDisplay(entAppName)` / `useModuleAppDisplay(moduleName)` → `{ colors: IShades, icon, label }`, couleurs **primaires** par défaut, au lieu de `useAppTheme` / `useAppBadge` ; un badge est un objet construit par l'appelant ; `useNotificationEntApp` (+ `useNotificationEntAppDisplay`) dans le module `notifications` ; `selectAggregatedApps` gardé seulement pour l'ancien code de `framework/modules/myapps` jusqu'à la phase 7.
- Fait : `src/modules/myapps/hooks/display.ts`, `src/modules/notifications/hooks.ts` ; consommateurs migrés (`module-image`, `blog`, `homework`, `news`, `communities` ×3, `timeline/notification-top-info`, `main-navigation`) ; façades `use-app-theme.ts`, `use-app-badge.ts` supprimées.
- Vérifié : tsc 768 (aucune nouvelle), eslint propre sur le nouveau code, `yarn test` 417/417. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 4 (écran).

## 2026-11-06 — `myapps` phase 3 : API publique (`feat/ia/vmou`)

- Fait : hooks `src/modules/myapps/hooks/` (`useEntApps`, `useEntApp`, `useAppModules`, `useModuleApp`, `useTabLabel`, `useFavorites`, `useShowAllApps`, `useFilteredApps`, `useAppTheme`, `useAppBadge`) ; règles `getModuleLabel`, `getAppModules` ; libellés des onglets dans `src/app/navigation-new/tabs.tsx` ; façades `@deprecated` de `framework/modules/myapps` (hooks et sélecteurs) réécrites sur le nouveau state ; `media/hooks/resource-display.ts` lit `useEntApp`. Détail : §9 de [myapps.md](myapps.md).
- Gardé tel quel : thème par défaut = les gris de l'ancien module (pas des nuances, `ToDo(myapps-migration)`) ; recherche par nom de module limitée aux modules chargés (les modules non migrés gardent le thème par défaut, comme avant).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 417/417. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 4 (écran).

## 2026-11-06 — `myapps` phase 2 : chargement (`feat/ia/vmou`)

- Fait : `src/modules/myapps/session.ts` (`createMyAppsSessionHooks`) : `sessionSetup` charge les apps (bloquant, écrit au `commit`), `onSessionStart` les préférences (échec → `status: 'error'`, rien d'écrit après la fin de la session). Branché dans `index.ts` (`getStore().dispatch`, `I18n.get`). `ToDo` retiré de `src/modules/auth/flows/start-session.ts`. Règle `session.ts` ajoutée à [CONVENTIONS.md](../CONVENTIONS.md) (choix de Claude, à valider).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 413/413. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : tester la connexion dans l'app (state `myapps` dans Reactotron), puis phase 3.

## 2026-11-06 — `myapps` : relecture de la phase 1 bis (`feat/ia/vmou`)

- Décidé : règles du modèle regroupées par objectif (`model/display.ts`, `opening.ts`, `classification.ts`, `favorites.ts`, `onboarding.ts`) au lieu de `model/rules/` ; `filterApps` dans le modèle (`classification.ts`) ; `use-cases.ts` remplacé par `actions.ts` (actions de l'utilisateur : les thunks y passent) ; `store/actions.ts` → `store/action-creators.ts` (types d'actions et action creators Redux seuls). Règles générales mises à jour dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : code et tests réorganisés en conséquence (aucun changement de comportement).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 408/408 (83 pour `myapps`). **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 2 (chargement).

## 2026-11-06 — `myapps` phase 1 bis : code conforme à la conception (`feat/ia/vmou`)

- Fait : `model/` (types seuls) + `model/rules/` (un fichier par règle, avec tests ; `business.ts` supprimé) ; `service/api.ts` (`namespace API`), `service/adapter.ts` (hydratation `toEntApps`, `toPreferences` / `fromPreferences`) ; store `apps` + `preferences.favorites`, `refreshMyApps({ translate })` ; `filterApps(apps, filter, { favorites, getModule, showAllApps })` avec filtre `display` et tri. Framework : `isModuleAvailableForUser`, `useUserAvailableModules`. Détail : §9 de [myapps.md](myapps.md).
- Corrigé : les apps `display: false` sont gardées (elles étaient filtrées à la réception).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre (hors erreur préexistante de `loader.tsx`), `yarn test` 408/408 (83 pour `myapps`). **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 2 (chargement).

## 2026-11-06 — `myapps` : conception des données revue (`feat/ia/vmou`)

- Fait : conception consolidée avec l'utilisateur et écrite dans [myapps.md](myapps.md) (§5.2 à §5.7, décisions §7, phase 1 bis en §6). Règles générales ajoutées à [CONVENTIONS.md](../CONVENTIONS.md) (règles arbitraires mises en valeur, `namespace API` dans `service/`, service qui hydrate, ce qui va dans le state). Sujet transverse « changement de langue sans redémarrage » et `isExternal` ajoutés à [later.md](later.md). **Aucun code modifié.**
- Décidé : `EntApp` hydraté par le service et stocké ; réponse `API.EntAppResponse` ; ni favoris ni module dans l'app (combinés à la lecture) ; `AppOpeningStrategy` / `getAppOpeningStrategy` au lieu de séparer apps et connecteurs ; toutes les apps stockées, `display` gardé et filtré à l'affichage ; `model/rules/`, un fichier par règle ; `favorites` partout sauf dans l'API ; `isModuleAvailableForUser`, `useUserAvailableModules` ; langue : rien pour l'instant.
- Constaté : le code actuel filtre sur `display` à la réception (`buildUserApps`), contrairement à l'ancien agrégat.
- En suspens : la phase 1 n'est toujours pas commitée.
- Prochaine étape : phase 1 bis (reprise du code de la phase 1), puis phase 2.

## 2026-11-06 — `myapps` phase 1 : structure revue (`feat/ia/vmou`)

- Demandé à la relecture : `business.ts` mélangeait règles, utilitaires et use-cases ; `MyApp` mal nommé ; le modèle contenait le type du state Redux.
- Fait : `model/business.ts` ne garde que les règles ; `use-cases.ts` (`buildUserApps`, ex-`aggregateApps`, `filterApps` + `MyAppsFilter`) ; `util.ts` (`normalizeString`, `toKebabCase`, `getAppTestID`) ; `service/adapter.ts` (`parsePreferences`) ; `reducer/` → `store/` avec `state.ts` (`MyAppsState`) ; format stocké de l'onboarding dans `storage.ts` (la règle prend la version vue) ; `MyApp` → `UserApp`. Règle générale « Structure d'un module » ajoutée à [CONVENTIONS.md](../CONVENTIONS.md).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 398/398.
- En suspens : le nom `UserApp` est mon choix (la question a été interrompue) : à confirmer. (Remplacé par `EntApp` le 2026-11-06, entrée ci-dessus.)
- Prochaine étape : phase 2 (chargement).

## 2026-11-04 — `myapps` phase 1 : modèle, service, reducer, storage (`feat/ia/vmou`)

- Fait : `src/modules/myapps/` passe en `EntModule` avec `model/` (types + règles pures, 59 tests), `service/` (`/api/me/applications`, préférences), `reducer/` (Redux, `createSessionReducer`, thunks `refreshMyApps` / `toggleFavorite` / `saveFavorites`, 9 tests), `storage.ts` (déplacé, l'ancien devient façade). Supprimés : `store.ts`, l'ancien `service.ts`. Détail et écarts volontaires : §9 de [myapps.md](myapps.md).
- Hors module : `configureStore` sans `preloadedState` ; reducers de modules à typer sur toute action (règle dans [CONVENTIONS.md](../CONVENTIONS.md)) ; anciens sélecteurs `myapps` protégés contre le nouveau state (sinon `media/resource-display.ts` plantait).
- Vérifié : tsc sans nouvelle erreur (769 contre 776 avant la phase 0), eslint propre, `yarn test` 393/393. **Pas testé dans l'app.**
- Prochaine étape : phase 2 (chargement).

## 2026-11-04 — `myapps` phase 0 : droits, `entry`, `useOpenModule` (`feat/ia/vmou`)

- Fait : `isModuleAvailable` (`src/app/module/rights.ts`, 14 tests) et `useAvailableModules` ; onglets masqués par un `if` par écran d'onglet (navigation toujours statique) ; clé `entry?` sur `ModuleConfig` (écran sans params obligatoires, vérifié par le type), `tab.route` facultatif qui en hérite ; `useOpenModule` / `useCanOpenModule` (`src/app/navigation-new/open-module.ts`), nom typé sur les modules qui ont une `entry` ; `myapps` déclare `entry: 'myapps/home'`. Doc : ARCHITECTURE §2 et §3.2.
- Vérifié : tsc sans nouvelle erreur (776 avant / après, les mêmes), eslint propre sur les fichiers touchés, `yarn test` 325/325. **Pas testé dans l'app** (simulateur).
- Choix d'implémentation : sans session, `useAvailableModules` ne renvoie rien, mais les onglets ne sont pas filtrés (évite un navigateur d'onglets vide pendant la déconnexion) ; `useOpenModule` ne marche que depuis un écran des onglets.
- Prochaine étape : `myapps` phase 1.

## 2026-11-04 — Spec `myapps` validée (`feat/ia/vmou`)

- Décidé : `useOpenModule` (+ `canOpenModule`) devient l'API publique du framework pour ouvrir un module (§5.6 de [myapps.md](myapps.md)). Pas de retour forcé à `entry` pour un onglet déjà ouvert : le fonctionnel ne permet pas ce cas.
- Reporté ([later.md](later.md)) : bibliothèques, langue d'`appName`, disponibilité de `GET /api/me/applications`. En attendant : comportement actuel.
- Prochaine étape : `myapps` phase 0 (`isModuleAvailable`, `entry`, `useOpenModule`).

## 2026-11-04 — Questions `myapps` tranchées (`feat/ia/vmou`)

- Décidé : route d'entrée = clé `entry` **facultative** sur la config de module, dont `tab.route` hérite (pas l'inverse) ; favoris « après succès » partout ; libellés d'onglets (`myapps` par l'i18n, les autres par `useTabLabel`) acceptés mais à revoir ; recherche native du header plus tard.
- Reçu : la forme de `GET /api/me/applications` (intégrée en §5.3 de [myapps.md](myapps.md)) : `libraries` devient booléen, nouveau champ `appName` (libellé traduit).
- Créé : [later.md](later.md), qui reprend les sujets reportés de STATUS et ajoute les « décisions à revoir ».
- En suspens : `useOpenModule` comme API publique du framework (avis favorable, conditions en §8 Q1) ; bibliothèques, langue d'`appName`, disponibilité de l'API sur toutes les plateformes (§8 Q2).
- Prochaine étape : valider ces points, puis phase 0.

## 2026-11-04 — Conventions + spec `myapps` v2 (`feat/ia/vmou`)

- Fait : [CONVENTIONS.md](../CONVENTIONS.md) (règles pour toute la migration) ; [myapps.md](myapps.md) réécrite (v2).
- Décidé (règles générales) : bottom sheet `@gorhom/bottom-sheet` → écran `formSheet` (exemple `src/modules/auth/screens/switch-account.tsx`) ; `react-native-modal` → écran `transparentModal` ; signaler les cas où react-navigation ferait mieux ; ne pas traduire les noms de composants.
- Décidé (`myapps`) : Redux conservé ; `GET /api/me/applications` remplace `/applications-list` + `/myApps/config`, préférences à part ; apps en `sessionSetup` **bloquant**, préférences en `onSessionStart` ; plus de `buildAppLookupMap` / `AllModules()` (hooks de module) ; stockage par le framework de storage et ses hooks, clés inchangées ; `isModuleAvailable` en phase 0 ; `EntModule` + `hasRight: () => true` ; ordre d'onglet 40 ; onboarding corrigé (version, une fois par session) ; délais supprimés à l'essai.
- En suspens : forme de `GET /api/me/applications` (absente du repo) ; route d'entrée d'un module (explication + 3 propositions, recommandation : clé `entry`) ; autres questions en §8 de la fiche.
- Prochaine étape : obtenir la réponse de l'API, trancher la route d'entrée, puis phase 0.

## 2026-11-04 — Revue du suivi par l'utilisateur (`feat/ia/vmou`)

- Décidé :
  - **reportés** : notifications (ouverture, redirection), intents, modal / FormSheet « as promise ». Ils ont leur propre section dans [STATUS.md](STATUS.md) ;
  - `framework/util/media-deprecated` sera supprimé entièrement, au profit de `src/modules/media` ;
  - la série `docs-temp/auth/` est abandonnée ; la doc auth sera écrite dans `docs/` ;
  - le TODO du transport (refresh impossible → `logout`) devient une tâche indépendante ;
  - terminologie : « requirements », jamais « prérequis ».
- Corrigé : `audience` n'est **pas** migré (seule la partie issue de `auth` l'est) ; il passe dans les modules anciens.
- Ajouté : une section « Questions ouvertes » dans STATUS ; une section « Ancienneté de conception à corriger au passage » dans le gabarit et dans [myapps.md](myapps.md) (§4, dont un bug sur la version de l'onboarding). Dans `myapps`, les intents sont sortis du périmètre et ses questions passent en §8.
- Prochaine étape : trancher les questions d'architecture 2 et 3 de STATUS, et celles de [myapps.md](myapps.md) §8.

## 2026-11-04 — Mise en place du suivi + spec `myapps` (`feat/ia/vmou`)

- Fait : création de `docs/migrations/` (README avec protocole inter-sessions, STATUS, JOURNAL, gabarit) ; fiches `auth` et `media` reprises des notes des sessions d'octobre ; spécification de `myapps` (inventaire de l'ancien module, consommateurs, comportements à conserver, cible, plan en 8 phases).
- Constaté : l'app ne charge plus aucun module ancien (`AllModules()` renvoie `[]`) ; `useAppTheme` renvoie donc toujours le thème par défaut ; `src/modules/myapps/service.ts` ne compile pas ; `framework/modules/timeline/index.tsx` utilise une API `EntModule` obsolète ; la série `docs-temp/auth/` n'est pas dans ce checkout.
- Décidé : rien côté code. Organisation du suivi : voir [README.md](README.md).
- En suspens : les 6 questions ouvertes de [myapps.md](myapps.md) §7.
- Prochaine étape : trancher ces questions, puis phase 0 / 1 de `myapps`.

## 2026-10-29 — Migration `media` (reconstitué)

- Fait : module `src/modules/media` (carrousel, PDF, téléchargement, composants signés), façades `@deprecated`. Détail : [media.md](media.md).

## 2026-10-26 → 2026-10-27 — Modèle cible `auth` (reconstitué)

- Fait : champ `startup`, transport (`accountFetch`, refresh unique, annulation par session), cycle de session des modules (`sessionSetup`, `onSessionStart`, `onSessionRelease`), notifications par session, `createAuthFlows` / `useAuthFlows`. Détail : [auth.md](auth.md).

## Octobre 2026 — Migration `auth` phases 1 à 6 (reconstitué)

- Fait : stores zustand, sign-in, requirements, templates publics, façades `@deprecated`, tests Jest (stores, persistance, navigation du sign-in).
