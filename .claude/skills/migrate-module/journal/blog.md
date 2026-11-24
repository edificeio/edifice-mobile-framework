# Bascule : `blog`

> Statut : à faire — mis à jour le 2026-11-24
>
> Fiche du module : sa bascule (étape 1), puis son assainissement (étape 2, §9). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](../INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](../BASCULE.md). Une page : ce qui est propre à ce module.

## 1. Ce que fait le module

Les blogs de l'ENT. L'utilisateur ouvre « Blog » depuis « Mes applis » : l'explorateur des blogs (dossiers et blogs), puis la liste des billets d'un blog, puis un billet avec ses commentaires. Selon ses droits, il crée un billet, le modifie, le supprime, le publie (billet soumis), commente.

Autres entrées :

- le bouton « créer » de `timeline` (workflow, ouvre le choix du blog puis la création) : mécanisme absent du nouveau système ;
- les notifications `BLOG` (billet, commentaire, partage) : `intents.notification`, déclaré mais pas encore lu ;
- l'intent `OPEN_RESOURCE` (ressource blog ouverte par `useOpenMedia`) : `intents.resource`.

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
    - `notif-handler.ts` : `timelineModuleConfig`, `computeTabRouteName` (le billet s'ouvre dans l'onglet de `timeline`). Le fichier est supprimé, ses gestionnaires deviennent des `intents.notification` (décision 5) : cet import part.
  - `explorer` (basculé) : le template et son store ont changé de contrat ([explorer.md](explorer.md), décisions 5 à 12). `blog` est **son premier consommateur basculé**.
  - `audience` (basculé) : par ses façades `@deprecated` (`~/framework/modules/audience`, `/service`, `/components`) : elles marchent, gardées (§5).
- **Importeurs** :
  - `src/modules/audience/actions.ts` : `blogUriCaptureFunction` de `service/adapters.ts` : chemin et export inchangés, rien à faire.
  - `src/app/override/modules.ts` (fichier overridé, ancien registre par marque) : `require` du module. Non touché (geste 17 : la ligne va dans `src/app/config/modules.ts`).
  - Personne n'importe `module-config.ts` ni `navigation/` hors du module : pas de façade pour les autres modules.
- **Navigation entrante** :
  - « Mes applis » (`matchEntcoreApp: 'Blog'`) ;
  - workflow de `timeline` (non chargé) ;
  - notifications (`intents.notification`, pas encore lues) ;
  - ressources `blog` ouvertes par `useOpenMedia` (`intents.resource`). Aujourd'hui, seul `communities` le fait (documents), et il n'est pas chargé. L'explorateur de `blog` ouvre la liste lui-même (`onOpenResource`) ;
  - `src/app/ent-app-names.ts` : `OldEntAppName` contient `'blog'`, c'est seulement une table de noms.

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
| 9 | Ressource `blog` ouverte ailleurs (`useOpenMedia`) : la liste des billets du blog s'ouvre par-dessus l'écran courant | recette, quand un module chargé ouvrira des ressources `blog` (`communities`) | | |
| 10 | Notification `BLOG` : PUBLISH-POST, SUBMIT-POST et PUBLISH-COMMENT ouvrent le billet ; SHARE ouvre la liste des billets du blog | recette, quand `intents.notification` sera lu | | |

Ce qui n'est pas jouable sur la branche :

- le choix du blog (`blog/select`, ouvert par `timeline`) ;
- les notifications (10), car `intents.notification` n'est pas encore lu ;
- la ressource (9), car aucun module chargé n'ouvre de ressource `blog`.

## 4. Dans la bascule

- **`index.ts`** (gestes 1, 2, 3, 17) : `export default new EntModule({ name: 'blog', scope: ['blog'], matchEntcoreApp: 'Blog', entTrackingName: 'Blog', redux: { reducer }, screens, modals, entries: { myApps: { route: 'blog/explorer' } }, intents })`. `module-config.ts` supprimé (`storageName` inutilisé : aucun storage). `hasRight` par défaut. Ligne dans `src/app/config/modules.ts`.
- **Intents** (`intents`, écrits en ligne dans la config, comme l'exemple d'ARCHITECTURE §2.3 ; premier module à en déclarer) :
  - `resource` (décision 2) : `[{ resourceType: 'blog', callback: (resource, navigation) => (navigation.push('blog/list', { blogId: resource.resourceId }), true) }]`. `push` vient de l'ancien `StackActions.push` ; le `ToDo(blog-migration)` de l'ancien `index.ts` part avec lui.
  - `notification` (décision 5) : les deux gestionnaires de `notif-handler.ts`, convertis un pour un ; le fichier est supprimé.
    - `notificationIntent({ type: 'BLOG', eventType: ['PUBLISH-POST', 'SUBMIT-POST', 'PUBLISH-COMMENT'], callback })` : `getAsResourceUriNotification`, sinon `false` ; puis `navigation.navigate('blog/blog-post-details', { notification, useNotification: true })` et `true`.
    - `notificationIntent({ type: 'BLOG', eventType: 'SHARE', callback })` : `blogUriCaptureFunction(…).blogId`, sinon `false` ; puis `navigation.navigate('blog/list', { blogId })` et `true`.
    - Conversion : `{ managed: 0 }` devient `false`, `{ managed: 1 }` devient `true` ; le `try` / `catch` (`false`) est gardé. `navigate` reste `navigate`, comme l'ancien `CommonActions.navigate`.
    - Ce qui part :
      - `trackInfo` : suivi ancien, non porté ;
      - l'ouverture dans l'onglet de `timeline` (`computeTabRouteName`, `initial: false`) : l'écran s'ouvre par-dessus les onglets, comme les autres routes de module ;
      - `handleNotificationNavigationAction`, qui ne faisait que `dispatch(navAction)`.
    - Rien ne lit ces intents : sur la branche, les notifications `BLOG` s'ouvrent toujours sur le web.
- **Navigation** (gestes 4, 5) : `navigation/` supprimé en entier (décision 4). Les routes sont écrites en clair là où le module les lit : `list`, `rights.ts`, `intents`. Routes :

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
- **Débranché** : le workflow de `timeline` (décision 3), avec `ToDo(blog-migration)`. `create-post` garde ses deux usages de `timeline`, avec `ToDo(blog-migration)` (décision 3).
- **Façades** : aucune.
- **Fichiers touchés hors du module** (2) :
  - `src/app/config/modules.ts` ;
  - `cli/migration-status.js` : la colonne « Notif. » compte aussi les modules qui déclarent `notificationIntent(`. Sans cela, `blog` y passerait à « — » alors que ses notifications ne sont pas encore lues.

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
- `intents.notification` : à jouer quand le module `notifications` les lira. À vérifier à ce moment :
  - l'ouverture par-dessus les onglets, à la place de l'onglet de `timeline` ;
  - `navigate` sur un billet déjà dans la pile : il revient à cet écran et ne l'empile pas ;
  - le billet chargé deux fois à l'ouverture (backlog 9).
- `intents.resource` : à jouer avec le premier module chargé qui ouvre des ressources `blog` (`communities`).

## 6. Décisions

1. **Route d'accueil `blog/explorer`** (2026-11-24, développeur) : nom du fichier de l'écran, comme les autres routes. Option écartée : `blog/home`.
2. **Intent `OPEN_RESOURCE` de `Blog` déclaré dans `intents.resource`** (2026-11-24, développeur, confirmé après la refonte des intents) :
   - `resourceType: 'blog'`, puis `push('blog/list', { blogId: resource.resourceId })`, et l'intent renvoie `true` ;
   - pas jouable sur la branche : aucun module chargé n'ouvre de ressource `blog`.

   Option écartée : le débrancher. C'était la première décision du même jour, quand les anciens intents passaient par l'ancien `navigationRef`, qui n'est plus branché.
3. **`timeline` : débrancher et porter tel quel** (2026-11-24, développeur) : le workflow (bouton « créer » de `timeline`) n'est plus enregistré (l'appel disparaît avec l'ancien `index.ts`) ; `registerTimelineWorkflow` reste dans `rights.ts`, avec un `ToDo(blog-migration)` et les routes nouvelles. `create-post` garde `startLoadNotificationsAction` et le repli sur `timeline`, avec un `ToDo(blog-migration)` : chemin non atteignable sur la branche. Option écartée : les retirer de `create-post`.
4. **`navigation/` supprimé en entier** (2026-11-24, développeur) : plus de `blogRouteNames`. Les routes s'écrivent en clair (`list` pour le `referrer` de `create-post`, workflow de `rights.ts`, intents). Option écartée : garder `navigation/index.ts` réduit à `blogRouteNames` en façade `@deprecated`. L'exception au geste 19 (`notif-handler.ts` modifié pour les noms de routes) est tombée avec la décision 5.
5. **Notifications écrites en `intents.notification`, pas débranchées** (2026-11-24, développeur) : la forme cible du geste 19 existe depuis le même jour.
   - Les deux gestionnaires de `notif-handler.ts` sont convertis un pour un (§4), et le fichier est supprimé.
   - Ce qu'on y gagne : les routes et les paramètres sont vérifiés par `tsc`, l'import de `timeline` et de l'ancienne navigation disparaît, et on ne réécrit pas le fichier une seconde fois.
   - Ce qui part : `trackInfo`, et l'ouverture dans l'onglet de `timeline`.
   - Pas encore lu : sur la branche, les notifications s'ouvrent toujours sur le web.
   - Le geste 19 de BASCULE est mis à jour pour les bascules suivantes.

   Option écartée : débrancher le fichier tel quel (geste 19 d'origine).

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

Ce qui ne peut pas encore être joué dans l'app, et ce qu'il attend :

- le choix du blog et le bouton « créer » attendent `timeline` ;
- l'ouverture des notifications attend que `notifications` lise `intents.notification` ;
- la ressource `blog` attend `communities`.

## 8. Mesure

À remplir en fin de bascule.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR. Sujets tirés de §5.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
