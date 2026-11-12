---
name: component-skeleton
description: Crée la version skeleton (loader / placeholder de chargement) d'un composant React Native de l'app Edifice, avec la librairie rn-placeholder, dans un dossier loader/ à côté du composant, en respectant la taille de police choisie par l'utilisateur (TextSizeStyle × PixelRatio.getFontScale()). À utiliser quand on demande un skeleton, un loader ou un « état de chargement » pour un composant ou un écran (« fais le skeleton de X », « ajoute un loader à ce composant »). NE PAS utiliser pour un simple ActivityIndicator/spinner, ni pour l'empty state (EmptyScreen) d'un écran.
---

# Skeleton de composant (rn-placeholder)

Objectif : produire un loader qui a **la même silhouette que le composant réel** une fois chargé, pour éviter un saut de layout à l'arrivée des données, et qui **grandit avec la taille de police système** comme le vrai texte.

## 1. Analyser le composant cible

Lire le `component.tsx` et le `styles.ts` du composant avant d'écrire quoi que ce soit. Relever :
- chaque bloc de texte : quelle taille (`<SmallText>`, `<BodyText>`, `<HeadingSText>`… → clé `TextSizeStyle` correspondante), nombre de lignes, largeur approximative ;
- chaque image / avatar / icône : dimensions (`UI_SIZES.elements.*`, `getScaleWidth(...)`), forme ronde ou non ;
- les boutons / pills : hauteur = texte + padding vertical ;
- le conteneur : padding, gap, flexDirection, marges, bordures — à **réutiliser tel quel** pour que le skeleton occupe la même place.

Si le mapping composant texte → `TextSizeStyle` n'est pas évident, vérifier dans `src/framework/components/text/index.tsx`.

## 2. Structure de fichiers

Toujours un dossier `loader/` à côté du composant :

```
<composant>/
├── component.tsx
├── styles.ts
├── index.ts              ← exporter le loader ici
└── loader/
    ├── component.tsx
    ├── styles.ts
    └── index.ts
```

- Nom du composant : `<NomDuComposant>Loader` (ex. `PostDetailsLoader`, `MemberListItemLoader`).
- `loader/index.ts` : `export default <Nom>Loader;`
- `index.ts` du composant : ajouter un export nommé `<Nom>Loader` à côté de l'export par défaut, pour que les écrans fassent `import Foo, { FooLoader } from '.../foo'`.

## 3. Composant loader

```tsx
import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

const FooLoader = () => (
  <View style={styles.container}>
    <Placeholder Animation={Fade}>
      <View style={styles.header}>
        <PlaceholderMedia isRound style={styles.avatar} />
        <PlaceholderLine noMargin style={styles.title} />
      </View>
      <PlaceholderLine noMargin style={styles.lineLong} />
      <PlaceholderLine noMargin style={styles.lineShort} />
    </Placeholder>
  </View>
);

export default FooLoader;
```

Règles et pourquoi :
- **`<Placeholder Animation={Fade}>`** englobe le contenu : c'est l'animation utilisée partout dans la codebase (cohérence visuelle).
- **`PlaceholderLine` → texte et boutons**, **`PlaceholderMedia` → images, avatars (`isRound`), tuiles**.
- **Toujours `noMargin` sur `PlaceholderLine`** : sinon rn-placeholder ajoute une `marginBottom` égale à la hauteur de la ligne (cf. `node_modules/rn-placeholder/lib/PlaceholderLine.js`), ce qui double l'espace occupé. Les espacements passent par `gap` / `margin` dans `styles.ts`.
- Dimensions **uniquement via `style`** (pas les props `height` / `width` / `size` de rn-placeholder), pour centraliser tous les calculs dans `styles.ts`.
- Si le composant réel reçoit des props de layout (ex. `itemSeparatorStyle`, `style`), le loader les accepte aussi (`Pick<FooProps, ...>`) et les applique au conteneur.
- Functional component, pas de logique, pas de texte affiché → pas de clé i18n.

## 4. Styles — respect de la taille de police utilisateur

C'est le point clé. `TextSizeStyle.X.lineHeight` est mis à l'échelle selon l'écran, **mais pas selon le réglage d'accessibilité « taille du texte »** de l'utilisateur. Le vrai texte, lui, grossit avec ce réglage. Il faut donc multiplier par `PixelRatio.getFontScale()` (≈ 1 par défaut, 1.3+ en gros texte) sinon le skeleton est plus petit que le contenu réel.

```ts
import { PixelRatio, StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const fontScale = PixelRatio.getFontScale();

// texte : une ligne de la taille utilisée dans le composant réel
const TITLE_HEIGHT = TextSizeStyle.Medium.lineHeight * fontScale;
const LINE_HEIGHT = TextSizeStyle.Normal.lineHeight * fontScale;
// bouton / pill : texte + padding vertical du composant réel
const BUTTON_HEIGHT = TextSizeStyle.Normal.lineHeight * fontScale + 2 * UI_SIZES.spacing.tiny;
// bloc mixte (image + texte) : additionner les parties
const CARD_HEIGHT = getScaleWidth(80) + TextSizeStyle.Medium.lineHeight * fontScale + 2 * UI_SIZES.spacing.small;

export default StyleSheet.create({
  avatar: { height: UI_SIZES.elements.avatar.sm, width: UI_SIZES.elements.avatar.sm },
  container: { gap: UI_SIZES.spacing.small, padding: UI_SIZES.spacing.big },
  header: { alignItems: 'center', flexDirection: 'row', gap: UI_SIZES.spacing.small },
  lineLong: { borderRadius: UI_SIZES.radius.small, height: LINE_HEIGHT, width: getScaleWidth(327) },
  lineShort: { borderRadius: UI_SIZES.radius.small, height: LINE_HEIGHT, width: getScaleWidth(162) },
  title: { borderRadius: UI_SIZES.radius.small, height: TITLE_HEIGHT, width: getScaleWidth(232) },
});
```

Règles :
- **Toute hauteur liée à du texte = `TextSizeStyle.<Clé>.lineHeight * PixelRatio.getFontScale()`**, en reprenant la clé du texte réel. Pour un élément qui contient du texte (bouton, pill, carte), additionner la partie texte et les parties fixes (padding, bordures, image).
- **Les éléments non textuels ne sont pas multipliés** (avatars, images, icônes) : ils ne grossissent pas avec la police dans le composant réel.
- Largeurs : `getScaleWidth(<valeur Figma>)` ou pourcentage (`'100%'`, `'48.7%'`) si le réel est fluide. Une ligne de texte « longue » puis une « courte » rend mieux un paragraphe.
- Valeurs de design uniquement depuis `UI_SIZES` (`spacing`, `radius`, `elements`, `border`) et `theme` — jamais de nombres magiques sauf valeur Figma passée à `getScaleWidth`. Commenter un ratio s'il vient de Figma (`// ratio from figma`).
- Clés de `StyleSheet.create` triées par ordre alphabétique (règle ESLint `sort-keys-fix` en `error` dans `eslint.config.js`).
- Si le composant réel a un conteneur avec bordure/fond, reprendre le même style pour que la carte vide soit déjà visible.

## 5. Brancher le loader

Repérer l'écran qui affiche le composant et utiliser le loader pendant le chargement, selon le pattern déjà présent :
- liste paginée : prop `renderPlaceholderItem={FooLoader}` ;
- écran / bloc : rendu conditionnel pendant le fetch (`isLoading ? <FooLoader /> : <Foo ... />`), ou dans le `renderLoading` d'un `ContentLoader` (`src/framework/hooks/loader.tsx`) s'il est utilisé.

Si l'endroit où brancher n'est pas évident, le signaler plutôt que d'inventer un état de chargement.

## 6. Vérifier

- `npx tsc --noEmit` puis `npx eslint --fix <fichiers créés>` (le repo n'a pas de script `lint` ciblé ; `sort-keys-fix` remet les clés de style dans l'ordre).
- Expliquer à l'utilisateur, en bref, quel élément du composant réel correspond à quel placeholder et quelle `TextSizeStyle` a été retenue, pour qu'il puisse vérifier visuellement — idéalement en testant avec une taille de police système agrandie (iOS : Réglages › Accessibilité › Affichage et taille du texte ; Android : Paramètres › Affichage › Taille de police).

## Exemples de référence dans la codebase

- `src/framework/modules/communities/components/announcements/post/details/loader/` — dossier `loader/` complet (avatar, lignes, tuiles média, bouton).
- `src/framework/components/card/action/loader/styles.ts` — constantes de hauteur avec `fontScale`.
- `src/framework/modules/communities/components/community-card-small/styles.ts` — hauteur mixte image + texte.
