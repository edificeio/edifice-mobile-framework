# Bascule : `wiki`

> Statut : basculé, puis assaini (tous les sujets), pas testé dans l'app, non commité — mis à jour le 2026-11-25
>
> Fiche du module : sa bascule (étape 1), puis son assainissement (étape 2, §9). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](../INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](../BASCULE.md). Une page : ce qui est propre à ce module.
>
> Remplace la fiche « spec » du 2026-11-17 (plan en 8 phases, d'avant le découpage bascule / assainissement). Ses décisions sont reprises en §6 ; ses corrections « au passage » vont au backlog (§5). L'ancienne version est dans git (`5f34cd48e`).

## 1. Ce que fait le module

Lecture des wikis de l'ENT (app `Wiki`) : explorateur des dossiers et wikis, sommaire d'un wiki (vignette, description, pages en arbre), lecture d'une page (auteur, date, contenu riche, page précédente / suivante, liste des pages en bottom sheet), avec ses commentaires (ajout, réponse, modification, suppression ; arrivés d'upstream). Vue marquée (`audience`).

On y entre par « Mes applis », par une notification `WIKI.*`, par l'ouverture d'une ressource `wiki` (`intents.resource`), et depuis la tuile « cours » de `communities` (ancien, non chargé).

## 2. Taille et dépendances

Repris de [SUIVI.md](SUIVI.md) le 2026-11-25.

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| 73 | 2 718 | 3 (+ `wiki/create`, vide) | 1 (`wiki/create`, `containedModal`) | 0 | oui |

- **Modules anciens importés** : aucun. `timeline` (`module-config`, dans `notif-handler.ts`) part avec le geste 19. Le reste est basculé ou en façade :
  - `explorer` (basculé, `CoreModule`) : template `ResourceExplorer`, `explorerScreenHeader`, `RootFolderId`. Le store de `wiki` a encore une slice `explorer` sur les anciennes fabriques, supprimées : 3 erreurs `tsc` (`store.ts`), plus 5 sur les anciens types du template (`screens/home/`). Nouveau contrat à appliquer ([explorer.md](explorer.md) décisions 6 et 7).
  - `comments` (basculé, `CoreModule`) : `ResourceWithCommentsTemplate` (navigue lui-même vers `comments/reply`), `CommentsTreeProps`, types de `comments/types`. `model/index.ts` et `service/index.ts` importent encore `comments/templates/comments-thread` et `comments/components/comments-thread`, absents depuis upstream ([comments.md](comments.md)).
  - `audience` : façade `@deprecated` `~/framework/modules/audience` (`useAudience`, type `AudienceReferer`), qui marche.
  - `media` : façade `~/framework/modules/media` (`toURISource`), qui marche.
  - `auth` : `~/framework/modules/auth/model` (`rights.ts`, `service/`), `getSession` de `~/framework/modules/auth/redux/reducer` (`service/`, `screens/home/`) : geste 14.
- **Importeurs** :
  - `src/framework/modules/communities/components/home-screen-tiles/courses/component.tsx` : `wikiRouteNames.summary` (`navigate(…, { resourceId })`). Ancien, non chargé : **façade** `navigation/index.ts` (geste 15), route `wiki/summary` inchangée.
  - `src/app/override/modules.ts` et `__overrides__/*/modules.ts` (11, fichiers overridés) : `require('~/framework/modules/wiki')`, ancien registre, plus lu. Non touchés.
  - `src/app/ent-app-names.ts` : `'wiki'` (nom d'app). Inchangé.

## 3. Comportements à conserver

Aucun flow Maestro aujourd'hui. Sur cette branche, l'ancienne génération n'est pas jouable (`wiki` non chargé) : les flows se jouent avant sur un build de la branche de développement, après sur la bascule. Les `testID` du module le permettent (liste plus bas).

| # | Comportement | Flow ou recette | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | « Mes applis » → Wiki ouvre l'explorateur ; titre `wiki-home-title`, puis nom du dossier ouvert ; racine vide : bouton vers `/wiki` si droit `createWiki`, sinon texte seul ; dossier vide : écran « dossier vide » | `wiki-01-explorateur.yaml` | — | — |
| 2 | Toucher un wiki ouvre le sommaire : titre = nom du wiki ; vignette, description dépliable (`wiki-expansion-indicator`), pages en arbre (`list-item-number-<n>`), pages masquées seulement pour `creator` / `manager` ; tirer pour rafraîchir | `wiki-02-sommaire.yaml` | — | — |
| 3 | Toucher une page ouvre la lecture : titre = titre de la page ; badge visible / masquée ; auteur = dernier contributeur sinon auteur ; date = `updatedAt` sinon `createdAt` ; contenu riche ; vue marquée une fois par focus, après le chargement | `wiki-03-lecture.yaml` | — | — |
| 4 | Précédente / suivante **remplacent** l'écran de lecture (pas d'empilement : un seul retour vers le sommaire), animation inversée pour « précédente » ; boutons désactivés aux extrémités, dans l'ordre de l'arbre | `wiki-04-precedente-suivante.yaml` | — | — |
| 5 | `page-select-button` ouvre la liste des pages (bottom sheet sous le bouton), page courante surlignée ; choisir une page remplace la lecture | `wiki-05-liste-pages.yaml` | — | — |
| 6 | Commentaires de la page : champ si droit `comment` ou `creator` ; publier, répondre (modale `comments/reply`), modifier, supprimer ; défilement vers le commentaire publié | recette manuelle (écrit sur le serveur) : publier puis supprimer un commentaire sur un wiki de test | — | — |
| 7 | Notification `WIKI` `SHARED` / `PAGE-DELETED` → sommaire ; `PAGE-UPDATED` / `PAGE-CREATED` / `PAGE-VISIBLE` → lecture | non jouable sur la branche (intents pas encore lus, [STATUS.md](STATUS.md) B1) : relecture de `intents.ts` | — | — |

`testID` du module (inchangés) : `page-list-title`, `page-list-title-loader`, `page-list-content-loader`, `wiki-description`, `wiki-expansion-indicator`, `list-item-number-<n>`, `page-select-button`, `page-select-button-loader`, `page-title`, `page-title-loader`, `page-author-avatar`, `page-author-avatar-loader`, `page-author-name`, `page-author-info-loader`, `page-date`, `page-content`, `page-content-loader`, `previous-page-button`, `next-page-button`, `visibility-indicator`. Abandonnés (décision 2026-11-17, §6) : `wiki-back-button`, `wiki-title` (sommaire), passés à `navBarOptions` qui disparaît. Stockage : aucun (`storageName: 'wiki'` inutilisé). i18n : clés `wiki-*` inchangées.

## 4. Dans la bascule

- **`index.ts`** (gestes 1, 2, 3, 17) : `export default new EntModule({ name: 'wiki', scope: ['wiki'], matchEntcoreApp: 'Wiki', entTrackingName: 'Wiki', redux: { reducer }, screens, entries: { myApps: { route: 'wiki/explorer' } }, intents })`. `module-config.ts` supprimé : `displayOrder`, `storageName` disparaissent ; `explorer` sort du `scope` (déclaré par le `CoreModule` `explorer`, comme pour `blog`) ; pas de `fileManager` (décision 4). `wikiAudienceConfig` (lu par la lecture) déménage dans `screens/reader/screen.tsx`, même valeur. `hasRight` par défaut. Ligne dans `src/app/config/modules.ts`.
- **Intents** (`intents.ts` à la racine, `ConfigForIntents`, modèle `blog`) :
  - `resource` : `[{ resourceType: 'wiki', callback: (resource, navigation) => (navigation.push('wiki/summary', { resourceId: resource.resourceId }), true) }]` (ancien `StackActions.push`) ; le `ToDo(wiki-migration)` de l'ancien `index.ts` part avec lui.
  - `notification` (geste 19) : les deux gestionnaires de `notif-handler.ts`, un pour un. `notificationIntent({ type: 'WIKI', eventType: ['SHARED', 'PAGE-DELETED'] })` → `navigation.navigate('wiki/summary', { resourceId })` ; `notificationIntent({ type: 'WIKI', eventType: ['PAGE-UPDATED', 'PAGE-CREATED', 'PAGE-VISIBLE'] })` → `navigation.navigate('wiki/reader', { pageId, resourceId })`. Regex et `getAsResourceUriNotification` gardés ; `{ managed: 0 }` → `false`, `{ managed: 1 }` → `true`. Partent : `trackInfo`, l'onglet de `timeline`, `handleNotificationNavigationAction`, et le param `notification` (aucun écran ne le lit, absent des params typés). `notif-handler.ts` supprimé.
- **Navigation** (gestes 4, 5) : `navigator.tsx` supprimé ; `navigation/index.ts` devient une façade `@deprecated` (`wikiRouteNames.summary` seulement, pour `communities`). `setModalModeForRoutes` disparaît.

  | Ancienne | Nouvelle | Écran | Type |
  | --- | --- | --- | --- |
  | `wiki` (accueil) | `wiki/explorer` (décision 1) | `screens/home/` | écran |
  | `wiki/summary` | `wiki/summary` | `screens/summary/` | écran |
  | `wiki/reader` | `wiki/reader` | `screens/reader/` | écran |
  | `wiki/create` | supprimée (décision 4) | `screens/create/` | modale (`containedModal`) |

  Télémétrie : seul l'accueil change (`wiki` → `wiki/explorer`).
- **Écrans** (gestes 6, 9, 18) : `defineScreen`, props `StaticScreenProps<Params>`, `useNavigation()` dans les composants (`WikiSummaryScreenLoaded`, `WikiReaderScreenLoaded` ne reçoivent plus `navigation`). Params en `type` au lieu d'`interface` (`StaticScreenProps` exige un `Record`, comme `blog` et `audience`). Types `NavigationProps`, `NavBarConfig`, `AllProps` retirés.
  - accueil : nouveau contrat d'`explorer` : le template reçoit `context`, `onOpenResource`, `emptyComponent` et lit la route par `useRoute` (plus de `navigation`, `route`, `moduleConfig`, `selectors`) ; `options: explorerScreenHeader(wikiExplorerContext, 'wiki-home-title')` ; `withSession` (le droit de création lisait `getSession()`). Type de la route : selon la correction d'`explorer` (décision 2). `popupActions` supprimé (décision 4).
  - sommaire : `computeNavBar` → `options` (titre lu dans le store comme avant, `headerShadowVisible: false`) ; `navBarOptions` et ses `testID` partent.
  - lecture : `screenOptions` (`~/app/navigation/util`) → `options` (`animationTypeForReplace` selon `reverseAnimation`, titre lu dans le store) ; `navigation.replace('wiki/reader', …)` gardé.
  - titre pas encore chargé (arrivée par notification ou intent) : `title: ''` afficherait le nom de la route (CONVENTIONS « UI ») : dans ce cas `headerTitle: () => ''`, et le `setOptions` qui pose le titre après le chargement remet `headerTitle: undefined` (modèle `blog-post-details`). Régression du nouveau système, à vérifier dans l'app. Le reste (titre lu dans le store sans `getStore()`) attend l'assainissement (§5, 2).
- **Store** (exigé par le contrat d'`explorer` et par `redux: { reducer }`, comme `blog`) : la slice `explorer`, `actions.explorer` et `selectors.explorer` partent ; `moduleConfig.namespaceActionType` / `getState` remplacés par deux fonctions locales aux mêmes valeurs (`'WIKI_' + type`, `state.wiki`) : types d'actions inchangés ; reducers sans union d'actions si Redux 5 l'exige (CONVENTIONS « Données et état »), cast de `index.ts` retiré.
- **`auth`** (geste 14) : `~/framework/modules/auth/model` → `~/modules/auth/model` ; `getSession` du service → `~/modules/auth/store/accounts`.
- **Types cassés par `explorer` et `comments`** (décision 3) : `model/index.ts` écrit ses métadonnées et son historique, commentaires par `comments/types` ; corrige 12 erreurs `tsc` (`model/`, `screens/*/types.ts`, `screens/reader/screen.tsx`, `service/index.ts`).
- **Orphelins** (décision 4) : `screens/create/`, `image-input`, `image-input-button`, `resource-thumbnail-loader` supprimés.
- **Façades** : `navigation/index.ts` (`wikiRouteNames.summary`), pour `communities`.
- **Fichiers touchés hors du module** : `src/app/config/modules.ts` (1).
- **Ajouts découverts pendant la bascule** (2026-11-25, à relire) :
  - **Lecture** : `useNavigation<StackNavigation>()` (`~/app/navigation-new`) pour `replace` : le `useNavigation()` par défaut n'a pas les méthodes d'une pile.
  - **Options** des écrans typées par `defineScreen` (params inférés de l'écran), sans cast. `computeNavBar` et `screenOptions` partent avec leurs `testID` d'en-tête (`wiki-back-button`, `wiki-title`, abandonnés).
  - **`resource-thumbnail`** : `moduleConfig.name` remplacé par `'wiki'` (seul autre lecteur de `module-config.ts`).
  - **`wikiAudienceConfig`** déménage dans `screens/reader/screen.tsx` (non exporté), même valeur ; type `AudienceReferer` pris à la façade d'`audience`, comme avant.
  - **Store** : `getWikiState` lit `state.wiki` (`IGlobalState` est `any`) ; reducers sans union d'actions, chaque handler retrouve son action par `as`.
  - **Accueil** : écran `WikiHomeScreenComponent` (le nom `WikiHomeScreen` est celui du namespace des types) ; le template lit la route par `useRoute` ([explorer.md](explorer.md) décision 14), l'écran ne lui passe que `context`, `onOpenResource`, `emptyComponent`. Le bloc commenté du menu « nouveau cours » part avec `popupActions` (décision 4).
  - Rien n'est indexé dans git : les suppressions sont dans l'arbre de travail.
- Non touchés, marchent dans la nouvelle navigation : `PageListBottomSheet` (`@gorhom`, `BottomSheetModalProvider` monté), `ContentLoader`, `RichEditorViewer`, `ResourceWithCommentsTemplate`, façades `audience` et `media`.

## 5. Hors de la bascule

### Backlog

Assaini le 2026-11-25 (§9) : tout est traité, sauf 10 (requêtes `/userbook/api/person` une par auteur : [later.md](later.md)) et 17 (`useNavigation<StackNavigation>()` gardé, pas de type de pile commun). Ajouté pendant l'assainissement : `SelectButton` pose le même `testID` (`page-select-button`) sur le `TouchableOpacity` et sur le `DefaultButton` qu'il contient ; gardé (identifiants de test inchangés).


| # | Point | Sujet |
| --- | --- | --- |
| 1 | Liste des pages en bottom sheet `@gorhom` (`PageListBottomSheet`, `ref.present()`) → modale `formSheet` `wiki/pages` (params `resourceId`, `currentPageId`) ; « sous le bouton » (`additionalTopInset`) devient des détents. Décidé le 2026-11-17 | `ui` |
| 2 | Titre lu dans le store par les options (`getStore().getState()`, pas recalculé) et par `setOptions` après chargement. Jamais `headerTitle`. Ex-question 7 du 2026-11-17 : recommandation A, param facultatif `title` passé par l'appelant + `setParams({ title })` après chargement. Rejoint [explorer.md](explorer.md) §5, 10 | `ui` |
| 3 | **Bug** : écran vide d'un dossier, `buttonText` passé deux fois (le conditionnel est écrasé) : le bouton « créer » s'affiche sans droit de création. Correction décidée le 2026-11-17 | `dette` |
| 4 | Règles métier dans le service (droits depuis `rights`, pages masquées pour `creator` / `manager`, ordre en arbre) qui lit `getSession()` → règles pures dans `model/`, session en paramètre d'`actions.ts`, tests ; `getModuleTransport('wiki')` ; `adapter.ts` | `structure` |
| 5 | `rights.ts` (`hasWikiCreationRights`) → règle de `model/business.ts` | `structure` / `droits` |
| 6 | Erreurs `tsc` déjà présentes : `icon-chip` (nom d'icône en `string`), `page-header` (styles ×2), `page-list/index.ts` (exporte `PageListTitle`, absent), `resource-description` (ref, surcharge), `service/index.ts` l. 63 (pages) ; ESLint du module : 58 erreurs, 2 warnings | `erreurs` |
| 7 | Façades `~/framework/modules/audience` (`useAudience`, `AudienceReferer`) et `~/framework/modules/media` (`toURISource`) → nouveaux chemins | `api-publique` |
| 8 | `components/resource-thumbnail/` a `index.ts` **et** `index.tsx`, identiques | `dette` |
| 9 | `set.prototype.isdisjointfrom` (polyfill) pour les pages masquées : `some` suffit (`blog` l'a évité) | `dette` |
| 10 | Commentaires : une requête `/userbook/api/person` par auteur pour son type de compte (même chose dans `blog`, [later.md](later.md)) | `dette` |
| 11 | `WikiReaderContent` : `useSelector(…)!` sur le wiki, `page` supposé chargé | `dette` |
| 12 | `useCallback` en ligne dans le JSX (`onPressItem`), flèches en ligne (`GhostButton`), `{...props}` dans `renderContent` de la lecture | `performance` |
| 13 | `screens/home/styles.ts` vide (`StyleSheet.create({})`), styles à relever par le sujet | `styles` |
| 14 | Code commenté : menu « nouveau cours », bouton « nouvelle page » (« next version ») | `dette` |
| 16 | **Bug possible** : l'écran vide « racine » n'apparaît que si `route.params.folderId === RootFolderId.ROOT` ; ouvert depuis « Mes applis », l'accueil n'a pas de `folderId` (le template prend `ROOT` par défaut) : une racine vide montrerait l'écran « dossier vide ». Porté tel quel (`route.params?.folderId`), à vérifier dans l'app | `dette` |
| 17 | Lecture : `useNavigation<StackNavigation>()` pour `replace` ; à revoir si la navigation des modules expose un type de pile commun | `structure` |
| 15 | Accueil : route `wiki/explorer` mais dossier `screens/home/` ; écran qui consomme un template : un seul fichier `screens/explorer.tsx` (CONVENTIONS « Dossier d'un écran », règle des routes) | `structure` |

### Noté, non traité

- Contrat de route du template d'`explorer` (`NavParams` en `interface`, `route.name` exigé) : corrigé à part le 2026-11-25 (décision 2, [explorer.md](explorer.md) décision 14). L'accueil déclarera `StaticScreenProps<ResourceExplorerTemplate.NavParams | undefined>` et ne passera pas de `route`.
- Types de compte des auteurs des commentaires demandés un par un (`wiki`, `blog`) : candidat à un service partagé, [later.md](later.md).
- Listes `__overrides__/*/modules.ts` : ancien registre, chantier de la liste des modules par marque ([later.md](later.md)).

## 6. Décisions

Décisions du 2026-11-17 (ancienne fiche), relues pour la bascule :

- 2026-11-17 (règle) : Redux gardé. Toujours valable.
- 2026-11-17 (développeur) : emplacement sur place, `src/framework/modules/wiki/`. Toujours valable (CONVENTIONS « Portage »).
- 2026-11-17 (développeur) : `explorer` puis `audience` migrés d'abord. Fait (`explorer` basculé le 2026-11-23, `audience` le 2026-11-23).
- 2026-11-18 (développeur, [explorer.md](explorer.md)) : plus de slice `explorer` dans `wiki` ; le template lit le store d'`explorer` par app. Appliqué dans la bascule (§4, « Store »).
- 2026-11-17 (développeur) : `testID` de l'en-tête abandonnés (`wiki-back-button`, `page-back-button`, `wiki-title`) : bouton retour et titre du nouvel en-tête. Appliqué dans la bascule.
- 2026-11-17 (développeur) : jamais `headerTitle` pour le titre lu dans le store (règle de CONVENTIONS « UI »). Le moyen (ex-question 7) va à l'assainissement (§5, 2).
- 2026-11-17 (développeur) : corrections « au passage » (bottom sheet en `formSheet` avec détents, titres, bouton du dossier vide). Toujours décidées, mais faites en assainissement : la bascule ne les porte plus ([INTENT.md](../INTENT.md) §4, 2026-11-19). §5, 1 à 3.
- 2026-11-17 (développeur) : orphelins non portés (`wiki/create`, `image-input`, `image-input-button`, `resource-thumbnail-loader`, clé `fileManager`). Supprimés dans la bascule (décision 4 du 2026-11-25).
- 2026-11-17 (règle, revue le 2026-11-24) : notifications converties en `intents.notification` (geste 19), intent en `intents.resource`.

Décisions du 2026-11-25 (développeur, questions de la fiche de bascule) :

1. **Route d'accueil `wiki/explorer`**, comme `blog/explorer`. Option écartée : `wiki/home`. Le dossier `screens/home/` garde son nom pendant la bascule ; l'écart avec la règle des routes va au backlog (§5, 15).
2. **`explorer` corrigé d'abord**, dans un changement à part, avant la bascule : le template s'utilise avec les props normales d'un écran (`StaticScreenProps`). Forme revue le même jour : décision 5. Le contournement de `blog` est retiré avec. Option écartée : contourner comme `blog`. Forme : décision 5.
3. **Types cassés par `explorer` et `comments` corrigés dans la bascule**, types seuls : métadonnées et historique dans `model/index.ts`, commentaires typés par `comments/types`, `resourceId: string`. Exception à BASCULE (« erreurs déjà présentes »), déjà prévue par later.md et [explorer.md](explorer.md).
4. **Orphelins supprimés dans la bascule** (applique la décision du 2026-11-17) : `screens/create/` (route `wiki/create`), `popupActions` de l'accueil, `components/image-input/`, `components/image-input-button/`, `components/resource-thumbnail-loader/` ; pas de clé `fileManager`. Preuve : aucun import hors de ces dossiers (`grep` du 2026-11-25).

5. **Forme de la correction d'`explorer`** (2026-11-25, développeur, après deux essais) : le template lit la route de l'écran par `useRoute` ; plus de prop `route`. L'écran déclare `StaticScreenProps<ResourceExplorerTemplate.NavParams | undefined>`. `NavParams` en `type`. Options écartées : prop `routeName` typée ; `route` en prop avec `name: string`. Détail : [explorer.md](explorer.md) décision 14.

Décisions du 2026-11-25 (développeur, plan d'ensemble de l'assainissement) :

6. **Assainir par-dessus la bascule non commitée** : la bascule et l'assainissement sont dans le même arbre de travail. Option écartée : commiter la bascule d'abord (recommandée).
7. **`structure` (service) et `structure` (modèle + actions) en une seule PR** : les règles métier sont dans le service, qui lit la session ; les sortir en même temps que l'adapter évite un adapter qui reçoit la session.
8. **Scope `userbook` ajouté** (`scope: ['wiki', 'userbook']`, comme `blog` et `myapps`) : `/userbook/api/person` passe par `getModuleTransport('wiki')`. Sans effet visible (scope déjà demandé par ces modules).
9. **Titre du sommaire et de la lecture par `useLayoutEffect`** : `setOptions({ headerTitle: undefined, title })` depuis un sélecteur ; les options n'ont que le titre masqué par défaut ; plus de `getStore()` dans les options ni de `setOptions` dans le chargement. Réactif au rafraîchissement. Devenue règle de CONVENTIONS « UI ». Options écartées : `getStore()` dans les options ; param `title` + `setParams`.
10. **Paquet `set.prototype.isdisjointfrom` retiré** (seul `wiki` l'importait), remplacé par `some`.
11. **Bug de la racine vide corrigé** (§5, 16) : `folderId` absent = racine, comme le template ; une racine vide montre l'écran racine, un sous-dossier vide « dossier vide ». Vérifié avant : le template prend `ROOT` par défaut sans l'écrire dans la route, l'entrée « Mes applis » ouvre sans params ; `blog` n'est pas concerné (son écran vide ne dépend pas du dossier).
12. **Squelette inutile de `ResourceHeader` retiré** : l'état `isLoading` mis à vrai puis aussitôt à faux rendait un squelette à chaque ouverture.
13. **Liste des pages en `formSheet` avec `sheetAllowedDetents: 'fitToContents'`**, comme les autres sheets de l'app. Option écartée : `[0.5, 1]` (recommandée pour une longue liste) ; à vérifier dans l'app avec un wiki de nombreuses pages.
14. **Composants propres à `wiki` préfixés par `Wiki`** (2026-11-26, développeur, à la relecture) : `WikiPageHeader` (et `WikiPageHeaderPlaceholder`), `WikiPageList`, `WikiResourceDescription`, `WikiResourceDescriptionLoader`, `WikiResourceHeader`, `WikiResourceHeaderLoader`, `WikiResourceThumbnail`, `WikiSelectButton`, avec leurs types de props. Les **dossiers ne sont pas préfixés** (`components/page-header/`…) : ils sont déjà dans le dossier du module (précisé par le développeur le même jour, après un premier renommage des dossiers retiré). Devenue règle de CONVENTIONS « Nommage et rédaction ». Exception : `IconChip`, composant d'interface dont l'apparence n'a rien de propre à `wiki`, placé là parce que seul `wiki` l'utilise. Gardés : les sous-composants internes à un fichier (`ExpandButton`, `VisibilityIndicator`…) et l'enum `HeaderStatus`.

Choix annoncés, sans effet visible : valeurs des types d'actions gardées (`WIKI_LOAD_WIKI`, `WIKI_LOAD_PAGE`) ; `createdAt` des métadonnées de page retiré (jamais rempli ni lu) ; `useNavigation<StackNavigation>()` gardé dans la lecture ; types de compte des auteurs laissés dans le service de `wiki` (mise en commun : [later.md](later.md)). Bug du bouton « créer » d'un dossier vide corrigé (décidé le 2026-11-17).

### Questions ouvertes

Aucune.

## 7. Vérification

Base mesurée le 2026-11-25 sur `bbf8088cd` (arbre propre, override `neo/test` du développeur). Sorties dans le scratchpad de la session.

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` (comparé fichier par fichier) | 771 (31 dans `wiki`) | 747 (7 dans `wiki`, toutes déjà présentes : §5, 6) ; **aucune erreur nouvelle** |
| ESLint sur le dossier | 58 erreurs, 2 warnings | 20 erreurs, 2 warnings (fichiers non touchés ; les 2 warnings sont les regex reprises de `notif-handler.ts`) |
| `yarn lint-all` | 1 980 erreurs, 84 warnings | 1 942 erreurs, 84 warnings |
| `yarn test` | 489 / 489 (suite `media/source.test.ts` en échec au chargement) | 489 / 489 (idem) ; aucun test ne couvre `wiki` |
| `yarn migration-status --check` | — | vert |
| Compteurs de [SUIVI.md](SUIVI.md) | `à faire`, 4 écrans anciens, 9 fichiers en navigation ancienne | `basculé, sans test`, 0 écran ancien, 3 écrans nouveaux, navigation ancienne 0, aucun module ancien importé |
| `testID`, clés i18n, stockage | — | `testID` inchangés sauf ceux de l'en-tête (abandonnés, §6) ; clés i18n inchangées hors des composants orphelins supprimés (`pickfile-*`, `wiki-image-delete`) ; pas de stockage |
| Flows Maestro ou recette manuelle | aucun flow | recette §3 à jouer |
| Parcours joué dans l'app (iOS, Android) | — | **pas testé dans l'app** |

Ce qui ne peut pas encore être joué dans l'app : l'ouverture des notifications (intents pas encore lus) ; la tuile « cours » de `communities` (ancien).

## 8. Mesure

Session du 2026-11-25 : relevé et fiche, puis correction d'`explorer` (commit `bbf8088cd`), puis bascule. Questions posées : 4, puis 1 (forme de la correction d'`explorer`) ; le développeur a revu deux fois la forme retenue (prop `routeName`, puis `route.name` d'une `route` en prop, enfin `useRoute`). Temps : non mesuré. À apprendre : la forme d'un template (route par `useRoute`) a été revue deux fois avant d'être réglée dans CONVENTIONS ; `useNavigation()` n'a pas `replace` / `push` sans type de pile.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR. Sujets tirés de §5.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
| `connect`, `try-action`, `classes`, `temporal` | sans objet | aucun `connect(`, `tryAction`, classe ni `moment` | — | — |
| `droits` | sans objet | `rights.ts` décide du bouton de l'écran vide, pas de la disponibilité : devenu `hasWikiCreationRights` de `model/business.ts` (`structure`) | — | non commité |
| `structure` (service + modèle + actions) | fait | 7, 8. `service/adapter.ts` (traduction seule), `getModuleTransport('wiki').accountFetch(session, …)`, scope `userbook` ; règles pures `model/pages.ts` (`orderWikiPages`, `arrangeWikiPages`, `getAdjacentPageIds`) et `model/business.ts` (`hasWikiCreationRights`, `canSeeHiddenPages`, `canCommentWiki`), polyfill remplacé par `some` ; `actions.ts` (chargement, commentaires, session en paramètre) ; `store/` (types d'actions gardés) ; `withSession` sur le sommaire et la lecture ; accueil en `screens/explorer.tsx` ; params des écrans dans leur fichier. Absorbé : `screens/home/styles.ts` vide supprimé, `createdAt` des pages retiré (TS2322). Cast gardé et expliqué pour les commentaires supprimés (type de `comments`, [later.md](later.md)). Tests : `model/pages.test.ts`, `model/business.test.ts`, `service/adapter.test.ts` (corps envoyés identiques), `actions.test.ts` (24 tests) | ouvrir un wiki avec sous-pages et pages masquées (créateur, puis lecteur) : même ordre, mêmes pages ; commenter, répondre, modifier, supprimer | non commité |
| `performance` | fait | `useCallback` sortis du JSX (sommaire, liste, en-tête de page), boutons précédente / suivante, élément de liste en `React.memo`, `keyExtractor` hors du composant, en-tête et écran vide du sommaire mémoïsés | défilement de la liste des pages, précédente / suivante | non commité |
| `styles` | fait | marges de `ResourceHeader` en deux styles statiques, tableau statique de `PageHeaderPlaceholder` hors du composant. Restent (pas d'équivalent exact) : ombres en dur (`elevation: 4`, `shadowOpacity: 0.15`) de `resource-description` et de son squelette | en-tête du sommaire avec et sans description | non commité |
| `dette` | fait | 10, 11, 12 ; bug du bouton « créer » (décidé le 2026-11-17 : seulement avec le droit, clé i18n traduite) ; `PageView` → `View` (`flex: 1`, fond `card`) ; `index.tsx` en double supprimé ; `!` retirés (la lecture reçoit le wiki et la page vérifiés, sinon `EmptyContentScreen`) ; code commenté et style `newPageButton` supprimés ; prop `canAddDescription` et type `testId` inutilisés retirés ; paquet `set.prototype.isdisjointfrom` retiré (`package.json`, `yarn.lock`, `--mode=update-lockfile`) | racine vide (avec et sans droit `createWiki`) : écran racine ; sous-dossier vide : « dossier vide », bouton « créer » seulement avec le droit ; sommaire sans squelette à l'ouverture | non commité |
| `erreurs` | fait | `tsc` du module 7 → 1, ESLint 20 → 0 : icône typée `SvgIconName`, styles animés sans annotation `ViewProps['style']`, export `PageListTitle` absent retiré, `containerRef` mort retiré, variables de style mortes, imports, regex. Reste `resource-description` l. 26 (`ref` de `ExpandButton`) : typage de `useLayout` du framework ([later.md](later.md)) | — | non commité |
| `api-publique` | fait | imports par les façades d'`audience` (`useAudience`, `AudienceReferer`) et de `media` (`toURISource`) remplacés par `~/modules/audience/hooks`, `~/modules/audience/model`, `~/modules/media/util`. Façade `wikiRouteNames` gardée pour `communities` | — | non commité |
| `ui` | fait | 9, 13. Liste des pages en modale `wiki/pages` (`formSheet`, `fitToContents`, grabber), qui rend la page choisie (`navigateAsync` / `useScreenPromise`) ; la lecture la montre à sa place (`replace`). `page-list-bottom-sheet` supprimé. Titres du sommaire et de la lecture par `useLayoutEffect` depuis le store, options sans `getStore()` | « choisir une page » : sheet à la hauteur de la liste (à vérifier avec beaucoup de pages), page courante surlignée, choisir une page la remplace (la sheet se ferme d'abord) ; fermer sans choisir ne change rien ; titres au chargement et après un rafraîchissement | non commité |
