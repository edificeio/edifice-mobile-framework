---
paths:
  - "src/**/screens/**"
  - "src/**/navigation/**"
---

# Création d'écrans

S'applique dès qu'un développeur demande de **créer** un écran (ou une page) dans un module. Pour les styles, applique aussi la rule **`DESIGN-SYSTEM`** ; pour les composants créés au passage, la rule **`COMPONENTS`**.

Exemples à imiter : `src/framework/modules/communities/screens/*` (ex. `discussions-list`, `members`, `home`) et `src/framework/modules/communities/navigation/*`. Ne jamais prendre exemple sur le module `blog`.

## 1. Structure des fichiers

Un dossier `src/framework/modules/<module>/screens/<nom-ecran>/` (**kebab-case**, tout en minuscules) contenant :

| Fichier | Contenu |
| --- | --- |
| `screen.tsx` | Code de l'écran + implémentation (chargement des données, actions) + options de navbar. |
| `styles.ts` | `StyleSheet` statique, **clés triées par ordre alphabétique**, + fonctions qui calculent les styles dynamiques. |
| `types.ts` | Types TypeScript (namespace de l'écran, states, enums…), **triés par ordre alphabétique**. |
| `index.ts` | Point d'entrée : exporte l'écran (export par défaut), ses options de navbar et ses types (uniquement l'API de l'écran). |

- Nom de l'écran en **PascalCase**, préfixé par le module : `screens/members` → `CommunitiesMembersScreen`.
- Le nom des fichiers est `styles.ts` / `types.ts` (au pluriel), comme dans tout le repo.
- Sous-composants propres à l'écran : dans `components/` du module (rule `COMPONENTS`), pas dans le dossier de l'écran.

## 2. `types.ts` — namespace de l'écran

Les types de l'écran sont regroupés dans un **namespace** du même nom que l'écran :

```ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesMembersScreen {
  export interface NavParams {
    communityId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'members'>;
  export type AllProps = CommunitiesMembersScreen.NavigationProps;
}
```

- `NavParams` : paramètres de route reçus par l'écran (`{}` / `undefined` si aucun).
- `NavigationProps` : props de react-navigation typées avec la `ParamList` du module.
- `AllProps` : union de toutes les props de l'écran (navigation + autres si besoin).
- Les autres types locaux (states, enums) vont aussi dans ce fichier, triés alphabétiquement.

## 3. `index.ts`

```ts
import CommunitiesMembersScreen from './screen';

export default CommunitiesMembersScreen;
export { computeNavBar } from './screen';
export type { CommunitiesMembersScreen } from './types';
```

- Export par défaut de l'écran + options de navbar (nommées) + namespace de types.
- Pas d'export nommé du composant écran : il porterait le même nom que le namespace de types et entrerait en conflit.

## 4. Navigation (enregistrer l'écran)

Tout nouvel écran doit être déclaré dans `src/framework/modules/<module>/navigation/` :

1. **`navigation/index.ts`** :
   - ajouter la route dans `<module>RouteNames` : `members: \`${moduleConfig.routeName}/members\` as 'members'` ;
   - ajouter les params dans `<Module>NavigationParams` : `members: CommunitiesMembersScreen.NavParams`.
2. **`navigation/navigator.tsx`** : ajouter le `Stack.Screen` dans `createModuleNavigator`, avec `component`, `options` (navbar de l'écran) et `initialParams={{}}`.
3. Écran présenté en modal : le placer dans un `Stack.Group` dédié et l'ajouter à `setModalModeForRoutes` (cf. `joinConfirm`).
4. Pour naviguer : `navigation.navigate(communitiesRouteNames.members, { communityId })`, jamais une chaîne en dur.

## 5. Navbar

- Les options de navbar sont **définies dans `screen.tsx`** (exception à la règle « styles uniquement dans `styles.ts` ») et exportées :

  ```tsx
  export const computeNavBar = ({
    navigation,
    route,
  }: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.members>): NativeStackNavigationOptions => ({
    ...navBarOptions({ navigation, route, title: I18n.get('communities-members-title') }),
  });
  ```

- Navbar standard : `navBarOptions` (`~/framework/navigation/navBar`).
- Navbar spécifique déjà existante dans le module : la réutiliser (ex. `communityNavBar` / `useCommunityScrollableThumbnail` dans `communities/hooks/use-community-navbar`, via `screenOptions` de `~/app/navigation/util`).
- Titre toujours via une clé i18n.

## 6. `screen.tsx`

- Écran wrappé avec **`withSession`** (`~/framework/modules/auth/util`) s'il a besoin de la session : il reçoit `session` en prop. Ne plus utiliser `sessionScreen` (déprécié), même si du code existant l'utilise.

  ```tsx
  export default withSession<CommunitiesDiscussionsScreen.AllProps>(function CommunitiesDiscussionsScreen({
    navigation,
    route: { params: { communityId } },
    session,
  }) { … });
  ```

- La fonction passée au wrapper est **nommée** (facilite le debug et les stack traces).
- Constantes (`PAGE_SIZE`, tailles estimées…) en `UPPER_SNAKE_CASE` et helpers purs **hors du composant**, en haut du fichier.
- Handlers et `renderItem` / `keyExtractor` en `React.useCallback`, valeurs dérivées en `React.useMemo`.
- L'écran orchestre : il charge les données, gère les états et passe données + callbacks aux composants. Le rendu détaillé est délégué aux composants du module.

## 7. Données et appels backend

- **Appels réseau via le `service/` du module** (ex. `getDiscussions(session, communityId, page, PAGE_SIZE)` de `communities/service/discussions`). Pas de `fetch` direct dans un écran. Si le service n'existe pas, le créer dans `service/` (cf. `communities/service/*`).
- Données partagées entre écrans : store Redux du module (`useSelector(<module>Selectors.…)`, `dispatch(<module>Actions.…)`).
- Rechargement au retour sur l'écran : `useFocusEffect` (`@react-navigation/native`).
- Erreurs : `try / catch` autour des appels, avec un message explicite (`console.error('Error while loading …', e)`) et un état d'erreur ou un toast visible par l'utilisateur.
- Avant d'afficher une action ou une fonctionnalité, vérifier les **droits** de l'utilisateur (`rights.ts`, `resourceRights.ts`).

## 8. États de l'écran

Tout écran gère explicitement ses trois états :

| État | Comment |
| --- | --- |
| **Chargement** | Skeleton (`loader` des composants, skill `component-skeleton`) ou `ContentLoader` (`~/framework/hooks/loader`) avec `renderLoading`. Pas de spinner seul si un skeleton est possible. |
| **Vide** | `EmptyScreen` (`~/framework/components/empty-screens`) avec `svgImage`, `title` et `text` en i18n, dans `ListEmptyComponent` pour une liste. |
| **Contenu** | Rendu normal. |

- Listes longues / paginées : `PaginatedFlashList` / `PaginatedFlatList` (`~/framework/components/list/paginated-list`) avec `staleOrSplice`, `LOADING_ITEM_DATA`, `renderPlaceholderItem` et `onPageReached` (cf. `communities/screens/members`).

## 9. i18n

- Aucun texte en dur : `I18n.get('<cle>')` (`~/app/i18n`), clés kebab-case préfixées par le module (`communities-members-list-empty-title`).
- Ajouter les clés dans `assets/i18n/fr.json` et les lister dans le compte rendu.

## 10. Checklist avant de conclure

- [ ] Dossier en kebab-case avec `screen.tsx`, `styles.ts`, `types.ts`, `index.ts`.
- [ ] Namespace de types (`NavParams`, `NavigationProps`, `AllProps`) dans `types.ts`.
- [ ] Route ajoutée dans `navigation/index.ts` (route name + params) et `Stack.Screen` dans `navigator.tsx`.
- [ ] Navbar définie et exportée depuis `screen.tsx`, titre en i18n.
- [ ] Appels réseau via `service/`, erreurs gérées, droits vérifiés.
- [ ] États chargement / vide / contenu gérés.
- [ ] Styles triés, aucune valeur de design ni texte en dur.
- [ ] `yarn ts-all` et `yarn lint-all` lancés (résultat indiqué dans le compte rendu).
- [ ] Scénario de test sur simulateur décrit (écran à atteindre, actions, résultat attendu).
