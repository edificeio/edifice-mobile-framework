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

## 2026-11-06 — `myapps` phase 2 : chargement (`feat/ia/vmou`)

- Fait : `src/modules/myapps/session.ts` (`createMyAppsSessionHooks`) : `sessionSetup` charge les apps (bloquant, écrit au `commit`), `onSessionStart` les préférences (échec → `status: 'error'`, rien d'écrit après la fin de la session). Branché dans `index.ts` (`getStore().dispatch`, `I18n.get`). `ToDo` retiré de `src/modules/auth/flows/start-session.ts`. Règle `session.ts` ajoutée à [CONVENTIONS.md](CONVENTIONS.md) (choix de Claude, à valider).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 413/413. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : tester la connexion dans l'app (state `myapps` dans Reactotron), puis phase 3.

## 2026-11-06 — `myapps` : relecture de la phase 1 bis (`feat/ia/vmou`)

- Décidé : règles du modèle regroupées par objectif (`model/display.ts`, `opening.ts`, `classification.ts`, `favorites.ts`, `onboarding.ts`) au lieu de `model/rules/` ; `filterApps` dans le modèle (`classification.ts`) ; `use-cases.ts` remplacé par `actions.ts` (actions de l'utilisateur : les thunks y passent) ; `store/actions.ts` → `store/action-creators.ts` (types d'actions et action creators Redux seuls). Règles générales mises à jour dans [CONVENTIONS.md](CONVENTIONS.md).
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

- Fait : conception consolidée avec l'utilisateur et écrite dans [myapps.md](myapps.md) (§5.2 à §5.7, décisions §7, phase 1 bis en §6). Règles générales ajoutées à [CONVENTIONS.md](CONVENTIONS.md) (règles arbitraires mises en valeur, `namespace API` dans `service/`, service qui hydrate, ce qui va dans le state). Sujet transverse « changement de langue sans redémarrage » et `isExternal` ajoutés à [later.md](later.md). **Aucun code modifié.**
- Décidé : `EntApp` hydraté par le service et stocké ; réponse `API.EntAppResponse` ; ni favoris ni module dans l'app (combinés à la lecture) ; `AppOpeningStrategy` / `getAppOpeningStrategy` au lieu de séparer apps et connecteurs ; toutes les apps stockées, `display` gardé et filtré à l'affichage ; `model/rules/`, un fichier par règle ; `favorites` partout sauf dans l'API ; `isModuleAvailableForUser`, `useUserAvailableModules` ; langue : rien pour l'instant.
- Constaté : le code actuel filtre sur `display` à la réception (`buildUserApps`), contrairement à l'ancien agrégat.
- En suspens : la phase 1 n'est toujours pas commitée.
- Prochaine étape : phase 1 bis (reprise du code de la phase 1), puis phase 2.

## 2026-11-06 — `myapps` phase 1 : structure revue (`feat/ia/vmou`)

- Demandé à la relecture : `business.ts` mélangeait règles, utilitaires et use-cases ; `MyApp` mal nommé ; le modèle contenait le type du state Redux.
- Fait : `model/business.ts` ne garde que les règles ; `use-cases.ts` (`buildUserApps`, ex-`aggregateApps`, `filterApps` + `MyAppsFilter`) ; `util.ts` (`normalizeString`, `toKebabCase`, `getAppTestID`) ; `service/adapter.ts` (`parsePreferences`) ; `reducer/` → `store/` avec `state.ts` (`MyAppsState`) ; format stocké de l'onboarding dans `storage.ts` (la règle prend la version vue) ; `MyApp` → `UserApp`. Règle générale « Structure d'un module » ajoutée à [CONVENTIONS.md](CONVENTIONS.md).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 398/398.
- En suspens : le nom `UserApp` est mon choix (la question a été interrompue) : à confirmer. (Remplacé par `EntApp` le 2026-11-06, entrée ci-dessus.)
- Prochaine étape : phase 2 (chargement).

## 2026-11-04 — `myapps` phase 1 : modèle, service, reducer, storage (`feat/ia/vmou`)

- Fait : `src/modules/myapps/` passe en `EntModule` avec `model/` (types + règles pures, 59 tests), `service/` (`/api/me/applications`, préférences), `reducer/` (Redux, `createSessionReducer`, thunks `refreshMyApps` / `toggleFavorite` / `saveFavorites`, 9 tests), `storage.ts` (déplacé, l'ancien devient façade). Supprimés : `store.ts`, l'ancien `service.ts`. Détail et écarts volontaires : §9 de [myapps.md](myapps.md).
- Hors module : `configureStore` sans `preloadedState` ; reducers de modules à typer sur toute action (règle dans [CONVENTIONS.md](CONVENTIONS.md)) ; anciens sélecteurs `myapps` protégés contre le nouveau state (sinon `media/resource-display.ts` plantait).
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

- Fait : [CONVENTIONS.md](CONVENTIONS.md) (règles pour toute la migration) ; [myapps.md](myapps.md) réécrite (v2).
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
