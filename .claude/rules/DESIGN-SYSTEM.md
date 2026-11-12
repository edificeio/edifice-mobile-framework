---
paths:
  - "src/**/styles.ts"
  - "src/**/screen.tsx"
  - "**/theme.ts"
---

# Design system

S'applique dès qu'on ajoute ou modifie un style.

**Les styles se trouvent uniquement dans un fichier `styles.ts`** placé à côté du composant ou de l'écran. Seule exception : les **styles de navigation** (options de la navbar), qui sont définis dans l'écran lui-même.

Si un fichier sur lequel tu travailles contient un `StyleSheet.create` (hors `styles.ts`), **déplace son contenu dans le `styles.ts` voisin** (à créer si besoin) et importe-le. Exceptions : styles de navigation de l'écran, et styles qui dépendent de props/state/hooks (à signaler plutôt qu'à déplacer). Mentionne ce déplacement dans le plan.

**Aucune valeur de design en dur** (couleur, espacement, rayon, bordure, taille, opacité, durée d'animation). Tout vient de deux fichiers :

| Quoi | Source | Import |
| --- | --- | --- |
| Couleurs | `src/app/theme.ts` | `import theme from '~/app/theme'` |
| Valeurs de design (tailles, espacements, rayons, opacités, animations…) | `src/framework/components/constants.ts` | `import { UI_SIZES, … } from '~/framework/components/constants'` |

## Couleurs — `theme.ts`

- **`theme.palette.*`** : source des couleurs (`primary`, `secondary`, `complementary.<couleur>`, `grey.<nuance>`, `status.info|success|failure|warning`, `flashMessages.*`). Les nuances `IShades` vont de `evil` (la plus foncée) à `pale` : `evil`, `dark`, `regular`, `light`, `pale`.
- **`theme.color.*`** : couleurs sémantiques propres à un module (`mails`, `homework`, `schoolbook`, `profileTypes`), à utiliser dans ces modules.

- **Ne jamais utiliser `theme.ui`** dans le code que tu écris, même si le code existant l'utilise : prends l'équivalent dans `theme.palette`.
- **Ne touche pas aux usages existants de `theme.ui`** dans les fichiers que tu modifies : pas de remplacement, pas de migration.
- Ne pas utiliser `theme.legacy`.
- Les couleurs varient selon l'application (marque blanche) : ne jamais recopier une valeur hex lue dans un override.

## Valeurs de design — `constants.ts`

- **`UI_SIZES.spacing`** : marges et paddings (`tinyExtra` 2, `tiny` 4, `minor` 8, `small` 12, `medium` 16, `big` 24, `large` 32, `major` 48, `huge` 64, valeurs avant mise à l'échelle). Ne pas utiliser les clés `_LEGACY_*`.
- **`UI_SIZES.radius`** : rayons (`small`, `medium`, `card`, `input`, `mediumPlus`, …).
- **`UI_SIZES.border`** / **`UI_SIZES.elements.border`** : épaisseurs de bordure.
- **`UI_SIZES.elements`** : tailles d'éléments (`icon.*`, `avatar.*`, `image.*`, `navbar*`, `tabbarHeight`, …).
- **`UI_SIZES.dimensions`**, **`UI_SIZES.aspectRatios`**, **`UI_SIZES.screen`** : dimensions fixes, ratios, dimensions et insets de l'écran.
- **`UI_STYLES`** : styles utilitaires (`flex1`, `row`, `clickZone`, …) à réutiliser plutôt que de les réécrire.
- **`UI_VALUES.opacity`**, **`UI_ANIMATIONS`** : opacités et durées d'animation.
- **`genericHitSlop`** : hitSlop standard des zones tactiles.
- Une dimension qui n'existe pas dans les constantes doit passer par `getScaleWidth` / `getScaleHeight` / `getScaleImageSize` / `getScaleFontSize`, qui l'adaptent à la taille de l'écran (référence iPhone 8).

## Textes

- Utiliser les composants de `~/framework/components/text` (`HeadingXLText` … `HeadingXXSText`, `BodyText`, `SmallText`, `CaptionText` et leurs variantes Bold/Italic). Pas de `<Text>` stylé à la main.
- Tailles de police via `TextSizeStyle` (`Small` → `Giant`), qui tient compte de la taille de police choisie par l'utilisateur.

## Valeur manquante

Si la valeur nécessaire n'existe ni dans `theme.ts` ni dans `constants.ts`, **demande** avant d'en ajouter une ou de la coder en dur.
