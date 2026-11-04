# Migration : `myapps`

> Statut : **spec** (à valider : voir §8) — rédigée le 2026-11-04

## 1. Périmètre

« Mes applis » : la liste des applications ENT de l'utilisateur (apps mobiles, apps web, connecteurs), leurs favoris, et les **données d'affichage des apps** (nom, couleur, icône) que le reste de l'app consomme.

`src/framework/modules/myapps` (~3 400 lignes, `NavigableModule`) → `src/modules/myapps` (`CoreModule`, déjà déclaré).

**Dans le périmètre** : données des apps (chargement, agrégation), écran d'accueil, favoris (bottom sheet + modale de gestion), onboarding, ouverture d'une app, API publique pour les autres modules (thème, badge, nom d'app), libellés des onglets.

**Hors périmètre** (à suivre ailleurs) :

- Les **intents** (`src/app/intents.ts`) : **reportés** (voir [STATUS.md](STATUS.md), « Reportés »). `myapps` en est la destination naturelle, mais n'y touche pas pour l'instant.
- `useNotificationBadge` : dépend des définitions de notifications de `timeline` (redux). Reste en façade jusqu'à la migration de `timeline`.
- Les widgets `MYAPPS_WIDGET` (`widgets/*`) : malgré leur nom, ils sont affichés par `timeline`.

## 2. Existant

### 2.1 Module ancien (`src/framework/modules/myapps`)

| Dossier / fichier    | Rôle                                                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module-config.ts`   | `TAB_MODULE`, ordre 3, `hasRight: () => true`, `matchEntcoreApp: 'Portal'`, `entcoreTrackingName: 'Portal'`, `testID: 'tabbar-myapps'`.                                                                                                 |
| `service/index.ts`   | 3 lectures (`/applications-list`, `/myApps/config`, `/userbook/preference/apps`) + écriture des favoris (`PUT /userbook/preference/apps`). Variante `createMyAppsServiceWithTokenFetch` pour le chargement à la connexion.              |
| `reducer/`           | State `{ aggregatedApps, appsInfo, appsConfig, favorites }`, actions `fetchSuccess` / `updateFavorites`, thunks `refreshMyApps`, `toggleFavorite`, `saveGroupedFavorites`.                                                              |
| `reducer/adapter.ts` | **Toute la logique métier** (282 lignes) : agrégation, catégories, connecteurs, filtres, résolution thème / badge / nom d'onglet. Fonctions pures, sauf `buildAppLookupMap` et `loadAppsDataFromService` qui lisent `AllModules()`.     |
| `utils/`             | Nom traduit d'une app, `testID`, normalisation d'icône, route du module correspondant.                                                                                                                                                  |
| `hooks/`             | `useAppTheme`, `useAppBadge`, `useNotificationBadge`, `useFilteredApps`.                                                                                                                                                                |
| `storage.ts`         | `Storage.account({ namespace: 'myapps' })` : `show-all-apps` (booléen, `true` par défaut), `onboarding` (`{ seen, version }`) ; migration `remove-info-bubble-v1`.                                                                      |
| `screens/`           | Écran d'accueil + `useController` (263 lignes).                                                                                                                                                                                         |
| `components/`        | Carte d'app (icône + animation favori), liste (FlashList 2 colonnes, séparateur « autres services »), filtres (onglets horizontaux + recherche animée), item de menu, onboarding (`ModalBox`, 3 slides), modale de gestion des favoris. |

**Chargement** : à la connexion, **bloquant** (`loadMyAppsAtLogin`, désactivé depuis le commit `167281518` : `ToDo` dans `src/modules/auth/flows/start-session.ts`), puis tirer-pour-rafraîchir sur l'écran. Aujourd'hui, rien ne charge les données.

### 2.2 Module nouveau (`src/modules/myapps`), état actuel

- `index.ts` : `CoreModule` avec l'écran `myapps/home` et un `tab` (ordre 40, icônes `ui-applications(-fill)`, `testId: 'tabbar-myapps'`).
- `screens/home.tsx` : vue vide.
- `store.ts` : store vide + interface `EntApplication` inutilisée.
- `service.ts` : copie de l'ancien service, **ne compile pas** (types et `adaptApplicationList` non importés). À réécrire.

### 2.3 Consommateurs externes

| Fichier                                                                                                               | Utilise                                                    | Remplacement                               |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `src/framework/components/picture/module-image/component.tsx`                                                         | `useAppTheme(appName)`                                     | `useAppTheme` nouveau                      |
| `src/framework/modules/blog/screens/BlogSelectScreen.tsx`                                                             | `useAppTheme('blog')`                                      | idem                                       |
| `src/framework/modules/homework/components/HomeworkSelectScreen.tsx`                                                  | `useAppTheme('homework')`                                  | idem                                       |
| `src/framework/modules/news/components/thumbnail-thread/component.tsx`                                                | `useAppTheme(moduleConfig.name)`                           | idem                                       |
| `src/framework/modules/communities/components/community-card-large/component.tsx`, `…/community-navbar/component.tsx` | `useAppTheme('communities')`                               | idem                                       |
| `src/framework/modules/communities/components/community-card-small/component.tsx`                                     | `selectAggregatedApps(state).Communities`                  | `useApp('Communities')` (ou `useAppTheme`) |
| `src/framework/modules/timeline/components/notification-top-info.tsx`                                                 | `useNotificationBadge`                                     | façade (hors périmètre)                    |
| `src/modules/media/hooks/resource-display.ts`                                                                         | `selectAggregatedApps` (couleur + icône par nom d'app ENT) | `useApp(name)`                             |
| `src/app/navigation/main-navigation.tsx` (ancienne nav)                                                               | `getTabModuleDisplayName`, `selectAggregatedApps`          | rien (ancienne nav, à supprimer)           |
| `src/framework/navigation/modals/navigator.tsx`                                                                       | modale `FavoritesManagement`                               | modale `myapps/favorites`                  |
| `src/app/navigation-new/tabs.tsx`                                                                                     | — (`@todo get names / colors from myApps`)                 | `useTabLabel` (§5.5)                       |

> ⚠️ `buildAppLookupMap` lit `AllModules()`, qui renvoie `[]` : **`useAppTheme` / `useAppBadge` renvoient toujours le thème par défaut aujourd'hui**, même si les données étaient chargées.

## 3. Comportements à conserver

### 3.1 Données

- [ ] Trois lectures au chargement : liste des apps, config (catégorie, couleur, aide, bibliothèque), favoris (JSON dans `preference`, `{ applications: [], bookmarks: [] }` si absent ou illisible).
- [ ] Agrégation par nom d'app (`aggregateApps`) :
  - config de l'app par `name` ; une app dont l'adresse contient `library.edifice.io` et **sans catégorie** prend la config `library-info` (`isLibrary`) ;
  - surcharges : `Directory` → couleur `green`, icône `userbook` ; icône `viescolaire` → `parametrage` ; icône normalisée (sans suffixe `-large`, minuscules, sans accents) ;
  - nom affiché (`getAppName`) : clé i18n `myapps-app-<prefix sans "/">`, sinon `myapps-app-<displayName normalisé>`, sinon `I18n.get(displayName)`, sinon `displayName`, sinon `name` ;
  - `testID` = `myapps-<name en kebab-case>` (vide si l'app n'a pas de config) ;
  - tri alphabétique sur le nom affiché.
- [ ] `isMobile` : un module de l'app a `matchEntcoreApp === app.name` (et est disponible pour la session).
- [ ] `isConnector` : vrai si pas mobile, ou `target === '_blank'`, ou adresse absolue `http(s)://`, ou adresse contenant `#/`, ou pas de `prefix`.
- [ ] Catégories : `communication`, `organisation`, `pedagogy` → `pedagogie` ; le reste → `otherServices`.
- [ ] Apps « en bas » (`appShouldBeAtBottom`) : connecteur, non mobile, hors des trois catégories.
- [ ] Seules les apps `display: true` sont listées.

### 3.2 Écran d'accueil

- [ ] Filtres : Toutes · Favoris · Communication · Pédagogie · Organisation · Autres services (+ recherche). « Bibliothèques » existe mais est masqué.
- [ ] Interrupteur « afficher toutes les apps » (persisté par compte) : désactivé → seulement les apps mobiles (et les favoris en recherche) ; les apps « en bas » s'ajoutent pour Toutes, Autres services et la recherche (`useFilteredApps`). Le filtre Favoris ignore l'interrupteur.
- [ ] Filtre Toutes : liste groupée avec séparateur « autres services ».
- [ ] Appui sur une app : module mobile → navigation vers sa route ; sinon `openUrl`, via `/auth/redirect?url=…` pour un connecteur.
- [ ] Appui long : retour haptique + bottom sheet (ajouter / retirer des favoris, aide si un lien existe). Le favori est enregistré **à la fermeture** de la sheet, l'état n'est mis à jour **qu'après succès** de l'API, puis toast succès / erreur.
- [ ] Menu de la navbar : gérer les favoris (ouvre la modale après 300 ms), accès navigateur (`/welcome`), interrupteur, message d'info (les trois derniers masqués sur le filtre Favoris).
- [ ] Lien d'aide : langue courante, puis langue de base (`fr-FR` → `fr`), puis `fr`.
- [ ] Onboarding : montré automatiquement si jamais vu **et** version ≠ `v1`, **une fois par session de connexion** (clé `userId:accessToken` en mémoire) ; bouton de la navbar pour le revoir (icône `ui-notif` / `ui-notif-empty`).
- [ ] Vide : chargement, écran vide (avec « réessayer » si erreur), écrans vides par filtre (favoris, recherche, autre).
- [ ] Appui sur l'onglet déjà actif : remonte en haut de la liste.

### 3.3 Modale de gestion des favoris

- [ ] Recherche, sélection multiple, bouton valider actif seulement si modifié, confirmation à la fermeture si modifications non enregistrées.
- [ ] Enregistrement **optimiste** (état mis à jour avant l'API, restauré si échec), fermeture 400 ms après succès + toast.
- [ ] Liste = toutes les apps selon l'interrupteur « afficher toutes les apps ».

### 3.4 Favoris (règle d'écriture)

- [ ] `PUT` de `{ applications, bookmarks }` ; `applications` est renvoyé tel quel. Si `applications` n'est pas vide, `toggleFavorite` ne garde que les favoris présents dans `applications` (+ l'app basculée).

### 3.5 Stockage et tests E2E

- [ ] Même namespace `myapps`, mêmes clés (`show-all-apps`, `onboarding`), même id de migration `remove-info-bubble-v1` : les préférences des utilisateurs sont conservées.
- [ ] **Tous les `testID`** existants sont conservés : `tabbar-myapps`, `myapps-<app>`, `myapps-filter-*`, `myapps-navbar-notif(-empty)`, `myapps-navbar-context-menu`, `myapps-menu-manage-favorites`, `myapps-menu-access-by-browser`, `myapps-all-showed` / `myapps-all-hidden`, `myapps-toggle-favorite`, `myapps-app-info`, `myapps-empty-screen`, `myapps-empty-{favorites,search,other}`, `myapps-onboarding-modal(-later|-previous|-next|-complete)`.
- [ ] Clés i18n inchangées (`myapp-*` : 50, `myapps-app-*` : 53).

## 4. Ancienneté de conception à corriger au passage

Défauts de l'ancien module. La règle reste de **porter tel quel** : on ne corrige au passage que ce qui est local au module ou déjà réglé par la cible ; le reste est noté ici et fera l'objet d'une validation.

| #   | Constat                                                                                                                                                                                     | Correction                                                                                                         | Statut             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 1   | L'agrégat est calculé une fois et stocké (redux) ; basculer un favori réécrit toutes les apps.                                                                                              | Stocker le brut, dériver l'agrégat (§5.2).                                                                         | réglé par la cible |
| 2   | Thème / badge / route d'un module trouvés par le registre statique `AllModules()` (vide aujourd'hui).                                                                                       | `useModules()` (§5.2, §5.4).                                                                                       | réglé par la cible |
| 3   | Service en deux variantes (`sessionFetch` / `tokenFetch`) ; les 3 lectures sont faites l'une après l'autre.                                                                                 | Un service paramétré par le compte (`accountFetch`), lectures en parallèle.                                        | réglé par la cible |
| 4   | **Bug** : la version d'onboarding ne sert à rien. La condition est « jamais vu **et** version ≠ `v1` », or terminer l'onboarding écrit `seen: true` : passer à `v2` ne le remontrerait pas. | Montrer si la version enregistrée ≠ version courante.                                                              | à valider          |
| 5   | « Une fois par session » repose sur la clé `userId:accessToken` : le jeton change à chaque refresh, l'onboarding peut se remontrer dans la même session.                                    | Un drapeau dans le store de session (vidé à la fin de session).                                                    | à valider          |
| 6   | Deux politiques d'écriture des favoris : bottom sheet = état mis à jour après succès de l'API, modale = optimiste avec retour arrière.                                                      | Une seule politique.                                                                                               | à valider          |
| 7   | Enchaînements par délais fixes : modale ouverte 300 ms après la fermeture de la sheet, fermeture 400 ms après l'enregistrement, focus de la recherche à 250 ms.                             | Attendre la fin de l'animation (événements de la sheet / de la navigation). Lié à « modale as promise » (reporté). | noté               |
| 8   | `navigation` typée `any` ; boutons de navbar posés par `setOptions` dans un effet, en double (`headerRight` + `unstable_headerRightItems`).                                                 | Navigation typée, options de l'écran par `defineScreen`.                                                           | à faire au portage |
| 9   | La route d'un module est recalculée à l'appui (`getModuleRouteName`) alors qu'elle est déjà dans l'agrégat (`routeName`).                                                                   | Une seule source (§5.4).                                                                                           | réglé par la cible |
| 10  | `getDefaultAppTheme` fait un `require` dynamique du thème.                                                                                                                                  | Import normal.                                                                                                     | à faire au portage |

## 5. Cible

### 5.1 Arborescence

```
src/modules/myapps/
├── index.ts                CoreModule : screens, modals, tab, storages, sessionSetup
├── model.ts                Types (App, AppsConfig, Bookmarks, Filter, Category)
├── apps.ts                 Fonctions pures (ex-adapter) : aggregate, isConnector, category, filters, bookmarks, help link
├── apps.test.ts
├── service.ts              Lectures (accountFetch) + écriture des favoris
├── store.ts                Store de session (zustand)
├── storage.ts              Storage account `myapps` (déplacé tel quel)
├── hooks/                  API publique : useApps, useApp, useAppTheme, useAppBadge, useTabLabel, useFilteredApps
├── screens/home/           Écran d'accueil (+ controller)
├── screens/favorites/      Modale de gestion des favoris
└── components/             Carte, liste, filtres, menu, onboarding (portés tels quels)
```

### 5.2 Données : stocker le brut, dériver le reste

Le store contient **ce que renvoie le serveur**, pas l'agrégat :

```ts
type MyAppsState = {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  list: AppInfo[]; // /applications-list
  config: AppConfig[]; // /myApps/config
  bookmarks: AppBookmarks; // /userbook/preference/apps
};
```

créé avec `createSessionStore` (`src/modules/auth/store/session.ts`) : vidé à chaque fin de session.

L'agrégat (`isMobile`, route, catégorie, thème…) est **dérivé** dans les hooks, par des fonctions pures mémoïsées. Raison : `isMobile` et la route dépendent des **modules chargés**, qui ne s'obtiennent que par `useModules()` (pas de registre statique, décision `auth`) ; et un favori basculé n'a plus à réécrire tout l'agrégat (comme le fait le reducer actuel).

### 5.3 Chargement

- `sessionSetup(session, { signal })` : les trois lectures en parallèle avec `accountFetch(session, …)`, renvoie `{ commit }` qui remplit le store. Comme avant : les données (et donc les libellés d'onglets) sont là dès l'affichage de l'app.
- **Tolérant aux pannes** : une erreur est attrapée et le `commit` pose `status: 'error'` (l'écran propose « réessayer »). Raison : un échec de `sessionSetup` fait échouer la connexion (`SessionSetupError`) pour tous les modules ; perdre la liste des apps ne doit pas empêcher de se connecter. **À valider** (Q2).
- `refresh()` (tirer-pour-rafraîchir, réessayer) : mêmes lectures avec le transport de session.

### 5.4 Ouvrir une app

- Correspondance app ENT ↔ module : les modules `EntModule` chargés (`useModulesOfType(EntModule)`) dont `matchEntcoreApp === app.name` **et disponibles pour la session** (droits, §5.6).
- Route cible : à définir dans la config de module (Q1). Navigation typée (`StackNavigation`), dans l'onglet courant (tous les écrans sont dans chaque `TabStack`) ; si le module a un onglet, `JUMP_TO` vers `getTabScreenName(name)`.
- Sinon : `openUrl` (avec `/auth/redirect?url=` pour un connecteur), inchangé.

### 5.5 API publique (`src/modules/myapps/hooks/`)

| Hook                               | Rôle                                                                                                                 | Remplace                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `useApps()`                        | Apps agrégées (+ `status`, `refresh`)                                                                                | `selectAggregatedApps`                          |
| `useApp(entAppName)`               | Une app par son nom ENT                                                                                              | `aggregatedApps[name]` (`media`, `communities`) |
| `useAppTheme(name)`                | Couleurs + icône, par nom de **module** ou de **scope** (comme `buildAppLookupMap`, mais à partir de `useModules()`) | `useAppTheme` ancien                            |
| `useAppBadge(name)`                | Couleur + icône de badge                                                                                             | `useAppBadge` ancien                            |
| `useTabLabel(module)`              | Nom affiché d'un onglet (nom de l'app, sinon i18n `myapps-app-*`, alias `myapps` → `portal`)                         | `getTabModuleDisplayName`                       |
| `useFilteredApps(filter, showAll)` | Filtres de l'écran                                                                                                   | idem (interne, exporté pour la modale)          |

`tabs.tsx` (`src/app/navigation-new/`) appelle `useTabLabel` à la place du `testId`.

### 5.6 Droits

`isMobile` ne doit compter que les modules **disponibles** pour la session. Il n'existe pas encore de fonction pour ça dans le nouveau système (`tabs.tsx` affiche tous les onglets). À créer dans `src/app/module/` (pas dans `myapps`) : `isModuleAvailable(module, session)` = `CoreModule` toujours ; `EntModule` si `matchEntcoreApp` est dans `session.rights.apps` (et `matchEntcoreWidget` dans `widgets`) **et** `hasRight(session)`. Étape préalable partagée avec le filtrage des onglets (Q3).

### 5.7 Navigation

- Écran `myapps/home` (existant).
- Modale `myapps/favorites` (`defineModal`, présentation `modal` comme aujourd'hui) remplace `ModalsRouteNames.FavoritesManagement`.
- Onboarding (`ModalBox`) et bottom sheet restent des **composants** dans l'écran (portés tels quels). Leur passage en routes / « modale as promise » est reporté.

### 5.8 Façades `@deprecated` (comme `auth`)

`src/framework/modules/myapps/hooks` (`useAppTheme`, `useAppBadge`) et `reducer` (`selectAggregatedApps`) restent, réécrits pour lire le nouveau store : les 8 consommateurs anciens ne changent pas. `useNotificationBadge` garde son code (redux `timeline`) mais lit les apps du nouveau store. Le reste du module ancien est supprimé en phase 7.

## 6. Plan par phases

| #   | Phase                              | Contenu                                                                                                                                  | Validation                                                                                  |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0   | Préalables                         | `isModuleAvailable` dans `src/app/module/` ; clé de config pour la route d'entrée (Q1)                                                   | tsc, test unitaire de la disponibilité                                                      |
| 1   | Modèle + service + store + storage | `model.ts`, `apps.ts` (ex-adapter, sans `AllModules`), `service.ts` réécrit, `store.ts`, `storage.ts` déplacé et déclaré dans `storages` | tests Jest de `apps.ts` (agrégation, connecteur, catégories, filtres, favoris, lien d'aide) |
| 2   | Chargement                         | `sessionSetup` + `refresh` ; retrait du `ToDo` de `start-session.ts`                                                                     | connexion : store rempli ; échec réseau : connexion OK + `status: 'error'`                  |
| 3   | API publique                       | hooks §5.5 ; `tabs.tsx` ; façades §5.8 ; `media/resource-display.ts`                                                                     | libellés d'onglets corrects ; thème des apps dans `blog` / `communities`                    |
| 4   | Écran d'accueil                    | port de l'écran, de la liste, de la carte, des filtres, de l'interrupteur                                                                | parcours E2E (testIDs §3.5)                                                                 |
| 5   | Favoris + onboarding               | bottom sheet, modale `myapps/favorites`, onboarding                                                                                      | règles §3.2-3.4                                                                             |
| 6   | Ouvrir une app                     | §5.4 (sans les intents, reportés)                                                                                                        | apps mobiles, web, connecteurs                                                              |
| 7   | Nettoyage                          | suppression de `framework/modules/myapps` hors façades, de la modale `FavoritesManagement`                                               | `grep -rn "framework/modules/myapps" src` = façades seulement                               |

Chaque phase : eslint + tsc sans nouvelle erreur sur les fichiers touchés (le repo a une base d'erreurs tsc préexistantes).

## 7. Décisions

- **Intents hors périmètre** (2026-11-04) : sujet reporté pour toute la migration ; `src/app/intents.ts` reste tel quel, `media` continue d'y déléguer.

Le reste de la spec est une proposition, pas encore validée.

Reprises des migrations précédentes (s'appliquent d'office) : stores zustand indépendants ; noms kebab-case ; écrans et composants **portés tels quels**, améliorations plus tard ; façades `@deprecated` plutôt que modifier les consommateurs anciens ; accès aux modules par `useModules()`, pas de registre statique ; images via les composants ponts de `media` (pas de `FastImage` direct).

## 8. Questions ouvertes

1. **Route d'entrée d'un module** (pour ouvrir une app, et plus tard les intents) : nouvelle clé de config (ex. `home: 'blog'` sur `ModuleConfig`, défaut = `tab.route`), ou convention « la route qui porte le nom du module » (`'blog'`) ? La convention est sans config mais implicite.
2. **Chargement tolérant aux pannes** (§5.3) : `sessionSetup` qui n'échoue jamais (recommandé), ou `sessionSetup` bloquant comme l'ancien (un `/myApps/config` en panne empêche toute connexion) ?
3. **Droits** (§5.6) : faire `isModuleAvailable` dans cette migration (phase 0), ou dans un chantier « droits » séparé dont `myapps` dépend ?
4. **CoreModule ou EntModule** : l'ancien a `hasRight: () => true` (toujours visible), d'où `CoreModule`. Mais `matchEntcoreApp: 'Portal'` sert au nom d'onglet (alias `portal`) et au tracking (`Portal`). Garder `CoreModule` et gérer le nom par l'alias ?
5. **Ordre des onglets** : l'ancien ordre est 3, le nouveau 40. Quelle échelle pour les autres modules (timeline = 0) ?

## 9. Avancement

- 2026-11-04 : spécification rédigée ; intents sortis du périmètre ; section 4 (conception ancienne) ajoutée. Rien d'implémenté.
