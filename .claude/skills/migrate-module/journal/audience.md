# Bascule : `audience`

> Statut : à faire — mis à jour le 2026-11-23
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

Validé le 2026-11-23 (questions 1 et 2, §6) :

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

Fichiers touchés hors des deux dossiers : `src/framework/navigation/modals/index.ts`, `src/framework/navigation/modals/navigator.tsx` (2, sous la limite de 3).

## 5. Hors de la bascule

### Backlog

| # | Point | Sujet |
| --- | --- | --- |
| 1 | `connect(` dans la barre, le bouton et l'écran `reactions`, seulement pour lire les types de réactions : `usePlatformReactionTypes(platform)` existe déjà dans `src/modules/audience/store.ts` | `connect` |
| 2 | **Régression possible du passage d'`auth` à zustand** : les types de réactions sont dans un store zustand, mais lus par un `mapStateToProps` Redux. La barre ne se rafraîchit que si le state Redux change : si les types arrivent après son affichage sans autre action Redux, le squelette reste. À vérifier dans l'app avec le premier consommateur ; corrigé par le n° 1 | `connect` (à valider) |
| 3 | `Audience` est un **composant d'interface qui navigue et appelle le service** (réagir, rafraîchir, ouvrir les modales) : contraire à CONVENTIONS « Trois types de composants » et à `COMPONENTS.md` (pas de réseau dans un composant). Actions dans `actions.ts`, navigation par des props d'événement ou en template | `structure` |
| 4 | Structure de `src/modules/audience` après le déplacement : `model/` (types du domaine), `service/` avec `types.ts` / `adapter.ts` et `getModuleTransport('audience')`, barre dans `components/audience/` ; importeurs à passer aux nouveaux chemins pour supprimer les façades | `structure` |
| 5 | `computeAudienceRefererFromResourceUri` connaît `blog` (règle d'un autre module en dur) : le consommateur devrait donner le `referer` | `structure` |
| 6 | Bouton : `Modal` de `react-native` pour le choix de réaction → `transparentModal` | `ui` (à valider : animation positionnée sur le bouton) |
| 7 | Bouton : hooks appelés dans un `reduce` sur les types de réactions (`rules-of-hooks` désactivé) : si le nombre de types change pendant que le bouton est affiché, React plante | `dette` (bug) |
| 8 | Bouton : fragments sans `key` dans le `map` des réactions (la `key` est sur l'enfant) : avertissement React, rendu instable | `dette` (bug) |
| 9 | Bouton : `longPressTimeout` typé `null`, `let component = useRef(null)` : 5 erreurs `tsc` | `erreurs` |
| 10 | `service.view.post` : `try/catch` autour d'une promesse non attendue, le `catch` ne voit jamais l'erreur (rejet non traité) ; paramètre `session` inutilisé dans `reaction.delete` / `post` / `update` | `dette` (bug) |
| 11 | Écran `reactions` : `countByType` lu une seule fois (pas rafraîchi), `countByType!`, paramètres de `renderTabReaction` non typés, `throw new Error()` qui perd l'erreur, condition de pagination fragile (`userReactions.length >= (page - 1) * 20`) | `dette` |
| 12 | Écran `reactions` : `BadgeAvatar` reçoit `badgeContent.type: 'Svg'`, absent du type (`'Icon' \| 'Image'`) : le badge de réaction s'affiche-t-il ? À vérifier dans l'app | `erreurs` (bug possible) |
| 13 | Écran `views` : `renderItem` exige `color` mais deux appels ne le donnent pas (2 TS2345) ; `name` des `Svg` typés `string` (TS2322, aussi dans la barre et le bouton) ; journal `[BlogAudienceScreen]` dans l'écran des vues | `erreurs`, `dette` |
| 14 | `PageView` (`@deprecated`) dans les deux écrans | `dette` |
| 15 | Styles en ligne (`paddingBottom` du pied de liste, `left` / `opacity` du bouton, `{}` conditionnels) | `styles` |
| 16 | `useCallback` / `useMemo` manquants (fonctions passées aux listes et à `TabView`) | `performance` |
| 17 | 26 erreurs ESLint dans le dossier (ordre des imports, variables inutilisées, `sort-keys`) | `erreurs` |
| 18 | Ligne commentée `require('~/framework/modules/audience').default` dans `src/app/modules.ts` | `dette` (nettoyage final) |

### Noté, non traité

- Le store des types de réactions est en zustand (`src/modules/audience/store.ts`), fait avec `auth` : `audience` n'avait pas de state avant. Gardé (pas de passage de gestionnaire d'état).
- `markViewAudience` est utilisé par des composants du framework (carrousel, lecteur, pièces jointes) : API publique du module, à garder à l'assainissement.

## 6. Décisions

1. **Tout le code passe dans `src/modules/audience`** (2026-11-23, développeur), avec des façades `@deprecated` aux anciens chemins : un seul dossier pour le module, comme le veut CONVENTIONS « Emplacement ».
2. **Les routes `Audience*` sont retirées de l'ancien registre des modales globales** (2026-11-23, développeur) : seule l'ancienne navigation le monte, et seule la barre d'`audience` y navigue.
3. Décidé seul (à relire) : `useAudience` dans `hooks.ts`, `markViewAudience` et `computeAudienceRefererFromResourceUri` dans `actions.ts` ; `components/` et `screens/` gardent leur arborescence.

### Questions ouvertes

Aucune.

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` (comparé fichier par fichier) | 792 au total ; 11 dans `audience` (bouton 5, barre 2, `reactions` 1, `views` 3 : §5) | |
| ESLint sur les deux dossiers | 26 erreurs | |
| `yarn lint-all` | 2166 problèmes | |
| Jest | 447 / 447 | |
| Compteurs de [SUIVI.md](SUIVI.md) | `framework/modules/audience` : navigation ancienne 5, `connect(` 3 | |
| Flows Maestro ou recette manuelle | aucun flow | |
| Parcours joué dans l'app (iOS, Android) | — | |

Ce qui ne peut pas encore être joué dans l'app, et le module qu'il attend : §3, 2 à 7, le premier consommateur basculé (`news` ou `blog`).

## 8. Mesure

Temps passé : à remplir. Questions posées par l'agent : 2 (emplacement : réponse « tout déplacer », contre la recommandation ; ancien registre des modales).

## 9. Assainissement

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
