# Bascule : `explorer`

> Statut : à faire — mis à jour le 2026-11-23
>
> Fiche du module : sa bascule (étape 1), puis son assainissement (étape 2, §9). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](../INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](../BASCULE.md). Une page : ce qui est propre à ce module.
>
> Cette fiche remplace le plan de migration du 2026-11-18, écarté par le développeur le 2026-11-19 au profit d'une bascule. Un choix de cet ancien plan est repris (2026-11-23) : **un seul store, celui d'`explorer`, organisé par app** (§6, décision 6). L'ancien plan reste dans l'historique git (`ab17cef99`, `.claude/skills/migrate-module/journal/explorer.md`) ; le reste de ses idées va au backlog (§5).

## 1. Ce que fait le module

Module technique, **sans écran ni route propres**. Il fournit :

- l'accès à l'API `/explorer/resources` (dossiers et ressources d'une app ENT, paginés) ;
- aujourd'hui, des fabriques de reducer, d'actions et de sélecteurs, que chaque module consommateur branche dans **son propre** store (actions `<CONSOMMATEUR>_EXPLORER_LOAD_PAGE`) ; après la bascule, **son propre store**, par app (§4) ;
- le template `ResourceExplorer` (grille de dossiers et de ressources, navigation dans les sous-dossiers) et `createResourceExplorerNavBar` (titre de l'en-tête = titre du dossier).

L'utilisateur n'y entre jamais directement : il voit le template dans l'écran d'accueil de `wiki`, `blog`, `homework` et `scrapbook`.

## 2. Taille et dépendances

Repris de [SUIVI.md](SUIVI.md) le 2026-11-19.

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| 11 | 463 | 0 | 0 | 0 | — |

Navigation ancienne : 2 fichiers (`templates/resource-explorer/screen.tsx` : `screenOptions` de `~/app/navigation/util` ; `templates/resource-explorer/types.ts` : `NativeStackScreenProps`).

- **Déclaration** : `Module` de l'ancien système (pas `NavigableModule`), `reducer: () => null`. Absent de l'app : ligne commentée dans `src/app/modules.ts`, absent de `src/app/config/modules.ts`.
- **Modules anciens importés** : aucun. Imports transverses : `~/framework/modules/media` (façade `@deprecated` de `media`, types `ResourceMedia`, `MediaType`) ; `~/app/intents` (`newEntAppNameFromOldMap` et `NewEntAppName`, table et type de noms d'apps ; type `OldEntAppNameOrSynonym`) : **code seul**, pas d'intent ouvert ni enregistré, donc pas de condition d'arrêt (§6, décision 3). `~/framework/util/moduleTool` (`ModuleConfig`, `IUnkownModuleConfig`, `AnyNavigableModuleConfig` : types des fabriques, qui disparaissent avec elles).
- **Importeurs** (tous anciens, non chargés) : aucun n'importe `module-config.ts` (pas de `navigation/`), donc **pas de façade** de config.

| Importeur | Ce qu'il importe |
| --- | --- |
| `blog` | `createExplorerActions`, `createExplorerReducer`, `createExplorerSelectors` (`reducer.ts`) ; template et `ResourceExplorerTemplate` (`screens/explorer.tsx`) |
| `homework` | fabriques du store (`reducers/index.ts`) ; template, `ResourceExplorerTemplate`, `createResourceExplorerNavBar` (`screens/explorer.tsx`) |
| `scrapbook` | fabriques du store (`store.ts`) ; template, `ResourceExplorerTemplate`, `createResourceExplorerNavBar` (`screens/home/screen.tsx`) |
| `wiki` | `ExplorerAction` (`index.ts`), fabriques du store (`store.ts`), template, `ResourceExplorerTemplate`, `createResourceExplorerNavBar`, `RootFolderId` (`screens/home/`) ; `Resource`, `ResourceHistory` (`model/`, `screens/reader/`, `screens/summary/`), **qui n'existent pas** (§5) |

Les quatre passent au template `navigation` et `route` en props (casts vers `ResourceExplorerTemplate.NavigationProps`), son contexte d'API (`application` / `resource_type`), leur `moduleConfig` et leurs sélecteurs, et utilisent `ResourceExplorerTemplate.NavigationProps` / `ScreenProps` dans leurs propres types. `homework` force `route.name` à `homeworkExplorer` (le nom sous lequel l'écran est déjà déclaré : même valeur).

## 3. Comportements à conserver

Aucun consommateur n'est chargé : **rien n'est jouable dans l'app avant la bascule du premier consommateur** (`wiki`, ou `scrapbook`, plus simple). Pas de flow Maestro possible aujourd'hui ; la recette se joue avec ce consommateur.

| # | Comportement | Flow ou recette | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | Un dossier charge ses ressources par pages de 24, triées par date de modification décroissante, hors corbeille (`trashed: false`) ; le rechargement remplace les données (`staleOrSplice`, `reloadAll`) | recette : ouvrir l'accueil du consommateur, faire défiler au-delà de 24 ressources, tirer pour rafraîchir | — | — |
| 2 | Les dossiers s'affichent avant les ressources, grille de 2 colonnes, sans icône d'app (`alwaysShowAppIcon={false}`) | recette : accueil avec au moins un dossier | — | — |
| 3 | Toucher un dossier pousse **la même route** avec `{ folderId }`, seulement si l'écran a le focus (le template navigue lui-même) | recette : ouvrir un sous-dossier, puis revenir | — | — |
| 4 | Titre de l'en-tête : titre du dossier (métadonnées des sous-dossiers gardées au chargement du dossier parent), sinon le titre d'accueil (clé i18n du consommateur) | recette : titres de l'accueil et d'un sous-dossier | — | — |
| 5 | Toucher une ressource appelle `onOpenResource` du consommateur ; liste vide : `emptyComponent` du consommateur | recette : ouvrir une ressource ; dossier vide | — | — |
| 6 | **Données séparées par app** : les dossiers racine (`default`, `bin`) ont le même id dans toutes les apps, `wiki` et `blog` ne partagent rien ; deux écrans de la même app partagent les mêmes données (`homework` : explorateur aussi inclus dans `HomeworkInitialScreen`). Données vidées en fin de session | test Jest du reducer (deux apps, même `folderId`), s'il est demandé ; sinon recette avec le second consommateur basculé | — | — |
| 7 | Requête `GET /explorer/resources` inchangée (paramètres, `application` / `resource_type` du consommateur) ; `appName` d'une ressource = `newEntAppNameFromOldMap[item.application]` | relecture du diff | — | — |

`testID` : aucun dans le module. Stockage : aucun. Les types d'actions changent (`<CONSOMMATEUR>_EXPLORER_LOAD_PAGE` → `EXPLORER_LOAD_PAGE`, qui porte l'app) : rien d'autre ne les lit (`grep` à faire à la bascule).

## 4. Dans la bascule

- **Déclaration** (gestes 1, 2) : `module-config.ts` supprimé ; `index.ts` : `export default new CoreModule({ name: 'explorer', scope: ['explorer'], redux: { reducer } })`. `CoreModule` : pas d'app ENT à ouvrir ; l'ancien `hasRight: () => true` (toujours disponible) est le comportement d'un `CoreModule`. `matchEntcoreApp: 'Explorer'` et `storageName` disparaissent.
- **Store d'`explorer`** (décision 6, exception à « reducer et actions ne sont pas ouverts ») : un seul reducer, branché par `redux` dans `index.ts`, state à `state.explorer`, Redux gardé, vidé en fin de session (`createSessionReducer`, qui accepte toute action : CONVENTIONS « Données et état »). Les données sont rangées **par app**, puis par dossier comme aujourd'hui : `{ [app]: { [folderId]: { content?, metadata? } } }`. Chaque action et chaque sélecteur prennent l'app **en plus de leurs paramètres d'avant** : action `loadPage(app, folderId, data, flushPreviousData)` de type `EXPLORER_LOAD_PAGE` ; sélecteur `folder(app, folderId)`. La logique du reducer (fusion paginée `staleOrSplice`, métadonnées des sous-dossiers) ne change pas. Les fabriques (`createExplorerReducer`, `createExplorerActions`, `createExplorerSelectors`, `useExplorerActions`) disparaissent, et avec elles les types de `moduleTool`. Rangement des fichiers : celui de `myapps` (`store/state.ts`, `index.ts`, `action-creators.ts`, `selectors.ts`). Un test du reducer (deux apps, même `folderId`) n'est écrit que si le développeur le demande (`CLAUDE.md`).
- **Clé d'une app** (décision 9) : le nom converti par le service depuis le champ `application` de l'API (`newEntAppNameFromOldMap`), c'est-à-dire le `name` de l'`EntApp` (`'Wiki'`, `'Blog'`, `'Cahier de texte'`, `'Cahier Multimédia'`, type `NewEntAppName`). Le service expose cette conversion (une seule fonction, utilisée pour l'`appName` des ressources et pour la clé du contexte demandé) ; le template et `explorerScreenHeader` la calculent depuis le `context` que le consommateur leur donne déjà : **pas de prop `app` en plus**. Un `application` sans nom ENT dans la table (`Partial`) : erreur levée, comme toute erreur de chargement (à confirmer à la relecture du code).
- **Registre** (geste 17) : une ligne dans `src/app/config/modules.ts` (seul fichier touché hors du module). Le scope `explorer` est de nouveau demandé dans le jeton, comme quand l'ancien système chargeait `explorer` en module intégré.
- **Template** (décision 5) : contenu d'écran réutilisable, qui reçoit la `route` de l'écran consommateur et navigue lui-même. Props : `route` (typée par la nouvelle navigation, params `NavParams | undefined`, sans `NativeStackScreenProps`), `context`, `onOpenResource`, `emptyComponent`. La prop `navigation` disparaît : `useNavigation()` dans le template, pour `push(route.name, { folderId })` ; `useIsFocused` gardé. `moduleConfig` et `selectors` disparaissent : le template lit le store d'`explorer` avec la clé de l'app. Le chargement d'une page (service + dispatch) reste dans le template. Types `NavigationProps`, `ScreenProps`, `NavBarConfig`, `AllProps` réécrits ou retirés ; `NavParams` gardé (params de l'écran consommateur).
- **En-tête** (décision 8) : `explorerScreenHeader(context, homeTitleI18n)` → `({ route }) => ({ title })`, pour `defineScreen({ options })` du consommateur : titre du dossier lu dans le store d'`explorer`, sinon le titre d'accueil ; option `title`, jamais `headerTitle`. `createResourceExplorerNavBar` gardé, `@deprecated`, en façade sur le nouveau store (décision 10).
- **Routes, télémétrie, écrans, modales, `entries`, `withSession`, session, storages, notifications, widgets** : sans objet.
- **Consommateurs** (décision 7) : non touchés ; leurs appels, types et stores ne compilent plus jusqu'à leur bascule. Erreurs `tsc` nouvelles listées ici à la bascule.

## 5. Hors de la bascule

### Backlog

| # | Constat | Sujet |
| --- | --- | --- |
| 1 | `model/index.ts` orphelin et cassé (`Folder`, `Resource`, `items` n'existent plus) : 5 erreurs `tsc` (TS2305, TS2339 ×3, TS2724) | `erreurs` / `dette` (supprimer) |
| 2 | `templates/resource-explorer/styles.ts` orphelin (importé nulle part) | `dette` |
| 3 | `service/index.ts` : ligne vide en trop (2 erreurs ESLint `prettier`) ; `try { … } catch (e) { throw e; }` inutile | `erreurs`, `dette` |
| 4 | Service par `sessionFetch` au lieu de `getModuleTransport('explorer')` ; adaptateurs (`hydrate*`) dans `service/index.ts` au lieu de `service/adapter.ts` ; `namespace API.Explorer` imbriqué ; pas de test de l'adapter | `structure` |
| 5 | Table des noms d'apps (`newEntAppNameFromOldMap`, `NewEntAppName`) dans `~/app/intents` (commentaire « ugly »), loin du service qui en a besoin ; l'ancien plan la déplaçait dans l'adapter d'`explorer` | `structure` (à valider) |
| 6 | Contexte de l'API (`application` / `resource_type`) fourni par chaque consommateur. L'ancien plan le mettait dans le service d'`explorer` (une table app → contexte), les consommateurs ne donnant plus que l'app | `structure` / API publique (à valider) |
| 7 | Chargement d'une page (appel du service + dispatch) fait dans le template, pas dans une action (`actions.ts`, ex. `loadExplorerPage(app, folderId, …)` de l'ancien plan) | `structure` |
| 8 | Template : erreurs de chargement en `console.error` puis relancées ; commentaire mort `// DUMMY WAIT` | `dette` |
| 9 | Exports sans lecteur : `ExplorerAppTypes`, `NavParams.folderName` | `dette` |
| 10 | Titre de l'en-tête lu dans le store par les options (`getStore().getState()`) : pas recalculé si le store change. Suffit aujourd'hui (métadonnées chargées avant l'ouverture du sous-dossier). Rejoint la question 7 de [wiki.md](wiki.md) (titre lu dans le store sans `headerTitle`) | `ui` (à valider) |
| 11 | `API.Explorer.ROOT_FOLDER` vaut `'default '` (espace en trop, `service/types.ts`) ; type seulement, la valeur envoyée vient de `RootFolderId.ROOT` (`'default'`). Relevé par l'ancien plan | `erreurs` |
| 12 | `createResourceExplorerNavBar` `@deprecated` : à supprimer quand plus aucun consommateur ne l'importe | `dette` |

### Noté, non traité

- `wiki` importe `Resource` et `ResourceHistory` de `~/framework/modules/explorer/model/types`, qui ne les exportent pas : erreurs TS2305 dans `wiki` (`model/index.ts`, `screens/reader/types.ts`, `screens/summary/types.ts`). Bug de `wiki`, à traiter à sa bascule ou son assainissement ([later.md](later.md)).
- `~/app/intents` importe l'ancien `navigationRef` (`src/app/navigation`) : `explorer` n'en lit qu'une table de noms. Chantier des intents ([later.md](later.md), STATUS B5).
- `src/framework/components/explorer/resource-picker` : composant du framework sans lien avec ce module (n'importe rien de lui).

## 6. Décisions

1. **Plan du 2026-11-18 écarté** (2026-11-19, développeur) : bascule selon [BASCULE.md](../BASCULE.md) ; la refonte va au backlog (§5), sauf le store (décision 6).
2. **Pas de suffixe de route d'accueil à choisir** (2026-11-19) : le module n'a ni écran ni route.
3. **`~/app/intents` n'arrête pas la bascule** (2026-11-19, décidé seul, à relire) : `explorer` n'en importe qu'une table de noms et des types ; il n'ouvre ni n'enregistre d'intent. Répond à STATUS B5 pour `explorer` : pas bloquant.
4. **`CoreModule`** (2026-11-19, geste 2) : pas d'app ENT à ouvrir ; toujours disponible comme avant (`hasRight: () => true`).
5. **Le template navigue lui-même** (2026-11-23, développeur ; remplace la décision du 2026-11-19 « template sans navigation, props d'événement »). Un template est un contenu d'écran réutilisable tel quel, auquel l'écran passe sa `route` : il peut utiliser la navigation directement (`useNavigation()`, `useIsFocused`). Seule la prop `navigation` disparaît. Règle générale : CONVENTIONS « Trois types de composants ».
6. **Un seul store, celui d'`explorer`** (2026-11-23, développeur, repris de l'ancien plan, décision du 2026-11-18) : plus de fabrique ni de slice chez les consommateurs ; `explorer` gère son propre store, en Redux, et y range les données par app. Chaque action (et chaque sélecteur) prend l'app en plus de ses paramètres d'avant. Exception à BASCULE (« reducer, actions… ne sont pas ouverts »). Le reste de la refonte de l'ancien plan reste au backlog (§5, 4 à 7).
7. **Consommateurs cassés en attendant leur bascule** (2026-11-23, développeur) : `blog`, `homework`, `scrapbook`, `wiki` ne sont pas touchés ; les erreurs `tsc` sur leurs appels, types et stores sont acceptées et listées (§4, §7).
8. **En-tête** (2026-11-23, développeur) : nouvelle aide `explorerScreenHeader` pour `defineScreen({ options })` ; `createResourceExplorerNavBar` gardé en `@deprecated` (forme : décision 10).
9. **Clé d'une app** (2026-11-23, développeur) : le nom converti par le service d'`explorer` depuis le champ `application` de l'API, qui doit correspondre au `name` de l'`EntApp`.

10. **`createResourceExplorerNavBar` en façade sur le nouveau store** (2026-11-23, développeur) : `createResourceExplorerNavBar(homeFolderi18n, context)`, `@deprecated`, sur l'ancien `screenOptions` comme avant (en-tête de l'ancienne navigation), titre lu par le nouveau sélecteur. Dans son propre fichier (`templates/resource-explorer/deprecated.ts`), pour isoler la navigation ancienne. Le second argument des anciens navigateurs change (`selectors` → `context`). Conséquence acceptée : `explorer` garde un fichier de navigation ancienne, statut `bascule incomplète` dans [SUIVI.md](SUIVI.md) jusqu'à la suppression de la façade (§5, 12). Option écartée : signature inchangée (`selectors`), qu'aucun consommateur ne pourrait plus remplir.

### Questions ouvertes

Aucune.

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module (comparé fichier par fichier) | 770 au total ; 5 dans le module (`model/index.ts`) | |
| `tsc` chez les consommateurs (erreurs nouvelles acceptées, décision 7) | — | |
| ESLint sur le dossier | 2 erreurs (`prettier`, `service/index.ts`) | |
| `yarn lint-all` (total) | 2168 problèmes (2083 erreurs, 85 avertissements) | |
| Jest | 447/447 | |
| Compteurs de [SUIVI.md](SUIVI.md) | statut `—`, navigation ancienne 2 | |
| Flows Maestro ou recette manuelle | aucun flow possible (aucun consommateur chargé) | |
| Parcours joué dans l'app (iOS, Android) | — | |

Ce qui ne peut pas encore être joué dans l'app, et le module qu'il attend : tout le template (§3), jusqu'à la bascule de `wiki` ou de `scrapbook`. Le store par app (§3, 6) peut se vérifier avant par un test du reducer, s'il est demandé.

## 8. Mesure

À remplir en fin de bascule.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR. Sujets tirés de §5.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
| | | | | |
