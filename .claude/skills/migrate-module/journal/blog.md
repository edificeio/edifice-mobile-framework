# Bascule : `blog`

> Statut : à faire — mis à jour le 2026-11-24
>
> Fiche du module : sa bascule (étape 1), puis son assainissement (étape 2, §9). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](../INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](../BASCULE.md). Une page : ce qui est propre à ce module.

## 1. Ce que fait le module

Les blogs de l'ENT. L'utilisateur ouvre « Blog » depuis « Mes applis » : l'explorateur des blogs (dossiers et blogs), puis la liste des billets d'un blog, puis un billet avec ses commentaires. Selon ses droits, il crée un billet, le modifie, le supprime, le publie (billet soumis), commente.

Autres entrées, toutes portées par des mécanismes absents du nouveau système : le bouton « créer » de `timeline` (workflow, ouvre le choix du blog puis la création), les notifications `BLOG` (billet, commentaire, partage), l'intent `OPEN_RESOURCE` (lien vers un blog dans un contenu riche, ouvert par `useOpenMedia`).

## 2. Taille et dépendances

Repris de [SUIVI.md](SUIVI.md) au 2026-11-23.

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| 45 | 3535 | 4 | 2 (`fullScreenModal`) | 3 | oui |

- **Modules anciens importés** :
  - `workspace` (`actions/index.ts`, `workspaceFileTransferActions.uploadFilesAction`) : **code seul**, permis (geste 16). L'action qui l'appelle (`uploadBlogPostImagesAction`) n'est appelée nulle part (§5).
  - `timeline` : **navigation et state** (condition d'arrêt, question 3) :
    - `rights.ts` : `registerTimelineWorkflow` (bouton « créer » de l'accueil de `timeline`), appelé par l'ancien `index.ts` ;
    - `screens/create-post/screen.tsx` : `startLoadNotificationsAction` (thunk de `timeline` qui lit son state ; il attrape toutes ses erreurs) après l'envoi, puis `navigate(referrer ?? timelineRouteNames.Home, …, { pop: true })` ; sans `referrer`, la route `timeline` n'existe pas dans la nouvelle navigation. Le `referrer` manque seulement quand on arrive par le choix du blog (`blog/select`), lui-même ouvert seulement par le workflow de `timeline` ;
    - `screens/edit/screen.tsx` : `startLoadNotificationsAction` dans `mapDispatchToProps`, jamais appelé (§5) ;
    - `notif-handler.ts` : `timelineModuleConfig`, `computeTabRouteName` (débranché, geste 19).
  - `explorer` (basculé) : le template et son store ont changé de contrat ([explorer.md](explorer.md), décisions 5 à 12). `blog` est **son premier consommateur basculé**.
  - `audience` (basculé) : par ses façades `@deprecated` (`~/framework/modules/audience`, `/service`, `/components`) : elles marchent, gardées (§5).
- **Importeurs** :
  - `src/modules/audience/actions.ts` : `blogUriCaptureFunction` de `service/adapters.ts` : chemin et export inchangés, rien à faire.
  - `src/app/override/modules.ts` (fichier overridé, ancien registre par marque) : `require` du module. Non touché (geste 17 : la ligne va dans `src/app/config/modules.ts`).
  - Personne n'importe `module-config.ts` ni `navigation/` hors du module : pas de façade pour les autres modules.
- **Navigation entrante** : « Mes applis » (`matchEntcoreApp: 'Blog'`) ; workflow de `timeline` (non chargé) ; notifications (débranchées) ; intent `Blog` (question 2) ; `src/app/intents.ts` (`OldEntAppName` contient `'blog'` : table de noms seulement).

## 3. Comportements à conserver

Profil : un enseignant avec au moins un blog où il peut publier, et un élève (droits réduits). Les flows Maestro demandent un blog et des billets sur la plateforme de test : recommandés, pas bloquants. Seul `testID` du module : `header-post-create`.

| # | Comportement | Flow ou recette | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | Accueil (« Mes applis » → Blog) : explorateur des blogs, titre « Blog » puis titre du dossier ; liste vide : texte et bouton web (`/blog#/edit/new`) selon le droit de créer un blog | `blog-01-explorateur.yaml` (ouvrir Blog, ouvrir un dossier, revenir) | | |
| 2 | Liste des billets d'un blog : titre = titre du blog ; pages de 20 (`PUBLISHED` + `SUBMITTED`), réactions et vues par billet ; bouton « + » (`header-post-create`) seulement avec le droit de créer un billet ; liste vide : textes selon le droit | `blog-02-liste.yaml` (ouvrir un blog, vérifier `header-post-create`) | | |
| 3 | Billet : contenu, barre d'audience, commentaires par 20 au défilement ; tirer pour rafraîchir ; rafraîchi au retour sur l'écran ; vue marquée (audience) | recette : ouvrir un billet, revenir de la modification | | |
| 4 | Commentaires : publier, modifier, supprimer (alerte) selon les droits ; quitter avec un commentaire non enregistré demande confirmation | recette : écrire un commentaire, revenir en arrière | | |
| 5 | Menu « … » du billet (auteur ou gestionnaire) : « Modifier » ouvre la modale ; « Supprimer » (alerte) revient à la liste rechargée | recette | | |
| 6 | Billet soumis : bouton « Publier » avec le droit de publier (toast, billet rechargé), sinon « en attente de validation » | recette (deux profils) | | |
| 7 | Créer un billet (modale plein écran, depuis la liste) : envoi désactivé si titre ou contenu vide ; indicateur pendant l'envoi ; toast selon le droit (créé / publié / soumis) ; retour à la liste rechargée ; quitter avec du contenu demande confirmation | `blog-03-creer-billet.yaml` (crée un billet sur la plateforme de test) | | |
| 8 | Modifier un billet : titre et contenu préremplis, enregistrer, retour au billet, toast | recette | | |

Pas jouable sur la branche (mécanismes absents, §6) : choix du blog (`blog/select`, ouvert par `timeline`), notifications, intent.

## 4. Dans la bascule

- **`index.ts`** (gestes 1, 2, 3, 17) : `export default new EntModule({ name: 'blog', scope: ['blog'], matchEntcoreApp: 'Blog', entTrackingName: 'Blog', redux: { reducer }, screens, modals, entries: { myApps: { route: 'blog/<accueil>' } } })`. `module-config.ts` supprimé (`storageName` inutilisé : aucun storage). `hasRight` par défaut. Ligne dans `src/app/config/modules.ts`.
- **Navigation** (gestes 4, 5) : `navigation/` supprimé en entier (décision 4) ; routes en clair là où le module les lit (`list`, `rights.ts`, `notif-handler.ts`). Routes :

  | Ancienne | Nouvelle | Écran | Type |
  | --- | --- | --- | --- |
  | `blog` (`blogExplorer`, accueil) | `blog/explorer` (décision 1) | `screens/explorer.tsx` | écran |
  | `blog/select` (`home`) | `blog/select` | `screens/BlogSelectScreen.tsx` (pas de dossier : nom gardé) | écran |
  | `blog/posts` | `blog/list` | `screens/list/` | écran |
  | `blog/details` | `blog/blog-post-details` | `screens/blog-post-details/` | écran |
  | `blog/create` | `blog/create-post` | `screens/create-post/` | modale (`fullScreenModal`) |
  | `blog/edit` | `blog/edit` | `screens/edit/` | modale (`fullScreenModal`) |

  Télémétrie (`trackView` découpe sur `/`) : `posts` → `list`, `details` → `blog-post-details`, `create` → `create-post`, accueil `blog` → `blog/explorer`. `setModalModeForRoutes` (`hideTabBarAndroid`) disparaît avec le navigateur.
- **En-têtes** (gestes 6, 8, 9) :
  - accueil : `options: explorerScreenHeader(blogExplorerContext, 'blog-appname')` ;
  - `select` : `title: blog-select-title` ;
  - `list` : `title: blog-appname` ; le `setOptions` garde le titre du blog (`title`) et le bouton « + » qui dépend des droits, dans un `useLayoutEffect`, en `headerRightActions(headerAction({ icon: 'ui-plus', testID: 'header-post-create', … }))` ;
  - `blog-post-details` : titre vide au départ (l'ancien `title: ''`, à vérifier dans l'app : CONVENTIONS « UI », `headerTitle: () => ''` si la route s'affiche), puis `setOptions` avec le titre du billet et le menu « … » en `headerMenu` + `menuAction` (« Supprimer » `destructive`), au lieu de `PopupMenu` / `NavBarAction` ;
  - `create-post`, `edit` : titre i18n (`titleStyle` disparaît) ; bouton envoyer / enregistrer (`disabled` selon titre et contenu) dans un `useLayoutEffect` ; l'indicateur de chargement en `headerCustom`.
- **Écran en classe** (geste 7) : `BlogPostDetailsScreen` reste une classe ; un petit écran fonction lit `useNavigation()` et la lui passe.
- **Session** (gestes 14, 18) : `withSession` (`~/modules/auth/hoc`) sur les six écrans ; `getSession()` des `mapStateToProps` (`blog-post-details`, `create-post`, `edit`) → second argument `(state, { session })` ; `sessionScreen` de `list` et `withSession` de l'ancien chemin (`explorer.tsx`) remplacés ; `useSelector(selectors.session)` de `select` → prop `session`. Types : `AuthLoggedAccount` (ancien sens = compte actif) et `ISession` (n'existe plus : 2 TS2305) → `AuthActiveAccount` de `~/modules/auth/model`. `assertSession` des thunks (`actions/index.ts`) → `~/modules/auth/store/accounts`. `refreshSessionIdForAccountAction` (`~/framework/modules/auth/thunks`, façade `@deprecated`) gardé (§5).
- **Confirmation de sortie** (geste 10) : `usePreventBack` du billet → `useConfirmRemove`. `RichEditorForm` (`preventBackI18n`, composant du framework) non touché.
- **`explorer`** (nouveau contrat, [explorer.md](explorer.md)) : `screens/explorer.tsx` donne au template `route`, `context`, `onOpenResource`, `emptyComponent` (plus de `navigation`, `moduleConfig`, `selectors`) ; `reducer.ts` perd sa slice `explorer` (`createExplorerActions` / `Reducer` / `Selectors` n'existent plus : 3 erreurs `tsc` qui partent), et `actions.explorer` / `selectors.explorer`.
- **Reducer** : `moduleConfig.namespaceActionType` et `moduleConfig.getState` (seuls usages internes de `module-config.ts`) remplacés par deux fonctions locales qui donnent les mêmes valeurs (`'BLOG_' + type`, `state.blog`, la clé du reducer étant le nom du module) : types d'actions inchangés. Proposé, à relire.
- **Débranchés** : `notif-handler.ts` (geste 19, `ToDo(blog-migration)` en tête, routes en clair : décision 4) ; intent (décision 2) et workflow de `timeline` (décision 3), avec `ToDo(blog-migration)`. `create-post` garde ses deux usages de `timeline`, avec `ToDo(blog-migration)` (décision 3).
- **Façades** : aucune.
- **`later.md`** : `blog` ajouté à la ligne « Intents ».
- **Fichiers touchés hors du module** : `src/app/config/modules.ts` (1).

## 5. Hors de la bascule

### Backlog

| # | Point | Sujet |
| --- | --- | --- |
| 1 | `connect(` dans `blog-post-details`, `create-post`, `edit` ; `mapDispatchToProps` avec des `// TS BUG` et des `as unknown as` | `connect` |
| 2 | `BlogPostDetailsScreen` en classe (780 lignes) : refs de `CommentField` par id, abonnements clavier recréés à chaque changement du billet, `setTimeout` pour défiler | `connect` / `ui` |
| 3 | Thunks qui lisent la session (`assertSession`) au lieu de la recevoir ; modèle dans `reducer.ts` ; droits et workflow dans `rights.ts` ; service sur `sessionFetch` (→ `getModuleTransport('blog')`) ; `BlogSelectScreen.tsx` hors d'un dossier | `structure` |
| 4 | Code mort à vérifier par `grep` : slices `blogs`, `folders`, `tree` et `computeAll*Hierarchy`, `filterTrashed` ; actions `fetchBlogsAndFoldersAction`, `fetchBlogsAction`, `fetchBlogFoldersAction`, `fetchBlogPostsAction`, `getBlogsAction`, `uploadBlogPostImagesAction` (seul import de `workspace`) ; `components/placeholder/explorer` (orphelin, compile) ; `handleInitTimeline` d'`edit` ; `richContentReady` du state du billet | `dette` |
| 5 | Erreurs `tsc` déjà présentes : `BlogPost.comments` commenté mais lu (`countComments`, TS2339) ; `DisplayedBlog` importé d'un `BlogExplorerScreen` qui n'existe plus (TS2307) ; refs `FlatList` typées en valeur (TS2749 ×5) ; `BlogSelectScreen` (TS2345) ; `list` (TS2322, TS2345) | `erreurs` |
| 6 | `moment` (`list`, `service/adapters.ts`, types du modèle) → `Temporal` | `temporal` |
| 7 | `KeyboardPageView` (`@deprecated`) dans le billet ; `refreshSessionIdForAccountAction` (façade) → `refreshOneSessionId` de `~/modules/auth/flows` | `dette` |
| 8 | Façades d'`audience` (`~/framework/modules/audience`, `/service`, `/components`) → `~/modules/audience` ; la règle de `blog` dans `computeAudienceRefererFromResourceUri` ([audience.md](audience.md) §5, 5) : `blog` devrait donner le `referer` | `structure`, avec `audience` |
| 9 | Audience du billet : vues et réactions chargées l'une après l'autre (`doGetAudienceInfos`), deux fois à l'ouverture depuis une notification | `performance` |
| 10 | `doRefresh` et `doRefreshSilent` identiques ; `// ToDo: Error handling` (quatre `catch` muets) | `dette` |
| 11 | Styles en ligne et valeurs en dur (`RefreshControl`, en-têtes) ; `styles.ts` vs `style.ts` (`components/blog-post-details`) | `styles` |
| 12 | `useCallback` / `useMemo` manquants (`create-post`, `edit` : `doSend` / `doEdit` recréés, effet sans dépendances complètes) | `performance` |
| 13 | Choix du blog (`blog/select`) : candidat à la modale « as promise » ([later.md](later.md)) | `ui` (à valider) |
| 14 | `rights.ts` → règles pures testées (`model/business.ts`) ; droits par `hasRight` (change ce que l'utilisateur voit) | `structure` (à valider) |

**Bugs vus à la lecture** (non corrigés) :

| # | Bug | Sujet |
| --- | --- | --- |
| 15 | `edit` : `doEditPost` attrape ses erreurs, donc le `catch` de `doEdit` ne s'exécute jamais : après un échec, l'indicateur de chargement reste et le bouton ne revient pas | `dette` |
| 16 | `create-post` : stockage plein → deux toasts d'erreur (le message dédié, puis le message générique) | `dette` |
| 17 | Billet ouvert depuis une notification, puis supprimé : `navigate(list, { blogId })` avec `route.params.blog?.id` indéfini ; la liste lève alors une erreur (`selectors.blog` lève si le blog manque) | `dette` |
| 18 | Messages d'erreur : `${{ blogId, postId }}` affiche `[object Object]` ; `doDeleteBlogPost` parle de `commentId` | `dette` |
| 19 | `list` : `onFlushPosts` n'attend pas `onPageReached` (erreur non remontée) | `dette` |

### Noté, non traité

- Workflow de `timeline` (bouton « créer ») : à reprendre avec la bascule de `timeline`, probablement par `entries.create` ([framework.md](../framework.md), « Points d'entrée »), qui attend son premier consommateur.
- Intents : reportés ([later.md](later.md)) ; `blog`, `scrapbook` et `wiki` enregistrent les leurs, `useOpenMedia` les appelle avec l'ancien `navigationRef`, plus branché.

## 6. Décisions

1. **Route d'accueil `blog/explorer`** (2026-11-24, développeur) : nom du fichier de l'écran, comme les autres routes. Option écartée : `blog/home`.
2. **Intent `OPEN_RESOURCE` de `Blog` débranché** (2026-11-24, développeur) : enregistré, il passerait par l'ancien `navigationRef`, plus branché, et ne ferait rien ; non enregistré, `openIntent` ouvre le lien sur le web. L'appel `registerIntent` disparaît avec l'ancien `index.ts` ; le code de l'intent est gardé, avec un `ToDo(blog-migration)`, et une ligne dans [later.md](later.md) (« Intents »). Option écartée : concevoir d'abord les intents dans la nouvelle navigation. **Revu le 2026-11-24 (à confirmer)** : les intents sont remplacés par `entries.resource` ([framework.md](../framework.md)) ; la bascule la déclare (liste des billets, `blogId: media.resourceId`, `ToDo(blog-migration)` de l'ancien `index.ts`) au lieu de débrancher, et la ligne « Intents » de `later.md` est retirée.
3. **`timeline` : débrancher et porter tel quel** (2026-11-24, développeur) : le workflow (bouton « créer » de `timeline`) n'est plus enregistré (l'appel disparaît avec l'ancien `index.ts`) ; `registerTimelineWorkflow` reste dans `rights.ts`, avec un `ToDo(blog-migration)` et les routes nouvelles. `create-post` garde `startLoadNotificationsAction` et le repli sur `timeline`, avec un `ToDo(blog-migration)` : chemin non atteignable sur la branche. Option écartée : les retirer de `create-post`.
4. **`navigation/` supprimé en entier** (2026-11-24, développeur) : plus de `blogRouteNames`. Les routes s'écrivent en clair (`list` pour le `referrer` de `create-post`, workflow de `rights.ts`), et **`notif-handler.ts` est modifié** pour les lire : exception au geste 19 (« le fichier reste tel quel »), limitée aux noms de routes. Option écartée : garder `navigation/index.ts` réduit à `blogRouteNames` en façade `@deprecated`.

### Questions ouvertes

Aucune.

## 7. Vérification

Base mesurée le 2026-11-24, avant la bascule.

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module (comparé fichier par fichier) | 37 erreurs dans `blog` (780 dans le dépôt) | |
| ESLint sur le dossier | 50 erreurs | |
| `yarn lint-all` | 2134 problèmes | |
| Jest | 453 / 453 (45 suites) | |
| Compteurs de [SUIVI.md](SUIVI.md) | `à faire`, 6 écrans anciens, navigation ancienne 11, `connect(` 3, importe `workspace` | |
| Flows Maestro ou recette manuelle | aucun flow | |
| Parcours joué dans l'app (iOS, Android) | — | |

Ce qui ne peut pas encore être joué dans l'app, et le module qu'il attend : choix du blog et bouton « créer » (`timeline`), ouverture des notifications (clé `notifications`), intent (chantier des intents).

## 8. Mesure

À remplir en fin de bascule.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR. Sujets tirés de §5.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
