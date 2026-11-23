# Bascule : `audience`

> Statut : basculé et assaini (sélecteur de réactions joué sur iOS, le reste pas testé dans l'app) — mis à jour le 2026-11-23
>
> Fiche du module : sa bascule (étape 1), puis son assainissement (étape 2, §9). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](../INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](../BASCULE.md). Une page : ce qui est propre à ce module.

## 1. Ce que fait le module

Les réactions et les vues des ressources d'autres modules (billets de `blog`, annonces de `communities`, actus de `news`, pages de `wiki`). Une barre `Audience` sous la ressource montre le nombre de réactions, de vues (gestionnaire seulement) et de commentaires, avec un bouton pour réagir. Un appui sur les réactions ou sur les vues ouvre une modale de détail.

On n'y entre jamais directement : ni onglet, ni « Mes applis ». Seulement depuis les modules qui affichent la barre, tous anciens et non chargés aujourd'hui.

Le module est en deux dossiers :

- `src/modules/audience` (nouveau, `CoreModule` déjà dans `src/app/config/modules.ts`) : chargement des types de réactions de la plateforme à `onSessionStart`, store zustand `store.ts`. Fait pendant la migration d'`auth`.
- `src/framework/modules/audience` (ancien) : `index.ts` (un `Module` de l'ancien système, non chargé, et les hooks `useAudience` / `markViewAudience`), `module-config.ts`, `service.ts`, `types.ts`, `components/` (barre `Audience`, bouton `AudienceReactButton`), `screens/reactions` et `screens/views`.

## 2. Taille et dépendances

Repris de [SUIVI.md](SUIVI.md) le 2026-11-23.

| Dossier | Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications | Navigation ancienne |
| --- | ---: | ---: | ---: | ---: | ---: | :---: | ---: |
| `src/modules/audience` | 2 | 48 | 0 | 0 | 0 | — | 0 |
| `src/framework/modules/audience` | 20 | 1309 | 0 | 2 (modales globales) | 3 | — | 5 |

- **Les deux écrans sont des modales globales de l'ancienne navigation** : déclarés dans `src/framework/navigation/modals/index.ts` (`ModalsRouteNames.AudienceReactions` = `audience-reactions`, `AudienceViews` = `audience-views`) et `navigator.tsx` (groupe `presentation: 'modal'`, `setModalModeForRoutes`), montés seulement par l'ancien `src/app/navigation/root-navigation.tsx`. Dans la nouvelle navigation, ces routes n'existent pas : un appui sur les réactions ou les vues ne mènerait nulle part.
- **Modules anciens importés** : `blog`, par `index.ts` (`blogUriCaptureFunction` de `~/framework/modules/blog/service/adapters`, pour `computeAudienceRefererFromResourceUri`) : **code seul**, permis (geste 16, `ToDo(audience-migration)`).
- **Façades d'`auth`** (geste 14) : `getValidReactionTypes` (`~/framework/modules/auth/redux/reducer`, `@deprecated`, lit `getSession()` puis le store d'`audience`) dans `components/component.tsx`, `components/button/component.tsx`, `screens/reactions/screen.tsx` ; types `AuthActiveAccount`, `AccountType` de `~/framework/modules/auth/model` dans `types.ts`, `service.ts`, `components/types.ts`, `screens/views/screen.tsx`.
- **Importeurs** (aucun n'importe `module-config.ts` ni `navigation/` : pas de façade à laisser) :
  - framework, chargé : `src/framework/components/carousel/screen.tsx`, `media/player/component.tsx`, `media/button/types.ts`, `media/player/types.ts`, `src/framework/util/htmlParser/content.tsx`, `src/ui/AttachmentGroup.tsx`, `src/ui/Images.tsx` (`markViewAudience`, type `AudienceParameter`) ;
  - modules anciens, non chargés : `blog` (barre, service, `markViewAudience`), `communities` (barre, service, `AudienceProps`), `news` (service, types), `wiki` (`useAudience`, type `AudienceReferer`) ;
  - `src/framework/modules/auth/redux/reducer.ts` lit `~/modules/audience/store` ;
  - `src/modules/audience/index.ts` lit `audienceService` à l'ancien chemin.
- **Navigation entrante** : seulement la barre `Audience` elle-même (`navigation.navigate(ModalsRouteNames.Audience…, { referer })`). Pas de lien profond, pas d'intent.

## 3. Comportements à conserver

**Rien d'`audience` n'est jouable dans l'app tant qu'aucun consommateur n'est basculé** (`blog`, `news`, `communities`, `wiki` : tous anciens). Seul le n° 1 est observable aujourd'hui. Pas de flow Maestro possible avant ; à écrire avec la bascule du premier consommateur (`news` ou `blog`). Recettes manuelles :

| # | Comportement | Flow ou recette | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | Les types de réactions de la plateforme se chargent à chaque début de session ; un échec est seulement journalisé | log réseau `GET /audience/conf/public` après connexion | | |
| 2 | Barre : nombre de réactions + icônes des types présents (sinon l'icône du premier type valide), vues pour un gestionnaire seulement, commentaires si `showComments` ; squelette tant que les types de réactions ne sont pas chargés ; en mode `preview`, rien n'est appuyable | billet de blog : comparer la barre avec le web | | |
| 3 | Appui long / appui sur « Réagir » : choix d'une réaction (animation), envoi `POST`, `PUT` si une réaction existe, `DELETE` pour la retirer ; puis les compteurs se rafraîchissent. `testID` `cancel-reaction-btn`, `post-reaction-btn` | réagir, changer, retirer : compteurs et libellé du bouton | | |
| 4 | Appui sur les réactions : modale « Réactions » (titre `audience-reactions-title`), onglets « Toutes » + un par type avec son compteur, liste paginée par 20 (avatar avec badge, nom, profil), écran vide `audience-reactions-empty` | ouvrir, changer d'onglet, défiler, fermer | | |
| 5 | Appui sur les vues (gestionnaire) : modale « Vues » (`audience-views-title`) : vues, vues uniques, vues par profil | ouvrir, fermer | | |
| 6 | La vue d'une ressource est comptée une fois par focus (`useAudience().markView`), ou à l'ouverture d'un média (`markViewAudience`, carrousel, lecteur) | log réseau `POST /audience/views/…` | | |
| 7 | Modales en `presentation: 'modal'` avec un bouton fermer | ouvrir une modale sur iOS et Android | | |

`testID` ajoutés pour les tests : aucun.

## 4. Dans la bascule

Fait le 2026-11-23 (questions 1 et 2, §6), non commité :

- **Tout le code passe dans `src/modules/audience`** (décision 1), déplacé tel quel, même arborescence :
  - `service.ts`, `types.ts`, `components/` (barre `Audience` à la racine de `components/`, `button/`), `screens/reactions/`, `screens/views/` ;
  - le contenu de l'ancien `index.ts` (hors déclaration) ne peut pas aller dans l'`index.ts` du module (chargé en différé, comme `~/modules/auth`) : `useAudience` dans `hooks.ts`, `markViewAudience` et `computeAudienceRefererFromResourceUri` dans `actions.ts` (CONVENTIONS « Structure d'un module »).
- **Façades `@deprecated`** (geste 15) aux anciens chemins, avec seulement ce que lisent les importeurs, qui ne changent pas :
  - `src/framework/modules/audience/index.ts` : `markViewAudience`, `useAudience` ;
  - `src/framework/modules/audience/types.ts` : `AudienceParameter`, `AudienceReferer`, `AudienceViews` (et les autres types, réexportés en bloc) ;
  - `src/framework/modules/audience/service.ts` : `audienceService` ;
  - `src/framework/modules/audience/components/index.ts` : la barre (export par défaut) ;
  - `src/framework/modules/audience/components/types.ts` : `AudienceProps`.
  Le reste de l'ancien dossier est supprimé (styles, bouton, écrans, `module-config.ts`). `src/modules/audience/index.ts` lit le service à son nouveau chemin.
- **Modales du module** (gestes 4, 5, 6) : les deux écrans deviennent des `modals` du `CoreModule` (`defineModal`, présentation `modal` et bouton fermer par défaut, comme l'ancien groupe).
  - Routes : `audience-reactions` → `audience/reactions` ; `audience-views` → `audience/views`.
  - Télémétrie : `trackView` donne désormais le module `audience` et la vue `reactions` / `views` (avant : la route entière `audience-reactions` / `audience-views`).
  - Titre par `options: () => ({ title: I18n.get('audience-reactions-title') })` (resp. `audience-views-title`) au lieu de `computeNavBar` / `navBarOptions`.
  - Props `StaticScreenProps<{ referer: AudienceReferer }>` au lieu de `NativeStackScreenProps<IModalsNavigationParams, …>` ; `types.ts` des écrans sans `NativeStackScreenProps` ni `~/framework/navigation/modals`.
  - `index.ts` des écrans : réexport seulement (plus de `computeNavBar`).
- **Pas de route d'accueil** : pas d'`entries`, aucun suffixe à choisir.
- **Ancien registre des modales globales** (décision 2, hors du dossier, 2 fichiers) : les deux routes `Audience*` retirées de `src/framework/navigation/modals/index.ts` (enum, params, imports de types) et de `navigator.tsx` (écrans, imports, `setModalModeForRoutes`).
- **Barre `Audience`** : navigue vers `audience/reactions` / `audience/views` par `useNavigation()` (typage sans `IModalsNavigationParams`).
- **`withSession`** (geste 18) sur `screens/reactions` : son `mapStateToProps` lit la session (par la façade `getValidReactionTypes`). Devient `(state, { session }) => ({ validReactionTypes: getPlatformReactionTypes(session.platform.name) ?? [] })`. `screens/views` ne lit pas la session : pas de `withSession`.
- **Façades d'`auth`** (geste 14) :
  - barre : `mapStateToProps` reçoit la prop `session` qu'elle a déjà : `(state, { session }) => ({ validReactionTypes: getPlatformReactionTypes(session.platform.name) ?? [] })` ;
  - bouton (sans prop `session`) : `getPlatformReactionTypes(getSession()?.platform.name) ?? []`, `getSession` de `~/modules/auth/store/accounts` (le contenu de la façade, à l'identique) ;
  - types `AuthActiveAccount`, `AccountType` : de `~/modules/auth/model`.
- **Ancienne déclaration** (gestes 1, 2) : `module-config.ts` et `export default new Module({ config, reducer })` supprimés (deux dossiers ne déclarent pas le même module). `matchEntcoreApp: 'Audience'` et `hasRight: () => true` disparaissent : le `CoreModule` n'a ni droits ni app ENT. `storageName` n'était pas utilisé (pas de storage).
- **Import de `blog`** (geste 16) : `ToDo(audience-migration)` sur `blogUriCaptureFunction`, dans `actions.ts`.
- **Chargement de session** (geste 12) : déjà fait (`onSessionStart`). Pas de reducer, pas de storage.

- **Écarts au portage tel quel**, imposés par le typage de la nouvelle navigation (à relire) :
  - params des deux écrans en `type` au lieu d'`interface` (`AudienceReactionsScreenNavParams`, `AudienceViewsScreenNavParams`) : les params d'une route doivent être un `Record<string, unknown>` ;
  - `mapDispatchToProps` de l'écran `reactions` : `(dispatch) => ({ dispatch })` au lieu de la fabrique `(dispatch, _) => () => ({ dispatch })`, qui ne se typait plus avec la prop `session`. Même prop `dispatch` (inutilisée : §5, 1).

Fichiers touchés hors des deux dossiers : `src/framework/navigation/modals/index.ts`, `src/framework/navigation/modals/navigator.tsx` (2, sous la limite de 3).

## 5. Hors de la bascule

### Backlog

Traité par l'assainissement du 2026-11-23 (§9) : n° 1 à 4, 6 à 10, 12 à 17 de l'ancien backlog, et la partie du n° 11 sans changement visible (`countByType!`, `renderTabReaction` typé, erreur relancée telle quelle). Reste :

| # | Point | Sujet |
| --- | --- | --- |
| 5 | `computeAudienceRefererFromResourceUri` connaît `blog` (règle d'un autre module en dur, `actions.ts`) : le consommateur devrait donner le `referer`. Gardé jusqu'à la bascule de `blog` (§6, 11) | `structure`, avec `blog` |
| 11 | Écran `reactions` : les compteurs par type sont lus une fois, avec la première page (`ToDo`) ; condition de pagination fragile (`userReactions.length >= (page - 1) * 20`) | `dette` (changement visible, à valider) |
| 18 | Ligne commentée `require('~/framework/modules/audience').default` dans `src/app/modules.ts`, au milieu des autres modules commentés | nettoyage final du dépôt |
| 19 | Façades `@deprecated` de `framework/modules/audience` : restent pour `blog`, `news`, `communities`, `wiki` (§6, 7) | à leur bascule |

### Noté, non traité

- `POST` / `PUT` inversés dans le bouton (§6, 8, `ToDo` dans `components/audience-react-button`) : à comparer avec le web avant de changer les requêtes.
- Squelette de la barre : hauteurs `24` et `30` en dur, sans constante exacte (`styles`).
- Badge de réaction des avatars (modale « Réactions ») : le type est corrigé, l'affichage reste à voir dans l'app avec une vraie ressource.
- Le store des types de réactions est en zustand (`src/modules/audience/store.ts`), fait avec `auth` : `audience` n'avait pas de state avant. Gardé (pas de passage de gestionnaire d'état).
- `markViewAudience` est utilisé par des composants du framework (carrousel, lecteur, pièces jointes) : API publique du module (`actions.ts`).

## 6. Décisions

1. **Tout le code passe dans `src/modules/audience`** (2026-11-23, développeur), avec des façades `@deprecated` aux anciens chemins : un seul dossier pour le module, comme le veut CONVENTIONS « Emplacement ».
2. **Les routes `Audience*` sont retirées de l'ancien registre des modales globales** (2026-11-23, développeur) : seule l'ancienne navigation le monte, et seule la barre d'`audience` y navigue.
3. Décidé seul (à relire) : `useAudience` dans `hooks.ts`, `markViewAudience` et `computeAudienceRefererFromResourceUri` dans `actions.ts` ; `components/` et `screens/` gardent leur arborescence.

Assainissement (`/sanitize-module`, plan d'ensemble, 2026-11-23) :

4. **Livraison d'un seul bloc** (développeur) : petit module transverse ; tous les sujets dans l'arbre de travail, un seul commit avec la bascule, après relecture. §9 garde un statut par sujet.
5. **Barre séparée** (développeur) : un composant d'interface `AudienceBar` (props seulement) et le composant public `Audience`, aux props inchangées, qui charge par des hooks et des actions et navigue vers les modales. Consommateurs inchangés.
6. **`sessionFetch` typé** (développeur) : `getModuleTransport('audience').sessionFetch`, signatures du service gardées (sans le paramètre `session` inutilisé). Écart avec `support` (`accountFetch(session)`) assumé : les consommateurs anciens n'ont pas toujours la session.
7. **Importeurs du framework rebranchés** (développeur) : carrousel, lecteur, `media`, `htmlParser`, `src/ui/` passent aux nouveaux chemins ; `blog`, `news`, `communities`, `wiki` gardent les façades jusqu'à leur bascule.
8. **`POST` / `PUT` inversés dans le bouton : notés, pas corrigés** (développeur) : à comparer avec le web avant de changer les requêtes (§5).
9. **Choix de la réaction converti en `transparentModal`** (développeur, contre la recommandation) : écran `audience/react`.
10. **Le squelette de la barre se rafraîchit à l'arrivée des types de réactions** (recommandation prise, le développeur n'ayant pas de préférence) : changement visible, correction de la régression du passage d'`auth` à zustand.
11. Annoncé, sans effet visible : le bouton reçoit les types de réactions de la barre (prop) ; la règle de `blog` (`computeAudienceRefererFromResourceUri`) reste, isolée, avec son `ToDo`, jusqu'à la bascule de `blog`.

12. **Le choix de réaction revient par `navigateAsync`** (2026-11-23, développeur ; répond à l'ancienne question ouverte 1) : le bouton ouvre `audience/react` avec `navigation.navigateAsync` (`~/app/navigation-new`), l'écran rend la réaction avec `useScreenPromise`, `undefined` si l'utilisateur ferme. Le bouton appelle ensuite ses props (`postReaction`…) comme aujourd'hui : pas de store ni de callback dans les params.

13. **Le geste continu « appui long puis glisser » est gardé avec l'écran `audience/react`** (2026-11-23, essais ; répond à l'ancienne question ouverte 2) : le geste survit à l'ouverture d'une `transparentModal`.
   - iOS (simulateur iPhone 18 Pro, `react-native-screens` 4.30.1), essai de l'agent : après l'ouverture, le `PanResponder` du bouton a reçu les 9 mouvements et le relâchement, avec les coordonnées de l'écran. Rien dans `react-native-screens` n'annule les touchers à la présentation d'une modale (seulement au geste de retour, `cancelTouchesInParent`).
   - Android, essai du développeur : fonctionne aussi bien.
   - Conception : le toucher reste au bouton qui l'a commencé, la modale n'en reçoit rien. Le bouton transmet à l'écran la réaction survolée et le relâchement (petit état partagé, ex. store zustand du module) ; l'écran affiche le choix et se résout au relâchement. Un toucher simple sur une réaction de l'écran marche aussi.
   - Code de l'essai, jetable, marqué `ToDo(audience-migration): EXPERIMENT` : `screens/react/` (écran + `gesture.ts`), enregistrement dans `index.ts`, appels dans le bouton, bouton posé sur l'accueil de test (`src/app/test/amodule.tsx`). Remplacé par l'implémentation du sujet `ui`, et le bouton retiré de l'accueil de test.

14. Décidé seul pendant l'assainissement (2026-11-23, sans effet visible sauf mention ; à relire) :
   - **Structure** : `model/index.ts` (types, ancien `types.ts`), `model/business.ts` (`getReactionAt`, testé), `service/` (`index.ts`, `types.ts` avec `namespace API` en alias du modèle, `adapter.ts` testé), `util.ts` (`getReactionIconName`), `actions.ts` (fonctions async sans session : `loadPlatformReactionTypes`, `loadResourceReactions`, `deleteReaction`, `postReaction`, `updateReaction`, `loadReactionsPage`, `loadViews`, `markViewAudience`). Les formats rendus par le service ne changent pas : `blog`, `news` et `communities` les lisent par la façade. Seul `getValidReactionTypes` (lu par le module seul) rend désormais la liste des types.
   - **Composants** : `components/audience-bar/` (`AudienceBar`, props seulement, le bouton en `children`), `components/audience-react-button/` (`AudienceReactButton`, props d'événement `on…`), `components/audience/` (`Audience` public : hooks, actions, navigation). `components/index.ts` exporte `Audience` et `AudienceProps`.
   - **Sélecteur `audience/react`** : `transparentModal`, `animation: 'none'` : le sélecteur apparaît et disparaît par ses propres animations, et l'écran ne quitte la pile qu'à leur fin (retour Android compris, `usePreventRemove`). Le bouton s'anime dès qu'il reçoit la réaction. Corrigé le 2026-11-23 sur le retour du développeur : avec `animation: 'fade'` et la fermeture 100 ms après le choix (comme l'ancien `Modal`), les icônes se figeaient pendant le fondu, car `react-native-screens` (Fabric) montre une capture figée d'un écran qui quitte la pile (`addSnapshotToView`, `RNSScreen.mm`). Params : position du bouton et types de réactions (pas de `withSession`). Le geste passe par `useReactionPickerGestureStore` (`store.ts`). La zone de choix compte les types reçus (l'ancien code supposait 4).
   - **Gestes du bouton** (2026-11-23, sur le retour du développeur : la page défilait pendant « maintenir puis glisser ») : `react-native-gesture-handler` (déjà une dépendance) au lieu du `PanResponder`. Un `PanResponder` est un JS responder : React Native ne bloque que les scroll views qu'il contient, pas celle qui le contient. Un pan activé après 300 ms d'appui (`activateAfterLongPress`) ouvre le sélecteur et suit le doigt ; s'il bouge avant, le pan échoue et la page défile comme avant. Un toucher (`useTapGesture`, exclusif) retire la réaction ou ouvre le sélecteur. Pas un appui long (`useLongPressGesture`) : il s'annule dès que le doigt sort du bouton ou dépasse quelques points, même actif. Le toucher est limité à 10 points (`maxDistance`) : sans limite, un glissé rapide parti du bouton comptait comme un toucher et ouvrait le sélecteur. Joué : par le développeur (essai réussi, 2026-11-23) ; par l'agent sur iOS, appui long puis glissé lent vers le bas : la page ne défile plus (elle défilait avant le correctif). **Pas vérifié** : le glissé immédiat parti du bouton (la page doit défiler) avec la limite de 10 points, la session s'étant perdue au redémarrage de l'app.
   - **Position du sélecteur** : calculée depuis la position mesurée de la modale, au lieu du décalage de la barre d'état ajouté à la main sur Android. **À vérifier sur Android.**
   - **Type de réaction inconnu de l'app** : pas d'icône (avant : un `Svg` au nom inconnu).
   - `audienceService.view.post` attend la requête : un échec est journalisé (avant : rejet non traité, le `catch` ne voyait rien).
   - `useAudience` rend un objet mémoïsé ; les `types.ts` des écrans sont supprimés (types internes, CONVENTIONS « Dossier d'un écran »).

### Questions ouvertes

Aucune.

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` (comparé fichier par fichier) | 792 au total ; 11 dans `audience` (bouton 5, barre 2, `reactions` 1, `views` 3 : §5) | 792, identiques par fichier et par code une fois les chemins déplacés pris en compte (`src/framework/modules/audience/…` → `src/modules/audience/…`) |
| ESLint sur les deux dossiers (et `framework/navigation/modals`) | 26 erreurs | 13, toutes déjà présentes (variables inutilisées du bouton, `sort-keys` de `components/styles.ts`) ; `eslint --fix` sur les fichiers touchés |
| `yarn lint-all` | 2166 problèmes | 2153 |
| Jest | 447 / 447 | 447 / 447 (aucun test sur `audience`) |
| Compteurs de [SUIVI.md](SUIVI.md) | `framework/modules/audience` : navigation ancienne 5, `connect(` 3 ; fichiers sur l'ancienne navigation 221 | `audience` (`src/modules`) : basculé, sans test, 2 modales, navigation ancienne 0, `connect(` 3, importe `blog` (code, `ToDo`) ; `framework/modules/audience` : 5 façades, navigation ancienne 0 ; total 216. `--check` vert |
| `testID`, clés i18n, storage | `cancel-reaction-btn`, `post-reaction-btn` ; pas de storage | inchangés (`git diff -M` : lignes déplacées seulement) |
| Flows Maestro ou recette manuelle | aucun flow | aucun flow (rien de jouable, §3) |
| Parcours joué dans l'app (iOS, Android) | — | **pas testé dans l'app** |

Ce qui ne peut pas encore être joué dans l'app, et le module qu'il attend : §3, 2 à 7, le premier consommateur basculé (`news` ou `blog`). Le n° 1 (chargement des types à la connexion) est jouable dès maintenant.

## 8. Mesure

Temps passé : à remplir. Questions posées par l'agent : 2 (emplacement : réponse « tout déplacer », contre la recommandation ; ancien registre des modales).

## 9. Assainissement

Plan d'ensemble, fait le 2026-11-23 dans l'arbre de travail, un seul commit avec la bascule (§6, 4). Non commité.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
| `connect` | fait | §6, 10 et 11 | barre : squelette puis compteurs dès que les types arrivent ; modale « Réactions » : onglets par type | commit unique (§6, 4) |
| `try-action` | sans objet | | | |
| `classes` | sans objet | | | |
| `structure` : service + `transport` | fait | §6, 6 et 14 | réagir, changer, retirer : requêtes inchangées (`POST`, `PUT`, `DELETE`) | commit unique |
| `structure` : modèle + actions | fait | §6, 5 et 14 | compteurs rafraîchis après chaque réaction | commit unique |
| `ui` | fait | §6, 9, 12, 13 et 14 | appui long sur « Réagir » : le sélecteur s'ouvre au-dessus du bouton ; glisser sur une réaction (elle grossit, son nom s'affiche) et lever le doigt la choisit ; lever hors du sélecteur le laisse ouvert ; un toucher sur une réaction la choisit, sur le fond ferme. **iOS** (2026-11-23, agent, accueil de test, ressource fictive) : ouverture, position, relâché hors du sélecteur, fermeture par le fond. Pas joué : le choix (il écrit sur le serveur), Android | commit unique |
| `performance` | fait | | `useCallback` / `useMemo` / `React.memo` ; `react-hooks/exhaustive-deps` sans erreur | commit unique |
| `styles` | fait | | `paddingBottom` du pied de liste et couleur par défaut des vues dans `styles.ts` ; hauteurs du squelette gardées (§5) | commit unique |
| `dette` | fait | §6, 8 | `PageView` → `View` (`flex: 1`) : fond et marges des deux modales de détail | commit unique |
| `erreurs` | fait | | `tsc` : 10 erreurs du module en moins ; ESLint du dossier : 0 | commit unique |
| `api-publique` | fait | §6, 7 | importeurs du framework sur `~/modules/audience/actions` et `~/modules/audience/model` | commit unique |
| `temporal`, `droits` | sans objet | | | |

Vérification (2026-11-23), avant → après : `tsc` 790 → 780 (les 10 erreurs d'`audience`, aucune nouvelle, comparé fichier par fichier) ; ESLint des deux dossiers 14 → 0 ; `yarn lint-all` 2153 → 2134 ; Jest 447 → 453 (`model/business.test.ts`, `service/adapter.test.ts`) ; `yarn migration-status --check` vert ; `testID` `cancel-reaction-btn` et `post-reaction-btn` gardés (dans le sélecteur), clés i18n inchangées.

Joué sur le simulateur iPhone 18 Pro avec la barre posée un temps sur l'accueil de test (retirée ensuite) : la barre s'affiche (types chargés), le sélecteur (voir `ui`), la modale « Réactions » s'ouvre avec titre et bouton fermer (écran d'erreur attendu : ressource fictive). Pas joué : réagir pour de vrai, la modale « Vues », Android.
