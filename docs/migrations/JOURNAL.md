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

## 2026-11-06 — Icônes typées, puis annulé (`feat/ia/vmou`)

- Décidé : une icône `Svg` est typée `SvgIconName`. Règle dans [CONVENTIONS.md](CONVENTIONS.md).
- Fait : `EntAppDisplay.icon`, `DEFAULT_APP_ICON`, surcharges d'icônes de `myapps` et des notifications ; `getAppSvgIcon` (via `svgExists`) ; `media/resource-display` et `communities` sans cast.
- Constaté : `EntApp.icon` n'est pas toujours un `Svg` (image du workspace, URL : ancien `resolveAppIcon`) ; il reste une référence `string`, à traiter avec `MyAppsCard` en phase 4. Le modèle ne peut pas vérifier les noms (`svgExists`) : la liste des SVG ne se charge pas sous Jest (imports ESM) ; la vérification est dans les hooks.
- Vérifié : tsc 775 (aucune nouvelle), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- **Annulé** à la demande de l'utilisateur (le typage venait d'une erreur de sa part) : icônes de nouveau en `string`, règle « Icônes » retirée de CONVENTIONS. Au passage, `community-card-small` utilise `useModuleAppDisplay('communities')` (on est dans ce module) : tsc 776, erreur voulue.

## 2026-11-06 — `EntAppImage` et `ModuleImage` (`feat/ia/vmou`)

- Décidé : un composant par source du nom : `EntAppImage` (nom d'app ENT venu du serveur, `useEntAppDisplay`) et `ModuleImage` par-dessus (module connu du code, `AllModulesNames`). Règle « app ENT ou module » dans [CONVENTIONS.md](CONVENTIONS.md).
- Fait : `src/framework/components/picture/ent-app-image/` (corps de l'ancien `ModuleImage`, styles déplacés) ; `module-image` réduit à `EntAppImage` + `useModuleAppName` (exporté par les hooks de `myapps`).
- Vérifié : tsc 775 (aucune nouvelle ; les 2 erreurs préexistantes du rendu de remplacement ont suivi le code), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-06 — Noms de modules typés (`feat/ia/vmou`)

- Décidé (utilisateur) : `useModuleAppDisplay`, `useModuleApp` et `useModuleAppName` n'acceptent qu'un `AllModulesNames` ; `ModuleWithRights` prend `Pick<AnyModule, 'name'>`. On ne doit pouvoir obtenir qu'un module qui existe. Dans les tests, les noms de modules restent fictifs (les modules de test `amodule`… disparaîtront) : on surcharge les types.
- Fait : `useModuleApp` / `useModuleAppName` typés ; `src/app/module/rights.test.ts` surcharge le type de `isModuleAvailableForUser` (nom quelconque).
- `ModuleImage` (`src/framework/components/picture/module-image`) prend une prop `moduleName: AllModulesNames` (ex-`appName: string`) ; ses appelants `wiki` passent `moduleName`.
- Conséquence : tsc 775 au lieu de 768. Erreurs **voulues** : 7 appels avec un module non migré (5 de `useModuleAppDisplay`, 2 de `ModuleImage` dans `wiki`), corrigés au fil des migrations. Ne pas les traiter comme des régressions.

## 2026-11-06 — Types rangés dans les fichiers de types (`feat/ia/vmou`)

- Décidé : un type utile à plusieurs fichiers va dans le fichier de types de son dossier (`types.ts`, `model/index.ts`…) ; un type interne reste dans son fichier, non exporté, voire sans nom. Règle dans [CONVENTIONS.md](CONVENTIONS.md).
- Fait : `src/app/module/types.ts` (`ModulesMap`) ; `src/modules/myapps/model/index.ts` (`Translate`, `AppConfig`, `MyAppsFilter`) ; `src/modules/myapps/hooks/types.ts` (`MyAppsDispatch`, `EntAppDisplay`). Restés locaux : `LoadedModules`, `ModuleWithRights`, `LabelSourceData`, `FilterAppsContext` ; dépendances de `createMyAppsSessionHooks` sans nom.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418.
- Ensuite : `ModulesMap` → `AllModulesMap` (comme `AllModulesArray`) ; l'ancien type objet `AllModulesMap` → `AllModulesByName`.
- Puis : la Map devient un objet typé `AllModulesByName` (`useModulesByName()`, ex-`useModulesMap()` ; `getModuleByName` pour un nom quelconque) ; le type `AllModulesMap` est supprimé.
- Enfin : `AllModulesByName` → `AllModulesRecord`, `useModulesByName` → `useModulesRecord`. Le tableau des modules du contexte est en lecture seule (`Readonly<AllModulesArray>`, figé), comme `useModules()`.

## 2026-11-06 — Modules par nom en O(1) (`feat/ia/vmou`)

- Décidé : un module se lit par son nom dans une Map, pas par `modules.find(…)`. Règle dans [CONVENTIONS.md](CONVENTIONS.md).
- Fait : `ModuleContext` (`src/app/module/loader.tsx`) contient `{ modules, byName }`, construits une fois ; `useModulesMap()`, `useModule(name)` ; utilisés par `useModuleAppName` (`myapps`) et `src/app/navigation-new/open-module.ts`.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — `myapps` : `useTabLabel` supprimé (`feat/ia/vmou`)

- Décidé : `useTabLabel` redondant avec `useModuleAppDisplay` (même libellé, écrit avant lui) : supprimé.
- Fait : `TabLabel` (`src/app/navigation-new/tabs.tsx`) lit `useModuleAppDisplay(module.name).label`.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — Couleurs de la palette typées (`feat/ia/vmou`)

- Décidé : un nom de couleur de la palette est typé `ThemeColorName` (`keyof palette.complementary` + `primary` / `secondary`), pas `string`. Règle dans [CONVENTIONS.md](CONVENTIONS.md).
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
