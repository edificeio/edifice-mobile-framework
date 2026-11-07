# ARCHITECTURE.md

Architecture du code de l'application, à destination des agents IA.
Version pour les équipes **qui n'ont pas encore la migration** vers le nouveau système de modules et de navigation : seul le système historique est décrit.
Document **intermédiaire** : il sera enrichi (voir « À compléter » en fin de fichier).

## 1. Arborescence

```
/
├── src/                        Code de l'application
│   ├── app/                    Bootstrap, navigation
│   │   └── navigation/         Navigation (dynamique)
│   ├── framework/              Cœur de l'application
│   │   ├── components/         UI partagée (button, card, modals, …)
│   │   ├── hooks/              Hooks communs
│   │   ├── navigation/         Helpers de navigation (helper.ts, tabModules.tsx)
│   │   ├── util/               Transport, oauth2, storage, notifications, …
│   │   └── modules/            Modules (voir §2)
│   ├── infra/, ui/, util/      Non vérifié
│   └── specs, test-utils, types/
├── __overrides__/              Marque blanche (common, dev, neo, one, ent77, openent, …)
├── ios/  android/             Natif
├── assets/                     i18n, icônes, images, animations
├── docs/                       Documentation
└── cli, gen, jest, patches, vendor, svgs-backup/   Outillage
```

## 2. Modules

Un module est une fonctionnalité isolée (blog, mails, auth, …) avec son dossier dans `src/framework/modules/`. Son `name` doit être identique au nom du dossier.
Exemples : `blog`, `timeline`, `wiki`. `communities` est la référence récente d'après `AGENTS.md`.

### 2.1 Structure d'un module

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

### 2.2 Configuration d'un module (`module-config.ts`)

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
- **Droits** : `matchEntcoreApp` est une string (champ `address` de l'application ENT) ou une fonction `(app, allApps) => boolean`. Par défaut, le module s'affiche si au moins une app ENT correspond ; `hasRight(matchingApps, matchingWidgets)` remplace cette condition.
- `displayBadges` : la clé en majuscules (`MONMODULE`) **n'est pas déduite du code du dépôt** : elle correspond à une donnée du backend (le type de badge d'app). En pratique on la fait coïncider avec le nom du module, mais ce n'est pas garanti. Vérifie la valeur côté backend. Ne précise que les valeurs qui changent (icône ou couleur), sans recopier les originales.
- Pour changer le badge d'une app qui n'existe pas dans l'application mobile, modifier la config du module `timeline`.

## 3. Navigation (`src/app/navigation/`)

Navigation **dynamique** : chaque module fournit son fichier navigator.tsx, branché par le framework selon les droits de l'utilisateur à la connexion.

```
navigation/
├── index.tsx              NavigationContainer, RootStack, `navigationRef` global
├── root-navigation.tsx    Écrans des modules core
├── main-navigation.tsx    Tab bar principale
├── leaf-stack.tsx         Layout des stacks de modules
├── layout.tsx, util.tsx, types.ts (types `@deprecated`, `any`)
```

Arbre : `RootStack` (NativeStack : modales globales + écrans d'auth) → `Tabs` (BottomTabs) → un `TabStack` par onglet, contenant **tous les écrans de tous les modules**. On peut ainsi faire `navigate()` d'un module à l'autre sans changer d'onglet. Au changement d'onglet, l'utilisateur arrive toujours sur l'accueil de l'onglet.

**Limite : les modales des modules sont mélangées aux écrans, dans le `TabStack`** (via `Stack.Group` + `presentation`). Cela pose parfois des problèmes (la modale vit dans l'onglet courant). Seules les modales globales (Pdf, Carousel, …) sont dans le `RootStack`.

**Le typage de la navigation est faible** : `types.ts` est `@deprecated` et typé `any`. Ne t'appuie pas dessus pour valider une navigation.

Deux emplacements de modules (`displayAs`) : `tabModule` (tab bar) et `myAppsModule` (menu Mes applis). Les onglets passent par `src/framework/navigation/tabModules.tsx`.

Conventions :

- Dans `<module>/navigation/index.ts` : `routeNames` (la route d'accueil du module vaut `moduleConfig.routeName`) et l'interface des params (`extends ParamListBase`).
- Dans `<module>/navigation/navigator.tsx` : `createModuleNavigator(...)` avec les `Stack.Screen`. Toujours déclarer `name`, `component`, `options` et `initialParams`, même vides.
- Naviguer : utiliser la prop `navigation` de l'écran (`props.navigation.navigate(...)`, `CommonActions`, `StackActions`). À défaut, `navigate<Params, typeof routeNames.X>(...)` de `~/framework/navigation/helper`, typé selon l'écran cible.
- Navbar : implémenter `computeNavBar` (cf. gabarit d'écran) et l'appeler dans la config de l'écran du `navigator.tsx`.
- Modale globale (Pdf, Carousel, …) : `open*Modal({...props}, navigation)`. Modale de module : `Stack.Group` avec `presentation` (ex. `formSheet`) dans `screenOptions`.
- Ne pas importer `navigationRef` pour naviguer (le code le déconseille) : utiliser les hooks / la prop `navigation`.

## 4. Notifications

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

## 5. Redux

Les reducers s'enregistrent dans une map globale : `Reducers.register(moduleConfig.reducerName, reducer)`, en bas du `reducer` du module.

## 6. Autres documents (`docs/`)

Ces fichiers existent mais sont **encore vides** à date. Leur sujet est déduit de leur nom. Si tu as besoin d'une info qui devrait s'y trouver, demande plutôt que d'inventer.

| Fichier | Sujet attendu |
| --- | --- |
| [BUILD.md](BUILD.md) | Build et release (Fastlane, overrides, natif) |
| [CODEREVIEW.md](CODEREVIEW.md) | Conventions et checklist de revue de code |
| [FETCH.md](FETCH.md) | Appels réseau (transport, `service/`) |
| [NOTIFICATIONS.md](NOTIFICATIONS.md) | Notifications / push (voir §4) |
| [STORAGE.md](STORAGE.md) | Stockage local (`storage`, migrations) |
| [TESTS.md](TESTS.md) | Stratégie et exécution des tests |

Voir aussi `AGENTS.md` (règles de collaboration, conventions, vérification) à la racine du repo.

## À compléter

- Rôle exact de `src/infra`, `src/ui`, `src/util`.
- Services / transport, rights, couche réseau (voir [FETCH.md](FETCH.md), §1 de `AGENTS.md`).