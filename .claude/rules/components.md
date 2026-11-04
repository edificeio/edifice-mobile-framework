---
paths:
  - "src/**/components/**"
---

# Création de composants

S'applique dès qu'un développeur demande de **créer** un composant (partagé ou propre à un module), ou d'en ajouter une déclinaison. Pour les styles, applique aussi la rule **`design-system`**. Pour un état de chargement, utilise le skill **`component-skeleton`**.

Exemples à imiter : `src/framework/modules/communities/components/*` (ex. `discussions/author-line`, `discussions/card`, `community-card-small`) et `src/framework/components/buttons/*` pour les déclinaisons. Ne jamais prendre exemple sur le module `blog`.

## 1. Où créer le composant

- **Composant propre à un module** : `src/framework/modules/<module>/components/<nom-composant>/`.
- **Composant réutilisé par plusieurs modules** : `src/framework/components/<nom-composant>/`.
- Avant de créer, **cherche un composant existant** (dans `src/framework/components`) qui fait déjà le travail ou qu'on peut composer (`text`, `avatar`, `buttons`, `picture`, `segmented-control`, `pill`…). En cas de doute, demande.

## 2. Structure des fichiers

Un dossier `nom-composant` (**kebab-case**, tout en minuscules) contenant :

| Fichier | Contenu |
| --- | --- |
| `component.tsx` | Code du composant (JSX) + implémentation de son API. |
| `styles.ts` | `StyleSheet` statique, **clés triées par ordre alphabétique**, + fonctions qui calculent les styles dynamiques. |
| `types.ts` | Types TypeScript exportés (props, states, enums…), **triés par ordre alphabétique**. |
| `index.ts` | Point d'entrée : exporte le composant (export par défaut **et** export nommé) et ses types publics (uniquement l'API du composant). |

```ts
// index.ts
import NomComposant from './component';
import type { NomComposantProps } from './types';

export { NomComposant };
export type { NomComposantProps };
export default NomComposant;
```

Référence : `src/framework/components/buttons/primary`.

- Les types s'exportent avec `export type` / `import type`.
- N'exporte depuis `index.ts` que ce qui est utile hors du dossier (composant, props, loader éventuel). Pas d'export de `styles` « au cas où ».
- Les consommateurs importent via le dossier (`~/framework/.../nom-composant`), jamais via `.../component`.
- Un composant sans props peut se passer de `types.ts`.

## 3. Déclinaisons d'un même composant

- Créer un **dossier parent** (ex. `avatars`) avec un `index.ts` qui exporte **toutes** les déclinaisons.
- Dans ce dossier parent, **un sous-dossier par déclinaison** (ex. `avatar`, `badge-avatar`, `group-avatar`), chacun avec la structure du §2.
- Une déclinaison réutilise le composant de base plutôt que de dupliquer son code (ex. `PrimaryButton` compose `DefaultButton` et étend `DefaultButtonProps`).
- Sous-composants internes (utilisés uniquement par le parent) : sous-dossier dans le dossier du parent (ex. `community-list-filters/community-list-filter-button`).

## 4. `component.tsx`

- **Functional component** en arrow function, nommé en **PascalCase** identique au nom du dossier (`author-line` → `AuthorLine`).
- Props **déstructurées** dans la signature, typées `Readonly<NomComposantProps>`, avec valeurs par défaut dans la déstructuration :

  ```tsx
  const AuthorLine = ({ bold = true, name, profile, style }: Readonly<AuthorLineProps>) => { … };
  export default React.memo(AuthorLine);
  ```

- `React.memo` pour les composants affichés dans des listes ou re-rendus souvent.
- `React.useMemo` / `React.useCallback` pour les valeurs dérivées et les callbacks passés aux enfants (ex. style calculé à partir d'une prop).
- Helpers purs (calcul d'un état, d'un libellé…) définis **hors du composant**, en haut du fichier ; constantes en `UPPER_SNAKE_CASE`.
- Le composant est **présentationnel** : il reçoit ses données et callbacks (`onPress`, `onChange`…) par props. Pas d'appel réseau, pas de `fetch`, pas d'accès direct au store Redux : c'est le rôle de l'écran.
- Accepter une prop `style?: StyleProp<ViewStyle>` si le parent doit pouvoir ajuster la mise en page, appliquée en dernier : `style={[styles.container, style]}`.
- `testID` sur les éléments interactifs (ex. `testID="community-discussion-card"`).

## 5. Textes et i18n

- Textes via les composants de `~/framework/components/text` (cf. rule `design-system`).
- **Aucun texte en dur** affiché à l'utilisateur : `I18n.get('<cle>')` depuis `~/app/i18n`, avec paramètres si besoin (`I18n.get('communities-members', { count })`).
- Clés en kebab-case préfixées par le module (`communities-discussioncard-newmessage`). Ajoute-les dans `assets/i18n/fr.json` et liste-les dans le compte rendu.
- Pour un singulier/pluriel, suivre le pattern existant (une clé par forme, choisie selon `count`).

## 6. `styles.ts`

- `StyleSheet.create`, clés **triées par ordre alphabétique**, valeurs issues de `theme.ts` / `constants.ts` uniquement (rule `design-system`).
- Constantes de taille calculées en haut du fichier (`getScaleWidth(52)`, `TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale()`).
- Styles dynamiques : **fonction exportée** depuis `styles.ts` qui retourne un style du `StyleSheet` selon un état, plutôt que des objets créés dans le JSX :

  ```ts
  export const getCardStyle = (state: DiscussionCardState) => {
    switch (state) {
      case 'new':
        return styles.cardNew;
      default:
        return styles.cardDefault;
    }
  };
  ```

- Pas de style inline dans le JSX, sauf valeur réellement dépendante d'une prop/runtime (à mémoïser avec `useMemo`).

## 7. Types (`types.ts`)

- Props nommées `<NomComposant>Props`, en `interface`.
- Propriétés triées par ordre alphabétique ; optionnelles marquées `?`.
- Réutiliser les types du modèle existant (`AccountType`, types `@edifice.io/...`) plutôt que d'en redéfinir.
- Enums et unions de valeurs (ex. `'default' | 'hidden' | 'new'`) dans `types.ts`.

## 8. Checklist avant de conclure

- [ ] Dossier en kebab-case, 4 fichiers (`component.tsx`, `styles.ts`, `types.ts`, `index.ts`).
- [ ] `index.ts` exporte le composant (défaut + nommé) et ses types publics.
- [ ] Styles et types triés alphabétiquement, aucune valeur de design en dur.
- [ ] Aucun texte en dur, clés i18n ajoutées et listées.
- [ ] Pas de logique réseau / store dans le composant.
- [ ] `yarn ts-all` et `yarn lint-all` lancés (résultat indiqué dans le compte rendu).
