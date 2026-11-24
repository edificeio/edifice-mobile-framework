# Migration : `wiki`

> Statut : spec, **en attente des préalables `explorer` et `audience`** — mis à jour le 2026-11-17

## 1. Périmètre

Module fonctionnel `wiki` (app ENT `Wiki`), en **lecture seule** : explorateur des wikis (dossiers + wikis), sommaire d'un wiki (vignette, description, liste des pages en arbre), lecture d'une page (auteur, date, contenu riche, page précédente / suivante, liste des pages en bottom sheet), vue marquée (audience).

Aujourd'hui **absent de l'app** : `NavigableModule`, pas dans `src/app/config/modules.ts`.

Dans le périmètre : déclaration, données, écrans, conversion de la bottom sheet.

Hors périmètre, reporté :

- Ouverture des notifications `WIKI.*` (`notif-handler.ts`) : pas d'équivalent dans le nouveau système (later.md, STATUS question 1).
- Intent `registerIntent('Wiki', OPEN_RESOURCE)` (→ `wiki/summary`) : remplacé par `entries.resource` le 2026-11-24, à déclarer à la bascule (`ToDo(wiki-migration)` dans `index.ts`, [framework.md](../framework.md)).
- Création (écran `wiki/create` vide, composants `image-input`) : jamais branchée (question 4).

## 2. Existant

### 2.1 Module ancien (`src/framework/modules/wiki`, 2 652 lignes)

| Fichier            | Rôle                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `module-config.ts` | `name: 'wiki'`, `entcoreScope: ['wiki', 'explorer']`, `matchEntcoreApp: 'Wiki'`, `entcoreTrackingName: 'Wiki'`, `storageName: 'wiki'` (aucun storage), `displayOrder: 0`, `fileManager.ressource` (image, caméra / galerie). `wikiAudienceConfig` (`module: 'wiki'`, `resourceType: 'page'`).                                        |
| `index.ts`         | `NavigableModule` (reducer casté) + `registerIntent('Wiki', OPEN_RESOURCE)` + `setUpNotifHandlers()`.                                                                                                                                                                                                                                |
| `navigation/`      | Routes `wiki` (explorateur), `wiki/summary`, `wiki/reader`, `wiki/create` (`containedModal`). Déjà en kebab-case.                                                                                                                                                                                                                    |
| `model/index.ts`   | `Wiki`, `WikiPageMetaData`, `WikiPage`. Repose sur `Resource` / `ResourceHistory` de `explorer/model/types`, **qui n'existent plus** (erreurs tsc).                                                                                                                                                                                  |
| `store.ts`         | Redux : `explorer`, `wikis` par id, `pages` par id ; actions `loadWiki` / `loadPage` ; sélecteurs (`moduleConfig.getState`).                                                                                                                                                                                                         |
| `service/`         | `GET /wiki/{id}`, `GET /wiki/{id}/page/{pageId}` (`sessionFetch`, dates en `Temporal.Instant`). Contient des **règles métier** : droits calculés depuis `rights` (`creator` / `user` / `group`), pages masquées visibles seulement par `creator` / `manager`, ordre des pages en arbre (position, profondeur). Lit `getSession()`.   |
| `rights.ts`        | `hasWikiCreationRights` (`WikiController                                                                                                                                                                                                                                                                                             | createWiki`), pour l'écran vide de l'explorateur. |
| `notif-handler.ts` | `WIKI` `SHARED` / `PAGE-DELETED` → `wiki/summary` ; `PAGE-UPDATED` / `PAGE-CREATED` / `PAGE-VISIBLE` → `wiki/reader`, dans l'onglet de `timeline`.                                                                                                                                                                                   |
| `screens/home/`    | Explorateur : template `ResourceExplorer`, titre par `createResourceExplorerNavBar`, écrans vides selon le dossier et le droit de création. Menu « nouveau cours » commenté.                                                                                                                                                         |
| `screens/summary/` | Sommaire : `ContentLoader`, `ResourceHeader`, `PageList` ; titre par `setOptions` après chargement (et lu dans le store par `computeNavBar`).                                                                                                                                                                                        |
| `screens/reader/`  | Lecture d'une page : `PageHeader` (visible / masquée), avatar, date, `RichEditorViewer`, précédente / suivante par `navigation.replace` (`reverseAnimation` → `animationTypeForReplace`), `PageListBottomSheet` (`@gorhom`), `useAudience().markView()`.                                                                             |
| `screens/create/`  | Écran vide, **inatteignable** (seul accès dans le menu commenté).                                                                                                                                                                                                                                                                    |
| `components/`      | `page-list` (+ `page-list-bottom-sheet`), `page-header`, `resource-header` (+ loader), `resource-description` (+ loader), `resource-thumbnail`, `select-button`, `icon-chip`. **Orphelins** : `image-input` (+ `image-input-button`, seul utilisateur de `FileManager.pick` / `fileManager.ressource`), `resource-thumbnail-loader`. |

### 2.2 Consommateurs externes

| Consommateur                                                             | Importe / référence                                      | Cible                                                                                                              |
| ------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/framework/modules/communities/components/home-screen-tiles/courses` | `wikiRouteNames.summary` (`navigate(…, { resourceId })`) | `communities` ancien, non chargé : façade `@deprecated` de `navigation/index.ts` (route `wiki/summary` inchangée). |
| `src/app/override/modules.ts`, `__overrides__/*/modules.ts` (11)         | `require('~/framework/modules/wiki')`                    | Ancien registre, plus importé. Les 11 listes ont `wiki`. Nettoyage (fichiers overridés).                           |
| `src/app/intents.ts`                                                     | `'wiki'` / `'Wiki'` (noms d'app)                         | Inchangé.                                                                                                          |

### 2.3 Dépendances transverses

| Dépendance                                                                                                              | État                                                   | Piste                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~/framework/modules/explorer` (store, service, template `ResourceExplorer`, `createResourceExplorerNavBar`)            | **Ancien, à migrer** (`Module` sans écran, 452 lignes) | Partagé avec `blog`, `homework`, `scrapbook`. Template typé ancienne navigation (props `navigation` / `route`, `screenOptions`, `moduleConfig.namespaceActionType`). Question 2. |
| `useAudience` (`~/framework/modules/audience`)                                                                          | Ancien (STATUS question ouverte n° 2)                  | Hook seul (`audienceService.view.post` + `useFocusEffect`), sans navigation : fonctionne tel quel. Question 3.                                                                   |
| `BottomSheetModal` (`~/framework/components/modals/bottom-sheet`, `@gorhom`)                                            | Conversion imposée                                     | Modale `formSheet` (§4 n° 3).                                                                                                                                                    |
| `~/framework/modules/auth/redux/reducer` (`getSession`)                                                                 | Façade `@deprecated`                                   | Session passée par l'action (`useSession` / getter de `~/modules/auth`).                                                                                                         |
| `navBarOptions` (`titleTestID`, `backButtonTestID`), `screenOptions`                                                    | Ancien                                                 | `defineScreen` options ; `testID` du titre et du retour à reproduire (question 6).                                                                                               |
| `toURISource` (`~/framework/modules/media`), `sessionImageSource`                                                       | Façade `media` / transport                             | `~/modules/media` (API publique), à vérifier en phase 5.                                                                                                                         |
| `ContentLoader`, `RichEditorViewer`, `SingleAvatar`, `GhostButton`, `FlatList`, `EmptyScreen`, `useCurvedNavBarFeature` | Composants du framework                                | Tels quels.                                                                                                                                                                      |
| `fileManager` de la config                                                                                              | Clé `fileManager` faite (2026-11-17)                   | Seul `image-input` (orphelin) s'en sert : question 4.                                                                                                                            |
| `Temporal`                                                                                                              | Déjà utilisé                                           | Rien à faire.                                                                                                                                                                    |

## 3. Comportements à conserver

**Faciles à oublier**

- Droits sur un wiki calculés côté app depuis `rights` (`creator:<id>`, `user:<id>:<right>`, `group:<id>:<right>`).
- Pages masquées (`isVisible: false`) listées seulement pour `creator` / `manager` ; sinon filtrées.
- Ordre des pages : tri par `position`, puis parcours en profondeur des enfants (triés par `position`), avec `depth`. Précédente / suivante suivent cet ordre.
- Changer de page **remplace** l'écran de lecture (pas d'empilement), animation inversée pour « précédente ».
- La liste des pages de la lecture surligne la page courante et s'ouvre sous le bouton de sélection (`additionalTopInset`).
- Vue marquée une fois par focus, après chargement de la page (`useAudience`).
- Titre de l'en-tête : nom du wiki (sommaire), titre de la page (lecture), nom du dossier ou `wiki-home-title` (explorateur).
- Auteur affiché : dernier contributeur, sinon auteur ; date : `updatedAt`, sinon `createdAt` (`I18n.date`).
- Explorateur vide : à la racine, bouton vers `/wiki` si droit `createWiki` ; dans un dossier, écran « dossier vide ».
- Tirer pour rafraîchir sur le sommaire et la lecture (`ContentLoader`).

**Données** : `GET /wiki/{id}`, `GET /wiki/{id}/page/{pageId}`, `/explorer/…`. Pas de storage.

**testID** (E2E, nombreux ; ceux de l'en-tête `wiki-back-button`, `wiki-title`, `page-back-button` sont abandonnés, §7) : `page-list-title`, `page-list-title-loader`, `page-list-content-loader`, `wiki-description`, `wiki-expansion-indicator`, `list-item-number-<n>`, `page-select-button`, `page-select-button-loader`, `page-title`, `page-title-loader`, `page-author-avatar`, `page-author-avatar-loader`, `page-author-name`, `page-author-info-loader`, `page-date`, `page-content`, `page-content-loader`, `previous-page-button`, `next-page-button`, `visibility-indicator`.

**i18n** : 21 clés `wiki-*` inchangées. Tracking : `entTrackingName: 'Wiki'`. Audience : `module: 'wiki'`, `resourceType: 'page'`.

## 4. Ancienneté de conception à corriger au passage

| #   | Constat                                                                                                                                                    | Correction proposée                                                                                                                                                                                         | Statut             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | `model/` dépend de `Resource` / `ResourceHistory` d'`explorer`, supprimés ; `WikiPage` n'a plus `creatorId`, `updatedAt`… (22 erreurs tsc dans le module). | Types propres au wiki dans `model/index.ts` (métadonnées et historique), le module compile sans erreur.                                                                                                     | à faire au portage |
| 2   | Règles métier dans le service (droits, pages masquées, ordre en arbre), qui lit `getSession()`.                                                            | Règles pures dans `model/` (`rights.ts`, `pages.ts`), session en paramètre ; l'adapter ne fait que traduire. Tests Jest.                                                                                    | réglé par la cible |
| 3   | Liste des pages en bottom sheet `@gorhom` (`PageListBottomSheet`, `ref.present()`).                                                                        | Modale `formSheet` `wiki/pages` (params `resourceId`, `currentPageId`) ; au choix d'une page : fermer puis remplacer la lecture. L'ouverture « sous le bouton » (`additionalTopInset`) devient des détents. | à faire au portage |
| 4   | Titres par `navigation.setOptions` après chargement, et lecture du store par `getStore()` dans les options.                                                | Titre lu dans le store par un autre moyen ; **jamais `headerTitle`** (perd le titre natif). Moyen : §8 question 7.                                                                                          | à faire au portage |
| 5   | Reducer casté (`as unknown as Reducer<…>`) dans `index.ts`.                                                                                                | `createSessionReducer` qui accepte toute action (CONVENTIONS « Données et état »), sans cast.                                                                                                               | réglé par la cible |
| 6   | Écran vide `wiki/create`, `image-input` / `image-input-button`, `resource-thumbnail-loader`, `fileManager.ressource` : orphelins.                          | Question 4.                                                                                                                                                                                                 | à valider          |
| 7   | Écran vide d'un dossier : `buttonText` passé deux fois (le premier, conditionnel, est écrasé : le bouton s'affiche même sans droit de création).           | Garder seulement la version conditionnelle (bouton si droit de création).                                                                                                                                   | à faire au portage |
| 8   | Commentaires « Create page button for next version », menu « nouveau cours » commenté.                                                                     | Rien (portés tels quels).                                                                                                                                                                                   | noté               |

## 5. Cible

Proposée, à confirmer par §8.

### 5.1 Config

```ts
export default new EntModule({
  name: 'wiki',
  scope: ['wiki'], // `explorer` est déclaré par le CoreModule `explorer` ([explorer.md](explorer.md) §5.1) : à confirmer à la reprise
  matchEntcoreApp: 'Wiki',
  entTrackingName: 'Wiki',
  entries: { myApps: { route: 'wiki' } }, // explorateur, params facultatifs (`folderId`) ; pas d'onglet
  screens: { wiki, 'wiki/summary', 'wiki/reader' },
  modals: { 'wiki/pages' }, // formSheet (§4 n° 3)
  redux: { reducer },
});
```

Pas de droits supplémentaires, pas de hook de session, pas de storage. `fileManager` : selon la question 4.

### 5.2 Structure

Celle de `myapps` (CONVENTIONS « Structure d'un module ») :

- `model/` : `index.ts` (types), `rights.ts` (droits depuis `rights`, `hasWikiCreationRights`, qui voit les pages masquées), `pages.ts` (ordre en arbre, précédente / suivante). Tests.
- `service/` : `types.ts` (`namespace API`, nom gardé : décidé le 2026-11-19), `adapter.ts` (→ modèle, `Temporal`), `index.ts` (`getModuleTransport('wiki')`). Tests de l'adapter.
- `store/` : Redux `createSessionReducer` : `wikis`, `pages` ; `state.ts`, `action-creators.ts`, `selectors.ts`. Plus de slice `explorer` : les dossiers et wikis de l'explorateur sont dans le store d'`explorer`, sous l'app `Wiki` ([explorer.md](explorer.md) §5.3).
- `actions.ts` : charger un wiki, charger une page.
- `screens/` : `home/`, `summary/`, `reader/` gardés ; `pages.tsx` nouveau (formSheet).
- `components/` : inchangés (sauf orphelins, question 4).

### 5.3 Façades

`navigation/index.ts` (`wikiRouteNames`, lu par `communities`) : façade `@deprecated` tant que `communities` n'est pas migré.

## 6. Plan par phases

| #     | Phase                    | Contenu                                                                                                                                                                                                                                                                                   | Vérification                                |
| ----- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 0 bis | Préalables : modules     | **Arrêt de cette migration** (§7) : `/migrate-module src/framework/modules/explorer`, puis `/migrate-module src/framework/modules/audience`, chacun sa fiche. `explorer` bloque le store (phase 2) et l'explorateur (phase 5) ; `audience` bloque la vue marquée de la lecture (phase 5). | selon leurs fiches                          |
| 1     | Déplacements             | `git mv` seuls : `store.ts` → `store/index.ts`, `rights.ts` → `model/rights.ts`. À committer seul.                                                                                                                                                 | tsc : même nombre d'erreurs                 |
| 2     | Données                  | `model/` (types §4 n° 1, règles §4 n° 2), `service/` (`getModuleTransport('wiki')`, adapter), `store/`, `actions.ts`. Tests Jest : droits, pages masquées, ordre des pages, adapter.                                                                                                      | tsc, eslint, `yarn test`                    |
| 3     | Déclaration + chargement | `index.ts` en `EntModule` (§5.1), ajout dans `src/app/config/modules.ts`.                                                                                                                                                                                                                 | tsc ; « Mes applis » montre Wiki et l'ouvre |
| 4     | Façades                  | `navigation/index.ts` (`wikiRouteNames`) pour `communities`.                                                                                                                                                                                                                              | tsc, aucun import cassé                     |
| 5     | Écrans                   | `defineScreen` : `wiki` (explorateur, sous-dossiers), `wiki/summary`, `wiki/reader` (`replace` + `animationTypeForReplace`), titres (§4 n° 4, question 7), `testID` conservés sauf ceux de l'en-tête.                                                                                     | parcours dans l'app                         |
| 6     | Modales                  | `wiki/pages` en `formSheet` (§4 n° 3).                                                                                                                                                                                                                                                    | parcours dans l'app                         |
| 7     | Points reportés          | `ToDo(wiki-migration)` + later.md : notifications, intent.                                                                                                                                                                                                                                | `grep -rn "ToDo(wiki-migration)" src`       |
| 8     | Nettoyage                | Suppression de `module-config.ts`, `navigator.tsx`, `notif-handler.ts` (gardé dans git), `page-list-bottom-sheet`, orphelins (question 4), façades sans importeur. Listes `__overrides__/*/modules.ts` : à décider.                                                                       | `grep -rn` des anciens chemins              |

## 7. Décisions

- 2026-11-17 (règle) : notifications et intent reportés (later.md, STATUS question 1).
- 2026-11-17 (règle) : **Redux** gardé (CONVENTIONS « garder le gestionnaire d'état du module »).
- 2026-11-18 (utilisateur, [explorer.md](explorer.md) §7, remplace « le state de l'explorateur y est aussi ») : le state de l'explorateur est dans le store d'`explorer`, par app ; `wiki` n'a plus de slice `explorer` et passe seulement `app="Wiki"` au template et à `resourceExplorerScreenOptions`.
- 2026-11-17 (règle) : bottom sheet de la liste des pages → `formSheet` (CONVENTIONS « UI »).
- 2026-11-17 (utilisateur) : **emplacement sur place**, `src/framework/modules/wiki/`. Raison : règle d'ARCHITECTURE §2 (module fonctionnel), diffs lisibles.
- 2026-11-17 (utilisateur) : **`explorer` migré d'abord** (préalable, sa propre fiche) : `CoreModule` `explorer` (scope, store) et template pour la nouvelle navigation. Raison : petit, partagé par `blog`, `homework`, `scrapbook`.
- 2026-11-17 (utilisateur) : **`audience` migré d'abord** (préalable, sa propre fiche), plutôt que `useAudience` tel quel. Tranche la question ouverte n° 2 de STATUS pour `wiki` (« avant »).
- 2026-11-17 (utilisateur) : **orphelins non portés** (`wiki/create`, `image-input`, `image-input-button`, `resource-thumbnail-loader`), supprimés au nettoyage (restent dans git) ; pas de clé `fileManager`.
- 2026-11-17 (utilisateur) : **arrêt de cette migration** pour migrer d'abord `explorer` puis `audience`, chacun avec son `/migrate-module`. `wiki` reprend à la phase 1 (plan à valider à la reprise).
- 2026-11-17 (utilisateur) : **corrections au passage** §4 n° 3 (détents du `formSheet`), n° 4 (titres) et n° 7 (bouton du dossier vide).
- 2026-11-17 (utilisateur) : **`testID` de l'en-tête abandonnés** (`wiki-back-button`, `page-back-button`, `wiki-title`) : on prend le comportement du framework (bouton retour et `header-title` du nouveau header). Tests E2E concernés à mettre à jour.
- 2026-11-17 (utilisateur) : **jamais `headerTitle`** pour afficher le titre lu dans le store : on perdrait le titre natif. Le moyen reste à trouver (§8 question 7). Règle ajoutée à [CONVENTIONS.md](../CONVENTIONS.md) (« UI »).

## 8. Questions ouvertes

Questions 1 à 6 tranchées le 2026-11-17 (§7).

7. **Titre lu dans le store, sans `headerTitle`** (§4 n° 4). Le titre du sommaire (nom du wiki) et de la lecture (titre de la page) n'est connu qu'après chargement quand on arrive par une notification ou un intent ; depuis l'explorateur ou le sommaire, l'appelant le connaît déjà.

- A) Param facultatif `title` passé par l'appelant, lu par `options: ({ route }) => ({ title: route.params?.title })` ; après chargement, `navigation.setParams({ title })` (les options se recalculent, titre natif gardé, typé).
- B) Dans l'écran, `useLayoutEffect` qui fait `navigation.setOptions({ title })` depuis un sélecteur du store (le motif « `setOptions` dans un effet » que CONVENTIONS évite).
- C) Évolution du framework : `defineScreen` accepte une fonction de titre qui lit le store (abonnement fait par le framework) ; utile aux autres modules (phase 0).
- Recommandation : A, à confirmer à la reprise (pas de changement du framework, titre natif ; le titre est aussi dans le store pour le reste de l'écran).

## 9. Avancement

- 2026-11-17 : analyse et plan (statut `spec`). Base : tsc 776 erreurs (22 dans `framework/modules/wiki`), eslint 2 090 erreurs / 88 warnings, `yarn test` 431/431 (mesurée plus tôt dans la session, même commit `a28c54847`, arbre propre). Override `dev/default` appliqué par le skill.
- 2026-11-17 : questions 1 à 6 tranchées. **Migration arrêtée** pour les préalables : `explorer` puis `audience` (chacun `/migrate-module`). À la reprise : question 7, validation du plan, puis phase 1. Aucun code modifié.
