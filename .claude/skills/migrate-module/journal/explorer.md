# Migration : `explorer`

> Statut : en cours (plan à valider) — mis à jour le 2026-11-18

## 1. Périmètre

Module technique `explorer` : accès à l'API `/explorer/resources` (ressources et dossiers d'une app ENT, paginés), state Redux d'un explorateur de dossiers, et template d'écran `ResourceExplorer` (grille de dossiers + ressources, navigation dans les sous-dossiers). **Sans écran propre** : aujourd'hui, chaque module consommateur (`wiki`, `blog`, `homework`, `scrapbook`) a son propre slice `explorer` dans son store (actions préfixées par son nom) et affiche le template dans un de ses écrans. Cible : `explorer` garde lui-même l'inventaire des dossiers et ressources, **par app** (§7).

Aujourd'hui **absent de l'app** : `Module` de l'ancien système (`reducer: () => null`), pas dans `src/app/config/modules.ts`.

**Préalable de `wiki`** (décidé le 2026-11-17, [wiki.md](wiki.md) §7) : `CoreModule` `explorer` (scope, store) et template pour la nouvelle navigation.

Dans le périmètre : déclaration (`CoreModule`, scope `explorer`, store, **sur place**), données (modèle, service, store par app), template pour la nouvelle navigation. **Pas de façade** : l'ancien template et les anciennes fabriques du store sont remplacés (§7).

Hors périmètre :

- Migration des consommateurs (`wiki`, `blog`, `homework`, `scrapbook`) : chacun avec sa fiche. D'ici là, ils ne compilent plus sur leurs imports d'`explorer` (erreurs tsc acceptées, §7).
- `src/framework/components/explorer/resource-picker` : composant du framework sans lien avec ce module (n'importe rien de lui), utilisé par `BlogSelectScreen` et `HomeworkSelectScreen`.
- Test dans l'app : aucun consommateur n'est chargé. Le template est testé dans l'app avec la phase 5 de `wiki`.

## 2. Existant

### 2.1 Module ancien (`src/framework/modules/explorer`, 452 lignes)

| Fichier                                  | Rôle                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module-config.ts`                       | `ModuleConfig` : `name: 'explorer'`, `entcoreScope: ['explorer']`, `matchEntcoreApp: 'Explorer'`, `hasRight: () => true`, `storageName` (aucun storage). Sert surtout à `namespaceActionType` (`EXPLORER_`).                                                                                                    |
| `index.ts`                               | `Module` sans reducer (`() => null`). Plus importé (ligne commentée dans `src/app/modules.ts`).                                                                                                                                                                                                                 |
| `model/types.ts`                         | `RootFolderId` (`default`, `bin`), `FolderId`, `ExplorerResourceIdType`, `ExplorerPageData` (pagination + dossiers + ressources), `ExplorerFolderContent`. `ExplorerAppTypes` sans utilisateur. Les ressources sont des `DocumentItem<…, ResourceMedia>` (`paginated-document-list`, `media`).                  |
| `model/index.ts`                         | `explorerItemIs*` : **orphelin et cassé** (types `Folder`, `Resource`, `items` qui n'existent plus : 5 erreurs tsc).                                                                                                                                                                                            |
| `service/types.ts`                       | `namespace API.Explorer` : requête (filtres booléens, pagination, contexte `application` / `resource_type`, `order_by`, `folder`, `search`) et réponse (`ResourcesPageOK`).                                                                                                                                     |
| `service/index.ts`                       | `GET /explorer/resources?…` par `sessionFetch`. Adaptateurs : `hydrateTimestamp` (tolérant), `hydrateFolder`, `hydrateResource` (`appName` par `newEntAppNameFromOldMap` de `~/app/intents`), `hydrateResources`.                                                                                               |
| `store.ts`                               | Fabriques **par module consommateur** : `createExplorerReducer(moduleConfig)` (`createSessionReducer`, action `<MODULE>_EXPLORER_LOAD_PAGE`, fusion paginée `staleOrSplice`, métadonnées des sous-dossiers), `createExplorerActions`, `createExplorerSelectors` (`folder(folderId)`), `useExplorerActions`.     |
| `templates/resource-explorer/screen.tsx` | `ResourceExplorerTemplate` : `PaginatedDocumentFlashList` (2 colonnes, pages de 24), chargement par `service.resources.get` + dispatch, sous-dossier par `navigation.push(route.name, { folderId })`. `createResourceExplorerNavBar` : titre lu par `getStore().getState()` dans les options (`screenOptions`). |
| `templates/resource-explorer/types.ts`   | Props (`moduleConfig`, `selectors`, `context`, `onOpenResource`, `emptyComponent`), `NavParams` (`folderId`, `folderName` jamais passé), props de navigation de l'ancien système.                                                                                                                               |
| `templates/resource-explorer/styles.ts`  | **Orphelin** (pas importé).                                                                                                                                                                                                                                                                                     |

### 2.2 Consommateurs externes

| Consommateur         | Importe                                                                                                                                                                                                                                             | État / cible                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `wiki`               | `store.ts` (fabriques, `ExplorerState`), `index.ts` (`ExplorerAction`), `screens/home` (template, `createResourceExplorerNavBar`, `RootFolderId`), `model` et `screens/{reader,summary}/types.ts` (`Resource`, `ResourceHistory`, **déjà absents**) | `spec`, migre après `explorer` : passe à la nouvelle API (phases 2 et 5 de [wiki.md](wiki.md)). Cassé d'ici là. |
| `blog`               | `reducer.ts` (fabriques), `screens/explorer.tsx` (template)                                                                                                                                                                                         | Ancien, non chargé : cassé jusqu'à sa migration (pas de façade).                                                |
| `homework`           | `reducers/index.ts` (fabriques), `screens/explorer.tsx` (template, `createResourceExplorerNavBar`, inclus aussi dans `HomeworkInitialScreen`)                                                                                                       | Ancien, non chargé : cassé jusqu'à sa migration (pas de façade).                                                |
| `scrapbook`          | `store.ts` (fabriques), `screens/home/screen.tsx` (template, `createResourceExplorerNavBar`)                                                                                                                                                        | Ancien, non chargé : cassé jusqu'à sa migration (pas de façade).                                                |
| `src/app/modules.ts` | `require('~/framework/modules/explorer')` commenté                                                                                                                                                                                                  | Rien.                                                                                                           |

Pas dans `src/app/override/modules.ts` ni dans `__overrides__/*/modules.ts`. Pas de navigation entrante (pas d'écran propre), pas d'intent, pas de notification.

### 2.3 Dépendances transverses

| Dépendance                                                                                                         | État                          | Piste                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PaginatedDocumentFlashList`, `DocumentItem`, `FolderItem` (`~/framework/components/list/paginated-document-list`) | Composant du framework        | Tel quel (utilisé aussi par `communities`). Il importe `Media` par la façade `~/framework/modules/media` : hors périmètre.                                                                                                                                                                                                                              |
| `staleOrSplice` (`~/framework/components/list/paginated-list`)                                                     | Utilitaire du framework       | Tel quel.                                                                                                                                                                                                                                                                                                                                               |
| `ResourceMedia`, `MediaType` (`~/framework/modules/media`)                                                         | Façade `@deprecated`          | `~/modules/media/types`.                                                                                                                                                                                                                                                                                                                                |
| `newEntAppNameFromOldMap`, `OldEntAppNameOrSynonym` (`~/app/intents`)                                              | Intents reportés (`later.md`) | Seul `explorer` lit `newEntAppNameFromOldMap` : retiré d'`intents.ts`, remplacé par la table du service d'`explorer` (§5.4). `OldEntAppName` reste, seulement pour typer les clés du registre des intents, alors que les modules s'y enregistrent sous le nom ENT (`registerIntent('Wiki', …)`) : trompeur, à revoir avec les intents (hors périmètre). |
| `sessionFetch` (`~/framework/util/transport`)                                                                      | Migré                         | `getModuleTransport('explorer')` (chemins sous `/explorer`).                                                                                                                                                                                                                                                                                            |
| `createSessionReducer`                                                                                             | Migré                         | Tel quel, qui accepte toute action (CONVENTIONS « Données et état »).                                                                                                                                                                                                                                                                                   |
| `ModuleConfig.namespaceActionType`, `IUnkownModuleConfig`, `AnyNavigableModuleConfig` (`moduleTool`)               | Ancien système                | Plus de préfixe : une action `EXPLORER_LOAD_PAGE` qui porte l'app (§5.3).                                                                                                                                                                                                                                                                               |
| `screenOptions` (`~/app/navigation/util`), `getStore()`                                                            | Ancienne navigation           | Options de `defineScreen`, qui lisent le store (§7).                                                                                                                                                                                                                                                                                                    |
| `HTTPError` (`~/framework/util/transport/error`), `I18n`                                                           | Migré                         | Tels quels.                                                                                                                                                                                                                                                                                                                                             |
| `Temporal`                                                                                                         | Déjà utilisé                  | Rien à faire.                                                                                                                                                                                                                                                                                                                                           |

## 3. Comportements à conserver

**Faciles à oublier**

- Les données de chaque app sont **séparées** (pas de partage entre `wiki` et `blog` : les dossiers racine `default` et `bin` ont le même id dans toutes les apps), vidées en fin de session. Deux écrans de la même app partagent les mêmes données (déjà le cas pour `homework`, dont l'explorateur est aussi inclus dans `HomeworkInitialScreen`).
- La fusion des pages : `staleOrSplice` (page insérée à son index, `reloadAll` pour repartir de zéro au rafraîchissement), total = `maxIdx` de l'API (nom trompeur : nombre de ressources, dossiers exclus).
- Les métadonnées (`id`, `title`) des sous-dossiers d'un dossier chargé sont gardées : le titre d'un sous-dossier est connu avant de l'ouvrir.
- Ouvrir un sous-dossier **empile** un écran (même route, `folderId`), seulement si l'écran a le focus (évite les doubles appuis).
- Date d'une ressource : `updatedAt`, sinon `createdAt` ; epoch en ms (nombre ou chaîne), sinon ISO ; **absente plutôt qu'une erreur** si invalide.
- `appName` d'une ressource : nom ENT de l'app (`Blog`, `Wiki`…), pas l'ancien nom renvoyé par l'API : il donne la couleur et l'icône de l'app (`useResourceDisplay`) et l'intent d'ouverture (`openIntent`). Voir §5.4.
- Erreur de chargement : corps de l'`HTTPError` loggé, puis erreur relancée (la liste gère l'état d'erreur).

**Requête** : `order_by: 'updatedAt:desc'`, `trashed: false`, `folder` (racine `default`), `application` / `resource_type` de l'app (`wiki`/`wiki`, `blog`/`blog`, `homeworks`/`homeworks`, `scrapbook`/`scrapbook`), pages de 24.

**Affichage** : 2 colonnes, `alwaysShowAppIcon={false}`, `ListEmptyComponent` du consommateur, titre = nom du dossier, sinon titre d'accueil (clé i18n du consommateur).

**Données** : `GET /explorer/resources`. Pas de storage. Pas de clé i18n ni de `testID` propres au module.

## 4. Ancienneté de conception à corriger au passage

| #   | Constat                                                                                                                                                                                                                               | Correction                                                                                                                                                                                                                                                                                                                  | Statut             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | Template typé pour l'ancienne navigation : props `navigation` / `route` castées par chaque consommateur, `navigation.push(route.name, …)` non typé.                                                                                   | Template sans props de navigation ; le consommateur ouvre le sous-dossier par un callback `onOpenFolder` (§7).                                                                                                                                                                                                              | réglé par la cible |
| 2   | Titre par `screenOptions` de l'ancienne navigation (`createResourceExplorerNavBar`).                                                                                                                                                  | Aide d'options pour `defineScreen` qui lit le titre dans le store (`getStore()`), option `title`, jamais `headerTitle` (§7).                                                                                                                                                                                                | réglé par la cible |
| 3   | `NavParams.folderName` déclaré, jamais passé.                                                                                                                                                                                         | Retiré (le titre vient du store).                                                                                                                                                                                                                                                                                           | réglé par la cible |
| 4   | Un slice et des actions par consommateur, nommées par `moduleConfig.namespaceActionType` de l'ancien `ModuleConfig` (type casté `` `${string}_LOAD_PAGE` ``) : le même reducer branché 4 fois.                                        | Store d'`explorer` par app ; une action `EXPLORER_LOAD_PAGE` qui porte l'app, sans cast (§7).                                                                                                                                                                                                                               | réglé par la cible |
| 5   | `sessionFetch` sur un chemin sous le scope du module.                                                                                                                                                                                 | `getModuleTransport('explorer')`.                                                                                                                                                                                                                                                                                           | réglé par la cible |
| 6   | `API.Explorer.ROOT_FOLDER` vaut `'default '` (espace en trop) ; type seulement, la valeur envoyée vient de `RootFolderId.ROOT` (`'default'`).                                                                                         | `'default'`.                                                                                                                                                                                                                                                                                                                | à faire au portage |
| 7   | Service : `try { … } catch (e) { throw e }` sans effet ; template : bloc « DUMMY WAIT » commenté.                                                                                                                                     | Retirés.                                                                                                                                                                                                                                                                                                                    | à faire au portage |
| 8   | Orphelins : `model/index.ts` (cassé, 5 erreurs tsc), `templates/resource-explorer/styles.ts`, `ExplorerAppTypes`.                                                                                                                     | Supprimés (restent dans git).                                                                                                                                                                                                                                                                                               | à faire au portage |
| 9   | Hydratation dans le service.                                                                                                                                                                                                          | `service/adapter.ts` (CONVENTIONS « Structure d'un module »), testé.                                                                                                                                                                                                                                                        | réglé par la cible |
| 10  | Nom d'app « nouveau » (`Wiki`) déduit de l'ancien (`wiki`) par une table d'`intents.ts` (`newEntAppNameFromOldMap`), loin de l'API qui l'impose ; contexte de l'API (`application` / `resource_type`) répété par chaque consommateur. | Une table nom ENT → contexte de l'API dans le service d'`explorer`, lue dans un seul sens (requête) ; l'hydratation donne aux ressources le nom ENT de l'app demandée (§5.4). Le modèle local et les consommateurs ne connaissent que le nom ENT. `newEntAppNameFromOldMap` et `NewEntAppName` retirés d'`intents.ts` (§7). | à faire au portage |

Conversions d'UI : aucune (ni bottom sheet ni modale).

## 5. Cible

### 5.1 Config

```ts
// src/framework/modules/explorer/index.ts (sur place)
export default new CoreModule({
  name: 'explorer',
  redux: { reducer },
  scope: ['explorer'],
});
```

Ajouté dans `src/app/config/modules.ts`. Pas d'écran, pas de storage, pas de hook de session. State à `state.explorer` (comme `state.myapps`), vidé en fin de session (`createSessionReducer`). `matchEntcoreApp: 'Explorer'` / `hasRight: () => true` ne sont pas repris : un `CoreModule` est toujours disponible. `module-config.ts` supprimé.

### 5.2 Structure

Celle de `myapps`, réduite, dans `src/framework/modules/explorer/` :

- `model/index.ts` : `ExplorerApp` (les noms ENT des apps explorables : `'Blog' | 'Cahier de texte' | 'Cahier Multimédia' | 'Wiki'`), `RootFolderId`, `FolderId`, `ExplorerResourceIdType`, `ExplorerPageData`, `ExplorerFolderContent` (ex-`model/types.ts`).
- `service/types.ts` (`namespace API`, nom gardé : décidé le 2026-11-19) ; `service/adapter.ts` : `hydrate*` (qui reçoivent l'app demandée), la table `ExplorerApp` → contexte de l'API (`{ application, resource_type }`) ; `service/index.ts` (`getModuleTransport('explorer')`, prend une `ExplorerApp`). Test de l'adapter.
- `store/` : `state.ts` (`ExplorerState`, `ExplorerRootState`), `index.ts` (reducer), `action-creators.ts` (`EXPLORER_LOAD_PAGE`), `selectors.ts`. Test du reducer.
- `actions.ts` : `loadExplorerPage` (appel du service + dispatch), ce que faisait `loadPage` dans le template.
- `templates/resource-explorer/` : `index.ts`, `screen.tsx` (`ResourceExplorerTemplate`, même nom), `types.ts`, `options.ts` (aide d'options de l'écran).

State :

```ts
// store/state.ts
export type ExplorerState = { [app in ExplorerApp]?: { [folderId: FolderId]: ExplorerFolderData } };
// ExplorerFolderData = { content?: ExplorerFolderContent; metadata?: FolderItem<FolderId> } (comme aujourd'hui)
```

### 5.3 API publique

Des **fonctions qui prennent l'app** (son nom ENT, le `matchEntcoreApp` du consommateur), pas de fabrique (§7) :

```ts
loadExplorerPage(app, folderId, { pageStart, pageSize, flushPreviousData }); // actions.ts
selectExplorerFolder(state, app, folderId); // store/selectors.ts
```

Un consommateur (exemple `wiki`) n'a plus de slice ni de contexte d'API à fournir :

```ts
// écran
export default defineScreen({
  screen: WikiHomeScreen, // params `{ folderId?: FolderId } | undefined`
  options: resourceExplorerScreenOptions('Wiki', 'wiki-home-title'),
});
// `options` : `({ route }) => ({ title: <titre du dossier lu dans le store> ?? I18n.get(homeTitleI18n) })`

// dans WikiHomeScreen : template sans props de navigation
<ResourceExplorerTemplate
  app="Wiki"
  folderId={route.params?.folderId}
  onOpenFolder={folder => navigation.push('wiki', { folderId: folder.id })}
  onOpenResource={…}
  emptyComponent={…}
/>
```

Noms exacts à fixer en phase 2 et 4.

Titre lu dans le store par les options : les options ne sont pas recalculées quand le store change. Ça suffit ici, parce que le titre d'un sous-dossier est dans le store **avant** son ouverture (métadonnées gardées au chargement du dossier parent, §3) ; la racine prend le titre d'accueil.

Ajouter une app explorable : une ligne dans la table du service (son nom ENT et son contexte d'API). Une app à plusieurs types de ressources n'existe pas aujourd'hui ; si besoin, la clé du state deviendra app + type.

### 5.4 Noms d'apps

Deux noms, jamais mélangés :

|          | Ancien nom                                        | Nom ENT                                                                                        |
| -------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Exemples | `wiki`, `blog`, `homeworks`, `scrapbook`          | `Wiki`, `Blog`, `Cahier de texte`, `Cahier Multimédia`                                         |
| Origine  | Imposé par l'API `/explorer` (requête et réponse) | `name` de `GET /api/me/applications`, chargé par `myapps` à la connexion (`state.myapps.apps`) |
| Où       | Seulement dans `service/` d'`explorer`            | Partout ailleurs : consommateurs, store, modèle                                                |

Le nom ENT lie une ressource à son app :

1. **Module disponible** : `matchEntcoreApp` du consommateur = `EntApp.name`.
2. **Affichage** : `useResourceDisplay(media)` → `useEntApp(media.appName)` → couleur et icône de l'app (couleurs par défaut si l'app est introuvable).
3. **Comportement** : `useOpenMedia` → `openIntent(media.appName, OPEN_RESOURCE)` → intent enregistré par le module sous le nom ENT (`registerIntent('Wiki', …)`), sinon ouverture de l'URL.

Flux :

```
Écran du consommateur ── app = 'Wiki' (= son matchEntcoreApp)
  ├─ template / loadExplorerPage('Wiki', folderId, …)
  │    └─ service : table 'Wiki' → { application: 'wiki', resource_type: 'wiki' }
  │         └─ GET /explorer/resources?application=wiki&resource_type=wiki…
  │              └─ adapter : hydrateResource(item, 'Wiki') → ResourceMedia.appName = 'Wiki'
  ├─ store : state.explorer['Wiki'][folderId]
  └─ affichage / ouverture : media.appName = 'Wiki'
       ├─ useEntApp('Wiki') → couleur, icône (myapps)
       └─ openIntent('Wiki') → intent du module
```

`appName` d'une ressource = **l'app demandée** (§7) : l'API filtre sur `application`, une réponse ne contient que les ressources de cette app. `item.application` n'est pas lu ; pas de lecture inverse de la table, pas de cas « app inconnue ».

Le nom ENT est écrit à trois endroits par consommateur : `matchEntcoreApp`, `registerIntent`, la table d'`explorer`. `ExplorerApp` vérifie la table et l'appel du consommateur, pas l'égalité avec son `matchEntcoreApp` ; `matchEntcoreApp` suppose déjà un nom ENT stable sur toutes les plateformes.

### 5.5 Pas de façade

Décidé (§7) : l'ancien template, `createResourceExplorerNavBar` et les anciennes fabriques du store (`createExplorerReducer(moduleConfig)`…) disparaissent. `wiki`, `blog`, `homework`, `scrapbook` ne compilent plus sur ces imports jusqu'à leur migration (nouvelles erreurs tsc, listées à chaque phase). À leur migration, ils retirent leur slice `explorer`.

## 6. Plan par phases

| #   | Phase                    | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Vérification                                                                                                                  |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Déplacements             | `git rm model/index.ts` (orphelin, §4 n° 8), puis `git mv` : `model/types.ts` → `model/index.ts`, `store.ts` → `store/index.ts`. Seuls les chemins d'import changent (dans le module et chez les consommateurs). À committer seul.                                                                                                                                                                                                                                                                                        | tsc : 776 − 5 (orphelin) = 771                                                                                                |
| 2   | Données                  | `model/` (`ExplorerApp`), `service/` (`types.ts`, `adapter.ts` avec la table des apps et la conversion des noms, `getModuleTransport`), `store/` (state par app, `EXPLORER_LOAD_PAGE`, `selectExplorerFolder`, anciennes fabriques retirées), `actions.ts` (`loadExplorerPage`), §4 n° 4 à 7, 9, 10. `intents.ts` : `newEntAppNameFromOldMap` et `NewEntAppName` retirés. Tests Jest : adapter (`hydrateTimestamp`, table des apps, `appName` = app demandée, pagination), reducer (fusion paginée, métadonnées des sous-dossiers, apps séparées, fin de session). | tsc (nouvelles erreurs seulement dans les reducers des 4 consommateurs), eslint, `yarn test`                                  |
| 3   | Déclaration + chargement | `index.ts` en `CoreModule` avec `redux: { reducer }` (§5.1), `module-config.ts` supprimé, ajout dans `src/app/config/modules.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                                | tsc, eslint ; dans l'app : `state.explorer` présent (vide) ; parcours avec la phase 5 de `wiki`                               |
| 4   | Template                 | `ResourceExplorerTemplate` réécrit pour la nouvelle navigation (prop `app`, sans props de navigation, `onOpenFolder`, `folderId` en prop), `resourceExplorerScreenOptions(app, homeTitleI18n)`, `createResourceExplorerNavBar` et `styles.ts` supprimés.                                                                                                                                                                                                                                                                                                         | tsc (nouvelles erreurs seulement dans les écrans des 4 consommateurs), eslint ; parcours dans l'app avec la phase 5 de `wiki` |
| 5   | Nettoyage                | Vérifier qu'il ne reste rien de l'ancien système dans le module (`moduleTool`, `~/app/navigation`, `getStore` hors options).                                                                                                                                                                                                                                                                                                                                                                                                                                     | `grep -rn "moduleTool\|app/navigation/" src/framework/modules/explorer`                                                       |

Phases types retirées : 0 (pas d'évolution du framework), 0 bis (pas de module préalable), façades (aucune), modales et points reportés (rien à reporter).

## 7. Décisions

- 2026-11-17 (utilisateur, [wiki.md](wiki.md) §7) : `explorer` migré avant `wiki`, en `CoreModule` (scope, store) avec un template pour la nouvelle navigation.
- 2026-11-17 (règle, [wiki.md](wiki.md) §7) : **Redux** gardé.
- 2026-11-18 (utilisateur, remplace « le state de l'explorateur reste dans le store de chaque consommateur ») : **`explorer` garde dans son store l'inventaire des dossiers et ressources, par app** (nom ENT). API publique : **des fonctions qui prennent l'app** (`loadExplorerPage`, `selectExplorerFolder`, `resourceExplorerScreenOptions`, prop `app` du template), pas de fabrique. Le contexte de l'API (`application` / `resource_type`) est dans le service d'`explorer`, plus chez les consommateurs. Raison : le module qui possède l'API possède ses données ; un seul reducer, testé une fois, au lieu de 4 slices identiques.
- 2026-11-17 (utilisateur) : **sur place**, `src/framework/modules/explorer/`.
- 2026-11-17 (utilisateur) : sous-dossier ouvert par un **callback du consommateur** (`onOpenFolder`) : typé, le template ne connaît pas la navigation.
- 2026-11-17 (utilisateur) : **titre lu dans le store, depuis la fonction `options` passée à `defineScreen`** (pas de param `folderName`, pas de `setOptions`, jamais `headerTitle`).
- 2026-11-17 (utilisateur) : **ancien template supprimé maintenant**, et **anciennes fabriques du store aussi** : pas de façade, les 4 consommateurs (non chargés, ou `wiki` en `spec`) cassent jusqu'à leur migration.
- 2026-11-17 (utilisateur) : **noms d'apps** : les anciens noms (`wiki`) sont propres à la réponse de `/explorer` ; la conversion vers le nom ENT (`Wiki`) se fait dans l'hydratation d'`explorer`, juste après la requête, et le modèle local ne garde que le nouveau nom. `newEntAppNameFromOldMap` sort d'`intents.ts`. Un mapping de noms d'apps ailleurs que dans l'adapter de l'API qui l'impose est un anti-pattern.
- 2026-11-18 (utilisateur) : **`appName` d'une ressource = nom ENT de l'app demandée**, passé à l'hydratation ; `item.application` n'est pas lu. Raison : l'API filtre sur `application` ; la table ne sert que dans un sens et il n'y a pas de cas « app inconnue ». Flux en §5.4.
- 2026-11-17 (utilisateur) : corrections au passage §4 n° 6, 7 et 8.

## 8. Questions ouvertes

Aucune. Plan à valider.

## 9. Avancement

- 2026-11-17 : analyse et plan. Base : tsc 776 erreurs (5 dans `framework/modules/explorer`, toutes dans `model/index.ts`), eslint 2 090 erreurs / 88 warnings (2 dans le module : `import/order`, `prettier`), `yarn test` 431/431. Override `dev/default` actif, gardé (déjà appliqué avant la session). Questions tranchées (§7). Aucun code modifié.
- 2026-11-18 : cible revue : store d'`explorer` par app, fonctions qui prennent l'app (§5, §6 phases 2 à 4, §7) ; flux des noms d'apps (§5.4), `appName` = app demandée. Aucun code modifié.
