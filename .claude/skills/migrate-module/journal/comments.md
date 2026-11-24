# Bascule : `comments`

> Statut : basculé (pas joué dans l'app) — mis à jour le 2026-11-25
>
> Fiche courte : la bascule s'est faite pendant le rebase de la branche sur `009dddad9` (`feat/rn86`), pour les réponses aux commentaires de `blog` ([blog.md](blog.md), décision 18). Le patron est dans [BASCULE.md](../BASCULE.md).

## 1. Ce que fait le module

Les commentaires d'une ressource et leurs réponses, arrivés d'upstream (PEDAGO-2200, `87fc0fc57`, refaits par `30bf44ea9`) :

- le template `ResourceWithCommentsTemplate`, que le module de la ressource met sur son écran (la ressource en en-tête de la liste) ;
- la modale `comments/reply` : un commentaire avec toutes ses réponses, pour y répondre. Le template lui passe ses données et ses callbacks par un store zustand (`useCommentsThreadStore`).

Consommateurs : `blog` (billet, basculé) et `wiki` (lecteur, ancien, non chargé). `communities` (discussions, ancien) a ses propres composants, qui reprennent le même calcul de la barre d'onglets.

## 2. Dans la bascule

- **`index.tsx`** : `new CoreModule({ name: 'comments', modals: { 'comments/reply': … } })`. Upstream le déclarait avec l'API intermédiaire (2ᵉ argument `Stack => …`, TS2554) et `setModalModeForRoutes`. Ligne dans `src/app/config/modules.ts` (upstream l'y avait, l'étape 1 du rebase l'avait perdue). `config` (`maxLength`) et l'export du template gardés.
- **`comments/reply`** : `defineModal`, `withSession` de `~/modules/auth/hoc`, params `{ commentId }` en `type` (le type déclaré par upstream, `{ id }`, ne correspondait pas à ce que lisait l'écran).
- **Template** : plus de props `navigation` et `route` ; il prend la navigation par `useNavigation` (`~/app/navigation-new`). L'appel de `wiki` est mis à jour.
- **Barre d'onglets** : `useBottomTabBarHeight` (qui lève hors des onglets) et `isModalModeOnThisRoute` (ancien `hideTabBarAndroid`) remplacés par `useTabBarHeight` (`BottomTabBarHeightContext`, 0 hors des onglets) : les écrans de module sont dans les piles des onglets, les modales à la racine.
- **Défilement vers `focusItem`** (après relecture, 2026-11-25) : `useScrollToIndex` (`hooks.ts`) ; la liste n'a pas de `getItemLayout`, et `scrollToIndex` vers un élément hors de la fenêtre rendue levait une erreur (plantage). `onScrollToIndexFailed` défile près de l'élément puis réessaie, 3 fois au plus. `blog` défile vers le commentaire répondu, qui peut être loin dans le fil.
- **`store.ts`** : importait `./components/comments-thread`, qui n'existe plus depuis `30bf44ea9` ; types repris de `comments-tree` et `comments-thread-internal`.
- **Façades gardées** : `selectors.session` (`~/framework/modules/auth/redux/reducer`), `AccountType` de `~/framework/modules/auth/model`.

## 3. Reste

- Erreurs `tsc` et ESLint : aucune (2026-11-25). Corrigé : `comments-list` supprimé (importé nulle part, ni ici ni chez upstream) ; `ContentDeletedItem` sans props ; ref d'édition en `TextInputInstance` (avec `text2/types.ts`) ; `FontWeightIOS` en `as const` (`text`) ; `unwrapAnimatedProp` (`util/reanimated.ts`) accepte la `SharedValue` en lecture seule des props de Reanimated 4 ; l'en-tête de liste passe par la garde `isListHeaderComponentType` (`isValidElement` ne retire pas l'élément du type dans sa branche fausse).
- `wiki` (`model/index.ts`, `service/index.ts`) importe encore `comments/templates/comments-thread` et `comments/components/comments-thread`, absents depuis upstream : à reprendre avec sa bascule.
- `communities` (`discussions/message-editor-launcher`) appelle `useBottomTabBarHeight` avec `isModalModeOnThisRoute` : même remplacement à sa bascule.
- Pas d'assainissement : à faire avec `/sanitize-module`.

## 4. Vérification

Pas testé dans l'app. Recette avec `blog` ([blog.md](blog.md) §9, « Rebase ») : répondre à un commentaire ouvre `comments/reply` (modale, champ au-dessus du clavier, pas de marge de barre d'onglets), la réponse apparaît au retour. Répondre à un commentaire ancien, loin dans un long fil : la liste y défile, sans plantage.
