# Migration : `myapps`

> Statut : **en cours** (spec v2 validée le 2026-11-04 ; phases 0 à 3 faites) — mise à jour le 2026-11-06

Les règles communes à toute la migration sont dans [CONVENTIONS.md](CONVENTIONS.md) et ne sont pas répétées ici.

## 1. Périmètre

« Mes applis » : la liste des applications ENT de l'utilisateur (modules de l'app, apps web, connecteurs), ses favoris, et les **données d'affichage des apps** (nom, couleur, icône) que le reste de l'app consomme.

`src/framework/modules/myapps` (~3 400 lignes, `NavigableModule`) → `src/modules/myapps` (déjà déclaré, à passer en `EntModule`).

**Dans le périmètre**

- Données des apps (chargement, agrégation) et préférences (favoris).
- `MyAppsHomeScreen` : liste, filtres, recherche, tirer-pour-rafraîchir.
- Les **options des deux bottom sheets** actuelles, chacune devenant un écran `formSheet` :
  - menu de la navbar (`home_menu`) : gérer les favoris · accès par le navigateur (`/welcome`) · interrupteur « afficher toutes les applis » · message d'info. Les trois derniers sont masqués sur le filtre Favoris ;
  - actions d'une app (`app_actions`, appui long) : ajouter / retirer des favoris · aide de l'app (si un lien existe).
- `ManageFavoritesModalScreen` (gestion groupée des favoris) et `MyAppsOnboardingModal`.
- Ouvrir une app (module, app web, connecteur).
- API publique pour les autres modules (thème, badge, nom d'app) et libellés des onglets.

**Fonctionnalités existantes faciles à oublier** (toutes à conserver, détail en §3) :

- Retour haptique à l'appui long ; remontée en haut de la liste à l'appui sur l'onglet déjà actif.
- Icônes d'app de 4 sortes (`resolveAppIcon`) : SVG interne, image du workspace (signée), image distante (avec un `User-Agent` forcé), SVG distant (`SvgUri`) ; à défaut, initiale de l'app ou icône `default-connector`. Une icône en erreur bascule sur le défaut.
- Pictogramme « lien externe » sur les cartes des apps qui ne sont pas des modules ; badge favori animé (rotation + rebond) sur `MyAppsCard`.
- Boutons de la navbar désactivés tant qu'aucune app n'est affichable ; recherche fermée quand une sheet s'ouvre.
- Filtre « Bibliothèques » codé mais masqué (`MY_APPS_FILTERS`).
- Écrans vides distincts : chargement, aucune app (avec « réessayer » si erreur), favoris vides, recherche vide, autre filtre vide.
- Données utilisées **hors de l'écran** : libellés des onglets, couleurs / icônes des apps (`blog`, `homework`, `news`, `communities`, `module-image`, `media`), badges des notifications de `timeline`.
- Surcharges en dur : `Directory` (couleur, icône), icône `viescolaire`, badges des notifications `ELEA.EXTERNAL_NOTIFICATION` et `TIMELINE.NOTIFY-REPORT`.

**Hors périmètre**

- Intents (`src/app/intents.ts`) : reportés (voir [later.md](later.md)).
- `useNotificationBadge` : dépend des définitions de notifications de `timeline` (redux). Remplacé le 2026-11-06 par `useNotificationEntApp` / `useNotificationEntAppDisplay` du module `notifications` (§5.5), qui lisent encore ces définitions.
- Les widgets `MYAPPS_WIDGET` (`widgets/*`) : malgré leur nom, ils sont affichés par `timeline`.

## 2. Existant

### 2.1 Module ancien (`src/framework/modules/myapps`)

| Dossier / fichier    | Contenu                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module-config.ts`   | `TAB_MODULE`, ordre 3, `hasRight: () => true`, `matchEntcoreApp: 'Portal'`, `entcoreTrackingName: 'Portal'`, `testID: 'tabbar-myapps'`.                                                                                                                                                                                                                              |
| `service/index.ts`   | `myAppsService` : `list` (`/applications-list`), `config` (`/myApps/config`), `bookmarks` (`GET /userbook/preference/apps`), `updateBookmarks` (`PUT`). Variante `createMyAppsServiceWithTokenFetch` pour la connexion.                                                                                                                                              |
| `reducer/`           | State `AppsInfoState` = `{ aggregatedApps, appsInfo, appsConfig, favorites }` ; actions `fetchSuccess` / `updateFavorites` ; thunks `refreshMyApps`, `toggleFavorite`, `saveGroupedFavorites`.                                                                                                                                                                       |
| `reducer/adapter.ts` | Logique métier (282 lignes) : `aggregateApps`, `enrichAppsWithModuleInfo`, `checkIfIsConnector`, `resolveAppCategory`, `appShouldBeAtBottom`, `applyFilter`, `buildAppLookupMap`, `resolveAppTheme` / `resolveAppBadge` / `resolveNotifBadge`, `getTabModuleDisplayName`. `buildAppLookupMap` et `loadAppsDataFromService` lisent `AllModules()`.                    |
| `utils/`             | `getAppName`, `getTranslatedAppLabel`, `computeTestID`, `normalizeIconName`, `getModuleRouteName`.                                                                                                                                                                                                                                                                   |
| `hooks/`             | `useAppTheme`, `useAppBadge`, `useNotificationBadge`, `useFilteredApps`.                                                                                                                                                                                                                                                                                             |
| `storage.ts`         | Déjà sur `Storage.account({ namespace: 'myapps' })` : `show-all-apps`, `onboarding` ; migration `remove-info-bubble-v1`. Lu par fonctions (`readShowAllApps`…) + `useState` dans les écrans.                                                                                                                                                                         |
| `screens/`           | `MyAppsHomeScreen` + `useMyAppsHomeController` (263 lignes).                                                                                                                                                                                                                                                                                                         |
| `components/`        | `MyAppsCard`, `MyAppsList`, `MyAppsFilters`, `MyAppsFilterCell`, `MyAppsMenuItem`, `MyAppsOnboardingModal` (sur `ModalBox` = `react-native-modal`), `ManageFavoritesModalScreen` (route `ModalsRouteNames.FavoritesManagement` de l'ancienne navigation). Les deux bottom sheets sont des `CustomBottomSheetModal` (`@gorhom/bottom-sheet`) dans `MyAppsHomeScreen`. |

**Chargement** : à la connexion, **bloquant** (`loadMyAppsAtLogin`, désactivé depuis le commit `167281518` : `ToDo` dans `src/modules/auth/flows/start-session.ts`), puis tirer-pour-rafraîchir. Aujourd'hui, rien ne charge les données.

**Responsabilités des données dans le state actuel** : `appsInfo` (liste brute enrichie) et `appsConfig` (config brute) ne servent **qu'à** calculer `aggregatedApps`, seul lu par l'UI ; `favorites` est copié dans chaque app agrégée (`isFavorite`) et réécrit dans tout l'agrégat à chaque bascule. Trois copies de la même donnée.

### 2.2 Module nouveau (`src/modules/myapps`), état actuel

- Avant la phase 0 : `CoreModule` avec un écran vide, un store zustand vide et une copie cassée de l'ancien service.
- Après la phase 1 : `EntModule` (§5.1, sans `sessionSetup` / `onSessionStart`, phase 2), `model/`, `use-cases.ts`, `util.ts`, `service/`, `store/`, `storage.ts`. `screens/home.tsx` est toujours une vue vide.
- Après la phase 1 bis (2026-11-06) : le code suit la conception des données du 2026-11-06 (§5.2 à §5.7) : `model/` (types + règles par objectif), `actions.ts`, `service/` (hydratation), `store/`. Détail en §9.
- Après la phase 2 (2026-11-06) : les apps se chargent avant la session et les préférences à son début (`session.ts`, §5.4). L'écran est toujours une vue vide (phase 4) ; le state est visible dans Reactotron.

### 2.3 Consommateurs externes

| Fichier                                                                                                               | Utilise                                           | Remplacement                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/framework/components/picture/module-image/component.tsx`                                                         | `useAppTheme(appName)`                            | `EntAppImage` (`useEntAppDisplay`) + `ModuleImage` par-dessus (prop `moduleName: AllModulesNames`) (fait ; appelants : `wiki`) |
| `src/framework/modules/blog/screens/BlogSelectScreen.tsx`                                                             | `useAppTheme('blog')`                             | `useModuleAppDisplay('blog')` (fait)                                                                                           |
| `src/framework/modules/homework/components/HomeworkSelectScreen.tsx`                                                  | `useAppTheme('homework')`                         | `useModuleAppDisplay('homework')` (fait)                                                                                       |
| `src/framework/modules/news/components/thumbnail-thread/component.tsx`                                                | `useAppTheme(moduleConfig.name)`                  | `useModuleAppDisplay(moduleConfig.name)` (fait)                                                                                |
| `src/framework/modules/communities/components/community-card-large/component.tsx`, `…/community-navbar/component.tsx` | `useAppTheme('communities')`                      | `useModuleAppDisplay('communities')` (fait)                                                                                    |
| `src/framework/modules/communities/components/community-card-small/component.tsx`                                     | `selectAggregatedApps(state).Communities`         | `useModuleAppDisplay('communities')` (fait ; on est dans le module `communities`)                                              |
| `src/framework/modules/timeline/components/notification-top-info.tsx`                                                 | `useNotificationBadge`                            | `useNotificationEntAppDisplay` de `notifications` (fait)                                                                       |
| `src/modules/media/hooks/resource-display.ts`                                                                         | `selectAggregatedApps` (par nom d'app ENT)        | `useEntApp(name)` (fait)                                                                                                       |
| `src/app/navigation/main-navigation.tsx` (ancienne nav)                                                               | `getTabModuleDisplayName`, `selectAggregatedApps` | `useEntApps` + `getModuleLabel` (fait ; à supprimer avec l'ancienne nav)                                                       |
| `src/framework/navigation/modals/navigator.tsx`                                                                       | `ManageFavoritesModalScreen`                      | modale `myapps/favorites`                                                                                                      |
| `src/app/navigation-new/tabs.tsx`                                                                                     | — (`@todo get names / colors from myApps`)        | `useModuleAppDisplay(module.name).label` (fait)                                                                                |

> ⚠️ Avant la phase 3, `buildAppLookupMap` lisait `AllModules()`, qui renvoie `[]` : **`useAppTheme` / `useAppBadge` renvoyaient toujours le thème par défaut**.

## 3. Comportements à conserver

Les noms ci-dessous sont ceux du code actuel ; leur renommage est proposé en §5.3.

### 3.1 Données

- [ ] Préférences : JSON dans `preference` de `/userbook/preference/apps` ; `{ applications: [], bookmarks: [] }` si absent ou illisible.
- [ ] Agrégation par nom d'app (`aggregateApps`) :
  - config de l'app par `name` ; une app dont l'adresse contient `library.edifice.io` et **sans catégorie** prend la config `library-info` (`isLibrary`). Avec la nouvelle API (`libraries` booléen), à revoir plus tard ([later.md](later.md)) ; en attendant, même règle ;
  - surcharges : `Directory` → couleur `green`, icône `userbook` ; icône `viescolaire` → `parametrage` ; icône normalisée (sans suffixe `-large`, minuscules, sans accents) ;
  - nom affiché (`getAppName`) : clé i18n `myapps-app-<prefix sans "/">`, sinon `myapps-app-<displayName normalisé>`, sinon `I18n.get(displayName)`, sinon `displayName`, sinon `name` ;
  - `testID` = `myapps-<name en kebab-case>` (vide si l'app n'a pas de config) ;
  - tri alphabétique sur le nom affiché.
- [ ] `isMobile` : un module de l'app a `matchEntcoreApp === app.name` et est disponible pour la session.
- [ ] `isConnector` : vrai si pas mobile, ou `target === '_blank'`, ou adresse absolue `http(s)://`, ou adresse contenant `#/`, ou pas de `prefix`.
- [ ] Catégories : `communication`, `organisation`, `pedagogy` ; le reste → « autres services ».
- [ ] Apps « en bas » (`appShouldBeAtBottom`) : connecteur, non mobile, hors des trois catégories.
- [ ] Seules les apps `display: true` sont listées dans « Mes applis ». Les autres restent connues : thème, libellés d'onglets, `media` (l'ancien agrégat les gardait, le filtre était à l'affichage).

### 3.2 `MyAppsHomeScreen`

- [ ] Filtres : Toutes · Favoris · Communication · Pédagogie · Organisation · Autres services (+ recherche).
- [ ] Interrupteur « afficher toutes les applis » (persisté par compte, `true` par défaut) : désactivé → seulement les modules (et les favoris en recherche) ; les apps « en bas » s'ajoutent pour Toutes, Autres services et la recherche (`useFilteredApps`). Le filtre Favoris ignore l'interrupteur.
- [ ] Filtre Toutes : liste groupée avec séparateur « autres services ».
- [ ] Appui sur une app : module → navigation vers sa route ; sinon `openUrl`, via `/auth/redirect?url=…` pour un connecteur.
- [ ] Lien d'aide : langue courante, puis langue de base (`fr-FR` → `fr`), puis `fr`.
- [ ] Onboarding : montré automatiquement une fois par session si la version vue n'est pas la version courante (règle corrigée, voir §4 n° 4-5) ; bouton de la navbar pour le revoir (icône `ui-notif` si jamais vu, `ui-notif-empty` sinon).

### 3.3 `ManageFavoritesModalScreen`

- [ ] Recherche, sélection multiple, bouton valider actif seulement si modifié, confirmation avant de quitter avec des modifications non enregistrées.
- [ ] Liste = toutes les apps selon l'interrupteur « afficher toutes les applis » ; fermeture après succès + toast.

### 3.4 Favoris (règle d'écriture)

- [ ] `PUT` de `{ applications, bookmarks }` ; `applications` est renvoyé tel quel. Si `applications` n'est pas vide, une bascule ne garde que les favoris présents dans `applications` (+ l'app basculée).

### 3.5 Stockage, tests E2E, i18n

- [ ] Namespace `myapps`, clés `show-all-apps` et `onboarding`, id de migration `remove-info-bubble-v1` inchangés.
- [ ] **Tous les `testID`** conservés : `tabbar-myapps`, `myapps-<app>`, `myapps-filter-*`, `myapps-navbar-notif(-empty)`, `myapps-navbar-context-menu`, `myapps-menu-manage-favorites`, `myapps-menu-access-by-browser`, `myapps-all-showed` / `myapps-all-hidden`, `myapps-toggle-favorite`, `myapps-app-info`, `myapps-empty-screen`, `myapps-empty-{favorites,search,other}`, `myapps-onboarding-modal(-later|-previous|-next|-complete)`.
- [ ] Clés i18n inchangées (`myapp-*` : 50, `myapps-app-*` : 53).

## 4. Ancienneté de conception à corriger au passage

| #   | Constat                                                                                                                                                                                     | Correction                                                                                                 | Statut                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | L'agrégat est calculé une fois et stocké en trois copies (§2.1).                                                                                                                            | Une seule copie par donnée : apps hydratées, préférences et modules séparés, combinés à la lecture (§5.3). | réglé par la cible               |
| 2   | Thème / badge / route d'un module trouvés par le registre statique `AllModules()` (vide aujourd'hui).                                                                                       | Hooks de module (§5.5).                                                                                    | réglé par la cible               |
| 3   | Service en deux variantes (`sessionFetch` / `tokenFetch`), 3 lectures en série, préférences mêlées aux apps.                                                                                | Nouvelle API `GET /api/me/applications` ; préférences à part ; `accountFetch` (§5.4).                      | réglé par la cible               |
| 4   | **Bug** : la version d'onboarding ne sert à rien. La condition est « jamais vu **et** version ≠ `v1` », or terminer l'onboarding écrit `seen: true` : passer à `v2` ne le remontrerait pas. | Montrer si la version enregistrée ≠ version courante.                                                      | **à corriger** (décidé)          |
| 5   | « Une fois par session » repose sur la clé `userId:accessToken` gardée dans un `Set` du module : le jeton change à chaque refresh, l'onboarding peut se remontrer dans la même session.     | Un drapeau dans le reducer de session (vidé à la fin de session).                                          | **à corriger** (décidé)          |
| 6   | Deux politiques d'écriture des favoris (explication ci-dessous).                                                                                                                            | Une seule : « après succès » partout.                                                                      | **à corriger** (décidé)          |
| 7   | Enchaînements par délais fixes : favoris ouverts 300 ms après la fermeture de la sheet, fermeture des favoris 400 ms après l'enregistrement, focus de la recherche à 250 ms.                | Supprimer les délais, enchaîner par la navigation ; n'en remettre que si un défaut d'animation réapparaît. | **à tenter** (décidé)            |
| 8   | Bottom sheets `@gorhom/bottom-sheet` pilotées par un état local (`isBottomSheetVisible`, `bottomSheetMode`, `selectedApp`).                                                                 | Deux écrans `formSheet` : `myapps/menu`, `myapps/app-actions` (params `{ appName }`).                      | conversion imposée               |
| 9   | `MyAppsOnboardingModal` sur `ModalBox` (`react-native-modal`) ouvert par ref.                                                                                                               | Écran `transparentModal` `myapps/onboarding`.                                                              | conversion imposée               |
| 10  | Remontée en haut de liste par écoute manuelle de `tabPress` sur le parent.                                                                                                                  | `useScrollToTop(ref)` (react-navigation).                                                                  | à faire au portage               |
| 11  | La confirmation de sortie de `ManageFavoritesModalScreen` n'intercepte que le bouton fermer : le geste de fermeture de la modale perd les modifications sans confirmation.                  | `useConfirmRemove` (`src/app/navigation-new/confirm-remove.tsx`).                                          | à faire au portage               |
| 12  | `navigation` typée `any` ; boutons de navbar posés par `setOptions` dans un effet, en double (`headerRight` + `unstable_headerRightItems`).                                                 | Options de `defineScreen` ; un composant de header qui lit ses hooks (état d'onboarding, apps vides).      | à faire au portage               |
| 13  | Recherche animée faite main dans `MyAppsFilters`.                                                                                                                                           | Possible : barre de recherche native du header (`headerSearchBarOptions`). Change l'UI.                    | plus tard ([later.md](later.md)) |
| 14  | Données d'UI rangées dans les données : `testID` calculé et stocké dans chaque app ; `displayName` et `icon` du serveur **écrasés** par le nom traduit et l'icône normalisée.               | `testID` calculé par `MyAppsCard` ; champs distincts (§5.3).                                               | à faire au portage               |
| 15  | Valeurs de catégories mi-français mi-anglais (`toutes`, `pedagogie`, `otherServices`), `pedagogy` du serveur traduit en `pedagogie`.                                                        | Garder les valeurs du serveur, `all` / `other` à part (§5.3).                                              | à faire au portage               |
| 16  | `getModuleRouteName` recalculé à l'appui alors que `routeName` est déjà dans l'agrégat ; `getDefaultAppTheme` fait un `require` dynamique du thème.                                         | Une seule source ; import normal.                                                                          | à faire au portage               |

**n° 6, deux politiques d'écriture des favoris.** Aujourd'hui, selon l'endroit où on modifie un favori, l'état change à des moments différents :

- **appui long → « Ajouter aux favoris »** : la sheet se ferme, l'appel `PUT` part **à la fermeture**, et l'étoile n'apparaît sur `MyAppsCard` **qu'après la réponse** du serveur (si l'appel échoue, rien ne change + toast d'erreur) ;
- **`ManageFavoritesModalScreen` → valider** : la liste derrière la modale est mise à jour **avant** l'appel (mise à jour « optimiste »), puis **remise comme avant** si l'appel échoue.

Deux codes (`toggleFavorite`, `saveGroupedFavorites`) pour la même écriture. Décidé : une seule politique, « après succès » partout (une action, pas de retour arrière ; la modale attend déjà la réponse avec un indicateur).

## 5. Cible

### 5.1 Config du module

```ts
export default new EntModule({
  name: 'myapps',
  hasRight: () => true, // toujours disponible
  entTrackingName: 'Portal',
  redux: { reducer },
  storages: [storage],
  sessionSetup, // apps (bloquant)
  onSessionStart, // préférences (favoris)
  entry: 'myapps/home', // accueil du module ; `tab.route` en hérite
  screens: { 'myapps/home': … },
  modals: { 'myapps/menu': …, 'myapps/app-actions': …, 'myapps/favorites': …, 'myapps/onboarding': … },
  tab: { order: 40, iconActive: 'ui-applications-fill', iconInactive: 'ui-applications', testId: 'tabbar-myapps' },
});
```

Pas de `matchEntcoreApp` : dans le nouveau système il **s'ajoute** à `hasRight` (le module ne serait visible que si l'app `Portal` est dans les droits). Le libellé de l'onglet passe par l'alias i18n `myapps` → `portal` (§5.5 ; décidé, à revoir plus tard : [later.md](later.md)).

### 5.2 Arborescence

Structure de module de [CONVENTIONS.md](CONVENTIONS.md) (« Structure d'un module »). Conception consolidée le 2026-11-06 (§7), appliquée en phase 1 bis.

```
src/modules/myapps/
├── index.ts                    EntModule (§5.1)
├── model/                      Domaine : ne sait rien de l'API, du store, du storage ni des modules de l'app
│   ├── index.ts                Types (§5.3) : EntApp, AppsPreferences, AppCategory, AppModule, AppOpeningStrategy
│   ├── display.ts              Affichage : libellé (sources ordonnées), icône (3 étapes), couleur (3 cas), aide
│   ├── opening.ts              Ouverture : isConnector (fait serveur), getAppOpeningStrategy
│   ├── classification.ts       Ségrégation : catégorie, bibliothèques (`library-info`), isOtherService, filterApps + MyAppsFilter
│   ├── favorites.ts            withFavoriteToggled, withFavorites
│   └── onboarding.ts           ONBOARDING_VERSION, isOnboardingSeen, shouldShowOnboarding
│                               (chaque fichier de règles a son test à côté)
├── actions.ts (+ test)         Actions de l'utilisateur : refreshMyApps, toggleFavorite, saveFavorites (plus tard : ouvrir une app)
├── session.ts (+ test)         Hooks de session : sessionSetup (apps), onSessionStart (préférences), §5.4
├── util.ts (+ test)            normalizeString, toKebabCase, getAppTestID
├── service/
│   ├── index.ts                `apps` (GET /api/me/applications → EntApp[]), `preferences` (GET / PUT /userbook/preference/apps)
│   ├── api.ts                  namespace API : EntAppResponse, PreferencesResponse… (ne sortent pas de `service/`)
│   └── adapter.ts (+ test)     API → modèle (hydratation des apps, préférences) et modèle → API (préférences)
├── store/                      Plomberie Redux seule (pas de thunks : voir actions.ts)
│   ├── state.ts                MyAppsState, initialState
│   ├── index.ts (+ test)       createSessionReducer
│   ├── action-creators.ts      Types d'actions Redux + action creators (terminologie Redux)
│   └── selectors.ts
├── storage.ts                  Storage.account `myapps` (clés inchangées) + format de l'onboarding stocké
├── hooks/                      API publique (§5.5) : apps.ts (apps, modules, libellés d'onglets), display.ts (affichage d'une app), list.ts (favoris, filtres)
├── screens/
│   ├── home/                   MyAppsHomeScreen (defineScreen)
│   ├── menu.tsx                formSheet (ex-sheet `home_menu`)
│   ├── app-actions.tsx         formSheet (ex-sheet `app_actions`)
│   ├── favorites/              ManageFavoritesModalScreen (defineModal)
│   └── onboarding/             MyAppsOnboardingModal (transparentModal)
└── components/                 MyAppsCard, MyAppsList, MyAppsFilters, MyAppsFilterCell, MyAppsMenuItem
```

`src/modules/myapps` existe déjà et reste là (pas de migration « sur place » dans `framework/modules`).

### 5.3 Modèle et responsabilités des données

**Trois données indépendantes, jamais mélangées** :

| Donnée                                            | Source                                                | Durée de vie                                    | Où                            |
| ------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| Apps (`EntApp[]`)                                 | `GET /api/me/applications`, hydratée par le service   | session (rechargée au rafraîchissement)         | store                         |
| Préférences (`AppsPreferences`, dont les favoris) | `/userbook/preference/apps`                           | change pendant la session (bascule d'un favori) | store, à part                 |
| Modules de l'app mobile                           | `useUserAvailableModules()` (droits de l'utilisateur) | code de l'app + session                         | jamais stockés : lus par hook |

Une app ne contient **ni** ses favoris **ni** son module : ils sont combinés **à la lecture** (hooks, `filterApps`). Ce qui en dépend (`isFavorite`, stratégie d'ouverture, `isOtherService`) n'est jamais stocké.

**State Redux** (`store/state.ts`, pas dans le modèle) :

```ts
type MyAppsState = {
  apps: { status: 'idle' | 'loaded' | 'error'; data: EntApp[] }; // toutes les apps, `display` ou non
  preferences: { status: 'idle' | 'loaded' | 'error'; data: AppsPreferences };
  onboardingShown: boolean; // montré automatiquement pendant cette session (§4 n° 5)
};
```

**Modèle** (`model/index.ts`) :

```ts
/** Une app de l'ENT, hydratée à la réception : ne dépend que de la réponse du serveur (et de la langue, voir plus bas). */
interface EntApp {
  name: string; // identifiant ENT (« Actualites ») : clé de `matchEntcoreApp` et des favoris
  label: string; // model/display.ts
  icon: string; // model/display.ts
  color?: ThemeColorName; // model/display.ts ; couleur de la palette (`~/app/theme`) ; absente → couleurs par défaut à l'affichage
  category: AppCategory; // model/classification.ts
  isLibrary: boolean; // model/classification.ts
  helpUrls: Record<string, string>; // langue → URL ; `{}` sans aide
  display: boolean; // listée dans « Mes applis » (nom du serveur, connu des développeurs)
  address: string; // « /actualites » ou URL absolue
  isConnector: boolean; // fait serveur : l'adresse ne peut s'ouvrir que par /auth/redirect (model/opening.ts)
}

interface AppsPreferences {
  applications: string[]; // renvoyé tel quel au serveur ; restreint les favoris (§3.4)
  favorites: string[]; // `bookmarks` côté API
}

/** Ce que myapps sait d'un module de l'app (donnée simple, construite par hook depuis `useUserAvailableModules`). */
interface AppModule {
  name: string;
  entry?: string;
}

/** Comment ouvrir une app. Calculée à la lecture (dépend des modules). */
type AppOpeningStrategy =
  | { kind: 'module'; moduleName: string } // module disponible avec une `entry`
  | { kind: 'web'; url: string } // module disponible sans `entry` : son adresse
  | { kind: 'connector'; url: string }; // pas de module, ou `isConnector` : via /auth/redirect
```

**Réponse de l'API** (`service/api.ts`, `namespace API`, ne sort pas de `service/`). Exemple fourni le 2026-11-04 : un tableau qui réunit les champs de `/applications-list` et de `/myApps/config`, plus `appName`.

```ts
namespace API {
  interface EntAppResponse {
    name: string;
    address: string; // « /actualites »
    icon: string; // « actualites-large »
    target: string; // « » ou « _blank »
    displayName: string; // « actualites » (clé, pas un libellé)
    appName?: string; // « Actualités » : libellé traduit par le serveur (pas encore utilisé, later.md)
    display: boolean;
    prefix: string; // « /actualites » ; absent ou vide pour un connecteur
    casType: string; // inutilisé
    scope: string[]; // inutilisé
    isExternal: boolean; // pas encore utilisé (later.md)
    category?: string; // « communication » | « pedagogy » | « organisation » | …
    color?: string; // clé de `theme.palette.complementary`
    libraries?: boolean; // pas encore utilisé (later.md)
    help?: Record<string, string>;
  }
  interface PreferencesResponse {
    preference?: string | null; // JSON de { applications, bookmarks }
  }
}
```

**Hydratation** (`service/adapter.ts`, appelée par `myAppsService.apps`) : `API.EntAppResponse[]` → `EntApp[]`, avec les règles de `model/`.

1. Mettre de côté l'entrée `library-info` : c'est la config des bibliothèques, pas une app (elle n'est pas stockée).
2. Pour chaque autre entrée, **sans filtrer sur `display`** (les apps masquées servent aux autres modules : thème, libellé d'onglet, `media`) :
   - bibliothèque (`library.ts`) : si oui, catégorie, couleur et aide viennent de `library-info` ;
   - `label` (`label.ts`), `icon` (`icon.ts`), `color` (`color.ts`), `category` (`category.ts`) ;
   - `isConnector` (`opening.ts`) : `target === '_blank'`, ou adresse absolue `http(s)://`, ou adresse contenant `#/`, ou pas de `prefix`.
3. Pas de tri : l'ordre d'affichage est l'affaire de l'écran (`filterApps`).

Le service reçoit `translate` en paramètre (l'appelant passe `I18n.get`) : il n'importe pas l'i18n.

**Règles mises en valeur** (regroupées par objectif dans `model/`, chacune dans sa section avec un en-tête qui dit d'où elle vient) :

- **Bibliothèque** (`classification.ts`) : une app dont l'adresse contient `library.edifice.io` et **sans catégorie** est une bibliothèque ; elle prend la catégorie, la couleur et l'aide de `library-info` (`getAppConfig`). Règle héritée, arbitraire : le champ `libraries` du serveur doit la remplacer ([later.md](later.md)).
- **Libellé** (`display.ts`) : liste ordonnée de sources, la première qui donne un résultat gagne :
  1. traduction de `myapps-app-<prefix sans « / »>` ;
  2. traduction de `myapps-app-<displayName normalisé>` ;
  3. `displayName` traduit comme clé i18n, ou tel quel ;
  4. `name`.

  Plus tard, `appName` du serveur deviendra la source n° 0 ([later.md](later.md)).

- **Icône** (`display.ts`), trois étapes nommées : surcharge par nom d'app (`Directory` → `userbook`) ; normalisation de l'icône serveur (sans `-large`, minuscules, sans accents) ; renommage (`viescolaire` → `parametrage`).
- **Couleur** (`display.ts`), un cas par branche : surcharge par nom d'app (`Directory` → `green`) ; couleur de la config (la sienne, ou celle de `library-info` pour une bibliothèque), si la palette l'a (`isThemeColorName`) ; aucune (pas de couleur, ou une que la palette n'a pas) → couleurs par défaut à l'affichage. Typée `ThemeColorName` (`~/app/theme`) : le modèle connaît les noms des couleurs de la palette, pour l'autocomplétion.

**Favoris** : `favorites` partout (modèle, store, règles, hooks) ; `bookmarks` n'existe que dans `API.*` et l'adapter. Règles : `withFavoriteToggled(preferences, appName)`, `withFavorites(preferences, favorites)` (§3.4).

**Langue** : `label` est calculé à la réception, dans la langue du moment. Changer de langue dans l'app la redémarre (`I18n.changeLanguage` → `RNRestart.restart()`), donc la session se recharge. Seul trou : langue « auto » et langue du système changée pendant que l'app est en arrière-plan ; le libellé ne suit qu'au prochain rafraîchissement. Accepté ; sujet transverse dans [later.md](later.md).

Renommages par rapport à l'ancien code (« naming douteux » ; les champs du serveur restent tels quels dans `API.*`) :

| Ancien                                                                                             | Nouveau                                                                                          | Pourquoi                                               |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `ApplicationsList`, `AppsInfo`, `AppsInfoAggregated`, `AppsInfoWithCategory`, `ApplicationsConfig` | `API.EntAppResponse` (réponse), `EntApp` (app hydratée)                                          | 5 types pour une même chose ; « info » ne dit rien     |
| `favorites: AppBookmarks { applications, bookmarks }`                                              | `preferences: AppsPreferences { applications, favorites }`                                       | ce sont les préférences ; un seul mot pour les favoris |
| `isMobile` + `routeName`                                                                           | rien dans l'app : le module se lit par hook (§5.5)                                               | dépend de l'app mobile, pas du serveur                 |
| `isConnector` (calculé avec `isMobile`)                                                            | `isConnector` (fait serveur seul) + `AppOpeningStrategy`                                         | sépare la donnée de la façon d'ouvrir                  |
| `appShouldBeAtBottom`                                                                              | `isOtherService(app, module)`                                                                    | dit ce que c'est, pas où l'afficher                    |
| `displayName` (écrasé), `icon` (écrasé)                                                            | `label`, `icon` (calculés) ; le brut n'est pas gardé                                             | §4 n° 14                                               |
| `MyAppsFilterCategories` (`toutes`, `pedagogie`, `otherServices`)                                  | catégorie serveur (`communication`, `pedagogy`, `organisation`) \| `other` ; filtre `all` à part | §4 n° 15                                               |
| `help`                                                                                             | `helpUrls`                                                                                       | table langue → URL                                     |

### 5.4 Chargement (hooks de session)

Dans `session.ts` : `createMyAppsSessionHooks({ dispatch, translate })` donne `sessionSetup` et `onSessionStart` ; `index.ts` les branche avec `getStore().dispatch` et `I18n.get` (le store n'existe pas encore quand le module est déclaré). Ainsi testables sans l'app.

- **Apps** — `sessionSetup(session, { signal })` : `myAppsService.apps(session, { signal, translate: I18n.get })`, renvoie `{ commit }` qui dispatch les `EntApp[]` (`getStore().dispatch`, comme `dispatchToLegacyStore`). **Bloquant, comme l'ancien** : si l'appel échoue, la connexion échoue (`SessionSetupError`). Raison : les libellés d'onglets et la liste en dépendent dès l'affichage.
- **Préférences (favoris)** — `onSessionStart(session, { signal })` : non bloquant ; ne servent qu'à `myapps`. En cas d'échec : `status: 'error'`, l'écran le signale au tirer-pour-rafraîchir. Rien n'est écrit si la session s'est terminée entre-temps (`signal`).
- **Rafraîchir** (tirer-pour-rafraîchir, « réessayer ») : `refreshMyApps({ translate })` (`actions.ts`), les deux lectures, avec la session.
- Ordre à la connexion (`setActiveAccount`) : `sessionSetup` → fin de la session précédente (stores vidés) → compte enregistré → `commit` → `onSessionStart`. La restauration d'un compte au lancement passe par le même chemin. Un renouvellement du même compte (sans requirement) relance `sessionSetup` et son `commit`, mais pas `onSessionStart`.
- Fin de session : `createSessionReducer` remet le state à zéro (`resetSessionStores` dispatch l'action de fin de session).

### 5.5 Flux de données et API publique (`hooks/`)

Les hooks combinent les trois données de §5.3 (apps du store, préférences du store, modules par `useUserAvailableModules()`). Plus de `buildAppLookupMap` ni d'`AllModules()`.

| Hook                              | Rôle                                                                                                                                                                                              | Remplace                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `useEntApps()`                    | Toutes les apps (`EntApp[]`), statut, `refresh`                                                                                                                                                   | `selectAggregatedApps`                                 |
| `useEntApp(entAppName)`           | Une app par son nom ENT (`'Blog'`, `'Espace documentaire'`…), `display` ou non                                                                                                                    | `aggregatedApps[name]` (`media`, `communities`)        |
| `useAppModules()`                 | Module (`AppModule`) de chaque app, par `matchEntcoreApp`, depuis `useUserAvailableModules()`                                                                                                     | `isMobile`, `routeName`                                |
| `useModuleApp(moduleName)`        | L'app d'un module : `useModules()` → `matchEntcoreApp` → `useEntApp`                                                                                                                              | la partie « par nom de module » de `buildAppLookupMap` |
| `useFavorites()`                  | Favoris (`Set`), statut, `toggle(appName)`, `save(favorites)`                                                                                                                                     | `isFavorite` dans l'agrégat                            |
| `useEntAppDisplay(entAppName)`    | Affichage d'une app par son nom ENT : `{ colors: IShades, icon, label }`, valeurs par défaut sinon                                                                                                | `useAppTheme`, `useAppBadge`, `aggregatedApps[name]`   |
| `useModuleAppDisplay(moduleName)` | Idem par le nom d'un module (`matchEntcoreApp`) ; libellé du module si l'app est inconnue (`getModuleLabel` : i18n `myapps-app-*`, alias `myapps` → `portal`). Donne aussi le libellé des onglets | `useAppTheme(moduleName)`, `getTabModuleDisplayName`   |
| `useFilteredApps(filter)`         | Liste de l'écran : `filterApps` avec apps, favoris, modules et l'interrupteur (`useStorageBoolean`)                                                                                               | idem                                                   |
| `useShowAllApps()`                | L'interrupteur « afficher toutes les applis » (`true` sans valeur stockée)                                                                                                                        | `readShowAllApps` / `writeShowAllApps` + `useState`    |

**`filterApps(apps, filter, { favorites, getModule, showAllApps })`** (`model/classification.ts`) : ne garde que les apps `display`, applique le filtre (§3.2), place les « autres services » (`isOtherService`), trie par `label`.

**Affichage d'une app** (`hooks/display.ts`, relecture du 2026-11-06) : `EntAppDisplay = { colors: IShades, icon, label }`, prêt à l'emploi. Par défaut : couleurs **primaires** (`DEFAULT_APP_COLORS`), icône `ui-infoCircle` (`DEFAULT_APP_ICON`), libellé = nom donné (ENT) ou libellé du module (`getModuleLabel`). Fonctions pures : `getEntAppDisplay(app, fallbackLabel)`, `getAppShades(color)` (une couleur sans toutes ses nuances, `nabook-color`, n'en est pas une). Plus de `useAppTheme` / `useAppBadge` : un badge est un objet `{ icon, color: colors.regular }` construit par l'appelant (ex. `ContentCardIcon` de `timeline`), pas un hook.

**Nom d'app ENT ou module ?** On passe par l'app ENT (`useEntAppDisplay`, `EntAppImage`) quand le nom vient du serveur (une ressource, une notification…) ; par le module (`useModuleAppDisplay`, `ModuleImage`) quand le module est connu du code, passé directement (son propre module, un module typé `AllModulesNames`). Les composants d'image (`src/framework/components/picture/`) : `EntAppImage` (image d'une ressource ; à défaut, couleurs et icône de l'app) et `ModuleImage`, qui donne à `EntAppImage` l'app de son module (`useModuleAppName`).

**App d'une notification** (module `notifications`, `src/modules/notifications/hooks.ts`) : `useNotificationEntApp(type, eventType)` (l'app de la définition du type, `app-name`) et `useNotificationEntAppDisplay(type, eventType)` (son affichage, avec les surcharges propres à certains types : `ELEA.EXTERNAL_NOTIFICATION`, `TIMELINE.NOTIFY-REPORT`). Les définitions sont encore lues dans le redux de l'ancien `timeline` (`ToDo(timeline-migration)`) : `notifications` centralise ce qui touche aux notifications, pour l'extraire de `timeline`.

Recherche par nom de module : seulement parmi les modules chargés (`useModules()`). Tant qu'un module n'est pas migré, `useModuleAppDisplay('<son nom>')` donne l'affichage par défaut, comme avant (l'ancien registre `AllModules()` était vide) ; par nom ENT (`useEntAppDisplay('Communities')`), l'app est trouvée.

La recherche par **scope** de `buildAppLookupMap` (un `entcoreScope` pointe vers l'app) n'est utilisée par aucun appelant connu : non reprise, sauf besoin constaté.

### 5.6 Ouvrir une app

`getAppOpeningStrategy(app, module)` (`model/opening.ts`), `module` venant de `useAppModules()` :

- module disponible **avec** une `entry` → `{ kind: 'module', moduleName }` : `openModule(moduleName)` ;
- module disponible **sans** `entry`, et `!app.isConnector` → `{ kind: 'web', url: app.address }` : `openUrl` ;
- sinon (pas de module, ou `isConnector`) → `{ kind: 'connector', url: '/auth/redirect?url=<address>' }` : `openUrl`.

`kind` sert aussi à l'affichage (`MyAppsCard` : pictogramme web ou connecteur). `isOtherService(app, module)` : pas de module et catégorie `other`.

**`useOpenModule`** : API publique **du framework** (`src/app/navigation-new/open-module.ts`), réutilisable plus tard par les notifications, les intents et les liens profonds.

- `const openModule = useOpenModule(); openModule('blog')`. Le nom est typé sur les seuls modules qui ont une `entry`. Renvoie `false` sans rien faire si le module n'est pas disponible pour l'utilisateur.
- Module à onglet → `JUMP_TO` vers `getTabScreenName(name)` (l'onglet s'ouvre sur `tab.route`, donc sur `entry`) ; module sans onglet → `navigate(entry)` dans l'onglet courant. Pas de traitement particulier pour un onglet déjà ouvert plus loin dans sa pile : le fonctionnel ne permet pas ce cas.
- `entry` doit être une route **sans params obligatoires** (vérifié par son type).
- Ne fonctionne que depuis un écran des onglets, pas depuis une modale : à prendre en compte pour `myapps/app-actions` (phase 5).

### 5.7 Droits

`isModuleAvailableForUser(module, session)` dans `src/app/module/rights.ts` (phase 0, renommé en phase 1 bis) : `CoreModule` toujours ; `EntModule` si `matchEntcoreApp` (s'il existe) est dans `session.rights.apps`, `matchEntcoreWidget` (s'il existe) dans `session.rights.widgets`, **et** `hasRight(session)`. Dans un composant : `useUserAvailableModules()` (ex-`useAvailableModules`, `src/app/module/hooks.tsx` ; l'homonyme de l'ancien système, `src/app/modules.ts`, n'est pas touché). Les noms disent que le résultat dépend des **droits de l'utilisateur**.

### 5.8 Navigation

| Route                | Type                                               | Ancien                                 |
| -------------------- | -------------------------------------------------- | -------------------------------------- |
| `myapps/home`        | écran (onglet)                                     | route `myapps`                         |
| `myapps/menu`        | `formSheet`, `fitToContents`                       | sheet `home_menu`                      |
| `myapps/app-actions` | `formSheet`, `fitToContents`, params `{ appName }` | sheet `app_actions`                    |
| `myapps/favorites`   | modale (`presentation: 'modal'`)                   | `ModalsRouteNames.FavoritesManagement` |
| `myapps/onboarding`  | `transparentModal`                                 | `MyAppsOnboardingModal` (`ModalBox`)   |

- « Gérer les favoris » depuis `myapps/menu` : fermer la sheet puis ouvrir `myapps/favorites`, **sans délai** (§4 n° 7).
- Onboarding automatique : au focus de `myapps/home`, si à montrer et pas encore montré pendant la session → navigation vers `myapps/onboarding`.
- L'interrupteur « afficher toutes les applis » est dans `myapps/menu` : `useStorageBoolean` met à jour `myapps/home` derrière sans autre plomberie.

### 5.9 Stockage

`storage.ts` est déplacé tel quel (il utilise déjà `Storage.account` avec migration) et déclaré dans `storages`. Les fonctions `readShowAllApps` / `writeShowAllApps` / `readMyAppsOnboardingSeen` + `useState` des écrans sont remplacées par `useStorageBoolean(storage, 'show-all-apps')` et `useStorageJSON(storage, 'onboarding')`. Attention : `show-all-apps` absent vaut `true` (comportement historique documenté dans `storage.ts`).

### 5.10 Façades `@deprecated`

Plus de façade pour les autres modules (relecture du 2026-11-06) : ils passent tous aux nouveaux hooks (§2.3). `useAppTheme`, `useAppBadge` et `useNotificationBadge` sont supprimés. Les sélecteurs `selectAppsState`, `selectAggregatedApps`, `selectAppBookmarks` (`framework/modules/myapps/reducer/selectors.ts`) ne servent plus qu'à l'ancien code de `framework/modules/myapps` (écrans, modale des favoris, inatteignables) : ils construisent l'ancien agrégat à partir du nouveau state et disparaissent avec lui en phase 7 (`ToDo(myapps-migration)`).

## 6. Plan par phases

| #     | Phase                                           | Contenu                                                                                                                                                                                                                                                                                                                                                                              | Validation                                                    |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 0     | Préalables (**fait**)                           | `isModuleAvailable` dans `src/app/module/` (+ filtrage des onglets) ; clé `entry` sur `ModuleConfig`, `tab.route` qui en hérite ; `useOpenModule` / `canOpenModule` (§5.6)                                                                                                                                                                                                           | tsc, tests unitaires de la disponibilité                      |
| 1     | Modèle + service + store + storage (**fait**)   | `model/`, `use-cases.ts`, `util.ts`, `service/`, `store/`, `storage.ts` ; `EntModule` ; suppression de l'ancien `store.ts` (zustand) et de l'ancien `service.ts`                                                                                                                                                                                                                     | tests Jest de `model/business.ts`, `use-cases.ts`             |
| 1 bis | Reprise de la conception des données (**fait**) | Conformer le code à §5.2-§5.7 : `EntApp` hydraté par le service (`service/api.ts`, `adapter.ts`), règles du modèle, store `apps` + `preferences.favorites`, `filterApps` avec trois entrées et filtre `display`, `getAppOpeningStrategy` ; renommer `isModuleAvailable` → `isModuleAvailableForUser`, `useAvailableModules` → `useUserAvailableModules` (code, ARCHITECTURE, STATUS) | tsc, eslint, tests Jest (règles, adapter, store, use-cases)   |
| 2     | Chargement (**fait**)                           | `sessionSetup` (apps), `onSessionStart` (préférences), `refresh` ; retrait du `ToDo` de `start-session.ts`                                                                                                                                                                                                                                                                           | connexion : state rempli ; API en panne : connexion refusée   |
| 3     | API publique (**fait**)                         | hooks §5.5 ; `tabs.tsx` ; façades §5.10 ; `media/resource-display.ts`                                                                                                                                                                                                                                                                                                                | libellés d'onglets ; thème des apps                           |
| 4     | `MyAppsHomeScreen`                              | port de l'écran, `MyAppsList`, `MyAppsCard`, `MyAppsFilters` ; header par options ; `useScrollToTop`                                                                                                                                                                                                                                                                                 | parcours E2E (testIDs §3.5)                                   |
| 5     | Modales                                         | `myapps/menu`, `myapps/app-actions`, `myapps/favorites` (`useConfirmRemove`), `myapps/onboarding` ; corrections §4 n° 4-7                                                                                                                                                                                                                                                            | règles §3.2-3.4                                               |
| 6     | Ouvrir une app                                  | §5.6                                                                                                                                                                                                                                                                                                                                                                                 | modules, apps web, connecteurs                                |
| 7     | Nettoyage                                       | suppression de `framework/modules/myapps` hors façades, de `ModalsRouteNames.FavoritesManagement`                                                                                                                                                                                                                                                                                    | `grep -rn "framework/modules/myapps" src` = façades seulement |

## 7. Décisions

- **2026-11-04** — Intents hors périmètre (reportés pour toute la migration).
- **2026-11-04** — State en **Redux** (pas de zustand) : `redux: { reducer }`, `createSessionReducer`.
- **2026-11-04** — Apps chargées par **`GET /api/me/applications`** (remplace `/applications-list` + `/myApps/config`) ; les préférences (`/userbook/preference/apps`) à part.
- **2026-11-04** — Chargement par les hooks de session ; `sessionSetup` des apps **bloquant comme l'ancien** (échec = connexion refusée).
- **2026-11-04** — Pas de `buildAppLookupMap` ni d'`AllModules()` : données dérivées par les hooks de module, flux revu (§5.5).
- **2026-11-04** — Stockage par le framework de storage et ses hooks, clés inchangées.
- **2026-11-04** — `isModuleAvailable` = phase 0 de cette migration.
- **2026-11-04** — `EntModule` avec `hasRight: () => true`. Ordre d'onglet **40**.
- **2026-11-04** — §4 : n° 4 et 5 corrigés ; n° 7 tenté sans délais.
- **2026-11-04** — Bottom sheets → `formSheet`, `ModalBox` → `transparentModal` (règle générale, [CONVENTIONS.md](CONVENTIONS.md)).
- **2026-11-04** — Route d'entrée d'un module : clé de config **`entry?: keyof Screens`, facultative**. `tab.route` vaut `entry` par défaut (et non l'inverse). Un module sans `entry` ne s'ouvre pas comme module.
- **2026-11-04** — Favoris : une seule politique d'écriture, « après succès » (§4 n° 6).
- **2026-11-04** — Libellé de l'onglet `myapps` par l'i18n (`myapps-app-portal`), et le même libellé pour tous les onglets (nom de l'app du serveur, sinon i18n ; `useModuleAppDisplay` depuis le 2026-11-06). Accepté, **à revoir plus tard** ([later.md](later.md)).
- **2026-11-04** — Recherche native du header (§4 n° 13) : plus tard ([later.md](later.md)).
- **2026-11-04** — `useOpenModule` (+ `canOpenModule`) : API publique du framework pour ouvrir un module (§5.6).
- **2026-11-04** — Détails de `GET /api/me/applications` (bibliothèques, langue d'`appName`, disponibilité sur toutes les plateformes) : plus tard ([later.md](later.md)). En attendant : détection actuelle des bibliothèques, libellés par l'i18n, pas de repli sur les anciennes routes.
- **2026-11-06** — Structure revue : `model/` ne connaît ni l'API, ni le store, ni le storage ; règles (`model/business.ts`, puis `model/rules/` : décision suivante), use-cases (`use-cases.ts`) et utilitaires (`util.ts`) séparés ; toute la logique Redux, type du state compris, dans `store/` (ex-`reducer/`). Règle générale : [CONVENTIONS.md](CONVENTIONS.md).
- **2026-11-06** — Conception des données revue (remplace « le state ne contient que ce que renvoie le serveur » et le nom provisoire `UserApp`) :
  - `EntApp` : l'app **hydratée à la réception**, à partir de la réponse du serveur seule (et de la langue). Elle est **stockée** : elle vit le temps de la session, inutile de la recalculer.
  - La réponse de l'API s'appelle `API.EntAppResponse` (`namespace API`, `service/api.ts`) et ne sort pas de `service/`. **Le service hydrate** et renvoie des `EntApp` (le `translate` lui est passé).
  - **Ni favoris ni module dans l'app.** Les favoris n'ont rien à voir avec la donnée des apps (préférences à part) ; le module dépend de l'app mobile et des droits, il se lit par hook (`useUserAvailableModules`) et n'est jamais stocké. La stratégie d'ouverture et `isOtherService` sont calculés à la lecture.
  - Pas de séparation de type app / connecteur : peu de champs optionnels restent dans `EntApp`. La séparation porte sur `AppOpeningStrategy` (`module` / `web` / `connector`), qui remplace `kind` + `module?` + `url?`.
  - **Toutes les apps sont stockées**, `display` ou non : les apps masquées servent aux autres modules (thème, libellés). `display` garde son nom (connu des développeurs) ; le filtre est dans `filterApps`.
  - Règles du modèle expliquées en tête : les règles arbitraires ou compliquées (bibliothèques, libellé, icône, couleur) doivent se voir. Regroupées par objectif (décision suivante).
  - `favorites` partout ; `bookmarks` seulement dans `API.*` et l'adapter.
  - Noms : `getAppOpeningStrategy` ; `isModuleAvailable` → `isModuleAvailableForUser` et `useAvailableModules` → `useUserAvailableModules` (le résultat dépend des droits de l'utilisateur).
- **2026-11-06** — Affichage des apps pour les autres modules : `useEntAppDisplay` / `useModuleAppDisplay` (`{ colors, icon, label }`, couleurs primaires par défaut) au lieu de `useAppTheme` / `useAppBadge` ; un badge est un objet construit par l'appelant, pas un hook ; l'app d'une notification se lit par `useNotificationEntApp` du module `notifications` ; `selectAggregatedApps` n'est plus exposé aux autres modules (gardé pour l'ancien code jusqu'à la phase 7).
- **2026-11-06** (utilisateur) — `useModuleAppDisplay`, `useModuleApp`, `useModuleAppName` prennent un `AllModulesNames` : on ne peut demander que l'app d'un module qui existe dans l'app. Les appels avec le nom d'un module pas encore migré (`blog`, `homework`, `news`, `communities` ×2, et `wiki` via `ModuleImage`) sont des erreurs de type **voulues**, corrigées au fil des migrations. `ModuleWithRights` prend aussi le nom d'un module de l'app (`Pick<AnyModule, 'name'>`).
- **2026-11-06** — Langue : pas de mécanisme de changement de langue sans redémarrage pour l'instant (l'app redémarre déjà). Sujet transverse dans [later.md](later.md).
- **2026-11-06** — Relecture du code de la phase 1 bis :
  - règles du modèle **regroupées par objectif** dans `model/` (`display.ts`, `opening.ts`, `classification.ts`, `favorites.ts`, `onboarding.ts`) : `model/rules/` comptait trop de petits fichiers ;
  - `filterApps` est une règle du modèle (`classification.ts`), pure ;
  - `use-cases.ts` disparaît. **`actions.ts`** (racine du module) regroupe les actions déclenchées par l'utilisateur : les thunks `refreshMyApps`, `toggleFavorite`, `saveFavorites` y passent ; plus tard, ouvrir une app ;
  - `store/` ne garde que la plomberie Redux ; ses types d'actions et action creators passent dans `store/action-creators.ts` (ex-`store/actions.ts`), pour ne pas confondre avec `actions.ts` et rester proche de la terminologie Redux.

## 8. Questions ouvertes

Aucune question bloquante. Ce qui est remis à plus tard est dans [later.md](later.md).

## 9. Avancement

- 2026-11-04 : spec v1, puis v2 après revue ; toutes les questions tranchées ou reportées (§7).
- 2026-11-04 : **phase 0 faite.**
  - `isModuleAvailable(module, session)` : `src/app/module/rights.ts` (+ `rights.test.ts`, 14 tests) ; `useAvailableModules()` dans `src/app/module/hooks.tsx` (aucun module sans session).
  - Onglets filtrés par `if` sur chaque écran d'onglet (`src/app/navigation-new/tabs.tsx`) : la navigation reste statique. Sans session (onglets en train de partir), aucun onglet n'est masqué, pour ne jamais laisser le navigateur d'onglets vide.
  - Clé `entry?` sur `ModuleConfig` (6ᵉ générique `Entry` de `Module` / `CoreModule` / `EntModule`), restreinte aux écrans sans params obligatoires (`EntryRoute`). `tab.route` facultatif, vaut `entry` par défaut ; un onglet sans l'un ni l'autre lève une erreur au chargement du module. `AllModulesWithEntryNames` liste les modules ouvrables.
  - `useOpenModule()` / `useCanOpenModule()` : `src/app/navigation-new/open-module.ts`, exportés par `~/app/navigation-new`. Ne fonctionnent que depuis un écran des onglets (`JUMP_TO` / `navigate` remontent vers les navigateurs parents), pas depuis une modale.
  - `myapps` : `entry: 'myapps/home'`, `tab.route` retiré.
- 2026-11-04 : **phase 1 faite** (modèle, service, store Redux, storage, `EntModule`), puis reprise en phase 1 bis le 2026-11-06 : l'état du code est décrit ci-dessous.
- 2026-11-06 : **conception des données revue** avec l'utilisateur (§5.2 à §5.7, décisions §7).
- 2026-11-06 : **phase 1 bis faite.** Le code suit §5.2 à §5.7.
  - `model/index.ts` : types seuls (`EntApp`, `AppsPreferences` avec `favorites` + `EMPTY_PREFERENCES`, `AppCategory`, `AppModule`, `AppOpeningStrategy`). Ni l'API, ni le state, ni le storage, ni les modules.
  - Règles du modèle, regroupées par objectif (relecture du 2026-11-06), chacune avec son test et un en-tête qui dit d'où vient la règle :
    - `model/display.ts` : `getAppLabel` (sources ordonnées, type `Translate`), `getAppIcon` (trois étapes), `getAppColor` (trois cas), `hasHelpUrl`, `getHelpUrl` ;
    - `model/opening.ts` : `isConnector`, `getConnectorUrl`, `getAppOpeningStrategy` ;
    - `model/classification.ts` : `getAppCategory`, bibliothèques (`isLibrary`, `getAppConfig`, `LIBRARY_CONFIG_APP_NAME`), `isOtherService`, `filterApps` + `MyAppsFilter` ;
    - `model/favorites.ts` (`withFavoriteToggled`, `withFavorites`), `model/onboarding.ts`.
    - `model/business.ts`, `model/rules/` et `use-cases.ts` n'existent plus.
  - `service/api.ts` : `namespace API` (`EntAppResponse`, `PreferencesResponse`, `Preferences`). `service/adapter.ts` : `toEntApps` (hydratation : toutes les apps, sans `library-info`, dans l'ordre du serveur), `toPreferences` / `fromPreferences` (`bookmarks` ↔ `favorites`). `service/index.ts` : `apps(account, { signal, translate })` renvoie des `EntApp[]`, `preferences.get` / `put` des `AppsPreferences`.
  - `actions.ts` (actions de l'utilisateur) : `refreshMyApps({ translate })` (les deux lectures en parallèle), `toggleFavorite`, `saveFavorites` (une seule politique « après succès », §4 n° 6, lèvent une erreur en cas d'échec).
  - `store/` (plomberie Redux) : state `apps` + `preferences` + `onboardingShown` ; `action-creators.ts` : actions Redux `appsLoaded/Failed`, `preferencesLoaded/Failed`, `onboardingShown` ; sélecteurs `selectApps`, `selectPreferences`, `selectOnboardingShown`.
  - `filterApps(apps, filter, { favorites, getModule, showAllApps })` (`model/classification.ts`, règles de `applyFilter` + `useFilteredApps`) : filtre `display`, tri par `label`, filtres `all`, `favorites`, `category`, `other-services` (les apps `isOtherService`, **pas** la catégorie `other`), `libraries`, `search`.
  - `util.ts` : `normalizeString`, `toKebabCase`, `getAppTestID` (UI, pour `MyAppsCard`).
  - `storage.ts` : clés et migration inchangées, plus le format stocké de l'onboarding (`OnboardingData`) et `getSeenOnboardingVersion`. L'ancien `framework/modules/myapps/storage.ts` est une façade `@deprecated` (ses `read*` / `write*` servent encore aux anciens écrans).
  - `index.ts` : `EntModule` avec `hasRight: () => true`, `entTrackingName: 'Portal'`, `redux`, `storages`.
  - Framework : `isModuleAvailable` → `isModuleAvailableForUser`, `useAvailableModules` → `useUserAvailableModules` (`src/app/module/`, `src/app/navigation-new/`). L'homonyme de l'ancien système (`src/app/modules.ts`) n'est pas touché.
  - Tests : 83 dans `src/modules/myapps` (9 fichiers).
  - Écarts avec l'ancien, volontaires :
    - `getAppTestID` (`util.ts`) donne toujours `myapps-<nom>` ; l'ancien laissait le `testID` vide pour une app sans config (`/myApps/config`), notion qui n'existe plus avec la nouvelle API ;
    - enregistrer un favori alors que les préférences ne sont pas chargées les **relit d'abord** sur le serveur : sinon, l'enregistrement à partir de préférences vides effacerait tous les favoris (risque présent dans l'ancien code) ;
    - `toPreferences` (`service/adapter.ts`) complète une liste absente par `[]` ;
    - `helpUrls` ne garde que les langues qui ont une URL (le serveur peut envoyer `null`).
  - Effets de bord hors du module (phase 1) :
    - le reducer accepte toute action (`Action`), pas seulement les siennes : `combineReducers` (Redux 5) type mal le state d'un reducer qui n'accepte que son union d'actions (state `never`). Règle dans [CONVENTIONS.md](CONVENTIONS.md) ;
    - `configureStore` (`src/app/store/index.tsx`) n'a plus de paramètre `preloadedState` (jamais passé, et mal typé pour la même raison) ;
    - le reducer étant enregistré sous `myapps`, les anciens sélecteurs (`framework/modules/myapps/reducer/selectors.ts`) lisent le nouveau state : ils renvoient l'agrégat vide, comme avant (`ToDo(myapps-migration)`, façades en phase 3). Sans ça, `media/hooks/resource-display.ts` planterait.
  - Vérifié : tsc sans nouvelle erreur (769), eslint propre (hors `src/app/module/loader.tsx`, erreur prettier préexistante), `yarn test` 408/408. **Pas testé dans l'app.** Rien n'est commité depuis la phase 0.
- 2026-11-06 : **phase 2 faite.**
  - `session.ts` : `createMyAppsSessionHooks({ dispatch, translate })` → `sessionSetup` (apps, bloquant : un échec fait échouer la connexion ; écrit au `commit`) et `onSessionStart` (préférences ; échec → `status: 'error'` ; rien d'écrit après la fin de la session). 5 tests.
  - `index.ts` : les branche avec `getStore().dispatch` et `I18n.get`.
  - `src/modules/auth/flows/start-session.ts` : `ToDo` « MyApps data » retiré.
  - Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 413/413. **Pas testé dans l'app** : à la connexion, le state `myapps` (Reactotron) doit avoir `apps` et `preferences` en `loaded` ; API des apps en panne → connexion refusée.
- 2026-11-06 : **phase 3 faite.**
  - `hooks/` : `apps.ts` (`useEntApps`, `useEntApp`, `useAppModules`, `useModuleApp`, puis `useTabLabel`, retiré ensuite), `list.ts` (`useFavorites`, `useShowAllApps`, `useFilteredApps`), `theme.ts` (`useAppTheme`, `useAppBadge` + fonctions pures). Export par `hooks/index.ts`.
  - Modèle : `getModuleLabel` (`display.ts`, règle de `getTabModuleDisplayName`), `getAppModules` (`opening.ts`). 4 tests de plus.
  - `src/app/navigation-new/tabs.tsx` : `TabLabel` affiche le libellé du module au lieu du `testId` (aujourd'hui `useModuleAppDisplay(module.name).label`).
  - Façades (§5.10) : `framework/modules/myapps/hooks/use-app-theme.ts` et `use-app-badge.ts` réexportent les nouveaux hooks ; `useNotificationBadge` lit le nouveau state ; `reducer/selectors.ts` construit l'ancien agrégat (le garde de la phase 1 et son `ToDo` sont retirés). `NOTIF_TYPE_BADGE_OVERRIDES` est exporté de l'ancien `adapter.ts`.
  - `src/modules/media/hooks/resource-display.ts` lit `useEntApp` (son `ToDo(media-migration)` est retiré).
  - Pas de tests des hooks (Jest tourne sans React Native) : seules les règles pures sont testées.
  - Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 417/417. **Pas testé dans l'app** : libellés des onglets, couleurs des cartes `communities`, des miniatures `news`, des ressources `media`, badges des notifications.
- 2026-11-06 : **relecture de la phase 3.**
  - `useAppTheme` / `useAppBadge` remplacés par `useEntAppDisplay(entAppName)` et `useModuleAppDisplay(moduleName)` (`hooks/display.ts`) : `{ colors: IShades, icon, label }`, couleurs primaires par défaut. `useAppBadge` supprimé : un badge est construit par l'appelant.
  - `useNotificationBadge` remplacé par `useNotificationEntApp` / `useNotificationEntAppDisplay` dans `src/modules/notifications/hooks.ts` (surcharges ELEA / REPORT avec eux).
  - Consommateurs passés aux nouveaux hooks : `module-image`, `blog`, `homework`, `news`, `communities` (3 composants), `timeline/notification-top-info`, `main-navigation` (ancienne nav). Façades `use-app-theme.ts` / `use-app-badge.ts` supprimées ; `selectAggregatedApps` réservé à l'ancien code interne (phase 7).
  - Vérifié : tsc 768 (une erreur préexistante en moins, `community-navbar`), eslint propre sur le nouveau code (erreurs préexistantes dans `main-navigation.tsx` et `notification-top-info.tsx`), `yarn test` 417/417. **Pas testé dans l'app.**
- 2026-11-06 : **couleurs typées.** Un nom de couleur de la palette est typé `ThemeColorName` (`~/app/theme` : couleurs complémentaires, `primary`, `secondary`) au lieu de `string` : `EntApp.color`, `getAppColor`, `getAppShades`, surcharges des notifications. `isThemeColorName` vérifie le nom reçu du serveur (une couleur inconnue devient « aucune ») ; `getThemeColorShades` donne ses nuances. Règle générale dans [CONVENTIONS.md](CONVENTIONS.md). tsc 768, eslint propre, `yarn test` 418/418.
- 2026-11-06 : `useTabLabel` supprimé, redondant avec `useModuleAppDisplay` (même libellé) : `TabLabel` (`tabs.tsx`) lit `useModuleAppDisplay(module.name).label`. tsc 768, eslint propre, `yarn test` 418/418.
- 2026-11-06 : **accès aux modules par nom en O(1).** Le contexte de `ModuleLoader` (`src/app/module/loader.tsx`) garde aussi une Map par nom, construite une fois ; hooks `useModulesMap()` et `useModule(name)` (typé pour un nom du code, `AnyModule | undefined` pour un nom quelconque). `useModuleAppName` (`myapps`) et `useOpenModule` / `useCanOpenModule` (`open-module.ts`, avec `isModuleAvailableForUser` sur la session) ne font plus de `find`. tsc 768, eslint propre, `yarn test` 418/418.
- 2026-11-06 : **types rangés.** Les types utiles à plusieurs fichiers vont dans le fichier de types de leur dossier : `ModulesMap` (`src/app/module/types.ts`, type de retour de `useModulesMap`), `Translate`, `AppConfig`, `MyAppsFilter` (`model/index.ts`), `MyAppsDispatch`, `EntAppDisplay` (`hooks/types.ts`). Les types internes restent dans leur fichier, non exportés : `LoadedModules` (`loader.tsx`), `ModuleWithRights` (`rights.ts`), `LabelSourceData` (`display.ts`), `FilterAppsContext` (`classification.ts`) ; les dépendances de `createMyAppsSessionHooks` sont typées dans la signature, sans nom. Règle dans [CONVENTIONS.md](CONVENTIONS.md). tsc 768, eslint propre, `yarn test` 418/418.
- 2026-11-06 : `ModulesMap` renommé `AllModulesMap` (comme `AllModulesArray`) ; l'ancien type objet `AllModulesMap` (`{ [nom]: type du module }`, niveau des types) devient `AllModulesByName`. tsc 768, `yarn test` 418/418.
- 2026-11-06 : la Map des modules est remplacée par un **objet typé `AllModulesByName`** : `useModulesByName()` (ex-`useModulesMap()`) donne chaque module avec son type exact (`.myapps`) ; `getModuleByName(byName, name)` pour un nom quelconque (clés propres seulement, pas « toString »). Le type `AllModulesMap` est supprimé. tsc 768, `yarn test` 418/418.
- 2026-11-06 : `AllModulesByName` → **`AllModulesRecord`**, `useModulesByName` → **`useModulesRecord`** (champ du contexte : `record`). `getModuleByName` garde son nom (il prend un nom). tsc 768, `yarn test` 418/418.
- 2026-11-06 : **noms de modules typés** (décision de l'utilisateur). `useModuleAppDisplay`, `useModuleApp` et `useModuleAppName` n'acceptent qu'un `AllModulesNames` ; `ModuleWithRights` prend `Pick<AnyModule, 'name'>`. tsc passe de 768 à 775 erreurs, **voulues** : un module non migré passé à `useModuleAppDisplay` (`BlogSelectScreen`, `HomeworkSelectScreen`, `news/thumbnail-thread`, `community-card-large`, `community-navbar`) ou à `ModuleImage` (`wiki` : `image-input`, `resource-thumbnail`), corrigé au fil des migrations. `ModuleImage` prend une prop `moduleName: AllModulesNames` (ex-`appName: string`). Ce ne sont pas des régressions. Les tests de `src/app/module/rights.test.ts` gardent des noms fictifs : le type de `isModuleAvailableForUser` y est surchargé pour accepter n'importe quel nom (les modules de test `amodule`… disparaîtront avec la migration).
- 2026-11-06 : **`EntAppImage` et `ModuleImage`.** `src/framework/components/picture/ent-app-image` (nouveau, ex-corps de `ModuleImage`) affiche une image avec, à défaut, les couleurs et l'icône d'une app ENT (`useEntAppDisplay(entAppName)`) ; `module-image` n'est plus qu'un `EntAppImage` avec l'app de son module (`useModuleAppName`, exporté par `hooks/index.ts`). Les 2 erreurs préexistantes du rendu de remplacement suivent le code dans `ent-app-image`. tsc 775, `yarn test` 418/418.
- 2026-11-06 : `EntApp.icon` et les icônes d'affichage restent des `string` : le serveur peut donner le nom d'un `Svg` de l'app, mais aussi le chemin d'une image du workspace ou une URL (ancien `resolveAppIcon`, à porter avec `MyAppsCard` en phase 4). Un essai de typage en `SvgIconName` a été annulé. `community-card-small` utilise `useModuleAppDisplay('communities')` (on est dans ce module) : erreur de type voulue de plus. tsc 776 : 8 appels avec un module non migré (`blog`, `homework`, `news`, `communities` ×3, `wiki` ×2).
  - Prochaine étape : phase 4 (port de `MyAppsHomeScreen`).
