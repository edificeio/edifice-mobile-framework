# ARCHITECTURE.md

> Important : deux générations de code cohabitent (modules et navigation). **Avant de modifier un module, identifie sa génération** (§2) et suis ses conventions. Ne mélange pas les deux dans un même module. L'objectif à court terme est de migrer l'ancienne génration vers la nouvelle.

## 1. Arborescence

```
/
├── src/                        Code de l'app
│   ├── app/                    Bootstrap, navigation, registre des modules
│   │   ├── navigation/         Navigation ANCIENNE (dynamique)
│   │   ├── navigation-new/     Navigation NOUVELLE (statique)
│   │   ├── module/             Classes CoreModule / EntModule, loader, hooks (nouveau système)
│   │   └── config/modules.ts   Liste des modules chargés (nouveau système)
│   ├── framework/              Cœur historique
│   │   ├── components/         UI partagée (button, card, modals, …)
│   │   ├── hooks/              Hooks communs
│   │   ├── navigation/         Helpers de navigation de l'ancien système (helper.ts, tabModules.tsx)
│   │   ├── util/               Transport, oauth2, storage, notifications, …
│   │   └── modules/            Modules ANCIENS (+ communities, voir §2)
│   ├── modules/                Modules NOUVEAUX (auth, media, user, audience, editor, notifications)
│   ├── infra/, ui/, util/      Legacy (non vérifié)
│   └── specs, test-utils, types/
├── __overrides__/              Marque blanche (common, dev, neo, one, ent77, openent, …)
├── ios/  android/             Natif
├── assets/                     i18n, icônes, images, animations
├── docs/                       Documentation
└── cli, gen, jest, patches, vendor, svgs-backup/   Outillage
```

## 2. Les deux générations de modules

Un module est une fonctionnalité isolée (blog, mails, auth, …) avec son dossier. Son `name` doit être identique au nom du dossier.

|                | Ancien                                               | Nouveau                                                                      |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Emplacement    | `src/framework/modules/<module>/`                    | `src/modules/<module>/`                                                      |
| Déclaration    | `module-config.ts` + `index.ts` (`NavigableModule`)  | `index.ts` seul : `new CoreModule({...})` ou `new EntModule({...})`          |
| Enregistrement | par le framework à la connexion                      | `src/app/config/modules.ts`                                                  |
| Écrans         | `navigation/navigator.tsx` (`createModuleNavigator`) | déclarés dans `screens` / `modals` du module (`defineScreen`, `defineModal`) |
| Redux          | `reducer.ts` / `store.ts` + `Reducers.register`      | `redux: { reducer }` dans la config du module                                |
| Notifications  | `notif-handler.ts`                                   | **pas encore d'équivalent** (voir §6)                                        |
| Exemples       | `blog`, `timeline`, `wiki`, …                        | `auth` (le plus complet), `media`                                            |

**Pourquoi deux emplacements ?** Le dossier `src/modules/` n'existe que pour éviter les confusions. Il accueille les premiers modules convertis, **techniques**, qui centralisent la plupart des fonctionnalités du framework : ils sont **entièrement recodés**, d'où un emplacement distinct. Les modules **fonctionnels** (blog, wiki, timeline, …) seront migrés **sur place**, dans `src/framework/modules/`. Raison : d'autres équipes les modifient pendant la migration, et rester au même endroit garde les conflits git faciles à gérer.

Conséquence : l'emplacement ne dit pas la génération. Un module de `framework/modules/` peut être ancien ou déjà migré : regarde son `index.ts` (`NavigableModule` = ancien, `CoreModule` / `EntModule` = nouveau). **Ne déplace pas un module migré sur place vers `src/modules/`.**

> `communities` est dans `framework/modules/` avec l'ancienne structure (`NavigableModule`). C'est la référence récente d'après `AGENTS.md`.

Les modules du nouveau système sont de deux types (`src/app/module/types.ts`) :

- `CoreModule` : module technique (auth, media, notifications, …), disponible sans droits ENT.
- `EntModule` : module lié à une app ENT. Sa seule particularité est d'être **soumis aux droits d'accès** (`matchEntcoreApp`, `matchEntcoreWidget`, `hasRight`).

**Droits** : `isModuleAvailableForUser(module, session)` (`src/app/module/rights.ts`) dit si l'utilisateur peut utiliser un module, d'après les droits de la session. Chaque condition **déclarée** doit être remplie : `matchEntcoreApp` dans `session.rights.apps`, `matchEntcoreWidget` dans `session.rights.widgets`, `hasRight(session)` vrai. Un module qui n'en déclare aucune (tout `CoreModule`) est toujours disponible. Dans un composant : `useUserAvailableModules()`. Les onglets des modules indisponibles sont masqués.

Un onglet (`tab`) n'est pas propre à `EntModule` : un `CoreModule` peut aussi en déclarer un (`ModuleConfig.tab`).

### 2.1 Structure d'un module ancien

```
<module>/
├── index.ts               Enregistrement (NavigableModule)
├── module-config.ts       Configuration (voir §2.2)
├── navigation/            index.ts (types + route names) et navigator.tsx (écrans)
├── screens/               Écrans, un dossier par écran
├── components/            Composants non transverses
├── model/                 index.ts, rights.ts, business.ts
├── service/               Appels API
├── reducer.ts | reducer/  State Redux (+ actions/)
├── storage/               Accès au storage
└── notif-handler.ts       Ouverture de notifications / push
```

Un écran suit le gabarit en 4 fichiers : `index.ts` (API publique), `screen.tsx`, `styles.ts`, `types.ts`. Son nom est de la forme `<NomModule><NomEcran>Screen` (ex. `MonModuleHomeScreen`).

### 2.2 Configuration d'un module ancien (`module-config.ts`)

```ts
export default new NavigableModuleConfig<'monModule', IMonModuleReduxState>({
  name: 'monModule',                // = nom du dossier
  entcoreScope: ['monmodule'],      // scopes OAuth2 requis par la couche service
  matchEntcoreApp: '/monmodule',    // correspondance app ENT ⇔ module (droits)
  storageName: 'monModule',         // préfixe des clés de storage
  displayI18n: 'monModule.tabName', // clé i18n du nom
  displayAs: 'tabModule',           // 'tabModule' (tab bar) ou 'myAppsModule' (menu Mes applis)
  displayOrder: 0,                  // ordre dans l'emplacement (facultatif)
  displayColor: theme.palette.complementary.blue,
  displayPicture: { type: 'Icon', name: 'monmodule-off' },
  displayPictureFocus: { type: 'Icon', name: 'monmodule-on' }, // tabModule uniquement (facultatif)
  displayBadges: { MONMODULE: { color: … } },                  // facultatif (la clé vient du backend, voir plus bas)
});
```

- Les autres clés sont listées dans `~/framework/util/moduleTool.ts` ; leur valeur par défaut est calculée.
- Les champs `display*` acceptent une fonction `(matchingApps, matchingWidgets) => valeur` pour dépendre des droits. `displayPicture*` prennent les props du composant `Picture` (sans taille).
- **Droits** : `matchEntcoreApp` est une string (champ `address` de l'app ENT) ou une fonction `(app, allApps) => boolean`. Par défaut, le module s'affiche si au moins une app ENT correspond ; `hasRight(matchingApps, matchingWidgets)` remplace cette condition.
- `displayBadges` : la clé en majuscules (`MONMODULE`) **n'est pas déduite du code du repo** : elle correspond à une donnée du backend (le type de badge d'app). En pratique on la fait coïncider avec le nom du module, mais ce n'est pas garanti. Vérifie la valeur côté backend. Ne précise que les valeurs qui changent (icône ou couleur), sans recopier les originales.
- Pour changer le badge d'une app qui n'existe pas dans l'app mobile, modifier la config du module `timeline`.

### 2.3 Structure d'un module nouveau

```ts
export default new CoreModule({
  // ou EntModule
  name: 'media', // = nom du dossier
  scope: ['workspace'], // scopes OAuth2
  screens: { 'media/…': Screen }, // écrans (clés préfixées par le nom du module)
  modals: { 'media/carousel': Screen }, // modales
  redux: { reducer }, // facultatif
  storages: [mediaStorage], // storages avec migrations (obligatoire de les déclarer)
  entry: 'media/…', // facultatif : écran d'accueil du module, sans params obligatoires (`useOpenModule`)
  // tab : onglet de la tab bar ; sa `route` vaut `entry` par défaut (l'une des deux est obligatoire)
  // EntModule : matchEntcoreApp, matchEntcoreWidget, hasRight, entTrackingName
  // Hooks de session : sessionSetup, onSessionStart, onSessionRelease
});
```

- Les noms de route doivent être préfixés par le nom du module (`<module>` ou `<module>/<suffixe>`), sinon le type résout en `never`.
- Un préfixe `$` (ex. `auth/$load-account`) signale un écran qui héberge un conteneur de navigation indépendant et délègue sa télémétrie.
- Les modules peuvent se brancher sur le cycle de session (`sessionSetup`, `onSessionStart`, `onSessionRelease`). Voir les commentaires de `src/app/module/types.ts`.
- Structure attendue d'un module : `model/` (domaine agnostique, règles par objectif), `actions.ts` (actions de l'utilisateur), `util.ts`, `service/`, `store/`, `storage.ts`. Voir « Structure d'un module » dans `docs/migrations/CONVENTIONS.md` (exemple : `src/modules/myapps`).
- Dossiers observés dans `modules/auth` (le plus complet) : `screens/`, `navigation/`, `components/`, `hooks/`, `service/`, `model/`, `store/`, `storage.ts`, `tracking.ts`, tests `*.test.ts` à côté du code.

## 3. Navigation

### 3.1 Ancien système (`src/app/navigation/`)

Navigation **dynamique** : chaque module fournit son navigator, branché par le framework selon les droits de l'utilisateur à la connexion.

```
navigation/
├── index.tsx              NavigationContainer, RootStack, `navigationRef` global
├── root-navigation.tsx    Écrans des modules core
├── main-navigation.tsx    Tab bar principale
├── leaf-stack.tsx         Layout des stacks de modules
├── layout.tsx, util.tsx, types.ts (types `@deprecated`, `any`)
```

Arbre : `RootStack` (NativeStack : modales globales + écrans d'auth) → `Tabs` (BottomTabs) → un `TabStack` par onglet, contenant **tous les écrans de tous les modules**. On peut ainsi faire `navigate()` d'un module à l'autre sans changer d'onglet. Au changement d'onglet, l'utilisateur arrive toujours sur l'accueil de l'onglet.

**Limite majeure : les modales des modules sont mélangées aux écrans, dans le `TabStack`** (via `Stack.Group` + `presentation`). Cela pose parfois des problèmes (la modale vit dans l'onglet courant). Seules les modales globales (Pdf, Carousel, …) sont dans le `RootStack`.

**Le typage de la navigation est faible** : `types.ts` est `@deprecated` et typé `any`. Ne t'appuie pas dessus pour valider une navigation.

Deux emplacements de modules (`displayAs`) : `tabModule` (tab bar) et `myAppsModule` (menu Mes applis). Les onglets passent par `src/framework/navigation/tabModules.tsx`, transitoire d'après le code.

Conventions :

- Dans `<module>/navigation/index.ts` : `routeNames` (la route d'accueil du module vaut `moduleConfig.routeName`) et l'interface des params (`extends ParamListBase`).
- Dans `<module>/navigation/navigator.tsx` : `createModuleNavigator(...)` avec les `Stack.Screen`. Toujours déclarer `name`, `component`, `options` et `initialParams`, même vides.
- Naviguer : utiliser la prop `navigation` de l'écran (`props.navigation.navigate(...)`, `CommonActions`, `StackActions`). À défaut, `navigate<Params, typeof routeNames.X>(...)` de `~/framework/navigation/helper`, typé selon l'écran cible.
- Navbar : implémenter `computeNavBar` (cf. gabarit d'écran) et l'appeler dans la config de l'écran du `navigator.tsx`.
- Modale globale (Pdf, Carousel, …) : `open*Modal({...props}, navigation)`. Modale de module : `Stack.Group` avec `presentation` (ex. `formSheet`) dans `screenOptions`.
- Ne pas importer `navigationRef` pour naviguer (le code le déconseille) : utiliser les hooks / la prop `navigation`.

### 3.2 Nouveau système (`src/app/navigation-new/`)

Navigation **statique** (`createStaticNavigation`) : les modules déclarent leurs écrans, l'app construit les stacks.

```
navigation-new/
├── index.tsx              Conteneur, reset vers l'accueil à chaque nouvelle connexion
├── root-stack.tsx         Stack racine : modales + écrans selon l'état d'auth
├── tabs.tsx               Onglets (`getTabScreenName`), masqués si le module n'est pas disponible
├── open-module.ts         `useOpenModule` / `useCanOpenModule`
├── tab-stack.tsx          Un stack par onglet, avec tous les écrans non modaux
├── screen.tsx             `defineScreen` / `defineModal`
├── options.tsx, layout.tsx, theme.ts, telemetry.ts, confirm-remove.tsx
└── types.ts               Types déduits (`StackNavigation`, `RootNavigation`, `TabNavigation`)
```

**Raison d'être de la migration : le typage automatique de la navigation.** Les noms de route et leurs params sont déduits des composants d'écran déclarés par les modules (`StaticParamList`, `StackNavigation`, `RootNavigation`, `TabNavigation`). **Favorise toujours ce typage**, pas de types de params écrits à la main, pas de `any`, pas de casts.

**Différence clé avec l'ancien système : les modales sont séparées des écrans.** Chaque module déclare ses `screens` (placés dans les `TabStack`) et ses `modals` (placées dans le `RootStack`), contrairement à l'ancien où tout était dans le `TabStack`.

Arbre : `RootStack` (modales de tous les modules + écrans selon l'auth) → `Tabs` → `TabStack` (écrans non modaux de tous les modules). Le `RootStack` dépend de l'état d'auth (`useAuthStage`) :

- `signedOut` : écrans des modules core (dont la connexion) ;
- `requirement` : requirements à remplir (CGU, mot de passe, …) ;
- `signedIn` : les onglets.

Les modales des modules core sont disponibles à tous les états, celles des modules ent uniquement connecté.

Règles :

- Déclarer chaque écran avec `defineScreen` ou `defineModal` dans son propre fichier. `options` est **toujours une fonction** (évite des valeurs non initialisées à l'import : i18n, thème).
- Un écran ne reçoit que `route`. Naviguer par hooks, pas par la prop `navigation`. Les params sont déduits des props du composant.
- Un onglet ne change pas tout seul quand on navigue vers un autre module : cibler l'onglet avec `getTabScreenName` (action JUMP_TO).
- Ouvrir un module sur son `entry` : `const openModule = useOpenModule(); openModule('blog')` (onglet du module s'il en a un, sinon `entry` dans l'onglet courant ; `false` si le module n'est pas disponible). `useCanOpenModule()` fait le même test sans naviguer. Seulement depuis un écran des onglets, pas depuis une modale.
- Le registre des écrans de tous les modules est dans `src/app/module/`.

### 3.3 Cohabitation

Les deux systèmes existent en même temps : l'ancien `index.tsx` importe encore `../navigation-new/confirm-remove` et `telemetry`. La majorité des imports récents ciblent `navigation-new` (36 fichiers contre 6 pour `app/navigation`). Ne vise pas à migrer un module sans demande explicite.

## 4. Notifications (ancien système uniquement)

Voir aussi [NOTIFICATIONS.md](NOTIFICATIONS.md) (vide à date).

Un module enregistre ses comportements d'ouverture de notification / push dans `notif-handler.ts` :

```ts
export default () =>
  registerNotifHandlers([
    { type: 'BLOG', 'event-type': ['PUBLISH-POST', …], notifHandlerAction: handleBlogPostNotificationAction },
  ]);
```

- La fonction exportée est appelée **en bas de l'`index.ts`** du module (`setUpNotifHandler()`).
- `notifHandlerAction` est un **thunk Redux**. Il retourne `{ managed: 0 }` si la notification n'est pas redirigée, ou `{ managed: 1, trackInfo }` si elle l'est. Toujours entourer de `try/catch` et vérifier chaque information avant de rediriger.
- Chaîne de redirection : handlers du module → sinon web (`notification.resourceUri`) → sinon fil de nouveautés enrichi.
- Exemple de référence : `src/framework/modules/blog/notif-handler.ts`.

## 5. Redux (ancien système)

Les reducers s'enregistrent dans une map globale : `Reducers.register(moduleConfig.reducerName, reducer)`, en bas du `reducer` du module. Dans le nouveau système, le reducer est passé via `redux` dans la config du module.

## 6. Fonctionnalités de l'ancien système absentes du nouveau

À date, ce qui existe dans l'ancien système et n'a **pas encore d'équivalent** dans le nouveau. Constaté dans `src/app/module/` : à confirmer avec l'équipe avant de t'y fier.

- **Notifications / push** : pas de `notif-handler.ts` ni de `registerNotifHandlers` dans `src/app/module/`, et `src/modules/notifications/` ne contient qu'un `index.ts`. Un module migré qui a besoin de rediriger une notification ne peut pas encore le faire via le nouveau système : **demande avant d'improviser**.
- **Emplacement « Mes applis »** (`displayAs: 'myAppsModule'`) : le nouveau `ModuleConfig` n'expose qu'un `tab`.
- **Champs d'affichage `display*`** (`displayI18n`, `displayColor`, `displayOrder`, `displayBadges`, …) : absents de `ModuleConfig`. `tab` ne porte que la route, les icônes, l'ordre et le `testId`.
- **Droits par fonction sur les apps ENT** : `hasRight` reçoit désormais la session (`AuthActiveAccount`), plus `matchingApps` / `matchingWidgets`. `matchEntcoreApp` est une string.

À l'inverse, le nouveau système ajoute : les hooks de session (`sessionSetup`, `onSessionStart`, `onSessionRelease`), la déclaration des `storages` avec migrations, et la télémétrie des écrans.

## 7. Autres documents (`docs/`)

Ces fichiers existent mais sont **encore vides** à date. Leur sujet est déduit de leur nom. Si tu as besoin d'une info qui devrait s'y trouver, demande plutôt que d'inventer.

| Fichier                              | Sujet attendu                                                  |
| ------------------------------------ | -------------------------------------------------------------- |
| [BUILD.md](BUILD.md)                 | Build et release (Fastlane, overrides, natif)                  |
| [CODEREVIEW.md](CODEREVIEW.md)       | Conventions et checklist de revue de code                      |
| [FETCH.md](FETCH.md)                 | Appels réseau (transport, `service/`)                          |
| [NOTIFICATIONS.md](NOTIFICATIONS.md) | Notifications / push (voir §4 et §6)                           |
| [STORAGE.md](STORAGE.md)             | Stockage local (`storage`, migrations, `storages` des modules) |
| [TESTS.md](TESTS.md)                 | Stratégie et exécution des tests                               |

Voir aussi `AGENTS.md` (règles de collaboration, conventions, vérification) à la racine du repo.

## À compléter

- i18n dans le nouveau système.
- Exemple concret d'un module avec onglet (`tab`).
- Liste des modules déjà migrés sur place dans `framework/modules/`.
- Rôle exact de `src/infra`, `src/ui`, `src/util`, `src/modules` hors `auth`/`media`.
- Services / transport, rights, couche réseau (voir [FETCH.md](FETCH.md), §1 de `AGENTS.md`).
- ~~Statut de migration module par module~~ : voir [migrations/STATUS.md](migrations/STATUS.md) (et le protocole de suivi dans [migrations/README.md](migrations/README.md)).
