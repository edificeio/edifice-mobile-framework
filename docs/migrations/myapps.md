# Migration : `myapps`

> Statut : **spec** (v2 validée le 2026-11-04, prête pour la phase 0) — mise à jour le 2026-11-04

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
- `useNotificationBadge` : dépend des définitions de notifications de `timeline` (redux). Reste en façade jusqu'à la migration de `timeline`.
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

- `index.ts` : `CoreModule` avec l'écran `myapps/home` et un `tab` (ordre 40, icônes `ui-applications(-fill)`, `testId: 'tabbar-myapps'`).
- `screens/home.tsx` : vue vide. `store.ts` : store zustand vide (à supprimer : on reste en Redux).
- `service.ts` : copie de l'ancien service, **ne compile pas**. À réécrire.

### 2.3 Consommateurs externes

| Fichier                                                                                                               | Utilise                                           | Remplacement                           |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `src/framework/components/picture/module-image/component.tsx`                                                         | `useAppTheme(appName)`                            | façade → nouveau hook                  |
| `src/framework/modules/blog/screens/BlogSelectScreen.tsx`                                                             | `useAppTheme('blog')`                             | idem                                   |
| `src/framework/modules/homework/components/HomeworkSelectScreen.tsx`                                                  | `useAppTheme('homework')`                         | idem                                   |
| `src/framework/modules/news/components/thumbnail-thread/component.tsx`                                                | `useAppTheme(moduleConfig.name)`                  | idem                                   |
| `src/framework/modules/communities/components/community-card-large/component.tsx`, `…/community-navbar/component.tsx` | `useAppTheme('communities')`                      | idem                                   |
| `src/framework/modules/communities/components/community-card-small/component.tsx`                                     | `selectAggregatedApps(state).Communities`         | façade                                 |
| `src/framework/modules/timeline/components/notification-top-info.tsx`                                                 | `useNotificationBadge`                            | façade (hors périmètre)                |
| `src/modules/media/hooks/resource-display.ts`                                                                         | `selectAggregatedApps` (par nom d'app ENT)        | `useEntApp(name)`                      |
| `src/app/navigation/main-navigation.tsx` (ancienne nav)                                                               | `getTabModuleDisplayName`, `selectAggregatedApps` | rien (à supprimer avec l'ancienne nav) |
| `src/framework/navigation/modals/navigator.tsx`                                                                       | `ManageFavoritesModalScreen`                      | modale `myapps/favorites`              |
| `src/app/navigation-new/tabs.tsx`                                                                                     | — (`@todo get names / colors from myApps`)        | `useTabLabel`                          |

> ⚠️ `buildAppLookupMap` lit `AllModules()`, qui renvoie `[]` : **`useAppTheme` / `useAppBadge` renvoient toujours le thème par défaut aujourd'hui**.

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
- [ ] Seules les apps `display: true` sont listées.

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
| 1   | L'agrégat est calculé une fois et stocké en trois copies (§2.1).                                                                                                                            | Stocker le brut, dériver l'agrégat dans les hooks (§5.3, §5.5).                                            | réglé par la cible               |
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

Structure de module d'ARCHITECTURE §2.1 / §2.3 (Redux : `reducer/`) :

```
src/modules/myapps/
├── index.ts                    EntModule (§5.1)
├── model/
│   ├── index.ts                Types (§5.3)
│   ├── business.ts             Règles pures : agrégation, catégorie, connecteur, filtres, favoris, lien d'aide, onboarding
│   └── business.test.ts
├── service/index.ts            `applications` (GET /api/me/applications), `preferences` (GET / PUT /userbook/preference/apps)
├── reducer/
│   ├── index.ts                createSessionReducer
│   ├── actions.ts              Actions + thunks (refresh, écriture des favoris)
│   └── selectors.ts
├── storage.ts                  Storage.account `myapps` (déplacé, clés inchangées)
├── hooks/                      API publique (§5.5)
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

**Le state Redux ne contient que ce que renvoie le serveur**, séparé par source :

```ts
type MyAppsState = {
  applications: { status: 'idle' | 'loaded' | 'error'; data: EntApplication[] }; // GET /api/me/applications
  preferences: { status: 'idle' | 'loaded' | 'error'; data: AppsPreferences }; // /userbook/preference/apps
  onboardingShown: boolean; // montré automatiquement pendant cette session (§4 n° 5)
};
```

Tout le reste est **dérivé** (hooks, §5.5) : le lien avec un module, la catégorie, le thème, `isFavorite`, les filtres.

**Réponse de `GET /api/me/applications`** (exemple fourni le 2026-11-04) : un tableau d'apps qui réunit les champs de `/applications-list` et de `/myApps/config`, plus `appName`.

```ts
interface EntApplication {
  name: string; // identifiant (« Actualites »), clé de `matchEntcoreApp` et des favoris
  address: string; // « /actualites »
  icon: string; // « actualites-large » (normalisé ensuite)
  target: string; // « » ou « _blank » (chaîne vide, plus `null`)
  displayName: string; // « actualites » (clé, pas un libellé)
  appName?: string; // « Actualités » : libellé traduit par le serveur (nouveau)
  display: boolean;
  prefix: string; // « /actualites » ; absent ou vide pour un connecteur
  casType: string; // inutilisé
  scope: string[]; // inutilisé
  isExternal: boolean;
  category?: string; // « communication » | « pedagogy » | « organisation » | …
  color?: string; // clé de `theme.palette.complementary` (« orange »)
  libraries?: boolean; // booléen (c'était une chaîne dans `/myApps/config`)
  help?: Record<string, string>; // langue → URL
}
```

Différences avec l'existant : `libraries` devient un booléen ; `target` / `casType` sont des chaînes vides au lieu de `null` ; `appName` donne un libellé déjà traduit. Usage de `libraries` et d'`appName`, disponibilité de l'API : plus tard ([later.md](later.md)).

Renommages proposés (« naming douteux » ; les noms des champs serveur ci-dessus restent tels quels) :

| Actuel                                                                       | Proposé                                                                                                   | Pourquoi                                                                            |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ApplicationsList`, `AppsInfo`, `AppsInfoAggregated`, `AppsInfoWithCategory` | `EntApplication` (donnée serveur), `MyApp` (vue dérivée)                                                  | 4 types pour une même chose ; « info » ne dit rien                                  |
| `ApplicationsConfig`                                                         | champs de `EntApplication`                                                                                | fusionné par la nouvelle API                                                        |
| `favorites: AppBookmarks { applications, bookmarks }`                        | `preferences: AppsPreferences { applications, bookmarks }`                                                | ce sont les préférences de l'utilisateur ; « favorites » ne désigne que `bookmarks` |
| `isMobile` + `routeName`                                                     | `module?: EntModule` (le module correspondant, s'il est disponible)                                       | « mobile » est ambigu ; un seul champ donne l'existence et la route                 |
| `isConnector`                                                                | `kind: 'module' \| 'web' \| 'connector'`                                                                  | dit comment l'app s'ouvre                                                           |
| `appShouldBeAtBottom`                                                        | `isOtherService`                                                                                          | dit ce que c'est, pas où l'afficher                                                 |
| `displayName` (écrasé), `icon` (écrasé)                                      | `label` (chaîne i18n actuelle ; `appName` du serveur plus tard), `icon` (normalisé), le brut conservé     | §4 n° 14                                                                            |
| `MyAppsFilterCategories` (`toutes`, `pedagogie`, `otherServices`)            | catégorie = valeur serveur (`communication`, `pedagogy`, `organisation`) \| `other` ; filtre `all` à part | §4 n° 15                                                                            |
| `help`                                                                       | `helpUrls`                                                                                                | c'est une table langue → URL                                                        |

### 5.4 Chargement (hooks de session)

- **Apps** — `sessionSetup(session, { signal })` : `accountFetch(session, '/api/me/applications')`, renvoie `{ commit }` qui dispatch le résultat (`getStore().dispatch`, comme `dispatchToLegacyStore`). **Bloquant, comme l'ancien** : si l'appel échoue, la connexion échoue (`SessionSetupError`). Raison : les libellés d'onglets et la liste en dépendent dès l'affichage.
- **Préférences (favoris)** — `onSessionStart(session, { signal })` : non bloquant ; ne servent qu'à `myapps`. En cas d'échec : `status: 'error'`, l'écran le signale au tirer-pour-rafraîchir.
- **Rafraîchir** (tirer-pour-rafraîchir, « réessayer ») : les deux lectures, avec le transport de session.
- Fin de session : `createSessionReducer` remet le state à zéro (`resetSessionStores` dispatch l'action de fin de session).

### 5.5 Flux de données et API publique (`hooks/`)

Les données dérivées ont besoin des **modules chargés et disponibles** : elles se calculent dans des hooks, qui combinent le state Redux et les hooks de module (`useModulesOfType(EntModule)` + `isModuleAvailable`, §5.7). Plus de `buildAppLookupMap` ni d'`AllModules()`.

| Hook                                      | Rôle                                                                                      | Remplace                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `useMyApps()`                             | Apps dérivées (`MyApp[]`), statuts, `refresh`                                             | `selectAggregatedApps`                                 |
| `useEntApp(entAppName)`                   | Une app par son nom ENT (`'Blog'`, `'Espace documentaire'`…), sans passer par les modules | `aggregatedApps[name]` (`media`, `communities`)        |
| `useModuleApp(moduleName)`                | L'app d'un module : `useModules()` → `matchEntcoreApp` → `useEntApp`                      | la partie « par nom de module » de `buildAppLookupMap` |
| `useAppTheme(name)` / `useAppBadge(name)` | Couleurs + icône (thème par défaut sinon), par nom ENT **ou** nom de module               | anciens hooks du même nom                              |
| `useTabLabel(module)`                     | Nom d'un onglet : app du module, sinon i18n `myapps-app-*`, alias `myapps` → `portal`     | `getTabModuleDisplayName`                              |
| `useFilteredApps(filter)`                 | Filtres de l'écran, lit l'interrupteur par `useStorageBoolean`                            | idem                                                   |

La recherche par **scope** de `buildAppLookupMap` (un `entcoreScope` pointe vers l'app) n'est utilisée par aucun appelant connu : non reprise, sauf besoin constaté.

### 5.6 Ouvrir une app

- `kind === 'module'` (module **disponible** et doté d'une `entry`) : `openModule(module.name)`. Un module sans `entry` ne s'ouvre pas depuis « Mes applis » : son app se comporte comme une app web.
- Sinon : `openUrl`, via `/auth/redirect?url=` pour un connecteur (inchangé).

**`useOpenModule`** : API publique **du framework** (`src/app/module/` ou `src/app/navigation-new/`, pas `myapps`), réutilisable plus tard par les notifications, les intents et les liens profonds.

- `const openModule = useOpenModule(); openModule('blog')`. Le nom est typé sur les seuls modules qui ont une `entry` (comme `AnyTabModule` pour ceux qui ont un onglet). Renvoie `false` sans rien faire si le module n'est pas disponible pour la session (`isModuleAvailable`).
- Module à onglet → `JUMP_TO` vers `getTabScreenName(name)` (l'onglet s'ouvre sur `tab.route`, donc sur `entry`) ; module sans onglet → `navigate(entry)` dans l'onglet courant. Pas de traitement particulier pour un onglet déjà ouvert plus loin dans sa pile : le fonctionnel ne permet pas ce cas.
- `entry` doit être une route **sans params obligatoires** (vérifié par son type).
- `canOpenModule(name)` (même test, sans naviguer) pour que `myapps` calcule `kind`.

### 5.7 Droits

`isModuleAvailable(module, session)` dans `src/app/module/` (phase 0) : `CoreModule` toujours ; `EntModule` si `matchEntcoreApp` (s'il existe) est dans `session.rights.apps`, `matchEntcoreWidget` (s'il existe) dans `session.rights.widgets`, **et** `hasRight(session)`. Utilisable aussi par `useModuleTabRoutes` pour filtrer les onglets.

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

`src/framework/modules/myapps/hooks` (`useAppTheme`, `useAppBadge`) et `reducer` (`selectAggregatedApps`) restent, réécrits sur le nouveau code : les consommateurs anciens ne changent pas. `useNotificationBadge` garde sa logique (redux `timeline`) mais lit les apps du nouveau state. Le reste du module ancien est supprimé en phase 7.

## 6. Plan par phases

| #   | Phase                                | Contenu                                                                                                                                                                    | Validation                                                    |
| --- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 0   | Préalables                           | `isModuleAvailable` dans `src/app/module/` (+ filtrage des onglets) ; clé `entry` sur `ModuleConfig`, `tab.route` qui en hérite ; `useOpenModule` / `canOpenModule` (§5.6) | tsc, tests unitaires de la disponibilité                      |
| 1   | Modèle + service + reducer + storage | `model/`, `service/`, `reducer/`, `storage.ts` ; `EntModule` ; suppression de `store.ts` et de l'ancien `service.ts`                                                       | tests Jest de `model/business.ts`                             |
| 2   | Chargement                           | `sessionSetup` (apps), `onSessionStart` (préférences), `refresh` ; retrait du `ToDo` de `start-session.ts`                                                                 | connexion : state rempli ; API en panne : connexion refusée   |
| 3   | API publique                         | hooks §5.5 ; `tabs.tsx` ; façades §5.10 ; `media/resource-display.ts`                                                                                                      | libellés d'onglets ; thème des apps                           |
| 4   | `MyAppsHomeScreen`                   | port de l'écran, `MyAppsList`, `MyAppsCard`, `MyAppsFilters` ; header par options ; `useScrollToTop`                                                                       | parcours E2E (testIDs §3.5)                                   |
| 5   | Modales                              | `myapps/menu`, `myapps/app-actions`, `myapps/favorites` (`useConfirmRemove`), `myapps/onboarding` ; corrections §4 n° 4-7                                                  | règles §3.2-3.4                                               |
| 6   | Ouvrir une app                       | §5.6                                                                                                                                                                       | modules, apps web, connecteurs                                |
| 7   | Nettoyage                            | suppression de `framework/modules/myapps` hors façades, de `ModalsRouteNames.FavoritesManagement`                                                                          | `grep -rn "framework/modules/myapps" src` = façades seulement |

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
- **2026-11-04** — Libellé de l'onglet `myapps` par l'i18n (`myapps-app-portal`), et `useTabLabel` pour tous les onglets (nom de l'app du serveur, sinon i18n). Accepté, **à revoir plus tard** ([later.md](later.md)).
- **2026-11-04** — Recherche native du header (§4 n° 13) : plus tard ([later.md](later.md)).
- **2026-11-04** — `useOpenModule` (+ `canOpenModule`) : API publique du framework pour ouvrir un module (§5.6).
- **2026-11-04** — Détails de `GET /api/me/applications` (bibliothèques, langue d'`appName`, disponibilité sur toutes les plateformes) : plus tard ([later.md](later.md)). En attendant : détection actuelle des bibliothèques, libellés par l'i18n, pas de repli sur les anciennes routes.

## 8. Questions ouvertes

Aucune question bloquante. Ce qui est remis à plus tard est dans [later.md](later.md).

## 9. Avancement

- 2026-11-04 : spec v1, puis v2 après revue ; toutes les questions tranchées ou reportées (§7). **Prête pour la phase 0.** Rien d'implémenté.
