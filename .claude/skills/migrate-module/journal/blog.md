# Bascule : `blog`

> Statut : basculé (pas joué dans l'app) — mis à jour le 2026-11-24
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
| 3 | Billet : contenu, barre d'audience, commentaires (module `comments`, décision 18) ; tirer pour rafraîchir ; rafraîchi au retour sur l'écran ; vue marquée (audience) | recette : ouvrir un billet, revenir de la modification | | |
| 4 | Commentaires (`ResourceWithCommentsTemplate`, décision 18) : publier (droit calculé par `computeCanComment`), répondre si le blog l'autorise (`allowReplies`, modale `comments/reply`), modifier, supprimer ; type de compte de chaque auteur ; quitter avec un commentaire non enregistré demande confirmation | recette : écrire un commentaire, répondre, revenir en arrière | | |
| 11 | Billet épinglé (PEDAGO-4216) : bordure violette et pastille « épinglé » (`ui-pin`) dans la liste | recette : un blog avec un billet épinglé | | |
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
- **Intents** (`intents`, dans `intents.ts` à la racine du module, typé `ConfigForIntents`, importé par `index.ts` ; décision 6 ; premier module à en déclarer) :
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
- **Ajouts découverts pendant la bascule** (2026-11-24, à relire) :
  - **Params des routes en `type`** au lieu d'`interface` (`BlogSelectScreenNavParams`, `BlogPostDetailsScreenNavParams`, `BlogCreatePostScreenNavParams`, `BlogEditPostScreenNavParams`, `BlogPostListScreenNavigationParams`) : `StaticScreenProps` exige un `Record<string, unknown>` (même geste qu'`audience`, [audience.md](audience.md) §4).
  - **`explorer.tsx`** : le `NavParams` du template est une `interface` (pas un `Record`), et le template lit `route.name`, que `StaticScreenProps` ne type pas. Contourné dans `blog` par un type local (`Pick<…NavParams, keyof …>`, route `& { name: string }`) avec un `ToDo(blog-migration)` ; défaut d'`explorer` noté dans [later.md](later.md).
  - **Slice `blog` du reducer** : `createSessionReducer<Record<…, Blog>>` sans union d'actions, le handler retrouve son action par `as` (CONVENTIONS « Données et état ») : sinon `redux: { reducer }` ne compile pas (Redux 5 type le state à `never`).
  - **`mapDispatchToProps` du billet** : le second paramètre (typé `getState`, en réalité les `ownProps`, inutilisé) est retiré : il ne compile plus dès que `mapStateToProps` lit `{ session }`.
  - **En-têtes** : un `label` est obligatoire sur les items (« Ajouter un billet », « Envoyer », « Enregistrer », « Modifier »/« Supprimer »). Le menu « … » n'a pas de traduction « options » : `label: common-edit` provisoire, avec `ToDo` (comme `media`). Indicateur de chargement : `ActivityIndicator` en `headerCustom` (modèle `myapps/favorites`), couleur `theme.palette.grey.black` au lieu de `theme.ui.text.inverse`.
  - **`testID` ajoutés** (exigés par les items, aucun retiré ni changé) : `blog-postdetails-options`, `blog-postdetails-edit`, `blog-postdetails-delete`, `blog-createpost-send`, `blog-editpost-save`. `header-post-create` gardé.
  - **`create-post`** : la navigation vers `referrer ?? timelineRouteNames.Home` garde un `@ts-expect-error` expliqué (route en `string`, route de `timeline` absente), avec le `ToDo` de la décision 3.
  - Hooks de navigation (`useNavigation`, `useIsFocused`) pris de `~/app/navigation-new`, comme le demande son en-tête.
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
| 20 | `create-post` : `toastSuccessText` peut être `undefined` (droit d'affichage inconnu) : erreur `tsc` TS2345 révélée par le typage de la session (`ISession` n'existait plus, tout était `any`) | `erreurs` |
| 21 | `create-post` : `referrer` en `string` (route passée en paramètre) et repli sur `timeline` : à remplacer par un retour (`goBack` / `pop`) | `structure` |
| 22 | `UI_STYLES` importé et inutilisé dans le billet (ESLint, déjà présent) | `dette` |
| 23 | Erreurs avalées : la publication ou la soumission après la création d'un billet, sa publication depuis le billet, sa suppression, et les commentaires (publier, modifier, supprimer) ne remontent pas leur échec (`ignoringError` d'`actions.ts`, gardé tel quel) : l'écran annonce un succès, et les `Alert` d'erreur des commentaires ne s'affichent jamais | `dette` (à valider : change ce que voit l'utilisateur) |

**Après l'assainissement du 2026-11-24** (§9) : traités 1 à 5, 7, 9 à 12, 15 à 22. Traité aussi le même jour, après la relecture : 23 (décision 15). Restent : 6 (`temporal`, reporté), 8 (la règle de `blog` dans `computeAudienceRefererFromResourceUri` d'`audience` : son import est rebranché sur `util.ts`, la règle reste, car le carrousel et le lecteur lui passent des adresses), 13 (`ui`, abandonné), 14 (`droits`, sans objet).

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

6. **Intents dans leur propre fichier** (2026-11-24, développeur, après la bascule) : `intents.ts` à la racine du module (`export const intents: ConfigForIntents`), pour alléger `index.ts`. Pas d'effet sur les types (même `tsc`). Option écartée : en ligne dans la config. **Généralisé le même jour** (développeur) : CONVENTIONS « Structure d'un module », geste 19 de BASCULE, ARCHITECTURE §2.3, `framework.md`.

7. **Assainissement : plan d'ensemble, tout dans l'arbre** (2026-11-24, développeur) : les sujets s'enchaînent sans commit ni patch ; un seul diff, découpé plus tard par le développeur. Ordre : `connect`, `classes`, `dette` (code mort), `structure` (service + `transport`, avec `api-publique`), `structure` (modèle + actions), `performance`, `styles`, `dette` (reste), `erreurs`.
8. **Bugs corrigés** (2026-11-24, développeur) : 15 (`edit` bloqué après un échec), 16 (double toast), 17 (billet supprimé depuis une notification), 19 (`onFlushPosts` attendu).
9. **`KeyboardPageView` → `KeyboardAvoidingView`** dans le billet (2026-11-24, développeur) : marge du bas à vérifier sur iOS.
10. **`referrer` de `create-post` gardé, typé `'blog/list'`** (2026-11-24, développeur), avec le repli sur `timeline` et son `ToDo`. Option écartée : toujours revenir à la liste.
11. **`BlogPostDetailsScreen` réécrit en fonction** (2026-11-24, développeur), hooks dans `hooks.ts` ; absorbe son `connect`.
12. **Workflow de `timeline` dans un fichier à part** (2026-11-24, développeur) : `timeline-workflow.ts`, dont le `ToDo(blog-migration)` dit de le reprendre par une entrée `create` dédiée (`entries.create`) à la bascule de `timeline`.
13. Annoncé, sans effet visible (2026-11-24) : `try-action` et `droits` sans objet (`rights.ts` : droits par ressource, la disponibilité du module dépend déjà de `matchEntcoreApp`) ; `temporal` reporté (`ContentCardHeader`, `CommentField` du framework prennent des `Moment`, [later.md](later.md)) ; `ui` abandonné (pieds de page fixes, pas de bottom sheet ; choix du blog non atteignable) ; requêtes par `getModuleTransport('blog').accountFetch(session, …)`, comme `support`.

14. Pris seul pendant l'assainissement (2026-11-24), sans effet visible attendu, à relire :
    - les erreurs que le module avalait le restent (`ignoringError` d'`actions.ts`), pour ne rien changer à l'écran ; noté au backlog (23) ;
    - le billet se recharge au retour sur l'écran seulement après l'avoir quitté (`blur` puis `focus`) : l'ancien écran le rechargeait aussi à l'ouverture depuis une notification (chargement en double, backlog 9) ;
    - l'audience du billet est chargée avec l'id du billet reçu, en parallèle (vues et réactions) : l'ancienne classe lisait son state avant sa mise à jour ;
    - les écouteurs du clavier sont retirés à chaque changement du billet (l'ancienne classe accumulait ceux de `keyboardWillHide`) ;
    - le store garde ses deux clés (`blog`, `posts`) et ses types d'actions (`BLOG_LOAD`, `BLOG_POSTS_LOAD_PAGE`), en un seul reducer de session ;
    - `refreshOneSessionId` (`~/modules/auth/flows`) au lieu de sa façade ; `create-post` garde un `ThunkDispatch<any, …>` pour le thunk de `timeline` (`ToDo`) ;
    - le `ref` de `BottomEditorSheet` n'est pas transmis par le framework (`clearCommentField` est sans effet, depuis toujours) : appel gardé, noté dans [later.md](later.md).

15. **Retours de la relecture (`/code-review`) tous corrigés** (2026-11-24, développeur : « Fix all of them ») :
    - le billet se rouvre quand ses params demandent un autre billet (notification sur l'écran déjà dans la pile), et l'indicateur « quitté » survit à un changement des params ;
    - titre masqué tant que le billet n'est pas chargé (`headerTitle: () => ''`, puis `headerTitle: undefined` avec le titre du billet) ;
    - une erreur à l'ouverture (rafraîchissement de la session) affiche l'écran d'erreur au lieu du squelette pour toujours ;
    - audience d'un billet sans réaction : mêmes valeurs par défaut que la liste ;
    - tirer pour rafraîchir affiche son indicateur (`REFRESH`) ;
    - **les erreurs ne sont plus avalées** (backlog 23, change ce que voit l'utilisateur) : échec de suppression du billet (alerte, on reste sur le billet), de publication (toast d'erreur), des commentaires (alerte), de la publication ou de la soumission après la création (toast d'erreur, le billet reste un brouillon) ;
    - mineurs : `ThunkDispatch<unknown, unknown, UnknownAction>` au lieu d'`any`, test du total de `loadPostsPage`, `UI_VALUES.opacity.transparent`, enums en chaînes.
16. **Adresses dans `service/resource-uri.ts`** (2026-11-24, développeur) : `blogUriCaptureFunction` et `blogPostGenerateResourceUriFunction` quittent `util.ts`. Le fichier ne porte que le lien entre une ressource et son adresse web, dans les deux sens (capture, génération) ; `util.ts` supprimé, importeurs (dont `audience`) rebranchés.
17. **`withSession` posé à la définition de l'écran** (2026-11-24, développeur) : `const BlogXScreen = withSession<StaticScreenProps<Params>>(function ({ route, session }) { … })`, puis `BlogXScreen.displayName = 'BlogXScreen'`, comme `src/app/test/amodule.tsx` ; `defineScreen` / `defineModal` reçoivent l'écran tel quel. Les 6 écrans du module.

18. **Rebase sur `009dddad9` (`feat/rn86`) : les 8 commits `blog` d'upstream portés sur le module assaini** (2026-11-25, développeur : « Oui, et basculer comments »). Upstream avait réécrit le billet sur les commentaires du module `comments`, à côté de la réécriture de ce module (décision 11), sur l'ancien `CommentField`. Le billet repart de la version d'upstream, refaite aux gestes de la bascule et de l'assainissement ; ce que la décision 11 avait écrit pour les commentaires tombe (`useScrollToEditedComment`, `CommentField`, `BottomEditorSheet`, `KeyboardAvoidingView` de la décision 9).
    - **Commentaires** (`6d70d33d3`, `30bf44ea9`, `7ca8be3f2`) : `ResourceWithCommentsTemplate`, champ toujours visible, réponses (`replyTo`), défilement vers le commentaire publié. Le modèle garde la liste du serveur (`BlogPost.comments`, compte de la liste) et le billet ouvert y ajoute le fil (`BlogPostDetails.commentsThread`, règle `getCommentsThread`, testée). Les types de compte des auteurs viennent de `/userbook/api/person` (`blogService.accountTypes`, scope `userbook` ajouté au module, comme `myapps`).
    - **Droits** (`e7e0c9487`, `bd6218ca0`) : `Blog.rights` et `Blog.allowReplies` ; `computeCanComment` dans `model/business.ts` (testée), écrite avec `some` au lieu de `Set.prototype.isDisjointFrom` (polyfillé par `wiki` : pas sûr sur Hermes).
    - **Params du billet réduits à `{ blogId, postId }`** (`6d70d33d3`) : la liste, l'intent de notification (adresse lue par `blogUriCaptureFunction`) ; le billet recharge le blog et le billet (`ContentLoader`, rouvert par sa `key` quand les params changent). Perdus avec les params d'upstream : le défilement vers le dernier commentaire à l'ouverture d'une notification `PUBLISH-COMMENT`, et l'état du billet donné par la liste (lu du serveur).
    - **Épinglé** (`b757292f6`) : `pinned` (API, modèle, adaptateur, carte, liste).
    - **`testID`** (`83abb9e73`, `bcfe90734`) : ceux d'upstream gardés (`label-subject-author`, `label-blog-title`, `label-subject-title`, `input-subject-content`) ; `button-header-send` remplace `blog-createpost-send` de la bascule (flows d'upstream).
    - Gardé de la bascule et de l'assainissement : en-tête (`headerMenu`, titre vide puis celui du billet), `withSession`, erreurs remontées (décision 15), rechargement au retour après un `blur`, vue marquée une fois par billet, audience en parallèle (sans bloquer le billet si elle échoue).
    - Corrigé d'upstream : la publication d'un commentaire est attendue avant de recharger ; après une réponse, le défilement va au commentaire répondu (upstream : toujours au plus récent).
    - Corrigé après relecture (`/code-review`, 2026-11-25) : la suppression du billet revient à la liste avec `{ pop: true }` (upstream le passait, le portage l'avait perdu : une 2ᵉ liste s'empilait sur le billet supprimé) ; un échec de publication ou de modification d'un commentaire lève l'erreur au formulaire de `comments`, qui garde le texte tapé et montre un toast (l'alerte l'effaçait) ; un échec du rechargement qui suit est seulement journalisé (le commentaire est enregistré : pas d'erreur qui le ferait renvoyer).
    - **Module `comments` basculé** pour les réponses (fiche [comments.md](comments.md)).

### Questions ouvertes

Aucune.

## 7. Vérification

Base mesurée le 2026-11-24, avant la bascule.

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module (comparé fichier par fichier) | 37 erreurs dans `blog` (780 dans le dépôt) | 24 dans `blog` (767 dans le dépôt). Parties : `module-config.ts`, `explorer` (3 du reducer, 5 de l'écran), `ISession` ×2, `titleStyle` ×2, `useModuleAppDisplay('blog')`. **Une nouvelle** : `create-post/screen.tsx` TS2345 (backlog 20), révélée par le typage de la session. Aucune hors de `blog` |
| ESLint sur le dossier | 50 erreurs | 36 erreurs, aucune nouvelle (règles comparées par fichier) |
| `yarn lint-all` | 2134 problèmes | 2120 problèmes |
| Jest | 456 / 456 (45 suites) | 456 / 456 (45 suites) ; aucun test ne couvre `blog` |
| Compteurs de [SUIVI.md](SUIVI.md) | `à faire`, 6 écrans anciens, navigation ancienne 11, `connect(` 3, importe `workspace` | `basculé, sans test`, 0 écran ancien, 6 nouveaux, navigation ancienne 0, `connect(` 3, importe `workspace` (justifié §2), Notif. « oui » ; `--check` : « Legacy counters did not go up » |
| Flows Maestro ou recette manuelle | aucun flow | aucun flow ; recette de §3 à jouer |
| Parcours joué dans l'app (iOS, Android) | — | pas testé dans l'app |

Ce qui ne peut pas encore être joué dans l'app, et ce qu'il attend :

- le choix du blog et le bouton « créer » attendent `timeline` ;
- l'ouverture des notifications attend que `notifications` lise `intents.notification` ;
- la ressource `blog` attend `communities`.

## 8. Mesure

Bascule le 2026-11-24, en une session, à partir de la fiche écrite par une session précédente (aucune question reposée). Écriture et vérification : environ une heure d'agent. Hors des gestes prévus : les ajouts de §4 (« Ajouts découverts »), surtout des contraintes de types (`Record` des params, reducer Redux 5, `route.name` du template d'`explorer`). Temps du développeur (relecture, test) : à noter.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR. Sujets tirés de §5.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
| `connect` | fait | `create-post`, `edit` en hooks (`useDispatch` pour le seul thunk de `timeline`) ; celui du billet absorbé par `classes` | 7, 8, 1 | tout dans l'arbre |
| `try-action` | sans objet | aucun `tryAction` / `handleAction` | | |
| `classes` | fait | `BlogPostDetailsScreen` en fonction, hooks dans `screens/blog-post-details/hooks.ts` (`useBlogPostDetails`, `useScrollToEditedComment`) ; l'écran fonction de la bascule disparaît (décisions 11, 14) | 3, 4, 5, 6, 10 | tout dans l'arbre |
| `dette` : code mort | fait | slices `blogs` / `folders` / `tree` et leurs calculs, actions mortes (dont l'import de `workspace`), `folders.list`, `posts.get`, `fetchPosts`, `components/placeholder/explorer`, `handleInitTimeline` d'`edit`, `richContentReady`, styles inutilisés | rien de plus | tout dans l'arbre |
| `structure` : service + `transport` | fait | `service/types.ts` (`namespace API`), `service/adapter.ts`, `getModuleTransport('blog').accountFetch(session, …)` ; corps envoyés identiques (test) | 2 à 8 (toutes les requêtes) | tout dans l'arbre |
| `api-publique` | fait (avec `structure` service) | adresses dans `service/resource-uri.ts` (`blogUriCaptureFunction`, `blogPostGenerateResourceUriFunction`, décision 16), import d'`audience` rebranché | | tout dans l'arbre |
| `structure` : modèle + actions | fait | `model/index.ts`, `model/business.ts` (`rights.ts` supprimé), `actions.ts` (thunks pour le store, fonctions async sinon), `store/` (façon `myapps`), `screens/select/`, `timeline-workflow.ts` (décision 12) ; tests colocalisés | 2 à 8 | tout dans l'arbre |
| `performance` | fait | `useCallback` / `useMemo` (`create-post`, `edit`, `select`, `list`, billet), `React.memo` des billets de la liste, constantes hors des composants, audience en parallèle | 2, 3, 7 | tout dans l'arbre |
| `styles` | fait | styles en ligne de `post-resource-card` dans son `styles.ts` (valeurs identiques) ; `style.ts` → `styles.ts` ; styles inutilisés retirés | 2, 3 : comparer à l'œil | tout dans l'arbre |
| `dette` : le reste | fait | bugs 15, 16, 17, 19 (décision 8) ; `KeyboardPageView` → `KeyboardAvoidingView` (décision 9) ; façades d'`audience` et d'`auth` ; `doRefresh` en double ; messages d'erreur (18) ; `referrer` typé (décision 10) | 4, 5, 7, 8 et bugs | tout dans l'arbre |
| `erreurs` | fait | `tsc` du module 24 → 0, ESLint 36 → 0 (la plupart absorbées par les sujets précédents ; `comments` dans le modèle, ref du placeholder, `reloadAll`, union des droits de publication) | rien de plus | tout dans l'arbre |
| `droits` | sans objet | décision 13 | | |
| `temporal` | reporté | décision 13 ; [later.md](later.md) | | |
| `ui` | abandonné | décision 13 | | |

Vérifié le 2026-11-24, comparé à la mesure d'avant l'assainissement (après la bascule) : `tsc` du dépôt 767 → 743, aucune erreur nouvelle par fichier et par code (les 24 de `blog` parties) ; ESLint sur le dossier 36 → 0 ; `yarn lint-all` 2120 → 2084 ; Jest 456 → 489 (33 tests du module : `model/business.test.ts`, `service/adapter.test.ts`, `util.test.ts`, `actions.test.ts`) ; `yarn migration-status --check` vert ; `testID` inchangés (lignes seulement déplacées), clés i18n inchangées. **Pas testé dans l'app.**

### Recette

**Pas testé dans l'app.** Aucun flow Maestro. Numéros = comportements du §3 ; tout se joue en une fois (un seul diff) :

- 1 : accueil, dossier, retour ; liste vide : texte et bouton selon le droit de créer un blog.
- 2 : liste (titre du blog, pages de 20 au défilement, réactions et vues, « + » selon le droit) ; retour depuis la création : liste rechargée.
- 3 : billet ouvert depuis la liste (contenu, audience, commentaires par 20) ; tirer pour rafraîchir ; quitter puis revenir : billet rechargé ; **marge du bas sur iOS** et champ de commentaire au-dessus du clavier (`KeyboardAvoidingView`, décision 9).
- 4 : publier un commentaire (défilement en bas), le modifier (défilement jusqu'à lui quand le clavier s'ouvre, Android et iOS), le supprimer ; quitter avec un commentaire non enregistré : confirmation.
- 5 : menu « … » : « Modifier », puis « Supprimer » : retour à la liste rechargée.
- 6 : billet soumis : « Publier » (toast, billet rechargé) ; profil sans droit : « en attente de validation ».
- 7 : création : bouton désactivé sans titre ou contenu, indicateur, toast selon le droit, liste rechargée ; **stockage plein : un seul toast** (bug 16).
- 8 : modification : préremplie, enregistrée, toast ; **hors réseau : toast d'erreur puis bouton de nouveau actif** (bug 15).
- Bug 17 (quand les notifications seront lues) : supprimer un billet ouvert depuis une notification : la liste de son blog s'ouvre.
- Rebase (décision 18) : commenter, répondre (modale `comments/reply`, puis retour au billet), modifier et supprimer un commentaire et une réponse ; blog sans réponses (`allowReplies` faux) : pas de « Répondre » ; profil sans droit de commenter ; type de compte affiché pour chaque auteur ; billet épinglé dans la liste ; ouverture depuis la liste puis rafraîchissement.
- Relecture (décision 15) : à l'ouverture d'un billet, le titre reste vide puis devient celui du billet (jamais `blog/blog-post-details`) ; tirer pour rafraîchir : indicateur visible ; **hors réseau** : supprimer le billet (alerte, on reste sur le billet), commenter et modifier un commentaire (toast d'erreur, le texte tapé reste), « Publier » un billet soumis (toast d'erreur), créer un billet (toast d'erreur) ; billet sans réaction ouvert : barre d'audience affichée.
